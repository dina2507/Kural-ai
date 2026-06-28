import { create } from 'zustand';
import { VisionAgentOutput } from '../../../ai/schemas/visionOutput.schema';
import { IssueCategory } from '../../issues/types/issue.types';

export interface WizardState {
  step: 1 | 2 | 3;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  location: { lat: number; lng: number } | null;
  analysis: VisionAgentOutput | null;
  
  title: string;
  description: string;
  category: IssueCategory | '';
  severity: number;
  
  setStep: (step: 1 | 2 | 3) => void;
  setImage: (file: File, previewUrl: string) => void;
  setLocation: (lat: number, lng: number) => void;
  setAnalysis: (analysis: VisionAgentOutput) => void;
  updateForm: (updates: Partial<WizardState>) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  imageFile: null,
  imagePreviewUrl: null,
  location: null,
  analysis: null,
  title: '',
  description: '',
  category: '' as const,
  severity: 5,
};

export const useReportWizard = create<WizardState>((set) => ({
  ...initialState,
  
  setStep: (step) => set({ step }),
  
  setImage: (imageFile, imagePreviewUrl) => set({ imageFile, imagePreviewUrl }),
  
  setLocation: (lat, lng) => set({ location: { lat, lng } }),
  
  setAnalysis: (analysis) => set({
    analysis,
    title: analysis.title,
    description: analysis.description,
    category: analysis.category as IssueCategory,
    severity: analysis.severity,
  }),
  
  updateForm: (updates) => set((state) => ({ ...state, ...updates })),
  
  reset: () => set(initialState),
}));
