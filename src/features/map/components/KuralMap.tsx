import { useEffect, useMemo } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useIssues } from '../../issues/hooks/useIssues';
import { useMapStore } from '../../../store/mapStore';
import { APP_CONFIG } from '../../../lib/config';
import { IssueMarker } from './IssueMarker';
import { HeatmapLayer } from './HeatmapLayer';
import { supabase } from '../../../lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export function KuralMap() {
  const { filters } = useMapStore();
  const { data: issues = [] } = useIssues();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('issues-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issues' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['issues'] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Client side filtering for Phase 2
  const filteredIssues = issues.filter(issue => {
    if (filters.category.length > 0 && !filters.category.includes(issue.category)) return false;
    if (issue.severity < filters.severityMin) return false;
    if (filters.status.length > 0 && !filters.status.includes(issue.status)) return false;
    return true;
  });

  const heatmapData = useMemo(() => {
    return filteredIssues.map(issue => ({
       lat: issue.latitude,
       lng: issue.longitude,
       weight: issue.severity / 10
    }));
  }, [filteredIssues]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} libraries={['visualization', 'marker']}>
        <Map
          defaultCenter={APP_CONFIG.maps.defaultCenter}
          defaultZoom={APP_CONFIG.maps.defaultZoom}
          mapId={APP_CONFIG.maps.darkMapId}
          disableDefaultUI={true}
          zoomControl={true}
        >
          {filters.viewMode === 'heatmap' ? (
             <HeatmapLayer data={heatmapData} />
          ) : (
            filteredIssues.map((issue) => (
              <IssueMarker key={issue.id} issue={issue} />
            ))
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
