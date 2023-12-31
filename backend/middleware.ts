import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE");
  const pagePermissions = {
    "/courses/submissions": ["View Course Progress"],
    "/admin": ["Admin Panel"],
    "/courses/:courseId": ["Edit Courses"],
    "/roles": ["View Roles"],
    "/roles/assignment": ["Assign Roles"],
    "/wages": ["View Salaries"]
  };

  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/signup";
  const token = request.cookies.get("token")?.value || "";

  try {
    if (token) {
      const secretKey = new TextEncoder().encode(process.env.TOKEN_SECRET);
      const { payload } = await jwtVerify(token, secretKey);

      if (isPublicPath) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
      }

      const userPermissions = payload.permissions || [];

      // Function to check permissions for both static and dynamic routes
      const hasRequiredPermissions = await checkPermissionsForPath(path, userPermissions, pagePermissions);

      if (!hasRequiredPermissions) {
        return NextResponse.redirect(new URL("/forbidden", request.nextUrl));
      }
    } else if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  } catch (error) {
    console.error('JWT Verification Error:', error);
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }

  return NextResponse.next();
}

async function checkPermissionsForPath(path: string, userPermissions: any, pagePermissions: any) {
  // Direct match
  if (pagePermissions[path]) {
    return pagePermissions[path].every((permission: any) => userPermissions.includes(permission));
  }

  // Check for dynamic route matches
  for (const route in pagePermissions) {
    if (route.includes(":")) {
      // Create a regex pattern from the route
      const pattern = `^${route.replace(/:[^/]+/g, "([^/]+)")}$`;
      const regex = new RegExp(pattern);
      console.log("REGEX ", regex);
      console.log(userPermissions);
      console.log(pagePermissions[route]);
      if (regex.test(path)) {
        return pagePermissions[route].every((permission: any) => userPermissions.includes(permission));
      }
    }
  }

  // If no match found, default to no permission required
  return true;
}

export const config = {
  matcher: ["/", "/profile", "/login", "/signup", "/roles", "/courses", "/unit", "/wages", "/roles/assignment", "/home", "/admin", "/courses/submissions", "/courses/:path*", "/roles/assignment"],
};
