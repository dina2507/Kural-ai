import { getGeminiClient } from '../client';
import { VISION_SYSTEM_PROMPT, buildVisionUserPrompt } from '../prompts/vision.prompt';
import { visionOutputSchema, VisionAgentOutput } from '../schemas/visionOutput.schema';
import { APP_CONFIG } from '../../lib/config';

interface VisionAgentInput {
  imageBase64: string;
  imageMimeType: string;
  latitude: number;
  longitude: number;
  nearbyIssues: Array<{ id: string; category: string; title: string; distance: number }>;
}

export async function runVisionAgent(input: VisionAgentInput): Promise<VisionAgentOutput> {
  const ai = getGeminiClient();

  for (let attempt = 1; attempt <= APP_CONFIG.ai.maxRetries; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: input.imageMimeType,
                  data: input.imageBase64,
                },
              },
              { text: buildVisionUserPrompt({
                  latitude: input.latitude,
                  longitude: input.longitude,
                  nearbyIssues: input.nearbyIssues,
                })
              },
            ],
          }
        ],
        config: {
          systemInstruction: VISION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      });

      const raw = result.text;
      if (!raw) {
         throw new Error("No text response from model");
      }
      const parsed = JSON.parse(raw);
      return visionOutputSchema.parse(parsed);

    } catch (error) {
      if (attempt === APP_CONFIG.ai.maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error('Vision agent failed after all retries');
}
