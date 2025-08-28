import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container, Grid,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button,
    Pagination, Modal, Paper
} from "@mui/material";
import { teal, grey } from "@mui/material/colors";
import { 
    FaBars, FaNewspaper, FaChartLine, FaBitcoin, 
    FaExchangeAlt, FaGlobe, FaRedo, FaTimes 
} from "react-icons/fa";
import { useNewsData } from "../../../hooks/useNewsData";
import NewsSearchControls from "./components/NewsSearchControls";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';

const News = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
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

    // Pagination settings
    const itemsPerPage = 12;

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
        setCurrentPage(1);
        
        // Clear search when switching tabs
        if (searchActive) {
            handleClearSearch();
        }
    };

    // Handle search
    const handleSearch = async (query) => {
        setSearchActive(true);
        setCurrentPage(1);
        await searchNewsByTicker(query);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchActive(false);
        setSearchQuery('');
        setCurrentPage(1);
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

    // Pagination logic - Simple and clean
    const articlesPerPage = 13; // 1 banner + 12 in grid (4 articles per row × 3 rows)
    const totalPages = Math.ceil(currentData.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginatedData = currentData.slice(startIndex, startIndex + articlesPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle article click
    const handleArticleClick = (article) => {
        // For FMP news, show content in modal
        if (currentTab?.key === 'fmp' && article?.content) {
            setSelectedArticle(article);
            setModalOpen(true);
        } else {
            // For other news, open external link
            const url = article?.link || article?.url;
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedArticle(null);
    };

    // Render news content
    const renderNewsContent = () => {
        if (currentLoading) {
            return (
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: 400,
                        backgroundColor: '#1a1a1a',
                        borderRadius: 3,
                        border: `1px solid ${teal[800]}`,
                    }}
                >
                    <CircularProgress sx={{ color: teal[400] }} />
                </Box>
            );
        }

        if (currentError) {
            return (
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
            );
        }

        if (!currentData || currentData.length === 0) {
            const message = searchActive && searchQuery.trim()
                ? `No news found for "${searchQuery}"`
                : `No ${currentTab?.label.toLowerCase()} available`;
                
            return (
                <Box 
                    sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        backgroundColor: '#1a1a1a',
                        borderRadius: 3,
                        border: `1px solid ${teal[800]}`,
                    }}
                >
                    <Typography color={grey[500]} sx={{ fontStyle: 'italic', mb: 2 }}>
                        {message}
                    </Typography>
                    {searchActive ? (
                        <Button
                            size="small"
                            onClick={handleClearSearch}
                            sx={{ color: teal[400] }}
                        >
                            Clear Search
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            onClick={refreshAllNews}
                            sx={{ color: teal[400] }}
                            startIcon={<FaRedo />}
                        >
                            Refresh
                        </Button>
                    )}
                </Box>
            );
        }

        return (
            <Box sx={{ width: '100%' }}>
                {/* Banner Article - First Article */}
                {paginatedData.length > 0 && (
                    <Box 
                        sx={{ 
                            mb: 3,
                            borderRadius: 3,
                            overflow: 'hidden',
                            position: 'relative',
                            height: { xs: 200, md: 280 },
                            cursor: 'pointer',
                            '&:hover': {
                                '& .banner-overlay': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                },
                                '& .banner-title': {
                                    color: teal[300],
                                }
                            },
                            transition: 'all 0.3s ease-in-out',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                        }}
                        onClick={() => handleArticleClick(paginatedData[0])}
                    >
                        {/* Background Image */}
                        <Box
                            component="img"
                            src={paginatedData[0]?.image || '/image/market.jpg'}
                            alt={paginatedData[0]?.title || ''}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                            onError={(e) => {
                                e.target.src = '/image/market.jpg';
                            }}
                        />
                        
                        {/* Dark Overlay */}
                        <Box 
                            className="banner-overlay"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
                                transition: 'all 0.3s ease-in-out',
                            }}
                        />

                        {/* Content Overlay */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: { xs: 2, md: 3 },
                            color: 'white',
                            zIndex: 2,
                        }}>
                            {/* Category Banner */}
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        backgroundColor: teal[600],
                                        color: 'white',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    🔥 {currentTab?.label || 'News'}
                                </Typography>
                            </Box>

                            {/* Title */}
                            <Typography
                                className="banner-title"
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                    lineHeight: 1.2,
                                    mb: 2,
                                    transition: 'color 0.3s ease-in-out',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {paginatedData[0]?.title || ''}
                            </Typography>

                            {/* Meta Info */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 3,
                                fontSize: '0.85rem',
                                opacity: 0.9
                            }}>
                                {paginatedData[0]?.date && (
                                    <Typography variant="body2">
                                        {new Date(paginatedData[0].date).toLocaleDateString()}
                                    </Typography>
                                )}
                                <Typography variant="body2" sx={{ color: teal[300], fontWeight: 600, ml: 'auto' }}>
                                    {currentTab?.key === 'fmp' ? 'Read full article →' : 'Read more →'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Articles Row Grid */}
                {paginatedData.length > 1 && (
                    <Grid container spacing={2} sx={{ justifyContent: 'flex-start' }}>
                        {paginatedData.slice(1).map((article, index) => (
                            <Grid 
                                item 
                                xs={12} 
                                sm={6} 
                                md={4} 
                                lg={3} 
                                key={index + 1}
                                sx={{ 
                                    display: 'flex',
                                    '& > *': {
                                        width: '100%'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        height: 350,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        backgroundColor: '#1a1a1a',
                                        border: `1px solid ${teal[800]}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        maxWidth: '100%',
                                        '&:hover': {
                                            borderColor: teal[600],
                                            backgroundColor: '#1f1f1f',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 16px rgba(20, 184, 166, 0.15)',
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                    }}
                                    onClick={() => handleArticleClick(article)}
                                >
                                    {/* Article Image */}
                                    <Box
                                        sx={{
                                            height: 140,
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={article?.image || '/image/market.jpg'}
                                            alt={article?.title || ''}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                },
                                            }}
                                            onError={(e) => {
                                                e.target.src = '/image/market.jpg';
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                backgroundColor: currentTab?.key === 'fmp' ? teal[600] : 'rgba(0, 0, 0, 0.7)',
                                                color: 'white',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {currentTab?.key === 'fmp' ? 'FMP' : 'NEWS'}
                                        </Box>
                                    </Box>

                                    {/* Article Content */}
                                    <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                lineHeight: 1.3,
                                                mb: 1.5,
                                                color: 'white',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                '&:hover': { color: teal[300] },
                                                transition: 'color 0.3s ease',
                                            }}
                                        >
                                            {article?.title || ''}
                                        </Typography>

                                        {/* Content with HTML rendering for FMP */}
                                        <Box
                                            sx={{
                                                color: grey[400],
                                                lineHeight: 1.4,
                                                mb: 1.5,
                                                flex: 1,
                                                fontSize: '0.8rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                '& p': {
                                                    margin: 0,
                                                    marginBottom: 0.5,
                                                },
                                                '& strong': {
                                                    color: teal[300],
                                                    fontWeight: 600,
                                                },
                                                '& a': {
                                                    color: teal[400],
                                                    textDecoration: 'none',
                                                },
                                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                    color: teal[300],
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    margin: 0,
                                                    marginBottom: 0.5,
                                                },
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: currentTab?.key === 'fmp' && article?.content 
                                                    ? article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '')
                                                    : article?.content || article?.text || 'No content available'
                                            }}
                                        />

                                        {/* Footer */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 'auto',
                                            pt: 1.5,
                                            borderTop: `1px solid ${grey[800]}`,
                                        }}>
                                            <Box>
                                                {article?.date && (
                                                    <Typography variant="caption" sx={{ color: grey[500] }}>
                                                        {new Date(article.date).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography variant="caption" sx={{ 
                                                color: teal[400], 
                                                fontWeight: 600,
                                                '&:hover': { color: teal[300] }
                                            }}>
                                                {currentTab?.key === 'fmp' ? 'Read →' : 'View →'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* No articles message */}
                {paginatedData.length === 0 && (
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            backgroundColor: '#1a1a1a',
                            borderRadius: 3,
                            border: `1px solid ${teal[800]}`,
                        }}
                    >
                        <FaNewspaper size={48} color={grey[600]} style={{ marginBottom: '16px' }} />
                        <Typography variant="h6" color={grey[400]} sx={{ mb: 1 }}>
                            No articles available
                        </Typography>
                        <Typography variant="body2" color={grey[500]}>
                            Check back later for the latest updates
                        </Typography>
                    </Box>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: grey[400],
                                    backgroundColor: '#1a1a1a',
                                    border: `1px solid ${teal[800]}`,
                                    '&.Mui-selected': {
                                        backgroundColor: teal[600],
                                        color: 'white',
                                        borderColor: teal[500],
                                    },
                                    '&:hover': {
                                        backgroundColor: teal[900],
                                        borderColor: teal[600],
                                        color: teal[300],
                                    },
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <>
            <Box sx={{ 
                display: "flex",
                height: "100vh",
                backgroundColor: darkBg, 
                color: "white", 
                overflow: "hidden",
            }}>
                {/* Left Sidebar */}
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
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { 
                            width: 240,
                            boxSizing: 'border-box',
                            background: darkGradient,
                        },
                    }}
                >
                    <DashboardSidebar onClose={handleDrawerToggle} />
                </Drawer>

                {/* Main Content Area */}
                <Box sx={{ 
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    minWidth: 0,
                }}>
                    <Box sx={{ 
                        flex: 1,
                        display: "flex",
                        overflow: "hidden",
                    }}>
                        <Box sx={{ 
                            flex: 1,
                            px: 0.5, 
                            py: 1,  
                            overflow: "auto",
                            display: "flex",
                            flexDirection: "column",
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none',
                            '-ms-overflow-style': 'none',
                        }}>
                            <Container maxWidth={false} sx={{ py: 3, flex: 1, display: 'flex', flexDirection: 'column', px: 1, maxWidth: '100%' }}>
                                {/* Mobile Header with Hamburger */}
                                {isSmallScreen && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <IconButton
                                            color="inherit"
                                            aria-label="open drawer"
                                            edge="start"
                                            onClick={handleDrawerToggle}
                                            sx={{ mr: 2, color: teal[400] }}
                                        >
                                            <FaBars />
                                        </IconButton>
                                        <Typography variant="h6" sx={{ color: teal[300], fontWeight: 600 }}>
                                            Financial News
                                        </Typography>
                                    </Box>
                                )}

                                {/* Page Header */}
                                <Box sx={{ mb: 3 }}>
                                    {!isSmallScreen && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <FaNewspaper style={{ color: teal[400], fontSize: '2rem' }} />
                                            <Typography 
                                                variant="h4" 
                                                sx={{ 
                                                    color: teal[300],
                                                    fontWeight: 700,
                                                    fontSize: '2.125rem'
                                                }}
                                            >
                                                Financial News Hub
                                            </Typography>
                                            <Button
                                                onClick={refreshAllNews}
                                                size="small"
                                                sx={{ 
                                                    color: teal[400],
                                                    ml: 'auto',
                                                    border: `1px solid ${teal[600]}`,
                                                    '&:hover': {
                                                        backgroundColor: teal[900],
                                                        borderColor: teal[500],
                                                    }
                                                }}
                                                startIcon={<FaRedo />}
                                                disabled={loading.fmpNews || loading.stockNews || 
                                                         loading.cryptoNews || loading.forexNews || loading.generalNews}
                                            >
                                                Refresh All
                                            </Button>
                                        </Box>
                                    )}
                                    
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: grey[400],
                                            lineHeight: 1.6,
                                            mb: 3,
                                            fontSize: isMobile ? '0.85rem' : '1rem'
                                        }}
                                    >
                                        Stay updated with the latest financial news across stocks, crypto, forex, and market insights.
                                    </Typography>
                                </Box>

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

                                {/* News Content */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {renderNewsContent()}
                                </Box>
                            </Container>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Article Content Modal */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                }}
            >
                <Paper
                    sx={{
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        borderRadius: 3,
                        border: `1px solid ${teal[700]}`,
                        position: 'relative',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#2a2a2a',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: teal[600],
                            borderRadius: '4px',
                        },
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            color: grey[400],
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: teal[300],
                            },
                            zIndex: 10,
                        }}
                    >
                        <FaTimes />
                    </IconButton>

                    {selectedArticle && (
                        <Box sx={{ p: 4 }}>
                            {/* Article Header */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        backgroundColor: teal[600],
                                        color: 'white',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    FMP News
                                </Typography>
                            </Box>

                            {/* Article Title */}
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '1.75rem',
                                    lineHeight: 1.3,
                                    mb: 3,
                                    color: teal[300],
                                }}
                            >
                                {selectedArticle.title}
                            </Typography>

                            {/* Article Meta */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 3,
                                mb: 4,
                                pb: 3,
                                borderBottom: `1px solid ${grey[700]}`,
                                fontSize: '0.85rem',
                                opacity: 0.8
                            }}>
                                {selectedArticle.author && (
                                    <Typography variant="body2">
                                        By {selectedArticle.author}
                                    </Typography>
                                )}
                                {selectedArticle.date && (
                                    <Typography variant="body2">
                                        {new Date(selectedArticle.date).toLocaleDateString()}
                                    </Typography>
                                )}
                                {selectedArticle.symbol && (
                                    <Typography variant="body2" sx={{ color: teal[300] }}>
                                        {selectedArticle.symbol}
                                    </Typography>
                                )}
                            </Box>

                            {/* Article Content */}
                            <Box
                                sx={{
                                    '& p': {
                                        marginBottom: 2,
                                        lineHeight: 1.7,
                                        fontSize: '1rem',
                                    },
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                        color: teal[300],
                                        marginTop: 3,
                                        marginBottom: 2,
                                    },
                                    '& a': {
                                        color: teal[400],
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    },
                                }}
                                dangerouslySetInnerHTML={{ 
                                    __html: selectedArticle.content || 'No content available' 
                                }}
                            />

                            {/* External Link Button */}
                            {(selectedArticle.link || selectedArticle.url) && (
                                <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${grey[700]}` }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            const url = selectedArticle.link || selectedArticle.url;
                                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                                        }}
                                        sx={{
                                            borderColor: teal[600],
                                            color: teal[300],
                                            '&:hover': {
                                                borderColor: teal[500],
                                                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                            },
                                        }}
                                        startIcon={<FaNewspaper />}
                                    >
                                        Read Original Article
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </Paper>
            </Modal>
        </>
    );
};

export default News;