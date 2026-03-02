const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.djytzbcjouhzhrzetour:SureSealSealants@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

const basePath = '/Users/krish/Library/CloudStorage/GoogleDrive-krishkavathia27@gmail.com/My Drive/macbook/Kevin sir/sure-seal-command-main';
const productsPath = path.join(basePath, 'server/data/products.json');
const pricingLevelsPath = path.join(basePath, 'server/data/pricingLevels.json');
const customersPath = path.join(basePath, 'server/data/customers.json');
const ordersPath = path.join(basePath, 'server/data/orders.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const pricingLevels = JSON.parse(fs.readFileSync(pricingLevelsPath, 'utf8'));
const customers = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
const orders = fs.existsSync(ordersPath) ? JSON.parse(fs.readFileSync(ordersPath, 'utf8')) : [];

const client = new Client({ connectionString });

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');

        // 1. Create Schema
        const schemaSql = `
      CREATE TABLE IF NOT EXISTS products (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        handle text UNIQUE NOT NULL,
        name text NOT NULL,
        description text,
        category text,
        image text,
        tags text[] DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        sku text UNIQUE NOT NULL,
        name text NOT NULL,
        price numeric(10, 2) NOT NULL,
        stock integer DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS pricing_levels (
        id text PRIMARY KEY,
        name text NOT NULL,
        description text,
        prices jsonb DEFAULT '{}'::jsonb
      );

      CREATE TABLE IF NOT EXISTS customers (
        id text PRIMARY KEY,
        name text NOT NULL,
        address text,
        phone text,
        email text,
        status text DEFAULT 'pending',
        last_visit text,
        outstanding text DEFAULT '$0',
        pricing_level_id text REFERENCES pricing_levels(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        customer_id text REFERENCES customers(id) ON DELETE SET NULL,
        customer_name text,
        customer_address text,
        customer_phone text,
        customer_email text,
        pricing_level_id text REFERENCES pricing_levels(id) ON DELETE SET NULL,
        subtotal numeric(10, 2) NOT NULL,
        discount numeric(10, 2) NOT NULL,
        tax numeric(10, 2) NOT NULL,
        grand_total numeric(10, 2) NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id text REFERENCES orders(id) ON DELETE CASCADE,
        variant_sku text REFERENCES product_variants(sku) ON DELETE SET NULL,
        product_name text NOT NULL,
        variant_name text NOT NULL,
        price numeric(10, 2) NOT NULL,
        quantity integer NOT NULL
      );
    `;

        // Drop existing tables just to be sure we're starting clean during this migration script
        console.log('Dropping existing tables if any...');
        await client.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS pricing_levels CASCADE;
      DROP TABLE IF EXISTS product_variants CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
    `);

        console.log('Creating schema...');
        await client.query(schemaSql);

        // 2. Insert Pricing Levels
        console.log('Inserting pricing levels...');
        for (const level of pricingLevels) {
            await client.query(
                'INSERT INTO pricing_levels (id, name, description, prices) VALUES ($1, $2, $3, $4)',
                [level.id, level.name, level.description, JSON.stringify(level.prices || {})]
            );
        }

        // 3. Insert Customers
        console.log('Inserting customers...');
        for (const cust of customers) {
            await client.query(
                'INSERT INTO customers (id, name, address, phone, email, status, last_visit, outstanding, pricing_level_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [cust.id, cust.name, cust.address, cust.phone, cust.email, cust.status, cust.lastVisit, cust.outstanding, cust.pricingLevelId || null]
            );
        }

        // 4. Insert Products and Variants
        console.log('Inserting products and variants...');
        for (const prod of products) {
            const prodRes = await client.query(
                'INSERT INTO products (handle, name, description, category, image, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [prod.handle, prod.name, prod.description, prod.category, prod.image, prod.tags || []]
            );
            const productId = prodRes.rows[0].id;

            for (const variant of prod.variants) {
                await client.query(
                    'INSERT INTO product_variants (product_id, sku, name, price, stock) VALUES ($1, $2, $3, $4, $5)',
                    [productId, variant.sku, variant.name, variant.price, variant.stock]
                );
            }
        }

        // 5. Insert Orders and Order Items
        console.log('Inserting orders...');
        for (const order of orders) {
            await client.query(
                'INSERT INTO orders (id, customer_id, customer_name, customer_address, customer_phone, customer_email, pricing_level_id, subtotal, discount, tax, grand_total, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                [order.id, order.customerId || null, order.customerName, order.customerAddress, order.customerPhone, order.customerEmail, order.pricingLevelId || null, order.subtotal || 0, order.discount || 0, order.tax || 0, order.grandTotal || 0, order.createdAt]
            );

            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    await client.query(
                        'INSERT INTO order_items (order_id, variant_sku, product_name, variant_name, price, quantity) VALUES ($1, $2, $3, $4, $5, $6)',
                        [
                            order.id,
                            item.variant?.sku || null,
                            item.product?.name || item.product?.title || 'Unknown Product',
                            item.variant?.name || 'Default Variant',
                            item.variant?.price || 0,
                            item.quantity || 1
                        ]
                    );
                }
            }
        }

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await client.end();
    }
}

migrate();
