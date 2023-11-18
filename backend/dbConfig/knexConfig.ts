// Import Knex
import Knex from "knex";

const knex = Knex({
  client: "pg",
  connection: {
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "qazxswedc123",
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
