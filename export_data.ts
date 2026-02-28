import fs from "fs";
import { products } from "./src/lib/products.ts";

// Simple script to export TS data array to JSON for backend
fs.writeFileSync("./server/data/products.json", JSON.stringify(products, null, 2));
console.log("Successfully exported products data to JSON for the backend!");
