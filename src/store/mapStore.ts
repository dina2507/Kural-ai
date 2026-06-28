import { create } from 'zustand';

export interface MapFilters {
  category: string[];
  severityMin: number;
  status: string[];
}

interface MapState {
  filters: MapFilters;
  setFilter: (key: keyof MapFilters, value: any) => void;
  resetFilters: () => void;
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
}

const initialFilters: MapFilters = {
  category: [],
  severityMin: 1,
  status: [],
};

export const useMapStore = create<MapState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) => set((state) => ({ 
    filters: { ...state.filters, [key]: value } 
  })),
  resetFilters: () => set({ filters: initialFilters }),
  selectedIssueId: null,
  setSelectedIssueId: (id) => set({ selectedIssueId: id }),
}));
