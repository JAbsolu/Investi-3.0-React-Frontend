import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogTitle, Box, Typography, IconButton,
    Tabs, Tab, Card, CardContent, Grid, Chip, Button, CircularProgress,
    Alert, Avatar, Divider, useMediaQuery, useTheme, Link, TextField,
    InputAdornment
} from '@mui/material';
import { teal, green, red, grey, blue, amber } from '@mui/material/colors';
import {
    FaTimes, FaPlus, FaCheck, FaExternalLinkAlt, FaBuilding,
    FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaGlobe, FaNewspaper, FaCrown,
    FaRocket
} from 'react-icons/fa';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StockChart from './stockChart';
import { useIsPremium } from '../../../hooks/isPremium';
import Paywall from './Paywall';
import { useNavigate } from 'react-router-dom';


// Constants
const darkBg = "#0d0d0d";
const white = "#ffffff";

const StockDetailsModal = ({ open, onClose, stock, wishlist = [], addToWishlist, triggerAIAnalysis = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState({});
    const [data, setData] = useState({});
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [searchTicker, setSearchTicker] = useState('');
    const [currentStock, setCurrentStock] = useState(stock);
    // const [showPaywall, setShowPaywall] = useState(false);

    const navigate = useNavigate();


    const hasPremiumAccess = useIsPremium();

    // Check if stock is in wishlist
    const isInWishlist = currentStock && wishlist.includes(currentStock.symbol);

    // Handle add to wishlist
    const handleAddToWishlist = async () => {
        if (addToWishlist && currentStock && !isInWishlist) {
            await addToWishlist(currentStock.symbol);
        }
    };

    // Handle stock search
    const handleStockSearch = async () => {
        if (!searchTicker.trim()) return;
        
        const newStock = {
            symbol: searchTicker.toUpperCase(),
            name: searchTicker.toUpperCase()
        };
        
        setCurrentStock(newStock);
        setSearchTicker('');
        setData({}); // Clear previous data
    };

    // // Handle showing paywall
    // const handleShowPaywall = () => {
    //     setShowPaywall(true);
    // };

    // Handle Enter key press in search
    // const handleSearchKeyPress = (event) => {
    //     if (event.key === 'Enter') {
    //         handleStockSearch();
    //     }
    // };

    // Update current stock when prop changes
    useEffect(() => {
        setCurrentStock(stock);
    }, [stock]);

    // Auto-switch to Analysis tab when AI analysis is triggered
    useEffect(() => {
        if (triggerAIAnalysis && open) {
            setActiveTab(2); // Analysis tab is index 2
        }
    }, [triggerAIAnalysis, open]);

    // Fetch data for different endpoints
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

    // Fetch all data when modal opens
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
            // Don't auto-fetch AI analysis
        }
    }, [open, currentStock?.symbol]);

    // Handle AI Analysis
    const handleAIAnalysis = async () => {
        if (!currentStock?.symbol) return;
        
        setLoading(prev => ({ ...prev, aiAnalysis: true }));
        try {
            const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
            const response = await fetch(`${API_URL}/analysis?ticker=${currentStock.symbol}`);
            const result = await response.json();
            
            // Handle the new response format with HTML analysis
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
                // Fallback for old format
                setData(prev => ({ ...prev, aiAnalysis: result }));
            }
            setActiveTab(2); // Switch to Analysis tab
        } catch (error) {
            console.error('Error fetching AI analysis:', error);
            setData(prev => ({ ...prev, aiAnalysis: { error: 'Failed to fetch AI analysis. Please try again later.' } }));
        } finally {
            setLoading(prev => ({ ...prev, aiAnalysis: false }));
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'N/A';
        const num = Number(value);
        if (Math.abs(num) >= 1e12) {
            return `$${(num / 1e12).toFixed(2)}T`;
        } else if (Math.abs(num) >= 1e9) {
            return `$${(num / 1e9).toFixed(2)}B`;
        } else if (Math.abs(num) >= 1e6) {
            return `$${(num / 1e6).toFixed(2)}M`;
        } else if (Math.abs(num) >= 1e3) {
            return `$${(num / 1e3).toFixed(2)}K`;
        }
        return `$${num.toLocaleString()}`;
    };

    // Format large numbers
    const formatNumber = (value) => {
        if (!value && value !== 0) return 'N/A';
        const num = Number(value);
        if (Math.abs(num) >= 1e9) {
            return `${(num / 1e9).toFixed(2)}B`;
        } else if (Math.abs(num) >= 1e6) {
            return `${(num / 1e6).toFixed(2)}M`;
        } else if (Math.abs(num) >= 1e3) {
            return `${(num / 1e3).toFixed(2)}K`;
        }
        return num.toLocaleString();
    };

    // Get change color
    const getChangeColor = (change) => {
        if (change === null || change === undefined || isNaN(change)) return grey[400];
        return Number(change) >= 0 ? green[400] : red[400];
    };

    // Get grade color
    const getGradeColor = (grade) => {
        const lowerGrade = grade?.toLowerCase();
        if (lowerGrade?.includes('buy') || lowerGrade?.includes('strong')) return green[400];
        if (lowerGrade?.includes('sell')) return red[400];
        return grey[400];
    };

    // Tab panels
    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );

    // Stock Logo Component
    const StockLogo = ({ ticker, size = 24 }) => {
        const [hasError, setHasError] = React.useState(false);

        const profile = data.profile?.[0];

        const [imageSrc, setImageSrc] = React.useState(
              profile?.image ? profile.image : "/favicon.png"
        );

        const handleImageError = () => {
            if (!hasError) {
                setHasError(true);
                setImageSrc("/investi_favicon2.png");
            }
        };
        return profile?.image ? (
            <Avatar 
                src={imageSrc}
                onError={handleImageError}
                sx={{ 
                width: size, 
                height: size, 
                borderRadius: 0,
                mr: 0.5,
                backgroundColor: 'transparent',
                padding: 0
                }}
            />
        ) : null;
    };
    

    // Overview Tab Component
    const OverviewTab = () => {
        const quote = data.quote?.[0];
        const priceChange = data.priceChange?.[0]; // Access first item in array

        return (
            <Box>
                {/* Search Bar */}
                {/* <Card sx={{ mb: 2, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search for another ticker symbol..."
                            value={searchTicker}
                            onChange={(e) => setSearchTicker(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch color={teal[400]} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small"
                                            onClick={handleStockSearch}
                                            sx={{
                                                color: teal[400],
                                                minWidth: 'auto',
                                                p: { xs: 0.5, sm: 1 },
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                            }}
                                        >
                                            Search
                                        </Button>
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: darkBg,
                                    color: white,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: teal[800]
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: teal[600]
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: teal[400]
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    color: white,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: grey[500]
                                }
                            }}
                        />
                    </CardContent>
                </Card> */}

                {/* Stock Chart */}
                <>
                <Card sx={{ mb: 1, backgroundColor: 'transparent' }}>
                    <CardContent>
                        {currentStock?.symbol && (
                            <StockChart ticker={currentStock.symbol} />
                        )}
                    </CardContent>
                </Card>
                <Divider sx={{ my: 2, backgroundColor: teal[800] }} />
                </>

                {/* Key Metrics */}
                {quote && (
                    <>
                    <Card sx={{ mb: 3, backgroundColor: 'transparent' }}>
                        <CardContent>
                            <Grid container spacing={8}>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Open</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.open)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Day High</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.dayHigh)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Day Low</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.dayLow)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>52W High</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.yearHigh)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>52W Low</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.yearLow)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Volume</Typography>
                                        <Typography variant="body2" color={white}>{formatNumber(quote.volume)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Market Cap</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.marketCap)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>50D Avg</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.priceAvg50)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>200D Avg</Typography>
                                        <Typography variant="body2" color={white}>{formatCurrency(quote.priceAvg200)}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Divider sx={{ my: 2, backgroundColor: teal[800] }} />
                    </>
                )}

                {/* Price Performance */}
                {priceChange && (
                    hasPremiumAccess ? (
                        <Card sx={{ backgroundColor: 'transparent', mt: 0, borderRadius: 0, shadow: 'none' }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    {Object.entries(priceChange).filter(([key]) => key !== 'symbol').map(([period, change]) => (
                                        <Grid item xs={6} sm={4} md={4} key={period}>
                                            <Box sx={{ 
                                                backgroundColor: 'transparent',
                                                minWidth: '6em'
                                            }}>
                                                <Typography variant="body2" color={grey[400]} mb={1}>{period}</Typography>
                                                <Typography  variant="body1" color={getChangeColor(change || 0)} fontWeight="bold">
                                                    {change !== null && change !== undefined && !isNaN(change) 
                                                        ? `${change >= 0 ? '+' : ''}${Number(change).toFixed(2)}%`
                                                        : 'N/A'
                                                    }
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4, px: 3, backgroundColor: 'rgba(20, 184, 166, 0.05)', borderRadius: 2, border: `1px solid ${teal[800]}` }}>
                            <Box display="flex" justifyContent="center" mb={2}>
                                <Chip
                                    icon={<FaCrown color='black' />}
                                    label="PREMIUM"
                                    sx={{
                                        backgroundColor: amber[600],
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        px: 1
                                    }}
                                />
                            </Box>
                            <Typography variant="body1" color={grey[400]} mb={3}>
                                Upgrade to Premium to view detailed price performance across different time periods.
                            </Typography>
                            <Button
                                variant="contained"
                                // onClick={handleShowPaywall}
                                onClick={() => navigate('/dashboard/plans')} 
                                sx={{
                                    backgroundColor: teal[600],
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: teal[700],
                                    }
                                }}
                            >
                                Upgrade to Premium
                            </Button>
                    </Box>
                ))}
            </Box>
        );
    };

    // Profile Tab Component
    const ProfileTab = () => {
        const profile = data.profile?.[0];

        if (loading.profile) {
            return (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress sx={{ color: teal[400] }} />
                </Box>
            );
        }

        if (!profile) {
            return (
                <Alert severity="warning" sx={{ 
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    color: 'white'
                }}>
                    Company profile data not available
                </Alert>
            );
        }

        return (
            <Box>
                {/* Company Overview */}
                <Card sx={{ mb: 3, backgroundColor: 'transparent' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            {profile.image && (
                                <Avatar 
                                    src={profile.image} 
                                    sx={{ width: 48, height: 48 }}
                                />
                            )}
                            <Box>
                                <Typography variant="h6" color={white} fontWeight="bold">
                                    {profile.companyName}
                                </Typography>
                                <Typography variant="body2" color={grey[400]}>
                                    {profile.sector} • {profile.industry}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Typography variant="body1" color={grey[300]} mb={4} sx={{ lineHeight: 1.6 }}>
                            {profile.description}
                        </Typography>

                        <Divider sx={{ mb: 3, mt:3,  backgroundColor: teal[800] }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaUsers color={teal[400]} />
                                    <Typography variant="body1" color={grey[400]}>CEO:</Typography>
                                    <Typography variant="body2" color={white}>{profile.ceo}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaBuilding color={teal[400]} />
                                    <Typography variant="body1" color={grey[400]}>Employees:</Typography>
                                    <Typography variant="body2" color={white}>{formatNumber(profile.fullTimeEmployees)}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaCalendarAlt color={teal[400]} />
                                    <Typography variant="body1" color={grey[400]}>Founded:</Typography>
                                    <Typography variant="body2" color={white}>{profile.ipoDate}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaMapMarkerAlt color={teal[400]} />
                                    <Typography variant="body1" color={grey[400]}>Location:</Typography>
                                    <Typography variant="body2" color={white}>
                                        {profile.city}, {profile.state}, {profile.country}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaPhone color={teal[400]} />
                                    <Typography variant="body1" color={grey[400]}>Phone:</Typography>
                                    <Typography variant="body2" color={white}>{profile.phone}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaGlobe color={teal[400]} />
                                    <Typography variant="body1" color={grey[400]}>Website:</Typography>
                                    <Link 
                                        href={profile.website} 
                                        target="_blank" 
                                        rel="noopener"
                                        sx={{ color: teal[400], textDecoration: 'none' }}
                                    >
                                        Visit Website
                                    </Link>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Divider sx={{ mt: 0, mb:2, backgroundColor: teal[800] }} />
                {/* Financial Metrics */}
                <Card sx={{ backgroundColor: 'transparent', mt:0, boxShadow: 'none' }}>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body1" color={grey[400]} mb={1}>Market Cap</Typography>
                                    <Typography variant="body2" color={white}>{formatCurrency(profile.marketCap)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body1" color={grey[400]} mb={1}>Beta</Typography>
                                    <Typography variant="body2" color={white}>{profile.beta?.toFixed(2) || 'N/A'}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body1" color={grey[400]} mb={1}>Dividend</Typography>
                                    <Typography variant="body2" color={white}>{formatCurrency(profile.lastDividend)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body1" color={grey[400]} mb={1}>52W Range</Typography>
                                    <Typography variant="body2" color={white}>{profile.range}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body1" color={grey[400]} mb={1}>Volume</Typography>
                                    <Typography variant="body2" color={white}>{formatNumber(profile.volume)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body1" color={grey[400]} mb={1}>Avg Volume</Typography>
                                    <Typography variant="body2" color={white}>{formatNumber(profile.averageVolume)}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    // Analysis Tab Component
    const AnalysisTab = () => {
        const grades = data.grades;
        const historicalGrades = data.historicalGrades?.[0];
        const gradesNews = data.gradesNews;
        const priceTarget = data.priceTarget?.[0];
        const aiAnalysis = data.aiAnalysis;

        // const [showPaywall, setShowPaywall] = useState(false);

        return (
            <Box>
                {/* Historical Ratings Distribution */}
                {historicalGrades && (
                <Card sx={{ mb: 1, backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={6} sm={2.4}>
                                {hasPremiumAccess ? (
                                    <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h5" color={green[400]} fontWeight="bold">
                                        {historicalGrades.analystRatingsStrongBuy}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Strong Buy</Typography>
                                </Box>
                                ): (
                                <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2, filter: 'blur(4px)', "&:hover": { cursor: 'pointer' } }} 
                                    // onClick={() => setShowPaywall(true)}
                                    onClick={() => navigate('/dashboard/plans')}
                                >
                                    <Typography variant="h6" color={amber[400]} fontWeight="bold">
                                        UPGRADE
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Strong Buy</Typography>
                                </Box>
                                )}
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                               { hasPremiumAccess ? (
                                <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: 2 }}>
                                    <Typography variant="h5" color={green[300]} fontWeight="bold">
                                        {historicalGrades.analystRatingsBuy}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Buy</Typography>
                                </Box>
                                ) : (
                                    <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2, filter: 'blur(4px)', "&:hover": { cursor: 'pointer' } }} 
                                    // onClick={() => setShowPaywall(true)}
                                    onClick={() => navigate('/dashboard/plans')}
                                    >
                                    <Typography variant="h6" color={amber[300]} fontWeight="bold">
                                        UPGRADE
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Buy</Typography>
                                </Box>
                                )}
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(156, 163, 175, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h5" color={grey[400]} fontWeight="bold">
                                        {historicalGrades.analystRatingsHold}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Hold</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2 }}>
                                    <Typography variant="h5" color={red[300]} fontWeight="bold">
                                        {historicalGrades.analystRatingsSell}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Sell</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={2} sx={{ minWidth: '10em', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h5" color={red[400]} fontWeight="bold">
                                        {historicalGrades.analystRatingsStrongSell}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Strong Sell</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                )}

                {/* Current Grades */}
                <Card sx={{ mb: 3, backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <CardContent>
                        {loading.grades ? (
                                <Box display="flex" justifyContent="center" py={2}>
                                    <CircularProgress sx={{ color: teal[400] }} size={24} />
                                </Box>
                            ) : grades?.length > 0 ? (
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {grades.slice(0, 5).map((grade, index) => (
                                        <Chip
                                            key={index}
                                            label={`${grade.gradingCompany}: ${grade.newGrade}`}
                                            sx={{
                                                backgroundColor: getGradeColor(grade.newGrade),
                                                color: 'white',
                                                fontSize: '0.8rem'
                                            }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography color={grey[400]}>No recent ratings available</Typography>
                        )}
                    </CardContent>
                </Card>

                <Divider sx={{ mt: 0, mb:2, backgroundColor: teal[800] }} />

                {/* Price Targets */}
                {priceTarget && (
                    <Card sx={{ mb: 3, backgroundColor: 'transparent' }}>
                        <CardContent>
                            <Typography variant="h6" color={teal[400]} fontWeight={600} mb={3}>
                                Price Targets
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Last Month</Typography>
                                        <Typography variant="body2" color={white}>
                                            {formatCurrency(priceTarget.lastMonthAvgPriceTarget)}
                                        </Typography>
                                        <Typography variant="caption" color={grey[500]}>
                                            ({priceTarget.lastMonthCount} analysts)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]} mb={1}>Last Quarter</Typography>
                                        <Typography variant="body2" color={white}>
                                            {formatCurrency(priceTarget.lastQuarterAvgPriceTarget)}
                                        </Typography>
                                        <Typography variant="caption" color={grey[500]}>
                                            ({priceTarget.lastQuarterCount} analysts)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]}>Last Year</Typography>
                                        <Typography variant="h6" color={white}>
                                            {formatCurrency(priceTarget.lastYearAvgPriceTarget)}
                                        </Typography>
                                        <Typography variant="caption" color={grey[500]}>
                                            ({priceTarget.lastYearCount} analysts)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]}>All Time</Typography>
                                        <Typography variant="h6" color={white}>
                                            {formatCurrency(priceTarget.allTimeAvgPriceTarget)}
                                        </Typography>
                                        <Typography variant="caption" color={grey[500]}>
                                            ({priceTarget.allTimeCount} analysts)
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                <Divider sx={{ mt: 0, mb:2, backgroundColor: teal[800] }} />

                {/* AI Analysis Section */}
                {hasPremiumAccess ? (
                    <Card sx={{ mb: 3, backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <AutoAwesomeIcon sx={{ color: teal[400] }}size={20} />
                                <Typography variant="h6" color={teal[400]} fontWeight={600}>
                                    AI Analysis
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleAIAnalysis}
                                disabled={loading.aiAnalysis}
                                startIcon={loading.aiAnalysis ? <CircularProgress size={16} sx={{ color: teal[400] }} /> : <AutoAwesomeIcon />}
                                sx={{
                                    color: teal[400],
                                    borderColor: teal[400],
                                    backgroundColor: 'transparent',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    minWidth: { xs: 'auto', sm: 120 },
                                    px: { xs: 1, sm: 2 },
                                    '&:hover': {
                                        backgroundColor: 'rgba(20, 184, 166, 0.1)'
                                    }
                                }}
                            >
                                {loading.aiAnalysis ? 'Analyzing...' : 'Get Full AI Analysis'}
                            </Button>
                        </Box>
                        
                        {loading.aiAnalysis ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress sx={{ color: teal[400] }} />
                            </Box>
                        ) : data.aiAnalysis?.error ? (
                            <Alert severity="error" sx={{ 
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                color: 'white'
                            }}>
                                {data.aiAnalysis.error}
                            </Alert>
                        ) : data.aiAnalysis ? (
                            <Box>
                                {/* HTML Content Analysis */}
                                {data.aiAnalysis.htmlContent && data.aiAnalysis.format === 'html' ? (
                                    <Box
                                        dangerouslySetInnerHTML={{ __html: data.aiAnalysis.htmlContent }}
                                        sx={{
                                            color: grey[300],
                                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                color: teal[300],
                                                fontWeight: 'bold',
                                                marginBottom: 1,
                                                marginTop: 2
                                            },
                                            '& h3': {
                                                fontSize: { xs: '1rem', sm: '1.125rem' },
                                                color: teal[400]
                                            },
                                            '& p': {
                                                marginBottom: 2,
                                                lineHeight: 1.6,
                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                                color: grey[300]
                                            },
                                            '& span': {
                                                fontWeight: 'inherit'
                                            },
                                            '& span[style*="color: #ef4444"]': {
                                                color: `${red[400]} !important`,
                                                fontWeight: 'bold'
                                            },
                                            '& span[style*="font-weight: bold"]': {
                                                fontWeight: 'bold'
                                            },
                                            '& span[style*="font-size: 2rem"]': {
                                                fontSize: { xs: '1.5rem', sm: '2rem' } + ' !important'
                                            }
                                        }}
                                    />
                                ) : (
                                    // Legacy format support
                                    <>
                                        {/* AI Summary */}
                                        {data.aiAnalysis.summary && (
                                            <Box mb={3}>
                                                <Typography variant="body1" color={teal[300]} fontWeight="bold" mb={1}>
                                                    Executive Summary
                                                </Typography>
                                                <Typography variant="body2" color={grey[300]} sx={{ lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                    {data.aiAnalysis.summary}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Investment Recommendation */}
                                        {data.aiAnalysis.recommendation && (
                                            <Box mb={3}>
                                                <Typography variant="body1" color={teal[300]} fontWeight="bold" mb={1}>
                                                    Investment Recommendation
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
                                                    <Chip
                                                        label={data.aiAnalysis.recommendation.rating}
                                                        sx={{
                                                            backgroundColor: getGradeColor(data.aiAnalysis.recommendation.rating),
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                        }}
                                                    />
                                                    {data.aiAnalysis.recommendation.confidence && (
                                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                            Confidence: {data.aiAnalysis.recommendation.confidence}%
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Typography variant="body2" color={grey[300]} sx={{ lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                    {data.aiAnalysis.recommendation.reasoning}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* AI Price Targets */}
                                        {data.aiAnalysis.priceTargets && (
                                            <Box>
                                                <Typography variant="body1" color={teal[300]} fontWeight="bold" mb={1}>
                                                    AI Price Targets
                                                </Typography>
                                                <Grid container spacing={{ xs: 1, sm: 2 }}>
                                                    {data.aiAnalysis.priceTargets.bearCase && (
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography variant="body2" color={red[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Bear Case</Typography>
                                                                <Typography variant="h6" color={white} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                                    {formatCurrency(data.aiAnalysis.priceTargets.bearCase)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                    {data.aiAnalysis.priceTargets.baseCase && (
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Base Case</Typography>
                                                                <Typography variant="h6" color={white} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                                    {formatCurrency(data.aiAnalysis.priceTargets.baseCase)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                    {data.aiAnalysis.priceTargets.bullCase && (
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography variant="body2" color={green[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Bull Case</Typography>
                                                                <Typography variant="h6" color={white} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                                    {formatCurrency(data.aiAnalysis.priceTargets.bullCase)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        )}
                                    </>
                                )}

                                {/* Timestamp */}
                                {data.aiAnalysis.timestamp && (
                                    <Box mt={3} pt={2} borderTop={`1px solid ${grey[800]}`}>
                                        <Typography variant="caption" color={grey[500]} sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                                            Analysis generated on {new Date(data.aiAnalysis.timestamp).toLocaleString()}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Typography color={grey[400]} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Click "Get Analysis" to see AI-powered insights for {currentStock?.symbol}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
                ): (
                <Box sx={{ 
                   textAlign: 'center',
                   py: 4,
                   px: 3,
                   backgroundColor: 'rgba(20, 184, 166, 0.05)',
                   borderRadius: 2,
                   border: `1px solid ${teal[800]}`
                }}>
                   <Typography variant="body1" color={grey[400]} mb={3}>
                       Upgrade to Premium to view AI-generated analyst.
                   </Typography>
                   <Button
                       variant="contained"
                       startIcon={<FaRocket color='black' />}
                    //  onClick={() => setShowPaywall(true)}
                       onClick={() => navigate('/dashboard/plans')}
                       sx={{
                           backgroundColor: amber[600],
                           color: 'black',
                           fontWeight: 'bold',
                           px: 4,
                           py: 1.5,
                           '&:hover': {
                               backgroundColor: amber[500],
                           }
                       }}
                   >
                       Upgrade to Premium
                   </Button>
                </Box>
                )}

                <Divider sx={{ mt: 0, mb:2, backgroundColor: teal[800] }} />

                {/* Grade News */}
                <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <CardContent>
                        {loading.gradesNews ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress sx={{ color: teal[400] }} size={24} />
                            </Box>
                        ) : gradesNews?.length > 0 ? (
                            <Box display="flex" flexDirection="column" gap={1}>
                                {gradesNews.slice(0, 5).map((news, index) => (
                                    <Box 
                                        key={index}
                                        sx={{ 
                                            p: 2, 
                                            backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                            borderRadius: 1,
                                            border: `1px solid ${teal[800]}`
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Typography variant="body1" color={white} fontWeight="bold">
                                                {news.newsTitle}
                                            </Typography>
                                            <Chip
                                                label={news.newGrade}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getGradeColor(news.newGrade),
                                                    color: 'white',
                                                    ml: 1
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" color={grey[400]} mb={1}>
                                            {news.gradingCompany} • {new Date(news.publishedDate).toLocaleDateString()}
                                        </Typography>
                                        <Link 
                                            href={news.newsURL} 
                                            target="_blank" 
                                            rel="noopener"
                                            sx={{ color: teal[400], textDecoration: 'none', fontSize: '0.9rem' }}
                                        >
                                            Read Full Article <FaExternalLinkAlt size={10} />
                                        </Link>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography color={grey[400]}>No rating news available</Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    // News Tab Component
    const NewsTab = () => {
        const stockNews = data.stockNews;

        const handleNewsClick = (news) => {
            setSelectedNews(news);
            setNewsModalOpen(true);
        };

        return (
            <Box>
                <Card sx={{ backgroundColor: 'transparent' }}>
                    <CardContent>
                        {loading.stockNews ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress sx={{ color: teal[400] }} />
                            </Box>
                        ) : stockNews?.length > 0 ? (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {stockNews.map((news, index) => (
                                    <Box 
                                        key={index}
                                        onClick={() => handleNewsClick(news)}
                                        sx={{ 
                                            p: 2, 
                                            backgroundColor: 'transparent',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Box display="flex" gap={2}>
                                            {news.image && (
                                                <Box 
                                                    component="img"
                                                    src={news.image}
                                                    alt={news.title}
                                                    sx={{
                                                        width: 80,
                                                        height: 60,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                        flexShrink: 0
                                                    }}
                                                />
                                            )}
                                            <Box flex={1}>
                                                <Typography variant="body1" color={white} fontWeight="bold" mb={1}>
                                                    {news.title}
                                                </Typography>
                                                <Typography variant="body2" color={grey[300]} mb={1} sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {news.text}
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="caption" color={grey[500]}>
                                                        {news.publisher} • {new Date(news.publishedDate).toLocaleDateString()}
                                                    </Typography>
                                                    <FaNewspaper color={teal[400]} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography color={grey[400]}>No news available</Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    // News Modal Component
    const NewsModal = () => (
        <Dialog
            open={newsModalOpen}
            onClose={() => setNewsModalOpen(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    backgroundColor: darkBg,
                    color: white,
                    borderRadius: isMobile ? 0 : 2
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${teal[800]}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" color={white}>News Article</Typography>
                <IconButton onClick={() => setNewsModalOpen(false)} sx={{ color: grey[400] }}>
                    <FaTimes />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {selectedNews && (
                    <Box>
                        {selectedNews.image && (
                            <Box 
                                component="img"
                                src={selectedNews.image}
                                alt={selectedNews.title}
                                sx={{
                                    width: '100%',
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mb: 2
                                }}
                            />
                        )}
                        <Typography variant="h5" color={white} fontWeight="bold" mb={2}>
                            {selectedNews.title}
                        </Typography>
                        <Box display="flex" gap={2} mb={2}>
                            <Typography variant="body2" color={teal[400]}>
                                {selectedNews.publisher}
                            </Typography>
                            <Typography variant="body2" color={grey[400]}>
                                {new Date(selectedNews.publishedDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color={grey[300]} mb={3} sx={{ lineHeight: 1.6 }}>
                            {selectedNews.text}
                        </Typography>
                        <Button
                            variant="contained"
                            href={selectedNews.url}
                            target="_blank"
                            rel="noopener"
                            startIcon={<FaExternalLinkAlt />}
                            sx={{
                                backgroundColor: teal[600],
                                '&:hover': { backgroundColor: teal[700] }
                            }}
                        >
                            Read Full Article
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );

    if (!currentStock) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        backgroundColor: darkBg,
                        color: white,
                        minHeight: isMobile ? '100vh' : '80vh',
                        borderRadius: isMobile ? 0 : 2
                    }
                }}
            >
                {/* Header */}
                <DialogTitle sx={{ 
                    borderBottom: `1px solid ${teal[800]}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    backgroundColor: darkBg,
                    p: { xs: 2, sm: 3 }
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
                            <StockLogo ticker={currentStock.symbol} size={isMobile ? 32 : 40} />
                            <Box flex={1} minWidth={0}>
                                <Typography variant={isMobile ? "h6" : "h5"} color={white} fontWeight="bold" noWrap>
                                    {currentStock.symbol}
                                </Typography>
                                <Typography variant="body2" color={grey[400]} noWrap>
                                    {currentStock.name}
                                </Typography>
                            </Box>
                            {currentStock.price && (
                                <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="h6" color={white} fontWeight="bold">
                                        ${currentStock.price?.toFixed(2) || 'N/A'}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color={getChangeColor(currentStock.change)}
                                        fontWeight="bold"
                                    >
                                        {currentStock.changesPercentage !== null && currentStock.changesPercentage !== undefined
                                            ? `${currentStock.change >= 0 ? '+' : ''}${Number(currentStock.changesPercentage).toFixed(2)}%`
                                            : 'N/A'
                                        }
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                            <Button
                                variant={isInWishlist ? "contained" : "outlined"}
                                size="small"
                                onClick={handleAddToWishlist}
                                disabled={isInWishlist}
                                startIcon={isInWishlist ? <FaCheck /> : <FaPlus />}
                                sx={{
                                    color: isInWishlist ? white : teal[400],
                                    borderColor: teal[400],
                                    backgroundColor: isInWishlist ? teal[600] : 'transparent',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    minWidth: { xs: 'auto', sm: 120 },
                                    px: { xs: 1, sm: 2 },
                                    '&:hover': {
                                        backgroundColor: isInWishlist ? teal[700] : 'rgba(20, 184, 166, 0.1)'
                                    }
                                }}
                            >
                                {isMobile ? (isInWishlist ? 'Added' : 'Add') : (isInWishlist ? 'Watching' : 'Watch')}
                            </Button>
                            <IconButton onClick={onClose} sx={{ color: grey[400] }}>
                                <FaTimes />
                            </IconButton>
                        </Box>
                        {/* Mobile price display */}
                        {currentStock.price && (
                            <Box sx={{ display: { xs: 'flex', sm: 'none' }, width: '100%', justifyContent: 'center', mt: 1 }}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color={white} fontWeight="bold">
                                        ${currentStock.price?.toFixed(2) || 'N/A'}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color={getChangeColor(currentStock.change)}
                                        fontWeight="bold"
                                    >
                                        {currentStock.changesPercentage !== null && currentStock.changesPercentage !== undefined
                                            ? `${currentStock.change >= 0 ? '+' : ''}${Number(currentStock.changesPercentage).toFixed(2)}%`
                                            : 'N/A'
                                        }
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogTitle>

                {/* Tabs */}
                <Box sx={{ borderBottom: `1px solid ${teal[800]}`, backgroundColor: darkBg }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant={isMobile ? "fullWidth" : "standard"}
                        sx={{
                            '& .MuiTab-root': {
                                color: grey[400],
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                minWidth: { xs: 60, sm: 90 },
                                minHeight: { xs: 40, sm: 48 },
                                padding: { xs: '6px 8px', sm: '12px 16px' },
                                '&.Mui-selected': {
                                    color: teal[400]
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: teal[400]
                            }
                        }}
                    >
                        <Tab label="Overview" />
                        <Tab label="Profile" />
                        <Tab label="Analysis" />
                        <Tab label="News" />
                    </Tabs>
                </Box>

                {/* Content */}
                <DialogContent sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: darkBg,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: teal[800],
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: teal[600],
                    }
                }}>
                    <TabPanel value={activeTab} index={0}>
                        <OverviewTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={1}>
                        <ProfileTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={2}>
                        <AnalysisTab />
                    </TabPanel>
                    <TabPanel value={activeTab} index={3}>
                        <NewsTab />
                    </TabPanel>
                </DialogContent>
            </Dialog>

            {/* News Modal */}
            <NewsModal />

            {/* Paywall Modal */}
            {/* <Paywall 
                open={showPaywall}
                onClose={() => setShowPaywall(false)}
            /> */}
        </>
    );
};

export default StockDetailsModal;
