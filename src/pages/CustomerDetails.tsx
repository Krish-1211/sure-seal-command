import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, MapPin, Phone, Mail, Clock, DollarSign, Package, CheckCircle2, History, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/contexts/CustomerContext";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";

export default function CustomerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: customersData = { data: [] }, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await apiFetch('/api/customers?limit=100');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });
    const customers = Array.isArray(customersData) ? customersData : (customersData.data || []);

    const { data: pricingLevels = [] } = useQuery({
        queryKey: ['pricing-levels'],
        queryFn: async () => {
            const res = await apiFetch('/api/pricing-levels');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const { data: usersData = { data: [] } } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await apiFetch('/api/users?limit=100');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });
    const users = Array.isArray(usersData) ? usersData : (usersData.data || []);
    const reps = users.filter((u: any) => u.role === "salesman");

    const queryClient = useQueryClient();

    const assignRepMutation = useMutation({
        mutationFn: async ({ customerId, repId }: { customerId: string, repId: string }) => {
            // Revert assignment if repId is empty
            const data = repId ? { action: 'assign', customerId } : { action: 'unassign', customerId };
            const endpointRef = repId || customer.assigned_sales_rep || customer.assignedSalesRep;
            if (!endpointRef) return;
            const res = await apiFetch(`/api/users/${endpointRef}/customers`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Assignment failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success("Sales rep assignment updated");
        }
    });

    const updateCustomer = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await apiFetch(`/api/customers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Update failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success("Pricing level updated");
        }
    });

    const { setSelectedCustomer } = useCustomer();

    const decodedId = decodeURIComponent(id || "");
    const customer = customers.find((c: any) => c.name === decodedId) || {
        name: decodedId || "Loading...",
        address: "Location Unknown",
        phone: "N/A",
        status: "pending",
        lastVisit: "N/A",
        outstanding: "$0"
    };

    // Mock specific data for the customer to showcase UI capability
    const mockOrders = [
        { id: "ORD-8923", date: "Today", amount: "$1,250.00", status: "Delivered", items: 3 },
        { id: "ORD-8804", date: "15 Feb, 2026", amount: "$4,250.00", status: "Processing", items: 10 },
        { id: "ORD-8750", date: "22 Jan, 2026", amount: "$850.50", status: "Delivered", items: 5 }
    ];

    const mockPayments = [
        { id: "PAY-1004", date: "Today", amount: "$1,250.00", method: "Bank Transfer", status: "Completed" },
        { id: "PAY-0992", date: "01 Feb, 2026", amount: "$850.50", method: "Credit Card", status: "Completed" }
    ];

    const StatusIcon = customer.status === "visited" ? CheckCircle2 : customer.status === "overdue" ? AlertCircle : Clock;
    const statusColor = customer.status === "visited" ? "text-success bg-success/15" : customer.status === "overdue" ? "text-accent bg-accent/15" : "text-warning bg-warning/15";

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border/50 px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 -ml-2 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-heading font-black text-foreground truncate">{customer.name}</h1>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                        <StatusIcon className="h-3 w-3" />
                        {customer.status}
                    </span>
                </div>
            </header>

            <div className="px-4 py-6 space-y-6 animate-fade-in pb-20">

                {/* Contact Info Card */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">Contact Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-heading font-semibold text-sm">Business Address</p>
                                <p className="text-xs text-muted-foreground">{customer.address}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-heading font-semibold text-sm">Phone Number</p>
                                <p className="text-xs text-muted-foreground">{customer.phone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <Button className="flex-1 h-12 bg-primary text-primary-foreground font-bold font-heading rounded-xl shadow-sm gap-2">
                            <Phone className="h-4 w-4" /> Call Client
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 bg-card border-border/50 text-foreground font-bold font-heading rounded-xl shadow-sm gap-2 active:bg-muted"
                            onClick={() => {
                                setSelectedCustomer(customer);
                                toast.success(`Selected ${customer.name}`);
                                navigate("/catalog");
                            }}
                        >
                            <Package className="h-4 w-4" /> Start Order
                        </Button>
                    </div>
                </div>

                {/* Pricing Level Selector */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">Pricing Level</h3>
                    <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-body"
                        value={customer.pricingLevelId || ""}
                        onChange={(e) => {
                            if (customer.id) {
                                updateCustomer.mutate({ id: customer.id, data: { pricingLevelId: e.target.value || null } });
                            }
                        }}
                    >
                        <option value="">Default Retail Pricing</option>
                        {pricingLevels.map((lvl: any) => (
                            <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                        ))}
                    </select>
                </div>

                {/* Sales Rep Selector */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">Assigned Sales Rep</h3>
                    <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-body"
                        value={customer.assigned_sales_rep || customer.assignedSalesRep || ""}
                        onChange={(e) => {
                            if (customer.id) {
                                assignRepMutation.mutate({ customerId: customer.id, repId: e.target.value });
                            }
                        }}
                    >
                        <option value="">Unassigned</option>
                        {reps.map((rep: any) => (
                            <option key={rep.id} value={rep.id}>{rep.name}</option>
                        ))}
                    </select>
                </div>

                {/* Account Overview */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2 text-accent-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Outstanding</span>
                        </div>
                        <p className="text-2xl font-bold font-heading text-foreground">{customer.outstanding}</p>
                    </div>
                    <div className="bg-muted border border-border/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <History className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Last Visit</span>
                        </div>
                        <p className="text-lg font-bold font-heading text-foreground mt-1.5">{customer.lastVisit}</p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider">Order History</h3>
                        <button className="text-xs font-bold text-primary hover:underline">View All</button>
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        {mockOrders.map((order, i) => (
                            <div key={order.id} className={`p-4 flex items-center justify-between ${i !== mockOrders.length - 1 ? 'border-b border-border/50' : ''}`}>
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm font-heading">{order.id} <span className="text-muted-foreground font-normal ml-1">({order.items} Items)</span></p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{order.date} • <span className={order.status === 'Processing' ? 'text-warning' : 'text-success'}>{order.status}</span></p>
                                    </div>
                                </div>
                                <p className="font-bold text-foreground">{order.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider">Payment History</h3>
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        {mockPayments.map((payment, i) => (
                            <div key={payment.id} className={`p-4 flex items-center justify-between ${i !== mockPayments.length - 1 ? 'border-b border-border/50' : ''}`}>
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm font-heading">{payment.id}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{payment.date} • {payment.method}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-foreground">{payment.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </MobileLayout>
    );
}
