import { MobileLayout } from "@/components/layout/MobileLayout";
import { PerformanceRing } from "@/components/PerformanceRing";
import { NextStopCard } from "@/components/NextStopCard";
import { SalesTrend } from "@/components/SalesTrend";
import { SyncIndicator } from "@/components/SyncIndicator";
import { Bell, Search, Package, MapPin, Loader2, DollarSign, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const SalesmanDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Unread message count for badge
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await apiFetch('/api/messages');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000
  });
  const unreadCount = messages.filter((m: any) => !m.isRead && m.toUserId === user?.id).length;

  // Most overdue customer for NextStopCard
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiFetch('/api/customers');
      if (!res.ok) return [];
      return res.json();
    }
  });
  const nextStop = [...customers].sort((a: any, b: any) => {
    const daysSince = (d: string | null) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 999;
    return daysSince(b.lastVisit || b.last_visit) - daysSince(a.lastVisit || a.last_visit);
  })[0] as any;

  return (
    <>
      <header className="bg-primary px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-xs font-body">Good Morning</p>
            <h1 className="text-lg font-heading font-bold text-primary-foreground">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <SyncIndicator status="synced" />
            <button
              onClick={() => navigate('/messages')}
              className="relative h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores, products, orders..."
            className="w-full h-10 rounded-lg bg-card pl-10 pr-4 text-sm font-body text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <div className="px-4 -mt-3 space-y-3 pb-8">
        <PerformanceRing percentage={67} revenue="$24,500" orders={18} pending={3} />
        {nextStop ? (
          <NextStopCard
            storeName={nextStop.name}
            address={nextStop.address || nextStop.street || 'Address not set'}
            priority="high"
            eta="Tap to navigate"
            onNavigate={() => navigate('/route')}
          />
        ) : (
          <NextStopCard
            storeName="No customers assigned"
            address="Add customers to get started"
            priority="low"
            eta="—"
            onNavigate={() => navigate('/customers')}
          />
        )}
        <SalesTrend />

        <div className="bg-card rounded-lg p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate("/catalog")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="text-xl">📋</span>
              <span className="text-[10px] font-body font-medium text-foreground">New Order</span>
            </button>
            <button
              onClick={() => navigate("/route")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="text-xl">📍</span>
              <span className="text-[10px] font-body font-medium text-foreground">Check In</span>
            </button>
            <button
              onClick={() => navigate("/route")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="text-xl">🗺️</span>
              <span className="text-[10px] font-body font-medium text-foreground">Route Plan</span>
            </button>
          </div>
        </div>

        {/* Demo Activity Feed */}
        <div className="pt-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm opacity-80">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-foreground font-heading flex gap-2 items-center"><MapPin className="w-3 h-3" /> Checked In</p>
                  <p className="text-xs text-muted-foreground">Bunnings Port Melbourne</p>
                </div>
                <p className="text-xs text-muted-foreground">10 mins ago</p>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm opacity-80">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-foreground font-heading flex gap-2 items-center"><Package className="w-3 h-3" /> Order Submitted</p>
                  <p className="text-xs text-muted-foreground">#SS-892341 (3 Items)</p>
                </div>
                <p className="font-bold text-primary">$1,250.00</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">2 hours ago • Sydney Stone Supplies</p>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm opacity-80">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-foreground font-heading flex gap-2 items-center"><Package className="w-3 h-3" /> Order Submitted</p>
                  <p className="text-xs text-muted-foreground">#SS-892340 (10 Items)</p>
                </div>
                <p className="font-bold text-primary">$4,250.00</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Yesterday • Porcelain Sealer Co.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await apiFetch('/api/orders');
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    }
  });

  // Unread message count for badge
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await apiFetch('/api/messages');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000
  });
  const unreadCount = messages.filter((m: any) => !m.isRead && m.toUserId === user?.id).length;

  const totalRevenue = orders.reduce((acc: number, val: any) => acc + (Number(val.grandTotal) || 0), 0);

  return (
    <>
      <header className="bg-primary px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-xs font-body">Admin Dashboard</p>
            <h1 className="text-lg font-heading font-bold text-primary-foreground">{user?.name}</h1>
          </div>
          <button
            onClick={() => navigate('/messages')}
            className="relative h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold">Total Sales</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs font-bold">Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
        </div>
      </header>

      <div className="px-4 mt-6 space-y-4 pb-8">
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-muted-foreground">
          Recent Activity & Orders
        </h3>

        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 bg-card rounded-lg">No orders generated yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice().reverse().map((order: any) => (
              <div key={order.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-foreground font-heading">Order #{order.orderNumber ?? order.id.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {user?.role === "admin" && (
                      <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider mt-1">
                        Sold by {order.userName}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(order.grandTotal)}</p>
                </div>
                <div className="flex gap-2 text-xs mt-3 bg-muted p-2 rounded-lg">
                  <span className="font-bold">Items:</span>
                  <span>{order.items?.length || 0} product(s)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <MobileLayout>
      {user?.role === "admin" ? <AdminDashboard /> : <SalesmanDashboard />}
    </MobileLayout>
  );
};

export default Dashboard;

