const { Client } = require('pg');
const fs = require('fs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.djytzbcjouhzhrzetour:SureSealSealants@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function importFromCsv() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB');

        const csvData = fs.readFileSync('complete_products_import.csv', 'utf8');
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',');

        const productsMap = new Map();

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c?.replace(/^"|"$/g, '').trim()); 
            const handle = cols[0];
            const title = cols[1] || '';
            const tags = cols[5]?.toLowerCase() || '';
            const isWholesale = tags.includes('wholesale') || handle.includes('wholesale') || title.toLowerCase().includes('wholesale');

            if (!handle || isWholesale) continue;

            if (!productsMap.has(handle)) {
                productsMap.set(handle, {
                    handle,
                    name: cols[1],
                    description: cols[2],
                    category: cols[4] || 'Uncategorized',
                    image_url: cols[17],
                    tags: cols[5]?.split(',').map(t => t.trim()) || [],
                    variants: []
                });
            }

            const product = productsMap.get(handle);
            
            if (cols[1]) product.name = cols[1];
            if (cols[2]) product.description = cols[2];
            
            // Fix: Map absolute URLs to local paths
            if (cols[17]) {
                const img = cols[17];
                if (img.includes('suresealsealants.com.au/images/')) {
                    product.image_url = '/images/' + img.split('/images/').pop();
                } else if (img.includes('suresealsealants.com.au/public/images/')) {
                    product.image_url = '/images/' + img.split('/public/images/').pop();
                } else {
                    product.image_url = img;
                }
            }

            product.variants.push({
                name: cols[8] || 'Default',
                sku: cols[9],
                price: parseFloat(cols[15]) || 0,
                stock_qty: parseInt(cols[12]) || 100
            });
        }

        console.log(`Parsed ${productsMap.size} products. Cleaning up existing data...`);
        
        await client.query('BEGIN');
        await client.query('DELETE FROM order_items'); // Foreign key constraint
        await client.query('DELETE FROM product_variants');
        await client.query('DELETE FROM products');

        for (const [handle, p] of productsMap) {
            const pRes = await client.query(
                'INSERT INTO products (handle, name, description, category, image_url, tags, is_active) VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id',
                [p.handle, p.name, p.description, p.category, p.image_url, p.tags]
            );
            const productId = pRes.rows[0].id;

            for (const v of p.variants) {
                if (!v.sku) continue;
                await client.query(
                    'INSERT INTO product_variants (product_id, sku, name, price, stock_qty) VALUES ($1, $2, $3, $4, $5)',
                    [productId, v.sku, v.name, v.price, v.stock_qty]
                );
            }
        }

        await client.query('COMMIT');
        console.log('✅ Catalog successfully reverted to complete_products_import.csv');
    } catch (err) {
        console.error('Error:', err);
        if (client) await client.query('ROLLBACK');
    } finally {
        await client.end();
    }
}

importFromCsv();
