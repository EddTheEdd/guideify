import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_request: NextRequest) {
  try {
    const tokenUserId = getDataFromToken(_request);

    if (!tokenUserId) {
      return NextResponse.json(
        { error: "You must be logged in to delete a user." },
        { status: 403 }
      );
    }

    const canAdminPanel = await checkUserPermissions(tokenUserId, "Admin Panel");

    if (!canAdminPanel) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to delete users. Permission required: Admin Panel" },
        { status: 403 }
      );
    }

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
