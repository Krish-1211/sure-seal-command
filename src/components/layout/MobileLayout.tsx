import { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
}

import { SyncIndicator } from "@/components/SyncIndicator";

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SyncIndicator />
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
