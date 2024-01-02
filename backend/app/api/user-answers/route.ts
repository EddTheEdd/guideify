import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const reqBody = await request.json();
    const { answers, unitId } = reqBody;
    console.log("Answers: ", Object.entries(answers));

    let completeQuizAfterSubmit = true;
    for (const [questionId, answer] of Object.entries(answers)) {
      const checkAnswerQuery = await pool.query(
        `SELECT * FROM questions WHERE question_id = $1`,
        [questionId]
      );

      if (checkAnswerQuery.rows.length === 0) {
        return NextResponse.json(
          { error: "Question not found." },
          { status: 404 }
        );
      }

      const originalQuestion = checkAnswerQuery.rows[0];
      console.log(originalQuestion);
      if (originalQuestion.requires_review === true) {
        completeQuizAfterSubmit = false;
      }
      let answerIsCorrect = false;
      if (
        originalQuestion.type === "text" &&
        originalQuestion.correct_answer === answer
      ) {
        answerIsCorrect = true;
      }

      if (
        originalQuestion.type === "multi_choice" &&
        originalQuestion.checked_answers === JSON.stringify(answer)
      ) {
        console.log(originalQuestion);
        answerIsCorrect = true;
      }

      const insertQuery =
        "INSERT INTO user_answers (user_id, question_id, answer, is_correct) VALUES ($1, $2, $3, $4) RETURNING *";
      let answerString;
      if (Array.isArray(answer)) {
        answerString = JSON.stringify(answer);
      }
      const newAnswer = await pool.query(insertQuery, [
        userId,
        questionId,
        answerString || answer,
        answerIsCorrect,
      ]);
      console.log(newAnswer);
    }

    if (completeQuizAfterSubmit) {
      const completeQuiz = await pool.query(
        `
        UPDATE user_unit_progress SET completed = true WHERE user_id = $1 AND unit_id = $2 RETURNING *`,
        [userId, unitId]
      );

      if (completeQuiz.rowCount === 0) {
        return NextResponse.json(
          { error: "Could not complete quiz." },
          { status: 500 }
        );
      }
    } else {
      const completeQuiz = await pool.query(
        `
        UPDATE user_unit_progress SET submitted = true WHERE user_id = $1 AND unit_id = $2 RETURNING *`,
        [userId, unitId]
      );

      if (completeQuiz.rowCount === 0) {
        return NextResponse.json(
          { error: "Could not complete quiz." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Answers submitted successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 }
    );
  }
}
