
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateCustomStory(topic: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, engaging paragraph (about 40-60 words) for a typing practice test about: ${topic}. Focus on common English words but include a few challenging terms. Avoid special symbols or emojis.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "The hero could not find a story. Practice with standard lessons instead.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The typed hero must face challenges alone. This custom path is blocked by ancient magic.";
  }
}
