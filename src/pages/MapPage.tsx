import { useState } from 'react';
import { KuralMap } from '@/features/map/components/KuralMap';
import { MapFilterPanel } from '@/features/map/components/MapFilterPanel';

export function MapPage() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex gap-4 -m-4 md:-m-8">
      {/* Desktop Filter Panel */}
      <div className="hidden md:block w-[280px] shrink-0">
        <MapFilterPanel />
      </div>
      
      {/* Map Area */}
      <div className="flex-1 relative">
        <KuralMap />
        
        {/* Mobile Filter Button */}
        <div className="absolute bottom-6 right-6 md:hidden">
          <button 
            onClick={() => setShowFilters(true)}
            className="bg-primary text-white px-4 py-3 rounded-full shadow-lg font-medium text-sm"
          >
            Filters
          </button>
        </div>

        {/* Mobile Filter Sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowFilters(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bottom-0 left-0 right-0 bg-bg-surface rounded-t-2xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold text-text-primary">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-text-secondary text-sm">Close</button>
              </div>
              <div className="p-4">
                <MapFilterPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
