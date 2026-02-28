import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, ShoppingCart, MoreHorizontal, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const salesNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/catalog", icon: Package, label: "Catalog" },
  { path: "/cart", icon: ShoppingCart, label: "Cart" },
  { path: "/more", icon: MoreHorizontal, label: "More" },
];

const adminNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/sales-portal", icon: Briefcase, label: "Sales Portal" },
  { path: "/more", icon: MoreHorizontal, label: "More" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = user?.role === "admin" ? adminNavItems : salesNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom shadow-elevated">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium font-body">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
