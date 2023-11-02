import pool from "@/dbConfig/pgConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const {
      courseId,
      question,
      title,
      type,
      content,
      videoUrl,
      order,
      unitId,
      questTitle,
      quest,
      description
    } = reqBody;
    console.log({ courseId, title, type, content, videoUrl, order });
    let result;
    let query;
    let message;
    let values;
    let questId: any;
    console.log(quest);
    console.log(questTitle);
    if (quest.length > 0) {
      query = `INSERT INTO questionnaires (title) VALUES ($1) RETURNING *`;
      values = [questTitle];

      result = await pool.query(query, values);

      console.log(result.rows[0]);

      questId = result.rows[0].quest_id;
      console.log(questId);
      if (questId) {
        const promises = quest.map((question: any) => {
          query = `INSERT INTO questions (quest_id, question_text, type, correct_answer, requires_review, "order", answers, checked_answers)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
          values = [
            questId,
            question.question_text,
            question.type,
            question.correct_answer,
            question.requires_review,
            question.order,
            JSON.stringify(question.answers),
            JSON.stringify(question.checked_answers),
          ];
          console.log(values);
    
          return pool.query(query, values);
        });
        console.log(promises);
        const results = await Promise.all(promises);
    
        results.forEach(result => {
          console.log(result.rows[0]);
        });
      }
    }

    if (unitId) {
      console.log("UPDATING UNIT");
      // Update the existing unit
      query = `
                UPDATE course_units 
                SET course_id = $1, title = $2, content_type = $3, content = $4, "order" = $5, "quest_id" = $6, description = $7
                WHERE unit_id = $8
                RETURNING *;
            `;
      values = [courseId, title, type, content, order, questId || null, description, unitId];
      message = "Unit updated successfully";
    } else {
      console.log("SAVING UNIT");
      // Insert a new unit
      query = `
                INSERT INTO course_units (course_id, title, content_type, content, "order", quest_id, description) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *;
            `;
      values = [courseId, title, type, content, order, questId || null, description];
      message = "Unit added successfully";
    }

    result = await pool.query(query, values);

    console.log(result.rows[0]);

    return NextResponse.json({
      message: message,
      success: true,
      response: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
