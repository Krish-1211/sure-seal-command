import { MapPin, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NextStopCardProps {
  storeName: string;
  address: string;
  priority: "high" | "medium" | "low";
  eta: string;
}

const priorityStyles = {
  high: "bg-accent text-accent-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

const priorityLabels = {
  high: "High Priority",
  medium: "Medium",
  low: "Low",
};

export function NextStopCard({ storeName, address, priority, eta }: NextStopCardProps) {
  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">
          Next Stop
        </h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityStyles[priority]}`}>
          {priorityLabels[priority]}
        </span>
      </div>
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-heading font-bold text-foreground text-sm">{storeName}</p>
          <p className="text-xs text-muted-foreground font-body truncate">{address}</p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-body">ETA: {eta}</span>
          </div>
        </div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 text-sm font-heading font-semibold">
        <Navigation className="h-4 w-4" />
        Get Directions
      </Button>
    </div>
  );
}
