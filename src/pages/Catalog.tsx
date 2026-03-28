import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal, Loader2, Tag, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalog } from "@/hooks/useCatalog";
import { memo } from "react";

// --- Sub-components (could later be moved to common components or pages/Catalog/components) ---

const PricingSelector = memo(({ selectedLevelId, pricingLevels, onSelect }: any) => (
  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-muted/60 border border-border/50">
    <Tag className="h-4 w-4 text-primary shrink-0" />
    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground shrink-0">Price Level</span>
    <select
      value={selectedLevelId}
      onChange={(e) => onSelect(e.target.value)}
      className="flex-1 h-7 px-2 rounded-md bg-card border border-border text-xs font-heading font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/40"
    >
      {pricingLevels.map((level: any) => (
        <option key={level.id} value={level.id}>{level.name}</option>
      ))}
    </select>
  </div>
));

const CategoryTabs = memo(({ categories, currentCategory, onSelect }: any) => (
  <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar scroll-smooth">
    {categories.map((c: string) => (
      <button
        key={c}
        onClick={() => onSelect(c)}
        className={`text-[10px] font-body font-medium px-3 py-1 rounded-full whitespace-nowrap transition-all duration-200 ${
          currentCategory === c
            ? "bg-primary text-primary-foreground shadow-sm scale-105"
            : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
        }`}
      >
        {c}
      </button>
    ))}
  </div>
));

const SearchBar = memo(({ query, onChange }: any) => (
  <div className="flex gap-2">
    <div className="relative flex-1 group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg bg-muted pl-9 pr-3 text-sm font-body text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
    <button className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground transition-all">
      <SlidersHorizontal className="h-4 w-4" />
    </button>
  </div>
));

// --- Main Component ---

const Catalog = () => {
  const { user } = useAuth();
  const {
    category, setCategory,
    searchQuery, setSearchQuery,
    isLoading,
    categories,
    filteredProducts,
    pricingLevels,
    selectedPricingLevelId,
    setSelectedPricingLevelId
  } = useCatalog();

  return (
    <MobileLayout>
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-5 pt-6 pb-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Catalog
          </h1>
        </div>

        {/* Visibility based on role - typically admin/sales rep task */}
        {user?.role !== "customer" && (
          <PricingSelector 
            selectedLevelId={selectedPricingLevelId}
            pricingLevels={pricingLevels}
            onSelect={setSelectedPricingLevelId}
          />
        )}

        <SearchBar 
          query={searchQuery}
          onChange={setSearchQuery}
        />

        <CategoryTabs 
          categories={categories}
          currentCategory={category}
          onSelect={setCategory}
        />
      </header>

      <main className="px-4 py-5 md:px-6 md:py-6 max-w-7xl mx-auto min-h-[60vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/60">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-sm font-medium animate-pulse">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {filteredProducts.map((p) => (
              <ProductCard key={p.handle} {...p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/40 bg-muted/5 rounded-3xl border-2 border-dashed border-border/60 mx-2">
            <Search className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground/80">Nothing here!</h3>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default Catalog;
