import { getGeminiClient } from '../client';
import { DIGEST_SYSTEM_PROMPT, buildDigestUserPrompt, DigestAgentInput } from '../prompts/digest.prompt';
import { digestOutputSchema, DigestAgentOutput } from '../schemas/digestOutput.schema';
import { APP_CONFIG } from '../../lib/config';

export async function runDigestAgent(input: DigestAgentInput): Promise<DigestAgentOutput> {
  const ai = getGeminiClient();

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: buildDigestUserPrompt(input) }]
      }
    ],
    config: {
      systemInstruction: DIGEST_SYSTEM_PROMPT,
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
  return digestOutputSchema.parse(parsed);
}
