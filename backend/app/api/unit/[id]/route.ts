import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = getDataFromToken(request);

  const unitId = request.nextUrl.pathname.split("/").pop();

  if (!unitId) {
    return NextResponse.json(
      { error: "Unit ID is required." },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `
              SELECT * FROM course_units WHERE unit_id = $1
          `,
      [unitId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Unit not found." }, { status: 404 });
    }

    const unit = result.rows[0];

    const progressResult = await pool.query(
      `
        SELECT * FROM user_course_progress WHERE unit_id = $1 AND user_id = $2
        `,
      [unitId, userId]
    );

    let wasInserted = false;
    if (progressResult.rows.length === 0) {
      const insertProgressResult = await pool.query(
        `
                    INSERT INTO user_course_progress (user_id, unit_id) VALUES ($1, $2)
                    ON CONFLICT (user_id, unit_id) DO NOTHING
                    RETURNING *;
                `,
        [userId, unitId]
      );
      const progress = {
        completed: false
      }
      unit.progress = progress;
    } else {
      unit.progress = progressResult.rows[0];
    }

    return NextResponse.json({
      success: true,
      unit,
      wasInserted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
