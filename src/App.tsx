
import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { PersonalInfoView } from './components/PersonalInfoView';
import { AiNewsView } from './components/AiNewsView';
import { SparklesIcon, InfoIcon, NewsIcon, LogoutIcon } from './components/Icons';
import { ChatMessage } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';

type View = 'aiNews' | 'chat' | 'personalInfo';

const profileImage = "data:image/webp;base64,UklGRtQMAABXRUJQVlA4IMgMAADwEACdASoA6ADoAPpE+mU2lpCoi/V5m/AWiWNu/E/wxmJj/9I/MD0C/gT/Gf4j+3/3D9wD0APkn/E/2X+p/8T/N/5//+fAH9P/sH/G/bz/Jf9H9wvhF/yP95/5v+F/eL/Q/cB/MP8x/wP8l+23/V/4X/A/4f7AfsJ/lP+r/i//D/xf9//9O///4Afyf/P/8D/Pf5b/9f91////+8AP8H8gH8A/lH+j/6n/A/3H/Y/+D/of///3P+5/+//9vAD+X/7f/b/53/7/77////+8BP5f/sf+l/kf+Z/ev///3v+9/8P3C/yz/T/2P+n/7f9v/93+AP7h/8P/Z/f/hA/y//f/6//X/4P/i/b3////+P//7kP5h/p/+//yv/B/2X2h/vf/N/q/8d/sv+1/fv/H/3P/L/43+M/v3/B/5v/s/4X+9/8v/U/5n9s////gB/Mf6X/q/5n/g/7L9xf///yf+p/v//J/6P/c////bf8r/s/+5/q/8T/j/bL///9j/sP9r////Qf5f/f/8D/N/6v/h/6H////+9gD/Mf8L/u/5b/c/7z96f///nv9r/x/9l/tf+f/2/7l////+8AD+U/7v/p/5X/R/6v8y/////+lT+b/6P/g/yX/E/4L/Pf///+fbn/s//d/6H/M/9T/Mf///4vtB/Yf63/u/53/h/8D/P////uN/mf+H/5P+f/5n/E/4v////1Q/y/+z/7P+3/4v/O/yf////d5/t//5/3P9z/y/9t/////+AP81/pf+z/ov+X/3/+T/////+2f/H/7f/a/3P/L/1H////+8AD+Zf7//s/7X/i/9T+6/////+yv7h/r/+D/lf+R/xv7N////+AP85/t/+b/vf+R/xf8K/////+zH9v/uf+P/n/+d/fvob///8f9W/1/3f9f7wH/m/1P9v/mP+D/gf28////+x/lf9z/s/5n/g/479s////+sf5H/T/7H/L/8L/Qfsd////+p/4P+9/3v+D/3f+p/ff///4P/8/7X///8P//9/j/8L////8p/////+x//j6ff3t6H9//oH//6h///2H/////4kH9/0EAH9//oH//6h///2H///8L/mP/f//j///oP//9/j///yL//4X//97/+//3/////zP3/+Q///+w/+T72H///qH///8L/mP/f///+P//+g///3+P///Iv//hf//3v+///f////8z9//kH///7D/5PvZf3/95///4f//94D////8z9//kP///sP8V3eD/d7P9y4VpC9hA4P+L8aE+Yn3E/v+Uf8P/99/vP+f5kP+R/y/sH/T/q/+T/xf3z/vX/Wf8X/I/8T+8+wH+H/zH+5/1P+O/yv9l/xv9t/zP/F/6X9m/9b/yv/E/2f3L/uf9N/yv+F/w/95/g/81/nP+T/ov9t/vv9l/y/+R/0P+g/yf+H/x/95/kv+B/q/+l/vf+j/2H+w/5X/V/yP/E/yn9p/8r/hf6r+z/9H/v/8z/3P+D/wP+d/xP+H/uv9t/x/8b/Y/+r9p/9N/u/+T/uv/D/xH+v/1X9N/v/8v/yf9N/v/8z/3P+f/yf9r/pv+r/vv+J/3H+S/yv+l/pv9V/uP+X/vv97/yf+l/uP+N/u//J/8D9d//zP8b+7/+z++f/7f/P////8s/+B+tf+//x/9B/vP+H////sM/if9V/pv9F/tv///+J/sP+//zf9h/zX+//6z////sL/ff+d/t/+b/wv+u/y/////9N/6b99//W/yv/F/+T+7/4f+j/+f+R//P8T//P8T+6/+f+R//P8T+7/+d/yf//D/C/+T+7/+d/5H/8/xP7r/5/5H/8/xP7r/z/+A/+//n/kf/z/E/uv/---";

const App: React.FC = () => {
  const [view, setView] = useState<View>('chat');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [infoMessages, setInfoMessages] = useState<ChatMessage[]>([
    { id: 'initial-info', sender: 'ai', text: 'مرحبًا! أنا مساعدك الشخصي. يمكنك أن تسألني عن أي من قنواتي أو حساباتي.' }
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
          <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full" />
          <div>
            <h1 className="font-bold text-xs">Kinan Majeed</h1>
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
