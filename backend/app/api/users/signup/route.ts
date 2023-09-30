import {connect} from "@/dbConfig/dbConfig";
import { pgConnect } from "@/dbConfig/pgConfig";
import pool from "@/dbConfig/pgConfig"; 
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        
        const reqBody = await request.json();
        const {username, email, password} = reqBody;

        console.log(reqBody);

        const userQuery = "SELECT * FROM users WHERE email = $1";
        const userExists = await pool.query(userQuery, [email]);

        if (userExists.rowCount > 0) {
        return NextResponse.json(
            { error: "User already exists with this email." },
            { status: 400 }
        );
        }

        //hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const insertQuery = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
        const newUser = await pool.query(insertQuery, [
            username,
            email,
            hashedPassword,
        ]);

        console.log(newUser.rows[0]);

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            response: newUser.rows[0],
        });  

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}