import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await knex('departments').select('department_name');
    return NextResponse.json({
      success: true,
      departments: data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
