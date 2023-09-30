import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/dbConfig/pgConfig"; // Import pool

export async function GET(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);

        // Retrieve user by ID but exclude password
        const { rows } = await pool.query(
            'SELECT id, username, email FROM users WHERE id = $1',
            [userId]
        );
        const user = rows[0];

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 400});
        }

        return NextResponse.json({
            message: "User Found",
            data: user
        });

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 400});
    }
}
