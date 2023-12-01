import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { getUserRolesAndPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

interface RoleWithPermissions {
  roleName: string;
  permissions: string[];
}

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const userRoles = await getUserRolesAndPermissions(userId);
    const returnRoles = userRoles.reduce(
      (acc: string[], role: RoleWithPermissions) => {
        acc.push(...role.permissions);
        return acc;
      },
      []
    );

    return NextResponse.json({ roles: returnRoles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
