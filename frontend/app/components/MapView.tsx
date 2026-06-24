"use client";

import { useEffect, useRef, useState } from "react";

interface MapPin {
  lat: number;
  lng: number;
  label: string;
  color?: string;
}

interface MapViewProps {
  pins?: MapPin[];
  circles?: { lat: number; lng: number; radius: number; color?: string; fillColor?: string }[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;
type LeafletCircle = import("leaflet").Circle;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function MapView({
  pins = [],
  circles = [],
  center = [51.1282, 71.4304],
  zoom = 12,
  className = "",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const circlesRef = useRef<LeafletCircle[]>([]);
  const leafletRef = useRef<LeafletModule | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = L;
      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      circlesRef.current.forEach((circle) => circle.remove());
      circlesRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      leafletRef.current = null;
      setMapReady(false);
    };
  }, [center, zoom]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    circlesRef.current.forEach((circle) => circle.remove());
    circlesRef.current = [];
    map.invalidateSize();

    if (pins.length === 0) {
      map.setView(center, zoom);
      return;
    }

    const bounds = L.latLngBounds([]);
    circlesRef.current = circles.map((circle) => {
      const nextCircle = L.circle([circle.lat, circle.lng], {
        radius: circle.radius,
        color: circle.color ?? "#7EC850",
        fillColor: circle.fillColor ?? circle.color ?? "#7EC850",
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);
      bounds.extend(nextCircle.getBounds());
      return nextCircle;
    });

    markersRef.current = pins.map((pin) => {
      const icon = L.divIcon({
        className: "opu-map-marker",
        html: `
          <div style="display:flex;align-items:center;gap:8px;max-width:190px;transform:translate(-50%, -50%);">
            <span style="
              width:14px;
              height:14px;
              min-width:14px;
              border-radius:999px;
              background:${pin.color ?? "#7EC850"};
              border:2px solid #ffffff;
              box-shadow:0 6px 16px rgba(15,23,42,0.22);
            "></span>
            <span style="
              display:inline-block;
              max-width:168px;
              padding:6px 10px;
              border-radius:999px;
              background:rgba(255,255,255,0.96);
              color:#1f2937;
              font-size:11px;
              line-height:1.1;
              font-weight:800;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;
              box-shadow:0 8px 20px rgba(15,23,42,0.16);
              border:1px solid rgba(15,23,42,0.08);
            ">${escapeHtml(pin.label)}</span>
          </div>
        `,
        iconSize: [190, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      bounds.extend([pin.lat, pin.lng]);
      return marker;
    });

    if (pins.length === 1 && circles.length === 0) {
      map.setView([pins[0].lat, pins[0].lng], Math.max(zoom, 14));
    } else {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [pins, circles, center, zoom, mapReady]);

  return (
    <div className={className}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
