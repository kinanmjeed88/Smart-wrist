
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAiNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 p-3 rounded-lg animate-pulse mb-3">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-1.5"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-1.5"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded w-20"></div>
            <div className="h-6 bg-gray-700 rounded w-20"></div>
            <div className="h-6 bg-gray-700 rounded w-20"></div>
        </div>
    </div>
);


export const AiNewsView: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const fetchCalled = useRef(false);

    const fetchNews = useCallback(async () => {
        if (fetchCalled.current) return;
        fetchCalled.current = true;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const newsItems = await getAiNews();
            setNews(newsItems);
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

    useEffect(() => {
        // Only fetch if we haven't already populated the list (cache-like behavior for this session)
        if (news.length === 0) {
            fetchNews();
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleShare = async (item: NewsItem) => {
        const shareData = {
            title: `خبر تقني: ${item.title}`,
            text: `${item.summary}\n\n${item.link}`,
            url: item.link,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                alert("تم نسخ الرابط! يمكنك الآن مشاركته.");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };
    
    const toggleExpand = (title: string) => {
        setExpandedCardId(prevId => (prevId === title ? null : title));
    };

    if (error && news.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={() => { fetchCalled.current = false; fetchNews(); }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm"
                    aria-label="إعادة محاولة جلب الأخبار"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-2 space-y-3 pb-20">
            {news.map((item, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg shadow-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-cyan-400 text-sm mb-2">{item.title}</h3>
                    <p className={`text-gray-300 text-xs mb-3 transition-all duration-300 ease-in-out ${expandedCardId === item.title ? 'line-clamp-none' : 'line-clamp-5'}`}>
                        {expandedCardId === item.title ? item.details : item.summary}
                    </p>
                    <div className="border-t border-gray-700 pt-2 flex justify-between items-center text-[10px] space-x-2 space-x-reverse">
                         <a href={item.link} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-2 rounded-md transition-colors">
                            استخدام الأداة
                        </a>
                         <button onClick={() => toggleExpand(item.title)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded-md transition-colors">
                            {expandedCardId === item.title ? 'إخفاء التفاصيل' : 'تفاصيل أكثر'}
                        </button>
                         <button onClick={() => handleShare(item)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded-md transition-colors">
                            مشاركة
                        </button>
                    </div>
                </div>
            ))}
            {isLoading && (
                <>
                    <NewsCardSkeleton />
                    <NewsCardSkeleton />
                    <div className="text-center text-gray-500 text-[10px] animate-pulse">جاري جلب آخر الأخبار التقنية...</div>
                </>
            )}
        </div>
    );
};
