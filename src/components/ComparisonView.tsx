
import React, { useState, useRef, useEffect } from 'react';
import { generateContentStream } from '../services/geminiService';
import { CompareIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ComparisonView: React.FC = () => {
  const [device1, setDevice1] = useState('');
  const [device2, setDevice2] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [result]);

  const handleCompare = async () => {
    if (!device1.trim() || !device2.trim()) return;

    setIsLoading(true);
    setResult('');

    try {
      const prompt = `Create a comprehensive technical comparison table between: "${device1}" and "${device2}".
      
      Requirements:
      1. **SOURCE TRUTH**: Use strictly OFFICIAL manufacturer data (e.g., Apple, Samsung, Xiaomi official sites) or highly trusted reviewers (GSMArena).
      2. Format the output as a Markdown Table.
      3. Columns: Feature | ${device1} | ${device2}
      4. Rows to include: Processor, RAM, Storage, Camera, Battery, Charging, Display, Build Quality, OS, Price (Approx).
      5. Language: Arabic.
      6. **VERDICT**: Add a brief "Winner" verdict at the end based on facts, and explicitly mention the data source used (e.g., "Data based on official specs from [Manufacturer]").
      
      Start directly with the table.`;

      // Fix: Pass empty array for history, undefined for image, true for useSearch
      const stream = generateContentStream(prompt, [], undefined, true);
      
      for await (const chunk of stream) {
        setResult(prev => prev + chunk);
      }

    } catch (error) {
      setResult("**عذراً، حدث خطأ أثناء جلب بيانات المقارنة.**");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 p-4 overflow-y-auto pb-24">
       <div className="text-center mb-6 mt-2">
         <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-orange-500/30">
            <CompareIcon className="w-6 h-6 text-orange-400" />
         </div>
         <h2 className="text-lg font-bold text-white">مقارنة الأجهزة</h2>
         <p className="text-[10px] text-gray-400">مقارنة دقيقة من مصادر رسمية وموثوقة</p>
       </div>

       <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg mb-6">
          <div className="space-y-3">
            <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 mr-1">الطرف الأول (مثال: iPhone 15 Pro)</label>
                <input 
                    type="text" 
                    value={device1}
                    onChange={(e) => setDevice1(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-3 py-2.5 text-xs text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    placeholder="اسم الجهاز الأول..."
                />
            </div>
            
            <div className="flex justify-center items-center">
                <span className="bg-gray-700 text-[10px] text-gray-300 px-2 py-0.5 rounded-full font-bold">VS</span>
            </div>

            <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 mr-1">الطرف الثاني (مثال: S24 Ultra)</label>
                <input 
                    type="text" 
                    value={device2}
                    onChange={(e) => setDevice2(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-3 py-2.5 text-xs text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    placeholder="اسم الجهاز الثاني..."
                />
            </div>

            <button 
                onClick={handleCompare}
                disabled={isLoading || !device1 || !device2}
                className="w-full mt-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     جاري البحث والمقارنة...
                    </>
                ) : (
                    <>ابدأ المقارنة</>
                )}
            </button>
          </div>
       </div>

       {/* Result Area */}
       {(result || isLoading) && (
           <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg animate-in fade-in slide-in-from-bottom-4" ref={resultRef}>
               {result ? (
                   <div className="prose prose-invert prose-xs max-w-none">
                        <MarkdownRenderer text={result} />
                   </div>
               ) : (
                   <div className="space-y-3 animate-pulse">
                       <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                       <div className="h-32 bg-gray-700/50 rounded border border-gray-700"></div>
                       <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};
