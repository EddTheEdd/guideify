import mongoose from 'mongoose';
import { Pool } from 'pg';

let mongoConnected = false;
let pgConnected = false;

async function dbConnect(databaseType: 'mongo' | 'pg' = 'mongo') {
    if ((databaseType === 'mongo' && mongoose.connection.readyState >= 1) ||
        (databaseType === 'pg' && pgConnected)) {
        return;
    }

    try {
        if (databaseType === 'mongo') {
            await mongoose.connect('mongodb://localhost:27017/guidefy');
            mongoConnected = true;
            console.log('Connected to MongoDB');
            // Additional MongoDB-specific setup or routes here
        } else if (databaseType === 'pg') {
            const pool = new Pool({
                user: 'postgres',
                host: 'localhost', // or your PostgreSQL host
                database: 'localhost',
                password: 'qazxswedc123',
                port: 5432, // Default PostgreSQL port
            });

            // Test the PostgreSQL connection
            await pool.query('SELECT 1');
            pgConnected = true;
            console.log('Connected to PostgreSQL');
            // Additional PostgreSQL-specific setup or routes here
        }
    } catch (err) {
        console.error(`Error connecting to ${databaseType === 'mongo' ? 'MongoDB' : 'PostgreSQL'}:`, err);
    }
}

export default dbConnect;
