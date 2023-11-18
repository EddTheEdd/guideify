import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log(req.nextUrl.searchParams);

    if (req.nextUrl.searchParams.get("view") === "users") {
      const page = parseInt(req.nextUrl.searchParams.get("page") || '1', 10);
      const limit = parseInt(req.nextUrl.searchParams.get("limit") || '5', 10);
      const offset = (page - 1) * limit;

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

      const users = await query.orderBy('id').limit(limit).offset(offset);

      if (users.length === 0) {
        return NextResponse.json({
          success: true,
          users: []
        });
      }

      const userIds = users.map((user) => user.id);

      for (const user of users) {
        const userCourses = await knex('user_course_progress')
                                   .select(
                                     'courses.course_id as course_id',
                                     'courses.name as course_name',
                                     'user_course_progress.completed',
                                     'user_course_progress.assigned',
                                     'user_course_progress.submitted',
                                     'course_units.title as unit_title',
                                     'course_units.content_type as unit_content_type',
                                     'user_course_progress.progress_id as progress_id'
                                   )
                                   .innerJoin('course_units', 'user_course_progress.unit_id', 'course_units.unit_id')
                                   .innerJoin('courses', 'courses.course_id', 'course_units.course_id')
                                   .where('user_course_progress.user_id', userIds);

        user.courses = userCourses;
      }

      return NextResponse.json({
        success: true,
        currentPage: page,
        totalUsers: users.length,
        users: users,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
