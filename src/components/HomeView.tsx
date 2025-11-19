
import React from 'react';
import { SparklesIcon, NewsIcon, InfoIcon, ArrowRightIcon, CompareIcon, PhoneIcon } from './Icons';
import { View } from '../types';

interface HomeViewProps {
  setView: (view: View) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setView, onScroll }) => {
  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto animate-in fade-in duration-500 pb-24" onScroll={onScroll}>
      
      <div className="mb-6 text-center mt-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">
          أهلاً بك في TechTouch
        </h2>
        <p className="text-gray-400 text-xs">بوابتك الذكية لعالم التقنية</p>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pb-10">
        
        {/* Chat AI Card */}
        <button
          onClick={() => setView('chat')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-4 text-right w-full shadow-lg hover:shadow-purple-500/10"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-purple-500/20 p-3 rounded-xl">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
             </div>
             <div className="flex-1 mr-3">
                <h3 className="text-base font-bold text-gray-100">محادثة الذكاء الاصطناعي</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">دردشة ذكية، تحليل صور</p>
             </div>
             <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

         {/* Comparison Card */}
         <button
          onClick={() => setView('comparison')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-orange-500/50 transition-all duration-300 p-4 text-right w-full shadow-lg hover:shadow-orange-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-orange-500/20 p-3 rounded-xl">
                <CompareIcon className="w-5 h-5 text-orange-400" />
             </div>
             <div className="flex-1 mr-3">
                <h3 className="text-base font-bold text-gray-100">مقارنة الهواتف والأجهزة</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">مقارنات دقيقة ومحدثة</p>
             </div>
             <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-orange-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

        {/* Phone News Card (NEW) */}
        <button
          onClick={() => setView('phoneNews')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 p-4 text-right w-full shadow-lg hover:shadow-indigo-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-indigo-500/20 p-3 rounded-xl">
                <PhoneIcon className="w-5 h-5 text-indigo-400" />
             </div>
             <div className="flex-1 mr-3">
                <h3 className="text-base font-bold text-gray-100">أخبار الهواتف</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">آخر الإصدارات والمواصفات</p>
             </div>
             <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

        {/* AI News Card */}
        <button
          onClick={() => setView('aiNews')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 p-4 text-right w-full shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-cyan-500/20 p-3 rounded-xl">
                <NewsIcon className="w-5 h-5 text-cyan-400" />
             </div>
             <div className="flex-1 mr-3">
                <h3 className="text-base font-bold text-gray-100">أخبار الذكاء الاصطناعي</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">آخر التطورات والأدوات</p>
             </div>
             <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

        {/* Personal Assistant Card */}
        <button
          onClick={() => setView('personalInfo')}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 p-4 text-right w-full shadow-lg hover:shadow-emerald-500/10"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
             <div className="bg-emerald-500/20 p-3 rounded-xl">
                <InfoIcon className="w-5 h-5 text-emerald-400" />
             </div>
             <div className="flex-1 mr-3">
                <h3 className="text-base font-bold text-gray-100">المساعد الشخصي</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">روابط قنواتي ومشاريعي</p>
             </div>
             <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transform group-hover:-translate-x-1 transition-all" />
          </div>
        </button>

      </div>
      
      <div className="mt-auto pt-4 text-center">
         <button 
           onClick={() => setView('about')}
           className="inline-block px-4 py-1.5 rounded-full bg-gray-800/80 border border-gray-700 text-[10px] text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all cursor-pointer"
         >
           V 2.5 by Kinan Majeed
         </button>
      </div>
    </div>
  );
};
