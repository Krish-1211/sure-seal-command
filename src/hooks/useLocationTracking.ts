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
    const lastSentRef = useRef<number>(0);

    const sendHeartbeat = useCallback(async (lat: number, lng: number) => {
        const now = Date.now();
        if (now - lastSentRef.current < intervalMs) return;

        lastSentRef.current = now;
        try {
            await apiFetch("/api/location", {
                method: "POST",
                body: JSON.stringify({ lat, lng })
            });
        } catch {
            lastSentRef.current = 0; // reset on fail so it re-attempts
        }
    }, [intervalMs]);

    useEffect(() => {
        if (!enabled || !("geolocation" in navigator)) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                sendHeartbeat(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => console.warn("GPS error:", err.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [enabled, sendHeartbeat]);
}
