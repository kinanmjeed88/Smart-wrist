
import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { PhoneNewsView } from './components/PhoneNewsView';
import { HomeView } from './components/HomeView';
import { ComparisonView } from './components/ComparisonView';
import { SparklesIcon, NewsIcon, LogoutIcon, HomeIcon, CompareIcon, PhoneIcon, InfoIcon } from './components/Icons';
import { ChatMessage, View } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toaster } from 'react-hot-toast';

// Professional TechTouch Logo (Geometric/Tech style)
const profileImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibG9nb0dyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDZTRkQ3IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzQjgyRjYiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExMTgyNyIgLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgc3Ryb2tlPSJ1cmwoI2xvZ29HcmFkKSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBzdHJva2UtZGFzaGFycmF5PSIyODAgNDAiIHRyYW5zZm9ybT0icm90YXRlKDQ1IDUwIDUwKSIgLz4KICA8IS0tIFRlY2ggVCBzaGFwZSAtLT4KICA8cGF0aCBkPSJNMzAgMzVINTAgVjcwIiBzdHJva2U9InVybCgjbG9nb0dyYWQpIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KICA8cGF0aCBkPSJNNTAgMzVINzAiIHN0cm9rZT0idXJsKCNsb2dvR3JhZCkiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDwhLS0gQ2lyY3VpdCBkb3RzIC0tPgogIDxjaXJjbGUgY3g9IjMwIiBjeT0iMzUiIHI9IjQiIGZpbGw9IiMzQjgyRjYiIC8+CiAgPGNpcmNsZSBjeD0iNzAiIGN5PSIzNSIgcj0iNCIgZmlsbD0iIzA2Q0ZENyIgLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjcwIiByPSI0IiBmaWxsPSIjMDZTRkQ3IiAvPgo8L3N2Zz4=";

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [apiKey, setApiKey] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي. يمكنك أن تسألني عن أي من قنواتي أو مشاريعي.' }
  ]);

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
    <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col font-sans text-sm overflow-hidden">
      <Toaster position="top-center" />
      
      <header className="flex-shrink-0 bg-gray-800/80 backdrop-blur-md p-3 flex justify-between items-center border-b border-gray-700 z-20 shadow-md">
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => setView('home')}>
          <img src={profileImage} alt="Logo" className="w-9 h-9 rounded-full border border-gray-600 p-0.5 bg-gray-800" />
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
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
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

      <main className="flex-1 overflow-hidden relative bg-gray-900">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'aiNews' && <AiNewsView />}
        {view === 'phoneNews' && <PhoneNewsView />}
        {view === 'chat' && <ChatView messages={chatMessages} setMessages={setChatMessages} />}
        {view === 'personalInfo' && <PersonalInfoView messages={infoMessages} setMessages={setInfoMessages} />}
        {view === 'comparison' && <ComparisonView />}
      </main>
      
       {view !== 'home' && (
           <nav className="flex-shrink-0 bg-gray-800 border-t border-gray-700 p-1 flex justify-around items-center z-20">
               <NavButton active={view === 'chat'} onClick={() => setView('chat')} icon={<SparklesIcon className="w-5 h-5" />} label="Chat" />
               <NavButton active={view === 'aiNews'} onClick={() => setView('aiNews')} icon={<NewsIcon className="w-5 h-5" />} label="AI News" />
               <NavButton active={view === 'phoneNews'} onClick={() => setView('phoneNews')} icon={<PhoneIcon className="w-5 h-5" />} label="Phones" />
               <NavButton active={view === 'comparison'} onClick={() => setView('comparison')} icon={<CompareIcon className="w-5 h-5" />} label="Compare" />
               <NavButton active={view === 'personalInfo'} onClick={() => setView('personalInfo')} icon={<InfoIcon className="w-5 h-5" />} label="Info" />
           </nav>
       )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 w-14 ${active ? 'text-cyan-400 bg-gray-700/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/30'}`}
    >
        {icon}
        <span className="text-[9px] mt-0.5 font-medium">{label}</span>
    </button>
);

export default App;
