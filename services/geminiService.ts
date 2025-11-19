import { GoogleGenAI } from "@google/genai";

export const generateText = async (
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  context: string,
  temperature: number,
  maxTokens: number
): Promise<{ text: string; tokens: number }> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  try {
    // Using the new @google/genai SDK pattern
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      SYSTEM INSTRUCTION:
      ${systemPrompt}

      USER INSTRUCTION:
      ${userPrompt}

      CONTEXT DATA:
      ${context}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
    });

    // Basic token estimation (characters / 4) since pure client-side token counting for Gemini is complex
    const estimatedTokens = Math.ceil(prompt.length / 4);

    return {
      text: response.text || "No response generated.",
      tokens: estimatedTokens
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      text: `Error generating content: ${error.message || "Unknown error"}`,
      tokens: 0
    };
  }
};