
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAiNews } from '../services/geminiService';
import { NewsItem } from '../types';
import { TrashIcon, SearchIcon, RefreshIcon } from './Icons';

interface AiNewsViewProps {
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const NewsCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 p-4 rounded-xl animate-pulse mb-4 border border-gray-700/50">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-1.5"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-1.5"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded w-20"></div>
            <div className="h-6 bg-gray-700 rounded w-20"></div>
        </div>
    </div>
);

export const AiNewsView: React.FC<AiNewsViewProps> = ({ onScroll }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fetchCalled = useRef(false);

    // Load from cache on mount
    useEffect(() => {
        const cached = localStorage.getItem('ai_news_cache');
        if (cached) {
            try {
                setNews(JSON.parse(cached));
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
            const newsItems = await getAiNews(query);
            setNews(newsItems);
            if (!query) {
                localStorage.setItem('ai_news_cache', JSON.stringify(newsItems));
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
            setNews([]);
            fetchNews(searchQuery);
        }
    };

    const handleRefresh = () => {
        if (window.confirm('هل تريد تحديث الأخبار؟')) {
            setNews([]);
            fetchNews(searchQuery);
        }
    };

    const clearCache = () => {
        if (window.confirm('هل تريد حذف النتائج المحفوظة؟')) {
            localStorage.removeItem('ai_news_cache');
            setNews([]);
            setSearchQuery('');
            setVisibleCount(3);
            fetchNews();
        }
    };

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 3);
    };

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
    
    return (
        <>
            <div className="h-full overflow-y-auto p-4 pb-24 space-y-4" onScroll={onScroll}>
                
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur z-10 py-2 border-b border-gray-800">
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="text-cyan-400 font-bold text-sm">آخر أخبار AI</h2>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                title="بحث"
                            >
                                <SearchIcon className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={handleRefresh}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-cyan-400 p-2 rounded-full transition-colors"
                                title="تحديث الأخبار"
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
                                    placeholder="ابحث عن موضوع..."
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="absolute left-1.5 top-1.5 bg-cyan-600 hover:bg-cyan-700 text-white p-1.5 rounded-lg transition-colors"
                                >
                                    <SearchIcon className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && news.length === 0 && (
                     <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => { fetchCalled.current = false; fetchNews(searchQuery); }}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-full transition-colors text-sm shadow-lg"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                {news.slice(0, visibleCount).map((item, index) => (
                    <div key={index} className="bg-gray-800 border border-gray-700/50 p-4 rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200" onClick={() => setSelectedNewsItem(item)}>
                        <h3 className="font-bold text-cyan-400 text-sm mb-2 leading-snug">{item.title}</h3>
                        <p className="text-gray-300 text-xs mb-3 line-clamp-3 leading-relaxed">
                            {item.summary}
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                             <span className="text-[10px] text-gray-500">اضغط للتفاصيل</span>
                             <div className="flex gap-2">
                                 <button onClick={(e) => { e.stopPropagation(); handleShare(item); }} className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                      <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.34l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                                    </svg>
                                </button>
                             </div>
                        </div>
                    </div>
                ))}

                {visibleCount < news.length && (
                    <button 
                        onClick={handleShowMore} 
                        className="w-full py-3 text-center text-cyan-400 text-xs font-bold bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        عرض المزيد ({news.length - visibleCount})
                    </button>
                )}

                {isLoading && (
                    <>
                        <NewsCardSkeleton />
                        <div className="text-center text-gray-500 text-[10px] animate-pulse mt-4">
                            {searchQuery ? 'جاري البحث...' : 'جاري جلب آخر الأخبار التقنية...'}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Sheet for Details */}
            {selectedNewsItem && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
                        onClick={() => setSelectedNewsItem(null)}
                    />
                    <div className="bg-gray-800 w-full max-w-lg rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 relative border-t border-gray-700 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
                       <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-6 opacity-50"></div>
                       
                       <h2 className="text-lg font-bold text-white mb-4 leading-tight">{selectedNewsItem.title}</h2>
                       
                       <div className="prose prose-invert prose-sm max-w-none text-gray-300 text-sm leading-relaxed mb-6">
                           <p className="mb-4">{selectedNewsItem.summary}</p>
                           <hr className="border-gray-700 my-4"/>
                           <p>{selectedNewsItem.details}</p>
                       </div>

                       <div className="flex gap-3 mt-auto sticky bottom-0 bg-gray-800 pt-4">
                           <a href={selectedNewsItem.link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center text-sm shadow-lg transition-transform hover:scale-[1.02]">
                                زيارة الموقع الرسمي
                           </a>
                           <button onClick={() => setSelectedNewsItem(null)} className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-6 rounded-xl text-sm transition-colors">
                                إغلاق
                           </button>
                       </div>
                    </div>
                </div>
            )}
        </>
    );
};
