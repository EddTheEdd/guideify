import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get all users with their salaries
 * @param req 
 * @returns 
 */
export async function GET(req: NextRequest) {
  try {

    // Get userId
    const userId = getDataFromToken(req);

    // Validate access
    const hasPermission = await checkUserPermissions(userId, 'View Salaries');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to edit user salaries. Permission required: View Salaries" },
        { status: 403 }
      );
    }

    // Get params from the url
    const page = parseInt(req.nextUrl.searchParams.get("page") || '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || '10', 10);
    const offset = (page - 1) * limit;
    const sortColumn = req.nextUrl.searchParams.get("sortColumn") || 'users.user_id';
    const sortOrder = req.nextUrl.searchParams.get("sortOrder") === 'desc' ? 'desc' : 'asc';

    const nameFilter = req.nextUrl.searchParams.get("first_name");
    const surnameFilter = req.nextUrl.searchParams.get("last_name");
    const departmentFilter = req.nextUrl.searchParams.get("department_name");
    const positionFilter = req.nextUrl.searchParams.get("position_title");
    
    // Build the query
    let query = knex('users')
    .leftJoin('salary_structures', 'users.user_id', '=', 'salary_structures.user_id')
    .leftJoin('positions', 'users.position_id', '=', 'positions.position_id')
    .leftJoin('departments', 'users.department_id', '=', 'departments.department_id')
    .select('users.*', 'salary_structures.*', 'positions.*', 'departments.*');

    let totalUsersQuery = knex('users')
    .leftJoin('salary_structures', 'users.user_id', '=', 'salary_structures.user_id')
    .leftJoin('positions', 'users.position_id', '=', 'positions.position_id')
    .leftJoin('departments', 'users.department_id', '=', 'departments.department_id')
    .countDistinct('users.user_id as total');


    // Add filters conditonally
    if (nameFilter) {
      query = query.where('first_name', 'ilike', `%${nameFilter}%`);
      totalUsersQuery = totalUsersQuery.where('first_name', 'ilike', `%${nameFilter}%`);
    }
    if (surnameFilter) {
      query = query.where('last_name', 'ilike', `%${surnameFilter}%`);
      totalUsersQuery = totalUsersQuery.where('last_name', 'ilike', `%${surnameFilter}%`);
    }
    if (departmentFilter) {
      query = query.where('department_name', 'ilike', `%${departmentFilter}%`);
      totalUsersQuery = totalUsersQuery.where('department_name', 'ilike', `%${departmentFilter}%`);
    }
    if (positionFilter) {
      query = query.where('position_title', 'ilike', `%${positionFilter}%`);
      totalUsersQuery = totalUsersQuery.where('position_title', 'ilike', `%${positionFilter}%`);
    }

    totalUsersQuery.where((builder) => 
      builder.where('salary_structures.signed', true)
      .orWhereNull('salary_structures.signed')
    );
  
    const totalUsersResult = await totalUsersQuery.first();
    const totalUsersCount = totalUsersResult ? totalUsersResult.total : 0;

    // if the user_id matches get the entry with the latest created_at
    const data = await query.where((builder) => 
    builder.where('salary_structures.signed', true)
    .orWhereNull('salary_structures.signed')
    ).orderBy(sortColumn, sortOrder).limit(limit).offset(offset);

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        totalUsers: 0
      });
    }

    return NextResponse.json({
      success: true,
      users: data,
      totalUsers: totalUsersCount
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 }
    );
  }
}
