import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || '10', 10);
    const offset = (page - 1) * limit;
    const sortColumn = req.nextUrl.searchParams.get("sortColumn") || 'id';
    const sortOrder = req.nextUrl.searchParams.get("sortOrder") === 'desc' ? 'desc' : 'asc';

    const nameFilter = req.nextUrl.searchParams.get("first_name");
    const surnameFilter = req.nextUrl.searchParams.get("last_name");
    const departmentFilter = req.nextUrl.searchParams.get("department_name");
    const positionFilter = req.nextUrl.searchParams.get("position_title");
    
    let query = knex('users')
    .leftJoin('salary_structures', 'users.id', '=', 'salary_structures.user_id')
    .leftJoin('positions', 'users.position_id', '=', 'positions.position_id')
    .leftJoin('departments', 'users.department_id', '=', 'departments.department_id')
    .select('users.*', 'salary_structures.*', 'positions.*', 'departments.*');

    if (nameFilter) {
      query = query.where('first_name', 'ilike', `%${nameFilter}%`);
    }
    if (surnameFilter) {
      query = query.where('last_name', 'ilike', `%${surnameFilter}%`);
    }
    if (departmentFilter) {
      query = query.where('department_name', 'ilike', `%${departmentFilter}%`);
    }
    if (positionFilter) {
      query = query.where('position_title', 'ilike', `%${positionFilter}%`);
    }

    const data = await query.orderBy(sortColumn, sortOrder).limit(limit).offset(offset);

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
