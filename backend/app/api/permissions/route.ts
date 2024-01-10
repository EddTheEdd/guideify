import pool from "@/dbConfig/pgConfig"; 
import { NextRequest, NextResponse } from "next/server";

/**
 * Get permissions for frontend usage
 * @param _request 
 * @returns 
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query("SELECT * FROM permissions");
        // Create a response object with the data
        const response = NextResponse.json({
            success: true,
            permissions: result.rows,
        });

        // Set headers to disable caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        return response;
    } catch (error: any) {
        // Return error response with no cache headers
        const errorResponse = NextResponse.json({ error: error.message }, { status: 500 });
        errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return errorResponse;
    }
}
