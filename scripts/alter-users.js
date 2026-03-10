import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Adding active column to users table...");
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;');
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
