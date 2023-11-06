import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const reqBody = await request.json();
    const { answers } = reqBody;
    console.log("Answers: ", Object.entries(answers));

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

