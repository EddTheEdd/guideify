import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Delete a role
 * @param request 
 * @returns 
 */
export async function DELETE(request: NextRequest) {
    try {
  
      // Validating the requester
      const userId = getDataFromToken(request);
  
      if (!userId) {
        return NextResponse.json({ error: "You must be logged in to delete a role." }, { status: 403 });
      }

      // Validate the permission
      const hasPermission = await checkUserPermissions(userId, 'Edit Roles');
      if (!hasPermission) {
        return NextResponse.json(
          { error: "You do not have permission to edit roles. Permission required: Edit Roles" },
          { status: 403 }
        );
      }
  
      const role_id: any = request.nextUrl.pathname.split('/').pop();
  
      if (!role_id) {
        return NextResponse.json({ error: 'Role ID is required.' }, { status: 400 });
      }
  
      if (role_id == 1) {
        return NextResponse.json(
            { error: "You cannot delete the ROOT role." },
            { status: 400 }
        );
      }
  
      // delete with knex
      const deleteRoleResult = await knex('roles').where('role_id', role_id).del().returning('*');
  
      return NextResponse.json({
        message: "Role deleted successfully",
        success: true,
        response: deleteRoleResult,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  