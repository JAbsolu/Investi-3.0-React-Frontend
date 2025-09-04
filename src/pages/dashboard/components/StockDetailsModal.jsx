import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogTitle, Box, Typography, IconButton,
    Tabs, Tab, Card, CardContent, Grid, Chip, Button, CircularProgress,
    Alert, Avatar, Divider, useMediaQuery, useTheme, Link
} from '@mui/material';
import { teal, green, red, grey, blue } from '@mui/material/colors';
import {
    FaTimes, FaPlus, FaCheck, FaExternalLinkAlt, FaBuilding,
    FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaGlobe,
    FaChartLine, FaArrowUp, FaArrowDown, FaStar, FaNewspaper
} from 'react-icons/fa';
import StockChart from './stockChart';

// Constants
const darkBg = "#0d0d0d";
const white = "#ffffff";

const StockDetailsModal = ({ open, onClose, stock, wishlist = [], addToWishlist }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState({});
    const [data, setData] = useState({});
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsModalOpen, setNewsModalOpen] = useState(false);

    // Check if stock is in wishlist
    const isInWishlist = stock && wishlist.includes(stock.symbol);

    // Handle add to wishlist
    const handleAddToWishlist = async () => {
        if (addToWishlist && stock && !isInWishlist) {
            await addToWishlist(stock.symbol);
        }
    };

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
        if (open && stock?.symbol) {
            fetchData(`/fmp/profile?ticker=${stock.symbol}`, 'profile');
            fetchData(`/fmp/quote?ticker=${stock.symbol}`, 'quote');
            fetchData(`/fmp/ten-year-price-change?ticker=${stock.symbol}`, 'priceChange');
            fetchData(`/fmp/grades?ticker=${stock.symbol}`, 'grades');
            fetchData(`/fmp/historical-grades?ticker=${stock.symbol}`, 'historicalGrades');
            fetchData(`/fmp/grades-news?ticker=${stock.symbol}&limit=10`, 'gradesNews');
            fetchData(`/fmp/price-target?ticker=${stock.symbol}`, 'priceTarget');
            fetchData(`/fmp/search-stock-news?ticker=${stock.symbol}`, 'stockNews');
        }
    }, [open, stock?.symbol]);

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

    // Overview Tab Component
    const OverviewTab = () => {
        const quote = data.quote?.[0];
        const priceChange = data.priceChange;

        return (
            <Box>
                {/* Stock Chart */}
                <Card sx={{ mb: 1, backgroundColor: 'transparent' }}>
                    <CardContent>
                        {stock?.symbol && (
                            <StockChart ticker={stock.symbol} />
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
                            <Grid container spacing={6}>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>Open</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.open)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>Day High</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.dayHigh)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>Day Low</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.dayLow)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>52W High</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.yearHigh)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>52W Low</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.yearLow)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>Volume</Typography>
                                        <Typography variant="p" color={white}>{formatNumber(quote.volume)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>Market Cap</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.marketCap)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>50D Avg</Typography>
                                        <Typography variant="p" color={white}>{formatCurrency(quote.priceAvg50)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box>
                                        <Typography variant="body1" color={grey[400]}>200D Avg</Typography>
                                        <Typography variant="hp6" color={white}>{formatCurrency(quote.priceAvg200)}</Typography>
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
                            <Typography variant="h6" color='white'  mb={1}>
                                Price Performance
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(priceChange).filter(([key]) => key !== 'symbol').map(([period, change]) => (
                                    <Grid item xs={6} sm={4} md={3} key={period}>
                                        <Box textAlign="center" p={1} sx={{ 
                                            backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                            borderRadius: 1,
                                            border: `1px solid ${teal[800]}`
                                        }}>
                                            <Typography variant="body2" color={grey[400]}>{period}</Typography>
                                            <Typography 
                                                variant="h6" 
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

        return (
            <Box>
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
                            Latest {stock?.symbol} News
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

    if (!stock) return null;

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
                    backgroundColor: darkBg
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography variant="h5" color={white} fontWeight="bold">
                                    {stock.symbol}
                                </Typography>
                                <Typography variant="body2" color={grey[400]}>
                                    {stock.name}
                                </Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography variant="h6" color={white} fontWeight="bold">
                                    ${stock.price?.toFixed(2) || 'N/A'}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    color={getChangeColor(stock.change)}
                                    fontWeight="bold"
                                >
                                    {stock.changesPercentage !== null && stock.changesPercentage !== undefined
                                        ? `${stock.change >= 0 ? '+' : ''}${Number(stock.changesPercentage).toFixed(2)}%`
                                        : 'N/A'
                                    }
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
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
                                    '&:hover': {
                                        backgroundColor: isInWishlist ? teal[700] : 'rgba(20, 184, 166, 0.1)'
                                    }
                                }}
                            >
                                {isInWishlist ? 'In Watchlist' : 'Add to Watchlist'}
                            </Button>
                            <IconButton onClick={onClose} sx={{ color: grey[400] }}>
                                <FaTimes />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>

                {/* Tabs */}
                <Box sx={{ borderBottom: `1px solid ${teal[800]}`, backgroundColor: darkBg }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{
                            '& .MuiTab-root': {
                                color: grey[400],
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
                <DialogContent sx={{ p: 3, overflow: 'auto' }}>
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
