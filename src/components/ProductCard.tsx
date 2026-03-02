import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard(product: Product) {
  const { name, category, image, variants } = product;
  const { cart, addToCart, updateQuantity } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const selectedVariant = variants[selectedVariantIndex] as any;
  const cartItem = cart.find(item => item.variant.sku === selectedVariant.sku);
  const quantity = cartItem ? cartItem.quantity : 0;

  const stockStatus: string = selectedVariant.stockStatus || selectedVariant.stock_status || 'in_stock';
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isLowStock = stockStatus === 'low_stock';

  const handleIncrement = () => {
    if (isOutOfStock) {
      toast.error(`${name} is currently out of stock`);
      return;
    }
    if (quantity === 0) {
      addToCart(product, selectedVariant, 1);
      toast.success(`Added ${name} to order`);
    } else {
      updateQuantity(selectedVariant.sku, 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(selectedVariant.sku, -1);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/40 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group h-full">
      <div className="h-[200px] xl:h-[240px] w-full bg-white flex items-center justify-center border-b border-border/10 relative overflow-hidden p-2 md:p-4">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
            <span className="text-2xl font-heading font-bold text-muted-foreground/30">SS</span>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <p className="text-[10px] max-md:text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">{category}</p>
        <h4 className="text-sm md:text-base font-heading font-bold text-foreground leading-snug line-clamp-3 mb-3">{name}</h4>

        <div className="mt-auto">
          {variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {variants.map((v, idx) => (
                <button
                  key={v.sku}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`text-[10px] md:text-sm font-medium px-2.5 py-1 rounded-md border transition-all ${selectedVariantIndex === idx
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <p className="text-lg md:text-xl font-heading font-bold text-foreground tracking-tight">
              {isOutOfStock ? <span className="text-muted-foreground/50 line-through text-base">{formatCurrency(selectedVariant.price)}</span> : formatCurrency(selectedVariant.price)}
            </p>
            <span className={`text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full ${isOutOfStock ? 'bg-destructive/10 text-destructive' :
                isLowStock ? 'bg-accent/10 text-accent' :
                  'bg-success/15 text-success'
              }`}>
              {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock (${selectedVariant.stockQty ?? '< 10'})` : 'In Stock'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDecrement}
              className={`h-10 w-10 md:h-12 md:w-12 rounded-lg border flex items-center justify-center transition-all ${quantity > 0
                ? "border-border text-foreground hover:bg-muted active:scale-95"
                : "border-border/40 text-muted-foreground/30"
                }`}
              disabled={quantity === 0}
            >
              <Minus className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <span className="text-base md:text-xl font-heading font-bold text-foreground w-8 text-center">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={isOutOfStock}
              className={`h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center shadow-sm active:scale-95 transition-all ${isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/95'
                }`}
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
