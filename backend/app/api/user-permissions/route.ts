import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { getUserRolesAndPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

interface RoleWithPermissions {
  roleName: string;
  permissions: string[];
}

/**
 * Get the user permissions
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    console.log("USER ID:")
    console.log(userId);
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to view your permissions." },
        { status: 401 }
      );
    }

    const userRoles = await getUserRolesAndPermissions(userId);
    console.log(userRoles);
    const returnRoles = userRoles.reduce(
      (acc: string[], role: RoleWithPermissions) => {
        acc.push(...role.permissions);
        return acc;
      },
      []
    );

    return NextResponse.json({ roles: returnRoles, activeUserId: userId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
