import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_request: NextRequest) {
  try {
    const userId = _request.nextUrl.pathname.split("/").pop();

    const userQuery = await knex("users")
      .where("user_id", userId)
      .del()
      .returning("*");

    if (userQuery.length > 0) {
      const deletedUser = userQuery[0];
      delete deletedUser.password;
      return NextResponse.json({
        success: true,
        user: deletedUser,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Something went wrong while deleting user.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
