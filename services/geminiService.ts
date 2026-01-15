
import { GoogleGenAI } from "@google/genai";

// Ensure process.env.API_KEY is available in the environment.
// For client-side, this would be passed during build or via another secure mechanism.
// For this example, we assume it's set up in the environment.

const MODEL_NAME = 'gemini-3-flash-preview'; // For basic text tasks

/**
 * Initializes and returns a new GoogleGenAI instance.
 * It's created inside the function to ensure it picks up the latest API key,
 * especially relevant for scenarios where the API key might be selected via a dialog.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set. Gemini API calls will fail.");
    // In a real application, you might throw an error or handle this more gracefully.
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY || 'YOUR_MOCK_API_KEY' });
};

/**
 * Sends a text prompt to the Gemini model and returns the generated text.
 */
export const getAIAssistance = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    if (!text) {
        console.warn("Gemini API returned an empty response text.");
        return "Sorry, I couldn't generate a response. Please try again.";
    }
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("Requested entity was not found.")) {
            // This error can indicate an issue with the API key or model availability.
            // For Veo/Imagen models, this specific message might trigger the API key selection flow.
            // For general text models, it might just be a configuration error or invalid key.
            console.error("Potential API key or model configuration issue. Please ensure your API key is correct and valid for the model.");
            return "There was an issue with the AI service configuration. Please ensure your API key is correctly set up.";
        }
    }
    return "An error occurred while getting AI assistance. Please try again later.";
  }
};
