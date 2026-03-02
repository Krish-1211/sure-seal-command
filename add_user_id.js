import pg from "pg";
const { Client } = pg;
const connectionString = 'postgresql://postgres.djytzbcjouhzhrzetour:SureSealSealants@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';
const client = new Client({ connectionString });
async function run() {
    await client.connect();
    // Add user_id column if not exists
    await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id text REFERENCES users(id) ON DELETE SET NULL;`);

    // Assign previous orders to users randomly or sequence simply
    // Because Kevin needs to see all sales, and Scott needs some.
    const orders = await client.query(`SELECT id FROM orders WHERE user_id IS NULL;`);
    const mockRepIds = ['rep-1', 'rep-2', 'rep-3'];
    for (let i = 0; i < orders.rows.length; i++) {
        await client.query(`UPDATE orders SET user_id = $1 WHERE id = $2`, [mockRepIds[i % mockRepIds.length], orders.rows[i].id]);
    }
    console.log("Column added and previous orders assigned to active sales reps.");
    await client.end();
}
run().catch(console.error);
