import { useState, useEffect } from 'react';
import ChatView from './components/ChatView';
import ApiKeyModal from './components/ApiKeyModal';
import { Toaster } from 'react-hot-toast';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحقق من المفتاح المخزن عند تحميل التطبيق
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
    setIsLoading(false);
  }, []);

  const handleKeySubmit = (key: string) => {
    localStorage.setItem('gemini-api-key', key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white">
      <Toaster position="top-center" />
      {apiKey ? (
        <ChatView apiKey={apiKey} clearApiKey={clearApiKey} />
      ) : (
        <ApiKeyModal onSubmit={handleKeySubmit} />
      )}
    </div>
  );
}

export default App;


