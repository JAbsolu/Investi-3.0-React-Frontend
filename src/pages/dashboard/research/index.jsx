import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import StockChart from '../components/stockChart';
import { useAuth } from '../../../hooks/useAuth';
import { useIsPremium } from '../../../hooks/isPremium';
import { ref, get, child } from "firebase/database";
import { database } from "../../../firebaseConfig";
import { useWishlist } from '../../../hooks/useWishlist';
import NewsLayout from '../news/components/NewsLayout';
import {
    FaBars, FaSearch, FaUsers, FaBuilding, FaCalendarAlt, FaMapMarkerAlt,
    FaPhone, FaGlobe, FaExternalLinkAlt, FaRocket,
} from 'react-icons/fa';
import { AutoAwesome } from '@mui/icons-material';

const StockDetailsPage = () => {
    const { ticker: urlTicker } = useParams();
    const navigate = useNavigate();
    const { user, userId } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState({});
    const [data, setData] = useState({});
    const [searchTicker, setSearchTicker] = useState('');
    const [currentTicker, setCurrentTicker] = useState(urlTicker || '');
    const [lastSearchedStock, setLastSearchedStock] = useState(null);
    const [showLastSearchDialog, setShowLastSearchDialog] = useState(false);
    
    const { wishlist, addToWishlist } = useWishlist();
    const isInWishlist = currentTicker && wishlist.includes(currentTicker);

    const isMobile = window.innerWidth < 768;

    // Fetch last searched stock from Firebase
    const fetchLastSearchedStock = async () => {
        if (!user) return;
        
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `users/${userId}/lastSearch`));
            if (snapshot.exists()) {
                setLastSearchedStock(snapshot.val());
                navigate(`/dashboard/research/${snapshot.val()}`);
            }
        } catch (error) {
            console.error('Error fetching last searched stock:', error);
        }
    };

    const handleLastSearchResponse = (useLastSearch) => {
        setShowLastSearchDialog(false);
        if (useLastSearch && lastSearchedStock) {
            setCurrentTicker(lastSearchedStock);
            navigate(`/dashboard/research/${lastSearchedStock}`);
        }
    };

    useEffect(() => {
        if (!urlTicker && user) {
            fetchLastSearchedStock();
        }
    }, [urlTicker, user]);

    const handleAddToWishlist = async () => {
        if (addToWishlist && currentTicker && !isInWishlist) {
            await addToWishlist(currentTicker);
        }
    };

    const handleStockSearch = async () => {
        if (!searchTicker.trim()) return;
        
        const ticker = searchTicker.toUpperCase();
        setCurrentTicker(ticker);
        setSearchTicker('');
        setData({});
        navigate(`/dashboard/research/${ticker}`);
    };

    const handleSearchKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleStockSearch();
        }
    };

    useEffect(() => {
        if (urlTicker) {
            setCurrentTicker(urlTicker.toUpperCase());
        }
    }, [urlTicker]);

    const fetchData = async (endpoint, key) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        try {
            const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
            const response = await fetch(`${API_URL}${endpoint}`);
            const result = await response.json();
            setData(prev => ({ ...prev, [key]: result }));
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            setData(prev => ({ ...prev, [key]: null }));
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    useEffect(() => {
        if (currentTicker) {
            fetchData(`/fmp/profile?ticker=${currentTicker}`, 'profile');
            fetchData(`/fmp/quote?ticker=${currentTicker}`, 'quote');
            fetchData(`/fmp/ten-year-price-change?ticker=${currentTicker}`, 'priceChange');
            fetchData(`/fmp/grades?ticker=${currentTicker}`, 'grades');
            fetchData(`/fmp/historical-grades?ticker=${currentTicker}`, 'historicalGrades');
            fetchData(`/fmp/grades-news?ticker=${currentTicker}&limit=10`, 'gradesNews');
            fetchData(`/fmp/price-target?ticker=${currentTicker}`, 'priceTarget');
            fetchData(`/fmp/search-stock-news?ticker=${currentTicker}`, 'stockNews');
        }
    }, [currentTicker]);

    const handleAIAnalysis = async () => {
        if (!currentTicker) return;
        
        setLoading(prev => ({ ...prev, aiAnalysis: true }));
        try {
            const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
            const response = await fetch(`${API_URL}/analysis?ticker=${currentTicker}`);
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
        } catch (error) {
            console.error('Error fetching AI analysis:', error);
            setData(prev => ({ ...prev, aiAnalysis: { error: 'Failed to fetch AI analysis. Please try again later.' } }));
        } finally {
            setLoading(prev => ({ ...prev, aiAnalysis: false }));
        }
    };

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

    const getChangeColor = (change) => {
        if (change === null || change === undefined || isNaN(change)) return 'text-gray-400';
        return Number(change) >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const getGradeColor = (grade) => {
        const lowerGrade = grade?.toLowerCase();
        if (lowerGrade?.includes('buy') || lowerGrade?.includes('strong')) return 'bg-green-500';
        if (lowerGrade?.includes('sell')) return 'bg-red-500';
        return 'bg-gray-500';
    };

    const StockLogo = ({ size = 24 }) => {
        const [hasError, setHasError] = useState(false);
        const profile = data.profile?.[0];
        const [imageSrc, setImageSrc] = useState(profile?.image ? profile.image : "/favicon.png");

        const handleImageError = () => {
            if (!hasError) {
                setHasError(true);
                setImageSrc("/investi_favicon2.png");
            }
        };

        return profile?.image ? (
            <img 
                src={imageSrc}
                onError={handleImageError}
                className={`w-${size/4} h-${size/4} rounded-none mr-1 bg-transparent p-0`}
                alt={`${profile.companyName} logo`}
            />
        ) : null;
    };

    const TabPanel = ({ children, value, index }) => (
        <div className={value !== index ? 'hidden' : 'block'}>
            {children}
        </div>
    );

    return (
        <div className="flex min-h-screen" style={{ background: 'linear-gradient(to bottom, #121212, #0d0d0d)'}}>
            {/* Sidebar */}
            {!isMobile && (
                <div className="flex-shrink-0">
                    <DashboardSidebar />
                </div>
            )}

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50" 
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed left-0 top-0 h-full w-60 bg-zinc-900">
                        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto min-h-screen scrollbar-hide">
                {/* Header */}
                <div className="sticky top-0 z-40 transparent backdrop-blur-sm px-4 md:p-6 py-2">
                    <div className="flex items-center gap-2 mb-0">
                        {isMobile && (
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="text-white p-2"
                            >
                                <FaBars />
                            </button>
                        )}
                        
                        <div className="flex items-center gap-6 flex-1">
                           {currentTicker ? (
                             <>
                               <StockLogo /> 
                               <h2 className="text-white font-semibold text-3xl">
                                   {currentTicker}
                               </h2>
                             </>
                           ): (
                            <h2 className="text-white font-semibold text-3xl">
                                Research
                            </h2>
                           )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    {/* <div className="relative mt-4"> */}
                        {/* <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-300" size={14} />
                        <input
                            type="text"
                            placeholder="Search ticker (e.g., AAPL, TSLA)..."
                            value={searchTicker}
                            onChange={(e) => setSearchTicker(e.target.value)}
                            onKeyDown={handleSearchKeyPress}
                            className="w-full bg-transparent text-white placeholder-gray-400 rounded-lg pl-10 pr-20 py-2 border border-zinc-600 focus:border-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        /> */}
                    {/* </div> */}

                    <div className='flex gap-4'>
                        <div className="relative min-w-[10em] w-[40em] max-w-[90%] self-start mt-4">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 text-sm z-10" />
                            <input
                                type="text"
                                placeholder="Search ticker (e.g., AAPL, TSLA)..."
                                value={searchTicker}
                                onChange={(e) => setSearchTicker(e.target.value)}
                                onKeyDown={handleSearchKeyPress}
                                className="w-full bg-zinc-900 text-white placeholder-gray-400 pl-10 pr-4 py-2 
                                         border-2 border-zinc-800 rounded-md focus:outline-none focus:border-teal-800
                                         text-sm"
                            />

                            <button onClick={handleStockSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-300 text-sm font-medium px-3 py-1">
                                Search
                            </button>
                        </div>
                         {/* Add to watchlist button */}
                        {currentTicker && (
                            <button
                                onClick={handleAddToWishlist}
                                disabled={isInWishlist}
                                className={`px-4 py-2 h-10 mt-4 text-zinc-300 rounded text-sm font-medium border-2 border-zinc-800 transition-colors ${
                                    isInWishlist 
                                        ? 'bg-teal-400 text-black border-zinc-400' 
                                        : 'text-zinc-400 border-zinc-400 hover:bg-teal-400/10'
                                }`}
                            >
                                {isInWishlist ? 'Watching' : 'Watch'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 md:p-6 max-w-full">
                    {/* Tabs */}
                    <div className="mb-6 border-b border-zinc-600">
                        <div className="flex overflow-x-auto">
                            {['Profile', 'Overview', 'Analysis', 'News'].map((tab, index) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(index)}
                                    className={`flex-shrink-0 px-4 py-2 font-medium text-sm transition-colors ${
                                        activeTab === index 
                                            ? 'text-teal-400 border-b-2 border-teal-400' 
                                            : 'text-gray-400 hover:text-gray-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Panels */}
                    <TabPanel value={activeTab} index={1}>
                        <ProfileTab 
                            data={data}
                            loading={loading}
                            formatCurrency={formatCurrency}
                            formatNumber={formatNumber}
                        />
                    </TabPanel>

                    <TabPanel value={activeTab} index={0}>
                        <OverviewTab 
                            data={data}
                            loading={loading}
                            currentTicker={currentTicker}
                            formatCurrency={formatCurrency}
                            formatNumber={formatNumber}
                            getChangeColor={getChangeColor}
                            isMobile={isMobile}
                        />
                    </TabPanel>
                    
                    <TabPanel value={activeTab} index={2}>
                        <AnalysisTab 
                            data={data}
                            loading={loading}
                            handleAIAnalysis={handleAIAnalysis}
                            formatCurrency={formatCurrency}
                            getGradeColor={getGradeColor}
                            currentTicker={currentTicker}
                        />
                    </TabPanel>
                    
                    <TabPanel value={activeTab} index={3}>
                        <NewsTab 
                            data={data}
                            loading={loading}
                            currentTicker={currentTicker}
                        />
                    </TabPanel>
                </div>
            </div>

            {/* Last Search Dialog */}
            {showLastSearchDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6 max-w-sm mx-4">
                        <div className="text-center mb-4">
                            <p className="text-gray-300 mb-4">
                                Continue viewing analysis for your last searched stock?
                            </p>
                            <span className="bg-teal-600 text-white font-bold text-lg py-2 px-3 rounded">
                                {lastSearchedStock}
                            </span>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => handleLastSearchResponse(false)}
                                className="text-gray-400 text-sm px-4 py-2 hover:text-gray-300"
                            >
                                No Thanks
                            </button>
                            <button
                                onClick={() => handleLastSearchResponse(true)}
                                className="bg-teal-600 text-white text-sm px-4 py-2 rounded hover:bg-teal-500"
                            >
                                Show {lastSearchedStock}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const OverviewTab = ({ data, loading, currentTicker, formatCurrency, formatNumber, getChangeColor, isMobile }) => {
    const quote = data.quote?.[0];
    const priceChange = data.priceChange?.[0];

    return (
        <div className="space-y-8">
            {/* Chart - Full width, no padding */}
            {currentTicker && <StockChart ticker={currentTicker} />}
            
            {/* Combined Metrics & Performance */}
            <div className="space-y-6">
                {/* Key Metrics */}
                {quote && (
                    <div className="space-y-3">
                        <div className="text-zinc-500 text-sm font-medium">Key Metrics</div>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                            {[
                                { label: 'Open', value: formatCurrency(quote.open) },
                                { label: 'High', value: formatCurrency(quote.dayHigh) },
                                { label: 'Low', value: formatCurrency(quote.dayLow) },
                                { label: '52W High', value: formatCurrency(quote.yearHigh) },
                                { label: '52W Low', value: formatCurrency(quote.yearLow) },
                                { label: 'Volume', value: formatNumber(quote.volume) },
                                { label: 'Market Cap', value: formatCurrency(quote.marketCap) },
                                { label: '50D Avg', value: formatCurrency(quote.priceAvg50) },
                                { label: '200D Avg', value: formatCurrency(quote.priceAvg200) }
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="text-zinc-500 text-xs mb-1">{item.label}</div>
                                    <div className="text-white text-sm">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price Performance */}
                {priceChange && (
                    <div className="space-y-3">
                        <div className="text-zinc-500 text-sm font-medium">Performance</div>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                            {Object.entries(priceChange).filter(([key]) => key !== 'symbol').map(([period, change]) => (
                                <div key={period}>
                                    <div className="text-zinc-500 text-xs mb-1">{period}</div>
                                    <div className={`text-sm ${getChangeColor(change)}`}>
                                        {change !== null && !isNaN(change) 
                                            ? `${change >= 0 ? '+' : ''}${Number(change).toFixed(2)}%`
                                            : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Profile Tab Component
const ProfileTab = ({ data, loading, formatCurrency, formatNumber }) => {
    const profile = data.profile?.[0];

    if (loading.profile) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-amber-500/10 text-amber-200 p-4 rounded-lg mb-4">
                Company profile data not available
            </div>
        );
    }

    const StockLogo = ({ size = 24 }) => {
        const [hasError, setHasError] = useState(false);
        const [imageSrc, setImageSrc] = useState(profile?.image || "/favicon.png");

        return profile?.image ? (
            <img 
                src={imageSrc}
                onError={() => !hasError && (setHasError(true), setImageSrc("/investi_favicon2.png"))}
                className={`w-${size/4} h-${size/4} rounded-none mr-2`}
                alt={`${profile.companyName} logo`}
            />
        ) : null;
    };

    return (
        <div className="space-y-6 bg-zinc-900">
            {/* Company Header */}
            <div className="bg-zinc-900 p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                    {profile.image && <StockLogo/>}
                    <div>
                        <h2 className="text-white font-bold text-xl">{profile.companyName}</h2>
                        <div className="text-gray-400">{profile.sector} • {profile.industry}</div>
                    </div>
                </div>
                
                <div className="text-gray-300 text-sm leading-relaxed">
                    {profile.description}
                </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 ms-1">
                {[
                    { icon: <FaUsers className="text-teal-400" />, label: 'CEO', value: profile.ceo },
                    { icon: <FaBuilding className="text-teal-400" />, label: 'Employees', value: formatNumber(profile.fullTimeEmployees) },
                    { icon: <FaCalendarAlt className="text-teal-400" />, label: 'Founded', value: profile.ipoDate },
                    { icon: <FaMapMarkerAlt className="text-teal-400" />, label: 'Location', value: `${profile.city}, ${profile.state}` },
                    { icon: <FaPhone className="text-teal-400" />, label: 'Phone', value: profile.phone }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-900 p-4 rounded-lg">
                        {item.icon}
                        <div>
                            <div className="text-gray-400 text-xs">{item.label}</div>
                            <div className="text-white font-medium text-sm">{item.value}</div>
                        </div>
                    </div>
                ))}
                <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-lg">
                    <FaGlobe className="text-teal-400" />
                    <div>
                        <div className="text-gray-400 text-xs">Website</div>
                        <a 
                            href={profile.website} 
                            target="_blank"
                            className="text-teal-400 text-sm font-medium hover:underline"
                        >
                            Visit Site
                        </a>
                    </div>
                </div>
            </div>

            {/* Financial Metrics */}
            <div>
                <div className="text-gray-400 font-medium mb-4 ms-5">Key Metrics</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ms-1">
                    {[
                        { label: 'Market Cap', value: formatCurrency(profile.marketCap) },
                        { label: 'Beta', value: profile.beta?.toFixed(2) || 'N/A' },
                        { label: 'Dividend', value: formatCurrency(profile.lastDividend) },
                        { label: '52W Range', value: profile.range },
                        { label: 'Volume', value: formatNumber(profile.volume) },
                        { label: 'Avg Volume', value: formatNumber(profile.averageVolume) }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-zinc-900 p-4 rounded-lg">
                            <div className="text-gray-400 text-sm mb-1">{item.label}</div>
                            <div className="text-white font-semibold">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
// Analysis Tab Component
const AnalysisTab = ({ data, loading, handleAIAnalysis, formatCurrency, getGradeColor, currentTicker, onShowPaywall }) => {
    const grades = data.grades;
    const historicalGrades = data.historicalGrades?.[0];
    const gradesNews = data.gradesNews;
    const priceTarget = data.priceTarget?.[0];
    const aiAnalysis = data.aiAnalysis;
    const hasPremiumAccess = useIsPremium();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Historical Ratings Distribution */}
            {historicalGrades && (
                <div className="bg-transparent mb-1">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 min-w-[10em] bg-green-500/10 rounded-lg">
                            <div className="text-2xl text-green-400 font-bold">
                                {historicalGrades.analystRatingsStrongBuy}
                            </div>
                            <div className="text-gray-400 font-bold">Strong Buy</div>
                        </div>
                        <div className="text-center p-4 min-w-[10em] bg-green-500/5 rounded-lg">
                            <div className="text-2xl text-green-300 font-bold">
                                {historicalGrades.analystRatingsBuy}
                            </div>
                            <div className="text-gray-400 font-bold">Buy</div>
                        </div>
                        <div className="text-center p-4 min-w-[10em] bg-gray-500/10 rounded-lg">
                            <div className="text-2xl text-gray-400 font-bold">
                                {historicalGrades.analystRatingsHold}
                            </div>
                            <div className="text-gray-400 font-bold">Hold</div>
                        </div>
                        <div className="text-center p-4 min-w-[10em] bg-red-500/5 rounded-lg">
                            <div className="text-2xl text-red-300 font-bold">
                                {historicalGrades.analystRatingsSell}
                            </div>
                            <div className="text-gray-400 font-bold">Sell</div>
                        </div>
                        <div className="text-center p-4 min-w-[10em] bg-red-500/10 rounded-lg">
                            <div className="text-2xl text-red-400 font-bold">
                                {historicalGrades.analystRatingsStrongSell}
                            </div>
                            <div className="text-gray-400 font-bold">Strong Sell</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Grades */}
            <div className="bg-transparent mb-0">
                <div className="p-4">
                    <h3 className="text-teal-300 font-bold text-lg mb-4">
                        Recent Analyst Ratings
                    </h3>
                    {loading.grades ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                        </div>
                    ) : grades?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {grades.slice(0, 8).map((grade, index) => (
                                <span
                                    key={index}
                                    className={`${getGradeColor(grade.newGrade)} text-white text-xs py-2 px-3 rounded-full font-medium`}
                                >
                                    {grade.gradingCompany}: {grade.newGrade}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No recent ratings available</div>
                    )}
                </div>
            </div>

            {/* Price Targets */}
            {priceTarget && (
                <div className="bg-transparent mb-4">
                    <div className="p-4">
                        <h3 className="text-teal-300 font-bold text-lg mb-4">
                            Price Targets
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-gray-400 text-sm mb-2 min-w-[7em]">Last Month</div>
                                <div className="text-white text-lg font-bold">
                                    {formatCurrency(priceTarget.lastMonthAvgPriceTarget)}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    ({priceTarget.lastMonthCount} analysts)
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-2 min-w-[7em]">Last Quarter</div>
                                <div className="text-white text-lg font-bold">
                                    {formatCurrency(priceTarget.lastQuarterAvgPriceTarget)}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    ({priceTarget.lastQuarterCount} analysts)
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-2 min-w-[7em]">Last Year</div>
                                <div className="text-white text-lg font-bold">
                                    {formatCurrency(priceTarget.lastYearAvgPriceTarget)}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    ({priceTarget.lastYearCount} analysts)
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-2 min-w-[7em]">All Time</div>
                                <div className="text-white text-lg font-bold">
                                    {formatCurrency(priceTarget.allTimeAvgPriceTarget)}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    ({priceTarget.allTimeCount} analysts)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-teal-800 my-4"></div>

            {/* AI Analysis Section */}
            <div className="bg-transparent mb-6">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <AutoAwesome className="text-teal-400 text-2xl" />
                            <h3 className="text-teal-300 font-bold text-lg">
                                AI Analysis
                            </h3>
                        </div>
                        
                        <button
                            onClick={handleAIAnalysis}
                            disabled={loading.aiAnalysis}
                            className="border border-teal-400 text-teal-400 px-4 py-2 rounded hover:bg-teal-400/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {loading.aiAnalysis ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                                    Generating AI Analysis...
                                </>
                            ) : (
                                <>
                                    <AutoAwesome className="text-sm" />
                                    Get Full AI Analysis
                                </>
                            )}
                        </button>
                    </div>
                    
                    {loading.aiAnalysis ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                        </div>
                    ) : data.aiAnalysis?.error ? (
                        <div className="bg-red-500/10 text-red-200 p-4 rounded-lg">
                            {data.aiAnalysis.error}
                        </div>
                    ) : data.aiAnalysis ? (
                        <div>
                            {/* HTML Content Analysis */}
                            {data.aiAnalysis.htmlContent && data.aiAnalysis.format === 'html' ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: data.aiAnalysis.htmlContent }}
                                    className="text-gray-300 text-lg [&_h1]:text-teal-300 [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                                               [&_h2]:text-teal-300 [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6
                                               [&_h3]:text-teal-400 [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:mt-6 [&_h3]:text-xl
                                               [&_h4]:text-teal-300 [&_h4]:font-bold [&_h4]:mb-4 [&_h4]:mt-6
                                               [&_h5]:text-teal-300 [&_h5]:font-bold [&_h5]:mb-4 [&_h5]:mt-6
                                               [&_h6]:text-teal-300 [&_h6]:font-bold [&_h6]:mb-4 [&_h6]:mt-6
                                               [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-300
                                               [&_span]:font-inherit
                                               [&_span[style*='color:#ef4444']]:text-red-400 [&_span[style*='color:#ef4444']]:font-bold
                                               [&_span[style*='font-weight:bold']]:font-bold
                                               [&_span[style*='font-size:2rem']]:text-4xl"
                                />
                            ) : (
                                // Legacy format support
                                <>
                                    {data.aiAnalysis.summary && (
                                        <div className="mb-6">
                                            <h4 className="text-teal-300 font-bold text-lg mb-3">
                                                Executive Summary
                                            </h4>
                                            <p className="text-gray-300 leading-relaxed text-lg">
                                                {data.aiAnalysis.summary}
                                            </p>
                                        </div>
                                    )}

                                    {data.aiAnalysis.recommendation && (
                                        <div className="mb-6">
                                            <h4 className="text-teal-300 font-bold text-lg mb-3">
                                                Investment Recommendation
                                            </h4>
                                            <div className="flex items-center gap-4 mb-3 flex-wrap">
                                                <span className={`${getGradeColor(data.aiAnalysis.recommendation.rating)} text-white font-bold py-2 px-4 rounded-full text-base`}>
                                                    {data.aiAnalysis.recommendation.rating}
                                                </span>
                                                {data.aiAnalysis.recommendation.confidence && (
                                                    <div className="text-gray-400">
                                                        Confidence: {data.aiAnalysis.recommendation.confidence}%
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-300 leading-relaxed text-lg">
                                                {data.aiAnalysis.recommendation.reasoning}
                                            </p>
                                        </div>
                                    )}

                                    {data.aiAnalysis.priceTargets && (
                                        <div>
                                            <h4 className="text-teal-300 font-bold text-lg mb-3">
                                                AI Price Targets
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {data.aiAnalysis.priceTargets.bearCase && (
                                                    <div className="text-center p-6 bg-red-500/10 rounded-lg">
                                                        <div className="text-red-400 mb-2">Bear Case</div>
                                                        <div className="text-white text-3xl font-bold">
                                                            {formatCurrency(data.aiAnalysis.priceTargets.bearCase)}
                                                        </div>
                                                    </div>
                                                )}
                                                {data.aiAnalysis.priceTargets.baseCase && (
                                                    <div className="text-center p-6 bg-gray-500/10 rounded-lg">
                                                        <div className="text-gray-400 mb-2">Base Case</div>
                                                        <div className="text-white text-3xl font-bold">
                                                            {formatCurrency(data.aiAnalysis.priceTargets.baseCase)}
                                                        </div>
                                                    </div>
                                                )}
                                                {data.aiAnalysis.priceTargets.bullCase && (
                                                    <div className="text-center p-6 bg-green-500/10 rounded-lg">
                                                        <div className="text-green-400 mb-2">Bull Case</div>
                                                        <div className="text-white text-3xl font-bold">
                                                            {formatCurrency(data.aiAnalysis.priceTargets.bullCase)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Timestamp */}
                            {data.aiAnalysis.timestamp && (
                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <div className="text-gray-500 text-sm">
                                        Analysis generated on {new Date(data.aiAnalysis.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="border-t border-teal-800 my-4"></div>

            {/* Grade News */}
            <div className="bg-transparent">
                <div className="p-4">
                    <h3 className="text-teal-300 font-bold text-lg mb-4">
                        Recent Rating News
                    </h3>
                    {loading.gradesNews ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                        </div>
                    ) : gradesNews?.length > 0 ? (
                        <div className="space-y-3">
                            {gradesNews.slice(0, 5).map((news, index) => (
                                <div 
                                    key={index}
                                    className="p-4 bg-transparent rounded-lg border border-teal-800 hover:border-teal-300 cursor-pointer transition-colors"
                                    onClick={() => window.open(news.newsURL, '_blank')}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-white font-bold text-sm flex-1 mr-3">
                                            {news.newsTitle}
                                        </div>
                                        <span className={`${getGradeColor(news.newGrade)} text-white text-xs py-1 px-2 rounded-full whitespace-nowrap`}>
                                            {news.newGrade}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 text-sm mb-3">
                                        {news.gradingCompany} • {new Date(news.publishedDate).toLocaleDateString()}
                                    </div>
                                    <a 
                                        href={news.newsURL} 
                                        target="_blank" 
                                        rel="noopener"
                                        className="text-teal-400 text-xs font-bold hover:underline flex items-center gap-1 justify-end"
                                    >
                                        <span className="flex gap-2 items-center justify-end">
                                            Read Full Article <FaExternalLinkAlt size={12} />
                                        </span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No rating news available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// News Tab Component
const NewsTab = ({ data, loading, currentTicker }) => {
    const stockNews = data.stockNews;
    const navigate = useNavigate();

    const handleNewsClick = (news) => {
        window.open(news.url, '_blank');
    };

    return (
        <div>
            <NewsLayout newsData={stockNews} />
        </div>
    );
};

export default StockDetailsPage;