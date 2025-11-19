
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { NewsItem } from "../types";

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

const getApiKey = (): string => {
  // Updated key name to match App.tsx
  return localStorage.getItem('gemini-api-key') || process.env.API_KEY || '';
};

const getUserMemory = (): string => {
    return localStorage.getItem('user_memory') || '';
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const extractErrorDetails = (error: any): string => {
    if (!error) return "Unknown Error";
    let msg = "";
    if (typeof error === 'string') {
        msg = error;
    } else if (error instanceof Error) {
        msg = error.message;
    } else {
        try { msg = JSON.stringify(error); } catch { msg = "Non-serializable Error"; }
    }
    return msg;
};

const handleError = (error: unknown): string => {
    console.error("Gemini API Error:", error);
    const errorMessage = extractErrorDetails(error);
    if (errorMessage.toLowerCase().includes('api key')) {
        return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
    }
    return `حدث خطأ: ${errorMessage.substring(0, 100)}...`;
}

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            if (i < retries - 1) await delay(baseDelay * Math.pow(2, i));
        }
    }
    throw lastError;
}

export const generateContent = async (
  prompt: string,
  image?: ImagePart,
  useSearch: boolean = false,
  overrideSystemInstruction?: string
): Promise<string> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API غير موجود.");
    
    const ai = new GoogleGenAI({ apiKey });
    const userMemory = getUserMemory();

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const finalSystemInstruction = overrideSystemInstruction || 
        `${SYSTEM_PROMPT}\n\nمعلومات عن المستخدم (الذاكرة المحلية): ${userMemory || "لا توجد معلومات محفوظة بعد."}\nاستخدم هذه المعلومات لتخصيص الإجابة.`;

    const config: any = {
        systemInstruction: finalSystemInstruction,
    };

    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: config
    });
    
    return response.text ?? '';
  }, 2, 1000);
};

export async function* generateContentStream(
  prompt: string,
  image?: ImagePart,
  useSearch: boolean = false
): AsyncGenerator<string> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        yield "عذراً، يجب تسجيل مفتاح API أولاً.";
        return;
    }
    const ai = new GoogleGenAI({ apiKey });
    const userMemory = getUserMemory();
    
    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const config: any = {
        systemInstruction: `${SYSTEM_PROMPT}\n\nسياق المستخدم: ${userMemory}`,
    };

    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: config
    });

    for await (const chunk of responseStream) {
        yield chunk.text ?? '';
    }
  } catch (error: any) {
    yield handleError(error);
  }
}

export const getAiNews = async (): Promise<NewsItem[]> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me 6 very recent AI news items (last 48 hours if possible). Return JSON array. Language: Arabic. Fields: title, summary, link, details.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              link: { type: Type.STRING },
              details: { type: Type.STRING }
            },
            required: ["title", "summary", "link", "details"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as NewsItem[];
  }, 3, 1500);
};

export const generateEditedImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API غير موجود.");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) return part.inlineData.data;
      }
    }
    return null;
  }, 3, 2000);
};
