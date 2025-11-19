
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

const handleError = (error: unknown): string => {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
        }
        return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message}`;
    }
    return "حدث خطأ غير معروف. يرجى التحقق من اتصالك بالإنترنت.";
}

// دالة توليد النص العادية (تدعم إدخال الصور للتحليل)
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
    // إذا تم إرفاق صورة للتحليل، نضعها في بداية المصفوفة
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
  } catch (error) {
    return handleError(error);
  }
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
  } catch (error) {
    yield handleError(error);
  }
}

// دالة جلب الأخبار (Stable JSON)
export const getAiNews = async (): Promise<NewsItem[]> => {
  try {
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
    
    return JSON.parse(text) as NewsItem[];

  } catch (error) {
    console.error("Failed to fetch AI news:", error);
    throw new Error("فشل في جلب أخبار الذكاء الاصطناعي. يرجى المحاولة لاحقاً.");
  }
};

// دالة تعديل الصور
export const generateEditedImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
  try {
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

  } catch (error) {
    console.error("Failed to generate edited image:", error);
    return null;
  }
};
