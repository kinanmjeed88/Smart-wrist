
import React from 'react';
import { SparklesIcon, NewsIcon, InfoIcon, ArrowRightIcon, MagicWandIcon } from './Icons';

interface HomeViewProps {
  setView: (view: 'chat' | 'aiNews' | 'personalInfo' | 'imageEditor') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto animate-in fade-in duration-500">
      
      <div className="mb-6 text-center mt-2">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">
          أهلاً بك في TechTouch
        </h2>
        <p className="text-gray-400 text-xs">بوابتك الذكية لعالم التقنية</p>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pb-10">
        
        {/* AI News Card */}
        <button
          onClick={() => setView('aiNews')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 p-5 text-right w-full shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-cyan-500/20 p-3 rounded-xl">
                <NewsIcon className="w-6 h-6 text-cyan-400" />
             </div>
             <div className="flex-1 mr-4">
                <h3 className="text-lg font-bold text-gray-100">أخبار الذكاء الاصطناعي</h3>
                <p className="text-xs text-gray-400 mt-1">آخر التطورات والأدوات لحظة بلحظة</p>
             </div>
             <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

        {/* Chat AI Card */}
        <button
          onClick={() => setView('chat')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-5 text-right w-full shadow-lg hover:shadow-purple-500/10"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-purple-500/20 p-3 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
             </div>
             <div className="flex-1 mr-4">
                <h3 className="text-lg font-bold text-gray-100">محادثة الذكاء الاصطناعي</h3>
                <p className="text-xs text-gray-400 mt-1">دردشة ذكية، تحليل صور، وترجمة ملفات</p>
             </div>
             <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

        {/* Image Editor Card */}
        <button
          onClick={() => setView('imageEditor')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-pink-500/50 transition-all duration-300 p-5 text-right w-full shadow-lg hover:shadow-pink-500/10"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-pink-500/20 p-3 rounded-xl">
                <MagicWandIcon className="w-6 h-6 text-pink-400" />
             </div>
             <div className="flex-1 mr-4">
                <h3 className="text-lg font-bold text-gray-100">تعديل الصور الذكي</h3>
                <p className="text-xs text-gray-400 mt-1">تغيير ملامح، ملابس، وأكثر بلمسة واحدة</p>
             </div>
             <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

        {/* Personal Assistant Card */}
        <button
          onClick={() => setView('personalInfo')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 p-5 text-right w-full shadow-lg hover:shadow-emerald-500/10"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-emerald-500/20 p-3 rounded-xl">
                <InfoIcon className="w-6 h-6 text-emerald-400" />
             </div>
             <div className="flex-1 mr-4">
                <h3 className="text-lg font-bold text-gray-100">المساعد الشخصي</h3>
                <p className="text-xs text-gray-400 mt-1">روابط قنواتي، مشاريعي، ومعلوماتي</p>
             </div>
             <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

      </div>
      
      <div className="mt-auto pt-4 text-center">
         <div className="inline-block px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-[10px] text-gray-500">
           V 2.1 by Kinan Majeed
         </div>
      </div>
    </div>
  );
};
