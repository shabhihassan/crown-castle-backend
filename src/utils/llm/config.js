import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

/**
 * Factory to create a Gemini 3 instance.
 * Optimized for JSON structured outputs and Real Estate research.
 */
export const createModelInstance = (preset = {}) => {
  return {
    generateContent: async (prompt) => {
      // Step 1: Execute the call
      const result = await ai.models.generateContent({
        model: preset.model || 'gemini-3-flash-preview',
        contents: prompt,
        tools: preset.tools || [],
        systemInstruction: preset.systemInstruction || '',
        config: {
          // Destructure preset config (thinkingConfig, temperature, etc.)
          ...(preset.config || {}),
          
          // Force JSON output for easier frontend parsing
          responseMimeType: "application/json",
          
          // Defaults if not in preset
          temperature: preset.config?.temperature ?? 1.0,
          maxOutputTokens: preset.config?.maxOutputTokens ?? 4096,
        }
      });
      return result
    }
  };
};