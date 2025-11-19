
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPhoneNews } from '../services/geminiService';
import { PhoneNewsItem } from '../types';
import { CopyIcon, PhoneIcon, TrashIcon, CpuIcon, BatteryIcon, CameraIcon, ScreenIcon, RamIcon, StorageIcon, SearchIcon, RefreshIcon } from './Icons';
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
    const [expandedPhoneIndex, setExpandedPhoneIndex] = useState<number | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const fetchNews = useCallback(async (query?: string) => {
        if (fetchCalled.current && !query) return;
        fetchCalled.current = true;
        
        try {
            setIsLoading(true);
            setError(null);
            const phoneItems = await getPhoneNews(query);
            setPhones(phoneItems);
            if (!query) {
                localStorage.setItem('phone_news_cache', JSON.stringify(phoneItems));
            }
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

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setPhones([]);
            fetchNews(searchQuery);
        }
    };

    const handleRefresh = () => {
        if (window.confirm('هل تريد تحديث القائمة بجلب نتائج جديدة؟')) {
            setPhones([]);
            fetchNews(searchQuery); // Refresh current search or general
        }
    };

    const clearCache = () => {
        if (window.confirm('هل تريد حذف النتائج المحفوظة؟')) {
            localStorage.removeItem('phone_news_cache');
            setPhones([]);
            setSearchQuery('');
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

    const toggleExpand = (index: number) => {
        setExpandedPhoneIndex(expandedPhoneIndex === index ? null : index);
    };

    const getSpecIcon = (text: string) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('mah') || lowerText.includes('battery') || lowerText.includes('بطارية')) return <BatteryIcon className="w-3.5 h-3.5 text-green-400" />;
        if (lowerText.includes('mp') || lowerText.includes('camera') || lowerText.includes('كاميرا')) return <CameraIcon className="w-3.5 h-3.5 text-blue-400" />;
        if (lowerText.includes('inch') || lowerText.includes('oled') || lowerText.includes('lcd') || lowerText.includes('display') || lowerText.includes('شاشة')) return <ScreenIcon className="w-3.5 h-3.5 text-yellow-400" />;
        if (lowerText.includes('snapdragon') || lowerText.includes('bionic') || lowerText.includes('dimensity') || lowerText.includes('processor') || lowerText.includes('معالج')) return <CpuIcon className="w-3.5 h-3.5 text-red-400" />;
        if (lowerText.includes('ram') || lowerText.includes('gb ram') || lowerText.includes('رام')) return <RamIcon className="w-3.5 h-3.5 text-purple-400" />;
        if (lowerText.includes('storage') || lowerText.includes('tb') || lowerText.includes('gb') || lowerText.includes('ذاكرة')) return <StorageIcon className="w-3.5 h-3.5 text-cyan-400" />;
        return <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>; 
    };

    return (
        <div className="h-full overflow-y-auto p-4 pb-24 space-y-4" onScroll={onScroll}>
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur z-10 py-2 border-b border-gray-800">
                <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center gap-2">
                        <div className="bg-indigo-500/20 p-1.5 rounded-lg">
                            <PhoneIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h2 className="text-indigo-400 font-bold text-sm">أحدث الهواتف</h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSearch(!showSearch)}
                            className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                            title="بحث"
                        >
                            <SearchIcon className="w-4 h-4" />
                        </button>
                         <button 
                            onClick={handleRefresh}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-indigo-400 p-2 rounded-full transition-colors"
                            title="تحديث النتائج"
                        >
                            <RefreshIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={clearCache}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-full transition-colors"
                            title="حذف النتائج"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {showSearch && (
                    <div className="animate-in slide-in-from-top-2 mb-2">
                        <div className="relative">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="ابحث عن هاتف محدد..."
                                className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button 
                                onClick={handleSearch}
                                className="absolute left-1.5 top-1.5 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg transition-colors"
                            >
                                <SearchIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && phones.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => { fetchCalled.current = false; fetchNews(searchQuery); }}
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
                            className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-700/50 hover:bg-indigo-600 transition-colors"
                            title="نسخ اسم الهاتف"
                        >
                            <CopyIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-3 border-b border-gray-700 pb-2 leading-relaxed">
                        {phone.summary}
                    </p>

                    {/* Collapsed View Preview */}
                    {expandedPhoneIndex !== index && (
                         <div className="flex gap-2 overflow-hidden pb-2">
                            {phone.specs.slice(0, 3).map((spec, i) => (
                                <span key={i} className="text-[9px] bg-gray-900 text-gray-400 px-2 py-1 rounded-full whitespace-nowrap truncate border border-gray-700">
                                   {spec}
                                </span>
                            ))}
                            <span className="text-[9px] text-gray-500 self-center">...</span>
                         </div>
                    )}

                    {/* Expanded Detailed Specs */}
                    {expandedPhoneIndex === index && (
                        <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50 animate-in slide-in-from-top-2">
                            <h4 className="text-[10px] text-indigo-400 font-bold mb-3 uppercase tracking-wide border-b border-indigo-500/20 pb-1 w-fit">
                                المواصفات التفصيلية:
                            </h4>
                            <ul className="space-y-2">
                                {phone.specs.map((spec, i) => (
                                    <li key={i} className="text-[10px] text-gray-200 flex items-start gap-2 bg-gray-800/80 p-1.5 rounded-lg">
                                        <div className="mt-0.5 p-1 bg-gray-900 rounded-md border border-gray-700">
                                           {getSpecIcon(spec)}
                                        </div>
                                        <span className="mt-0.5 leading-snug">{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button 
                        onClick={() => toggleExpand(index)}
                        className="mt-3 w-full text-center text-[10px] text-indigo-300 hover:text-white hover:bg-indigo-600/20 py-1.5 rounded-lg transition-colors border border-dashed border-indigo-500/30"
                    >
                        {expandedPhoneIndex === index ? 'إخفاء التفاصيل' : 'تفاصيل أكثر ▾'}
                    </button>
                </div>
            ))}

            {visibleCount < phones.length && (
                <button 
                    onClick={handleShowMore} 
                    className="w-full py-3 text-center text-indigo-400 text-xs font-bold bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700 shadow-md"
                >
                    عرض المزيد ({phones.length - visibleCount})
                </button>
            )}

            {isLoading && (
                <>
                    <PhoneCardSkeleton />
                    <div className="text-center text-gray-500 text-[10px] animate-pulse mt-4">
                        {searchQuery ? 'جاري البحث...' : 'جاري جلب أحدث الهواتف...'}
                    </div>
                </>
            )}
        </div>
    );
};
