import { Pool } from "pg";

// Initialize the PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
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
