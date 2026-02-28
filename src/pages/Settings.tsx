import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Wifi, MapPin, Bell, RefreshCw, Camera, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        offlineMode: true,
        autoSync: true,
        gpsTracking: true,
        notifications: true,
        highResPhotos: false,
        analyticsOptIn: true,
    });

    // Since user said "activate all the features in the settings", they are mostly true by default!

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            toast.success(`${key} ${next[key] ? "activated" : "deactivated"}`);
            return next;
        });
    };

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border px-5 pt-6 pb-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-heading font-bold text-foreground">App Settings</h1>
            </header>

            <div className="px-4 py-6 space-y-6 pb-20">

                {/* Network & Sync */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground px-1">Network & Sync</h3>
                    <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-sm">

                        <div className="flex items-center justify-between p-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <Wifi className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-heading font-semibold text-sm">Offline Mode</p>
                                    <p className="text-[10px] text-muted-foreground">Download catalog for offline visits</p>
                                </div>
                            </div>
                            <Switch checked={settings.offlineMode} onCheckedChange={() => handleToggle("offlineMode")} />
                        </div>

                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-heading font-semibold text-sm">Auto-Sync Orders</p>
                                    <p className="text-[10px] text-muted-foreground">Sync when network returns</p>
                                </div>
                            </div>
                            <Switch checked={settings.autoSync} onCheckedChange={() => handleToggle("autoSync")} />
                        </div>

                    </div>
                </section>

                {/* Device Features */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground px-1">Device Integration</h3>
                    <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-sm">

                        <div className="flex items-center justify-between p-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-heading font-semibold text-sm">GPS Tracking</p>
                                    <p className="text-[10px] text-muted-foreground">Auto-suggest nearby stores</p>
                                </div>
                            </div>
                            <Switch checked={settings.gpsTracking} onCheckedChange={() => handleToggle("gpsTracking")} />
                        </div>

                        <div className="flex items-center justify-between p-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-heading font-semibold text-sm">Push Notifications</p>
                                    <p className="text-[10px] text-muted-foreground">Alerts for new assignments</p>
                                </div>
                            </div>
                            <Switch checked={settings.notifications} onCheckedChange={() => handleToggle("notifications")} />
                        </div>

                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Camera className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-heading font-semibold text-sm">High-Res Barcode Scanner</p>
                                    <p className="text-[10px] text-muted-foreground">Uses more battery</p>
                                </div>
                            </div>
                            <Switch checked={settings.highResPhotos} onCheckedChange={() => handleToggle("highResPhotos")} />
                        </div>

                    </div>
                </section>

                {/* Data Management */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground px-1">Privacy & Data</h3>
                    <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-heading font-semibold text-sm">Share Analytics</p>
                                    <p className="text-[10px] text-muted-foreground">Help improve Sure Seal</p>
                                </div>
                            </div>
                            <Switch checked={settings.analyticsOptIn} onCheckedChange={() => handleToggle("analyticsOptIn")} />
                        </div>
                    </div>
                </section>

                <div className="pt-4 flex justify-center">
                    <button className="text-destructive text-sm font-semibold font-body" onClick={() => toast.error("Cache Cleared!")}>
                        Clear App Cache
                    </button>
                </div>

            </div>
        </MobileLayout>
    );
}
