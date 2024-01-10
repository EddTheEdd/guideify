import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles creating a new role
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {

    // Validating the requester
    const userId = getDataFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to create a role." }, { status: 403 });
    }

    // Does the requester have permission to edit roles?
    const hasPermission = await checkUserPermissions(userId, 'Edit Roles');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit roles salaries. Permission required: Edit Roles" },
        { status: 403 }
      );
    }

    // Extract the values
    const reqBody = await request.json();
    const { name, permissions } = reqBody;

    // Name is required for the role
    if (!name) {
      return NextResponse.json(
        { frontendErrorMessage: "Role name is required." },
        { status: 400 }
      );
    }

    // Check if role with the same name already exists
    const roleQuery = "SELECT * FROM roles WHERE name = $1";
    const roleExists = await pool.query(roleQuery, [name]);

    // If role exists, return error
    if (roleExists.rowCount > 0) {
      return NextResponse.json(
        { frontendErrorMessage: "Role with this name already exists." },
        { status: 400 }
      );
    }

    // Insert new role
    const insertRoleQuery = "INSERT INTO roles (name) VALUES ($1) RETURNING role_id";
    const newRole = await pool.query(insertRoleQuery, [name]);
    const roleId = newRole.rows[0].role_id; // Assuming id is the column name for the role id

    // Assign permissions to role
    const insertPermissionQuery =
      "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)";
    for (const permissionId of permissions) {
      await pool.query(insertPermissionQuery, [roleId, permissionId]);
    }

    return NextResponse.json({
      message: "Role created successfully",
      success: true,
      response: { id: roleId, name, permissions },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Updated the role
 * @param request 
 * @returns 
 */
export async function PUT(request: NextRequest) {
  try {

    // Validating the requester
    const userId = getDataFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to edit a role." }, { status: 403 });
    }

    // Check for permissions
    const hasPermission = await checkUserPermissions(userId, 'Edit Roles');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit roles salaries. Permission required: Edit Roles" },
        { status: 403 }
      );
    }

    // Extract the body elements
    const reqBody = await request.json();
    const { role_name, permissions, original_name } = reqBody;


    // Errors if role name empty or if trying to edit root role.
    if (!role_name) {
      return NextResponse.json(
        { frontendErrorMessage: "Role name is required." },
        { status: 400 }
      );
    }

    if (role_name === "ROOT" || original_name === "ROOT") {
        return NextResponse.json(
            { error: "You cannot edit the ROOT role." },
            { status: 400 }
        );
    }

    // Update role:
    const updateRoleQuery = "UPDATE roles SET name = $1 WHERE name = $2 RETURNING *";
    const updatedRole = await pool.query(updateRoleQuery, [role_name, original_name]);
    const roleId = updatedRole.rows[0].role_id;

    // Update permissions
    // Remove all permissions for that role that do not include our permissions:
    await knex.transaction(async trx => {
      // Remove permissions that are no longer needed
      await trx('role_permissions')
        .where('role_id', roleId)
        .whereNotIn('permission_id', permissions)
        .del();
    
      // Insert new permissions and handle conflicts
      await trx('role_permissions')
        .insert(permissions.map((permissionId: number) => ({ role_id: roleId, permission_id: permissionId })))
        .onConflict(['role_id', 'permission_id'])
        .ignore();
    
    }).catch(err => {
      console.error('Transaction failed: ', err);
    });

    // Success response
    return NextResponse.json({
      message: "Role updated successfully",
      success: true,
      response: { id: roleId, role_name, permissions },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Gets all the roles
 * @param _request 
 * @returns 
 */
export async function GET(_request: NextRequest) {
  try {

    // Validating the requester
    const userId = getDataFromToken(_request);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to view roles." }, { status: 403 });
    }

    // Permission check
    const hasPermission = await checkUserPermissions(userId, 'View Roles');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view roles. Permission required: View Roles" },
        { status: 403 }
      );
    }

    // Parameters
    const page = parseInt(_request.nextUrl.searchParams.get("page") || '1', 10);
    const limit = parseInt(_request.nextUrl.searchParams.get("limit") || '10', 10);
    const offset = (page - 1) * limit;

    // Query the roles and permissions
    const result = await knex('roles')
        .select(
          'roles.role_id as role_id',
          'roles.name as role_name'
        )
        .leftJoin('role_permissions', 'roles.role_id', 'role_permissions.role_id')
        .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.permission_id')
        .groupBy('roles.role_id')
        .select(knex.raw("json_agg(json_build_object('permission_id', permissions.permission_id, 'name', permissions.name)) as permissions")).limit(limit).offset(offset);

    const totalRoles = await knex('roles').count('role_id');

    // Remove null permissions
    return NextResponse.json({
      success: true,
      roles: result.map((row) => ({
        ...row,
        permissions: row.permissions.filter(
          (permission: any) => permission.permission_id !== null
        ),
      })),
      totalRoles: totalRoles[0].count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
