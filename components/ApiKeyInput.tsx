
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onSetApiKey: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSetApiKey }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSetApiKey(key.trim());
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 h-screen w-screen flex items-center justify-center p-4 text-xs">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xs">
        <h2 className="text-sm font-bold text-center mb-4 text-cyan-400">مفتاح Gemini API</h2>
        <p className="text-center mb-4 text-gray-400">
          يرجى إدخال مفتاح Gemini API الخاص بك للمتابعة.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="AIzaSy... "
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500"
            disabled={!key.trim()}
          >
            حفظ و متابعة
          </button>
        </form>
         <p className="text-center mt-4 text-gray-500 text-[10px]">
          يمكنك الحصول على مفتاحك من{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
            Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
};
