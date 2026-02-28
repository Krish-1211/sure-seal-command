import { Wifi, WifiOff, Cloud } from "lucide-react";

type SyncStatus = "synced" | "offline" | "pending";

interface SyncIndicatorProps {
  status: SyncStatus;
}

const config = {
  synced: { icon: Cloud, label: "Synced", className: "text-success" },
  offline: { icon: WifiOff, label: "Offline", className: "text-accent" },
  pending: { icon: Wifi, label: "Syncing...", className: "text-warning animate-pulse" },
};

export function SyncIndicator({ status }: SyncIndicatorProps) {
  const { icon: Icon, label, className } = config[status];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-body font-medium">{label}</span>
    </div>
  );
}
