const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server', 'server.js');
let content = fs.readFileSync(serverFile, 'utf8');

const oldLogin = `        const result = await client.query(
            'SELECT id, username, name, role, region, phone, email, password as pwd FROM users WHERE username = $1',
            [username.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }`;

const newLogin = `        const result = await client.query(
            'SELECT id, username, name, role, region, phone, email, password as pwd FROM users WHERE username = $1',
            [username.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            // Check if it's a customer logging in directly (Demo feature)
            const cRes = await client.query('SELECT * FROM customers WHERE LOWER(email) = $1 AND email IS NOT NULL AND email != \\'\\'', [username.toLowerCase().trim()]);
            if (cRes.rows.length > 0) {
                const customer = cRes.rows[0];
                if (password !== 'password') { // Generic demo password for customers
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
        }`;

content = content.replace(oldLogin, newLogin);
fs.writeFileSync(serverFile, content);
console.log("Updated server.js");
