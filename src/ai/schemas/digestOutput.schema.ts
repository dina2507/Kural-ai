import { z } from 'zod';

export const digestOutputSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  keyHighlight: z.string(),
  topConcern: z.string(),
  citizenHeroReason: z.string().nullable(),
  nextWeekWatch: z.string(),
});

export type DigestAgentOutput = z.infer<typeof digestOutputSchema>;
