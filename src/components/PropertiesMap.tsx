import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Simple cache to avoid repeated geocoding during a session
const geocodeCache = new Map<string, [number, number]>();

type Property = {
  id: string;
  address: string;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
};

interface PropertiesMapProps {
  properties: Property[];
}

const buildFullAddress = (p: Property) => {
  const parts = [
    p.street_address || p.address,
    [p.city, p.state].filter(Boolean).join(', '),
    p.zip_code || '',
  ].filter(Boolean);
  return parts.join(' ');
};

async function geocodeAddress(address: string, token: string): Promise<[number, number] | null> {
  if (geocodeCache.has(address)) return geocodeCache.get(address)!;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.features?.[0]?.center as [number, number] | undefined;
    if (coords) {
      geocodeCache.set(address, coords);
      // persist lightly in sessionStorage
      try {
        const persisted = JSON.parse(sessionStorage.getItem('mbx_geocode_cache') || '{}');
        persisted[address] = coords;
        sessionStorage.setItem('mbx_geocode_cache', JSON.stringify(persisted));
      } catch {}
      return coords;
    }
    return null;
  } catch {
    return null;
  }
}

function loadPersistedCache() {
  try {
    const persisted = JSON.parse(sessionStorage.getItem('mbx_geocode_cache') || '{}');
    Object.entries(persisted).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length === 2) geocodeCache.set(k, v as [number, number]);
    });
  } catch {}
}

export const PropertiesMap: React.FC<PropertiesMapProps> = ({ properties }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('mapbox_public_token') || '');
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addresses = useMemo(() => properties.map(buildFullAddress).filter(Boolean), [properties]);

  useEffect(() => {
    loadPersistedCache();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!token) {
      setInitializing(false);
      return;
    }

    try {
      mapboxgl.accessToken = token;
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // USA center fallback
        zoom: 3,
        projection: 'globe',
        pitch: 30,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      mapRef.current.scrollZoom.disable();

      mapRef.current.on('style.load', () => {
        mapRef.current?.setFog({
          color: 'rgb(255,255,255)',
          'high-color': 'rgb(200,200,225)',
          'horizon-blend': 0.2,
        });
      });

      const run = async () => {
        const results = await Promise.all(
          properties.map(async (p) => {
            const full = buildFullAddress(p);
            if (!full) return null;
            const coords = await geocodeAddress(full, token);
            return coords ? { p, coords } : null;
          })
        );

        const valid = results.filter(Boolean) as { p: Property; coords: [number, number] }[];
        if (valid.length === 0) {
          setInitializing(false);
          return;
        }

        const bounds = new mapboxgl.LngLatBounds();
        valid.forEach(({ p, coords }) => {
          const marker = new mapboxgl.Marker({ color: '#2563eb' }) // using semantic primary-like color
            .setLngLat(coords)
            .setPopup(
              new mapboxgl.Popup({ offset: 12 }).setHTML(`
                <div style="min-width:200px">
                  <div style="font-weight:600;margin-bottom:4px">${p.address}</div>
                  <a href="/properties/${p.id}" style="color:#2563eb;text-decoration:underline">View details</a>
                </div>
              `)
            )
            .addTo(mapRef.current!);
          try { bounds.extend(coords as [number, number]); } catch {}
        });

        try {
          if (!bounds.isEmpty()) {
            mapRef.current?.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 800 });
          }
        } catch {}

        setInitializing(false);
      };

      run();
    } catch (e: any) {
      setError(e?.message || 'Failed to initialize map');
      setInitializing(false);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token, addresses.join('|')]);

  const handleSaveToken = () => {
    sessionStorage.setItem('mapbox_public_token', token);
    // Re-init will happen via useEffect dependency
  };

  return (
    <div className="space-y-3">
      {!token && (
        <div className="rounded-lg border p-3">
          <div className="text-sm mb-2">
            Enter your Mapbox public token to enable the map. In production, store it in Supabase Edge Function Secrets and fetch it securely.
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="pk.******************"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button
              onClick={handleSaveToken}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full h-[60vh] rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="absolute inset-0" />
        {initializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Loading map…</div>
          </div>
        )}
        {error && (
          <div className="absolute bottom-2 left-2 right-2 text-xs text-destructive bg-background/80 rounded-md p-2 border">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesMap;
