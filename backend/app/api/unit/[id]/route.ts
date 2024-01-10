import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import { checkUserPermissions } from "@/utils/permissions";

/**
 * Get unit data form passed unit
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {

  // Validate the requester
  const userId = getDataFromToken(request);

  if (!userId) {
    return NextResponse.json(
      { error: "You must be logged in to view a unit." },
      { status: 403 }
    );
  }

  // Get the unit id
  const unitId = request.nextUrl.pathname.split("/").pop();

  if (!unitId) {
    return NextResponse.json(
      { error: "Unit ID is required." },
      { status: 400 }
    );
  }

  // check if user can see all courses:
  const canSeeAllCourses = await checkUserPermissions(userId, 'See All Courses');

  if (!canSeeAllCourses) {
    // check if this unit belongs to the users roles:
    const checkUnitResponse = await knex("units")
      .leftJoin("courses", "units.course_id", "courses.course_id")
      .leftJoin("roles_courses", "courses.course_id", "roles_courses.course_id")
      .leftJoin("roles", "roles_courses.role_id", "roles.role_id")
      .leftJoin("user_roles", "roles.role_id", "user_roles.role_id")
      .where("user_roles.user_id", userId)
      .andWhere("units.unit_id", unitId)
      .countDistinct("user_roles.user_id as count");

    if (checkUnitResponse[0].count === "0") {
      return NextResponse.json(
        { error: "You do not have permission to view this unnit." },
        { status: 403 }
      );
    }
  }

  

  try {
    const result = await pool.query(
      `
              SELECT * FROM units WHERE unit_id = $1
          `,
      [unitId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Unit not found." }, { status: 404 });
    }

    const unit = result.rows[0];

    const progressResult = await pool.query(
      `
        SELECT * FROM user_unit_progress WHERE unit_id = $1 AND user_id = $2
        `,
      [unitId, userId]
    );

    let wasInserted = false;
    if (progressResult.rows.length === 0) {
      const insertProgressResult = await pool.query(
        `
                    INSERT INTO user_unit_progress (user_id, unit_id) VALUES ($1, $2)
                    ON CONFLICT (user_id, unit_id) DO NOTHING
                    RETURNING *;
                `,
        [userId, unitId]
      );
      const progress = {
        completed: false,
      };
      unit.progress = progress;
    } else {
      unit.progress = progressResult.rows[0];
    }

    let hasAnsweredThisQuiz = false;
    if (unit.content_type === "quest") {
      // check if there is atleast one user answer as a flag for the user having done the quest
      const atleastOneAnswer = await pool.query(
        `
          SELECT a.*, q.* FROM user_answers as a LEFT JOIN questions as q ON a.question_id = q.question_id WHERE user_id = $1 AND quest_id = $2
        `,
        [userId, unit.quest_id]
      );

      if (atleastOneAnswer.rows.length > 0) {
        hasAnsweredThisQuiz = true;
      }

      const questResult = await pool.query(
        `
          SELECT q.*, qs.*, a.*
          FROM questionnaires q 
          INNER JOIN questions qs ON q.quest_id = qs.quest_id
          LEFT JOIN user_answers a ON qs.question_id = a.question_id AND a.user_id = $2
          WHERE q.quest_id = $1
          ORDER BY qs.order ASC
      `,
        [unit.quest_id, userId]
      );

      if (!hasAnsweredThisQuiz) {
        questResult.rows.forEach((question: any) => {
          delete question.checked_answers;
          delete question.correct_answer;
        });
      }

      unit.questionnaire = questResult.rows;
    }

    return NextResponse.json({
      success: true,
      unit,
      wasInserted,
      hasDoneQuest: hasAnsweredThisQuiz,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
