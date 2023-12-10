import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await knex('departments').select('department_name', 'department_id');

    // For each department check if there is at least one user assigned to it and if so set canBeDeleted to false
    const updatedData = await Promise.all(data.map(async (department) => {
      const users = await knex('users').where('department_id', department.department_id);
      department.canBeDeleted = users.length === 0;
      return department;
    }));

    return NextResponse.json({
      success: true,
      departments: updatedData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getDataFromToken(req);

    const reqBody = await req.json();
    const { departments } = reqBody;

    await Promise.all(departments.map(async (dept: any) => {
      if (dept.forDeletion) {
        await knex('departments').where('department_id', dept.department_id).del();
      } else {
        const existingDept = await knex('departments').where('department_id', dept.department_id).first();
        console.log("DEP EXISTS:");
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
