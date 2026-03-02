import { MobileLayout } from "@/components/layout/MobileLayout";
import { useState } from "react";
import { ChevronRight, ChevronLeft, MapPin, DollarSign, Package, TrendingUp, TrendingDown, Phone, Mail } from "lucide-react";
import { PerformanceRing } from "@/components/PerformanceRing";
import { Button } from "@/components/ui/button";

import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

export default function SalesPortal() {
    const [selectedRep, setSelectedRep] = useState<any | null>(null);

    const { data: users = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await apiFetch('/api/users');
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await apiFetch('/api/orders');
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        }
    });

    const isLoading = loadingUsers || loadingOrders;

    const salesReps = users.filter((u: any) => u.role === "salesman").map((rep: any) => {
        const repOrders = orders.filter((o: any) => o.userId === rep.id && o.status !== 'cancelled');
        const revenueNum = repOrders.reduce((acc: number, o: any) => acc + (Number(o.grandTotal) || 0), 0);
        const target = rep.monthlyTarget || rep.monthly_target || 20000; // Use DB target
        const percentage = Math.min(Math.round((revenueNum / target) * 100), 100);

        return {
            ...rep,
            performance: {
                percentage,
                revenue: formatCurrency(revenueNum),
                revenueNum,
                target,
                orders: repOrders.length,
                pending: 0,
                trend: percentage > 50 ? "up" : "down"
            }
        };
    });

    return (
        <MobileLayout>
            {!selectedRep ? (
                <>
                    <header className="bg-primary px-5 pt-6 pb-6">
                        <h1 className="text-xl font-heading font-black text-primary-foreground">Sales Portal</h1>
                        <p className="text-primary-foreground/70 text-sm font-body mt-1">Manage and monitor your team</p>
                    </header>

                    <div className="px-4 py-4 space-y-3 pb-8">
                        <h2 className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Active Representatives ({salesReps.length})
                        </h2>

                        {salesReps.map((rep, index) => (
                            <div
                                key={rep.id}
                                onClick={() => setSelectedRep(rep)}
                                className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-all cursor-pointer animate-slide-up flex items-center justify-between"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg font-heading">
                                        {rep.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                                            {rep.name}
                                            {rep.performance.trend === "up" ? (
                                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 text-destructive" />
                                            )}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3" /> {rep.region}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-primary font-bold text-sm">{rep.performance.revenue}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{rep.performance.percentage}% KPI</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="animate-fade-in pb-8">
                    <header className="bg-card border-b border-border/50 px-5 pt-6 pb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedRep(null)}
                                className="h-10 w-10 -ml-2 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-heading font-bold text-foreground">{selectedRep.name}</h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium"><MapPin className="w-3 h-3" /> {selectedRep.region}</p>
                            </div>
                        </div>
                    </header>

                    <div className="px-4 py-6 space-y-6">

                        {/* Quick Contact */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-12 border-border/50 bg-card rounded-2xl gap-2 shadow-sm text-foreground active:bg-muted">
                                <Phone className="w-4 h-4 text-primary" />
                                <span className="text-xs">{selectedRep.phone}</span>
                            </Button>
                            <Button variant="outline" className="h-12 border-border/50 bg-card rounded-2xl gap-2 shadow-sm text-foreground active:bg-muted font-normal text-[10px] sm:text-xs">
                                <Mail className="w-4 h-4 text-primary" />
                                Email Rep
                            </Button>
                        </div>

                        {/* Performance KPI */}
                        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
                            <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                Current Targets
                            </h3>
                            <div className="-mt-4">
                                <PerformanceRing
                                    percentage={selectedRep.performance.percentage}
                                    revenue={selectedRep.performance.revenue}
                                    orders={selectedRep.performance.orders}
                                    pending={selectedRep.performance.pending}
                                />
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                </div>
                                <p className="text-2xl font-bold text-foreground font-heading">{selectedRep.performance.revenue}</p>
                                <p className="text-xs text-muted-foreground mt-1">MTD Sales generated</p>
                            </div>

                            <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                                    <Package className="w-4 h-4 text-accent-foreground" />
                                </div>
                                <p className="text-2xl font-bold text-foreground font-heading">{selectedRep.performance.orders}<span className="text-sm text-muted-foreground"> fulfilled</span></p>
                                <p className="text-xs text-muted-foreground mt-1">Orders processed</p>
                            </div>
                        </div>

                        {/* Simulated Activity */}
                        <div className="pt-2">
                            <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Latest Activity
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex gap-4 items-start">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                                    <div>
                                        <p className="font-heading font-bold text-sm">Checked into Store</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Bunnings Port Melbourne</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">10 min ago</p>
                                    </div>
                                </div>
                                <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex gap-4 items-start">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                                    <div>
                                        <p className="font-heading font-bold text-sm">Placed Order #SS-0021</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">$1,250.00 • 3 items</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">2 hrs ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </MobileLayout>
    );
}
