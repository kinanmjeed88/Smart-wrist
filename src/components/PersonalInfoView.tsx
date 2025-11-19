
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PersonalInfoItem } from '../types';
import { PERSONAL_DATA_STRUCTURED } from '../constants';
import { SendIcon, MicrophoneIcon, TelegramIcon, YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon, RobotIcon, ArrowRightIcon } from './Icons';
import { generateContent } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';

// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'ar-SA';
  recognition.interimResults = false;
}

const PERSONAL_INFO_PROMPT = `You are a helpful assistant. Based *only* on the JSON data provided below, answer the user's question. The data contains a list of personal channels and social media links. Respond in a friendly, conversational tone in Arabic. If you find relevant links, present them clearly using Markdown format like [Link Name](URL). If the user asks for "all" or "every" channel, list all of them. If the information is not in the data, state that you could not find what they were looking for. Do not make up information.

JSON Data:
${JSON.stringify(PERSONAL_DATA_STRUCTURED)}

User's Question:`;


interface PersonalInfoViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const PersonalInfoView: React.FC<PersonalInfoViewProps> = ({ messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTelegramChannels, setShowTelegramChannels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const userInput = input;
    setInput('');
    setIsLoading(true);

    const fullPrompt = `${PERSONAL_INFO_PROMPT} "${userInput}"`;
    const aiResponseText = await generateContent(fullPrompt, undefined, false, "You are a helpful assistant answering questions based only on provided data.");

    const aiMessage: ChatMessage = {
      id: Date.now().toString() + '-ai',
      sender: 'ai',
      text: aiResponseText,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
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

  const getIconForCategory = (category: string) => {
      switch (category) {
          case 'bot': return <RobotIcon className="w-5 h-5 text-cyan-400" />;
          case 'youtube': return <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />;
          case 'tiktok': return <TikTokIcon className="w-3.5 h-3.5 text-pink-500" />;
          case 'facebook': return <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />;
          case 'instagram': return <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />;
          case 'telegram': 
          case 'telegram-folder':
          default: return <TelegramIcon className="w-3.5 h-3.5 text-blue-400" />;
      }
  };

  // Data Filtering
  const botItem = PERSONAL_DATA_STRUCTURED.find(item => item.category === 'bot');
  const telegramItems = PERSONAL_DATA_STRUCTURED.filter(item => item.category === 'telegram' || item.category === 'telegram-folder');
  const otherItems = PERSONAL_DATA_STRUCTURED.filter(item => item.category !== 'bot' && item.category !== 'telegram' && item.category !== 'telegram-folder');

  return (
    <div className="h-full flex flex-col bg-gray-900">
       <div className="p-3 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex flex-col gap-3">
            {/* Bot - Distinct and at the top */}
            {botItem && (
                 <a
                  href={botItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                  <RobotIcon className="w-5 h-5 text-white" />
                  <span className="text-sm">{botItem.name}</span>
                </a>
            )}

            {/* Telegram Group Toggle */}
            <div className="w-full">
                 <button
                    onClick={() => setShowTelegramChannels(!showTelegramChannels)}
                    className={`w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-blue-500/30 text-gray-200 text-xs px-4 py-2.5 rounded-xl transition-all ${showTelegramChannels ? 'ring-1 ring-blue-500 bg-gray-700' : ''}`}
                 >
                    <div className="flex items-center gap-2">
                        <TelegramIcon className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">قنوات تيليجرام TechTouch</span>
                    </div>
                    <ArrowRightIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showTelegramChannels ? 'rotate-90' : 'rotate-0'}`} />
                 </button>

                 {/* Telegram Channels Grid (Collapsible) */}
                 <div className={`grid grid-cols-2 gap-2 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${showTelegramChannels ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {telegramItems.map((item) => (
                        <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-800/80 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/50 text-gray-300 hover:text-blue-300 text-[10px] px-2 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                        <TelegramIcon className="w-3 h-3 text-blue-500/70" />
                        <span className="truncate">{item.name}</span>
                        </a>
                    ))}
                 </div>
            </div>

            {/* Other Socials */}
            <div className="flex flex-wrap gap-2 justify-center mt-1">
                 {otherItems.map((item) => (
                    <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[45%] sm:min-w-[30%] bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-200 text-[10px] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                    {getIconForCategory(item.category)}
                    <span className="truncate">{item.name}</span>
                    </a>
                ))}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-2 py-1 ${msg.sender === 'user' ? 'bg-cyan-800' : 'bg-gray-700'}`}>
               {msg.sender === 'ai' ? <MarkdownRenderer text={msg.text} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
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

      <div className="p-1 bg-gray-800 border-t border-gray-700 flex items-center gap-1">
        {recognition && (
          <button onClick={toggleRecording} className={`flex-shrink-0 p-1.5 rounded-full hover:bg-gray-700 text-gray-400 disabled:text-gray-600 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} disabled={isLoading}>
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="اسأل..."
          className="flex-1 min-w-0 bg-gray-700 text-gray-200 border border-gray-600 rounded-full px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs sm:text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="flex-shrink-0 p-1.5 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600"
          disabled={isLoading || !input.trim()}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
