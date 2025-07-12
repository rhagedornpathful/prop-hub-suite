import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, MapPin } from "lucide-react";

interface PropertyMapProps {
  properties?: any[];
  isLoading?: boolean;
}

export function PropertyMap({ properties = [], isLoading }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapError, setMapError] = useState<string>('');

  const initializeMap = async (token: string) => {
    if (!mapContainer.current) return;

    try {
      // Dynamically import mapbox-gl
      const mapboxgl = (await import('mapbox-gl')).default;
      await import('mapbox-gl/dist/mapbox-gl.css');

      // Set access token
      mapboxgl.accessToken = token;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-95.7129, 37.0902], // Center of US
        zoom: 4
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for properties
      if (properties && properties.length > 0) {
        properties.forEach((property) => {
          // For demo, we'll place markers at random locations around the US
          // In a real app, you'd geocode the addresses
          const lng = -125 + Math.random() * 50; // Random longitude across US
          const lat = 25 + Math.random() * 25; // Random latitude across US
          
          // Create marker
          const marker = new mapboxgl.Marker({
            color: property.status === 'active' ? '#22c55e' : '#6b7280'
          })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-3">
                    <h3 class="font-semibold text-sm">${property.address}</h3>
                    <p class="text-xs text-gray-600">${property.property_type || 'Property'}</p>
                    <p class="text-xs font-medium">$${(property.monthly_rent || 0).toLocaleString()}/month</p>
                    <span class="inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      property.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }">
                      ${property.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                `)
            )
            .addTo(map.current);
        });

        // Fit map to show all markers (rough approximation)
        if (properties.length > 0) {
          map.current.fitBounds([[-125, 25], [-75, 50]], { padding: 50 });
        }
      }

      setShowTokenInput(false);
      setMapError('');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please check your Mapbox token.');
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken.trim());
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showTokenInput) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="p-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Map View Setup</h3>
              <p className="text-sm text-muted-foreground">
                Enter your Mapbox public token to view properties on the map
              </p>
            </div>
            
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Get your free Mapbox token at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  mapbox.com
                </a>{' '}
                in the Tokens section of your dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
              />
            </div>

            {mapError && (
              <Alert variant="destructive">
                <AlertDescription>{mapError}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleTokenSubmit} 
              className="w-full"
              disabled={!mapboxToken.trim()}
            >
              Initialize Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-0">
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapContainer} className="h-96 w-full rounded-lg" />
          {properties && properties.length > 0 && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-success text-success-foreground">●</Badge>
                <span>Active ({properties.filter(p => p.status === 'active').length})</span>
                <Badge className="bg-muted text-muted-foreground ml-2">●</Badge>
                <span>Inactive ({properties.filter(p => p.status !== 'active').length})</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}