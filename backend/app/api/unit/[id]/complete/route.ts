import pool from "@/dbConfig/pgConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const userId = getDataFromToken(request);

  const pathParts = request.nextUrl.pathname.split("/");
  const unitId = pathParts[pathParts.length - 2];
  if (!unitId) {
    return NextResponse.json(
      { error: "Unit ID is required." },
      { status: 400 }
    );
  }

  const markAsCompleteResposne = pool.query(
    `
     UPDATE user_unit_progress SET completed = true WHERE unit_id = $1 AND user_id = $2 RETURNING *;`,
    [unitId, userId]
  );

  const markAsComplete = await markAsCompleteResposne;

  if (markAsComplete.rowCount === 0) {
    return NextResponse.json({ error: "Unit not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Unit marked as complete",
  });
}
