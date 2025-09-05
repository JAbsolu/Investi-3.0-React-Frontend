import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import {
    Box, Typography, Container, TextField, Button, InputAdornment,
    Tabs, Tab, Card, CardContent, Grid, CircularProgress, Alert,
    useMediaQuery, useTheme, IconButton, Drawer, Avatar, Chip, Link, Divider
} from '@mui/material';
import { teal, grey, green, red } from '@mui/material/colors';
import {
    FaBars, FaSearch, FaUsers, FaBuilding, FaCalendarAlt, FaMapMarkerAlt,
    FaPhone, FaGlobe, FaExternalLinkAlt, FaNewspaper, FaArrowLeft
} from 'react-icons/fa';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StockChart from '../components/stockChart';
import { useWishlist } from '../../../hooks/useWishlist';

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const StockDetailsPage = () => {
    const { ticker: urlTicker } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState({});
    const [data, setData] = useState({});
    const [searchTicker, setSearchTicker] = useState('');
    const [currentTicker, setCurrentTicker] = useState(urlTicker || '');
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    
    const { wishlist, addToWishlist } = useWishlist();

    // Check if stock is in wishlist
    const isInWishlist = currentTicker && wishlist.includes(currentTicker);

    // Handle add to wishlist
    const handleAddToWishlist = async () => {
        if (addToWishlist && currentTicker && !isInWishlist) {
            await addToWishlist(currentTicker);
        }
    };

    // Handle stock search
    const handleStockSearch = async () => {
        if (!searchTicker.trim()) return;
        
        const ticker = searchTicker.toUpperCase();
        setCurrentTicker(ticker);
        setSearchTicker('');
        setData({}); // Clear previous data
        navigate(`/dashboard/stock-details/${ticker}`);
    };

    // Handle Enter key press in search
    const handleSearchKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleStockSearch();
        }
    };

    // Update current ticker when URL changes
    useEffect(() => {
        if (urlTicker) {
            setCurrentTicker(urlTicker.toUpperCase());
        }
    }, [urlTicker]);

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

    // Fetch all data when ticker changes
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

    // Handle AI Analysis
    const handleAIAnalysis = async () => {
        if (!currentTicker) return;
        
        setLoading(prev => ({ ...prev, aiAnalysis: true }));
        try {
            const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
            const response = await fetch(`${API_URL}/analysis?ticker=${currentTicker}`);
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

    // Tab panels
    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: darkGradient,
            display: 'flex'
        }}>
            {/* Sidebar */}
            <DashboardSidebar 
                open={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                variant={isMobile ? "temporary" : "permanent"}
            />

            {/* Main Content */}
            <Box sx={{ 
                flexGrow: 1, 
                ml: isMobile ? 0 : '280px',
                minHeight: '100vh'
            }}>
                {/* Header */}
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    background: 'rgba(13, 13, 13, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${teal[800]}`,
                    p: { xs: 2, sm: 3 }
                }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            {isMobile && (
                                <IconButton 
                                    onClick={() => setSidebarOpen(true)}
                                    sx={{ color: white }}
                                >
                                    <FaBars />
                                </IconButton>
                            )}
                            <Box display="flex" alignItems="center" gap={2}>
                                <StockLogo ticker={currentTicker} size={32} />
                                <Box>
                                    <Typography variant="h5" color={white} fontWeight="bold">
                                        {currentTicker ? `${currentTicker} Stock Analysis` : 'Stock Analysis'}
                                    </Typography>
                                    <Typography variant="body2" color={grey[400]}>
                                        Comprehensive stock research and analysis
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Quick Actions */}
                        <Box display="flex" alignItems="center" gap={2}>
                            {currentTicker && (
                                <Button
                                    variant={isInWishlist ? "contained" : "outlined"}
                                    size="small"
                                    onClick={handleAddToWishlist}
                                    disabled={isInWishlist}
                                    sx={{
                                        color: isInWishlist ? 'black' : teal[400],
                                        borderColor: teal[400],
                                        backgroundColor: isInWishlist ? teal[400] : 'transparent',
                                        '&:hover': {
                                            backgroundColor: isInWishlist ? teal[600] : 'rgba(20, 184, 166, 0.1)'
                                        }
                                    }}
                                >
                                    {isInWishlist ? 'In Watchlist' : 'Add to Watchlist'}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Search Bar */}
                    <Box mt={3}>
                        <TextField
                            fullWidth
                            size="medium"
                            placeholder="Search for any stock ticker symbol (e.g., AAPL, TSLA, MSFT)..."
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
                                            onClick={handleStockSearch}
                                            sx={{
                                                color: teal[400],
                                                minWidth: 'auto',
                                                p: 2
                                            }}
                                        >
                                            Search
                                        </Button>
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: darkBg,
                                    color: white,
                                    borderRadius: 2,
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
                                    fontSize: '1rem'
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: grey[500]
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Content */}
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {!currentTicker ? (
                        // Welcome State
                        <Box 
                            display="flex" 
                            flexDirection="column" 
                            alignItems="center" 
                            justifyContent="center" 
                            minHeight="60vh"
                            textAlign="center"
                        >
                            <FaSearch size={64} color={teal[400]} style={{ marginBottom: 24 }} />
                            <Typography variant="h4" color={white} fontWeight="bold" mb={2}>
                                Stock Analysis Dashboard
                            </Typography>
                            <Typography variant="body1" color={grey[400]} mb={4} maxWidth="600px">
                                Search for any stock ticker symbol to get comprehensive analysis including 
                                price data, company profile, analyst ratings, AI-powered insights, and latest news.
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                                {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'].map((ticker) => (
                                    <Button
                                        key={ticker}
                                        variant="outlined"
                                        onClick={() => {
                                            setSearchTicker(ticker);
                                            setTimeout(() => handleStockSearch(), 100);
                                        }}
                                        sx={{
                                            color: teal[400],
                                            borderColor: teal[400],
                                            '&:hover': {
                                                backgroundColor: 'rgba(20, 184, 166, 0.1)'
                                            }
                                        }}
                                    >
                                        {ticker}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        // Stock Analysis Content
                        <Box>
                            {/* Tabs */}
                            <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(e, newValue) => setActiveTab(newValue)}
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: grey[400],
                                            fontWeight: 'bold',
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
                            </Card>

                            {/* Tab Content */}
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
                            
                            <TabPanel value={activeTab} index={1}>
                                <ProfileTab 
                                    data={data}
                                    loading={loading}
                                    formatCurrency={formatCurrency}
                                    formatNumber={formatNumber}
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
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

// Overview Tab Component
const OverviewTab = ({ data, loading, currentTicker, formatCurrency, formatNumber, getChangeColor, isMobile }) => {
    const quote = data.quote?.[0];
    const priceChange = data.priceChange?.[0];

    return (
        <Box>
            {/* Stock Chart */}
            <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                <CardContent>
                    {currentTicker && (
                        <StockChart ticker={currentTicker} />
                    )}
                </CardContent>
            </Card>

            {/* Key Metrics */}
            {quote && (
                <Card sx={{ mb: 3, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color={teal[400]} fontWeight={600} mb={3}>
                            Key Metrics
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Open</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.open)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Day High</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.dayHigh)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Day Low</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.dayLow)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>52W High</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.yearHigh)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>52W Low</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.yearLow)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Volume</Typography>
                                    <Typography variant="h6" color={white}>{formatNumber(quote.volume)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Market Cap</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.marketCap)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>50D Avg</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.priceAvg50)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>200D Avg</Typography>
                                    <Typography variant="h6" color={white}>{formatCurrency(quote.priceAvg200)}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Price Performance */}
            {priceChange && (
                <Card sx={{ backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color={teal[400]} fontWeight={600} mb={3}>
                            Price Performance
                        </Typography>
                        <Grid container spacing={3}>
                            {Object.entries(priceChange).filter(([key]) => key !== 'symbol').map(([period, change]) => (
                                <Grid item xs={6} sm={4} md={3} key={period}>
                                    <Box textAlign="center" p={2} sx={{ 
                                        backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                        borderRadius: 2,
                                        border: `1px solid ${teal[800]}`
                                    }}>
                                        <Typography variant="body2" color={grey[400]} mb={1}>{period}</Typography>
                                        <Typography 
                                            variant="h5"
                                            color={getChangeColor(change || 0)}
                                            fontWeight="bold"
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
const ProfileTab = ({ data, loading, formatCurrency, formatNumber }) => {
    const profile = data.profile?.[0];

    if (loading.profile) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress sx={{ color: teal[400] }} />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Alert severity="warning" sx={{ 
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                color: 'white',
                mb: 3
            }}>
                Company profile data not available
            </Alert>
        );
    }

    return (
        <Box>
            {/* Company Overview */}
            <Card sx={{ mb: 4, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                        {profile.image && (
                            <Avatar 
                                src={profile.image} 
                                sx={{ width: 64, height: 64 }}
                            />
                        )}
                        <Box>
                            <Typography variant="h4" color={white} fontWeight="bold" mb={1}>
                                {profile.companyName}
                            </Typography>
                            <Typography variant="h6" color={grey[400]}>
                                {profile.sector} • {profile.industry}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Typography variant="body1" color={grey[300]} mb={3} sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                        {profile.description}
                    </Typography>

                    <Divider sx={{ my: 3, backgroundColor: teal[800] }} />

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <FaUsers color={teal[400]} size={20} />
                                <Typography variant="body1" color={grey[400]}>CEO:</Typography>
                                <Typography variant="body1" color={white} fontWeight="bold">{profile.ceo}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <FaBuilding color={teal[400]} size={20} />
                                <Typography variant="body1" color={grey[400]}>Employees:</Typography>
                                <Typography variant="body1" color={white} fontWeight="bold">{formatNumber(profile.fullTimeEmployees)}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <FaCalendarAlt color={teal[400]} size={20} />
                                <Typography variant="body1" color={grey[400]}>Founded:</Typography>
                                <Typography variant="body1" color={white} fontWeight="bold">{profile.ipoDate}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <FaMapMarkerAlt color={teal[400]} size={20} />
                                <Typography variant="body1" color={grey[400]}>Location:</Typography>
                                <Typography variant="body1" color={white} fontWeight="bold">
                                    {profile.city}, {profile.state}, {profile.country}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <FaPhone color={teal[400]} size={20} />
                                <Typography variant="body1" color={grey[400]}>Phone:</Typography>
                                <Typography variant="body1" color={white} fontWeight="bold">{profile.phone}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <FaGlobe color={teal[400]} size={20} />
                                <Typography variant="body1" color={grey[400]}>Website:</Typography>
                                <Link 
                                    href={profile.website} 
                                    target="_blank" 
                                    rel="noopener"
                                    sx={{ color: teal[400], textDecoration: 'none', fontWeight: 'bold' }}
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
                    <Typography variant="h5" color={teal[300]} fontWeight="bold" mb={3}>
                        Financial Metrics
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6} sm={4}>
                            <Box>
                                <Typography variant="body2" color={grey[400]} mb={1}>Market Cap</Typography>
                                <Typography variant="h5" color={white} fontWeight="bold">{formatCurrency(profile.marketCap)}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box>
                                <Typography variant="body2" color={grey[400]} mb={1}>Beta</Typography>
                                <Typography variant="h5" color={white} fontWeight="bold">{profile.beta?.toFixed(2) || 'N/A'}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box>
                                <Typography variant="body2" color={grey[400]} mb={1}>Dividend</Typography>
                                <Typography variant="h5" color={white} fontWeight="bold">{formatCurrency(profile.lastDividend)}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box>
                                <Typography variant="body2" color={grey[400]} mb={1}>52W Range</Typography>
                                <Typography variant="h5" color={white} fontWeight="bold">{profile.range}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box>
                                <Typography variant="body2" color={grey[400]} mb={1}>Volume</Typography>
                                <Typography variant="h5" color={white} fontWeight="bold">{formatNumber(profile.volume)}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box>
                                <Typography variant="body2" color={grey[400]} mb={1}>Avg Volume</Typography>
                                <Typography variant="h5" color={white} fontWeight="bold">{formatNumber(profile.averageVolume)}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

// Analysis Tab Component
const AnalysisTab = ({ data, loading, handleAIAnalysis, formatCurrency, getGradeColor, currentTicker }) => {
    const grades = data.grades;
    const historicalGrades = data.historicalGrades?.[0];
    const gradesNews = data.gradesNews;
    const priceTarget = data.priceTarget?.[0];
    const aiAnalysis = data.aiAnalysis;

    return (
        <Box>
            {/* AI Analysis Section */}
            <Card sx={{ mb: 4, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <AutoAwesomeIcon sx={{ color: teal[400], fontSize: 28 }} />
                            <Typography variant="h5" color={teal[300]} fontWeight="bold">
                                AI Analysis
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handleAIAnalysis}
                            disabled={loading.aiAnalysis}
                            startIcon={loading.aiAnalysis ? <CircularProgress size={20} sx={{ color: teal[400] }} /> : <AutoAwesomeIcon />}
                            sx={{
                                color: teal[400],
                                borderColor: teal[400],
                                backgroundColor: 'transparent',
                                px: 3,
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 184, 166, 0.1)'
                                }
                            }}
                        >
                            {loading.aiAnalysis ? 'Analyzing...' : 'Get Full AI Analysis'}
                        </Button>
                    </Box>
                    
                    {loading.aiAnalysis ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress sx={{ color: teal[400] }} size={48} />
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
                                        fontSize: '1.1rem',
                                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                                            color: teal[300],
                                            fontWeight: 'bold',
                                            marginBottom: 2,
                                            marginTop: 3
                                        },
                                        '& h3': {
                                            fontSize: '1.25rem',
                                            color: teal[400]
                                        },
                                        '& p': {
                                            marginBottom: 2,
                                            lineHeight: 1.8,
                                            fontSize: '1.1rem',
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
                                            fontSize: '2rem !important'
                                        }
                                    }}
                                />
                            ) : (
                                // Legacy format support
                                <>
                                    {data.aiAnalysis.summary && (
                                        <Box mb={4}>
                                            <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                                Executive Summary
                                            </Typography>
                                            <Typography variant="body1" color={grey[300]} sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                                                {data.aiAnalysis.summary}
                                            </Typography>
                                        </Box>
                                    )}

                                    {data.aiAnalysis.recommendation && (
                                        <Box mb={4}>
                                            <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                                Investment Recommendation
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={3} mb={2} flexWrap="wrap">
                                                <Chip
                                                    label={data.aiAnalysis.recommendation.rating}
                                                    sx={{
                                                        backgroundColor: getGradeColor(data.aiAnalysis.recommendation.rating),
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                        py: 2,
                                                        px: 3
                                                    }}
                                                />
                                                {data.aiAnalysis.recommendation.confidence && (
                                                    <Typography variant="body1" color={grey[400]}>
                                                        Confidence: {data.aiAnalysis.recommendation.confidence}%
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography variant="body1" color={grey[300]} sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                                                {data.aiAnalysis.recommendation.reasoning}
                                            </Typography>
                                        </Box>
                                    )}

                                    {data.aiAnalysis.priceTargets && (
                                        <Box>
                                            <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                                AI Price Targets
                                            </Typography>
                                            <Grid container spacing={3}>
                                                {data.aiAnalysis.priceTargets.bearCase && (
                                                    <Grid item xs={4}>
                                                        <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                                                            <Typography variant="body2" color={red[400]} mb={1}>Bear Case</Typography>
                                                            <Typography variant="h4" color={white} fontWeight="bold">
                                                                {formatCurrency(data.aiAnalysis.priceTargets.bearCase)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                                {data.aiAnalysis.priceTargets.baseCase && (
                                                    <Grid item xs={4}>
                                                        <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(156, 163, 175, 0.1)', borderRadius: 2 }}>
                                                            <Typography variant="body2" color={grey[400]} mb={1}>Base Case</Typography>
                                                            <Typography variant="h4" color={white} fontWeight="bold">
                                                                {formatCurrency(data.aiAnalysis.priceTargets.baseCase)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                                {data.aiAnalysis.priceTargets.bullCase && (
                                                    <Grid item xs={4}>
                                                        <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2 }}>
                                                            <Typography variant="body2" color={green[400]} mb={1}>Bull Case</Typography>
                                                            <Typography variant="h4" color={white} fontWeight="bold">
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
                                <Box mt={4} pt={3} borderTop={`1px solid ${grey[800]}`}>
                                    <Typography variant="caption" color={grey[500]} sx={{ fontSize: '0.9rem' }}>
                                        Analysis generated on {new Date(data.aiAnalysis.timestamp).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Typography color={grey[400]} sx={{ fontSize: '1.1rem', textAlign: 'center', py: 4 }}>
                            Click "Get Full AI Analysis" to see AI-powered insights for {currentTicker}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Current Grades */}
            <Card sx={{ mb: 4, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                <CardContent>
                    <Typography variant="h5" color={teal[300]} fontWeight="bold" mb={3}>
                        Recent Analyst Ratings
                    </Typography>
                    {loading.grades ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress sx={{ color: teal[400] }} size={32} />
                        </Box>
                    ) : grades?.length > 0 ? (
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            {grades.slice(0, 8).map((grade, index) => (
                                <Chip
                                    key={index}
                                    label={`${grade.gradingCompany}: ${grade.newGrade}`}
                                    sx={{
                                        backgroundColor: getGradeColor(grade.newGrade),
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        py: 2,
                                        px: 1
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
                <Card sx={{ mb: 4, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h5" color={teal[300]} fontWeight="bold" mb={3}>
                            Analyst Consensus
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h3" color={green[400]} fontWeight="bold">
                                        {historicalGrades.analystRatingsStrongBuy}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Strong Buy</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: 2 }}>
                                    <Typography variant="h3" color={green[300]} fontWeight="bold">
                                        {historicalGrades.analystRatingsBuy}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Buy</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(156, 163, 175, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h3" color={grey[400]} fontWeight="bold">
                                        {historicalGrades.analystRatingsHold}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Hold</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2 }}>
                                    <Typography variant="h3" color={red[300]} fontWeight="bold">
                                        {historicalGrades.analystRatingsSell}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Sell</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                                <Box textAlign="center" p={3} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h3" color={red[400]} fontWeight="bold">
                                        {historicalGrades.analystRatingsStrongSell}
                                    </Typography>
                                    <Typography variant="body1" color={grey[400]} fontWeight="bold">Strong Sell</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Price Targets */}
            {priceTarget && (
                <Card sx={{ mb: 4, backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h5" color={teal[300]} fontWeight="bold" mb={3}>
                            Price Targets
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Last Month</Typography>
                                    <Typography variant="h4" color={white} fontWeight="bold">
                                        {formatCurrency(priceTarget.lastMonthAvgPriceTarget)}
                                    </Typography>
                                    <Typography variant="body2" color={grey[500]}>
                                        ({priceTarget.lastMonthCount} analysts)
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Last Quarter</Typography>
                                    <Typography variant="h4" color={white} fontWeight="bold">
                                        {formatCurrency(priceTarget.lastQuarterAvgPriceTarget)}
                                    </Typography>
                                    <Typography variant="body2" color={grey[500]}>
                                        ({priceTarget.lastQuarterCount} analysts)
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>Last Year</Typography>
                                    <Typography variant="h4" color={white} fontWeight="bold">
                                        {formatCurrency(priceTarget.lastYearAvgPriceTarget)}
                                    </Typography>
                                    <Typography variant="body2" color={grey[500]}>
                                        ({priceTarget.lastYearCount} analysts)
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color={grey[400]} mb={1}>All Time</Typography>
                                    <Typography variant="h4" color={white} fontWeight="bold">
                                        {formatCurrency(priceTarget.allTimeAvgPriceTarget)}
                                    </Typography>
                                    <Typography variant="body2" color={grey[500]}>
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
                    <Typography variant="h5" color={teal[300]} fontWeight="bold" mb={3}>
                        Recent Rating News
                    </Typography>
                    {loading.gradesNews ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress sx={{ color: teal[400] }} size={32} />
                        </Box>
                    ) : gradesNews?.length > 0 ? (
                        <Box display="flex" flexDirection="column" gap={3}>
                            {gradesNews.slice(0, 5).map((news, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        p: 3, 
                                        backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                        borderRadius: 2,
                                        border: `1px solid ${teal[800]}`
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Typography variant="h6" color={white} fontWeight="bold">
                                            {news.newsTitle}
                                        </Typography>
                                        <Chip
                                            label={news.newGrade}
                                            size="small"
                                            sx={{
                                                backgroundColor: getGradeColor(news.newGrade),
                                                color: 'white',
                                                ml: 2
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body1" color={grey[400]} mb={2}>
                                        {news.gradingCompany} • {new Date(news.publishedDate).toLocaleDateString()}
                                    </Typography>
                                    <Link 
                                        href={news.newsURL} 
                                        target="_blank" 
                                        rel="noopener"
                                        sx={{ color: teal[400], textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}
                                    >
                                        Read Full Article <FaExternalLinkAlt size={12} />
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
const NewsTab = ({ data, loading, currentTicker }) => {
    const stockNews = data.stockNews;

    const handleNewsClick = (news) => {
        window.open(news.url, '_blank');
    };

    return (
        <Box>
            <Card sx={{ backgroundColor: 'rgba(20, 30, 20, 0.3)' }}>
                <CardContent>
                    <Typography variant="h5" color={teal[300]} fontWeight="bold" mb={3}>
                        Latest {currentTicker} News
                    </Typography>
                    {loading.stockNews ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress sx={{ color: teal[400] }} size={48} />
                        </Box>
                    ) : stockNews?.length > 0 ? (
                        <Box display="flex" flexDirection="column" gap={3}>
                            {stockNews.map((news, index) => (
                                <Box 
                                    key={index}
                                    onClick={() => handleNewsClick(news)}
                                    sx={{ 
                                        p: 3, 
                                        backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                        borderRadius: 2,
                                        border: `1px solid ${teal[800]}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 25px rgba(20, 184, 166, 0.2)'
                                        }
                                    }}
                                >
                                    <Box display="flex" gap={3}>
                                        {news.image && (
                                            <Box 
                                                component="img"
                                                src={news.image}
                                                alt={news.title}
                                                sx={{
                                                    width: 120,
                                                    height: 80,
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    flexShrink: 0
                                                }}
                                            />
                                        )}
                                        <Box flex={1}>
                                            <Typography variant="h6" color={white} fontWeight="bold" mb={2}>
                                                {news.title}
                                            </Typography>
                                            <Typography variant="body1" color={grey[300]} mb={2} sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.6
                                            }}>
                                                {news.text}
                                            </Typography>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" color={grey[500]} fontWeight="bold">
                                                    {news.publisher} • {new Date(news.publishedDate).toLocaleDateString()}
                                                </Typography>
                                                <FaNewspaper color={teal[400]} size={20} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography color={grey[400]} sx={{ textAlign: 'center', py: 4, fontSize: '1.1rem' }}>
                            No news available for {currentTicker}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default StockDetailsPage;
