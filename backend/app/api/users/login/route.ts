import pool from "@/dbConfig/pgConfig"; // Importing your pool
import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserRolesAndPermissions } from "@/utils/permissions";

interface RoleWithPermissions {
    roleName: string;
    permissions: string[];
}

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

        const userRoles = await getUserRolesAndPermissions(user.user_id);
        console.log(userRoles);
        const returnRoles = userRoles.reduce(
          (acc: string[], role: RoleWithPermissions) => {
            acc.push(...role.permissions);
            return acc;
          },
          []
        );
    
        // Token data
        const tokenData = {
            id: user.user_id,
            permissions: returnRoles,
            username: user.username,
            email: user.email
        };

        // Create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1h" });


        // get the site config:
        let site_config: any = {};
        const siteConfigResult: any = await knex('site_config').select('*');
        siteConfigResult.forEach((config: any) => {
            site_config[config.config_name] = config.value;
        });

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            site_config
        });
        
        // Set the Cache-Control header to no-cache
        response.headers.set('Cache-Control', 'no-cache');
        
        response.cookies.set("token", token, { httpOnly: true });

        return response;

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}
