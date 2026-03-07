import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";

export default function PromotionsManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [editingPromo, setEditingPromo] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', image_url: '', active: true });

    const { data: promotions = [], isLoading } = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const res = await apiFetch('/api/promotions');
            if (!res.ok) throw new Error("Failed to fetch promotions");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiFetch('/api/promotions', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create promotion");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Promotion added successfully");
            setFormData({ title: '', description: '', image_url: '', active: true });
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await apiFetch(`/api/promotions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to update promotion");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Promotion updated successfully");
            setEditingPromo(null);
            setFormData({ title: '', description: '', image_url: '', active: true });
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/promotions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete promotion");
            return true;
        },
        onSuccess: () => {
            toast.success("Promotion deleted");
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPromo) {
            updateMutation.mutate({ id: editingPromo.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (promo: any) => {
        setEditingPromo(promo);
        setFormData({ title: promo.title, description: promo.description, image_url: promo.image_url || '', active: promo.active });
        setIsFormOpen(true);
    };

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border/50 px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-heading font-bold text-foreground">Promotions (Offers)</h1>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={() => { setEditingPromo(null); setFormData({ title: '', description: '', image_url: '', active: true }); setIsFormOpen(true); }}
                        className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                )}
            </header>

            <div className="px-4 py-4 space-y-4 pb-20">
                {isFormOpen ? (
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50">
                        <h2 className="text-sm font-heading font-bold mb-4">{editingPromo ? 'Edit Promotion' : 'New Promotion'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Offer Title *</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full h-10 rounded-lg bg-muted px-3 text-sm focus:ring-2 outline-none" placeholder="e.g. Summer Sale!" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full h-20 rounded-lg bg-muted p-3 text-sm focus:ring-2 outline-none" placeholder="Brief details about the offer..."></textarea>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Image URL (Optional)</label>
                                <input type="url" value={formData.image_url} onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))} className="w-full h-10 rounded-lg bg-muted px-3 text-sm focus:ring-2 outline-none" placeholder="https://example.com/banner.jpg" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary" />
                                <label htmlFor="active" className="text-sm">Active & Visible to Customers</label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 h-10 rounded-lg bg-muted font-heading font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm flex items-center justify-center">
                                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : promotions.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-xl border border-border/50">
                        <p className="text-sm font-medium text-muted-foreground mb-4">No promotions found.</p>
                    </div>
                ) : (
                    promotions.map((promo: any) => (
                        <div key={promo.id} className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
                            {promo.image_url && <img src={promo.image_url} alt="" className="w-full h-32 object-cover opacity-80" />}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-heading font-bold text-base">{promo.title}</h3>
                                    {promo.active ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /> : <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">{promo.description}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(promo)} className="flex-1 h-9 rounded-lg bg-muted flex items-center justify-center gap-2 text-sm font-semibold hover:bg-muted/80">
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button onClick={() => { if (window.confirm('Delete this promotion?')) deleteMutation.mutate(promo.id); }} disabled={deleteMutation.isPending} className="w-12 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </MobileLayout>
    );
}
