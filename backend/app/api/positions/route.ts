import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { checkUserPermissions } from "@/utils/permissions";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get list of positions
 * @param req 
 * @returns 
 */
export async function GET(req: NextRequest) {
  try {

    // Validate request
    const userId = getDataFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to view positions." }, { status: 403 });
    }

    const data = await knex('positions').select('position_title', 'position_id');

    // For each position check if there is at least one user assigned to it and if so set canBeDeleted to false
    const updatedData = await Promise.all(data.map(async (position) => {
      const users = await knex('users').where('position_id', position.position_id);
      position.canBeDeleted = users.length === 0;
      return position;
    }));

    // Create a response
    const response = NextResponse.json({
      success: true,
      positions: updatedData
    });
    
    // Set no-cache headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update positions config
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
  try {

    // Validate the requester
    const userId = getDataFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to edit positions." }, { status: 403 });
    }

    // Validate the access:
    const canEditPositions = await checkUserPermissions(userId, 'Admin Panel');

    if (!canEditPositions) {
      return NextResponse.json(
        { error: "You do not have permission to edit departments. Permission required: Admin Panel" },
        { status: 403 }
      );
    }

    // Get positions objs.
    const reqBody = await req.json();
    const { positions } = reqBody;

    // Check if any of positions are missing a title
    for (const pos of positions) {
      if (pos.position_title.length === 0) {
        return NextResponse.json(
          { frontendErrorMessage: "Position title is required." },
          { status: 400 }
        );
      }
    }

    // Create a promise that goes over all positons
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
