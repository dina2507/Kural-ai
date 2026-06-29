import { getGeminiClient } from '../client';
import { RESOLUTION_SYSTEM_PROMPT, buildResolutionUserPrompt } from '../prompts/resolution.prompt';
import { resolutionOutputSchema, ResolutionAgentOutput } from '../schemas/resolutionOutput.schema';
import { APP_CONFIG } from '../../lib/config';
import { parseJsonFromMarkdown } from '../utils';

interface ResolutionAgentInput {
  beforeImageBase64: string;
  afterImageBase64: string;
  beforeMimeType: string;
  afterMimeType: string;
  category: string;
  originalDescription: string;
}

export async function runResolutionAgent(input: ResolutionAgentInput): Promise<ResolutionAgentOutput> {
  const ai = getGeminiClient();

  for (let attempt = 1; attempt <= APP_CONFIG.ai.maxRetries; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: APP_CONFIG.ai.model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'BEFORE image (original issue):' },
              { inlineData: { mimeType: input.beforeMimeType, data: input.beforeImageBase64 } },
              { text: 'AFTER image (claimed resolution):' },
              { inlineData: { mimeType: input.afterMimeType, data: input.afterImageBase64 } },
              { text: buildResolutionUserPrompt(input.category, input.originalDescription) },
            ]
          }
        ],
        config: {
          systemInstruction: RESOLUTION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      });

      const raw = result.text;
      if (!raw) {
         throw new Error("No text response from model");
      }
      const parsed = parseJsonFromMarkdown(raw);
      return resolutionOutputSchema.parse(parsed);

    } catch (error) {
      if (attempt === APP_CONFIG.ai.maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error('Resolution agent failed after all retries');
}
