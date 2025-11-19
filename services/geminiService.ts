import {
  GoogleGenerativeAI,
  GenerationConfig,
  Content,
  Part,
  SchemaType
} from '@google/generative-ai';
import { NewsItem } from "../types";

// استخدام النموذج المستقر لضمان عدم تجاوز الحصة
const MODEL_NAME = 'gemini-1.5-flash';

const handleError = (error: unknown): string => {
  console.error("Gemini API call failed:", error);
  if (error instanceof Error) {
    if (error.message.includes('429')) return 'تجاوزت الحصة المسموحة (Quota Exceeded).';
    return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message}`;
  }
  return "حدث خطأ غير معروف. يرجى التحقق من اتصالك بالإنترنت.";
};

// دالة مساعدة لتحويل الملفات إلى صيغة يفهمها Gemini
export const getFileParts = async (
  files: File[]
): Promise<{ parts: Part[]; error: string | null }> => {
  const fileParts: Part[] = [];
  try {
    for (const file of files) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (err) => reject(err);
      });
      fileParts.push({
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      });
    }
    return { parts: fileParts, error: null };
  } catch (error) {
    return { parts: [], error: handleError(error) };
  }
};

export const generateContentStream = async (
  apiKey: string,
  history: Content[],
  message: string,
  fileParts: Part[]
) => {
  if (!apiKey) {
    return { stream: null, error: 'مفتاح API مفقود.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 8192,
      }
    });

    const stream = await chat.sendMessageStream([message, ...fileParts]);
    return { stream, error: null };
  } catch (error) {
    return { stream: null, error: handleError(error) };
  }
};

export const getAiNews = async (apiKey: string): Promise<NewsItem[]> => {
  if (!apiKey) {
    throw new Error("مفتاح API مفقود.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING, description: 'عنوان الخبر' },
              summary: { type: SchemaType.STRING, description: 'ملخص قصير بالعربية' },
              link: { type: SchemaType.STRING, description: 'رابط المصدر' },
              details: { type: SchemaType.STRING, description: 'تفاصل أكثر عن الخبر بالعربية' },
            },
            required: ['title', 'summary', 'link', 'details'],
          },
        },
      }
    });

    const newsPrompt = `
      You are an expert AI news analyst. Provide the 10 most recent and significant AI news.
      Focus on tools like Gemini, ChatGPT, Claude, and open-source models.
      Output must be valid JSON matching the schema.
    `;

    const result = await model.generateContent(newsPrompt);
    const responseText = result.response.text();

    if (!responseText) {
      return [];
    }

    const newsData = JSON.parse(responseText);
    return newsData as NewsItem[];

  } catch (error) {
    console.error("Failed to fetch AI news:", error);
    throw new Error("فشل في جلب أخبار الذكاء الاصطناعي.");
  }
};
