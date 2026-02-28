import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store using JSON files for persistence
let products = [];
let customers = [];
let orders = [];

const dataDir = path.join(__dirname, "data");
const productsFile = path.join(dataDir, "products.json");
const customersFile = path.join(dataDir, "customers.json");
const ordersFile = path.join(dataDir, "orders.json");

// Define a safe reader for JSON files
const safelyReadJsonFile = (filePath, defaultVal) => {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
    return defaultVal;
};

// Define a safe writer for JSON files
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
    }
};

// Initialize DB
products = safelyReadJsonFile(productsFile, []);
customers = safelyReadJsonFile(customersFile, []);
orders = safelyReadJsonFile(ordersFile, []);

// Seed customers if empty
if (customers.length === 0) {
    customers = [
        { name: "Victoria's Paint & Tile", address: "501 Williamstown Rd, Port Melbourne", phone: "+61 400 000 001", status: "pending", lastVisit: "2 days ago", outstanding: "$12,400" },
        { name: "Sydney Stone Supplies", address: "15 Artarmon Rd, Artarmon", phone: "+61 400 000 002", status: "visited", lastVisit: "Today", outstanding: "$0" },
        { name: "Gold Coast Tilings", address: "78 Ferry Rd, Southport", phone: "+61 400 000 003", status: "overdue", lastVisit: "8 days ago", outstanding: "$28,750" },
        { name: "Sunshine Coast Hardware", address: "23 Maroochydore Rd, Maroochydore", phone: "+61 400 000 004", status: "pending", lastVisit: "3 days ago", outstanding: "$5,200" },
        { name: "Adelaide Adhesive Depot", address: "91 Port Rd, Hindmarsh", phone: "+61 400 000 005", status: "visited", lastVisit: "Today", outstanding: "$1,800" },
        { name: "National Tile & Stone", address: "56 Parramatta Rd, Lidcombe", phone: "+61 400 000 006", status: "overdue", lastVisit: "12 days ago", outstanding: "$45,300" }
    ];
    writeJsonFile(customersFile, customers);
}

// API Routes
app.get("/api/products", (req, res) => {
    res.json(products);
});

app.get("/api/customers", (req, res) => {
    res.json(customers);
});

app.get("/api/orders", (req, res) => {
    res.json(orders);
});

app.post("/api/orders", (req, res) => {
    const order = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };

    orders.push(order);
    writeJsonFile(ordersFile, orders);

    // Simple mock stock reduction
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            const product = products.find(p => p.handle === item.product.handle);
            if (product) {
                const variant = product.variants.find(v => v.sku === item.variant.sku);
                if (variant) {
                    variant.stock = Math.max(0, variant.stock - item.quantity); // Deduct stock
                }
            }
        });
        writeJsonFile(productsFile, products); // Save back to disk
    }

    res.status(201).json(order);
});

// Serve frontend static files in production
const frontendBuildPath = path.join(__dirname, "../dist");
app.use(express.static(frontendBuildPath));
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// App initialization
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
