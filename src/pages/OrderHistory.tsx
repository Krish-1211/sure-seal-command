import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Package, Search, Calendar, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const formatCurrency = (val: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(val);

export default function OrderHistory() {
    const navigate = useNavigate();

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders-history'],
        queryFn: async () => {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

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
                        placeholder="Search by order #, store, or product..."
                        className="w-full h-10 rounded-xl bg-muted pl-9 pr-4 text-sm font-body text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </header>

            <div className="px-4 py-4 space-y-3 pb-20">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground text-sm font-medium">
                        No order history available.
                    </div>
                ) : (
                    orders.slice().reverse().map((order: any) => (
                        <div key={order.id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-heading font-bold text-foreground text-sm">Order #{order.id.slice(-6)}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary font-heading text-sm">{formatCurrency(order.grandTotal || 0)}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-success/15 text-success rounded-sm text-[10px] font-bold uppercase tracking-wider">Completed</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border/50 mt-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Summary</p>
                                <ul className="space-y-1.5">
                                    {order.items?.map((item: any, i: number) => (
                                        <li key={i} className="flex justify-between items-center text-xs text-foreground">
                                            <span className="truncate pr-4"><span className="text-muted-foreground font-bold mr-1">{item.quantity}x</span> {item.product?.name || item.product?.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </MobileLayout>
    );
}
