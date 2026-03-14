import { MobileLayout } from "@/components/layout/MobileLayout";
import { MapView } from "@/components/MapView";
import {
    ChevronLeft, MapPin, Navigation, CheckCircle, Clock, Phone,
    Camera, X, Loader2, Route, Calendar, ArrowRight, CornerUpRight, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useLocationTracking } from "@/hooks/useLocationTracking";

import imageCompression from 'browser-image-compression';

// 6.3 Client-Side Photo Compression
async function compressImage(file: File): Promise<string> {
    const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return await imageCompression.getDataUrlFromFile(compressedFile);
    } catch (error) {
        console.error("Compression failed", error);
        throw error;
    }
}

// Geocode an address to [lat, lng] using Nominatim (free OpenStreetMap)
async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
            headers: { "Accept-Language": "en" }
        });
        const data = await res.json();
        if (!data[0]) return null;
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch { return null; }
}

function daysSince(dateStr: string | null): number {
    if (!dateStr) return 999;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function priorityFromDays(days: number): { label: string; color: string } {
    if (days > 14) return { label: 'Overdue', color: 'bg-destructive/15 text-destructive' };
    if (days > 7) return { label: 'Due Soon', color: 'bg-yellow-500/15 text-yellow-600' };
    return { label: 'Recent', color: 'bg-success/15 text-success' };
}

interface RouteSteps {
    steps: { instruction: string; distance: number }[];
    totalDistance: number;
    totalDuration: number;
}

export default function VisitRoute() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // 🌍 GPS tracking — fires heartbeats to /api/location every 45s while on this page
    useLocationTracking({ enabled: user?.role !== 'admin' });

    const [checkingInId, setCheckingInId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoData, setPhotoData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // In-app navigation state
    const [navCustomer, setNavCustomer] = useState<any | null>(null);
    const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
    const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
    const [routeSteps, setRouteSteps] = useState<RouteSteps | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Get user's GPS position for navigation
    useEffect(() => {
        if (!navCustomer) return;
        navigator.geolocation?.getCurrentPosition(
            (pos) => setMyLocation([pos.coords.latitude, pos.coords.longitude]),
            () => toast.error("Could not get your location — check browser permissions")
        );
    }, [navCustomer]);

    // Geocode the destination when navigation starts
    useEffect(() => {
        if (!navCustomer) { setDestCoords(null); setRouteSteps(null); return; }
        const address = navCustomer.address || navCustomer.street;
        if (!address) return;
        setIsGeocoding(true);
        geocodeAddress(address).then(coords => {
            setDestCoords(coords);
            if (!coords) toast.error("Could not locate address on map");
        }).finally(() => setIsGeocoding(false));
    }, [navCustomer]);

    const { data: customersData = { data: [] }, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await apiFetch('/api/customers?limit=100'); // Get more for route
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });
    const customers = Array.isArray(customersData) ? customersData : (customersData.data || []);

    const { data: checkInsData = { data: [] } } = useQuery({
        queryKey: ['check-ins-today'],
        queryFn: async () => {
            const res = await apiFetch('/api/check-ins?limit=100');
            if (!res.ok) return { data: [] };
            return res.json();
        }
    });
    const checkIns = Array.isArray(checkInsData) ? checkInsData : (checkInsData.data || []);

    // Sort customers by days since last visit (most overdue first)
    const sortedCustomers = Array.isArray(customers) ? [...customers].sort((a: any, b: any) =>
        daysSince(a.lastVisit || a.last_visit) - daysSince(b.lastVisit || b.last_visit)
    ).reverse() : [];

    const checkInMutation = useMutation({
        mutationFn: async ({ customerId, customerName }: { customerId: string; customerName: string }) => {
            if (!navigator.onLine) {
                const { getDB } = await import("@/lib/db");
                const db = await getDB();
                await db.put('check_ins_offline', {
                    customerId, customerName, notes, photoBlob: photoData ? await (await fetch(photoData)).blob() : null,
                    offline_id: crypto.randomUUID(),
                    createdAt: new Date().toISOString()
                });
                return { offline: true };
            }

            const formData = new FormData();
            formData.append('customerId', customerId);
            formData.append('customerName', customerName);
            if (notes) formData.append('notes', notes);
            if (photoData) {
                const r = await fetch(photoData);
                const blob = await r.blob();
                formData.append('photo', blob, 'photo.jpg');
            }

            try {
                const res = await apiFetch('/api/check-ins', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
                return res.json();
            } catch (err) {
                const { getDB } = await import("@/lib/db");
                const db = await getDB();
                await db.put('check_ins_offline', {
                    customerId, customerName, notes, photoBlob: photoData ? await (await fetch(photoData)).blob() : null,
                    offline_id: crypto.randomUUID(),
                    createdAt: new Date().toISOString()
                });
                return { offline: true };
            }
        },
        onSuccess: (data: any, vars) => {
            if (data?.offline) {
                toast.success("Saved Offline", { description: "Check-in will sync when back online." });
            } else {
                toast.success(`✅ Checked in to ${vars.customerName}`);
            }
            setCheckingInId(null);
            setNotes("");
            setPhotoData(null);
            setPhotoPreview(null);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['check-ins'] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            setPhotoData(compressed);
            setPhotoPreview(compressed);
            toast.success("Photo captured");
        } catch { toast.error("Failed to process photo"); }
        e.target.value = '';
    };

    const todayCheckIns = checkIns.filter((c: any) => {
        const d = new Date(c.createdAt);
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
    });

    const checkingInCustomer = customers.find((c: any) => c.id === checkingInId);

    // Build map markers for navigation
    const navMarkers = [
        ...(myLocation ? [{ lat: myLocation[0], lng: myLocation[1], label: "You", color: "blue" as const }] : []),
        ...(destCoords ? [{ lat: destCoords[0], lng: destCoords[1], label: navCustomer?.name, color: "red" as const }] : []),
    ];

    // ── NAVIGATION MODAL ──────────────────────────────────────────────────────
    if (navCustomer) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col">
                {/* Nav header */}
                <div className="bg-primary px-4 pt-12 pb-4 flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => { setNavCustomer(null); setDestCoords(null); setRouteSteps(null); }}
                        className="h-10 w-10 rounded-full bg-primary-foreground/15 flex items-center justify-center text-primary-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-primary-foreground/70 text-xs">Navigating to</p>
                        <p className="text-primary-foreground font-heading font-bold truncate">{navCustomer.name}</p>
                        <p className="text-primary-foreground/60 text-xs truncate">{navCustomer.address || navCustomer.street}</p>
                    </div>
                    {routeSteps && (
                        <div className="text-right shrink-0">
                            <p className="text-primary-foreground font-bold">{routeSteps.totalDistance} km</p>
                            <p className="text-primary-foreground/70 text-xs">{routeSteps.totalDuration} min</p>
                        </div>
                    )}
                </div>

                {/* Map — takes up most of the screen */}
                <div className="flex-1 relative">
                    {(isGeocoding || (!destCoords && !isGeocoding)) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                            {isGeocoding
                                ? <><Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /><span className="text-sm text-muted-foreground">Finding location...</span></>
                                : <><AlertCircle className="h-5 w-5 text-destructive mr-2" /><span className="text-sm text-destructive">Address not found on map</span></>}
                        </div>
                    )}
                    <MapView
                        className="w-full h-full"
                        markers={navMarkers}
                        routeFrom={myLocation || undefined}
                        routeTo={destCoords || undefined}
                        onRouteLoaded={setRouteSteps}
                    />
                </div>

                {/* Turn-by-turn steps */}
                {routeSteps && routeSteps.steps.length > 0 && (
                    <div className="bg-card border-t border-border/50 max-h-52 overflow-y-auto shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1">Turn-by-turn directions</p>
                        {routeSteps.steps.slice(0, 8).map((step, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-border/30 last:border-0">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <CornerUpRight className="h-3 w-3 text-primary" />
                                </div>
                                <p className="text-xs text-foreground flex-1">{step.instruction}</p>
                                <span className="text-[10px] text-muted-foreground shrink-0">{step.distance}m</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Open in Google Maps fallback */}
                <div className="bg-card border-t border-border/50 px-4 py-3 shrink-0">
                    <button
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(navCustomer.address || navCustomer.street)}`, '_blank')}
                        className="w-full h-10 rounded-xl border border-border/60 text-xs font-bold text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                    >
                        <Navigation className="h-3.5 w-3.5" /> Open in Google Maps
                    </button>
                </div>
            </div>
        );
    }

    // ── MAIN ROUTE LIST ───────────────────────────────────────────────────────
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    return (
        <MobileLayout>
            {isIOS && user?.role !== 'admin' && (
                <div className="bg-blue-500/10 text-blue-600 px-4 py-2 text-xs font-medium text-center border-b border-blue-500/20">
                    Keep this screen open for live tracking. iOS does not support background GPS.
                </div>
            )}
            <header className="bg-card border-b border-border/50 px-5 pt-6 pb-4 sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-heading font-bold text-foreground">Today's Route</h1>
                        <p className="text-xs text-muted-foreground">{sortedCustomers.length} customers · {todayCheckIns.length} visited today</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="h-2 bg-primary rounded-full transition-all"
                            style={{ width: `${sortedCustomers.length ? (todayCheckIns.length / sortedCustomers.length) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground shrink-0">{todayCheckIns.length}/{sortedCustomers.length}</span>
                </div>
            </header>

            <div className="px-4 py-4 space-y-3 pb-24">
                {isLoading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

                {sortedCustomers.map((customer: any, index: number) => {
                    const days = daysSince(customer.lastVisit || customer.last_visit);
                    const priority = priorityFromDays(days);
                    const visitedToday = todayCheckIns.some((c: any) => c.customerId === customer.id);
                    const address = customer.address || customer.street || '';

                    return (
                        <div key={customer.id} className={`bg-card border rounded-2xl shadow-sm overflow-hidden transition-all ${visitedToday ? 'border-success/30 opacity-80' : 'border-border/50'}`}>
                            <div className={`flex items-center justify-between px-4 py-2 ${visitedToday ? 'bg-success/8' : index === 0 ? 'bg-primary/8' : 'bg-muted/30'}`}>
                                <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${visitedToday ? 'bg-success text-white' : index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                                        {visitedToday ? '✓' : index + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${visitedToday ? 'text-success' : 'text-muted-foreground'}`}>
                                        {visitedToday ? 'Visited Today' : `Stop ${index + 1}`}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.color}`}>{priority.label}</span>
                            </div>

                            <div className="px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-heading font-bold text-foreground">{customer.name}</p>
                                        {address && (
                                            <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">{address}</span>
                                            </p>
                                        )}
                                        {customer.phone && (
                                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                <Phone className="h-3 w-3 shrink-0" />{customer.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] text-muted-foreground">Last visit</p>
                                        <p className={`text-xs font-bold ${days > 14 ? 'text-destructive' : days > 7 ? 'text-yellow-600' : 'text-success'}`}>
                                            {days === 999 ? 'Never' : days === 0 ? 'Today' : `${days}d ago`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                    {address && (
                                        <button
                                            onClick={() => setNavCustomer(customer)}
                                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                                        >
                                            <Navigation className="h-3.5 w-3.5" /> Navigate
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setCheckingInId(customer.id); setNotes(""); setPhotoPreview(null); setPhotoData(null); }}
                                        disabled={visitedToday}
                                        className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-bold transition-colors ${visitedToday ? 'bg-success/10 text-success cursor-not-allowed' : 'bg-muted text-foreground hover:bg-muted/70'}`}
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        {visitedToday ? 'Done' : 'Check In'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {todayCheckIns.length > 0 && (
                    <div className="mt-6">
                        <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                            <Calendar className="h-3 w-3 inline mr-1" /> Today's Check-In Log
                        </p>
                        <div className="space-y-2">
                            {todayCheckIns.map((ci: any) => (
                                <div key={ci.id} className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-start gap-3">
                                    <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground">{ci.customerName}</p>
                                        {ci.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ci.notes}</p>}
                                        {ci.hasPhoto && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-primary mt-1">
                                                <Camera className="h-3 w-3" /> Photo attached
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {new Date(ci.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Check-in bottom sheet */}
            {checkingInId && checkingInCustomer && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCheckingInId(null)} />
                    <div className="relative bg-card rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 z-10">
                        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-heading font-bold text-foreground">Check In</h2>
                                <p className="text-sm text-primary font-medium">{checkingInCustomer.name}</p>
                            </div>
                            <button onClick={() => setCheckingInId(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Restocked display, discussed new range, met with manager..."
                            rows={3}
                            className="w-full bg-muted rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-4"
                        />

                        <div className="mb-5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Photo (optional)</label>
                            {photoPreview ? (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted">
                                    <img src={photoPreview} alt="Visit photo" className="w-full h-full object-cover" />
                                    <button onClick={() => { setPhotoPreview(null); setPhotoData(null); }}
                                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-24 rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                                    <Camera className="h-6 w-6" />
                                    <span className="text-xs font-medium">Take Photo / Upload</span>
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                        </div>

                        <button
                            onClick={() => checkInMutation.mutate({ customerId: checkingInId!, customerName: checkingInCustomer.name })}
                            disabled={checkInMutation.isPending}
                            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                            {checkInMutation.isPending
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                : <><CheckCircle className="h-4 w-4" /> Confirm Check-In</>}
                        </button>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}
