
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPhoneNews } from '../services/geminiService';
import { PhoneNewsItem } from '../types';
import { CopyIcon, PhoneIcon, TrashIcon, CpuIcon, BatteryIcon, CameraIcon, ScreenIcon, RamIcon, StorageIcon } from './Icons';
import toast from 'react-hot-toast';

interface PhoneNewsViewProps {
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const PhoneCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 p-4 rounded-xl animate-pulse mb-4 border border-gray-700/50">
        <div className="h-5 bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
        <div className="space-y-2 mt-3">
             <div className="h-2 bg-gray-700 rounded w-3/4"></div>
             <div className="h-2 bg-gray-700 rounded w-3/4"></div>
             <div className="h-2 bg-gray-700 rounded w-2/3"></div>
        </div>
    </div>
);

export const PhoneNewsView: React.FC<PhoneNewsViewProps> = ({ onScroll }) => {
    const [phones, setPhones] = useState<PhoneNewsItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchCalled = useRef(false);

    useEffect(() => {
        const cached = localStorage.getItem('phone_news_cache');
        if (cached) {
            try {
                setPhones(JSON.parse(cached));
            } catch (e) {
                console.error("Cache error", e);
            }
        } else {
            fetchNews();
        }
    }, []);

    const fetchNews = useCallback(async () => {
        if (fetchCalled.current) return;
        fetchCalled.current = true;
        
        try {
            setIsLoading(true);
            setError(null);
            const phoneItems = await getPhoneNews();
            setPhones(phoneItems);
            localStorage.setItem('phone_news_cache', JSON.stringify(phoneItems));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("حدث خطأ غير متوقع.");
            }
        } finally {
            setIsLoading(false);
            fetchCalled.current = false; 
        }
    }, []);

    const clearCache = () => {
        if (window.confirm('هل تريد حذف أخبار الهواتف المحفوظة؟')) {
            localStorage.removeItem('phone_news_cache');
            setPhones([]);
            setVisibleCount(3);
            fetchNews();
            toast.success('تم الحذف والتحديث');
        }
    };

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 3);
    };

    const handleCopyName = (name: string) => {
        navigator.clipboard.writeText(name);
        toast.success(`تم نسخ: ${name}`);
    };

    const getSpecIcon = (text: string) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('mah') || lowerText.includes('battery') || lowerText.includes('بطارية')) return <BatteryIcon className="w-3 h-3 text-green-400" />;
        if (lowerText.includes('mp') || lowerText.includes('camera') || lowerText.includes('كاميرا')) return <CameraIcon className="w-3 h-3 text-blue-400" />;
        if (lowerText.includes('inch') || lowerText.includes('oled') || lowerText.includes('lcd') || lowerText.includes('display') || lowerText.includes('شاشة')) return <ScreenIcon className="w-3 h-3 text-yellow-400" />;
        if (lowerText.includes('snapdragon') || lowerText.includes('bionic') || lowerText.includes('dimensity') || lowerText.includes('processor') || lowerText.includes('معالج')) return <CpuIcon className="w-3 h-3 text-red-400" />;
        if (lowerText.includes('ram') || lowerText.includes('gb ram') || lowerText.includes('رام')) return <RamIcon className="w-3 h-3 text-purple-400" />;
        if (lowerText.includes('storage') || lowerText.includes('tb') || lowerText.includes('gb') || lowerText.includes('ذاكرة')) return <StorageIcon className="w-3 h-3 text-cyan-400" />;
        return <div className="w-1 h-1 bg-indigo-500 rounded-full flex-shrink-0"></div>; // Default dot
    };

    return (
        <div className="h-full overflow-y-auto p-4 pb-24 space-y-4" onScroll={onScroll}>
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-900/95 backdrop-blur z-10 py-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                     <div className="bg-indigo-500/20 p-1.5 rounded-lg">
                        <PhoneIcon className="w-4 h-4 text-indigo-400" />
                     </div>
                    <h2 className="text-indigo-400 font-bold text-sm">أحدث الهواتف</h2>
                </div>
                <button 
                    onClick={clearCache}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-full transition-colors"
                    title="حذف النتائج وتحديث"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>

            {error && phones.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => { fetchCalled.current = false; fetchNews(); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-colors text-sm shadow-lg"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {phones.slice(0, visibleCount).map((phone, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700/50 p-4 rounded-xl shadow-lg hover:border-indigo-500/30 transition-all duration-200 relative group">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-sm leading-snug">{phone.modelName}</h3>
                        <button 
                            onClick={() => handleCopyName(phone.modelName)}
                            className="text-gray-500 hover:text-indigo-400 p-1 rounded-md hover:bg-gray-700"
                            title="نسخ اسم الهاتف"
                        >
                            <CopyIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-3 italic border-b border-gray-700 pb-2 leading-relaxed">
                        {phone.summary}
                    </p>

                    <div className="bg-gray-900/50 rounded-lg p-3">
                        <h4 className="text-[10px] text-indigo-400 font-bold mb-2 uppercase tracking-wide">المواصفات الرئيسية:</h4>
                        <ul className="grid grid-cols-2 gap-2">
                            {phone.specs.map((spec, i) => (
                                <li key={i} className="text-[10px] text-gray-300 flex items-center gap-1.5">
                                    {getSpecIcon(spec)}
                                    {spec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}

            {visibleCount < phones.length && (
                <button 
                    onClick={handleShowMore} 
                    className="w-full py-3 text-center text-indigo-400 text-xs font-bold bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                >
                    عرض المزيد ({phones.length - visibleCount})
                </button>
            )}

            {isLoading && (
                <>
                    <PhoneCardSkeleton />
                    <div className="text-center text-gray-500 text-[10px] animate-pulse mt-4">جاري البحث عن أحدث الهواتف...</div>
                </>
            )}
        </div>
    );
};
