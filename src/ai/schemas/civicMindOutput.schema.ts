import { z } from 'zod';

const clusterSchema = z.object({
  id: z.string(),
  category: z.string(),
  ward: z.string(),
  issueIds: z.array(z.string()),
  issueCount: z.number().int().min(1),
  centerLat: z.number(),
  centerLng: z.number(),
  locationDescription: z.string(),
  avgSeverity: z.number(),
  urgencyScore: z.number().int().min(0).max(100),
  urgencyRationale: z.string(),
  department: z.string(),
  escalationLetter: z.string().nullable(),
});

export const civicMindOutputSchema = z.object({
  clusters: z.array(clusterSchema),
  healthScore: z.number().int().min(0).max(100),
  healthRationale: z.string(),
  totalAnalyzed: z.number().int(),
  criticalCount: z.number().int(),
  recommendedActions: z.array(z.string()).max(5),
});

export type CivicMindOutput = z.infer<typeof civicMindOutputSchema>;
