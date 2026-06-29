import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

interface StaticMapPreviewProps {
  latitude: number;
  longitude: number;
}

export function StaticMapPreview({ latitude, longitude }: StaticMapPreviewProps) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const position = { lat, lng };
  
  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border">
      <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Location Preview
      </h3>
      <div className="w-full h-48 rounded-lg overflow-hidden border border-border bg-bg-elevated">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} libraries={['visualization', 'marker']}>
          <Map
            defaultCenter={position}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            gestureHandling="none"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <AdvancedMarker position={position}>
              <Pin background="#4285F4" glyphColor="#fff" borderColor="#1e3a8a" />
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
