import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Package, Search, Calendar, Filter, Loader2, RotateCcw, XCircle, Clock, Lock, FileDown, AlertTriangle } from "lucide-react";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiFetch";
import { useCart } from "@/contexts/CartContext";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useCustomer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/products";

const formatCurrency = (val: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(val);

export default function OrderHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loadCart } = useCart();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { getAdjustedPrice } = useCustomer();
    const [pendingReorder, setPendingReorder] = useState<{ items: any[], diffs: any[] } | null>(null);

    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await apiFetch('/api/products');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const { data: ordersData = { data: [] }, isLoading } = useQuery({
        queryKey: ['orders-history'],
        queryFn: async () => {
            const res = await apiFetch('/api/orders?limit=100');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });
    
    const orders = Array.isArray(ordersData) ? ordersData : (ordersData.data || []);

    // Server already filters by role via JWT — this is an extra client-side safety check
    const filteredOrders = orders.filter((o: any) => {
        const matchesRole = user?.role === 'admin'
            || (user?.role === 'customer' && o.customerId === user?.id)
            || (user?.role === 'salesman' && o.userId === user?.id);

        if (!search) return matchesRole;
        const q = search.toLowerCase();
        return matchesRole && (
            String(o.orderNumber).includes(q) ||
            o.customerName?.toLowerCase().includes(q) ||
            o.items?.some((i: any) => i.product?.name?.toLowerCase().includes(q))
        );
    });

    const cancelMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const res = await apiFetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            return data;
        },
        onSuccess: () => {
            toast.success("Order cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ['orders-history'] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    // Feature 6.6: Reorder Price Handling
    const handleReorder = (order: any) => {
        const diffs: any[] = [];
        const cartItems = order.items?.map((item: any) => {
            const sku = item.variant?.sku;
            // Find current base price from products list
            const productMatch = products.find(p => p.variants.some(v => v.sku === sku));
            const variantMatch = productMatch?.variants.find(v => v.sku === sku);
            const basePrice = (variantMatch as any)?.price ?? item.variant?.price;
            
            const currentPrice = getAdjustedPrice(sku, basePrice);
            const oldPrice = item.variant?.price;

            if (Math.abs(currentPrice - oldPrice) > 0.01) {
                diffs.push({
                    name: item.product?.name || 'Unknown',
                    old: oldPrice,
                    new: currentPrice
                });
            }

            return {
                product: { id: sku, name: item.product?.name || 'Unknown Product', category: '', description: '' },
                variant: {
                    sku,
                    name: item.variant?.name || 'Default',
                    price: currentPrice, // Apply current price
                    product_id: ''
                },
                quantity: item.quantity
            };
        }) || [];

        if (cartItems.length === 0) {
            toast.error("No items to reorder");
            return;
        }

        if (diffs.length > 0) {
            setPendingReorder({ items: cartItems, diffs });
        } else {
            loadCart(cartItems);
            toast.success(`${cartItems.length} item(s) loaded into cart!`);
            navigate('/cart');
        }
    };

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border/50 px-5 pt-6 pb-4 flex flex-col gap-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-heading font-bold text-foreground">Order History</h1>
                    </div>
                    <button className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order #, store, or product..."
                        className="w-full h-10 rounded-xl bg-muted pl-9 pr-4 text-sm font-body text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </header>

            <div className="px-4 py-4 space-y-3 pb-20">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground text-sm font-medium">
                        No order history available.
                    </div>
                ) : (
                    filteredOrders.map((order: any) => {
                        const isCancelled = order.status === 'cancelled';
                        const isLocked = order.isLocked;

                        return (
                            <div key={order.id} className={`bg-card border rounded-2xl shadow-sm overflow-hidden ${isCancelled ? 'border-destructive/20 opacity-70' : 'border-border/50'}`}>
                                <div className="flex justify-between items-start p-4">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCancelled ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-heading font-bold text-foreground text-sm">
                                                Order #{order.orderNumber ?? order.id.slice(-6)}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                            {user?.role === "admin" && (
                                                <p className="text-[10px] text-muted-foreground/80 mt-1 uppercase tracking-wider">Sold by {order.userName}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary font-heading text-sm">{formatCurrency(order.grandTotal || 0)}</p>
                                        {isCancelled ? (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-destructive/15 text-destructive rounded-sm text-[10px] font-bold uppercase tracking-wider">Cancelled</span>
                                        ) : (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-success/15 text-success rounded-sm text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
                                        )}
                                    </div>
                                </div>

                                {/* Order items summary */}
                                <div className="px-4 pb-3 border-t border-border/50 pt-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                                    <ul className="space-y-1">
                                        {order.items?.map((item: any, i: number) => (
                                            <li key={i} className="flex justify-between items-center text-xs text-foreground">
                                                <span className="truncate pr-4"><span className="text-muted-foreground font-bold mr-1">{item.quantity}×</span>{item.product?.name}</span>
                                                <span className="text-muted-foreground shrink-0">{formatCurrency(item.variant?.price * item.quantity)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action buttons */}
                                {!isCancelled && (
                                    <div className="flex gap-2 px-4 pb-4 pt-1">
                                        {/* Reorder (Feature 9) */}
                                        <button
                                            onClick={() => handleReorder(order)}
                                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Reorder
                                        </button>

                                        {/* PDF Invoice (Feature 10) */}
                                        <button
                                            onClick={() => generateInvoicePdf(order)}
                                            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-muted text-foreground text-xs font-bold hover:bg-muted/70 transition-colors"
                                            title="Download PDF Invoice"
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            PDF
                                        </button>

                                        {/* Cancel within window (Feature 3) */}
                                        {isLocked ? (
                                            <div className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-muted text-muted-foreground text-xs font-medium cursor-not-allowed">
                                                <Lock className="h-3 w-3" />
                                                Locked
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => cancelMutation.mutate(order.id)}
                                                disabled={cancelMutation.isPending}
                                                className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors"
                                            >
                                                {cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Lock indicator */}
                                {!isCancelled && isLocked && (
                                    <div className="px-4 pb-3 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                                        <Clock className="h-3 w-3" />
                                        <span>15-min edit window expired · Contact admin to cancel</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* 6.6 Price Diff Modal */}
            {pendingReorder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in text-left">
                    <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-in">
                        <div className="flex items-center gap-3 text-accent mb-2">
                            <AlertTriangle className="h-6 w-6" />
                            <h2 className="text-xl font-heading font-black text-foreground">Price Changes</h2>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Prices for some items have changed since your last order. Please review the differences before proceeding:
                        </p>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {pendingReorder.diffs.map((diff, i) => (
                                <div key={i} className="bg-muted/50 rounded-xl p-3 border border-border/50">
                                    <p className="text-xs font-bold text-foreground truncate">{diff.name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-muted-foreground line-through decoration-destructive/50">{formatCurrency(diff.old)}</span>
                                        <span className="text-[10px] font-bold text-success">{formatCurrency(diff.new)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                onClick={() => {
                                    loadCart(pendingReorder.items);
                                    toast.success("Order items updated with current prices");
                                    navigate('/cart');
                                    setPendingReorder(null);
                                }}
                                className="h-12 rounded-xl bg-accent text-accent-foreground font-heading font-bold"
                            >
                                Accept & Add to Cart
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setPendingReorder(null)}
                                className="h-10 text-xs font-semibold text-muted-foreground"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}
