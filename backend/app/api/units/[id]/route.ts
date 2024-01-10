import pool from "@/dbConfig/pgConfig"; 
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";
/**
 * Get units from passed course id
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {

    // Validate the request
    const userId = getDataFromToken(request)

    if (!userId) {
        return NextResponse.json({ error: 'You must be logged in to view units.' }, { status: 403 });
    }

    // Check for permissions
    const canRequestOtherIds = await checkUserPermissions(userId, 'View Course Progress');
    const courseId = request.nextUrl.pathname.split('/').pop();

    if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    const differentUserId = request.nextUrl.searchParams.get("user_id");

    if (!canRequestOtherIds && differentUserId && differentUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const result = await pool.query(`
            SELECT * FROM units WHERE course_id = $1 ORDER BY units.order ASC
        `, [courseId]);

        const units = result.rows;

        for (let unit of units) {
            // get data if someone has interacted with the course:
            const interactedResult = await pool.query(`
                SELECT * FROM user_unit_progress WHERE unit_id = $1`, [unit.unit_id]);
            unit.interacted = interactedResult.rows.length > 0;

            // get questionnaire data:
            if (unit.content_type === 'quest') {
                const questResult = await pool.query(`
                    SELECT q.*, qs.* 
                    FROM questionnaires q 
                    INNER JOIN questions qs ON q.quest_id = qs.quest_id
                    WHERE q.quest_id = $1
                `, [unit.quest_id]);

                unit.questionnaire = questResult.rows;
            }

            const progressResult = await pool.query(`
                SELECT * FROM user_unit_progress WHERE unit_id = $1 AND user_id = $2`, [unit.unit_id, differentUserId ? differentUserId : userId]);
            unit.progress = progressResult.rows[0];
        }

        return NextResponse.json({
            success: true,
            units: units
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Delete a unit
 * @param request 
 * @returns 
 */
export async function DELETE(request: NextRequest) {

    // Validate the request
    const userId = getDataFromToken(request);

    if (!userId) {
        return NextResponse.json({ error: 'You must be logged in to delete a unit.' }, { status: 403 });
    }

    // Check for permissions
    const hasPermission = await checkUserPermissions(userId, 'Edit Courses');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const unitId = request.nextUrl.pathname.split('/').pop();

    if (!unitId) {
        return NextResponse.json({ error: 'Unit ID is required.' }, { status: 400 });
    }

    // delete entries from units table
    try {
        const result = await pool.query(`
            DELETE FROM units WHERE unit_id = $1
        `, [unitId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Unit not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Unit deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}