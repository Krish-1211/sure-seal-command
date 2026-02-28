import { MapPin, Phone, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CustomerCardProps {
  name: string;
  address: string;
  phone: string;
  status: "visited" | "pending" | "overdue";
  lastVisit: string;
  outstanding: string;
}

const statusConfig = {
  visited: { icon: CheckCircle2, label: "Visited", className: "text-success bg-success/15" },
  pending: { icon: Clock, label: "Pending", className: "text-warning bg-warning/15" },
  overdue: { icon: AlertCircle, label: "Overdue", className: "text-accent bg-accent/15" },
};

export function CustomerCard({ name, address, phone, status, lastVisit, outstanding }: CustomerCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/customers/${encodeURIComponent(name)}`)}
      className="bg-card rounded-lg p-4 shadow-card animate-fade-in cursor-pointer hover:border-primary/30 border border-transparent transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-heading font-bold text-foreground">{name}</h4>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs font-body truncate">{address}</span>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.className}`}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground font-body">Last Visit</p>
            <p className="text-xs font-body font-medium text-foreground">{lastVisit}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-body">Outstanding</p>
            <p className="text-xs font-heading font-bold text-accent">{outstanding}</p>
          </div>
        </div>
        <a
          href={`tel:${phone}`}
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
