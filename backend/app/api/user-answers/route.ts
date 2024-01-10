import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import { checkUserPermissions } from "@/utils/permissions";

/**
 * Add user answer
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    // Get values from body
    const reqBody = await request.json();
    const { answers, unitId } = reqBody;
    console.log("Answers: ", Object.entries(answers));

    const canSeeAllCourses = await checkUserPermissions(userId, 'See All Courses');

    // Validation check
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
          { error: "You do not have permission to submit this quiz." },
          { status: 403 }
        );
      }
    }

    let completeQuizAfterSubmit = true; // Will the quiz be done after this submission
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
        completeQuizAfterSubmit = false; // if at least one question requires review, the quiz is not done
      }
      let answerIsCorrect = false; // Will be set to true if the answer is correct

      // Check if the answer is correct
      if (
        originalQuestion.type === "text" &&
        originalQuestion.correct_answer === answer
      ) {
        answerIsCorrect = true; // If the answer is correct, set this to true
      }

      // If the question is a multi choice question, compare json strings
      if (
        originalQuestion.type === "multi_choice" &&
        originalQuestion.checked_answers === JSON.stringify(answer)
      ) {
        console.log(originalQuestion);
        answerIsCorrect = true;
      }

      // Insert the answer
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

    if (completeQuizAfterSubmit) { // If the quiz is done, set completed to true
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
      // If the quiz is not done, set submitted to true
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

    // Return response
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
