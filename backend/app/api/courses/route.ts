import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        
        const reqBody = await request.json();
        const {name, description} = reqBody;


        const insertQuery = "INSERT INTO courses (name, description) VALUES ($1, $2) RETURNING *";
        const newUser = await pool.query(insertQuery, [
            name,
            description,
        ]);

        console.log(newUser.rows[0]);

        return NextResponse.json({
            message: "Course created successfully",
            success: true,
            response: newUser.rows[0],
        });  

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query(`
            SELECT courses.*, courses.course_id as id, COUNT(course_units.unit_id) as units
            FROM courses 
            LEFT JOIN course_units ON courses.course_id = course_units.course_id 
            GROUP BY courses.course_id
        `);

        return NextResponse.json({
            success: true,
            courses: result.rows.map(row => ({
                ...row,
                units: parseInt(row.units, 10), // Ensure that units is a number
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

