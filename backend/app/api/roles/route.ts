import pool from "@/dbConfig/pgConfig";
import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {

    const userId = getDataFromToken(request);

    const hasPermission = await checkUserPermissions(userId, 'Edit Roles');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit roles salaries. Permission required: Edit Roles" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const { name, permissions } = reqBody; // Assuming permissions are an array of permission ids

    if (name === "") {
      return NextResponse.json(
        { frontendErrorMessage: "Role name is required." },
        { status: 400 }
      );
    }

    // Check if role with the same name already exists
    const roleQuery = "SELECT * FROM roles WHERE name = $1";
    const roleExists = await pool.query(roleQuery, [name]);

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

export async function PUT(request: NextRequest) {
  try {

    const userId = getDataFromToken(request);

    const hasPermission = await checkUserPermissions(userId, 'Edit Roles');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit roles salaries. Permission required: Edit Roles" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const { role_name, permissions, original_name } = reqBody;

    if (role_name === "") {
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
    // remove all permissions for that role:
    const deletePermissionsQuery =
      "DELETE FROM role_permissions WHERE role_id = $1";
    await pool.query(deletePermissionsQuery, [roleId]);
    // add new ones:
    const updateRolePermissionsQuery =
      "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)";
    for (const permissionId of permissions) {
      await pool.query(updateRolePermissionsQuery, [roleId, permissionId]);
    }

    return NextResponse.json({
      message: "Role updated successfully",
      success: true,
      response: { id: roleId, role_name, permissions },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {

    const userId = getDataFromToken(_request);

    const hasPermission = await checkUserPermissions(userId, 'View Roles');
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view roles. Permission required: View Roles" },
        { status: 403 }
      );
    }

    const page = parseInt(_request.nextUrl.searchParams.get("page") || '1', 10);
    const limit = parseInt(_request.nextUrl.searchParams.get("limit") || '10', 10);
    const offset = (page - 1) * limit;


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

    return NextResponse.json({
      success: true,
      roles: result.map((row) => ({
        ...row,
        permissions: row.permissions.filter(
          (permission: any) => permission.permission_id !== null
        ), // remove null permissions (when a role has no permissions)
      })),
      totalRoles: totalRoles[0].count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
