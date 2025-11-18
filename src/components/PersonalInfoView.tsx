import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PERSONAL_DATA_STRUCTURED } from '../constants';
import { SendIcon, MicrophoneIcon } from './Icons';
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
    const aiResponseText = await generateContent(fullPrompt, undefined, "You are a helpful assistant answering questions based only on provided data.");

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

  return (
    <div className="h-full flex flex-col bg-gray-900">
       <div className="p-2 border-b border-gray-700">
        <div className="flex flex-wrap gap-2 justify-center">
          {PERSONAL_DATA_STRUCTURED.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[calc((100%-1rem)/3)] bg-gray-700 hover:bg-gray-600 text-gray-200 text-center text-[10px] px-1 py-1.5 rounded-md transition-colors truncate"
              title={item.name}
            >
              {item.name}
            </a>
          ))}
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