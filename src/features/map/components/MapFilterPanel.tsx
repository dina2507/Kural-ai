import { APP_CONFIG } from '../../../lib/config';
import { useMapStore } from '../../../store/mapStore';

export function MapFilterPanel() {
  const { filters, setFilter, resetFilters } = useMapStore();

  const handleCategoryToggle = (cat: string) => {
    const newCats = filters.category.includes(cat)
      ? filters.category.filter(c => c !== cat)
      : [...filters.category, cat];
    setFilter('category', newCats);
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilter('status', newStatus);
  };

  return (
    <div className="bg-bg-surface border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Filters</h2>
        <button onClick={resetFilters} className="text-xs text-primary hover:underline">Clear all</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">View Mode</h3>
          <div className="flex gap-2 p-1 bg-bg-elevated rounded-lg">
            <button 
              onClick={() => setFilter('viewMode', 'pins')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filters.viewMode === 'pins' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Issue Pins
            </button>
            <button 
              onClick={() => setFilter('viewMode', 'heatmap')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filters.viewMode === 'heatmap' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Risk Heatmap
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Severity (Min: {filters.severityMin})</h3>
          <input 
            type="range" 
            min="1" max="10" 
            value={filters.severityMin}
            onChange={(e) => setFilter('severityMin', parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-tertiary mt-1">
            <span>Low</span>
            <span>Critical</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Categories</h3>
          <div className="space-y-2">
            {APP_CONFIG.issues.categories.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.category.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="rounded border-border bg-bg-base text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary capitalize">{cat.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Status</h3>
          <div className="space-y-2">
            {['reported', 'ai_verified', 'community_confirmed', 'in_progress', 'resolved', 'closed'].map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="rounded border-border bg-bg-base text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary capitalize">{status.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
