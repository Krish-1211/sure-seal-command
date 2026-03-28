import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Target, Pencil, Check, X, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

export default function TargetManagement() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await apiFetch('/api/users');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await apiFetch('/api/orders');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const updateTarget = useMutation({
        mutationFn: async ({ id, monthlyTarget }: { id: string; monthlyTarget: number }) => {
            const res = await apiFetch(`/api/users/${id}/target`, {
                method: 'PATCH',
                body: JSON.stringify({ monthlyTarget })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: (_, vars) => {
            toast.success(`Target updated to ${formatCurrency(vars.monthlyTarget)}`);
            setEditingId(null);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => toast.error("Failed to update target")
    });

    // ─── 1. Safer Data Normalization to prevent crashes ───────────────────────
    const usersList = Array.isArray(users) ? users : ((users as any).data || []);
    const ordersList = Array.isArray(orders) ? orders : ((orders as any).data || []);

    const salesReps = usersList.filter((u: any) => u.role === 'salesman').map((rep: any) => {
        const repOrders = ordersList.filter((o: any) => o.userId === rep.id && o.status !== 'cancelled');
        const revenue = repOrders.reduce((acc: number, o: any) => acc + (Number(o.grandTotal) || 0), 0);
        const target = rep.monthlyTarget || 20000;
        const pct = isFinite(revenue / target) ? Math.min(Math.round((revenue / target) * 100), 100) : 0;
        return { ...rep, revenue, target, pct, orderCount: repOrders.length };
    });

    if (user?.role !== 'admin') {
        return (
            <MobileLayout>
                <div className="p-8 text-center pt-20">
                    <p className="text-muted-foreground">Admin access required.</p>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border px-5 pt-6 pb-4 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-lg font-heading font-bold text-foreground">Target Management</h1>
                    <p className="text-xs text-muted-foreground">Set monthly revenue targets per rep</p>
                </div>
            </header>

            <div className="px-4 py-4 space-y-4">
                {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}

                {salesReps.map((rep: any) => (
                    <div key={rep.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        {/* Rep header */}
                        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black font-heading">
                                {rep.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <p className="font-heading font-bold text-foreground">{rep.name}</p>
                                <p className="text-xs text-muted-foreground">{rep.region}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">{rep.orderCount} orders</p>
                                <p className="text-sm font-bold text-primary">{formatCurrency(rep.revenue)}</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="px-4 pb-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                                <span>{rep.pct}% of target</span>
                                <span className="flex items-center gap-1">
                                    {rep.pct >= 80
                                        ? <TrendingUp className="h-3 w-3 text-green-500" />
                                        : <TrendingDown className="h-3 w-3 text-yellow-500" />
                                    }
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${rep.pct >= 100 ? 'bg-green-500' : rep.pct >= 60 ? 'bg-primary' : 'bg-yellow-500'}`}
                                    style={{ width: `${rep.pct}%` }}
                                />
                            </div>
                        </div>

                        {/* Target edit section */}
                        <div className="border-t border-border/50 px-4 py-3 flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-medium">Monthly Target</span>
                            </div>

                            {editingId === rep.id ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-24 h-8 bg-card border border-border rounded-lg px-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') updateTarget.mutate({ id: rep.id, monthlyTarget: parseFloat(editValue) });
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                    />
                                    <button
                                        onClick={() => updateTarget.mutate({ id: rep.id, monthlyTarget: parseFloat(editValue) })}
                                        className="h-7 w-7 rounded-md bg-green-500 text-white flex items-center justify-center"
                                    >
                                        {updateTarget.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="font-heading font-bold text-foreground">{formatCurrency(rep.target)}</span>
                                    <button
                                        onClick={() => { setEditingId(rep.id); setEditValue(String(rep.target)); }}
                                        className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </MobileLayout>
    );
}
