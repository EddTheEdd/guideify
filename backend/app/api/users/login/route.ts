import pool from "@/dbConfig/pgConfig"; // Importing your pool
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email, password } = reqBody;

        // Check if user exists
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];
        
        if (!user) {
            return NextResponse.json({error: "User does not exist"}, {status: 400});
        }

        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({error: "Incorrect password!"}, {status: 400});
        }

        // Token data
        const tokenData = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        // Create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1h" });

        const response = NextResponse.json({
            message: "Login successful",
            success: true
        });

        response.cookies.set("token", token, { httpOnly: true });

        return response;

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}
