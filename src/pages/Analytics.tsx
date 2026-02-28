import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerformanceRing } from "@/components/PerformanceRing";
import { SalesTrend } from "@/components/SalesTrend";

export default function Analytics() {
    const navigate = useNavigate();

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border px-5 pt-6 pb-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-heading font-bold text-foreground">My Analytics</h1>
            </header>

            <div className="px-4 py-8 space-y-8 pb-20">
                <PerformanceRing percentage={88} revenue="$34,250" orders={28} pending={2} />

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 flex flex-col items-center text-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Commission</span>
                        <p className="text-2xl font-black font-heading text-foreground">$4,110</p>
                        <p className="text-[10px] text-success mt-2 font-bold px-2 py-1 bg-success/15 rounded-full inline-block">+12% vs last month</p>
                    </div>

                    <div className="bg-accent/5 rounded-2xl p-5 border border-accent/10 flex flex-col items-center text-center">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
                            <DollarSign className="h-5 w-5 text-accent" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent/70 mb-1">Avg Order</span>
                        <p className="text-2xl font-black font-heading text-foreground">$1,223</p>
                        <p className="text-[10px] text-success mt-2 font-bold px-2 py-1 bg-success/15 rounded-full inline-block">+5% vs last month</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <SalesTrend />
                </div>
            </div>
        </MobileLayout>
    )
}
