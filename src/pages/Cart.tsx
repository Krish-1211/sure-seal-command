import { MobileLayout } from "@/components/layout/MobileLayout";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon, FileText, Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncIndicator } from "@/components/SyncIndicator";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discount = Math.round(subtotal * 0.05 * 100) / 100;
  const tax = Math.round((subtotal - discount) * 0.10 * 100) / 100;
  const grandTotal = subtotal - discount + tax;

  const submitOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, subtotal, discount, tax, grandTotal })
      });
      if (!res.ok) throw new Error("Order creation failed");

      toast.success("Order submitted successfully!");
      clearCart();
    } catch (error) {
      toast.error("Failed to submit order.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <header className="bg-card border-b border-border px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-heading font-bold text-foreground">Cart ({totalItems})</h1>
          <div className="flex items-center gap-3">
            <SyncIndicator status="synced" />
            <span className="text-xs font-body text-muted-foreground">
              Bunnings Port Melbourne
            </span>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 space-y-2">
        {cart.length === 0 ? (
          <div className="bg-card rounded-lg p-10 shadow-card flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-heading font-bold text-foreground">Your cart is empty</h3>
            <p className="text-xs text-muted-foreground font-body mt-1">Start adding products from the catalog to take an order.</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            {cart.map((item) => (
              <div key={item.variant.sku} className="bg-card rounded-lg p-4 shadow-card animate-slide-up">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-heading font-bold text-foreground">{item.product.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-body">{item.variant.name} · {formatCurrency(item.variant.price)}/unit</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.variant.sku)}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variant.sku, -1)}
                      className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-heading font-bold text-foreground w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant.sku, 1)}
                      className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm font-heading font-bold text-foreground">{formatCurrency(item.variant.price * item.quantity)}</p>
                </div>
              </div>
            ))}

            {/* Price Breakdown */}
            <div className="bg-card rounded-lg p-4 shadow-card">
              <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-success">Volume Discount (5%)</span>
                  <span className="text-success">-{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">GST (10%)</span>
                  <span className="text-foreground">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-heading font-bold border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Grand Total</span>
                  <span className="text-foreground">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pb-4">
              <Button
                onClick={submitOrder}
                disabled={isSubmitting}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-heading font-bold text-sm"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {isSubmitting ? "Processing..." : "Finalize & Get Signature"}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10 gap-2 text-xs font-heading font-semibold">
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="h-10 gap-2 text-xs font-heading font-semibold">
                  <Send className="h-3.5 w-3.5" />
                  Email
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default Cart;
