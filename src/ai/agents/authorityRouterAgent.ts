import { getGeminiClient } from '../client';
import {
  AUTHORITY_ROUTER_SYSTEM_PROMPT,
  buildAuthorityRouterUserPrompt,
  AuthorityRouterInput,
} from '../prompts/authorityRouter.prompt';
import {
  authorityRouterOutputSchema,
  AuthorityRouterOutput,
} from '../schemas/authorityRouterOutput.schema';

export async function runAuthorityRouterAgent(input: AuthorityRouterInput): Promise<AuthorityRouterOutput> {
  const ai = getGeminiClient();
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: buildAuthorityRouterUserPrompt(input) }] }],
    config: {
      systemInstruction: AUTHORITY_ROUTER_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 512,
    },
  });
  const raw = result.text;
  if (!raw) throw new Error('No text response from model');
  return authorityRouterOutputSchema.parse(JSON.parse(raw));
}
