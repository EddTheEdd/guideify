import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
    try {
        const userId = _request.nextUrl.pathname.split('/').pop();

        // Fetch the salary structure along with history and deductions
        const salaryResult = await pool.query(`
            SELECT 
                salary_structures.*,
                salary_history.*,
                salary_deductibles.deductible_id
            FROM salary_structures
            LEFT JOIN salary_history ON salary_structures.salary_id = salary_history.salary_id
            LEFT JOIN salary_deductibles ON salary_structures.salary_id = salary_deductibles.salary_id
            WHERE salary_structures.user_id = $1
        `, [userId]);

        if (salaryResult.rows.length === 0) {
            return NextResponse.json({ error: 'Salary not found.' }, { status: 404 });
        }

        const allDeductiblesOfSalary = await pool.query(`
            SELECT * FROM salary_deductibles LEFT JOIN deductibles ON salary_deductibles.deductible_id = deductibles.deductible_id WHERE salary_id = $1
        `, [salaryResult.rows[0].salary_id]);

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