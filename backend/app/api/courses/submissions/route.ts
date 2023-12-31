import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {

    const userId = getDataFromToken(req);

    const hasPermission = await checkUserPermissions(userId, 'View Course Progress');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit user salaries. Permission required: View Course Progress" },
        { status: 403 }
      );
    }

    console.log(req.nextUrl.searchParams);

    if (req.nextUrl.searchParams.get("view") === "users") {
      const page = parseInt(req.nextUrl.searchParams.get("page") || '1', 10);
      const limit = parseInt(req.nextUrl.searchParams.get("limit") || '10', 10);
      const offset = (page - 1) * limit;
      const sortColumn = req.nextUrl.searchParams.get("sortColumn") || 'users.user_id';
      const sortOrder = req.nextUrl.searchParams.get("sortOrder") === 'desc' ? 'desc' : 'asc';

      const nameFilter = req.nextUrl.searchParams.get("first_name");
      const surnameFilter = req.nextUrl.searchParams.get("last_name");
      const emailFilter = req.nextUrl.searchParams.get("email");
      const phoneFilter = req.nextUrl.searchParams.get("phone_number");

      let query = knex('users').select('*');

      if (nameFilter) {
        query = query.where('first_name', 'ilike', `%${nameFilter}%`);
      }
      if (surnameFilter) {
        query = query.where('last_name', 'ilike', `%${surnameFilter}%`);
      }
      if (emailFilter) {
        query = query.where('email', 'ilike', `%${emailFilter}%`);
      }
      if (phoneFilter) {
        query = query.where('phone_number', 'ilike', `%${phoneFilter}%`);
      }

      const users = await query.orderBy(sortColumn, sortOrder).limit(limit).offset(offset);

      if (users.length === 0) {
        return NextResponse.json({
          success: true,
          users: []
        });
      }

      const userIds = users.map((user) => user.user_id);

      for (const user of users) {
        console.log(user);
        const userCourses = await knex('user_unit_progress')
                                   .select(
                                     'courses.course_id as course_id',
                                     'courses.name as course_name',
                                     'user_unit_progress.completed',
                                     'user_unit_progress.assigned',
                                     'user_unit_progress.submitted',
                                     'units.title as unit_title',
                                     'units.content_type as unit_content_type',
                                     'user_unit_progress.progress_id as progress_id'
                                   )
                                   .innerJoin('units', 'user_unit_progress.unit_id', 'units.unit_id')
                                   .innerJoin('courses', 'courses.course_id', 'units.course_id')
                                   .where('user_unit_progress.user_id', user.user_id);

        user.courses = userCourses;
      }

      const totalUsersCount = await knex('users').count('* as total').first();
      const totalUsers = totalUsersCount ? totalUsersCount.total : 0;

      return NextResponse.json({
        success: true,
        currentPage: page,
        totalUsers: totalUsers,
        users: users,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
