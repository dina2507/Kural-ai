import { getGeminiClient } from '../client';
import { CIVIC_MIND_SYSTEM_PROMPT, buildCivicMindUserPrompt } from '../prompts/civicMind.prompt';
import { civicMindOutputSchema, CivicMindOutput } from '../schemas/civicMindOutput.schema';
import { APP_CONFIG } from '../../lib/config';
import type { Issue } from '../../features/issues/types/issue.types';

export async function runCivicMindAgent(issues: Issue[]): Promise<CivicMindOutput> {
  const ai = getGeminiClient();

  const issuesSummary = issues.map(i => ({
    id: i.id,
    category: i.category,
    severity: i.severity,
    lat: i.latitude,
    lng: i.longitude,
    ward: i.ward,
    address: i.address,
    daysOpen: Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000),
    confirmations: i.confirmationCount,
  }));

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: buildCivicMindUserPrompt(issuesSummary) }],
      }
    ],
    config: {
      systemInstruction: CIVIC_MIND_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 2048,
    }
  });

  const raw = result.text;
  if (!raw) {
    throw new Error('No text response from model');
  }
  const parsed = JSON.parse(raw);
  return civicMindOutputSchema.parse(parsed);
}
