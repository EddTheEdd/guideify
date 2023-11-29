// Import Knex
import Knex from "knex";

const knex = Knex({
  client: 'pg',
  connection: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  },
  pool: { min: 0, max: 7 },
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
