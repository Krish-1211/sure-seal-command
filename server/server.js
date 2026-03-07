import 'dotenv/config'; // loads .env in dev; Vercel sets env vars directly in prod
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ─── JWT Secret ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not set in environment. Using insecure default — set it in .env for production!');
}
const JWT_SECRET_FINAL = JWT_SECRET || "sure-seal-sfa-secret-2026-change-in-production";

// ─── Database ────────────────────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set. Check your .env file.');
    process.exit(1);
}
const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
});

// Verify connectivity on startup (non-fatal in serverless)
pool.query('SELECT 1').then(() => console.log('✅ Connected to Supabase PostgreSQL')).catch(err => console.error('⚠️ DB ping failed:', err.message));

// Alias so all existing code using client.query() keeps working
const client = { query: (t, v) => pool.query(t, v) };

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: "Unauthorised: No token provided" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET_FINAL);
        req.user = decoded; // { id, name, role }
        next();
    } catch {
        return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
}

// ─── Validation Helpers ───────────────────────────────────────────────────────
function validateCustomer(body) {
    const errors = [];
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
        errors.push("Customer name is required (min 2 characters)");
    }
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.push("Invalid email address format");
    }
    if (body.phone && body.phone.trim().length > 20) {
        errors.push("Phone number too long");
    }
    return errors;
}

function validateOrder(body) {
    const errors = [];
    if (!body.customerName || body.customerName.trim().length < 2) {
        errors.push("Customer name is required");
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
        errors.push("Order must contain at least one item");
    } else {
        for (const item of body.items) {
            if (!item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
                errors.push("Each item must have a valid positive integer quantity");
                break;
            }
            if (!item.variant?.sku) {
                errors.push("Each item must have a valid variant SKU");
                break;
            }
        }
    }
    if (body.grandTotal !== undefined && (isNaN(body.grandTotal) || body.grandTotal < 0)) {
        errors.push("Grand total must be a valid non-negative number");
    }
    return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES (no auth required)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/login
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const usernameLower = username.toLowerCase().trim();

        // First, try to log in as a user (salesperson/admin)
        let result = await client.query(
            'SELECT id, username, name, role, region, phone, email, password as pwd FROM users WHERE LOWER(username) = $1',
            [usernameLower]
        );

        if (result.rows.length === 0) {
            // Check if it's a customer logging in directly (Demo feature)
            const cRes = await client.query('SELECT * FROM customers WHERE (LOWER(email) = $1 AND email IS NOT NULL AND email != \'\') OR LOWER(name) = $1', [usernameLower]);
            if (cRes.rows.length > 0) {
                const customer = cRes.rows[0];
                if (password !== 'password' && password !== 'customer123') { // Generic demo password for customers
                    return res.status(401).json({ error: "Invalid credentials" });
                }
                const token = jwt.sign(
                    { id: customer.id, name: customer.name, role: 'customer', customerId: customer.id },
                    JWT_SECRET_FINAL,
                    { expiresIn: '12h' }
                );
                return res.json({
                    token,
                    user: {
                        id: customer.id,
                        username: customer.email,
                        name: customer.name,
                        role: 'customer',
                        customerId: customer.id,
                        pricingLevelId: customer.pricing_level_id,
                        address: customer.address,
                        phone: customer.phone,
                        email: customer.email
                    }
                });
            }
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.pwd);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Issue JWT — never send password hash to client
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            JWT_SECRET_FINAL,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                region: user.region,
                phone: user.phone,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/products — public (salespeople need it before auth in dev)
app.get("/api/products", async (req, res) => {
    try {
        const pRes = await client.query('SELECT * FROM products');
        const vRes = await client.query('SELECT * FROM product_variants');
        const mapped = pRes.rows.map(p => ({
            ...p,
            variants: vRes.rows.filter(v => v.product_id === p.id).map(v => ({
                ...v,
                stockStatus: v.stock_status || 'in_stock',
                stockQty: v.stock_qty ?? 100
            }))
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/pricing-levels — public (needed for Catalog price display)
app.get("/api/pricing-levels", async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM pricing_levels');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES (require valid JWT)
// ═══════════════════════════════════════════════════════════════════════════════

import multer from "multer";
import { createReadStream } from "fs";
import { unlink } from "fs/promises";

const upload = multer({ dest: '/tmp/' });

// GET /api/users — auth required
app.get("/api/users", requireAuth, async (req, res) => {
    try {
        const result = await client.query('SELECT id, username, name, role, region, phone, email, monthly_target, created_at FROM users');
        const mapped = result.rows.map(u => ({ ...u, monthlyTarget: parseFloat(u.monthly_target) || 20000 }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/customers — auth required
app.get("/api/customers", requireAuth, async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM customers');
        const mapped = result.rows.map(c => ({
            ...c,
            lastVisit: c.last_visit,
            pricingLevelId: c.pricing_level_id,
            creditLimit: parseFloat(c.credit_limit) || 5000,
            outstandingBalance: parseFloat(c.outstanding_balance) || 0
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/customers — auth required + validation
app.post("/api/customers", requireAuth, async (req, res) => {
    const errors = validateCustomer(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const id = `cust-${Date.now()}`;
        const { name, address, phone, email } = req.body;
        const result = await client.query(
            'INSERT INTO customers (id, name, address, phone, email, status, last_visit, outstanding) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, name.trim(), address?.trim() || '', phone?.trim() || '', email?.trim() || '', 'pending', 'New', '$0']
        );
        const data = result.rows[0];
        res.status(201).json({ ...data, lastVisit: data.last_visit, pricingLevelId: data.pricing_level_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/customers/:id — auth required
app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updates = [];
        const values = [];
        let i = 1;

        if (body.name !== undefined) { updates.push(`name = $${i++}`); values.push(body.name.trim()); }
        if (body.address !== undefined) { updates.push(`address = $${i++}`); values.push(body.address); }
        if (body.phone !== undefined) { updates.push(`phone = $${i++}`); values.push(body.phone); }
        if (body.email !== undefined) { updates.push(`email = $${i++}`); values.push(body.email); }
        if (body.status !== undefined) { updates.push(`status = $${i++}`); values.push(body.status); }
        if (body.lastVisit !== undefined) { updates.push(`last_visit = $${i++}`); values.push(body.lastVisit); }
        if (body.outstanding !== undefined) { updates.push(`outstanding = $${i++}`); values.push(body.outstanding); }
        if (body.pricingLevelId !== undefined) { updates.push(`pricing_level_id = $${i++}`); values.push(body.pricingLevelId); }

        if (updates.length === 0) return res.json({});

        values.push(id);
        const result = await client.query(
            `UPDATE customers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
            values
        );
        const data = result.rows[0];
        res.json(data ? { ...data, lastVisit: data.last_visit, pricingLevelId: data.pricing_level_id } : {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Pricing Levels (ADMIN ONLY for write) ────────────────────────────────────

app.post("/api/pricing-levels", requireAuth, requireAdmin, async (req, res) => {
    try {
        if (!req.body.name || req.body.name.trim().length < 1) {
            return res.status(400).json({ error: "Pricing level name is required" });
        }
        const id = `level-${Date.now()}`;
        const result = await client.query(
            'INSERT INTO pricing_levels (id, name, description, prices) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, req.body.name.trim(), req.body.description?.trim() || '', JSON.stringify(req.body.prices || {})]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/pricing-levels/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(
            'UPDATE pricing_levels SET prices = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(req.body.prices || {}), id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/pricing-levels/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'retail') return res.status(400).json({ error: "Cannot delete the Retail pricing level" });
        await client.query('DELETE FROM pricing_levels WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Promotions ───────────────────────────────────────────────────────────────

app.get("/api/promotions", async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM promotions ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/promotions", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, description, image_url, active } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const result = await client.query(
            'INSERT INTO promotions (title, description, image_url, active) VALUES ($1, $2, $3, $4) RETURNING *',
            [title.trim(), description?.trim() || '', image_url?.trim() || '', active ?? true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/promotions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, active } = req.body;
        const result = await client.query(
            'UPDATE promotions SET title = $1, description = $2, image_url = $3, active = $4 WHERE id = $5 RETURNING *',
            [title.trim(), description?.trim() || '', image_url?.trim() || '', active ?? true, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/promotions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await client.query('DELETE FROM promotions WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET /api/orders — server-side filtering by userId for salesmen (fix #4)
app.get("/api/orders", requireAuth, async (req, res) => {
    try {
        let query = `
            SELECT o.*, u.name as user_name 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id
        `;
        const values = [];

        // Salesmen only see their own orders — filter at SQL level, not client-side
        if (req.user.role === 'customer') {
            query += ` WHERE o.customer_id = $1`;
            values.push(req.user.id);
        } else if (req.user.role !== 'admin') {
            query += ` WHERE o.user_id = $1`;
            values.push(req.user.id);
        }

        query += ` ORDER BY o.created_at DESC`;

        const oRes = await client.query(query, values);

        // Fetch only relevant order_items
        const orderIds = oRes.rows.map(o => o.id);
        let items = [];
        if (orderIds.length > 0) {
            const iRes = await client.query(
                `SELECT * FROM order_items WHERE order_id = ANY($1::text[])`,
                [orderIds]
            );
            items = iRes.rows;
        }

        const mapped = oRes.rows.map(o => ({
            id: o.id,
            orderNumber: o.order_number,
            status: o.status || 'confirmed',
            lockedAt: o.locked_at,
            isLocked: o.locked_at ? new Date() > new Date(o.locked_at) : false,
            userId: o.user_id,
            userName: o.user_name || 'System',
            customerId: o.customer_id,
            customerName: o.customer_name,
            customerAddress: o.customer_address,
            customerPhone: o.customer_phone,
            customerEmail: o.customer_email,
            pricingLevelId: o.pricing_level_id,
            subtotal: parseFloat(o.subtotal) || 0,
            discount: parseFloat(o.discount) || 0,
            tax: parseFloat(o.tax) || 0,
            grandTotal: parseFloat(o.grand_total) || 0,
            createdAt: o.created_at,
            items: items.filter(i => i.order_id === o.id).map(i => ({
                variant: { sku: i.variant_sku, name: i.variant_name, price: parseFloat(i.price) },
                product: { name: i.product_name },
                quantity: i.quantity
            }))
        }));

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders — auth required + validation + UUID ID
app.post("/api/orders", requireAuth, async (req, res) => {
    const errors = validateOrder(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const o = req.body;

        // Use gen_random_uuid() from PostgreSQL — no more timestamp IDs
        const orderRes = await client.query(
            `INSERT INTO orders 
            (id, order_number, customer_id, customer_name, customer_address, customer_phone, customer_email, pricing_level_id, subtotal, discount, tax, grand_total, user_id) 
            VALUES (gen_random_uuid()::text, nextval('order_number_seq'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, order_number`,
            [
                o.customerId || null,
                o.customerName.trim(),
                o.customerAddress?.trim() || null,
                o.customerPhone?.trim() || null,
                o.customerEmail?.trim() || null,
                o.pricingLevelId || null,
                o.subtotal || 0,
                o.discount || 0,
                o.tax || 0,
                o.grandTotal || 0,
                req.user.id  // always use the authenticated user's ID from JWT, not req.body
            ]
        );

        const orderId = orderRes.rows[0].id;

        for (const item of o.items) {
            await client.query(
                'INSERT INTO order_items (order_id, variant_sku, product_name, variant_name, price, quantity) VALUES ($1, $2, $3, $4, $5, $6)',
                [
                    orderId,
                    item.variant?.sku || null,
                    item.product?.name || 'Unknown',
                    item.variant?.name || 'Default',
                    parseFloat(item.variant?.price) || 0,
                    Math.max(1, parseInt(item.quantity) || 1)
                ]
            );
        }

        res.status(201).json({ id: orderId, orderNumber: orderRes.rows[0].order_number });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Feature 3: Cancel / Status update for orders ────────────────────────────
app.patch("/api/orders/:id/cancel", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const orderRes = await client.query('SELECT user_id, locked_at, status FROM orders WHERE id = $1', [id]);
        if (!orderRes.rows.length) return res.status(404).json({ error: 'Order not found' });
        const order = orderRes.rows[0];
        if (req.user.role !== 'admin' && order.user_id !== req.user.id)
            return res.status(403).json({ error: 'Forbidden' });
        if (order.status === 'cancelled')
            return res.status(400).json({ error: 'Order is already cancelled' });
        const isLocked = order.locked_at && new Date() > new Date(order.locked_at);
        if (isLocked && req.user.role !== 'admin')
            return res.status(400).json({ error: 'Cancellation window has passed (15 minutes). Contact admin.' });
        await client.query('UPDATE orders SET status = $1 WHERE id = $2', ['cancelled', id]);
        res.json({ success: true, status: 'cancelled' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Feature 2: Draft Orders ──────────────────────────────────────────────────
app.get("/api/drafts", requireAuth, async (req, res) => {
    try {
        const result = await client.query(
            'SELECT * FROM draft_orders WHERE user_id = $1 ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/drafts", requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const id = `draft-${Date.now()}`;
        const result = await client.query(
            `INSERT INTO draft_orders (id, user_id, customer_id, customer_name, customer_address, customer_phone, customer_email, pricing_level_id, items, discount_pct, subtotal, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [id, req.user.id, d.customerId || null, d.customerName || null, d.customerAddress || null,
                d.customerPhone || null, d.customerEmail || null, d.pricingLevelId || null,
                JSON.stringify(d.items || []), d.discountPct || 5, d.subtotal || 0, d.notes || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/drafts/:id", requireAuth, async (req, res) => {
    try {
        await client.query('DELETE FROM draft_orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Feature 6: Messages ─────────────────────────────────────────────────────
app.get("/api/messages", requireAuth, async (req, res) => {
    try {
        const result = await client.query(
            `SELECT m.*, u.name as from_name FROM messages m
             LEFT JOIN users u ON m.from_user_id = u.id
             WHERE m.to_user_id = $1 OR m.from_user_id = $1
             ORDER BY m.created_at DESC LIMIT 50`,
            [req.user.id]
        );
        res.json(result.rows.map(m => ({
            id: m.id, body: m.body, isRead: m.is_read,
            fromUserId: m.from_user_id, fromName: m.from_name,
            toUserId: m.to_user_id, createdAt: m.created_at
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/messages", requireAuth, async (req, res) => {
    try {
        const { toUserId, body } = req.body;
        if (!toUserId || !body?.trim()) return res.status(400).json({ error: 'toUserId and body are required' });
        const result = await client.query(
            'INSERT INTO messages (from_user_id, to_user_id, body) VALUES ($1,$2,$3) RETURNING *',
            [req.user.id, toUserId, body.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
        await client.query('UPDATE messages SET is_read = true WHERE id = $1 AND to_user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Feature 8: Update user target (admin only) ───────────────────────────────
app.patch("/api/users/:id/target", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { monthlyTarget } = req.body;
        if (isNaN(monthlyTarget) || monthlyTarget < 0) return res.status(400).json({ error: 'Invalid target amount' });
        const result = await client.query(
            'UPDATE users SET monthly_target = $1 WHERE id = $2 RETURNING id, name, monthly_target',
            [monthlyTarget, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Feature 12: Bulk CSV Pricing Import ─────────────────────────────────────
app.post("/api/pricing-levels/:id/import-csv", requireAuth, requireAdmin, upload.single('csv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'CSV file required' });
        const fs = await import('fs');
        const content = fs.readFileSync(req.file.path, 'utf8');
        await unlink(req.file.path).catch(() => { });
        // Parse CSV: expect format sku,price per line
        const lines = content.split('\n').filter(l => l.trim());
        const prices = {};
        const errors = [];
        for (const line of lines) {
            const [sku, priceRaw] = line.split(',').map(s => s.trim());
            if (!sku || !priceRaw) { errors.push(`Skipped invalid row: ${line}`); continue; }
            const price = parseFloat(priceRaw);
            if (isNaN(price) || price < 0) { errors.push(`Invalid price for SKU ${sku}: ${priceRaw}`); continue; }
            prices[sku] = price;
        }
        // Get existing prices and merge
        const existing = await client.query('SELECT prices FROM pricing_levels WHERE id = $1', [req.params.id]);
        const merged = { ...(existing.rows[0]?.prices || {}), ...prices };
        await client.query('UPDATE pricing_levels SET prices = $1 WHERE id = $2', [JSON.stringify(merged), req.params.id]);
        res.json({ imported: Object.keys(prices).length, errors, total: Object.keys(merged).length });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Feature 9: Reorder — handled client-side ────────────────────────────────

// ─── GPS Location – salesman heartbeat ───────────────────────────────────────
app.post("/api/location", requireAuth, async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (lat == null || lng == null) return res.status(400).json({ error: 'lat/lng required' });
        await client.query(
            `UPDATE users SET last_lat=$1, last_lng=$2, location_updated_at=now() WHERE id=$3`,
            [lat, lng, req.user.id]
        );
        res.json({ ok: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GPS Fleet – admin sees all reps ─────────────────────────────────────────
app.get("/api/fleet", requireAuth, requireAdmin, async (req, res) => {
    try {
        const result = await client.query(
            `SELECT id, name, email, last_lat, last_lng, location_updated_at
             FROM users WHERE role='salesman' AND last_lat IS NOT NULL`
        );
        res.json(result.rows.map(r => ({
            id: r.id, name: r.name, email: r.email,
            lat: parseFloat(r.last_lat), lng: parseFloat(r.last_lng),
            updatedAt: r.location_updated_at
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Feature 7: Check-ins (with optional photo) ──────────────────────────────

app.get("/api/check-ins", requireAuth, async (req, res) => {
    try {
        let query = `
            SELECT c.*, u.name as user_name
            FROM check_ins c LEFT JOIN users u ON c.user_id = u.id
        `;
        const values = [];
        if (req.user.role !== 'admin') {
            query += ` WHERE c.user_id = $1`;
            values.push(req.user.id);
        }
        query += ` ORDER BY c.created_at DESC LIMIT 100`;
        const result = await client.query(query, values);
        res.json(result.rows.map(r => ({
            id: r.id, userId: r.user_id, userName: r.user_name,
            customerId: r.customer_id, customerName: r.customer_name,
            notes: r.notes, hasPhoto: !!r.photo_data,
            photoData: r.photo_data, createdAt: r.created_at
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/check-ins", requireAuth, async (req, res) => {
    try {
        const { customerId, customerName, notes, photoData } = req.body;
        if (!customerName) return res.status(400).json({ error: 'customerName is required' });
        const result = await client.query(
            `INSERT INTO check_ins (user_id, customer_id, customer_name, notes, photo_data)
             VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
            [req.user.id, customerId || null, customerName, notes || null, photoData || null]
        );
        // Update last_visit on the customer
        if (customerId) {
            await client.query(
                `UPDATE customers SET last_visit = now() WHERE id = $1`,
                [customerId]
            );
        }
        res.status(201).json({
            id: result.rows[0].id,
            createdAt: result.rows[0].created_at,
            message: 'Check-in recorded'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ─── Static serving (production) ─────────────────────────────────────────────
if (!process.env.VERCEL) {
    const frontendBuildPath = path.join(__dirname, "../dist");
    app.use(express.static(frontendBuildPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
}

// ─── Start server (not in Vercel serverless) ─────────────────────────────────
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

export default app;
