import { Product } from "@/lib/products";
import { apiFetch } from "@/lib/apiFetch";
import { getDB } from "@/lib/db";

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    if (!navigator.onLine) {
      const db = await getDB();
      return await db.getAll('products');
    }
    
    try {
      const res = await apiFetch('/api/products');
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    } catch (err) {
      console.warn("Product fetch failed, falling back to local DB", err);
      const db = await getDB();
      return await db.getAll('products');
    }
  }
}
