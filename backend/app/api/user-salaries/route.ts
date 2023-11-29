import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const data: any = await knex('users')
    .leftJoin('salary_structures', 'users.id', '=', 'salary_structures.user_id')
    .leftJoin('positions', 'users.position_id', '=', 'positions.position_id')
    .leftJoin('departments', 'users.department_id', '=', 'departments.department_id')
    .select('users.*', 'salary_structures.*', 'positions.*', 'departments.*');
    
    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        users: []
      });
    }

    return NextResponse.json({
      success: true,
      users: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 }
    );
  }
}
