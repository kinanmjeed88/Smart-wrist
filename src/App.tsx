import React, { useState } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { SparklesIcon, InfoIcon, NewsIcon } from './components/Icons';
import { ChatMessage } from './types';

type View = 'aiNews' | 'chat' | 'personalInfo';

// FIX: Replaced the extremely long base64 string with a small, valid placeholder to fix build errors.
const profileImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDU1OEQ0RDI3Q0UyMTFFQUE1NTZCM0Q4N0I0OTdBRjMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDU1OEQ0RDM3Q0UyMTFFQUE1NTZCM0Q4N0I0OTdBRjMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENTU4RDREMDZDUDIxMUVBQTU1NkIzRDg3QjQ5N0FGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENTU4RDREMTdDRTIxMUVBQTU1NkIzRDg3QjQ5N0FGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvoBwOgAAAAMUExURUxpcU5OToKCgnNzc2DP39gAAAAGUExURf///wAAAF+FG+IAAADJSURBVEjH7ZYxDoAwDAQx//+nO9iChQhECW+cIClbVKW2NhxH4k8SKEb4I2CQU4lT/C6g2m3i5D3yUf4wE24YhQy2W0R4lUu6S24YhQy2G2Q4lMu6U24YhQw2W0R4lUu6S24YhQy2G2Q4lUu6S24YhQw2G2Q4lUu6S24YhQw2G2Q4lUu6S24YhQw2G2Q4lUu6S24YhQw2G2Q4lUu6S24YhQw2W0R4lUu6S24YhQy2G2Q4lUu6S24YhQw2G2Q4lUu6+wdq3A/0DxMGAAQBAAD//wMAJK8B6rq+wNsAAAAASUVORK5CYII=";

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