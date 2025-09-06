import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container, Divider,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button,
    Paper, Link, Modal, Dialog, DialogTitle,
    DialogContent, DialogActions, Card, CardMedia
} from "@mui/material";
import { teal, grey } from "@mui/material/colors";
import { 
    FaBars, FaNewspaper, FaChartLine, FaBitcoin, 
    FaExchangeAlt, FaGlobe, FaRedo, FaAngleLeft, FaAngleRight,
    FaTimes, FaExternalLinkAlt
} from "react-icons/fa";
import { useNewsData } from "../../../hooks/useNewsData";
import NewsSearchControls from "./components/NewsSearchControls";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const News = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [newsStartIndex, setNewsStartIndex] = useState(0);
    const [newsEndIndex, setNewsEndIndex] = useState(10);
    const [selectedNews, setSelectedNews] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Use the news data hook
    const {
        fmpNews,
        generalNews,
        stockNews,
        cryptoNews,
        forexNews,
        searchResults,
        loading,
        errors,
        searchNewsByTicker,
        clearSearch,
        refreshAllNews
    } = useNewsData();

    // Tab configuration
    const tabs = [
        { label: 'FMP News', icon: <FaNewspaper />, key: 'fmp', data: fmpNews },
        { label: 'Stock News', icon: <FaChartLine />, key: 'stock', data: stockNews },
        { label: 'Crypto News', icon: <FaBitcoin />, key: 'crypto', data: cryptoNews },
        { label: 'Forex News', icon: <FaExchangeAlt />, key: 'forex', data: forexNews },
        { label: 'General News', icon: <FaGlobe />, key: 'general', data: generalNews },
    ];

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setNewsStartIndex(0);
        setNewsEndIndex(10);
        
        // Clear search when switching tabs
        if (searchActive) {
            handleClearSearch();
        }
    };

    // Handle search
    const handleSearch = async (query) => {
        setSearchActive(true);
        setNewsStartIndex(0);
        setNewsEndIndex(10);
        await searchNewsByTicker(query);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchActive(false);
        setSearchQuery('');
        setNewsStartIndex(0);
        setNewsEndIndex(10);
        clearSearch();
    };

    // Get current data
    const getCurrentData = () => {
        if (searchActive && searchResults.length >= 0) {
            return searchResults;
        }
        return tabs[activeTab]?.data || [];
    };

    const currentData = getCurrentData();
    const currentTab = tabs[activeTab];
    const currentLoading = loading[currentTab?.key] || loading.search;
    const currentError = errors[currentTab?.key] || errors.search;

    // Pagination handlers
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNext = () => {
        setNewsStartIndex(prev => prev + 10);
        setNewsEndIndex(prev => prev + 10);
        scrollToTop();
    };

    const handleBack = () => {
        if (newsStartIndex >= 10) {
            setNewsStartIndex(prev => prev - 10);
            setNewsEndIndex(prev => prev - 10);
            scrollToTop();
        }
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle news click to open modal
    const handleNewsClick = (news, event) => {
        event.preventDefault();
        setSelectedNews(news);
        setModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedNews(null);
    };

    // Get image source
    const getImageSource = (news) => {
        // Check for various image properties
        if (news?.image) return news.image;
        if (news?.urlToImage) return news.urlToImage;
        if (news?.imageUrl) return news.imageUrl;
        if (news?.thumbnail) return news.thumbnail;
        // Default to fallback image
        return '/image/market.jpg';
    };

    // Get news content for modal
    const getNewsContent = (news) => {
        if (news?.content) return news.content;
        if (news?.text) return news.text;
        if (news?.description) return news.description;
        return 'No additional content available.';
    };

    // Get clean text content for card display (strips HTML)
    const getCleanTextContent = (news) => {
        const content = news?.description || news?.content || news?.text || '';
        // Strip HTML tags for card display
        return content.replace(/<[^>]*>/g, '').trim();
    };

    // Check if news has HTML content (mainly for FMP news)
    const hasHtmlContent = (news) => {
        const content = getNewsContent(news);
        return content && content.includes('<');
    };

    return (
        <Box sx={{ 
            display: "flex",
            height: "100vh",
            backgroundColor: darkBg, 
            color: white, 
            background: darkGradient,
            overflow: "hidden"
        }}>
            {/* Left Sidebar - Desktop */}
            {!isSmallScreen && (
                <Box sx={{ 
                    width: "240px", 
                    flexShrink: 0,
                }}>
                    <DashboardSidebar />
                </Box>
            )}
            
            {/* Mobile sidebar drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                variant="temporary"
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        width: 240,
                        boxSizing: 'border-box',
                        background: darkGradient,
                        borderRight: `1px solid ${teal[900]}`,
                    },
                }}
            >
                <DashboardSidebar onClose={handleDrawerToggle} />
            </Drawer>
            
            {/* Main Content */}
            <Box 
                data-scrollable="true"
                sx={{ 
                    overflow: "auto",
                    height: "100vh",
                    width: "100%",
                    // Hide scrollbar but keep scroll functionality
                    '&::-webkit-scrollbar': { 
                        display: 'none'
                    },
                    scrollbarWidth: 'none',
                    '-ms-overflow-style': 'none',
                }}>
                {/* Sticky Mobile Header - only visible on mobile */}
                {isSmallScreen && (
                    <Box 
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1100,
                            backgroundColor: darkBg,
                            borderBottom: `1px solid ${teal[800]}`,
                            px: 2,
                            py: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ 
                                color: teal[400],
                                '&:hover': { 
                                    backgroundColor: 'rgba(0, 128, 128, 0.1)',
                                }
                            }}
                        >
                            <FaBars />
                        </IconButton>
                        <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color={white}
                            sx={{ fontSize: '1.2rem' }}
                        >
                            Financial News
                        </Typography>
                    </Box>
                )}
                
                <Container maxWidth="lg" sx={{ mt: isSmallScreen ? 0 : 4, pb: 5 }}>
                    <Box mb={3}>
                        {/* Desktop Title */}
                        {!isSmallScreen && (
                            <Typography 
                                variant="h5" 
                                fontWeight="bold" 
                                color={white} 
                                mb={1}
                                px={1}
                                sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' } }}
                            >
                                Financial News
                            </Typography>
                        )}
                        <Typography 
                            variant="body1" 
                            color={grey[400]} 
                            px={1}
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Stay updated with the latest financial news and insights
                        </Typography> 
                        
                        {/* Search Controls */}
                        <NewsSearchControls
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={loading.search}
                            searchActive={searchActive}
                            resultsCount={searchResults.length}
                        />
                        
                        <Divider sx={{ bgcolor: teal[900], opacity: 0.5, my: 3 }} />
                    </Box>

                    {/* News Category Tabs */}
                    <Box sx={{ mb: 3, borderBottom: `1px solid ${teal[800]}` }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant={isMobile ? "scrollable" : "standard"}
                            scrollButtons={isMobile ? "auto" : false}
                            allowScrollButtonsMobile
                            sx={{
                                '& .MuiTab-root': {
                                    color: grey[500],
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                    minWidth: isMobile ? 120 : 140,
                                    '&.Mui-selected': {
                                        color: teal[300],
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: teal[500],
                                    height: 3,
                                },
                                '& .MuiTabs-scrollButtons': {
                                    color: teal[400],
                                },
                            }}
                        >
                            {tabs.map((tab, index) => (
                                <Tab
                                    key={tab.key}
                                    icon={tab.icon}
                                    iconPosition="start"
                                    label={isMobile ? tab.label.split(' ')[0] : tab.label}
                                    sx={{
                                        '& .MuiTab-iconWrapper': {
                                            marginRight: 1,
                                        },
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    
                    {/* News Articles */}      
                    {currentLoading ? (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="300px"
                            sx={{
                                backgroundColor: 'rgba(20, 30, 20, 0.3)',
                                borderRadius: '10px',
                                border: `1px solid ${teal[900]}`,
                                my: 4,
                                width: "100%"
                            }}
                        >
                            <CircularProgress sx={{ color: teal[400] }} />
                        </Box>
                    ) : currentError ? (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                color: 'white',
                                border: `1px solid rgba(211, 47, 47, 0.3)`,
                                '& .MuiAlert-icon': { color: 'rgba(211, 47, 47, 0.8)' }
                            }}
                            action={
                                <Button
                                    size="small"
                                    onClick={refreshAllNews}
                                    sx={{ color: teal[400] }}
                                    startIcon={<FaRedo />}
                                >
                                    Retry
                                </Button>
                            }
                        >
                            Failed to load news: {currentError}
                        </Alert>
                    ) : currentData && currentData.length > 0 ? (
                        <>
                            {/* News List */}
                            <Box sx={{ maxWidth: "100%", mx: "auto" }}>
                                {currentData.slice(newsStartIndex, newsEndIndex).map((news, index) => (
                                    <Paper 
                                        key={news.id || index}
                                        elevation={0}
                                        sx={{
                                            backgroundColor: '#0cac990d',
                                            borderBottom: `1px solid ${grey[900]}`,
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            width: "100%",
                                            maxWidth: "100%",
                                            marginBottom: 2,
                                            cursor: 'pointer',
                                            px: 2,
                                            '&:hover': {
                                                '& .news-title': {
                                                    color: teal[300],
                                                }
                                            }
                                        }}
                                        onClick={(e) => handleNewsClick(news, e)}
                                    >
                                        <Box 
                                            py={2} 
                                            sx={{
                                                width: "100%",
                                                boxSizing: "border-box",
                                                "&:hover": {
                                                    px: 1,
                                                    transition: "all 0.4s ease-in-out",
                                                }
                                            }}
                                        >
                                            {/* News Content Row: Image | Text Content */}
                                            <Box 
                                                display="flex" 
                                                gap={2}
                                                sx={{
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { xs: 'stretch', sm: 'flex-start' }
                                                }}
                                            >
                                                {/* News Image */}
                                                <Box
                                                    sx={{
                                                        flexShrink: 0,
                                                        width: { xs: '100%', sm: '120px', md: '140px' },
                                                        height: { xs: '160px', sm: '80px', md: '90px' },
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        bgcolor: grey[800],
                                                        border: `1px solid ${grey[700]}`,
                                                    }}
                                                >
                                                    <img
                                                        src={getImageSource(news)}
                                                        alt={news?.title || 'News'}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = '/image/market.jpg';
                                                        }}
                                                    />
                                                </Box>

                                                {/* Text Content */}
                                                <Box flex={1} minWidth={0}>
                                                    {/* Header: Source and Date */}
                                                    <Box display="flex" justifyContent="space-between" mb={1} flexWrap="wrap">
                                                        <Typography 
                                                            fontSize={{ xs: '0.75rem', sm: '0.85rem' }} 
                                                            sx={{ 
                                                                color: teal[400],
                                                                fontWeight: 500,
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {currentTab?.label || 'News Source'}
                                                        </Typography>
                                                        
                                                        {(news?.publishedDate || news?.date) && (
                                                            <Typography 
                                                                fontSize={{ xs: '0.7rem', sm: '0.75rem' }} 
                                                                color={grey[500]}
                                                            >
                                                                {formatDate(news.publishedDate || news.date)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    
                                                    {/* Title */}
                                                    <Typography 
                                                        className="news-title"
                                                        fontWeight="bold" 
                                                        color={white}
                                                        mb={1}
                                                        sx={{ 
                                                            fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                                            transition: 'color 0.2s ease',
                                                            lineHeight: 1.3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: { xs: 2, sm: 2 },
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {news?.title}
                                                    </Typography>
                                                    
                                                    {/* Description */}
                                                    <Typography 
                                                        fontSize={{ xs: '0.8rem', sm: '0.9rem' }} 
                                                        color={grey[400]}
                                                        sx={{
                                                            lineHeight: 1.5,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: { xs: 2, sm: 2 },
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {getCleanTextContent(news)}
                                                    </Typography>

                                                    {/* Additional Info */}
                                                    <Box display="flex" gap={1} mt={1} alignItems="center">
                                                        {hasHtmlContent(news) && (
                                                            <Typography
                                                                fontSize="0.7rem"
                                                                sx={{
                                                                    backgroundColor: teal[600],
                                                                    color: 'white',
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                Full Article
                                                            </Typography>
                                                        )}
                                                        {news?.url && (
                                                            <FaExternalLinkAlt 
                                                                size={12} 
                                                                color={grey[500]} 
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                            
                            {/* Pagination */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 3,
                                    alignItems: "center"
                                }}
                            >
                                <Button
                                    startIcon={<FaAngleLeft />}
                                    onClick={handleBack}
                                    disabled={newsStartIndex < 1}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 500,
                                        color: teal[400],
                                        '&:disabled': {
                                            color: grey[600]
                                        }
                                    }}
                                >
                                    Back
                                </Button>
                                <Typography sx={{ color: teal[400], fontSize:"10pt" }}>
                                    {newsStartIndex + 1}-{Math.min(newsEndIndex, currentData.length)} of {currentData.length}
                                </Typography>
                                <Button
                                    endIcon={<FaAngleRight />}
                                    onClick={handleNext}
                                    disabled={newsEndIndex >= currentData.length}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 500,
                                        color: teal[400],
                                        '&:disabled': {
                                            color: grey[600]
                                        }
                                    }}
                                >
                                    Next
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="300px"
                            sx={{
                                backgroundColor: 'rgba(20, 30, 20, 0.3)',
                                borderRadius: '10px',
                                border: `1px solid ${teal[900]}`,
                                my: 4,
                                width: "100%"
                            }}
                        >
                            <Typography color={grey[400]}>
                                {searchActive ? `No news found for "${searchQuery}"` : 'No news available'}
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* News Content Modal */}
            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: darkBg,
                        backgroundImage: darkGradient,
                        border: `1px solid ${teal[800]}`,
                        borderRadius: 3,
                        maxHeight: '90vh',
                    }
                }}
            >
                {selectedNews && (
                    <>
                        <DialogTitle sx={{ 
                            color: white, 
                            borderBottom: `1px solid ${teal[800]}`,
                            pb: 2
                        }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                {selectedNews.title}
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Typography fontSize="0.9rem" color={teal[400]}>
                                    {currentTab?.label || 'News Source'}
                                </Typography>
                                {(selectedNews.publishedDate || selectedNews.date) && (
                                    <Typography fontSize="0.9rem" color={grey[400]}>
                                        {formatDate(selectedNews.publishedDate || selectedNews.date)}
                                    </Typography>
                                )}
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ color: white, py: 3 }}>
                            {/* Image */}
                            {getImageSource(selectedNews) && (
                                <Box sx={{ mb: 3, textAlign: 'center' }}>
                                    <img
                                        src={getImageSource(selectedNews)}
                                        alt={selectedNews.title}
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            maxHeight: '300px',
                                            borderRadius: '8px',
                                            border: `1px solid ${grey[700]}`,
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/image/market.jpg';
                                        }}
                                    />
                                </Box>
                            )}

                            {/* Content */}
                            <Box>
                                {hasHtmlContent(selectedNews) ? (
                                    <Box
                                        dangerouslySetInnerHTML={{ 
                                            __html: getNewsContent(selectedNews) 
                                        }}
                                        sx={{
                                            color: white,
                                            lineHeight: 1.7,
                                            '& p': {
                                                marginBottom: 2,
                                                color: grey[300],
                                            },
                                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                color: teal[300],
                                                marginBottom: 2,
                                                marginTop: 3,
                                            },
                                            '& a': {
                                                color: teal[400],
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            },
                                            '& img': {
                                                maxWidth: '100%',
                                                height: 'auto',
                                                borderRadius: '4px',
                                                border: `1px solid ${grey[700]}`,
                                                margin: '16px 0',
                                            },
                                            '& blockquote': {
                                                borderLeft: `4px solid ${teal[500]}`,
                                                paddingLeft: 2,
                                                margin: '16px 0',
                                                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                                padding: 2,
                                                borderRadius: 1,
                                            },
                                            '& code': {
                                                backgroundColor: grey[800],
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.9em',
                                            },
                                            '& pre': {
                                                backgroundColor: grey[900],
                                                padding: 2,
                                                borderRadius: 1,
                                                overflow: 'auto',
                                                border: `1px solid ${grey[700]}`,
                                            },
                                        }}
                                    />
                                ) : (
                                    <Typography sx={{ 
                                        color: grey[300], 
                                        lineHeight: 1.7,
                                        fontSize: '1rem'
                                    }}>
                                        {getNewsContent(selectedNews)}
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ 
                            borderTop: `1px solid ${teal[800]}`,
                            px: 3,
                            py: 2,
                            gap: 2
                        }}>
                            <Button 
                                onClick={handleCloseModal}
                                sx={{ 
                                    color: grey[400],
                                    '&:hover': { 
                                        color: white,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Close
                            </Button>
                            {selectedNews.url && (
                                <Button
                                    href={selectedNews.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    sx={{
                                        color: teal[400],
                                        borderColor: teal[600],
                                        '&:hover': {
                                            borderColor: teal[500],
                                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                        },
                                    }}
                                    startIcon={<FaExternalLinkAlt />}
                                >
                                    Read Full Article
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default News;
