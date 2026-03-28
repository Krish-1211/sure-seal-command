import { useEffect, useRef, useCallback, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { getDistance } from "geolib";

interface LocationHookOptions {
    enabled?: boolean;
    intervalMs?: number; // Minimum time between heartbeats
    minDistance?: number; // Minimum movement (meters) before forcing heartbeat
    maxAccuracy?: number; // Maximum meters of uncertainty allowed
}

interface LocationState {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
}

/**
 * 🛰️ Elite Location Tracking System
 */
export function useLocationTracking({ 
    enabled = true, 
    intervalMs = 30000,
    minDistance = 20,   // noise filter
    maxAccuracy = 50,
    maxSpeedKmh = 140   // Step 1: Ignore "teleportation" spikes
}: LocationHookOptions & { maxSpeedKmh?: number } = {}) {
    const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);
    
    const watchIdRef = useRef<number | null>(null);
    const lastSentRef = useRef<number>(0);
    const lastPosRef = useRef<LocationState | null>(null);

    const sendHeartbeat = useCallback(async (lat: number, lng: number, accuracy: number) => {
        const now = Date.now();
        const timeDiff = now - lastSentRef.current;
        
        // 1. Accuracy Filter
        if (accuracy > maxAccuracy) return;

        // 2. Speed-based Sanity Check (Step 1)
        if (lastPosRef.current) {
            const distance = getDistance(
                { latitude: lastPosRef.current.lat, longitude: lastPosRef.current.lng }, 
                { latitude: lat, longitude: lng }
            );
            
            const timeSeconds = (now - lastPosRef.current.timestamp) / 1000;
            if (timeSeconds > 0) {
                const speedKmh = (distance / timeSeconds) * 3.6;
                if (speedKmh > maxSpeedKmh) {
                    console.warn(`[GPS] Suppressing teleportation spike: ${Math.round(speedKmh)}km/h`);
                    return;
                }
            }

            // 3. Duplicate heartbeat logic (Step 2)
            // If moved less than minDistance AND it hasn't been long enough, skip heartbeat
            if (distance < minDistance && timeDiff < intervalMs * 4) {
                return;
            }
        }

        // Update local state
        const state: LocationState = { lat, lng, accuracy, timestamp: now };
        setCurrentLocation(state);
        
        // 4. Breadcrumb Overload check (Step 3: max 200 points)
        setRoute(prev => {
            const last = prev[prev.length - 1];
            if (last && last[0] === lat && last[1] === lng) return prev;
            const next: [number, number][] = [...prev, [lat, lng] as [number, number]];
            return next.slice(-200);
        });

        lastSentRef.current = now;
        lastPosRef.current = state;

        // 📴 Offline Support
        if (!navigator.onLine) {
            import("@/services/sync.service").then(({ SyncService }) => {
                SyncService.addToQueue('LOCATION_HEARTBEAT', { lat, lng, accuracy, timestamp: now }, 8);
            });
            return;
        }

        try {
            await apiFetch("/api/location", {
                method: "POST",
                body: JSON.stringify({ lat, lng, accuracy })
            });
        } catch {
            lastSentRef.current = 0;
        }
    }, [intervalMs, minDistance, maxAccuracy, maxSpeedKmh]);

    useEffect(() => {
        if (!enabled || !("geolocation" in navigator)) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                sendHeartbeat(
                    pos.coords.latitude, 
                    pos.coords.longitude, 
                    pos.coords.accuracy
                );
            },
            (err) => {
                console.warn("[GPS] Watch Error:", err.message);
            },
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [enabled, sendHeartbeat]);

    return { currentLocation, route };
}

const toast = {
    error: (msg: string) => console.error(msg)
};
