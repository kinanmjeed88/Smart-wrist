
export interface PersonalInfoItem {
  name: string;
  url: string;
  category: 'telegram' | 'youtube' | 'tiktok' | 'telegram-folder' | 'project';
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

export type View = 'home' | 'aiNews' | 'chat' | 'personalInfo' | 'comparison';
