import React, { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronLeft, Edit2, DollarSign, Tag, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

export default function PricingManagement() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<Record<string, { imported: number; errors: string[] } | null>>({});
    const [isImporting, setIsImporting] = useState<string | null>(null);

    const { data: levels = [], isLoading } = useQuery({
        queryKey: ['pricing-levels'],
        queryFn: async () => {
            const res = await fetch('/api/pricing-levels');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await apiFetch(`/api/pricing-levels/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-levels'] });
            toast.success("Pricing level updated");
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newLevel: any) => {
            const res = await apiFetch('/api/pricing-levels', {
                method: 'POST',
                body: JSON.stringify(newLevel)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-levels'] });
            toast.success("Pricing level created");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiFetch(`/api/pricing-levels/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-levels'] });
            toast.success("Pricing level deleted");
        }
    });

    if (user?.role !== "admin") {
        return (
            <MobileLayout>
                <div className="p-8 text-center text-muted-foreground pt-20">
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p>Only administrators can manage pricing levels.</p>
                    <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
                </div>
            </MobileLayout>
        );
    }

    const handlePriceChange = (levelId: string, sku: string, newPrice: string) => {
        const level = levels.find((l: any) => l.id === levelId);
        if (!level) return;
        const prices = { ...level.prices, [sku]: parseFloat(newPrice) || 0 };
        updateMutation.mutate({ id: levelId, data: { prices } });
    };

    const handleCreateLevel = () => {
        // Build default prices (same as retail)
        const defaultPrices: Record<string, number> = {};
        products.forEach((p: any) => {
            p.variants.forEach((v: any) => {
                defaultPrices[v.sku] = v.price;
            });
        });
        createMutation.mutate({
            name: "New Level",
            description: "Set custom prices",
            prices: defaultPrices
        });
    };

    const handleCsvImport = async (levelId: string, file: File) => {
        setIsImporting(levelId);
        setImportStatus(prev => ({ ...prev, [levelId]: null }));
        try {
            const formData = new FormData();
            formData.append('csv', file);
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`/api/pricing-levels/${levelId}/import-csv`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setImportStatus(prev => ({ ...prev, [levelId]: data }));
            queryClient.invalidateQueries({ queryKey: ['pricing-levels'] });
            toast.success(`Imported ${data.imported} SKU prices`);
        } catch (err: any) {
            toast.error(err.message || 'Import failed');
        } finally {
            setIsImporting(null);
        }
    };

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border/50 px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-heading font-black truncate">Pricing Management</h1>
                </div>
            </header>

            <div className="px-4 py-6 space-y-4 pb-24">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Manage B2B pricing tiers</p>
                    <Button size="sm" onClick={handleCreateLevel} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Level
                    </Button>
                </div>

                {isLoading ? (
                    <p className="text-sm text-center py-10 text-muted-foreground">Loading...</p>
                ) : (
                    levels.map((level: any) => {
                        const isExpanded = expandedLevel === level.id;
                        const isRetail = level.id === "retail";
                        const priceCount = level.prices ? Object.keys(level.prices).length : 0;

                        return (
                            <div key={level.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                                <div className="p-4 flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isRetail ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                                            <Tag className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-foreground">{level.name}</h3>
                                            <p className="text-xs text-muted-foreground">{level.description || "No description"}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {isRetail ? "Base prices from product catalog" : `${priceCount} custom SKU prices`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {!isRetail && (
                                            <>
                                                <button
                                                    onClick={() => setExpandedLevel(isExpanded ? null : level.id)}
                                                    className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteMutation.mutate(level.id)}
                                                    className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && !isRetail && (
                                    <div className="border-t border-border/50 px-4 py-3 space-y-3 max-h-[400px] overflow-y-auto">
                                        {/* CSV Import Section (Feature 12) */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground">Edit Prices by SKU</p>
                                            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold cursor-pointer hover:bg-primary/20 transition-colors">
                                                {isImporting === level.id ? '...' : <><Upload className="h-3 w-3" /> Import CSV</>}
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleCsvImport(level.id, file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* CSV format hint */}
                                        <p className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5">
                                            CSV format: <code className="font-mono">sku,price</code> per line · e.g. <code className="font-mono">SS-CS-4L,42.50</code>
                                        </p>

                                        {/* Import result */}
                                        {importStatus[level.id] && (
                                            <div className="rounded-lg bg-success/10 border border-success/20 px-3 py-2">
                                                <div className="flex items-center gap-2 text-xs text-success font-bold">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {importStatus[level.id]?.imported} SKUs imported
                                                </div>
                                                {importStatus[level.id]?.errors?.map((e, i) => (
                                                    <p key={i} className="text-[10px] text-destructive mt-1 flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />{e}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Manual price editing */}
                                        <div className="space-y-2">
                                            {products.map((product: any) => (
                                                <div key={product.handle} className="space-y-1">
                                                    <p className="text-xs font-heading font-bold text-foreground">{product.name}</p>
                                                    {product.variants.map((v: any) => {
                                                        const levelPrice = level.prices?.[v.sku];
                                                        return (
                                                            <div key={v.sku} className="flex items-center gap-2 pl-2">
                                                                <span className="text-[10px] text-muted-foreground w-16 shrink-0">{v.name}</span>
                                                                <span className="text-[10px] text-muted-foreground w-14 shrink-0">{v.sku}</span>
                                                                <span className="text-[10px] text-muted-foreground shrink-0">Retail: {formatCurrency(v.price)}</span>
                                                                <div className="flex items-center gap-1 ml-auto">
                                                                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        defaultValue={levelPrice ?? v.price}
                                                                        onBlur={(e) => handlePriceChange(level.id, v.sku, e.target.value)}
                                                                        className="w-20 h-7 px-2 rounded border border-border bg-muted text-xs font-heading font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </MobileLayout>
    );
}
