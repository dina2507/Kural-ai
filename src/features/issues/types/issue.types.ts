export type IssueCategory =
  | 'pothole' | 'water_leakage' | 'streetlight' | 'garbage'
  | 'drainage' | 'road_damage' | 'tree_hazard' | 'encroachment'
  | 'noise' | 'other';

export type IssueStatus =
  | 'reported' | 'ai_verified' | 'community_confirmed'
  | 'in_progress' | 'resolved' | 'closed' | 'rejected';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: number;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address: string;
  ward: string;
  images: string[];
  resolutionImage: string | null;
  aiTags: string[];
  aiAnalysis: Record<string, unknown>;
  confirmationCount: number;
  viewCount: number;
  resolutionVerified: boolean | null;
  resolutionConfidence: number | null;
  resolutionReasoning: string | null;
  reporterId: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}
