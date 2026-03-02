import { MobileLayout } from "@/components/layout/MobileLayout";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon, FileText, Send, MessageSquare, Loader2, Search, UserPlus, CheckCircle2, ChevronDown, X, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncIndicator } from "@/components/SyncIndicator";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CustomerData {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

const Cart = () => {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems, clearCart } = useCart();
  const { selectedCustomer, setSelectedCustomer, selectedPricingLevelId, pricingLevels, setSelectedPricingLevelId } = useCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState(5); // adjustable discount %
  const queryClient = useQueryClient();

  // Customer selection states
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState<CustomerData>({ name: "", address: "", phone: "", email: "" });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiFetch('/api/customers');
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  const filteredCustomers = customers.filter((c: any) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.address?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const discount = Math.round(subtotal * (discountPct / 100) * 100) / 100;
  const tax = Math.round((subtotal - discount) * 0.10 * 100) / 100;
  const grandTotal = subtotal - discount + tax;

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    // Auto-apply the customer's assigned pricing level (fix for Issue #7)
    if (customer.pricingLevelId) {
      setSelectedPricingLevelId(customer.pricingLevelId);
      toast.success(`Selected ${customer.name} — pricing set to ${customer.pricingLevelId}`);
    } else {
      toast.success(`Selected ${customer.name}`);
    }
    setShowCustomerPicker(false);
    setCustomerSearch("");
  };

  const handleCreateAndSelect = async () => {
    if (!newCustomerForm.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    try {
      const res = await apiFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomerForm)
      });
      if (!res.ok) throw new Error("Failed to create customer");
      const created = await res.json();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedCustomer(created);
      setShowCustomerPicker(false);
      setIsNewCustomer(false);
      setNewCustomerForm({ name: "", address: "", phone: "", email: "" });
      toast.success(`Created & selected ${created.name}`);
    } catch (err) {
      toast.error("Failed to create customer");
    }
  };

  const submitOrder = async () => {
    if (!selectedCustomer) {
      setShowCustomerPicker(true);
      toast.error("Please select a customer first");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart,
          subtotal,
          discount,
          discountPct,
          tax,
          grandTotal,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          customerAddress: selectedCustomer.address,
          customerPhone: selectedCustomer.phone,
          customerEmail: selectedCustomer.email,
          pricingLevelId: selectedPricingLevelId
          // userId is read from JWT on the server — never trust client-supplied userId
        })
      });
      if (!res.ok) throw new Error("Order creation failed");

      const result = await res.json();
      toast.success(`Order #${result.orderNumber} submitted successfully!`);
      clearCart();
      setSelectedCustomer(null);
      setShowConfirm(false);
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
            <span className="text-[10px] font-body text-primary font-semibold">
              {pricingLevels.find((l: any) => l.id === selectedPricingLevelId)?.name || "Retail"} Pricing
            </span>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 space-y-2">

        {/* Customer Selection Card */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <h3 className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-3">Customer for this Order</h3>

          {selectedCustomer ? (
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-bold text-foreground truncate">{selectedCustomer.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedCustomer.address}</p>
                {selectedCustomer.phone && <p className="text-[10px] text-muted-foreground">{selectedCustomer.phone}</p>}
                {selectedCustomer.email && <p className="text-[10px] text-muted-foreground">{selectedCustomer.email}</p>}
              </div>
              <button
                onClick={() => setShowCustomerPicker(true)}
                className="text-[10px] font-heading font-bold text-primary hover:underline shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerPicker(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-heading font-bold text-foreground">Select or Add Customer</p>
                <p className="text-[10px] text-muted-foreground">Tap to choose who this order is for</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
            </button>
          )}
        </div>

        {/* Customer Picker Modal */}
        {showCustomerPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
            <div className="bg-card w-full max-w-lg rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50">
                <h2 className="text-base font-heading font-black text-foreground">
                  {isNewCustomer ? "New Customer" : "Select Customer"}
                </h2>
                <button
                  onClick={() => { setShowCustomerPicker(false); setIsNewCustomer(false); }}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isNewCustomer ? (
                /* New Customer Form */
                <div className="px-5 py-4 space-y-3 flex-1 overflow-y-auto">
                  <div>
                    <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Business Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Melbourne Tiles & Stone"
                      value={newCustomerForm.name}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-muted text-sm font-body border-0 outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Address</label>
                    <input
                      type="text"
                      placeholder="Full street address"
                      value={newCustomerForm.address}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-muted text-sm font-body border-0 outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Phone</label>
                    <input
                      type="tel"
                      placeholder="+61 400 000 000"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-muted text-sm font-body border-0 outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                    <input
                      type="email"
                      placeholder="business@example.com"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-muted text-sm font-body border-0 outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={handleCreateAndSelect}
                      className="w-full h-12 bg-accent text-accent-foreground font-heading font-bold gap-2"
                      disabled={!newCustomerForm.name.trim()}
                    >
                      <UserPlus className="h-4 w-4" /> Create & Select Customer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewCustomer(false)}
                      className="w-full h-10 text-xs font-heading font-semibold"
                    >
                      Back to Existing Customers
                    </Button>
                  </div>
                </div>
              ) : (
                /* Existing Customer Search */
                <>
                  <div className="px-5 pt-3 pb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full h-10 rounded-lg bg-muted pl-9 pr-3 text-sm font-body border-0 outline-none focus:ring-2 focus:ring-primary/40"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 pb-3">
                    {/* New Customer Button */}
                    <button
                      onClick={() => setIsNewCustomer(true)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 transition-colors mb-1 border border-dashed border-primary/30"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-heading font-bold text-primary">Add New Customer</p>
                        <p className="text-[10px] text-muted-foreground">Create a new customer record</p>
                      </div>
                    </button>

                    {/* Customer List */}
                    {filteredCustomers.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">No customers found</p>
                      </div>
                    ) : (
                      filteredCustomers.map((c: any) => (
                        <button
                          key={c.id || c.name}
                          onClick={() => handleSelectCustomer(c)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors ${selectedCustomer?.id === c.id ? 'bg-success/5 ring-1 ring-success/30' : ''}`}
                        >
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 font-heading font-bold text-xs">
                            {c.name?.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-heading font-bold text-foreground truncate">{c.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{c.address}</span>
                            </div>
                          </div>
                          {selectedCustomer?.id === c.id && (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
                {/* Adjustable Discount */}
                <div className="flex items-center justify-between text-sm font-body">
                  <div className="flex items-center gap-2">
                    <span className="text-success">Discount</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDiscountPct(Math.max(0, discountPct - 1))}
                        className="h-5 w-5 rounded bg-muted text-muted-foreground hover:bg-muted/70 flex items-center justify-center text-xs font-bold"
                      >−</button>
                      <span className="text-success font-bold text-xs w-8 text-center">{discountPct}%</span>
                      <button
                        onClick={() => setDiscountPct(Math.min(50, discountPct + 1))}
                        className="h-5 w-5 rounded bg-muted text-muted-foreground hover:bg-muted/70 flex items-center justify-center text-xs font-bold"
                      >+</button>
                    </div>
                  </div>
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
                onClick={() => {
                  if (!selectedCustomer) {
                    setShowCustomerPicker(true);
                    toast.error("Please select a customer first");
                    return;
                  }
                  // Feature 11: Credit limit warning
                  const outstanding = selectedCustomer.outstandingBalance || selectedCustomer.outstanding_balance || 0;
                  const limit = selectedCustomer.creditLimit || selectedCustomer.credit_limit || 5000;
                  if (outstanding + grandTotal > limit) {
                    setCreditWarning(`⚠️ This order will exceed ${selectedCustomer.name}'s credit limit of $${limit.toFixed(2)} (current balance: $${outstanding.toFixed(2)})`);
                  } else {
                    setCreditWarning(null);
                  }
                  setShowConfirm(true);
                }}
                disabled={isSubmitting}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-heading font-bold text-sm"
              >
                <FileText className="h-4 w-4" />
                {selectedCustomer ? "Review & Submit Order" : "Select Customer to Continue"}
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

            {/* ─── Confirmation Modal ───────────────────────────────── */}
            {showConfirm && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-fade-in">
                <div className="bg-card w-full max-w-lg rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up shadow-2xl">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-accent" />
                      <h2 className="text-base font-heading font-black text-foreground">Confirm Order</h2>
                    </div>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Credit Limit Warning (Feature 11) */}
                    {creditWarning && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-xs text-destructive font-medium leading-snug">{creditWarning}</p>
                      </div>
                    )}

                    {/* Customer Summary */}
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                      <p className="font-heading font-bold text-sm text-foreground">{selectedCustomer?.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer?.address}</p>
                    </div>

                    {/* Pricing Level */}
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Pricing Level</p>
                      <p className="font-heading font-bold text-sm text-foreground">
                        {pricingLevels.find((l: any) => l.id === selectedPricingLevelId)?.name || "Retail"}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Items ({totalItems})</p>
                      <div className="space-y-1">
                        {cart.map((item) => (
                          <div key={item.variant.sku} className="flex justify-between text-xs py-1 border-b border-border/30">
                            <span className="text-foreground">{item.quantity}× {item.product.name} <span className="text-muted-foreground">({item.variant.name})</span></span>
                            <span className="font-bold text-foreground">{formatCurrency(item.variant.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-success">
                        <span>Discount ({discountPct}%)</span><span>-{formatCurrency(discount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>GST (10%)</span><span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-heading font-black text-foreground border-t border-border pt-1.5 mt-1">
                        <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-2 border-t border-border/50">
                    <Button
                      onClick={submitOrder}
                      disabled={isSubmitting}
                      className="w-full h-12 bg-accent text-accent-foreground font-heading font-bold gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      {isSubmitting ? "Submitting..." : "Confirm & Submit Order"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      className="w-full h-10 font-heading font-semibold text-sm"
                    >
                      Go Back & Edit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default Cart;
