import { GoogleGenerativeAI, GenerateContentResponse, Part } from "@google/generative-ai";
import { SYSTEM_PROMPT } from '../constants';
import { NewsItem } from "../types";

// ملاحظة: قمت بتعديل الـ import ليطابق الإصدار الحديث.
// وتأكد من أن type Part الخاص بك يطابق ما تتوقعه المكتبة أو قم بإزالته إذا كان
// يسبب تعارضًا، لكن الخطأ الرئيسي هو .text()

const handleError = (error: unknown): string => {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message}`;
    }
    return "حدث خطأ غير معروف. يرجى التحقق من اتصالك بالإنترنت.";
}

export const generateContent = async (
  prompt: string,
  image?: Part, // تم تعديل النوع ليتوافق مع GoogleGenerativeAI
  systemInstruction: string = SYSTEM_PROMPT
): Promise<string> => {
  try {
    // تأكد من أن متغير البيئة هذا مُعرف في بيئة البناء (Build Environment)
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; 
    if (!apiKey) {
      throw new Error("API Key is not defined.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: image ? "gemini-pro-vision" : "gemini-1.5-flash", // استخدام pro-vision إذا كان هناك صورة
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    });

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });
    
    const response = result.response;
    return response.text(); // *** التصحيح هنا: استخدام .text() كدالة ***

  } catch (error) {
    return handleError(error);
  }
};


export async function* generateContentStream(
  prompt: string,
  image?: Part // تم تعديل النوع
): AsyncGenerator<string> {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; // تأكد من أن المتغير متاح
    if (!apiKey) {
      throw new Error("API Key is not defined.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: image ? "gemini-pro-vision" : "gemini-1.5-flash",
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts }],
    });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text(); // *** التصحيح هنا: استخدام .text() كدالة ***
      yield chunkText;
    }
  } catch (error) {
    yield handleError(error);
  }
}

export const getAiNews = async (): Promise<NewsItem[]> => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; // تأكد من أن المتغير متاح
    if (!apiKey) {
      throw new Error("API Key is not defined.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const newsPrompt = `You are an expert AI news analyst. Your task is to provide the 10 most recent and significant pieces of news regarding AI innovations, new tools, and major advancements. Provide the output as a JSON array. Each object in the array must have the following keys: "title" (a concise headline, max 2 lines), "summary" (a brief summary, in Arabic, max 5 lines), "link" (the official URL to the tool or a reputable news source), and "details" (a more in-depth explanation in Arabic). Ensure the content is fresh and relevant.`;

    // ملاحظة: schema definition قد تغيرت في الإصدارات الجديدة، 
    // ولكن لنركز على الخطأ الحالي أولاً.
    // إزالة Type من الـ import إذا لم تكن مستخدمة بشكل صحيح.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // افترض استخدام نموذج يدعم JSON
    
    const result = await model.generateContent(newsPrompt);
    const response = result.response;

    const jsonText = response.text().trim(); // *** التصحيح هنا: استخدام .text() كدالة ***
    
    // إزالة علامات ```json و ``` المحيطة إذا كانت موجودة
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
    
    const newsData = JSON.parse(cleanedJsonText);

    if (!Array.isArray(newsData)) {
      throw new Error("Invalid data format received from API.");
    }

    return newsData as NewsItem[];

  } catch (error) {
    console.error("Failed to fetch AI news:", error);
    throw new Error("فشل في جلب أخبار الذكاء الاصطناعي. حاول تحديث الصفحة.");
  }
};
