import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";
import { checkUserPermissions } from "@/utils/permissions";
import { getDataFromToken } from "@/helpers/getDataFromToken";

/**
 * Agree to a salary
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const userId = getDataFromToken(request);

    const { salary_id } = reqBody;

    const removeAgreedQuery = knex("salary_structures")
      .update({ agreed: false })
      .where({ agreed: true, user_id: userId })
      .returning("*");
    const responseRemoveAgreedQuery = await removeAgreedQuery;

    const updateSalaryQuery = knex("salary_structures")
      .update({ agreed: true })
      .where({ salary_id, user_id: userId })
      .returning("*");
    const responseUpdateSalaryQuery = await updateSalaryQuery;

    if (responseUpdateSalaryQuery.length === 0) {
      return NextResponse.json({ error: "Salary not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Salary agreed to successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

