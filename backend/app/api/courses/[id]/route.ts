import pool from "@/dbConfig/pgConfig"; 
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {

        const userId = getDataFromToken(request);

        const courseId = request.nextUrl.pathname.split('/').pop();

        // Permission check:

        const canEditCourses = await checkUserPermissions(userId, 'Edit Courses');
        if (!canEditCourses) {
            return NextResponse.json(
                { error: "You do not have permission to edit courses. Permission required: Edit Courses" },
                { status: 403 }
            );
        }

        const reqBody = await request.json();
        const { name, description, color, role_ids } = reqBody;

        // Handle updating course:

        if (!courseId) {
            throw new Error('Course ID is required');
        }

        const updateResult = await knex('courses').update({
            name,
            description,
            rgb_value: color
        }).where('course_id', courseId).returning('*');

        if (updateResult.length === 0) {
            throw new Error('Course not found or not updated');
        }

        // Handle updating its roles:

        // 1. Delete all existing connections that arent in our role_id list:
        const deleteQuery = knex("roles_courses")
        .whereNotIn("role_id", role_ids)
        .andWhere("course_id", courseId)
        .del();
        await deleteQuery;

        // 2. Get all role ids that arent in the database
        const existingRoleIdsQuery = knex("roles_courses")
        .select("role_id")
        .where("course_id", courseId);
        const existingRoleIdsResult = await existingRoleIdsQuery;
        const existingRoleIds = existingRoleIdsResult.map((role: any) => role.role_id);
        const int_role_ids = role_ids.map((roleId: string) => parseInt(roleId));
        const roleIdsToInsert = int_role_ids.filter((roleId: number) => !existingRoleIds.includes(roleId));

        // 3. Insert new roles_courses connections but only if they arent already in the database:
        if (roleIdsToInsert.length > 0) {
            const insertRolesQuery = knex("roles_courses").insert(
                roleIdsToInsert.map((role_id: number) => ({
                role_id,
                course_id: courseId,
            }))
            ).returning("*");
            await insertRolesQuery;
        }        

        return NextResponse.json({
            message: "Course updated successfully",
            success: true,
            response: updateResult,
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
            query = knex
                .select('courses.*', 'roles.*', 'courses.name as name', 'courses.description as description', 'roles.name as role_name')
                .from('courses')
                .leftJoin(
                    'roles_courses',
                    'courses.course_id',
                    'roles_courses.course_id'
                )
                .leftJoin(
                    'roles',
                    'roles_courses.role_id',
                    'roles.role_id'
                )
                .where('courses.course_id', courseId)
                .orderBy('roles.role_id', 'asc');
        } else {
            query = knex.select('courses.*').from('courses')
            .innerJoin('roles_courses', 'courses.course_id', 'roles_courses.course_id')
            .innerJoin('roles', 'roles_courses.role_id', 'roles.role_id')
            .innerJoin('user_roles', 'roles.role_id', 'user_roles.role_id')
            .where('user_roles.user_id', userId)
            .andWhere('courses.course_id', courseId);
        }

        const result: any = await query;

        const doesCourseHaveAnyFilledUnits = await knex('user_unit_progress')
        .innerJoin('units', 'user_unit_progress.unit_id', 'units.unit_id')
        .innerJoin('courses', 'units.course_id', 'courses.course_id')
        .where('courses.course_id', result[0].course_id)
        .count('user_unit_progress.progress_id as count');

        const courseIsDeletable = doesCourseHaveAnyFilledUnits[0].count === '0';

        const course = {
            course_id: result[0].course_id,
            name: result[0].name,
            description: result[0].description,
            rgb_value: result[0].rgb_value,
            roleIds: result.map((role: any) => role?.role_id?.toString()),
            canBeDeleted: courseIsDeletable
        }

        console.log("RESULTS COURSE: ", result);
        if (result.length === 0) {
            return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            course
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const userId = getDataFromToken(request);

    const hasPermission = await checkUserPermissions(userId, 'Edit Courses');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const courseId = request.nextUrl.pathname.split('/').pop();

    if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    const doesCourseHaveAnyFilledUnits = await knex('user_unit_progress')
    .innerJoin('units', 'user_unit_progress.unit_id', 'units.unit_id')
    .innerJoin('courses', 'units.course_id', 'courses.course_id')
    .where('courses.course_id', courseId)
    .count('user_unit_progress.progress_id as count');

    if(doesCourseHaveAnyFilledUnits[0].count !== '0') {
        return NextResponse.json({ error: 'Course cannot be deleted because it has units with filled progress.' }, { status: 400 });
    }

    try {
        const result = await knex('courses').where('course_id', courseId).del();

        if (result === 0) {
            return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}