import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/products";
import { ProductService } from "@/services/product.service";
import { useCustomer } from "@/contexts/CustomerContext";

export function useCatalog() {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => ProductService.getProducts(),
  });

  const { pricingLevels, selectedPricingLevelId, setSelectedPricingLevelId, getAdjustedPrice } = useCustomer();

  const categories = useMemo(() => {
    const types = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...types];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = category === "All" || p.category === category;
        const matchesSearch = 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .map(p => {
        const adjustedVariants = (p.variants || []).map((v: any) => ({
          ...v,
          price: getAdjustedPrice(v.sku, v.price),
          stockStatus: v.stockStatus || v.stock_status || 'in_stock',
          stockQty: v.stockQty ?? v.stock_qty ?? 100
        }));
        return { ...p, variants: adjustedVariants };
      });
  }, [category, searchQuery, products, selectedPricingLevelId, getAdjustedPrice]);

  return {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    products,
    isLoading,
    error,
    categories,
    filteredProducts,
    pricingLevels,
    selectedPricingLevelId,
    setSelectedPricingLevelId
  };
}
