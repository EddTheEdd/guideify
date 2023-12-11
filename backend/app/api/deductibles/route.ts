import pool from "@/dbConfig/pgConfig"; 
import knex from "knex";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query(`SELECT * FROM deductibles`);

        const deductibles = result.rows
        const updatedDeductubkes = await Promise.all(deductibles.map(async (ded) => {
            const salary_deductibles = await pool.query(`SELECT * FROM salary_deductibles WHERE deductible_id = $1`, [ded.deductible_id]);

            ded.canBeTampered = salary_deductibles.rows.length === 0;
            return ded;
          }));
        return NextResponse.json({
            success: true,
            deductibles: updatedDeductubkes,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
