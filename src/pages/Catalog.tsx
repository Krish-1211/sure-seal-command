import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal, Scan, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/products";

const Catalog = () => {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    }
  });

  const categories = useMemo(() => {
    const types = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...types];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, searchQuery, products]);


  return (
    <MobileLayout>
      <header className="bg-card border-b border-border px-5 pt-6 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-heading font-bold text-foreground">Catalog</h1>
          <button className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <Scan className="h-4 w-4" />
          </button>
        </div>
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
