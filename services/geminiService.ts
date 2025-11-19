
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { NewsItem } from "../types";

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
    return "حدث خطأ غير معروف. يرجى التحقق من اتصالك بالإنترنت.";
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

export const getAiNews = async (): Promise<NewsItem[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const newsPrompt = `You are an expert AI news analyst. Your task is to provide the 10 most recent and significant pieces of news regarding AI innovations, new tools, and major advancements. Provide the output as a JSON array. Each object in the array must have the following keys: "title" (a concise headline, max 2 lines), "summary" (a brief summary, in Arabic, max 5 lines), "link" (the official URL to the tool or a reputable news source), and "details" (a more in-depth explanation in Arabic). Ensure the content is fresh and relevant.`;

    const newsSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'The news headline.' },
            summary: { type: Type.STRING, description: 'A short summary of the news in Arabic.' },
            link: { type: Type.STRING, description: 'A URL to the tool or source.' },
            details: { type: Type.STRING, description: 'A more detailed explanation in Arabic.' },
          },
          required: ['title', 'summary', 'link', 'details'],
        },
      };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: newsPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
      }
    });

    const jsonText = response.text.trim();
    const newsData = JSON.parse(jsonText);

    if (!Array.isArray(newsData)) {
      throw new Error("Invalid data format received from API.");
    }

    return newsData as NewsItem[];

  } catch (error) {
    console.error("Failed to fetch AI news:", error);
    throw new Error("فشل في جلب أخبار الذكاء الاصطناعي. حاول تحديث الصفحة.");
  }
};
