
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
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

const getApiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
};

const handleError = (error: unknown): string => {
    console.error("Gemini API call failed:", error);
    const errorString = String(error);
    
    if (errorString.includes('429') || errorString.includes('Quota exceeded') || errorString.includes('quota')) {
        return "عذراً، لقد تجاوزت الحد المسموح به للاستخدام المجاني حالياً (Quota Exceeded). يرجى المحاولة لاحقاً أو استخدام صورة أصغر حجماً.";
    }

    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            return "خطأ في مفتاح API. يرجى التأكد من صلاحية المفتاح.";
        }
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

export async function* streamAiNews(): AsyncGenerator<NewsItem> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("مفتاح API مفقود");

    const ai = new GoogleGenAI({ apiKey });
    
    // We request strict JSON Lines format for streaming parsing
    const newsPrompt = `You are an expert AI news analyst. 
    Task: Provide the 10 most recent and significant news items about AI.
    Output Format: JSON Lines. Each line must be a single, valid JSON object. DO NOT wrap the output in an array []. DO NOT use markdown code blocks.
    
    Structure for each JSON object:
    {
      "title": "Concise headline (max 2 lines)",
      "summary": "Brief summary in Arabic (max 4 lines)",
      "link": "Official URL or source",
      "details": "Detailed explanation in Arabic"
    }
    
    Ensure the content is fresh and relevant. Start outputting immediately.`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: newsPrompt,
    });

    let buffer = '';

    for await (const chunk of responseStream) {
        const text = chunk.text || '';
        buffer += text;

        // Process the buffer line by line
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line && line.startsWith('{') && line.endsWith('}')) {
                try {
                    // Attempt to fix potential trailing commas or small JSON errors if strictly necessary,
                    // but standard JSON.parse should work if the model obeys JSON Lines.
                    const item = JSON.parse(line) as NewsItem;
                    yield item;
                } catch (e) {
                    console.warn("Failed to parse news line:", line);
                }
            }
        }
    }
    
    // Process any remaining buffer if it's a complete JSON object
    if (buffer.trim().startsWith('{') && buffer.trim().endsWith('}')) {
         try {
            const item = JSON.parse(buffer.trim()) as NewsItem;
            yield item;
        } catch (e) {
            console.warn("Failed to parse remaining buffer:", buffer);
        }
    }

  } catch (error) {
    console.error("Failed to stream AI news:", error);
    // We can't easily yield an error object since the return type is NewsItem. 
    // The UI handles the empty state or we could yield a dummy error item if needed.
  }
}

export const generateEditedImage = async (
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string | null> => {
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

    // Robust check for data existence to satisfy TypeScript strict checks
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    
    if (part?.inlineData?.data) {
      return part.inlineData.data;
    }
    
    return null;

  } catch (error) {
    const friendlyError = handleError(error);
    throw new Error(friendlyError);
  }
};
