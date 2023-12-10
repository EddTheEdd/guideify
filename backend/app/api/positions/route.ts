import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await knex('positions').select('position_title', 'position_id');

    // For each position check if there is at least one user assigned to it and if so set canBeDeleted to false
    const updatedData = await Promise.all(data.map(async (position) => {
      const users = await knex('users').where('position_id', position.position_id);
      position.canBeDeleted = users.length === 0;
      return position;
    }));

    return NextResponse.json({
      success: true,
      positions: updatedData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getDataFromToken(req);

    const reqBody = await req.json();
    const { positions } = reqBody;

    await Promise.all(positions.map(async (pos: any) => {
      if (pos.forDeletion) {
        await knex('positions').where('position_id', pos.position_id).del();
      } else {
        const existingPos = await knex('positions').where('position_id', pos.position_id).first();
        console.log("POS EXISTS:");
        if (existingPos) {
          await knex('positions')
            .where('position_id', pos.position_id)
            .update({ position_title: pos.position_title });
        } else {
          await knex('positions').insert({
            position_title: pos.position_title
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
