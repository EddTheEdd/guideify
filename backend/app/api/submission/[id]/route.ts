import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const submissionId = request.nextUrl.pathname.split("/").pop();

  const submissionResponse = await pool.query(
    `SELECT * FROM user_unit_progress WHERE progress_id = $1`,
    [submissionId]
  );

  if (submissionResponse.rows.length === 0) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  const unitId = submissionResponse.rows[0].unit_id;
  const userId = submissionResponse.rows[0].user_id;

  if (!unitId) {
    return NextResponse.json(
      { error: "Unit ID is required." },
      { status: 400 }
    );
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
