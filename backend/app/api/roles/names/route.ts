import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description Get all roles with their ids, this is meant for adding them to courses.
 * @param _request
 * @returns
 */
export async function GET(_request: NextRequest) {
  try {
    const userId = getDataFromToken(_request);

    const hasPermission = await checkUserPermissions(userId, "Edit Courses");
    if (!hasPermission) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view roles. Permission required: Edit Courses",
        },
        { status: 403 }
      );
    }

    const roles = await knex("roles").select("role_id", "name");

    return NextResponse.json({ success: true, roles });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
