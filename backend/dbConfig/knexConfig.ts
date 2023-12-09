// Import Knex
import Knex from "knex";

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Knex Configuration
const knex = Knex({
  client: "pg", // PostgreSQL client
  connection: {
    host: PGHOST,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    port: 5432,
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    min: 2,
    max: 10,
  },
});


export async function knexConnect() {
  try {
    await knex.raw("SELECT 1");
    console.log("Connected to PostgreSQL with Knex");
  } catch (error) {
    console.log("Something went wrong!");
    console.error(error);
  }
}

export default knex;
