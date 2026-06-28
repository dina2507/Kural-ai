import { z } from 'zod';

export const resolutionOutputSchema = z.object({
  verified: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  visualEvidence: z.string(),
  locationMatch: z.boolean(),
});

export type ResolutionAgentOutput = z.infer<typeof resolutionOutputSchema>;
