import pool from "@/dbConfig/pgConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    let { salary_id } = reqBody;
    const { base_salary, bonus, allowance, user_id, deductibles } = reqBody;

    // Checks for existance of entry:
    const checkSalaryQuery = await pool.query(
      `SELECT * FROM salary_structures WHERE user_id = $1`,
      [user_id]
    );

    if (checkSalaryQuery.rows.length > 0) {
      const updateQuery =
        "UPDATE salary_structures SET base_salary = $1, bonus = $2, allowance = $3 WHERE user_id = $4 RETURNING *";
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
    } else {
      const insertQuery =
        "INSERT INTO salary_structures (base_salary, bonus, allowance, user_id) VALUES ($1, $2, $3, $4) RETURNING *";
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

      // const insertSalaryHistoryQuery = "INSERT INTO salary_history (salary_id, user_id) VALUES ($1, $2) RETURNING *";
    }

    // Deductibles:
    if (deductibles.length === 0) {
      const deleteDeductibleQuery =
        "DELETE FROM salary_deductibles WHERE salary_id = $1";
      await pool.query(deleteDeductibleQuery, [salary_id]);
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
    const userId = _request.nextUrl.pathname.split("/").pop();

    // Fetch the salary structure along with history and deductions
    const salaryResult = await pool.query(
      `
            SELECT 
                salary_structures.*,
                salary_history.*,
                salary_deductibles.deductible_id,
                users.first_name,
                users.last_name,
                users.email
            FROM salary_structures
            LEFT JOIN salary_history ON salary_structures.salary_id = salary_history.salary_id
            LEFT JOIN salary_deductibles ON salary_structures.salary_id = salary_deductibles.salary_id
            LEFT JOIN users ON users.id = salary_structures.user_id
            WHERE salary_structures.user_id = $1
        `,
      [userId]
    );

    if (salaryResult.rows.length === 0) {
      return NextResponse.json({ error: "Salary not found." }, { status: 404 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
