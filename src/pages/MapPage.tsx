import { KuralMap } from '@/features/map/components/KuralMap';
import { MapFilterPanel } from '@/features/map/components/MapFilterPanel';

export function MapPage() {
  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex gap-4 -m-4 md:-m-8">
      {/* Desktop Filter Panel */}
      <div className="hidden md:block w-[280px] shrink-0">
        <MapFilterPanel />
      </div>
      
      {/* Map Area */}
      <div className="flex-1 relative">
        <KuralMap />
        
        {/* Mobile Filter Button (Placeholder for Sheet) */}
        <div className="absolute bottom-6 right-6 md:hidden">
          <button className="bg-primary text-white px-4 py-3 rounded-full shadow-lg font-medium text-sm">
            Filters
          </button>
        </div>
      </div>
    </div>
  );
}
