import { useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/apiFetch";

interface LocationHookOptions {
    enabled?: boolean;
    intervalMs?: number;
}

/**
 * Watches the browser's GPS and sends location heartbeats to /api/location.
 * Returns { lat, lng, error, isTracking }
 */
export function useLocationTracking({ enabled = true, intervalMs = 45000 }: LocationHookOptions = {}) {
    const watchIdRef = useRef<number | null>(null);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const latestPosRef = useRef<{ lat: number; lng: number } | null>(null);

    const sendHeartbeat = useCallback(async () => {
        if (!latestPosRef.current) return;
        try {
            await apiFetch("/api/location", {
                method: "POST",
                body: JSON.stringify(latestPosRef.current)
            });
        } catch {
            // fail silently — location tracking non-critical
        }
    }, []);

    useEffect(() => {
        if (!enabled || !("geolocation" in navigator)) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                latestPosRef.current = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
            },
            (err) => console.warn("GPS error:", err.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );

        // Send immediately, then on interval
        sendHeartbeat();
        heartbeatRef.current = setInterval(sendHeartbeat, intervalMs);

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        };
    }, [enabled, intervalMs, sendHeartbeat]);
}
