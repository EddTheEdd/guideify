import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const submissionId = request.nextUrl.pathname.split('/').pop();  // Extract the last part of the URL as course ID

    const reqBody = await request.json();
    const { review, unitId } = reqBody;

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

    const userId = submissionResponse.rows[0].user_id;

    // loop through object of question.id: boolean correct or not:
    for (const [questionId, isCorrect] of Object.entries(review)) {
        const updateUserAnswer = await pool.query(
          `UPDATE user_answers SET is_reviewed = true, is_correct = $1 WHERE question_id = $2 AND user_id = $3 RETURNING *`,
          [isCorrect, questionId, userId]
        );

        if (updateUserAnswer.rows.length === 0) {
          return NextResponse.json(
            { error: "Could not update user answer." },
            { status: 500 }
          );
        }
    }

    const completeQuiz = await pool.query(
      `UPDATE user_unit_progress SET completed = true WHERE progress_id = $1`,
      [submissionId]
    );

    if (completeQuiz.rowCount === 0) {
      return NextResponse.json(
        { error: "Could not complete quiz." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Answers reviewed successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 }
    );
  }
}
