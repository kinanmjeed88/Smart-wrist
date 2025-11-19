
import React, { useState, useEffect, useRef } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { HomeView } from './components/HomeView';
import { SparklesIcon, NewsIcon, LogoutIcon, HomeIcon, DownloadIcon } from './components/Icons';
import { ChatMessage } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';

type View = 'home' | 'aiNews' | 'chat' | 'personalInfo';

// TechTouch Themed Icon (Fingerprint Circuit SVG as Base64)
const profileImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwIiB5Mj0iMTAwIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzIyZDNZWSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGI1N2QwIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDgiIGZpbGw9IiMwZjE3MmEiIHN0cm9rZT0idXJsKCNncmFkKSIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxwYXRoIGQ9Ik01MCAyNUc1MCAzNU01MCA2NUc1MCA3NSIgc3Ryb2tlPSIjMjJkM2VlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KICA8cGF0aCBkPSJNMzUuMzU1IDM1LjM1NUMzMS40NSAzOS4yNiAyOSA0NC42NSAyOSA1MEMyOSA1NS4zNSAzMS40NSA2MC43NCAzNS4zNTUgNjQuNjQ1IiBzdHJva2U9IiMyMmQzZWUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDxwYXRoIGQ9Ik02NC42NDUgMzUuMzU1QzY4LjU1IDM5LjI2IDcxIDQ0LjY1IDcxIDUwQzcxIDU1LjM1IDY4LjU1IDYwLjE0IDY0LjY0NSA2NC42NDUiIHN0cm9rZT0iIzIyZDNZWSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+CiAgPHBhdGggZD0iTTQyIDQyQzQyIDQyIDQ0IDQ1IDQ0IDUwQzQ0IDU1IDQyIDU4IDQyIDU4IiBzdHJva2U9IiMyMmQzZWUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDxwYXRoIGQ9Ik01OCA0MkM1OCA0MiA1NiA0NSA1NiA1MEM1NiA1NSA1OCA1OCA1OCA1OCIgc3Ryb2tlPSIjMjJkM2VlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9zdmc+";

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي من TechTouch. يمكنك أن تسألني عن أي من قنواتنا أو حساباتنا.' }
  ]);
  
  // UI States
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) {
      setHasApiKey(true);
    }

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setHasApiKey(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('gemini_api_key');
    setHasApiKey(false);
    setChatMessages([]);
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      setInstallPrompt(null);
    }
  };

  // Shared scroll handler for views
  const handleViewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Hide header on scroll down, show on scroll up
    if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
      setShowHeader(false);
    } else if (currentScrollY < lastScrollY.current) {
      setShowHeader(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleInputFocus = (focused: boolean) => {
    // Hide global footer when typing on small screens to save space
    setShowFooter(!focused);
  };

  if (!hasApiKey) {
    return <ApiKeyModal onSetApiKey={handleSetApiKey} />;
  }

  return (
    <div className="h-screen h-dvh w-screen bg-[#0f1115] text-gray-200 flex flex-col font-sans text-sm overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      
      {/* Floating Header */}
      <header 
        className={`absolute top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md p-3 flex justify-between items-center border-b border-gray-800 h-14 z-50 transition-transform duration-300 ease-in-out ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => setView('home')}>
          <img src={profileImage} alt="TechTouch" className="w-9 h-9 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
          <div>
            <h1 className="font-bold text-sm tracking-wider text-white font-mono">TechTouch</h1>
            <p className="text-cyan-500 text-[10px] font-semibold tracking-wide">SMART ASSISTANT</p>
          </div>
        </div>
        <div className="flex gap-2">
           {installPrompt && (
            <button onClick={handleInstallClick} className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-full bg-cyan-900/30" aria-label="تثبيت التطبيق">
              <DownloadIcon className="w-4 h-4" />
            </button>
           )}
           <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-800" aria-label="تسجيل خروج">
             <LogoutIcon className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content Area - Full Height with Padding for Floating Elements */}
      <main className="flex-1 w-full h-full relative pt-14 pb-0">
        {view === 'home' && <HomeView setView={setView} onScroll={handleViewScroll} />}
        {view === 'aiNews' && <AiNewsView onScroll={handleViewScroll} />}
        {view === 'chat' && (
          <ChatView 
            messages={chatMessages} 
            setMessages={setChatMessages} 
            onScroll={handleViewScroll} 
            onInputFocus={handleInputFocus}
          />
        )}
        {view === 'personalInfo' && <PersonalInfoView messages={infoMessages} setMessages={setInfoMessages} />}
      </main>

      {/* Floating Bottom Navigation */}
      <div className={`fixed bottom-4 left-4 right-4 z-50 transition-transform duration-300 ease-in-out ${showFooter ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <footer className="bg-gray-900/90 backdrop-blur-xl p-1 flex justify-around items-center rounded-2xl shadow-2xl border border-gray-700/50 h-16">
           <button
            onClick={() => setView('aiNews')}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-300 ${view === 'aiNews' ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <NewsIcon className={`w-6 h-6 mb-0.5 ${view === 'aiNews' ? 'fill-current' : ''}`} />
            <span className="text-[9px]">الأخبار</span>
          </button>
          
           <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center justify-center w-14 h-14 -mt-8 rounded-full border-4 border-[#0f1115] transition-all duration-300 shadow-lg ${view === 'home' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            <HomeIcon className="w-7 h-7" />
          </button>

          <button
            onClick={() => setView('chat')}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-300 ${view === 'chat' ? 'text-purple-400 bg-purple-400/10' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <SparklesIcon className={`w-6 h-6 mb-0.5 ${view === 'chat' ? 'fill-current' : ''}`} />
            <span className="text-[9px]">محادثة</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
