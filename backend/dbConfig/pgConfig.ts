import { Pool } from "pg";

// Initialize the PostgreSQL pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost', // or your PostgreSQL host
  database: 'postgres',
  password: 'qazxswedc123',
  port: 5432, // Default PostgreSQL port
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
