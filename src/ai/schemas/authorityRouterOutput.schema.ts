import { z } from 'zod';

export const authorityRouterOutputSchema = z.object({
  authorityName: z.string(),
  department: z.string().nullable(),
  helpline: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export type AuthorityRouterOutput = z.infer<typeof authorityRouterOutputSchema>;
