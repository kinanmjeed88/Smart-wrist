import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

// For better type safety
interface TextPart {
  text: string;
}
interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}
type Part = TextPart | ImagePart;


const handleError = (error: unknown): string => {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message}`;
    }
    return "حدث خطأ غير معروف. يرجى التحقق من مفتاح API الخاص بك والاتصال بالإنترنت.";
}

export const generateContent = async (
  prompt: string,
  image?: ImagePart,
  systemInstruction: string = SYSTEM_PROMPT
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
          systemInstruction: systemInstruction,
      }
    });
    
    return response.text;
  } catch (error) {
    return handleError(error);
  }
};


export async function* generateContentStream(
  prompt: string,
  image?: ImagePart
): AsyncGenerator<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction: SYSTEM_PROMPT,
        }
    });

    for await (const chunk of responseStream) {
        yield chunk.text;
    }
  } catch (error) {
    yield handleError(error);
  }
}
