import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const {courseId, title, type, content, videoUrl, order, unitId} = reqBody;
        console.log({courseId, title, type, content, videoUrl, order});

        let query;
        let values;
        let message;

        if(unitId) {
            // Update the existing unit
            query = `
                UPDATE course_units 
                SET course_id = $1, title = $2, content_type = $3, content = $4, "order" = $5 
                WHERE unit_id = $6
                RETURNING *;
            `;
            values = [courseId, title, type, content, order, unitId];
            message = "Unit updated successfully";
        } else {
            // Insert a new unit
            query = `
                INSERT INTO course_units (course_id, title, content_type, content, "order") 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *;
            `;
            values = [courseId, title, type, content, order];
            message = "Unit added successfully";
        }

        const result = await pool.query(query, values);

        console.log(result.rows[0]);

        return NextResponse.json({
            message: message,
            success: true,
            response: result.rows[0],
        });  

    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}
