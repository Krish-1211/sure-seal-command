import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const supabaseUrl = process.env.SUPABASE_URL || 'https://djytzbcjouhzhrzetour.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migratePhotos() {
    try {
        console.log('Fetching check-ins with base64 photo_data...');
        const res = await pool.query('SELECT id, photo_data FROM check_ins WHERE photo_data IS NOT NULL');
        console.log(`Found ${res.rows.length} records to migrate.`);

        for (const row of res.rows) {
            const base64Data = row.photo_data;
            if (!base64Data.startsWith('data:image')) {
                console.log(`Skipping row ${row.id}: photo_data is not a valid base64 image string.`);
                continue;
            }

            // Extract the base64 content
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                console.log(`Skipping row ${row.id}: Could not parse base64 data.`);
                continue;
            }

            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `checkin-migrated-${row.id}-${Date.now()}.jpg`;

            console.log(`Uploading ${fileName} to storage...`);
            const { data, error } = await supabase.storage
                .from('check-in-photos')
                .upload(fileName, buffer, {
                    contentType: type,
                    upsert: false
                });

            if (error) {
                console.error(`Error uploading photo for record ${row.id}:`, error.message);
                continue;
            }

            const { data: publicData } = supabase.storage.from('check-in-photos').getPublicUrl(fileName);
            const photoUrl = publicData.publicUrl;

            console.log(`Updating DB for record ${row.id} with URL: ${photoUrl}`);
            await pool.query('UPDATE check_ins SET photo_url = $1, photo_data = NULL WHERE id = $2', [photoUrl, row.id]);
        }

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migratePhotos();
