import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Request the user submission
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
  // Get the user id from the token
  const tokenUserId = getDataFromToken(request);

  if (!tokenUserId) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  // Validation check
  const canViewUserUnitProgress = await checkUserPermissions(tokenUserId, "View Course Progress");

  // Get the submission id
  const submissionId = request.nextUrl.pathname.split("/").pop();

  const submissionResponse = await pool.query(
    `SELECT * FROM user_unit_progress WHERE progress_id = $1`,
    [submissionId]
  );

  // Check if submission exists
  if (submissionResponse.rows.length === 0) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  // What state is the submission in?
  const submissionCompleted = submissionResponse.rows[0].completed;
  const submissionSubmitted = submissionResponse.rows[0].submitted;

  // Forbidden if cant view
  if (!canViewUserUnitProgress) {
    return NextResponse.json(
      { frontendErrorMessage: "Forbidden." },
      { status: 403 }
    );
  }

  // If the submission is not completed or submitted, the user is still answering the test
  if (!submissionCompleted && !submissionSubmitted) {
    return NextResponse.json(
      { frontendErrorMessage: "The user is still answering this test, you will be able to review it once it has been submitted." },
      { status: 400 }
    );
  }

  // Get the unit id
  const unitId = submissionResponse.rows[0].unit_id;
  const userId = submissionResponse.rows[0].user_id;

  // Unit is required
  if (!unitId) {
    return NextResponse.json(
      { error: "Unit ID is required." },
      { status: 400 }
    );
  }

  try {
    // Get the unit
    const result = await pool.query(
      `
              SELECT * FROM units WHERE unit_id = $1
          `,
      [unitId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Unit not found." }, { status: 404 });
    }

    const unit = result.rows[0]; // This is our unit

    // Get the progress
    const progressResult = await pool.query(
      `
        SELECT * FROM user_unit_progress WHERE unit_id = $1 AND user_id = $2
        `,
      [unitId, userId]
    );

    let wasInserted = false; // Was the submission inserted?
    if (progressResult.rows.length === 0) { // if there is no progress, insert it
      const insertProgressResult = await pool.query(
        `
                    INSERT INTO user_unit_progress (user_id, unit_id) VALUES ($1, $2)
                    ON CONFLICT (user_id, unit_id) DO NOTHING
                    RETURNING *;
                `,
        [userId, unitId]
      );
      const progress = { // Set the progress
        completed: false,
      };
      unit.progress = progress;
    } else {
      unit.progress = progressResult.rows[0];
    }

    let hasAnsweredThisQuiz = false; // Has the user answered this quiz?
    if (unit.content_type === "quest") {
      // check if there is atleast one user answer as a flag for the user having done the quest
      const atleastOneAnswer = await pool.query(
        `
          SELECT a.*, q.* FROM user_answers as a LEFT JOIN questions as q ON a.question_id = q.question_id WHERE user_id = $1 AND quest_id = $2
        `,
        [userId, unit.quest_id]
      );

      if (atleastOneAnswer.rows.length > 0) {
        hasAnsweredThisQuiz = true; // The user has answered this quiz
      }

      // Get the questionnaire but without the answers
      const questResult = await pool.query(
        `
          SELECT q.*, qs.*, a.*
          FROM questionnaires q 
          INNER JOIN questions qs ON q.quest_id = qs.quest_id
          LEFT JOIN user_answers a ON qs.question_id = a.question_id AND a.user_id = $2
          WHERE q.quest_id = $1
      `,
        [unit.quest_id, userId]
      );

      if (!hasAnsweredThisQuiz) { // If hasnt answered this quiz we remove the answers because we will send the submission to the user
        questResult.rows.forEach((question: any) => {
          delete question.checked_answers;
          delete question.correct_answer;
        });
      }

      unit.questionnaire = questResult.rows; // This is the questionnaire
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
