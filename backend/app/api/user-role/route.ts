// pages/api/assignRoleToUser.ts
import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, roleId } = await request.json();

        // Check if this user-role relation already exists
        const checkExistingQuery = "SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2";
        const existingRelation = await pool.query(checkExistingQuery, [userId, roleId]);

        if (existingRelation.rowCount > 0) {
            return NextResponse.json({ 
                message: "This role is already assigned to the user.", 
                success: false 
            });
        }

        const insertQuery = "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)";
        await pool.query(insertQuery, [userId, roleId]);

        return NextResponse.json({ message: "Role assigned to user successfully", success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query("SELECT * FROM user_roles");
        return NextResponse.json({
            success: true,
            user_roles: result.rows,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

