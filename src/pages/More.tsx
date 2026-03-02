import { MobileLayout } from "@/components/layout/MobileLayout";
import { User, FileText, Settings, HelpCircle, LogOut, ChevronRight, History, BarChart3, Download, MessageCircle, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const menuSections = [
  {
    title: "Account",
    items: [
      { id: "profile", icon: User, label: "My Profile", subtitle: "Manage your details" },
      { id: "analytics", icon: BarChart3, label: "My Analytics", subtitle: "Performance & commission" },
      { id: "history", icon: History, label: "Order History", subtitle: "All past orders & invoices" },
      { id: "messages", icon: MessageCircle, label: "Messages", subtitle: "Chat with your team" },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "export", icon: Download, label: "Export Data", subtitle: "Xero, QuickBooks formats" },
      { id: "reports", icon: FileText, label: "Reports", subtitle: "Daily & weekly reports" },
    ],
  },
  {
    title: "Settings",
    items: [
      { id: "pricing", icon: FileText, label: "Pricing Management", subtitle: "Manage B2B levels (Admin)" },
      { id: "targets", icon: Target, label: "Target Management", subtitle: "Set rep monthly targets (Admin)" },
      { id: "settings", icon: Settings, label: "App Settings", subtitle: "Sync, notifications, offline" },
      { id: "help", icon: HelpCircle, label: "Help & Support", subtitle: "Contact & FAQs" },
      { id: "logout", icon: LogOut, label: "Sign Out", subtitle: "" },
    ],
  },
];

const More = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleItemClick = (id: string, label: string) => {
    if (id === "logout") {
      logout();
      navigate("/login");
      toast.success("Signed out successfully");
    } else if (id === "settings") {
      navigate("/settings");
    } else if (id === "profile") {
      navigate("/profile");
    } else if (id === "analytics") {
      navigate("/analytics");
    } else if (id === "history") {
      navigate("/history");
    } else if (id === "help") {
      navigate("/help");
    } else if (id === "export") {
      toast.success(`Spreadsheet exported and emailed to you.`);
    } else if (id === "reports") {
      toast.success(`Weekly report generated and emailed to you.`);
    } else if (id === "pricing") {
      navigate("/pricing-management");
    } else if (id === "messages") {
      navigate("/messages");
    } else if (id === "targets") {
      navigate("/targets");
    } else {
      toast.info(`Opening ${label}...`);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  };

  return (
    <MobileLayout>
      <header className="bg-primary px-5 pt-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary-foreground/15 flex items-center justify-center text-primary-foreground font-heading font-bold text-lg">
            {getInitials(user?.name || "")}
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-primary-foreground">{user?.name}</h1>
            <p className="text-xs font-body text-primary-foreground/70">
              {user?.role === "admin" ? "Administrator" : "Melbourne SE Region · ID: SR-1042"}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 space-y-4 pb-8">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {section.title}
            </h3>
            <div className="bg-card rounded-lg shadow-card overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id, item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${i > 0 ? "border-t border-border" : ""
                    }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.id === "logout" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-heading font-semibold ${item.id === "logout" ? "text-destructive" : "text-foreground"}`}>{item.label}</p>
                    {item.subtitle && (
                      <p className="text-[10px] font-body text-muted-foreground truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              )).filter((item: any) => {
                if (item.key === "pricing" && user?.role !== "admin") return false;
                return true;
              })}
            </div>
          </div>
        ))}

        <p className="text-center text-[10px] font-body text-muted-foreground py-2 mb-4">
          <img src="/logo.png" alt="Sure Seal Sealants" className="h-6 w-auto mx-auto mb-2 opacity-50 grayscale" />
          Sure Seal Sealants SFA v1.0.0 · Build 2026.02
        </p>
      </div>
    </MobileLayout>
  );
};

export default More;
