import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

export function HeatmapLayer({ data }: { data: any[] }) {
  const map = useMap();
  const visualization = useMapsLibrary('visualization');
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!visualization || !map) return;
    
    if (!heatmap) {
      setHeatmap(
        new (visualization.HeatmapLayer as any)({
          map,
          radius: 40,
          opacity: 0.7,
          gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(255, 0, 0, 1)',
          ],
        })
      );
    }
  }, [visualization, map, heatmap]);

  useEffect(() => {
    if (heatmap && visualization) {
      const gData = data.map(point => ({
         location: new google.maps.LatLng(point.lat, point.lng),
         weight: point.weight
      }));
      heatmap.setData(gData);
    }
  }, [data, heatmap, visualization]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    };
  }, [heatmap]);

  return null;
}
