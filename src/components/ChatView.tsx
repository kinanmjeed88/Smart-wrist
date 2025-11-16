import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateContentStream } from '../services/geminiService';
import { extractTextFromFile, createPdfFromText, createTxtFromText } from '../services/documentProcessor';
import { ChatMessage } from '../types';
import { PaperclipIcon, SendIcon, FileIcon, DownloadIcon, CopyIcon, MicrophoneIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'ar-SA';
  recognition.interimResults = false;
}

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };
  
  const resetInput = () => {
    setInput('');
    setAttachedFile(null);
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSystemMessage = useCallback((text: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString() + "-system",
      sender: 'system',
      text,
    };
    setMessages(prev => [...prev, systemMessage]);
  }, [setMessages]);

  const handleFileTranslation = async (file: File) => {
    addSystemMessage(`جاري استخراج النص من ${file.name}...`);
    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText) {
         addSystemMessage('لم يتم العثور على نص في الملف.');
         return;
      }

      addSystemMessage('تم استخراج النص. جاري الترجمة...');
      const translationPrompt = `Translate the following text to Arabic, line by line. Each original line should be followed by its Arabic translation on the next line.\n\n${extractedText}`;
      
      const stream = generateContentStream(translationPrompt);
      let translatedText = '';
      for await (const chunk of stream) {
        translatedText += chunk;
      }
      
      addSystemMessage('تمت الترجمة. جاري إنشاء الملف الجديد...');
      
      let downloadUrl: string, downloadType: 'pdf' | 'txt' = 'txt';
      if (file.type === 'application/pdf') {
        downloadUrl = await createPdfFromText(translatedText);
        downloadType = 'pdf';
      } else {
        downloadUrl = createTxtFromText(translatedText);
      }
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: `تمت ترجمة ملفك "${file.name}". يمكنك تحميله الآن.`,
        downloadLink: { url: downloadUrl, filename: `translated-${file.name}.${downloadType}`, type: downloadType }
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      addSystemMessage(`حدث خطأ أثناء معالجة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  const handleStandardChatMessage = async (prompt: string, imageFile: File | null) => {
      let imagePart;
      if (imageFile && imageFile.type.startsWith('image/')) {
          try {
              const base64Data = await fileToBase64(imageFile);
              imagePart = { inlineData: { mimeType: imageFile.type, data: base64Data } };
          } catch (error) {
              addSystemMessage("خطأ في معالجة الصورة.");
              return;
          }
      }

      const aiMessageId = Date.now().toString() + '-ai';
      setMessages((prev) => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);
      
      try {
          const stream = generateContentStream(prompt, imagePart);
          let fullResponse = '';
          for await (const chunk of stream) {
              fullResponse += chunk;
              setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: fullResponse} : m));
          }
      } catch (error) {
           setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: "عذراً, حدث خطأ ما."} : m));
      }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      imagePreview: attachedFile?.type.startsWith('image/') ? filePreview || undefined : undefined,
      fileInfo: (attachedFile && !attachedFile.type.startsWith('image/')) ? { name: attachedFile.name, type: attachedFile.type } : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const prompt = input;
    const fileToProcess = attachedFile;
    resetInput();

    try {
      if (fileToProcess && !fileToProcess.type.startsWith('image/')) {
          await handleFileTranslation(fileToProcess);
      } else {
          await handleStandardChatMessage(prompt, fileToProcess);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
      recognition.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start group ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender === 'ai' && msg.text && (
              <button onClick={() => handleCopy(msg.text, msg.id)} className="flex-shrink-0 p-1 mt-0.5 mr-1 text-gray-500 hover:text-gray-200 transition-colors rounded-full">
                 <CopyIcon className="w-4 h-4" />
              </button>
            )}
             <div className={`max-w-[80%] rounded-lg px-2 py-1 relative ${
                msg.sender === 'user' ? 'bg-cyan-800' : 
                msg.sender === 'system' ? 'bg-gray-600 text-gray-300 text-center text-[10px]' : 
                'bg-gray-700'
            }`}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="preview" className="rounded-md max-h-32 mb-1" />}
              {msg.fileInfo && (
                <div className="flex items-center space-x-2 space-x-reverse p-1 bg-gray-800/50 rounded-md mb-1">
                  <FileIcon className="w-5 h-5 text-gray-300"/>
                  <span className="text-gray-300 truncate text-xs">{msg.fileInfo.name}</span>
                </div>
              )}
               {msg.sender === 'ai' ? <MarkdownRenderer text={msg.text} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
              {msg.downloadLink && (
                  <a href={msg.downloadLink.url} download={msg.downloadLink.filename} className="mt-2 flex items-center justify-center space-x-2 space-x-reverse bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-3 rounded-md transition-colors duration-300">
                    <DownloadIcon className="w-4 h-4" />
                    <span>تحميل</span>
                  </a>
              )}
              {copiedId === msg.id && <div className="absolute -top-5 right-0 text-white bg-black/50 px-1 rounded text-[9px]">تم النسخ!</div>}
            </div>
          </div>
        ))}
        {isLoading && (
             <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-2 py-1 bg-gray-700">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      { (filePreview || (attachedFile && !attachedFile.type.startsWith('image/'))) && (
        <div className="p-2 bg-gray-800 border-t border-b border-gray-700">
            <div className="relative w-24 p-1 bg-gray-700 rounded-md">
                {filePreview ? <img src={filePreview} alt="Selected" className="h-20 w-20 object-cover rounded mx-auto" /> : (
                    <div className="flex flex-col items-center text-gray-300"> <FileIcon className="w-10 h-10" /> <span className="text-xs truncate w-full text-center mt-1">{attachedFile?.name}</span> </div>
                )}
                <button onClick={resetInput} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs"> &times; </button>
            </div>
        </div>
      )}

      <div className="p-2 bg-gray-800 border-t border-gray-700 flex items-center space-x-2 space-x-reverse">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()} placeholder={ attachedFile ? "أضف تعليقًا أو أرسل الملف..." : "اكتب رسالتك..."} className="flex-1 bg-gray-700 text-gray-200 border border-gray-600 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500" disabled={isLoading} />
        <input type="file" accept="image/*,application/pdf,.docx" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
        {recognition && (
          <button onClick={toggleRecording} className={`p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:text-gray-600 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} disabled={isLoading}>
            <MicrophoneIcon className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:text-gray-600" disabled={isLoading}>
          <PaperclipIcon className="w-4 h-4" />
        </button>
        <button onClick={handleSend} className="p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600" disabled={isLoading || (!input.trim() && !attachedFile)}>
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};