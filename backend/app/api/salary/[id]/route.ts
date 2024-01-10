import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";
import { checkUserPermissions } from "@/utils/permissions";
import { getDataFromToken } from "@/helpers/getDataFromToken";

/**
 * Offer salary
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    // Validate the requester
    const userId = getDataFromToken(request);

    // Extract from the body
    const { base_salary, bonus, allowance, user_id, deductibles } =
      reqBody;

    // Validate the values:
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (base_salary === null) {
      return NextResponse.json(
        { frontendErrorMessage: "Base salary is required." },
        { status: 400 }
      );
    }

    if (base_salary < 0 || base_salary > 100000) {
      return NextResponse.json(
        { frontendErrorMessage: "Base salary cannot be out of range (0-100000)" },
        { status: 400 }
      );
    }

    if (bonus < 0 || bonus > 100000) {
      return NextResponse.json(
        { frontendErrorMessage: "Bonus cannot be out of range (0-100000)" },
        { status: 400 }
      );
    }

    if (allowance < 0 || allowance > 100000) {
      return NextResponse.json(
        { frontendErrorMessage: "Allowance cannot be out of range (0-100000)" },
        { status: 400 }
      );
    }

    // Check for permission
    const hasPermission = await checkUserPermissions(userId, 'Edit Salaries');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit user salaries. Permission required: Edit Salaries" },
        { status: 403 }
      );
    }

    let { salary_id } = reqBody;

    // Checks for existance of entry:
    const checkSalaryQuery = await pool.query(
      `SELECT * FROM salary_structures WHERE user_id = $1 AND signed = true`,
      [user_id]
    );

    // check if salary is agreed to, if so, create a new signed salary_structure, else update the existing one:

    if (checkSalaryQuery.rows.length > 0) {
      if (checkSalaryQuery.rows[0].agreed) {
        // make previous salary signed = false
        // make new salary signed = true
        const updateQuery =
          "UPDATE salary_structures SET signed = false WHERE user_id = $1 RETURNING *";

        const updateResposne = await pool.query(updateQuery, [user_id]);

        if (updateResposne.rows.length === 0) {
          return NextResponse.json(
            { error: "Salary not found." },
            { status: 404 }
          );
        }

        const insertQuery =
          "INSERT INTO salary_structures (base_salary, bonus, allowance, user_id, agreed, signed) VALUES ($1, $2, $3, $4, false, true) RETURNING *";

        const insertedSalaryResult = await pool.query(insertQuery, [
          base_salary,
          bonus,
          allowance,
          user_id,
        ]);

        if (insertedSalaryResult.rows.length === 0) {
          return NextResponse.json(
            { error: "Salary insertion failed." },
            { status: 404 }
          );
        }

        salary_id = insertedSalaryResult.rows[0].salary_id;
      } else {
        // update the existing salary:
        const updateQuery =
          "UPDATE salary_structures SET base_salary = $1, bonus = $2, allowance = $3, agreed = false WHERE user_id = $4 AND signed = true RETURNING *";
        const updatedSalaryResult = await pool.query(updateQuery, [
          base_salary,
          bonus,
          allowance,
          user_id,
        ]);

        if (updatedSalaryResult.rows.length === 0) {
          return NextResponse.json(
            { error: "Salary not found." },
            { status: 404 }
          );
        }
        salary_id = updatedSalaryResult.rows[0].salary_id;
      }
    } else {
      const insertQuery =
        "INSERT INTO salary_structures (base_salary, bonus, allowance, user_id, agreed, signed) VALUES ($1, $2, $3, $4, false, true) RETURNING *";
      const insertedSalaryResult = await pool.query(insertQuery, [
        base_salary,
        bonus,
        allowance,
        user_id,
      ]);

      if (insertedSalaryResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Salary insertion failed." },
          { status: 404 }
        );
      }

      salary_id = insertedSalaryResult.rows[0].salary_id;
    }

    // Remove all deductibles
    const deleteDeductibleQuery =
      "DELETE FROM salary_deductibles WHERE salary_id = $1";
    await pool.query(deleteDeductibleQuery, [salary_id]);

    for (const deductible of deductibles) {
      const insertDeductibleQuery =
        "INSERT INTO salary_deductibles (salary_id, deductible_id) VALUES ($1, $2) RETURNING *";
      const insertedDeductibleResult = await pool.query(insertDeductibleQuery, [
        salary_id,
        deductible?.deductible_id,
      ]);

      if (insertedDeductibleResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Deductible insertion failed." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      message: "Salary updated successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const tokenUserId = getDataFromToken(_request);

    const userId = _request.nextUrl.pathname.split("/").pop();

    const getall = _request.nextUrl.searchParams.get("getall");

    if (tokenUserId != userId) {
      const hasPermission = await checkUserPermissions(tokenUserId, 'View Salaries');
      if (!hasPermission) {
        return NextResponse.json(
          { error: "Forbidden! You do not have permission to view salaries. Permission required: View Salaries." },
          { status: 403 }
        );
      }
    }
    
    if (getall) {
      const page = parseInt(_request.nextUrl.searchParams.get("page") || '1', 10);
      const limit = parseInt(_request.nextUrl.searchParams.get("limit") || '10', 10);
      const offset = (page - 1) * limit;
      const sortColumn = _request.nextUrl.searchParams.get("sortColumn") || 'updated_at';
      const sortOrder = _request.nextUrl.searchParams.get("sortOrder") ? _request.nextUrl.searchParams.get("sortOrder") === 'desc' ? 'desc' : 'asc' : 'desc';
      // get by created_at latest
      // Fetch the salary structure along with history and deduction

      const salaryResultKnex = await knex("salary_structures")
        .select(
          "salary_structures.*",
          "users.first_name",
          "users.last_name",
          "users.email"
        )
        .leftJoin("users", "users.user_id", "salary_structures.user_id")
        .where("users.user_id", userId)
        .orderBy(sortColumn, sortOrder).limit(limit).offset(offset);

      if (salaryResultKnex.length === 0) {
        return NextResponse.json(
          { error: "Salary not found." },
          { status: 404 }
        );
      }

      // Fetch deductibles for each salary
      const salariesWithDeductibles = await Promise.all(
        salaryResultKnex.map(async (salary) => {
          const deductibles = await knex("salary_deductibles")
            .select("deductibles.*")
            .leftJoin(
              "deductibles",
              "deductibles.deductible_id",
              "salary_deductibles.deductible_id"
            )
            .where("salary_deductibles.salary_id", salary.salary_id);

          return {
            ...salary,
            deductibles,
          };
        })
      );

      const totalSalariesCount = await knex('salary_structures').where("user_id", userId).count('* as total').first();
      const totalSalaries = totalSalariesCount ? totalSalariesCount.total : 0;

      return NextResponse.json({
        success: true,
        salary: salariesWithDeductibles,
        totalSalaries
      });
    } else {
      // get by created_at latest
      // Fetch the salary structure along with history and deductions
      const salaryResult = await pool.query(
        `
              SELECT 
                  salary_structures.*,
                  salary_deductibles.deductible_id,
                  users.first_name,
                  users.last_name,
                  users.email
              FROM salary_structures
              LEFT JOIN salary_deductibles ON salary_structures.salary_id = salary_deductibles.salary_id
              LEFT JOIN users ON users.user_id = salary_structures.user_id
              WHERE salary_structures.created_at = (SELECT MAX(created_at) FROM salary_structures WHERE salary_structures.user_id = $1)
          `,
        [userId]
      );

      if (salaryResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Salary not found." },
          { status: 404 }
        );
      }

      const allDeductiblesOfSalary = await pool.query(
        `
              SELECT * FROM salary_deductibles LEFT JOIN deductibles ON salary_deductibles.deductible_id = deductibles.deductible_id WHERE salary_id = $1
          `,
        [salaryResult.rows[0].salary_id]
      );

      // add the deductibles to the salary:
      salaryResult.rows[0].deductibles = allDeductiblesOfSalary.rows;

      return NextResponse.json({
        success: true,
        salary: salaryResult.rows[0],
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
