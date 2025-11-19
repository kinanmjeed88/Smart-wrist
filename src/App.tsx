
import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { HomeView } from './components/HomeView';
import { ComparisonView } from './components/ComparisonView';
import { SparklesIcon, NewsIcon, LogoutIcon, HomeIcon } from './components/Icons';
import { ChatMessage, View } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toaster } from 'react-hot-toast';

// TechTouch Icon
const profileImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwIiB5Mj0iMTAwIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzIyZDNZWSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGI1N2QwIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDgiIGZpbGw9IiMwZjE3MmEiIHN0cm9rZT0idXJsKCNncmFkKSIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxwYXRoIGQ9Ik01MCAyNUc1MCAzNU01MCA2NUc1MCA3NSIgc3Ryb2tlPSIjMjJkM2VlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KICA8cGF0aCBkPSJNMzUuMzU1IDM1LjM1NUMzMS40NSAzOS4yNiAyOSA0NC42NSAyOSA1MEMyOSA1NS4zNSAzMS40NSA2MC43NCAzNS4zNTUgNjQuNjQ1IiBzdHJva2U9IiMyMmQzZWUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDxwYXRoIGQ9Ik02NC42NDUgMzUuMzU1QzY4LjU1IDM5LjI2IDcxIDQ0LjY1IDcxIDUwQzcxIDU1LjM1IDY4LjU1IDYwLjE0IDY0LjY0NSA2NC42NDUiIHN0cm9rZT0iIzIyZDNZWSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+CiAgPHBhdGggZD0iTTQyIDQyQzQyIDQyIDQ0IDQ1IDQ0IDUwQzQ0IDU1IDQyIDU4IDQyIDU4IiBzdHJva2U9IiMyMmQzZWUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDxwYXRoIGQ9Ik01OCA0MkM1OCA0MiA1NiA0NSA1NiA1MEM1NiA1NSA1OCA1OCA1OCA1OCIgc3Ryb2tlPSIjMjJkM2VlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogPC9zdmc+";

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي من TechTouch.' }
  ]);

  useEffect(() => {
    const key = localStorage.getItem('gemini-api-key');
    if (key) {
      setHasApiKey(true);
    }
  }, []);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini-api-key', key);
    setHasApiKey(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('gemini-api-key');
    setHasApiKey(false);
    setView('home');
    setChatMessages([]); 
  };

  if (!hasApiKey) {
    return <ApiKeyModal onSetApiKey={handleSetApiKey} />;
  }

  return (
    <div className="h-dvh w-screen bg-[#0f1115] text-gray-200 flex flex-col font-sans text-sm overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md p-3 flex justify-between items-center border-b border-gray-800 h-14 z-20 sticky top-0">
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer active:opacity-70 transition-opacity" onClick={() => setView('home')}>
          <img src={profileImage} alt="TechTouch" className="w-8 h-8 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.4)] border border-cyan-500/30" />
          <div>
            <h1 className="font-bold text-sm tracking-wider text-white font-mono">TechTouch</h1>
            <p className="text-cyan-500 text-[9px] font-bold tracking-wide">SMART ASSISTANT</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10" 
          aria-label="تسجيل خروج"
        >
             <LogoutIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area - Added pb-16 to prevent footer overlap */}
      <main className="flex-1 overflow-hidden relative w-full pb-16">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'aiNews' && <AiNewsView />}
        {view === 'chat' && <ChatView messages={chatMessages} setMessages={setChatMessages} />}
        {view === 'personalInfo' && <PersonalInfoView messages={infoMessages} setMessages={setInfoMessages} />}
        {view === 'comparison' && <ComparisonView />}
      </main>

      {/* Bottom Navigation */}
      <footer className="flex-shrink-0 bg-gray-900/95 backdrop-blur-lg flex justify-around items-center border-t border-gray-800 h-16 pb-safe safe-area-pb z-50 fixed bottom-0 w-full">
         <button
          onClick={() => setView('aiNews')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${view === 'aiNews' ? 'text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <NewsIcon className={`w-5 h-5 mb-1 ${view === 'aiNews' ? 'fill-current drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : ''}`} />
          <span className="text-[9px] font-medium">الأخبار</span>
        </button>
        
         <button
          onClick={() => setView('home')}
          className={`flex flex-col items-center justify-center w-14 h-14 -mt-8 rounded-full border-4 border-[#0f1115] transition-all duration-300 shadow-lg shadow-black/50 ${view === 'home' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white ring-2 ring-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <HomeIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => setView('chat')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${view === 'chat' || view === 'comparison' ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <SparklesIcon className={`w-5 h-5 mb-1 ${view === 'chat' || view === 'comparison' ? 'fill-current drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : ''}`} />
          <span className="text-[9px] font-medium">محادثة</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
