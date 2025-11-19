
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateContent, generateContentStream } from '../services/geminiService';
import { extractTextFromFile, createDocxFromText } from '../services/documentProcessor';
import { ChatMessage } from '../types';
import { PaperclipIcon, SendIcon, FileIcon, DownloadIcon, CopyIcon, MicrophoneIcon, TrashIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';
import toast from 'react-hot-toast';

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
  initialPrompt?: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages, onScroll, onInputFocus, initialPrompt }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{
            id: 'welcome-msg',
            sender: 'ai',
            text: `**مرحباً بك في TechTouch! 🤖**

أنا مساعدك الذكي. إليك ما يمكنني فعله:

*   **إجابة استفساراتك** حول التقنية والحياة اليومية.
*   **تحليل الصور** واستخراج النصوص منها.
*   **تلخيص وترجمة** الملفات (PDF, Word).
*   **البحث عن معلومات** حديثة من الويب.

_لمقارنة الهواتف، يرجى استخدام زر "المقارنة" في الصفحة الرئيسية._`
        }]);
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearChat = () => {
      if(window.confirm("هل أنت متأكد من رغبتك في حذف المحادثة بالكامل والبدء من جديد؟")) {
          setMessages([]); 
          localStorage.removeItem('user_memory'); // Clear simple memory if any
          toast.success("تم حذف المحادثة بنجاح");
      }
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
    setMessages(prev => [...prev, { id: Date.now().toString() + "-system", sender: 'system', text }]);
  }, [setMessages]);

  const handleStandardChatMessage = async (originalPrompt: string, imageFile: File | null) => {
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
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const hasUrl = urlRegex.test(originalPrompt);
          
          let finalPrompt = originalPrompt;
          let useSearch = false;

          if (hasUrl) {
              finalPrompt = `Use Google Search to visit this link and summarize its key technical points in Arabic: ${originalPrompt}`;
              useSearch = true;
          }

          // Pass full messages history for context
          const stream = generateContentStream(finalPrompt, messages, imagePart, useSearch);
          let fullResponse = '';
          for await (const chunk of stream) {
              fullResponse += chunk;
              setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: fullResponse} : m));
          }
      } catch (error) {
           setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: "عذراً, حدث خطأ ما أثناء الاتصال."} : m));
      }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;
    setIsLoading(true);
    const currentInput = input;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentInput,
      imagePreview: attachedFile?.type.startsWith('image/') ? filePreview || undefined : undefined,
      fileInfo: (attachedFile && !attachedFile.type.startsWith('image/')) ? { name: attachedFile.name, type: attachedFile.type } : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const fileToProcess = attachedFile;
    resetInput();

    try {
      if (fileToProcess && !fileToProcess.type.startsWith('image/')) {
           addSystemMessage(`جاري استخراج النص من ${fileToProcess.name}...`);
           const extractedText = await extractTextFromFile(fileToProcess);
           if (!extractedText) throw new Error("لا يوجد نص");
           
           addSystemMessage('تم الاستخراج. جاري الترجمة والمعالجة...');
           const prompt = `Translate/Format this text to professional Arabic:\n\n${extractedText}`;
           const result = await generateContent(prompt);
           
           const docUrl = await createDocxFromText(result);
           const aiMsg: ChatMessage = {
               id: Date.now().toString(),
               sender: 'ai',
               text: 'تمت ترجمة وتنسيق الملف بنجاح.',
               downloadLink: { url: docUrl, filename: `translated-${fileToProcess.name}.docx`, type: 'docx' }
           };
           setMessages(prev => [...prev, aiMsg]);

      } else {
          await handleStandardChatMessage(currentInput, fileToProcess);
      }
    } catch (e) {
        addSystemMessage("حدث خطأ غير متوقع.");
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
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 relative text-xs">
      {/* Top Bar with Clear Button - Moved to LEFT side */}
      <div className="absolute top-0 left-0 p-2 z-10">
        <button 
            onClick={handleClearChat}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-full backdrop-blur-md transition-colors shadow-md"
            title="حذف المحادثة بالكامل"
        >
            <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 pb-28 pt-8" onScroll={onScroll}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start group ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender === 'ai' && msg.text && (
              <div className="flex flex-col mt-0.5 mr-1 space-y-1 opacity-70 hover:opacity-100 transition-opacity">
                <button onClick={() => handleCopy(msg.text, msg.id)} className="p-1 text-gray-400 hover:text-white bg-gray-800/80 rounded-full" title="نسخ">
                   <CopyIcon className="w-3 h-3" />
                </button>
                <button onClick={() => handleDownloadDocx(msg.text)} className="p-1 text-gray-400 hover:text-cyan-400 bg-gray-800/80 rounded-full" title="تحميل">
                   <FileIcon className="w-3 h-3" />
                </button>
              </div>
            )}

             <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2 relative shadow-md border border-white/5 ${
                msg.sender === 'user' ? 'bg-cyan-700 rounded-br-sm' : 
                msg.sender === 'system' ? 'bg-gray-700/50 text-gray-400 text-center text-[9px] py-1 w-full max-w-sm mx-auto' : 
                'bg-gray-800 rounded-bl-sm'
            }`}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="preview" className="rounded-lg max-h-40 mb-2 object-cover w-full" />}
              {msg.fileInfo && (
                <div className="flex items-center gap-2 p-2 bg-black/20 rounded-md mb-2">
                  <FileIcon className="w-4 h-4 text-cyan-300"/>
                  <span className="text-gray-300 text-[10px] truncate">{msg.fileInfo.name}</span>
                </div>
              )}
              
               {msg.sender === 'ai' ? <MarkdownRenderer text={msg.text} /> : <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
              
              {msg.downloadLink && (
                  <a href={msg.downloadLink.url} download={msg.downloadLink.filename} className="mt-3 flex items-center justify-center gap-2 bg-cyan-600/90 hover:bg-cyan-600 text-white py-2 px-4 rounded-xl transition-all w-full text-[10px] font-bold">
                    <DownloadIcon className="w-3 h-3" />
                    <span>تحميل الملف</span>
                  </a>
              )}
              {copiedId === msg.id && <div className="absolute -top-6 right-0 text-white bg-black/80 px-2 py-0.5 rounded text-[9px] animate-fade-in">تم النسخ</div>}
            </div>
          </div>
        ))}
        {isLoading && (
             <div className="flex justify-start animate-pulse">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-800">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area - Compact for small screens */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#0f1115] border-t border-gray-800 p-1.5 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
          
          {(filePreview || (attachedFile && !attachedFile.type.startsWith('image/'))) && (
            <div className="absolute bottom-full left-0 right-0 p-2 bg-[#0f1115] border-t border-gray-800 animate-slide-up">
                <div className="relative w-12 h-12 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                    {filePreview ? (
                        <img src={filePreview} alt="Selected" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <FileIcon className="w-6 h-6 text-gray-500" />
                    )}
                    <button onClick={resetInput} className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-white text-[9px] leading-none flex items-center justify-center shadow-sm">&times;</button>
                </div>
            </div>
          )}

          <div className="flex items-center gap-1 max-w-3xl mx-auto px-1">
            {recognition && (
            <button onClick={toggleRecording} className={`flex-shrink-0 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all ${isRecording ? 'text-red-500 ring-1 ring-red-500' : ''}`} disabled={isLoading}>
                <MicrophoneIcon className="w-4 h-4" />
            </button>
            )}
            
            <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-cyan-400 transition-all" disabled={isLoading}>
                <PaperclipIcon className="w-4 h-4" />
            </button>

            <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()} 
                onFocus={() => onInputFocus && onInputFocus(true)}
                onBlur={() => onInputFocus && onInputFocus(false)}
                placeholder="اكتب هنا..." 
                className="flex-1 min-w-0 bg-gray-800 text-white border-0 rounded-full px-3 py-2.5 focus:ring-1 focus:ring-cyan-500/50 placeholder-gray-600 text-[10px] sm:text-xs" 
                disabled={isLoading} 
            />
            <input type="file" accept="image/*,application/pdf,.docx" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
            
            <button onClick={handleSend} className="flex-shrink-0 p-2 rounded-full bg-cyan-600 text-white shadow-lg hover:bg-cyan-500 disabled:opacity-50 transition-transform active:scale-95" disabled={isLoading || (!input.trim() && !attachedFile)}>
                <SendIcon className="w-4 h-4" />
            </button>
          </div>
      </div>
    </div>
  );
};
