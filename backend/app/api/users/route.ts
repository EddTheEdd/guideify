import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function GET(_request: NextRequest) {
  try {
    const page = parseInt(_request.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(
      _request.nextUrl.searchParams.get("limit") || "10",
      10
    );
    const offset = (page - 1) * limit;

    const sortColumn =
      _request.nextUrl.searchParams.get("sortColumn") || "users.user_id";

    const sortOrder = _request.nextUrl.searchParams.get("sortOrder")
      ? _request.nextUrl.searchParams.get("sortOrder") === "desc"
        ? "desc"
        : "asc"
      : "desc";

    const usernameFilter = _request.nextUrl.searchParams.get("username");
    const emailFilter = _request.nextUrl.searchParams.get("email");
    const firstNameFilter = _request.nextUrl.searchParams.get("first_name");
    const lastNameFilter = _request.nextUrl.searchParams.get("last_name");
    const updatedAtFilter = _request.nextUrl.searchParams.get("updated_at");
    const createdAtFilter = _request.nextUrl.searchParams.get("created_at");

    let knexQuery = knex
      .select("*")
      .from("users")
      .leftJoin("positions", "users.position_id", "positions.position_id")
      .leftJoin(
        "departments",
        "users.department_id",
        "departments.department_id"
      );

    if (usernameFilter) {
      knexQuery.where("username", "like", `%${usernameFilter}%`);
    }

    if (emailFilter) {
      knexQuery.where("email", "like", `%${emailFilter}%`);
    }

    if (firstNameFilter) {
      knexQuery.where("first_name", "like", `%${firstNameFilter}%`);
    }

    if (lastNameFilter) {
      knexQuery.where("last_name", "like", `%${lastNameFilter}%`);
    }

    if (updatedAtFilter) {
      knexQuery.where("updated_at", "like", `%${updatedAtFilter}%`);
    }

    if (createdAtFilter) {
      knexQuery.where("created_at", "like", `%${createdAtFilter}%`);
    }

    // Clone the base query for counting
    const totalQuery = knexQuery.clone().clearSelect().count('* as total');
    const totalResult = await totalQuery;
    const totalUsers = totalResult[0].total;

    knexQuery = knexQuery
      .orderBy(sortColumn, sortOrder)
      .limit(limit)
      .offset(offset);

    const result: any = await knexQuery;
    console.log("USERS:");
    console.log(result);
    // remove password
    result.forEach((user: any) => {
      delete user.password;
    });


    // Create a response
    const response = NextResponse.json({
      success: true,
      users: result,
      totalUsers,
    });

    // Set no-cache headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    const reqBody = await _request.json();

    const { id, values } = reqBody;

    const { password, email, department_name, position_title, username } = values;

    if (!password || !email || !username) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!id) {
      // check for duplicate username:
      const duplicateUsername = await knex.select("*").from("users").where("username", username).first();
      if (duplicateUsername) {
        return NextResponse.json(
          { error: "Username already exists." },
          { status: 400 }
        );
      }

      // check for duplicate email:
      const duplicateEmail = await knex.select("*").from("users").where("email", email).first();
      if (duplicateEmail) {
        return NextResponse.json(
          { error: "Email already exists." },
          { status: 400 }
        );
      }
    }

    delete values.password;
    if (id) {
      delete values.email;
      delete values.username;
    }
    delete values?.department_name;
    delete values?.position_title;

    if (department_name) {
      // find department id:
      const departmentQuery = await knex.select("department_id").from("departments").where("department_name", department_name).first();
      values.department_id = departmentQuery.department_id;
    }

    if (position_title) {
      // find position id:
      const positionQuery = await knex.select("position_id").from("positions").where("position_title", position_title).first();
      values.position_id = positionQuery.position_id;
    }


    // Lets try to find the user first
    const user = await knex.select("*").from("users").where("user_id", id).first();

    // salt the password:
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    values.password = hashedPassword;

    let userQuery;
    if (user) {
      // update
      userQuery = await knex("users")
        .update(values)
        .where("user_id", id)
        .returning("*");
    } else {
      // create
      userQuery = await knex("users").insert({...values, email}).returning("*");
    }

    if (userQuery.length > 0) {
      const updatedUser = userQuery[0];
      delete updatedUser.password;
      return NextResponse.json({
        success: true,
        user: updatedUser,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Something went wrong while creating/updating user.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
