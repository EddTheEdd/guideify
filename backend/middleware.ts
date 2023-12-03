import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/signup";
  // Get the string value of the token or an empty string if it's not available
  const token = request.cookies.get("token")?.value || "";

  try {
    if (token) {
      // Make sure to convert your environment variable to Uint8Array using TextEncoder
      const secretKey = new TextEncoder().encode(process.env.TOKEN_SECRET);

      // Now we pass the string token
      await jwtVerify(token, secretKey);
      
      if (isPublicPath) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
      }
    } else if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  } catch (error) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile", "/login", "/signup", "/roles", "/courses", "/unit", "/wages", "/roles/assignment"],
};
