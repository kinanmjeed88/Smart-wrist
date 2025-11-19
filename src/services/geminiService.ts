
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { NewsItem } from "../types";

// Reverting to standard text model
const CHAT_MODEL = 'gemini-2.5-flash';

interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

type Part = { text: string } | ImagePart;

const getApiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
};

const handleError = (error: unknown): string => {
    console.error("Gemini API call failed:", error);
    const errorString = String(error);
    
    if (errorString.includes('429') || errorString.includes('Quota exceeded') || errorString.includes('quota')) {
        return "تجاوزت الحصة المسموحة (Quota Exceeded). حاول مجدداً بعد دقيقة.";
    }

    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
        }
        return `حدث خطأ: ${error.message}`;
    }
    return "حدث خطأ غير معروف";
};

export const generateContent = async (
  prompt: string,
  image?: ImagePart,
  systemInstruction: string = SYSTEM_PROMPT
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API غير موجود.");
    
    const ai = new GoogleGenAI({ apiKey });

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: { parts },
      config: {
          systemInstruction: systemInstruction,
          temperature: 0.9,
          topP: 0.95,
          topK: 64,
      }
    });
    
    return response.text ?? '';
  } catch (error) {
    return handleError(error);
  }
};


export async function* generateContentStream(
  prompt: string,
  image?: ImagePart
): AsyncGenerator<string> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        yield "عذراً، يجب تسجيل مفتاح API أولاً.";
        return;
    }
    const ai = new GoogleGenAI({ apiKey });
    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const responseStream = await ai.models.generateContentStream({
        model: CHAT_MODEL,
        contents: { parts },
        config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.9,
            topP: 0.95,
            topK: 64,
        }
    });

    for await (const chunk of responseStream) {
        yield chunk.text ?? '';
    }
  } catch (error) {
    yield handleError(error);
  }
}

export async function* streamAiNews(): AsyncGenerator<NewsItem> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    const newsPrompt = `You are an expert AI news analyst. 
    Task: Provide the 10 most recent and significant news items about AI.
    Output Format: JSON Lines. Each line must be a single, valid JSON object. DO NOT wrap the output in an array [].
    
    Structure for each JSON object:
    {
      "title": "Concise headline (max 2 lines)",
      "summary": "Brief summary in Arabic (max 4 lines)",
      "link": "Official URL or source",
      "details": "Detailed explanation in Arabic"
    }
    
    Ensure the content is fresh and relevant. Start outputting immediately.`;

    const responseStream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: newsPrompt,
      config: {
        temperature: 0.9,
      }
    });

    let buffer = '';

    for await (const chunk of responseStream) {
        const text = chunk.text || '';
        buffer += text;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line && line.startsWith('{') && line.endsWith('}')) {
                try {
                    const item = JSON.parse(line) as NewsItem;
                    yield item;
                } catch (e) {
                    console.warn("Failed to parse news line:", line);
                }
            }
        }
    }
    
    if (buffer.trim().startsWith('{') && buffer.trim().endsWith('}')) {
         try {
            const item = JSON.parse(buffer.trim()) as NewsItem;
            yield item;
        } catch (e) {}
    }

  } catch (error) {
    console.error("Failed to stream AI news:", error);
  }
}
