import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const unitId = request.nextUrl.pathname.split('/').pop();  // Extract the last part of the URL as course ID

    if (!unitId) {
        return NextResponse.json({ error: 'Unit ID is required.' }, { status: 400 });
    }

    try {
        const result = await pool.query(`
            SELECT * FROM course_units WHERE unit_id = $1
        `, [unitId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Unit not found.' }, { status: 404 });
        }

        const unit = result.rows[0];

        return NextResponse.json({
            success: true,
            unit
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}