
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { NewsItem } from "../types";

// واجهات لتعريف أجزاء الرسالة (نصوص أو صور مدخلة)
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

// دالة انتظار بسيطة
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// دالة معالجة الأخطاء العامة
const handleError = (error: unknown): string => {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
        }
        if (error.message.includes('503') || error.message.includes('overloaded')) {
            return "الخادم مشغول حالياً (503). يرجى المحاولة مرة أخرى.";
        }
        return `حدث خطأ: ${error.message}`;
    }
    return "حدث خطأ غير معروف. يرجى التحقق من اتصالك بالإنترنت.";
}

// دالة لإعادة المحاولة تلقائياً عند حدوث ضغط على الخادم
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            const isOverloaded = error?.message?.includes('503') || error?.message?.includes('overloaded') || error?.status === 503;
            
            // إذا كان الخطأ بسبب الضغط (503) أو فشل الشبكة، وكان لدينا محاولات متبقية
            if ((isOverloaded || i < retries - 1) && i < retries) {
                console.warn(`Attempt ${i + 1} failed. Retrying in ${delayMs}ms...`, error.message);
                await delay(delayMs * (i + 1)); // زيادة وقت الانتظار تدريجياً
                continue;
            }
            throw error;
        }
    }
    throw new Error("فشلت العملية بعد عدة محاولات.");
}

// دالة توليد النص العادية (مع إعادة المحاولة)
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
  });
};

// دالة توليد النص المتدفق (Streaming) - المتدفق صعب إعادة محاولته تلقائياً بنفس الطريقة، لذا نتركه كما هو
// لكن نضيف معالجة أفضل للخطأ
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
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        yield "الخادم مشغول جداً حالياً (503). يرجى إرسال الرسالة مرة أخرى بعد قليل.";
    } else {
        yield handleError(error);
    }
  }
}

// دالة جلب الأخبار (مع إعادة المحاولة ومعالجة قوية للأخطاء)
export const getAiNews = async (): Promise<NewsItem[]> => {
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Provide the 10 most recent and significant news items about AI innovations, new tools, and major advancements.",
      config: {
        systemInstruction: "You are an expert AI news analyst. Provide summaries and details in Arabic.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Concise headline" },
              summary: { type: Type.STRING, description: "Brief summary in Arabic" },
              link: { type: Type.STRING, description: "Official URL or source" },
              details: { type: Type.STRING, description: "Detailed explanation in Arabic" }
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
        console.error("JSON Parse Error", e);
        throw new Error("فشل في قراءة البيانات من المصدر.");
    }

  }, 3, 1500); // حاول 3 مرات، انتظر 1.5 ثانية وتزيد
};

// دالة تعديل الصور (مع إعادة المحاولة)
export const generateEditedImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
  try {
    return await retryOperation(async () => {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("مفتاح API مفقود");
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
            {
                inlineData: {
                data: imageBase64,
                mimeType: mimeType
                }
            },
            {
                text: prompt
            }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE]
        }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        return null;
    }, 2, 2000); // محاولتين فقط للصور لأنها ثقيلة
  } catch (error) {
    console.error("Failed to generate edited image:", error);
    return null;
  }
};
