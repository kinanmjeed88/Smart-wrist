
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

/**
 * دالة لاستخراج نص الخطأ الحقيقي من كائنات الخطأ المعقدة أو المتداخلة
 */
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

    // محاولة تنظيف الرسالة إذا كانت JSON string
    // نكرر العملية لأن أحياناً تكون JSON داخل JSON داخل JSON
    for (let i = 0; i < 3; i++) {
        if (typeof msg === 'string' && (msg.trim().startsWith('{') || msg.trim().startsWith('['))) {
            try {
                const parsed = JSON.parse(msg);
                if (parsed.error) {
                     // وجدنا كائن خطأ بداخله
                     if (parsed.error.message) msg = parsed.error.message;
                     else msg = JSON.stringify(parsed.error);
                } else if (parsed.message) {
                    msg = parsed.message;
                } else {
                    // لم نجد حقول خطأ معروفة، نتوقف هنا
                    break;
                }
            } catch (e) {
                // فشل التحليل، نستخدم النص كما هو
                break;
            }
        } else {
            break;
        }
    }
    return msg;
};

// دالة معالجة الأخطاء العامة للعرض للمستخدم
const handleError = (error: unknown): string => {
    console.error("Gemini API Error Raw:", error);
    
    const errorMessage = extractErrorDetails(error);
    const lowerMsg = errorMessage.toLowerCase();

    if (lowerMsg.includes('api key')) {
        return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
    }
    if (lowerMsg.includes('503') || lowerMsg.includes('overloaded') || lowerMsg.includes('unavailable')) {
        return "الخادم مشغول جداً حالياً (503). يرجى المحاولة لاحقاً.";
    }
    if (lowerMsg.includes('fetch failed') || lowerMsg.includes('network')) {
        return "مشكلة في الاتصال بالإنترنت.";
    }
    
    return `حدث خطأ: ${errorMessage.substring(0, 100)}...`;
}

// دالة لإعادة المحاولة تلقائياً عند حدوث ضغط على الخادم
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            const errorMsg = extractErrorDetails(error).toLowerCase();
            
            // التحقق مما إذا كان الخطأ يستوجب إعادة المحاولة
            const isRetryable = 
                errorMsg.includes('503') || 
                errorMsg.includes('overloaded') || 
                errorMsg.includes('unavailable') || 
                errorMsg.includes('too many requests') ||
                errorMsg.includes('network') ||
                errorMsg.includes('fetch failed') ||
                error?.status === 503;
            
            // إذا لم يكن خطأ ضغط، وكان خطأ منطقي (مثل Bad Request 400)، لا نعد المحاولة
            if (!isRetryable && (errorMsg.includes('400') || errorMsg.includes('invalid') || errorMsg.includes('api key'))) {
                 throw error;
            }

            if (i < retries - 1) {
                // زيادة وقت الانتظار تصاعدياً مع إضافة عشوائية بسيطة
                const waitTime = baseDelay * Math.pow(2, i) + (Math.random() * 500); 
                console.warn(`Attempt ${i + 1} failed (Retryable: ${isRetryable}). Retrying in ${Math.round(waitTime)}ms... Error:`, errorMsg);
                await delay(waitTime);
            }
        }
    }
    throw lastError;
}

// دالة توليد النص العادية
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

// دالة توليد النص المتدفق (Streaming)
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

// دالة جلب الأخبار
export const getAiNews = async (): Promise<NewsItem[]> => {
  // نستخدم 5 محاولات مع تأخير يبدأ من 2 ثانية (2، 4، 8، 16...)
  return retryOperation(async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    // تقليل عدد الأخبار المطلوبة من 10 إلى 6 لتقليل الحمل وتجنب Timeout
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Provide the 6 most recent and significant news items about AI innovations, new tools, and major advancements.",
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
        // رمي خطأ هنا سيجعل الدالة تعيد المحاولة تلقائياً إذا كان الرد غير صالح
        throw new Error("فشل في قراءة البيانات من المصدر (JSON Error).");
    }

  }, 5, 2000);
};

// دالة تعديل الصور باستخدام نموذج gemini-2.5-flash-image
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

    // استخراج الصورة من الرد
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
