
import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { PhoneNewsView } from './components/PhoneNewsView';
import { HomeView } from './components/HomeView';
import { ComparisonView } from './components/ComparisonView';
import { AboutView } from './components/AboutView';
import { SparklesIcon, NewsIcon, LogoutIcon, HomeIcon, CompareIcon, PhoneIcon, InfoIcon } from './components/Icons';
import { ChatMessage, View } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toaster } from 'react-hot-toast';
import { APP_LOGO, LOCAL_USER_IMAGE } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [apiKey, setApiKey] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي. يمكنك أن تسألني عن أي من قنواتي أو مشاريعي.' }
  ]);
  
  // State for handling background image fallback
  const [bgImageSrc, setBgImageSrc] = useState(LOCAL_USER_IMAGE);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    } else if (process.env.API_KEY) {
        setApiKey(process.env.API_KEY);
    }
  }, []);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini-api-key', key);
    setApiKey(key);
  };

  const handleLogout = () => {
      localStorage.removeItem('gemini-api-key');
      setApiKey('');
      setView('home');
  };

  if (!apiKey) {
    return (
        <>
            <Toaster position="top-center" />
            <ApiKeyModal onSetApiKey={handleSetApiKey} />
        </>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col font-sans text-sm overflow-hidden relative">
      <Toaster position="top-center" />
      
      {/* Background Image Layer with Fallback handling */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         <img 
            src={bgImageSrc}
            onError={() => setBgImageSrc(APP_LOGO)} // Fallback to Logo if local file fails
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110"
         />
         {/* Dark Overlay for readability */}
         <div className="absolute inset-0 bg-gray-900/85"></div>
      </div>

      {/* Main Content Layer - z-10 to sit above background */}
      <div className="relative z-10 flex flex-col h-full">
          <header className="flex-shrink-0 bg-gray-800/60 backdrop-blur-md p-3 flex justify-between items-center border-b border-gray-700 z-20 shadow-md">
            <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => setView('home')}>
              <img src={APP_LOGO} alt="Logo" className="w-9 h-9 rounded-full border border-gray-600 p-0.5 bg-gray-800/80" />
              <div className="flex flex-col">
                <h1 className="font-bold text-sm text-white tracking-wide">TechTouch AI</h1>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-gray-400 text-[10px]">Online</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                {view !== 'home' && (
                    <button 
                        onClick={() => setView('home')} 
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                        title="الرئيسية"
                    >
                        <HomeIcon className="w-5 h-5" />
                    </button>
                )}
                <button 
                    onClick={handleLogout} 
                    className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="تسجيل خروج"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            {view === 'home' && <HomeView setView={setView} />}
            {view === 'aiNews' && <AiNewsView />}
            {view === 'phoneNews' && <PhoneNewsView />}
            {view === 'chat' && <ChatView messages={chatMessages} setMessages={setChatMessages} />}
            {view === 'personalInfo' && <PersonalInfoView messages={infoMessages} setMessages={setInfoMessages} />}
            {view === 'comparison' && <ComparisonView />}
            {view === 'about' && <AboutView />}
          </main>
          
          {view !== 'home' && view !== 'about' && (
              <nav className="flex-shrink-0 bg-gray-800/80 backdrop-blur-md border-t border-gray-700 p-1 flex justify-around items-center z-20">
                  <NavButton active={view === 'chat'} onClick={() => setView('chat')} icon={<SparklesIcon className="w-5 h-5" />} label="Chat" />
                  <NavButton active={view === 'aiNews'} onClick={() => setView('aiNews')} icon={<NewsIcon className="w-5 h-5" />} label="AI News" />
                  <NavButton active={view === 'phoneNews'} onClick={() => setView('phoneNews')} icon={<PhoneIcon className="w-5 h-5" />} label="Phones" />
                  <NavButton active={view === 'comparison'} onClick={() => setView('comparison')} icon={<CompareIcon className="w-5 h-5" />} label="Compare" />
                  <NavButton active={view === 'personalInfo'} onClick={() => setView('personalInfo')} icon={<InfoIcon className="w-5 h-5" />} label="Info" />
              </nav>
          )}
      </div>
    </div>
  );
};

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
            active ? 'text-cyan-400 bg-gray-700/50 scale-110' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
        }`}
    >
        {icon}
        <span className={`text-[9px] mt-1 font-medium ${active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            {label}
        </span>
    </button>
);

export default App;
