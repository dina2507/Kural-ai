import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}
