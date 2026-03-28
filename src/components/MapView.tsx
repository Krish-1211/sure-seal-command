import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Marker {
    lat: number;
    lng: number;
    label?: string;
    color?: "blue" | "red" | "green" | "orange" | "purple";
    popup?: string;
}

interface RouteResult {
    steps: { instruction: string; distance: number }[];
    totalDistance: number;
    totalDuration: number;
}

interface MapViewProps {
    className?: string;
    center?: [number, number];
    zoom?: number;
    markers?: Marker[];
    routeFrom?: [number, number];
    routeTo?: [number, number];
    breadcrumbRoute?: [number, number][];
    onRouteLoaded?: (result: RouteResult) => void;
}

const COLOR_MAP: Record<string, string> = {
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#22c55e",
    orange: "#f97316",
    purple: "#8b5cf6",
};

function makeIcon(color: string) {
    const c = COLOR_MAP[color] || COLOR_MAP.blue;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8.25 12 24 12 24S24 20.25 24 12C24 5.373 18.627 0 12 0z" fill="${c}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
        className: ""
    });
}

async function fetchRoute(from: [number, number], to: [number, number]): Promise<{ coords: [number, number][]; steps: RouteResult }> {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?steps=true&geometries=geojson&overview=full`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok") throw new Error("Route not found");
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
    const steps = route.legs[0].steps.map((s: any) => ({
        instruction: s.maneuver?.instruction || s.name || "Continue",
        distance: Math.round(s.distance)
    }));
    return {
        coords,
        steps: {
            steps,
            totalDistance: Math.round(route.distance / 1000 * 10) / 10,
            totalDuration: Math.round(route.duration / 60)
        }
    };
}

export function MapView({ className = "w-full h-64", center, zoom = 13, markers = [], routeFrom, routeTo, breadcrumbRoute, onRouteLoaded }: MapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const breadcrumbLayerRef = useRef<L.Polyline | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;
        const defaultCenter: [number, number] = center || [-33.8688, 151.2093]; // Sydney fallback

        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current, {
                center: defaultCenter,
                zoom,
                zoomControl: true,
                attributionControl: false,
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap"
            }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new markers
        markers.forEach(m => {
            const marker = L.marker([m.lat, m.lng], { icon: makeIcon(m.color || "blue") })
                .addTo(map);
            if (m.popup) marker.bindPopup(m.popup);
            if (m.label) marker.bindTooltip(m.label, { permanent: true, direction: "top", offset: [0, -36] });
            markersRef.current.push(marker);
        });

        // Auto-fit bounds if we have markers
        if (markers.length > 1) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]));
            map.fitBounds(bounds, { padding: [40, 40] });
        } else if (markers.length === 1) {
            map.setView([markers[0].lat, markers[0].lng], zoom);
        }

        // Draw route
        if (routeFrom && routeTo) {
            if (routeLayerRef.current) routeLayerRef.current.remove();
            fetchRoute(routeFrom, routeTo).then(({ coords, steps }) => {
                routeLayerRef.current = L.polyline(coords, {
                    color: "#3b82f6", weight: 5, opacity: 0.85, lineCap: "round"
                }).addTo(map);
                map.fitBounds(routeLayerRef.current.getBounds(), { padding: [30, 30] });
                onRouteLoaded?.(steps);
            }).catch(console.error);
        }

        // Draw breadcrumbs (Step 6)
        if (breadcrumbRoute && breadcrumbRoute.length > 1) {
            if (breadcrumbLayerRef.current) breadcrumbLayerRef.current.remove();
            breadcrumbLayerRef.current = L.polyline(breadcrumbRoute, {
                color: "#64748b", weight: 3, opacity: 0.5, dashArray: "5, 10"
            }).addTo(map);
        }

        return () => {
            // Don't destroy — just update
        };
    }, [markers, routeFrom, routeTo, breadcrumbRoute, center, zoom]);

    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return <div ref={containerRef} className={className} style={{ borderRadius: "inherit" }} />;
}
