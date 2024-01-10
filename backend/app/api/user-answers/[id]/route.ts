import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get user answers
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const questId = request.nextUrl.pathname.split("/").pop();

    const result = await pool.query(`
      SELECT user_answers.*, questions.quest_id, questions.question_id FROM questions INNER JOIN user_answers
      ON questions.question_id = user_answers.question_id
      WHERE questions.quest_id = $1 AND user_answers.user_id = $2
    `, [questId, userId])

      if(result.rows.length === 0) {
          return NextResponse.json({ error: "Answers not found." }, { status: 404 });
      }

      return NextResponse.json({
          success: true,
          answers: result.rows
      });

    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 }
    );
  }
}
