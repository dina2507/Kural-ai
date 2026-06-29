import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Issue } from '../../issues/types/issue.types';
import { useMapStore } from '../../../store/mapStore';
import { IssueInfoWindow } from './IssueInfoWindow';
import { motion, AnimatePresence } from 'motion/react';

export function IssueMarker({ issue, setMarkerRef }: { issue: Issue; key?: React.Key; setMarkerRef?: (marker: any) => void }) {
  const { selectedIssueId, setSelectedIssueId } = useMapStore();
  const isSelected = selectedIssueId === issue.id;

  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return '#EF4444'; // critical
    if (severity >= 7) return '#F97316'; // high
    if (severity >= 4) return '#F59E0B'; // medium
    return '#10B981'; // low
  };

  const color = getSeverityColor(issue.severity);
  const size = issue.severity >= 9 ? 40 : issue.severity >= 7 ? 36 : issue.severity >= 4 ? 32 : 28;

  return (
    <>
      <AdvancedMarker
        ref={setMarkerRef}
        position={{ lat: issue.latitude, lng: issue.longitude }}
        onClick={() => setSelectedIssueId(isSelected ? null : issue.id)}
        className={`cursor-pointer transition-transform ${isSelected ? 'scale-125 z-10' : 'z-0'}`}
      >
        <div 
          className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
          style={{ width: size, height: size, backgroundColor: color }}
        >
          {isSelected && (
            <motion.div 
              layoutId="marker-pulse"
              className="absolute inset-0 rounded-full bg-white opacity-40 animate-ping" 
            />
          )}
        </div>
      </AdvancedMarker>
      
      <AnimatePresence>
        {isSelected && (
           <IssueInfoWindow issue={issue} onClose={() => setSelectedIssueId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
