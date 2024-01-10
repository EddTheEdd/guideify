import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get deparments
 * @param req 
 * @returns 
 */
export async function GET(req: NextRequest) {
  try {
    const data = await knex('departments').select('department_name', 'department_id');

    // For each department check if there is at least one user assigned to it and if so set canBeDeleted to false
    const updatedData = await Promise.all(data.map(async (department) => {
      const users = await knex('users').where('department_id', department.department_id);
      department.canBeDeleted = users.length === 0;
      return department;
    }));

    // Create a response
    const response = NextResponse.json({
      success: true,
      departments: updatedData
    });
        
    // Set no-cache headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
        
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update departments config
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
  try {

    // Validate request
    const userId = getDataFromToken(req);


    // Check the permissions
    const canEditDepartments = await checkUserPermissions(userId, 'Admin Panel');

    if (!canEditDepartments) {
      return NextResponse.json(
        { error: "You do not have permission to edit departments. Permission required: Admin Panel" },
        { status: 403 }
      );
    }

    // Get the departments
    const reqBody = await req.json();
    const { departments } = reqBody;

    for (const dep of departments) {
      if (dep.department_name.length === 0) {
        return NextResponse.json(
          { frontendErrorMessage: "Department name is required." },
          { status: 400 }
        );
      }
    }

    // Update the departments
    await Promise.all(departments.map(async (dept: any) => {
      if (dept.forDeletion) {
        await knex('departments').where('department_id', dept.department_id).del();
      } else {
        const existingDept = await knex('departments').where('department_id', dept.department_id).first();
        if (existingDept) {
          await knex('departments')
            .where('department_id', dept.department_id)
            .update({ department_name: dept.department_name });
        } else {
          await knex('departments').insert({
            department_name: dept.department_name
          });
        }
      }
    }));

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
