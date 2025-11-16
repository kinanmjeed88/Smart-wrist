import React, { useState } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { SparklesIcon, InfoIcon, NewsIcon } from './components/Icons';
import { ChatMessage } from './types';

type View = 'aiNews' | 'chat' | 'personalInfo';

// FIX: Replaced the extremely long and broken base64 string with a small, valid placeholder to fix build errors.
const profileImage = "";
const App: React.FC = () => {
  const [view, setView] = useState<View>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي. يمكنك أن تسألني عن أي من قنواتي أو حساباتي.' }
  ]);

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col font-sans text-sm">
      <header className="flex-shrink-0 bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full" />
          <div>
            <h1 className="font-bold text-xs">Kinan Majeed</h1>
            <p className="text-gray-400 text-[10px]">Online</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {view === 'aiNews' && <AiNewsView />}
        {view === 'chat' && <ChatView messages={chatMessages} setMessages={setChatMessages} />}
        {view === 'personalInfo' && <PersonalInfoView messages={infoMessages} setMessages={setInfoMessages} />}
      </main>

      <footer className="flex-shrink-0 bg-gray-800 p-1 flex justify-around items-center border-t border-gray-700">
        <button
          onClick={() => setView('aiNews')}
          className={`p-2 rounded-full transition-colors ${view === 'aiNews' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          aria-label="AI News"
        >
          <NewsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('chat')}
          className={`p-2 rounded-full transition-colors ${view === 'chat' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          aria-label="AI Chat"
        >
          <SparklesIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('personalInfo')}
          className={`p-2 rounded-full transition-colors ${view === 'personalInfo' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          aria-label="Personal Info"
        >
          <InfoIcon className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};

export default App;
