import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { name, description } = reqBody;

    const insertQuery =
      "INSERT INTO courses (name, description) VALUES ($1, $2) RETURNING *";
    const newUser = await pool.query(insertQuery, [name, description]);

    console.log(newUser.rows[0]);

    return NextResponse.json({
      message: "Course created successfully",
      success: true,
      response: newUser.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const userId = getDataFromToken(_request);

    const canSeeAllCourses = await checkUserPermissions(
      userId,
      "See All Courses"
    );

    const page = parseInt(_request.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(
      _request.nextUrl.searchParams.get("limit") || "10",
      10
    );
    const offset = (page - 1) * limit;
    const sortColumn =
      _request.nextUrl.searchParams.get("sortColumn") || "courses.course_id";

    const sortOrder = _request.nextUrl.searchParams.get("sortOrder")
      ? _request.nextUrl.searchParams.get("sortOrder") === "desc"
        ? "desc"
        : "asc"
      : "desc";

    const nameFilter = _request.nextUrl.searchParams.get("name");
    const descriptionFilter = _request.nextUrl.searchParams.get("description");

    let query;
    if (canSeeAllCourses) {
        console.log("CAN SEE ALL");
      query = knex
        .select("courses.*", "courses.course_id as id")
        .from("courses")
        .leftJoin(
          "course_units",
          "courses.course_id",
          "course_units.course_id"
        );

      if (nameFilter) {
        query = query.where("courses.name", "ilike", `%${nameFilter}%`);
      }
      if (descriptionFilter) {
        query = query.where(
          "courses.description",
          "ilike",
          `%${descriptionFilter}%`
        );
      }

      query = query.orderBy(sortColumn, sortOrder).limit(limit).offset(offset).groupBy("courses.course_id").count("course_units.unit_id as units");
    } else {
      query = knex
        .select("courses.*", "courses.course_id as id")
        .from("courses")
        .count("course_units.unit_id as units")
        .leftJoin("course_units", "courses.course_id", "course_units.course_id")
        .innerJoin(
          "roles_courses",
          "roles_courses.course_id",
          "courses.course_id"
        )
        .innerJoin("roles", "roles_courses.role_id", "roles.id")
        .innerJoin("user_roles", "roles.id", "user_roles.role_id")
        .where("user_roles.user_id", userId);

      if (nameFilter) {
        query = query.where("courses.name", "ilike", `%${nameFilter}%`);
      }
      if (descriptionFilter) {
        query = query.where(
          "courses.description",
          "ilike",
          `%${descriptionFilter}%`
        );
      }

      query.orderBy(sortColumn, sortOrder).limit(limit).offset(offset);
    }

    const result: any = await query;
    console.log("RESSSULT");
    console.log(result);
    // count courses:
    const countQuery = knex("courses").count("* as total").first();
    const coursesCount = await countQuery;

    return NextResponse.json({
      success: true,
      courses: result.map((row: any) => ({
        ...row,
        units: parseInt(row.units, 10), // Ensure that units is a number
      })),
      coursesCount: coursesCount ? coursesCount.total : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
