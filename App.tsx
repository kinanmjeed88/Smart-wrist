
import React, { useState, useEffect } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { SparklesIcon, InfoIcon, LogoutIcon } from './components/Icons';
import { ChatMessage } from './types';

type View = 'chat' | 'personalInfo';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
  const [view, setView] = useState<View>('chat');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat-messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [personalInfoMessages, setPersonalInfoMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('personal-info-messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'initial',
        sender: 'ai',
        text: 'مرحبا بكم في موقع techtouch للبحث عن قنواتي في التيليكرام واليوتيوب والتكتوك'
      }
    ];
  });
  
  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('personal-info-messages', JSON.stringify(personalInfoMessages));
  }, [personalInfoMessages]);

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  };

  const handleClearApiKey = () => {
    setApiKey(null);
    localStorage.removeItem('gemini-api-key');
  };

  if (!apiKey) {
    return <ApiKeyInput onSetApiKey={handleSetApiKey} />;
  }

  return (
    <div className="bg-gray-900 text-gray-200 h-screen w-screen flex flex-col font-sans text-xs">
      <header className="bg-gray-800 p-2 shadow-md z-10 flex justify-between items-center">
        <h1 className="text-sm font-bold text-center text-cyan-400 flex-1">المساعد الشخصي الذكي</h1>
        <button onClick={handleClearApiKey} title="تغيير مفتاح API" className="text-gray-400 hover:text-white transition-colors">
          <LogoutIcon className="w-4 h-4" />
        </button>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {view === 'chat' && <ChatView apiKey={apiKey} messages={chatMessages} setMessages={setChatMessages} />}
        {view === 'personalInfo' && <PersonalInfoView apiKey={apiKey} messages={personalInfoMessages} setMessages={setPersonalInfoMessages} />}
      </main>

      <footer className="bg-gray-800 p-1 flex justify-around items-center border-t border-gray-700">
        <button
          onClick={() => setView('chat')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${view === 'chat' ? 'text-cyan-400' : 'text-gray-400 hover:bg-gray-700'}`}
        >
          <SparklesIcon className="w-4 h-4 mb-1" />
          <span>Chat AI</span>
        </button>
        <button
          onClick={() => setView('personalInfo')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${view === 'personalInfo' ? 'text-cyan-400' : 'text-gray-400 hover:bg-gray-700'}`}
        >
          <InfoIcon className="w-4 h-4 mb-1" />
          <span>معلوماتي</span>
        </button>
      </footer>
    </div>
  );
};

export default App;