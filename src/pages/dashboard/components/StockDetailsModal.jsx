import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogTitle, Box, Typography, IconButton,
    Tabs, Tab, Card, CardContent, Grid, Chip, Button, CircularProgress,
    Alert, Avatar, Divider, useMediaQuery, useTheme, Link, TextField,
    InputAdornment
} from '@mui/material';
import { teal, green, red, grey, blue } from '@mui/material/colors';
import {
    FaTimes, FaPlus, FaCheck, FaExternalLinkAlt, FaBuilding,
    FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaGlobe,
    FaChartLine, FaArrowUp, FaArrowDown, FaStar, FaNewspaper, FaRobot,
    FaSearch
} from 'react-icons/fa';
import StockChart from './stockChart';

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

    // Handle Enter key press in search
    const handleSearchKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleStockSearch();
        }
    };

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
            setData(prev => ({ ...prev, aiAnalysis: result }));
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
        const profile = data.profile?.[0];
        return profile?.image ? (
            <Avatar 
                src={profile.image} 
                sx={{ 
                    width: size, 
                    height: size, 
                    mr: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: 0.5
                }}
            />
        ) : null;
    };

    // Overview Tab Component
    const OverviewTab = () => {
        const quote = data.quote?.[0];
        const priceChange = data.priceChange;

        return (
            <Box>
                {/* Search Bar */}
                <Card sx={{ mb: 2, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
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
                </Card>

                {/* Stock Chart */}
                <Card sx={{ mb: 1, backgroundColor: 'transparent' }}>
                    <CardContent>
                        {currentStock?.symbol && (
                            <StockChart ticker={currentStock.symbol} />
                        )}
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                {quote && (
                    <Card sx={{ mb: 1, backgroundColor: 'transparent', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography variant="h6" color='white' mb={2}>
                                Key Metrics
                            </Typography>
                            <Grid container spacing={{ xs: 2, sm: 3, md: 6 }}>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Open</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.open)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Day High</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.dayHigh)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Day Low</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.dayLow)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>52W High</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.yearHigh)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>52W Low</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.yearLow)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Volume</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatNumber(quote.volume)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Market Cap</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.marketCap)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>50D Avg</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.priceAvg50)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>200D Avg</Typography>
                                        <Typography variant="body1" color={white} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(quote.priceAvg200)}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Price Performance */}
                {priceChange && (
                    <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography variant="h6" color='white' mb={1}>
                                Price Performance
                            </Typography>
                            <Grid container spacing={{ xs: 1, sm: 2 }}>
                                {Object.entries(priceChange).filter(([key]) => key !== 'symbol').map(([period, change]) => (
                                    <Grid item xs={6} sm={4} md={3} key={period}>
                                        <Box textAlign="center" p={{ xs: 0.5, sm: 1 }} sx={{ 
                                            backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                            borderRadius: 1,
                                            border: `1px solid ${teal[800]}`
                                        }}>
                                            <Typography variant="body2" color={grey[400]} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{period}</Typography>
                                            <Typography 
                                                variant={isMobile ? "body1" : "h6"}
                                                color={getChangeColor(change || 0)}
                                                fontWeight="bold"
                                                sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
                                            >
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
                )}
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
                <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
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
                        
                        <Typography variant="body1" color={grey[300]} mb={2} sx={{ lineHeight: 1.6 }}>
                            {profile.description}
                        </Typography>

                        <Divider sx={{ my: 2, backgroundColor: teal[800] }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaUsers color={teal[400]} />
                                    <Typography variant="body2" color={grey[400]}>CEO:</Typography>
                                    <Typography variant="body2" color={white}>{profile.ceo}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaBuilding color={teal[400]} />
                                    <Typography variant="body2" color={grey[400]}>Employees:</Typography>
                                    <Typography variant="body2" color={white}>{formatNumber(profile.fullTimeEmployees)}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaCalendarAlt color={teal[400]} />
                                    <Typography variant="body2" color={grey[400]}>Founded:</Typography>
                                    <Typography variant="body2" color={white}>{profile.ipoDate}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaMapMarkerAlt color={teal[400]} />
                                    <Typography variant="body2" color={grey[400]}>Location:</Typography>
                                    <Typography variant="body2" color={white}>
                                        {profile.city}, {profile.state}, {profile.country}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaPhone color={teal[400]} />
                                    <Typography variant="body2" color={grey[400]}>Phone:</Typography>
                                    <Typography variant="body2" color={white}>{profile.phone}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <FaGlobe color={teal[400]} />
                                    <Typography variant="body2" color={grey[400]}>Website:</Typography>
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

                {/* Financial Metrics */}
                <Card sx={{ backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                            Financial Metrics
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]}>Market Cap</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(profile.marketCap)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]}>Beta</Typography>
                                    <Typography variant="h6" color={white}>{profile.beta?.toFixed(2) || 'N/A'}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]}>Dividend</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(profile.lastDividend)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]}>52W Range</Typography>
                                    <Typography variant="h6" color={white}>{profile.range}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]}>Volume</Typography>
                                    <Typography variant="h6" color={white}>{formatNumber(profile.volume)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]}>Avg Volume</Typography>
                                    <Typography variant="h6" color={white}>{formatNumber(profile.averageVolume)}</Typography>
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

        return (
            <Box>
                {/* AI Analysis Section */}
                <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FaRobot color={teal[400]} size={20} />
                                <Typography variant="h6" color={teal[300]} fontWeight="bold">
                                    AI Analysis
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleAIAnalysis}
                                disabled={loading.aiAnalysis}
                                startIcon={loading.aiAnalysis ? <CircularProgress size={16} sx={{ color: teal[400] }} /> : <FaRobot />}
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
                                {loading.aiAnalysis ? 'Analyzing...' : 'Get Analysis'}
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
                            </Box>
                        ) : (
                            <Typography color={grey[400]} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Click "Get Analysis" to see AI-powered insights for {currentStock?.symbol}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
                {/* Current Grades */}
                <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                            Recent Analyst Ratings
                        </Typography>
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

                {/* Historical Ratings Distribution */}
                {historicalGrades && (
                    <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                        <CardContent>
                            <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                Analyst Consensus
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={2.4}>
                                    <Box textAlign="center">
                                        <Typography variant="h4" color={green[400]} fontWeight="bold">
                                            {historicalGrades.analystRatingsStrongBuy}
                                        </Typography>
                                        <Typography variant="body2" color={grey[400]}>Strong Buy</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2.4}>
                                    <Box textAlign="center">
                                        <Typography variant="h4" color={green[300]} fontWeight="bold">
                                            {historicalGrades.analystRatingsBuy}
                                        </Typography>
                                        <Typography variant="body2" color={grey[400]}>Buy</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2.4}>
                                    <Box textAlign="center">
                                        <Typography variant="h4" color={grey[400]} fontWeight="bold">
                                            {historicalGrades.analystRatingsHold}
                                        </Typography>
                                        <Typography variant="body2" color={grey[400]}>Hold</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2.4}>
                                    <Box textAlign="center">
                                        <Typography variant="h4" color={red[300]} fontWeight="bold">
                                            {historicalGrades.analystRatingsSell}
                                        </Typography>
                                        <Typography variant="body2" color={grey[400]}>Sell</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2.4}>
                                    <Box textAlign="center">
                                        <Typography variant="h4" color={red[400]} fontWeight="bold">
                                            {historicalGrades.analystRatingsStrongSell}
                                        </Typography>
                                        <Typography variant="body2" color={grey[400]}>Strong Sell</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Price Targets */}
                {priceTarget && (
                    <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                        <CardContent>
                            <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                Price Targets
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]}>Last Month</Typography>
                                        <Typography variant="h6" color={white}>
                                            {formatCurrency(priceTarget.lastMonthAvgPriceTarget)}
                                        </Typography>
                                        <Typography variant="caption" color={grey[500]}>
                                            ({priceTarget.lastMonthCount} analysts)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box>
                                        <Typography variant="body2" color={grey[400]}>Last Quarter</Typography>
                                        <Typography variant="h6" color={white}>
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

                {/* Grade News */}
                <Card sx={{ backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                            Recent Rating News
                        </Typography>
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
                <Card sx={{ backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                            Latest {currentStock?.symbol} News
                        </Typography>
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
                                            backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                            borderRadius: 1,
                                            border: `1px solid ${teal[800]}`,
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
                                {isMobile ? (isInWishlist ? 'Added' : 'Add') : (isInWishlist ? 'In Watchlist' : 'Add to Watchlist')}
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
        </>
    );
};

export default StockDetailsModal;
