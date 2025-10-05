import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaCheck, FaExternalLinkAlt, FaBuilding, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaGlobe, FaNewspaper } from 'react-icons/fa';
import StockChart from './stockChart';
import NewsLayout from '../news/components/NewsLayout';
import { AutoAwesome } from '@mui/icons-material';

// --- Styles to match research/index ---
const darkBg = "linear-gradient(135deg, #181c20 0%, #0d0d0d 100%)";
const borderColor = "#14b8a6";
const borderRadius = "1.25rem";
const white = "#fff";
const teal = "#14b8a6";
const grey = "#64748b";
const green = "#22c55e";
const red = "#ef4444";

// --- Helper functions ---
const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    const num = Number(value);
    if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (Math.abs(num) >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
};
const formatNumber = (value) => {
    if (!value && value !== 0) return 'N/A';
    const num = Number(value);
    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
};
const getChangeColorClass = (change) => {
    if (change === null || change === undefined || isNaN(change)) return "text-zinc-400";
    return Number(change) >= 0 ? "text-emerald-400" : "text-rose-400";
};
const getGradeColorClass = (grade) => {
    const lowerGrade = grade?.toLowerCase();
    if (lowerGrade?.includes('buy') || lowerGrade?.includes('strong')) return "bg-emerald-600";
    if (lowerGrade?.includes('sell')) return "bg-rose-600";
    return "bg-zinc-600";
};

// --- Main Modal ---
const StockDetailsModal = ({ open, onClose, stock, wishlist = [], addToWishlist, triggerAIAnalysis = false }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState({});
    const [data, setData] = useState({});
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [currentStock, setCurrentStock] = useState(stock);

    // Responsive
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => { setCurrentStock(stock); }, [stock]);
    useEffect(() => { if (triggerAIAnalysis && open) setActiveTab(2); }, [triggerAIAnalysis, open]);

    // Fetch data
    const fetchData = async (endpoint, key) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        try {
            const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
            const response = await fetch(`${API_URL}${endpoint}`);
            const result = await response.json();
            setData(prev => ({ ...prev, [key]: result }));
        } catch (error) {
            setData(prev => ({ ...prev, [key]: null }));
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };
    useEffect(() => {
        if (open && currentStock?.symbol) {
            fetchData(`/fmp/profile?ticker=${currentStock.symbol}`, 'profile');
            fetchData(`/fmp/quote?ticker=${currentStock.symbol}`, 'quote');
            fetchData(`/fmp/ten-year-price-change?ticker=${currentStock.symbol}`, 'priceChange');
            fetchData(`/fmp/grades?ticker=${currentStock.symbol}`, 'grades');
            fetchData(`/fmp/historical-grades?ticker=${currentStock.symbol}`, 'historicalGrades');
            fetchData(`/fmp/grades-news?ticker=${currentStock.symbol}&limit=10`, 'gradesNews');
            fetchData(`/fmp/price-target?ticker=${currentStock.symbol}`, 'priceTarget');
            fetchData(`/fmp/search-stock-news?ticker=${currentStock.symbol}`, 'stockNews');
        }
    }, [open, currentStock?.symbol]);

    // AI Analysis
    const handleAIAnalysis = async () => {
        if (!currentStock?.symbol) return;
        setLoading(prev => ({ ...prev, aiAnalysis: true }));
        try {
            const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
            const response = await fetch(`${API_URL}/analysis?ticker=${currentStock.symbol}`);
            const result = await response.json();
            if (result.data && result.data.analysis) {
                setData(prev => ({
                    ...prev,
                    aiAnalysis: {
                        htmlContent: result.data.analysis,
                        ticker: result.data.ticker,
                        timestamp: result.data.timestamp,
                        format: result.data.format || 'html'
                    }
                }));
            } else {
                setData(prev => ({ ...prev, aiAnalysis: result }));
            }
            setActiveTab(2);
        } catch {
            setData(prev => ({ ...prev, aiAnalysis: { error: 'Failed to fetch AI analysis. Please try again later.' } }));
        } finally {
            setLoading(prev => ({ ...prev, aiAnalysis: false }));
        }
    };

    // Wishlist
    const isInWishlist = currentStock && wishlist.includes(currentStock.symbol);
    const handleAddToWishlist = async () => {
        if (addToWishlist && currentStock && !isInWishlist) {
            await addToWishlist(currentStock.symbol);
        }
    };

    // --- Tab Panels ---
    const TabButton = ({ label, index }) => (
        <button
            className={`px-6 py-3 font-semibold text-sm transition-colors relative rounded-t-xl
                ${activeTab === index ? "text-teal-300 bg-zinc-900 border-b-2 border-teal-500" : "text-zinc-400 hover:text-teal-200"}
            `}
            style={{ background: activeTab === index ? darkBg : "transparent" }}
            onClick={() => setActiveTab(index)}
        >
            {label}
        </button>
    );

    // --- Overview Tab ---
    const OverviewTab = () => {
        const quote = data.quote?.[0];
        const priceChange = data.priceChange?.[0];
        return (
            <div>
                <div className="mb-2 bg-transparent rounded-2xl p-4">
                    {currentStock?.symbol && <StockChart ticker={currentStock.symbol} />}
                </div>
                <div className="my-4 h-px bg-zinc-800" />
                {quote && (
                    <div className="mb-6 bg-transparent rounded-2xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            <div><p className="text-zinc-400 mb-1 text-sm">Open</p><p className="text-white text-sm">{formatCurrency(quote.open)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">Day High</p><p className="text-white text-sm">{formatCurrency(quote.dayHigh)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">Day Low</p><p className="text-white text-sm">{formatCurrency(quote.dayLow)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">52W High</p><p className="text-white text-sm">{formatCurrency(quote.yearHigh)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">52W Low</p><p className="text-white text-sm">{formatCurrency(quote.yearLow)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">Volume</p><p className="text-white text-sm">{formatNumber(quote.volume)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">Market Cap</p><p className="text-white text-sm">{formatCurrency(quote.marketCap)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">50D Avg</p><p className="text-white text-sm">{formatCurrency(quote.priceAvg50)}</p></div>
                            <div><p className="text-zinc-400 mb-1 text-sm">200D Avg</p><p className="text-white text-sm">{formatCurrency(quote.priceAvg200)}</p></div>
                        </div>
                    </div>
                )}
                <div className="my-4 h-px bg-zinc-800" />
                <div className="bg-transparent rounded-2xl p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(priceChange ?? {})
                            .filter(([key]) => key !== 'symbol')
                            .map(([period, change]) => (
                                <div key={period} className="bg-transparent min-w-[6em]">
                                    <p className="text-zinc-400 mb-1 text-sm">{period}</p>
                                    <p className={`font-bold text-base ${getChangeColorClass(change || 0)}`}>
                                        {change !== null && change !== undefined && !isNaN(change) 
                                            ? `${change >= 0 ? '+' : ''}${Number(change).toFixed(2)}%`
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    };

    // --- Profile Tab ---
    const ProfileTab = () => {
        const profile = data.profile?.[0];
        if (loading.profile) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>;
        if (!profile) return <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-4 text-white">Company profile data not available</div>;
        return (
            <div>
                <div className="mb-6 bg-transparent rounded-2xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                        {profile.image && (<img src={profile.image} alt={profile.companyName} className="w-12 h-12 rounded" />)}
                        <div>
                            <h3 className="text-white font-bold text-lg">{profile.companyName}</h3>
                            <p className="text-zinc-400 text-sm">{profile.sector} • {profile.industry}</p>
                        </div>
                    </div>
                    <p className="text-zinc-300 mb-6 leading-relaxed text-sm">{profile.description}</p>
                    <div className="my-6 h-px bg-zinc-800" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><FaUsers className="text-teal-400" /><span className="text-zinc-400 text-sm">CEO:</span><span className="text-white text-sm">{profile.ceo}</span></div>
                            <div className="flex items-center gap-2"><FaBuilding className="text-teal-400" /><span className="text-zinc-400 text-sm">Employees:</span><span className="text-white text-sm">{formatNumber(profile.fullTimeEmployees)}</span></div>
                            <div className="flex items-center gap-2"><FaCalendarAlt className="text-teal-400" /><span className="text-zinc-400 text-sm">Founded:</span><span className="text-white text-sm">{profile.ipoDate}</span></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-teal-400" /><span className="text-zinc-400 text-sm">Location:</span><span className="text-white text-sm">{profile.city}, {profile.state}, {profile.country}</span></div>
                            <div className="flex items-center gap-2"><FaPhone className="text-teal-400" /><span className="text-zinc-400 text-sm">Phone:</span><span className="text-white text-sm">{profile.phone}</span></div>
                            <div className="flex items-center gap-2"><FaGlobe className="text-teal-400" /><span className="text-zinc-400 text-sm">Website:</span>
                                <a href={profile.website} target="_blank" rel="noreferrer" className="text-teal-400 text-sm hover:text-teal-300">Visit Website</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-4 h-px bg-zinc-800" />
                <div className="bg-transparent rounded-2xl p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div><p className="text-zinc-400 mb-1 text-sm">Market Cap</p><p className="text-white text-sm">{formatCurrency(profile.marketCap)}</p></div>
                        <div><p className="text-zinc-400 mb-1 text-sm">Beta</p><p className="text-white text-sm">{profile.beta?.toFixed(2) || 'N/A'}</p></div>
                        <div><p className="text-zinc-400 mb-1 text-sm">Dividend</p><p className="text-white text-sm">{formatCurrency(profile.lastDividend)}</p></div>
                        <div><p className="text-zinc-400 mb-1 text-sm">52W Range</p><p className="text-white text-sm">{profile.range}</p></div>
                        <div><p className="text-zinc-400 mb-1 text-sm">Volume</p><p className="text-white text-sm">{formatNumber(profile.volume)}</p></div>
                        <div><p className="text-zinc-400 mb-1 text-sm">Avg Volume</p><p className="text-white text-sm">{formatNumber(profile.averageVolume)}</p></div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Analysis Tab ---
    const AnalysisTab = () => {
        const grades = data.grades;
        const historicalGrades = data.historicalGrades?.[0];
        const gradesNews = data.gradesNews;
        const priceTarget = data.priceTarget?.[0];
        const aiAnalysis = data.aiAnalysis;

        const getGradeColor = (grade) => {
        const lowerGrade = grade?.toLowerCase();
        if (lowerGrade?.includes('buy') || lowerGrade?.includes('strong')) return 'bg-green-500';
        if (lowerGrade?.includes('sell')) return 'bg-red-500';
        return 'bg-gray-500';
    };

        return (
            <div>
                {historicalGrades && (
                    <div className="mb-2 bg-transparent rounded-2xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="text-center p-3 bg-emerald-900/10 rounded-lg min-w-[10em]"><p className="text-2xl text-emerald-400 font-bold">{historicalGrades.analystRatingsStrongBuy}</p><p className="text-zinc-400 text-sm font-bold">Strong Buy</p></div>
                            <div className="text-center p-3 bg-emerald-900/5 rounded-lg min-w-[10em]"><p className="text-2xl text-emerald-300 font-bold">{historicalGrades.analystRatingsBuy}</p><p className="text-zinc-400 text-sm font-bold">Buy</p></div>
                            <div className="text-center p-3 bg-zinc-800/10 rounded-lg min-w-[10em]"><p className="text-2xl text-zinc-400 font-bold">{historicalGrades.analystRatingsHold}</p><p className="text-zinc-400 text-sm font-bold">Hold</p></div>
                            <div className="text-center p-3 bg-rose-900/5 rounded-lg min-w-[10em]"><p className="text-2xl text-rose-300 font-bold">{historicalGrades.analystRatingsSell}</p><p className="text-zinc-400 text-sm font-bold">Sell</p></div>
                            <div className="text-center p-3 bg-rose-900/10 rounded-lg min-w-[10em]"><p className="text-2xl text-rose-400 font-bold">{historicalGrades.analystRatingsStrongSell}</p><p className="text-zinc-400 text-sm font-bold">Strong Sell</p></div>
                        </div>
                    </div>
                )}
                <div className="mb-6 bg-transparent rounded-2xl p-4">
                    {loading.grades ? (
                        <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div></div>
                    ) : grades?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">{grades.slice(0, 5).map((grade, index) => (
                            <span key={index} className={`px-3 py-1 rounded text-white text-xs ${getGradeColorClass(grade.newGrade)}`}>{grade.gradingCompany}: {grade.newGrade}</span>
                        ))}</div>
                    ) : (
                        <p className="text-zinc-400 text-sm">No recent ratings available</p>
                    )}
                </div>
                <div className="my-4 h-px bg-zinc-800" />
                {priceTarget && (
                    <>
                        <div className="mb-6 bg-transparent rounded-2xl p-4">
                            <h3 className="text-teal-400 font-semibold mb-4 text-lg">Price Targets</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div><p className="text-zinc-400 mb-1 text-sm">Last Month</p><p className="text-white text-sm">{formatCurrency(priceTarget.lastMonthAvgPriceTarget)}</p><p className="text-zinc-500 text-xs">({priceTarget.lastMonthCount} analysts)</p></div>
                                <div><p className="text-zinc-400 mb-1 text-sm">Last Quarter</p><p className="text-white text-sm">{formatCurrency(priceTarget.lastQuarterAvgPriceTarget)}</p><p className="text-zinc-500 text-xs">({priceTarget.lastQuarterCount} analysts)</p></div>
                                <div><p className="text-zinc-400 mb-1 text-sm">Last Year</p><p className="text-white text-base">{formatCurrency(priceTarget.lastYearAvgPriceTarget)}</p><p className="text-zinc-500 text-xs">({priceTarget.lastYearCount} analysts)</p></div>
                                <div><p className="text-zinc-400 mb-1 text-sm">All Time</p><p className="text-white text-base">{formatCurrency(priceTarget.allTimeAvgPriceTarget)}</p><p className="text-zinc-500 text-xs">({priceTarget.allTimeCount} analysts)</p></div>
                            </div>
                        </div>
                        <div className="my-4 h-px bg-zinc-800" />
                    </>
                )}
                {/* <div className="mb-6 bg-transparent rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <AutoAwesome/>
                            <h3 className="text-teal-400 font-semibold text-base sm:text-lg">AI Analysis</h3>
                        </div>
                        <button onClick={handleAIAnalysis} disabled={loading.aiAnalysis} className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-teal-400 text-teal-400 rounded-lg hover:bg-teal-400/10 disabled:opacity-50 transition-colors text-xs sm:text-sm">
                            {loading.aiAnalysis ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                                <span className="hidden sm:inline">Analyzing...</span>
                            </>
                            ) : (
                            <>
                                <AutoAwesome/>
                                Get Analysis
                            </>
                        )}
                        </button>
                    </div>
                    {loading.aiAnalysis ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>
                    ) : data.aiAnalysis?.error ? (
                        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4 text-white">{data.aiAnalysis.error}</div>
                    ) : data.aiAnalysis ? (
                        <div>
                            {data.aiAnalysis.htmlContent && data.aiAnalysis.format === 'html' ? (
                                <div dangerouslySetInnerHTML={{ __html: data.aiAnalysis.htmlContent }} className="text-zinc-300 [&_h1]:text-teal-300 [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-4 [&_h2]:text-teal-300 [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-teal-400 [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-sm" />
                            ) : (
                                <div>
                                    {data.aiAnalysis.summary && (<div className="mb-6"><p className="text-teal-300 font-bold mb-2 text-sm">Executive Summary</p><p className="text-zinc-300 leading-relaxed text-sm">{data.aiAnalysis.summary}</p></div>)}
                                    {data.aiAnalysis.recommendation && (<div className="mb-6"><p className="text-teal-300 font-bold mb-2 text-sm">Investment Recommendation</p><div className="flex items-center gap-3 mb-2 flex-wrap"><span className={`px-3 py-1 rounded text-white font-bold text-sm ${getGradeColorClass(data.aiAnalysis.recommendation.rating)}`}>{data.aiAnalysis.recommendation.rating}</span>{data.aiAnalysis.recommendation.confidence && (<p className="text-zinc-400 text-sm">Confidence: {data.aiAnalysis.recommendation.confidence}%</p>)}</div><p className="text-zinc-300 leading-relaxed text-sm">{data.aiAnalysis.recommendation.reasoning}</p></div>)}
                                    {data.aiAnalysis.priceTargets && (<div><p className="text-teal-300 font-bold mb-2 text-sm">AI Price Targets</p><div className="grid grid-cols-3 gap-2 sm:gap-4">{data.aiAnalysis.priceTargets.bearCase && (<div className="text-center"><p className="text-rose-400 text-xs sm:text-sm mb-1">Bear Case</p><p className="text-white text-base sm:text-xl font-semibold">{formatCurrency(data.aiAnalysis.priceTargets.bearCase)}</p></div>)}{data.aiAnalysis.priceTargets.baseCase && (<div className="text-center"><p className="text-zinc-400 text-xs sm:text-sm mb-1">Base Case</p><p className="text-white text-base sm:text-xl font-semibold">{formatCurrency(data.aiAnalysis.priceTargets.baseCase)}</p></div>)}{data.aiAnalysis.priceTargets.bullCase && (<div className="text-center"><p className="text-emerald-400 text-xs sm:text-sm mb-1">Bull Case</p><p className="text-white text-base sm:text-xl font-semibold">{formatCurrency(data.aiAnalysis.priceTargets.bullCase)}</p></div>)}</div></div>)}
                                </div>
                            )}
                            {data.aiAnalysis.timestamp && (<div className="mt-6 pt-4 border-t border-zinc-800"><p className="text-zinc-500 text-xs sm:text-sm">Analysis generated on {new Date(data.aiAnalysis.timestamp).toLocaleString()}</p></div>)}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-sm">Click "Get Analysis" to see AI-powered insights for {currentStock?.symbol}</p>
                    )}
                </div> */}
                <div className="bg-gradient-to-br from-teal-900/20 via-zinc-900/50 to-zinc-800/30 backdrop-blur-sm rounded-xl p-5 border border-teal-700/30 shadow-xl">
                                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                            <AutoAwesome className="text-teal-400 text-xl" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                                            AI-Powered Analysis
                                        </h3>
                                    </div>
                                    
                                    <button
                                        onClick={handleAIAnalysis}
                                        disabled={loading.aiAnalysis}
                                        className="relative group border-2 border-teal-400/50 text-teal-400 px-4 py-2 rounded-lg hover:bg-teal-400/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 font-medium text-xs hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
                                    >
                                        {loading.aiAnalysis ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-teal-400/30 border-t-teal-400"></div>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <AutoAwesome className="text-xs" />
                                                Get AI Analysis
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {loading.aiAnalysis ? (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-400/30 border-t-teal-400 mb-3"></div>
                                        <p className="text-teal-300/70 font-medium text-sm">Analyzing market data...</p>
                                    </div>
                                ) : data.aiAnalysis?.error ? (
                                    <div className="bg-red-500/10 text-red-200 p-4 rounded-lg border border-red-500/30 backdrop-blur-sm text-sm">
                                        {data.aiAnalysis.error}
                                    </div>
                                ) : data.aiAnalysis ? (
                                    <div>
                                        {/* HTML Content Analysis */}
                                        {data.aiAnalysis.htmlContent && data.aiAnalysis.format === 'html' ? (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: data.aiAnalysis.htmlContent }}
                                                className="text-zinc-300 text-sm leading-relaxed
                                                           [&_h1]:text-base [&_h1]:text-teal-300 [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:mt-4
                                                           [&_h2]:text-base [&_h2]:text-teal-300 [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-4
                                                           [&_h3]:text-sm [&_h3]:text-teal-400 [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
                                                           [&_h4]:text-sm [&_h4]:text-teal-300 [&_h4]:font-medium [&_h4]:mb-2 [&_h4]:mt-3
                                                           [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-sm
                                                           [&_span]:font-inherit
                                                           [&_span[style*='color:#ef4444']]:text-red-400 [&_span[style*='color:#ef4444']]:font-semibold
                                                           [&_span[style*='font-weight:bold']]:font-semibold
                                                           [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ul]:space-y-1 [&_ul]:text-sm
                                                           [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_ol]:space-y-1 [&_ol]:text-sm"
                                            />
                                        ) : (
                                            // Legacy format support
                                            <div className="space-y-4">
                                                {data.aiAnalysis.summary && (
                                                    <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                                                        <h4 className="text-sm font-semibold text-teal-300 mb-2 flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-teal-400 rounded-full"></span>
                                                            Executive Summary
                                                        </h4>
                                                        <p className="text-zinc-300 leading-relaxed text-sm">
                                                            {data.aiAnalysis.summary}
                                                        </p>
                                                    </div>
                                                )}
                
                                                {data.aiAnalysis.recommendation && (
                                                    <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                                                        <h4 className="text-sm font-semibold text-teal-300 mb-3 flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-teal-400 rounded-full"></span>
                                                            Investment Recommendation
                                                        </h4>
                                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                            <span className={`${getGradeColor(data.aiAnalysis.recommendation.rating)} text-white font-semibold py-2 px-4 rounded-full text-xs shadow-lg`}>
                                                                {data.aiAnalysis.recommendation.rating}
                                                            </span>
                                                            {data.aiAnalysis.recommendation.confidence && (
                                                                <div className="flex items-center gap-1.5 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20">
                                                                    <span className="text-teal-300 font-medium text-xs">Confidence:</span>
                                                                    <span className="text-white font-semibold text-xs">{data.aiAnalysis.recommendation.confidence}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-zinc-300 leading-relaxed text-sm">
                                                            {data.aiAnalysis.recommendation.reasoning}
                                                        </p>
                                                    </div>
                                                )}
                
                                                {data.aiAnalysis.priceTargets && (
                                                    <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                                                        <h4 className="text-sm font-semibold text-teal-300 mb-3 flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-teal-400 rounded-full"></span>
                                                            AI Price Targets
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {data.aiAnalysis.priceTargets.bearCase && (
                                                                <div className="group text-center p-4 bg-gradient-to-br from-red-500/15 to-red-500/5 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105">
                                                                    <div className="text-red-400 mb-2 font-medium text-xs uppercase tracking-wide">Bear Case</div>
                                                                    <div className="text-white text-2xl font-bold">
                                                                        {formatCurrency(data.aiAnalysis.priceTargets.bearCase)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {data.aiAnalysis.priceTargets.baseCase && (
                                                                <div className="group text-center p-4 bg-gradient-to-br from-zinc-500/15 to-zinc-500/5 rounded-lg border border-zinc-500/30 hover:border-zinc-400/50 transition-all duration-300 hover:scale-105">
                                                                    <div className="text-zinc-300 mb-2 font-medium text-xs uppercase tracking-wide">Base Case</div>
                                                                    <div className="text-white text-2xl font-bold">
                                                                        {formatCurrency(data.aiAnalysis.priceTargets.baseCase)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {data.aiAnalysis.priceTargets.bullCase && (
                                                                <div className="group text-center p-4 bg-gradient-to-br from-green-500/15 to-green-500/5 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                                                                    <div className="text-green-400 mb-2 font-medium text-xs uppercase tracking-wide">Bull Case</div>
                                                                    <div className="text-white text-2xl font-bold">
                                                                        {formatCurrency(data.aiAnalysis.priceTargets.bullCase)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                
                                        {/* Timestamp */}
                                        {data.aiAnalysis.timestamp && (
                                            <div className="mt-4 pt-3 border-t border-zinc-700/50">
                                                <div className="text-zinc-500 text-xs flex items-center gap-1.5">
                                                    <span className="w-1 h-1 bg-teal-400/50 rounded-full"></span>
                                                    Analysis generated on {new Date(data.aiAnalysis.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                <div className="my-4 h-px bg-zinc-800" />
                <div className="bg-transparent rounded-2xl p-4">
                    {loading.gradesNews ? (
                        <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div></div>
                    ) : gradesNews?.length > 0 ? (
                        <div className="flex flex-col gap-2">{gradesNews.slice(0, 5).map((news, index) => (
                            <div key={index} className="p-3 bg-teal-500/5 rounded-lg border border-zinc-800">
                                <div className="flex justify-between items-start mb-2 gap-2"><p className="text-white font-bold text-sm flex-1">{news.newsTitle}</p><span className={`px-2 py-1 rounded text-white text-xs flex-shrink-0 ${getGradeColorClass(news.newGrade)}`}>{news.newGrade}</span></div>
                                <p className="text-zinc-400 mb-2 text-xs">{news.gradingCompany} • {new Date(news.publishedDate).toLocaleDateString()}</p>
                                <a href={news.newsURL} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 text-xs inline-flex items-center gap-1">Read Full Article <FaExternalLinkAlt size={10} /></a>
                            </div>
                        ))}</div>
                    ) : (
                        <p className="text-zinc-400 text-sm">No rating news available</p>
                    )}
                </div>
            </div>
        );
    };

    // --- News Tab ---
    const NewsTab = () => {
        const stockNews = data.stockNews;
        const handleNewsClick = (news) => { setSelectedNews(news); setNewsModalOpen(true); };
        return (
            <div className="bg-transparent rounded-2xl p-4">
                {loading.stockNews ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>
                ) : stockNews?.length > 0 ? (
                    <NewsLayout newsData={stockNews} />
                ) : (
                    <p className="text-zinc-400 text-sm">No news available</p>
                )}
            </div>
        );
    };

    // --- News Modal ---
    const NewsModal = () => (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${newsModalOpen ? '' : 'hidden'}`}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setNewsModalOpen(false)}></div>
            <div className={`relative bg-zinc-950 ${isMobile ? 'w-full h-full' : 'max-w-2xl w-full mx-4 rounded-2xl max-h-[90vh]'} overflow-hidden`}>
                <div className="flex justify-between items-center p-4 border-b border-zinc-800 sticky top-0 bg-zinc-950">
                    <h3 className="text-white text-lg font-semibold">News Article</h3>
                    <button onClick={() => setNewsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors"><FaTimes size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 80px)' : 'calc(90vh - 80px)' }}>
                    {selectedNews && (
                        <div>
                            {selectedNews.image && (<img src={selectedNews.image} alt={selectedNews.title} className="w-full h-48 object-cover rounded-lg mb-4" />)}
                            <h2 className="text-white text-2xl font-bold mb-4">{selectedNews.title}</h2>
                            <div className="flex gap-4 mb-4">
                                <span className="text-teal-400 text-sm">{selectedNews.publisher}</span>
                                <span className="text-zinc-400 text-sm">{new Date(selectedNews.publishedDate).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-300 mb-6 leading-relaxed">{selectedNews.text}</p>
                            <a href={selectedNews.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors"><FaExternalLinkAlt />Read Full Article</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (!currentStock) return null;

    return (
        <>
            <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? '' : 'hidden'}`}>
                <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
                <div className={`relative w-full max-w-4xl mx-auto my-8 rounded-2xl shadow-2xl border`} style={{ background: darkBg, borderColor, borderWidth: 2, borderStyle: 'solid', minHeight: isMobile ? '100vh' : '80vh' }}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-teal-800 bg-transparent rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-2xl">{currentStock.symbol}</span>
                            <span className="text-zinc-400 text-base">{currentStock.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleAddToWishlist} disabled={isInWishlist} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isInWishlist ? 'bg-teal-600 text-white' : 'bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400/10'}`}>
                                {isInWishlist ? (<><FaCheck className="inline mr-1" /> Watching</>) : (<><FaPlus className="inline mr-1" /> Watch</>)}
                            </button>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><FaTimes size={22} /></button>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex border-b border-zinc-700 bg-transparent">
                        <TabButton label="Overview" index={0} />
                        <TabButton label="Profile" index={1} />
                        <TabButton label="Analysis" index={2} />
                        <TabButton label="News" index={3} />
                    </div>
                    {/* Content */}
                    <div className="p-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 160px)' : 'calc(80vh - 120px)' }}>
                        {activeTab === 0 && <OverviewTab />}
                        {activeTab === 1 && <ProfileTab />}
                        {activeTab === 2 && <AnalysisTab />}
                        {activeTab === 3 && <NewsTab />}
                    </div>
                </div>
            </div>
            <NewsModal />
        </>
    );
};

export default StockDetailsModal;
