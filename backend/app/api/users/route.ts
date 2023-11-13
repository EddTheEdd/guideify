import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query(`SELECT * FROM users 
        LEFT JOIN positions ON users.position_id = positions.position_id 
        LEFT JOIN departments ON users.department_id = departments.department_id`);
        return NextResponse.json({
            success: true,
            users: result.rows,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
