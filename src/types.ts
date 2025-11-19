
export interface PersonalInfoItem {
  name: string;
  url: string;
  category: 'telegram' | 'youtube' | 'tiktok' | 'telegram-folder' | 'project' | 'bot' | 'facebook' | 'instagram';
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  imagePreview?: string;
  fileInfo?: {
    name: string;
    type: string;
  };
  downloadLink?: {
    url: string;
    filename: string;
    type: 'pdf' | 'txt' | 'docx';
  };
  structuredData?: PersonalInfoItem[];
}

export interface NewsItem {
  title: string;
  summary: string;
  link: string;
  details: string;
}

export interface PhoneNewsItem {
  modelName: string;
  specs: string[];
  summary: string;
  releaseDate?: string;
}

export type View = 'home' | 'aiNews' | 'phoneNews' | 'chat' | 'personalInfo' | 'comparison' | 'about';
