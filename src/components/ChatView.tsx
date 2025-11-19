
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateContentStream } from '../services/geminiService';
import { extractTextFromFile, createPdfFromText, createTxtFromText, createDocxFromText } from '../services/documentProcessor';
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
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onInputFocus?: (focused: boolean) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages, onScroll, onInputFocus }) => {
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

  const handleDownloadDocx = async (text: string) => {
    try {
      const url = await createDocxFromText(text);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TechTouch-Doc-${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating DOCX:', error);
    }
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
         setIsLoading(false); // Stop loading if no text
         return;
      }

      addSystemMessage('تم استخراج النص. جاري المعالجة...');
      const translationPrompt = `قم بتحسين وتنسيق النص التالي باللغة العربية، وإذا كان بلغة أخرى قم بترجمته للعربية بدقة عالية:\n\n${extractedText}`;
      
      const stream = generateContentStream(translationPrompt);
      let translatedText = '';
      for await (const chunk of stream) {
        translatedText += chunk;
      }
      
      addSystemMessage('تمت المعالجة. جاري إنشاء ملف Word قابل للتعديل...');
      
      let downloadUrl: string;
      let downloadType: 'docx' | 'txt' = 'docx';

      try {
        downloadUrl = await createDocxFromText(translatedText);
      } catch (e) {
        console.warn("Failed to create DOCX, falling back to TXT", e);
        downloadUrl = createTxtFromText(translatedText);
        downloadType = 'txt';
      }
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: `تم معالجة ملفك "${file.name}". يمكنك تحميله الآن بصيغة Word.`,
        downloadLink: { url: downloadUrl, filename: `converted-${file.name.split('.')[0]}.${downloadType}`, type: downloadType }
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
      // eslint-disable-next-line no-loop-func
      recognition.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 relative">
      {/* Messages Area - Padding bottom to account for floating footer + input */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 pb-24" onScroll={onScroll}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start group ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender === 'ai' && msg.text && (
              <div className="flex flex-col mt-0.5 mr-1 space-y-1">
                <button onClick={() => handleCopy(msg.text, msg.id)} className="flex-shrink-0 p-1.5 text-gray-500 hover:text-white transition-colors rounded-full bg-gray-800/50 hover:bg-gray-700" title="نسخ">
                   <CopyIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDownloadDocx(msg.text)} className="flex-shrink-0 p-1.5 text-gray-500 hover:text-cyan-400 transition-colors rounded-full bg-gray-800/50 hover:bg-gray-700" title="تحميل كملف Word">
                   <FileIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {/* Compact Bubble Styles: Reduced padding, increased max-width */}
             <div className={`max-w-[95%] sm:max-w-[85%] rounded-2xl px-3 py-2 relative shadow-sm ${
                msg.sender === 'user' ? 'bg-cyan-700 rounded-br-sm' : 
                msg.sender === 'system' ? 'bg-gray-600 text-gray-300 text-center text-[10px] py-1' : 
                'bg-gray-800 rounded-bl-sm'
            }`}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="preview" className="rounded-lg max-h-32 mb-1 object-cover" />}
              {msg.fileInfo && (
                <div className="flex items-center space-x-2 space-x-reverse p-1.5 bg-gray-900/40 rounded-md mb-1">
                  <FileIcon className="w-4 h-4 text-gray-300"/>
                  <span className="text-gray-300 truncate text-xs">{msg.fileInfo.name}</span>
                </div>
              )}
               {msg.sender === 'ai' ? <MarkdownRenderer text={msg.text} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>}
              {msg.downloadLink && (
                  <a href={msg.downloadLink.url} download={msg.downloadLink.filename} className="mt-2 flex items-center justify-center space-x-2 space-x-reverse bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors duration-300 w-full text-xs">
                    <DownloadIcon className="w-4 h-4" />
                    <span>تحميل {msg.downloadLink.type === 'docx' ? 'Word' : 'الملف'}</span>
                  </a>
              )}
              {copiedId === msg.id && <div className="absolute -top-6 right-0 text-white bg-black/70 px-2 py-0.5 rounded-md text-[10px] animate-fade-in-up">تم النسخ!</div>}
            </div>
          </div>
        ))}
        {isLoading && (
             <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-2 bg-gray-800 shadow-sm">
                    <div className="flex items-center space-x-1.5 space-x-reverse">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Preview Area */}
      { (filePreview || (attachedFile && !attachedFile.type.startsWith('image/'))) && (
        <div className="p-2 bg-gray-900/95 backdrop-blur border-t border-gray-800 absolute bottom-14 left-0 right-0 z-20">
            <div className="relative w-20 p-1 bg-gray-800 rounded-lg border border-gray-700">
                {filePreview ? <img src={filePreview} alt="Selected" className="h-16 w-16 object-cover rounded mx-auto" /> : (
                    <div className="flex flex-col items-center text-gray-300 py-1"> <FileIcon className="w-8 h-8" /> <span className="text-[10px] truncate w-full text-center mt-1">{attachedFile?.name}</span> </div>
                )}
                <button onClick={resetInput} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-md"> &times; </button>
            </div>
        </div>
      )}

      {/* Input Bar - Sticky Bottom above Floating Footer (or replaces it when focused) */}
      <div className="p-2 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 flex items-center gap-2 z-40 absolute bottom-0 left-0 right-0 safe-area-pb">
        
        {recognition && (
          <button onClick={toggleRecording} className={`flex-shrink-0 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:text-gray-600 transition-all ${isRecording ? 'text-red-500 bg-red-500/10 ring-1 ring-red-500' : ''}`} disabled={isLoading}>
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        )}
        
        <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:text-gray-600 transition-all" disabled={isLoading}>
          <PaperclipIcon className="w-5 h-5" />
        </button>

        <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()} 
            onFocus={() => onInputFocus && onInputFocus(true)}
            onBlur={() => onInputFocus && onInputFocus(false)}
            placeholder={ attachedFile ? "تعليق..." : "اكتب رسالتك..."} 
            className="flex-1 min-w-0 bg-gray-800 text-gray-100 border border-gray-700 rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-shadow placeholder-gray-500" 
            disabled={isLoading} 
        />
        <input type="file" accept="image/*,application/pdf,.docx" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
        
        <button onClick={handleSend} className="flex-shrink-0 p-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform active:scale-95 transition-all" disabled={isLoading || (!input.trim() && !attachedFile)}>
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
