import { MobileLayout } from "@/components/layout/MobileLayout";
import { MapView } from "@/components/MapView";
import { ChevronLeft, Loader2, MapPin, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useState } from "react";

function timeSince(dateStr: string): string {
    const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
}

const REP_COLORS = ["blue", "green", "orange", "purple", "red"] as const;

export default function FleetMap() {
    const navigate = useNavigate();
    const [selectedRep, setSelectedRep] = useState<string | null>(null);

    const { data: reps = [], isLoading, refetch, isFetching, dataUpdatedAt } = useQuery({
        queryKey: ["fleet"],
        queryFn: async () => {
            const res = await apiFetch("/api/fleet");
            if (!res.ok) throw new Error("Failed to fetch fleet");
            return res.json();
        },
        refetchInterval: 30000 // auto-refresh every 30s
    });

    const mapMarkers = reps.map((rep: any, i: number) => ({
        lat: rep.lat,
        lng: rep.lng,
        label: rep.name.split(" ")[0],
        color: REP_COLORS[i % REP_COLORS.length],
        popup: `<b>${rep.name}</b><br/>${timeSince(rep.updatedAt)}`
    }));

    const selectedRepData = reps.find((r: any) => r.id === selectedRep);

    return (
        <MobileLayout>
            {/* Header */}
            <header className="bg-card border-b border-border/50 px-5 pt-6 pb-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-heading font-bold text-foreground">Fleet Tracker</h1>
                            <p className="text-xs text-muted-foreground">
                                {reps.length} rep{reps.length !== 1 ? "s" : ""} online
                                {dataUpdatedAt ? ` · updated ${timeSince(new Date(dataUpdatedAt).toISOString())}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors ${isFetching ? "animate-spin" : ""}`}
                    >
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </header>

            {/* Map */}
            <div className="relative">
                {isLoading ? (
                    <div className="h-72 flex items-center justify-center bg-muted/30">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <MapView
                        className="w-full h-72"
                        markers={mapMarkers}
                        zoom={5}
                        center={[-28, 134]} // Australia center
                    />
                )}

                {/* Live badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1.5 shadow-sm z-[1000]">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-foreground">LIVE</span>
                </div>
            </div>

            {/* Rep list */}
            <div className="px-4 py-4 space-y-3 pb-24">
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">Sales Representatives</p>

                {reps.length === 0 && !isLoading && (
                    <div className="bg-muted/30 rounded-2xl p-8 text-center">
                        <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-bold text-foreground">No reps sharing location</p>
                        <p className="text-xs text-muted-foreground mt-1">Reps share their GPS when the Route Plan page is open</p>
                    </div>
                )}

                {reps.map((rep: any, i: number) => {
                    const color = REP_COLORS[i % REP_COLORS.length];
                    const isActive = selectedRep === rep.id;
                    const secsSince = Math.floor((Date.now() - new Date(rep.updatedAt).getTime()) / 1000);
                    const isOnline = secsSince < 300; // < 5 min = online

                    return (
                        <button
                            key={rep.id}
                            onClick={() => setSelectedRep(isActive ? null : rep.id)}
                            className={`w-full bg-card border rounded-2xl shadow-sm p-4 text-left transition-all ${isActive ? "border-primary/50 shadow-md" : "border-border/50"}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar with color */}
                                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0`}
                                    style={{ backgroundColor: color === "blue" ? "#3b82f6" : color === "green" ? "#22c55e" : color === "orange" ? "#f97316" : color === "purple" ? "#8b5cf6" : "#ef4444" }}>
                                    {rep.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-heading font-bold text-foreground">{rep.name}</p>
                                        <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isOnline ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                                            {isOnline ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                                            {isOnline ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        Last seen {timeSince(rep.updatedAt)}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-[10px] text-muted-foreground">Coords</p>
                                    <p className="text-[10px] font-mono text-foreground">{rep.lat.toFixed(3)}, {rep.lng.toFixed(3)}</p>
                                </div>
                            </div>

                            {/* Expanded detail — mini map centered on this rep */}
                            {isActive && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-border/40" style={{ height: 180 }}>
                                    <MapView
                                        className="w-full h-full"
                                        center={[rep.lat, rep.lng]}
                                        zoom={14}
                                        markers={[{ lat: rep.lat, lng: rep.lng, label: rep.name.split(" ")[0], color, popup: rep.name }]}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </MobileLayout>
    );
}
