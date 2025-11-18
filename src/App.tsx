
import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { SparklesIcon, InfoIcon, NewsIcon, LogoutIcon } from './components/Icons';
import { ChatMessage } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';

type View = 'aiNews' | 'chat' | 'personalInfo';

// TechTouch Themed Profile Image (Blue/Cyber theme)
const profileImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAhFBMVEUAAAD///86OjpfX18zMzNmZmZEREQtLS1UVFQ0NDRxcXEgICBkZGQsLCxQUFBDQ0MuLi5BQUFMTEwiIiJ9fX0mJiZISEh2dnZwcHAoKCgODg5AQEAeHh4bGxsYGBhvb29HR0dKSkpubm4cHBwWFhZqamodHR1iYmKZmZlERESLi4uPj4+xQ0oVAAAALnRSTlMA+fLg4t/Pz8W+u6yOi4aFfXp2YV1MOzEuJCAWExIQDvn39vXz8u/u7enp5+Xb1zK+hQAAAjNJREFUeNrt19tSwjAQBuCcvKCiFBEv6AW84v3/P6aTtQmttVvbM+ZlF76Z/LQtSUvS9K+15dJad650DLVeW+9C1w91h0t050zHUPtF76t0i/eX6M6FjqF2i9736BbfH9GdEx1D7Ra9H9At3h/QnQsdQ+0Uva/RLd7v0Z0DHUPtFr0f0C3eH9CdCx1D7Ra9H9At3h/QnQsdQ+0Wve/RLb4/ojsnOobaKXrfo1t8v0d3DnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1U/S+Rrd4v0d3DnQMtVv0fka3eH9Gdy50DLVT9L5Gt3i/R3cOdAy1W/R+QLd4f0B3LnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1W/R+QLd4f0B3LnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1U/S+Rrd4v0d3DnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1U/S+Rrd4v0d3DnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1U/S+Rrd4v0d3DnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1U/S+Rrd4v0d3DnQMtVv0fka3eH9Gdy50DLVT9L5Gt3i/R3cOdAy1W/R+QLd4f0B3LnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1U/S+Rrd4v0d3DnQMtVv0fka3eH9Gdy50DLVb9H5At3h/QHcudAy1W/R+QLd4f0B3LnSMf/0b/wFvEkV54/h+8AAAAABJRU5ErkJggg==";

const App: React.FC = () => {
  const [view, setView] = useState<View>('chat');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي من TechTouch. يمكنك أن تسألني عن أي من قنواتنا أو حساباتنا.' }
  ]);

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) {
      setHasApiKey(true);
    }
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

  if (!hasApiKey) {
    return <ApiKeyModal onSetApiKey={handleSetApiKey} />;
  }

  return (
    <div className="h-screen h-dvh w-screen bg-gray-900 text-gray-200 flex flex-col font-sans text-sm overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700 h-12 z-10">
        <div className="flex items-center space-x-2 space-x-reverse">
          <img src={profileImage} alt="TechTouch Profile" className="w-8 h-8 rounded-full bg-cyan-900/50 p-0.5" />
          <div>
            <h1 className="font-bold text-xs tracking-wider text-cyan-400">TechTouch</h1>
            <p className="text-gray-400 text-[10px]">Online</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors p-1" aria-label="تسجيل خروج">
             <LogoutIcon className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative w-full">
        {view === 'aiNews' && <AiNewsView />}
        {view === 'chat' && <ChatView messages={chatMessages} setMessages={setChatMessages} />}
        {view === 'personalInfo' && <PersonalInfoView messages={infoMessages} setMessages={setInfoMessages} />}
      </main>

      <footer className="flex-shrink-0 bg-gray-800 p-1 flex justify-around items-center border-t border-gray-700 h-14 safe-area-pb">
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
