
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
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
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
        try {
            msg = JSON.stringify(error);
        } catch {
            msg = "Non-serializable Error";
        }
    }

    // محاولة تنظيف الرسالة إذا كانت JSON string متداخلة
    for (let i = 0; i < 3; i++) {
        if (typeof msg === 'string' && (msg.trim().startsWith('{') || msg.trim().startsWith('['))) {
            try {
                const parsed = JSON.parse(msg);
                if (parsed.error) {
                     if (parsed.error.message) msg = parsed.error.message;
                     else msg = JSON.stringify(parsed.error);
                } else if (parsed.message) {
                    msg = parsed.message;
                } else {
                    break;
                }
            } catch (e) {
                break;
            }
        } else {
            break;
        }
    }
    return msg;
};

const handleError = (error: unknown): string => {
    console.error("Gemini API Error:", error);
    
    const errorMessage = extractErrorDetails(error);
    const lowerMsg = errorMessage.toLowerCase();

    if (lowerMsg.includes('api key')) {
        return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
    }
    if (lowerMsg.includes('503') || lowerMsg.includes('overloaded') || lowerMsg.includes('unavailable')) {
        return "الخادم مشغول (503). يرجى المحاولة لاحقاً.";
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
            const errorMsg = extractErrorDetails(error).toLowerCase();
            
            const isRetryable = 
                errorMsg.includes('503') || 
                errorMsg.includes('overloaded') || 
                errorMsg.includes('unavailable') || 
                errorMsg.includes('fetch failed') ||
                error?.status === 503;
            
            if (!isRetryable) {
                 throw error;
            }

            if (i < retries - 1) {
                const waitTime = baseDelay * Math.pow(2, i) + (Math.random() * 500); 
                await delay(waitTime);
            }
        }
    }
    throw lastError;
}

export const generateContent = async (
  prompt: string,
  image?: ImagePart,
  systemInstruction: string = SYSTEM_PROMPT
): Promise<string> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API غير موجود.");
    
    const ai = new GoogleGenAI({ apiKey });

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
    
    return response.text ?? '';
  }, 3, 1000);
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
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction: SYSTEM_PROMPT,
        }
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
    
    // تبسيط الطلب جداً ليكون خفيفاً مثل الشات
    // 1. طلب 6 عناصر فقط
    // 2. استخدام schema بسيطة
    // 3. عدم استخدام systemInstruction ثقيلة هنا
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a JSON list of 6 recent AI news items. Language: Arabic. Required fields: title, summary, link, details.",
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
    
    try {
        return JSON.parse(text) as NewsItem[];
    } catch (e) {
        throw new Error("فشل تحليل البيانات.");
    }

  }, 4, 1500); // 4 محاولات مع تأخير أولي 1.5 ثانية
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
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    
    return null;
  }, 3, 2000);
};
