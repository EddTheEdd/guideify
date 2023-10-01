import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const courseId = request.nextUrl.pathname.split('/').pop();  // Extract the last part of the URL as course ID

    if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    try {
        const result = await pool.query(`
            SELECT * FROM course_units WHERE course_id = $1
        `, [courseId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
        }

        const units = result.rows;

        return NextResponse.json({
            success: true,
            units: units
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
