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
        console.log("Adding user_id column to revoked_tokens table...");
        await pool.query('ALTER TABLE revoked_tokens ADD COLUMN IF NOT EXISTS user_id TEXT;');
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
