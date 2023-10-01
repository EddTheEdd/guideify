// pages/api/user-role/[userId]/[roleId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbConfig/pgConfig'; // Adjust the import path according to your folder structure

export async function DELETE(request: NextRequest) {
    console.log(request.url);
    const urlParts = request.url.split('/');
    const userId = urlParts[5]; // Adjust the index depending on your actual URL structure
    const roleId = urlParts[6];
    console.log(userId);
    console.log(roleId);
    if (!userId || !roleId) {
        return NextResponse.json({ error: 'User ID and Role ID are required.' }, { status: 400 });
    }

    try {
        const deleteQuery = 'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2';
        await pool.query(deleteQuery, [userId, roleId]);

        return NextResponse.json({ message: 'Role removed from user successfully', success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
