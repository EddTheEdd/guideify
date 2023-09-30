import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { name, permissions } = reqBody; // Assuming permissions are an array of permission ids

        // Check if role with the same name already exists
        const roleQuery = "SELECT * FROM roles WHERE name = $1";
        const roleExists = await pool.query(roleQuery, [name]);

        if (roleExists.rowCount > 0) {
            return NextResponse.json(
                { error: "Role already exists with this name." },
                { status: 400 }
            );
        }

        // Insert new role
        const insertRoleQuery = "INSERT INTO roles (name) VALUES ($1) RETURNING id";
        const newRole = await pool.query(insertRoleQuery, [name]);
        const roleId = newRole.rows[0].id; // Assuming id is the column name for the role id

        // Assign permissions to role
        const insertPermissionQuery = "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)";
        for(const permissionId of permissions) {
            await pool.query(insertPermissionQuery, [roleId, permissionId]);
        }

        return NextResponse.json({
            message: "Role created successfully",
            success: true,
            response: { id: roleId, name, permissions }
        });  

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}


export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query(`
            SELECT 
                roles.id as role_id,
                roles.name as role_name,
                json_agg(json_build_object('id', permissions.id, 'name', permissions.name)) as permissions
            FROM roles
            LEFT JOIN role_permissions ON roles.id = role_permissions.role_id
            LEFT JOIN permissions ON role_permissions.permission_id = permissions.id
            GROUP BY roles.id;
        `);

        return NextResponse.json({
            success: true,
            roles: result.rows.map(row => ({
                ...row,
                permissions: row.permissions.filter((permission: any) => permission.id !== null) // remove null permissions (when a role has no permissions)
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

