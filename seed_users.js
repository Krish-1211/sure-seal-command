import pg from "pg";
const { Client } = pg;

const connectionString = 'postgresql://postgres.djytzbcjouhzhrzetour:SureSealSealants@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({ connectionString });

async function run() {
    await client.connect();

    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id text PRIMARY KEY,
            username text UNIQUE NOT NULL,
            password text NOT NULL,
            name text NOT NULL,
            role text NOT NULL,
            region text,
            phone text,
            email text,
            created_at timestamp with time zone DEFAULT now()
        );
    `);

    // Insert dummy users if not exist
    const users = [
        ['admin-1', 'kevin', 'kevin123', 'Kevin', 'admin', 'Head Office', '+61 400 000 000', 'kevin@sureseal.com.au'],
        ['rep-1', 'scott', 'scott123', 'Scott Mitchell', 'salesman', 'Melbourne SE', '+61 400 123 456', 'scott.m@sureseal.com.au'],
        ['rep-2', 'sarah', 'sarah123', 'Sarah Jenkins', 'salesman', 'Sydney North', '+61 400 987 654', 'sarah.j@sureseal.com.au'],
        ['rep-3', 'michael', 'michael123', 'Michael Chang', 'salesman', 'Brisbane', '+61 400 555 777', 'michael.c@sureseal.com.au']
    ];

    for (const u of users) {
        await client.query(
            `INSERT INTO users (id, username, password, name, role, region, phone, email) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (username) DO NOTHING`,
            u
        );
    }

    // While we are here, let's look at the orders table to make sure total_revenue works
    // The previous error was that subtotal was null for some older orders

    console.log("Users created.");
    await client.end();
}

run().catch(console.error);
