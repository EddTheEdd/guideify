import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query("SELECT * FROM permissions");
        return NextResponse.json({
            success: true,
            permissions: result.rows,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
