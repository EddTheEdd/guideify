import currencyNameValueMap from "@/app/config/currencyNameValueMap";
import knex from "@/dbConfig/knexConfig"; // Update this path according to your project structure
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextApiRequest, NextApiResponse } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data: any = await knex("site_config").select("*");
    console.log("CONFIG:");
    console.log(data);

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

export async function POST(req: NextRequest) {
  try {
    const userId = getDataFromToken(req);

    const reqBody = await req.json();
    const { currency, defaultEntriesPerPage } = reqBody;
    let updatedConfig;

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

      if (data.length === 0) {
        await knex("site_config")
          .where("config_name", "currency")
          .update({ value: currency });
        updatedConfig = "currency";
      }
    }

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
