import { z } from 'zod';
import { APP_CONFIG } from '../config';

export const createIssueSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(1000).optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.enum(APP_CONFIG.issues.categories as unknown as [string, ...string[]]),
  severity: z.number().int().min(1).max(10),
  images: z.array(z.string()).default([]),
  aiAnalysis: z.record(z.string(), z.unknown()).default({}),
  aiTags: z.array(z.string()).default([]),
});
