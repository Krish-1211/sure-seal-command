import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djytzbcjouhzhrzetour.supabase.co';
const supabaseKey = 'sb_publishable_6g3Mx56Wi7nC9rnwVjACmg_JG_k3odL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        console.log("Fetching products...");
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log(`Success! Found ${data.length} products.`);
        }
    } catch (err) {
        console.error("Catch Error:", err);
    }
}

check();
