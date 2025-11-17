import React, { useState, useEffect, useCallback } from 'react';
import { getAiNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 p-3 rounded-lg animate-pulse">
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

    const fetchNews = useCallback(async () => {
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
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);


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
                // Fallback for browsers that don't support Web Share API
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


    if (isLoading) {
        return (
            <div className="h-full overflow-y-auto p-2 space-y-3">
               {[...Array(5)].map((_, i) => <NewsCardSkeleton key={i} />)}
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchNews}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm"
                    aria-label="إعادة محاولة جلب الأخبار"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-2 space-y-3">
            {news.map((item, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg shadow-md transition-all duration-300">
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
        </div>
    );
};