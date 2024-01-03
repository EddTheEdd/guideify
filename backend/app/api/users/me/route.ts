import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/dbConfig/pgConfig"; // Import pool

export async function GET(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);

        // Retrieve user by ID but exclude password
        const { rows } = await pool.query(
            'SELECT username, email, first_name, last_name, date_of_birth, phone_number FROM users WHERE user_id = $1',
            [userId]
        );
        const user = rows[0];

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 400});
        }

        return NextResponse.json({
            message: "User Found",
            user
        });

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 400});
    }
}
