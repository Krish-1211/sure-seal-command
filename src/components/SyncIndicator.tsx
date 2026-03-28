import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, AlertCircle, Cloud } from "lucide-react";
import { SyncService } from "@/services/sync.service";
import { toast } from "sonner";

export function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    const handleStatusChange = async () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        toast.success("Connection restored! Syncing data...");
        SyncService.processQueue();
      } else {
        toast.warning("You are currently offline.");
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Refresh counts periodically
    const interval = setInterval(async () => {
      const pCount = await SyncService.getPendingCount();
      const fCount = await SyncService.getFailedCount();
      
      if (pCount !== pendingCount || fCount !== failedCount) {
        setPendingCount(pCount);
        setFailedCount(fCount);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(interval);
    };
  }, [pendingCount, failedCount]);

  if (!isOnline) {
    return (
      <div className="fixed top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/90 text-[10px] text-white rounded-full font-bold shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 z-50">
        <CloudOff className="h-3 w-3" />
        Offline
        {pendingCount > 0 && <span>({pendingCount} pending)</span>}
      </div>
    );
  }

  if (failedCount > 0) {
    return (
      <div className="fixed top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-destructive/90 text-[10px] text-white rounded-full font-bold shadow-lg backdrop-blur-sm animate-pulse z-50">
        <AlertCircle className="h-3 w-3" />
        {failedCount} Sync Errors
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-primary/90 text-[10px] text-white rounded-full font-bold shadow-lg backdrop-blur-sm z-50">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Syncing ({pendingCount} left)
      </div>
    );
  }

  return null;
}
