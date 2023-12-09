import { Pool } from "pg";

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;


// Initialize the PostgreSQL pool
const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

export async function pgConnect() {
  try {
    // Test the PostgreSQL connection
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.log("Something went wrong!");
    console.log(error);
  }
}

// Export the PostgreSQL pool for use in other modules
export default pool;
