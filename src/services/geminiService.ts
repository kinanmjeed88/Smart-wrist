
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { NewsItem, PhoneNewsItem, ChatMessage } from "../types";

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
  return localStorage.getItem('gemini-api-key') || process.env.API_KEY || '';
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

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const finalSystemInstruction = overrideSystemInstruction || SYSTEM_PROMPT;

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
  history: ChatMessage[] = [], 
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
    
    // Construct Full History if provided
    const contents: any[] = history
      .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
    // Add current prompt
    const currentParts: Part[] = [{ text: prompt }];
    if (image) currentParts.unshift(image);
    
    contents.push({
        role: 'user',
        parts: currentParts as any
    });

    const config: any = {
        systemInstruction: `${SYSTEM_PROMPT}\n\nImportant: You are part of a continuous conversation. Use the provided history to maintain context.`,
    };

    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: config
    });

    for await (const chunk of responseStream) {
        yield chunk.text ?? '';
    }
  } catch (error: any) {
    yield handleError(error);
  }
}

export const getAiNews = async (query?: string): Promise<NewsItem[]> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    let contentPrompt = `You are a strict AI tech news analyst. Provide 9 recent AI news items (last 48h).`;
    
    if (query && query.trim()) {
        contentPrompt = `You are a strict AI tech news analyst. Search for and provide 9 recent AI news items specifically related to: "${query}". If no specific news found for this topic, provide general recent AI news but mention that inside the summary.`;
    }

    const prompt = `${contentPrompt}
    
    CRITICAL LINK RULES:
    1. The 'link' field MUST be a working URL.
    2. FIRST PRIORITY: The OFFICIAL HOMEPAGE of the tool (e.g., https://openai.com).
    3. SECOND PRIORITY: The OFFICIAL blog post announcement.
    4. ABSOLUTE FALLBACK: If you are not 100% verified on the specific URL, you MUST return a Google Search URL in this format: "https://www.google.com/search?q=ToolName+AI".
    
    Return JSON array. Language: Arabic. Fields: title, summary, link, details.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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

export const getPhoneNews = async (query?: string): Promise<PhoneNewsItem[]> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    let contentPrompt = `List exactly 9 recent smartphones released or announced in the last few months.`;
    if (query && query.trim()) {
        contentPrompt = `Search for and list exactly 9 recent smartphones related to: "${query}". If specific match not found, list recent popular phones.`;
    }

    const prompt = `${contentPrompt}
    For each phone, provide:
    1. Model Name.
    2. A COMPREHENSIVE list of specifications (at least 8-10 items) covering: Processor, RAM, Storage, Display (Size, Type, Refresh Rate), Camera (Rear & Front), Battery & Charging, OS, and Build Material. Format as short strings (e.g., "Snapdragon 8 Gen 3", "5000mAh 120W").
    3. A brief summary in Arabic.
    
    Return strictly JSON array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              modelName: { type: Type.STRING },
              specs: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              releaseDate: { type: Type.STRING }
            },
            required: ["modelName", "specs", "summary"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as PhoneNewsItem[];
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
