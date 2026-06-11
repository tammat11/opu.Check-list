"use client";

import { useEffect, useRef } from "react";

interface MapPin {
  lat: number;
  lng: number;
  label: string;
  color?: string;
}

interface MapViewProps {
  pins?: MapPin[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function MapView({ pins = [], center = [43.238, 76.946], zoom = 12, className = "" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      pins.forEach((pin) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:${pin.color ?? "#7EC850"};
            color:#1a1a1a;
            font-size:10px;
            font-weight:900;
            font-family:sans-serif;
            padding:4px 8px;
            border-radius:20px;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            border:2px solid white;
            transform:translateX(-50%);
            position:relative;
          ">${pin.label}</div>`,
          iconAnchor: [0, 0],
        });
        L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
