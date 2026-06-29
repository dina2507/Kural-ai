import { z } from 'zod';
import { APP_CONFIG } from '../../lib/config';

export const visionOutputSchema = z.object({
  category: z.enum(APP_CONFIG.issues.categories as unknown as [string, ...string[]]),
  severity: z.number().int().min(1).max(10),
  confidence: z.number().min(0).max(1),
  title: z.string().min(3).max(200),
  description: z.string().max(1000),
  tags: z.array(z.string()).max(10),
  riskFactors: z.array(z.string()).max(5),
  isDuplicate: z.boolean(),
  duplicateId: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  urgencyReasoning: z.string(),
});

export type VisionAgentOutput = z.infer<typeof visionOutputSchema>;
