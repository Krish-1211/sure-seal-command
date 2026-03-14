import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal, Loader2, Tag } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/products";
import { useCustomer } from "@/contexts/CustomerContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiFetch";

import { getDB } from "@/lib/db";

const Catalog = () => {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!navigator.onLine) {
        const db = await getDB();
        return await db.getAll('products');
      }
      try {
        const res = await apiFetch('/api/products');
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      } catch (err) {
        const db = await getDB();
        return await db.getAll('products');
      }
    }
  });

  const { user } = useAuth();
  const { pricingLevels, selectedPricingLevelId, setSelectedPricingLevelId, getAdjustedPrice } = useCustomer();

  const categories = useMemo(() => {
    const types = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...types];
  }, [products]);

  // Apply pricing level to products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).map(p => {
      const adjustedVariants = (p.variants || []).map((v: any) => ({
        ...v,
        price: getAdjustedPrice(v.sku, v.price),
        stockStatus: v.stockStatus || v.stock_status || 'in_stock',
        stockQty: v.stockQty ?? v.stock_qty ?? 100
      }));
      return { ...p, variants: adjustedVariants };
    });
  }, [category, searchQuery, products, selectedPricingLevelId, pricingLevels]);

  const currentLevel = pricingLevels.find((l: any) => l.id === selectedPricingLevelId);

  return (
    <MobileLayout>
      <header className="bg-card border-b border-border px-5 pt-6 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-heading font-bold text-foreground">Catalog</h1>
        </div>

        {/* Pricing Level Selector */}
        {user?.role !== "customer" && (
          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-muted/60 border border-border/50">
            <Tag className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground shrink-0">Price Level</span>
            <select
              value={selectedPricingLevelId}
              onChange={(e) => setSelectedPricingLevelId(e.target.value)}
              className="flex-1 h-7 px-2 rounded-md bg-card border border-border text-xs font-heading font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            >
              {pricingLevels.map((level: any) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg bg-muted pl-9 pr-3 text-sm font-body text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-[10px] font-body font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors ${category === c
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>
      <div className="px-4 py-3 md:px-6 md:py-6 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin opacity-20 mb-2" />
            <p className="text-sm">Loading products...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.handle} {...p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Catalog;
