import currencyNameValueMap from "@/app/config/currencyNameValueMap";
import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns site configuration
 * @param req 
 * @returns 
 */
export async function GET(req: NextRequest) {
  try {
    // Get validation
    const userId = getDataFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to view site config." }, { status: 403 });
    }

    // Fetch from site config table
    const data: any = await knex("site_config").select("*");

    let site_config: any = {};
    data.forEach((config: any) => {
        site_config[config.config_name] = config.value;
    });

    return NextResponse.json({
      success: true,
      config: site_config
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update site config
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
  try {

    // Get validation
    const userId = getDataFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to edit site config." }, { status: 403 });
    }

    // Extract data from request
    const reqBody = await req.json();
    const { currency, defaultEntriesPerPage } = reqBody;
    let updatedConfig;


    // If currency is provided, check if it is valid
    if (currency) {

      if (!Object.keys(currencyNameValueMap).includes(currency)) {
        return NextResponse.json(
          { frontendErrorMessage: "Invalid currency." },
          { status: 400 }
        );
      }

      // check if requested currency has been altered from what is in db:
      const data: any = await knex("site_config")
        .select("*")
        .where("config_name", "currency")
        .where("value", currency);

      // If currency is different from what is in db, update it
      if (data.length === 0) {
        await knex("site_config")
          .where("config_name", "currency")
          .update({ value: currency });
        updatedConfig = "currency";
      }
    }

    // If defaultEntriesPerPage is provided, check if it is valid
    if (defaultEntriesPerPage) {

      if (defaultEntriesPerPage < 1 || defaultEntriesPerPage > 100) {
        return NextResponse.json(
          { frontendErrorMessage: "Invalid number of entries per page." },
          { status: 400 }
        );
      }

      // check if requested defaultEntriesPerPage has been altered from what is in db:
      const data2: any = await knex("site_config")
        .select("*")
        .where("config_name", "defaultEntriesPerPage")
        .where("value", defaultEntriesPerPage);

      if (data2.length === 0) {
        await knex("site_config")
          .where("config_name", "defaultEntriesPerPage")
          .update({ value: defaultEntriesPerPage });
        updatedConfig = "pagination";
      }
    }

    return NextResponse.json({
      success: true,
      updatedConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
