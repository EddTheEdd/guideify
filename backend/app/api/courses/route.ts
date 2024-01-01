import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the POST request to create a new course.
 * 
 * This asynchronous function takes a Next.js request object, extracts the 'name' and 'description' 
 * from the request body, and attempts to insert a new course into the database.
 * If successful, it returns a JSON response with the details of the newly created course.
 * In case of any errors during the process, it catches them and returns a JSON response with the error message.
 *
 * @param {NextRequest} request - The Next.js request object containing the payload.
 * @returns {NextResponse} A NextResponse object containing the operation result.
 * If successful, the response includes a success message and the details of the created course.
 * On failure, it returns an error message with a 500 status code.
 * 
 * @example
 * // POST request body: { name: "New Course", description: "This is a new course" }
 * POST(request).then(response => {
 *   console.log(response); // Logs the response from the server
 * });
 */
export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { name, description, role_ids, color } = reqBody;

    // Handle unique checks:

    const checkNameQuery = knex("courses")
      .select("*")
      .where("name", name)
      .first();
    const checkNameResult = await checkNameQuery;
    if (checkNameResult) {
      return NextResponse.json(
        { frontendErrorMessage: "Course name already exists." },
        { status: 400 }
      );
    }

    // Handle course creation:

    const insertQuery =
      "INSERT INTO courses (name, description, rgb_value) VALUES ($1, $2, $3) RETURNING *";
    const insertedCourse = await pool.query(insertQuery, [name, description, color]);
    const courseId = insertedCourse.rows[0].course_id;
    console.log(insertedCourse.rows[0]);

    // Handle connection with roles:

    // 1. Delete all existing connections that arent in our role_id list:
    const deleteQuery = knex("roles_courses")
      .whereNotIn("role_id", role_ids)
      .andWhere("course_id", courseId)
      .del();
    await deleteQuery;

    // 2. Insert all new connections that arent already in the database:
    const insertRolesQuery = knex("roles_courses").insert(
      role_ids.map((role_id: number) => ({
        role_id,
        course_id: courseId,
      }))
    ).returning("*");
    await insertRolesQuery;


    return NextResponse.json({
      message: "Course created successfully",
      success: true,
      response: insertedCourse.rows[0],
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
          "units",
          "courses.course_id",
          "units.course_id"
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

      query = query.orderBy(sortColumn, sortOrder).limit(limit).offset(offset).groupBy("courses.course_id").count("units.unit_id as units");
    } else {
      query = knex
        .select("courses.*", "courses.course_id as id")
        .from("courses")
        .count("units.unit_id as units")
        .leftJoin("units", "courses.course_id", "units.course_id")
        .innerJoin(
          "roles_courses",
          "roles_courses.course_id",
          "courses.course_id"
        )
        .innerJoin("roles", "roles_courses.role_id", "roles.role_id")
        .innerJoin("user_roles", "roles.role_id", "user_roles.role_id")
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
