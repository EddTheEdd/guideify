import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";
import { checkUserPermissions } from "@/utils/permissions";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const userId = getDataFromToken(request);

    const { salary_id } = reqBody;

    const removeAgreedQuery = knex("salary_structures")
      .update({ agreed: false })
      .where({ agreed: true, user_id: userId })
      .returning("*");
    const responseRemoveAgreedQuery = await removeAgreedQuery;

    const updateSalaryQuery = knex("salary_structures")
      .update({ agreed: true })
      .where({ salary_id, user_id: userId })
      .returning("*");
    const responseUpdateSalaryQuery = await updateSalaryQuery;

    if (responseUpdateSalaryQuery.length === 0) {
      return NextResponse.json({ error: "Salary not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Salary agreed to successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const userId = _request.nextUrl.pathname.split("/").pop();

    const getall = _request.nextUrl.searchParams.get("getall");
    console.log(getall);
    if (getall) {
      const page = parseInt(
        _request.nextUrl.searchParams.get("page") || "1",
        10
      );
      const limit = parseInt(
        _request.nextUrl.searchParams.get("limit") || "10",
        10
      );
      const offset = (page - 1) * limit;
      const sortColumn =
        _request.nextUrl.searchParams.get("sortColumn") || "updated_at";
      const sortOrder = _request.nextUrl.searchParams.get("sortOrder")
        ? _request.nextUrl.searchParams.get("sortOrder") === "desc"
          ? "desc"
          : "asc"
        : "desc";
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
        .orderBy(sortColumn, sortOrder)
        .limit(limit)
        .offset(offset);

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

      const totalSalariesCount = await knex("salary_structures")
        .where("user_id", userId)
        .count("* as total")
        .first();
      const totalSalaries = totalSalariesCount ? totalSalariesCount.total : 0;

      return NextResponse.json({
        success: true,
        salary: salariesWithDeductibles,
        totalSalaries,
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
              WHERE salary_structures.created_at = (SELECT MAX(created_at) FROM salary_structures WHERE users.user_id = $1)
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
