import pool from "@/dbConfig/pgConfig"; 
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {

        const userId = getDataFromToken(request);

        const canEditCourses = await checkUserPermissions(userId, 'Edit Courses');
        if (!canEditCourses) {
            return NextResponse.json(
                { error: "You do not have permission to edit courses. Permission required: Edit Courses" },
                { status: 403 }
            );
        }

        const reqBody = await request.json();
        const { id, name, description, color } = reqBody;

        if (!id) {
            throw new Error('Course ID is required');
        }

        const updateQuery = `
            UPDATE courses 
            SET name = $1, description = $2, rgb_value = $3 
            WHERE course_id = $4 
            RETURNING *;
        `;

        const updatedCourse = await pool.query(updateQuery, [
            name,
            description,
            color,
            id,
        ]);

        if (updatedCourse.rows.length === 0) {
            throw new Error('Course not found or not updated');
        }

        console.log(updatedCourse.rows[0]);

        return NextResponse.json({
            message: "Course updated successfully",
            success: true,
            response: updatedCourse.rows[0],
        });  

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function GET(request: NextRequest) {

    const userId = getDataFromToken(request);

    const canSeeAllCourses = await checkUserPermissions(userId, 'See All Courses');

    const courseId = request.nextUrl.pathname.split('/').pop();  // Extract the last part of the URL as course ID

    if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    try {
        let query;
        if (canSeeAllCourses) {
            query = pool.query(`
                SELECT * FROM courses WHERE course_id = $1
            `, [courseId]);
        } else {
            query = pool.query(`
            SELECT * FROM courses 
            INNER JOIN roles_courses ON roles_courses.course_id = courses.course_id
                INNER JOIN roles ON roles_courses.role_id = roles.id
                INNER JOIN user_roles ON roles.id = user_roles.role_id
                WHERE user_roles.user_id = $1 AND courses.course_id = $2
            `, [userId, courseId]);
        }

        const result = await query;

        if (result.rows.length === 0) {
            if (!canSeeAllCourses) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
        }

        const course = result.rows[0];

        return NextResponse.json({
            success: true,
            course: {
                ...course,
                units: parseInt(course.units, 10), // Ensure that units is a number
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
