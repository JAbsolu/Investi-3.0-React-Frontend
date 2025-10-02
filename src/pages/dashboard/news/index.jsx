import { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button
} from "@mui/material";
import { teal, grey } from "@mui/material/colors";
import { 
    FaBars, FaNewspaper, FaChartLine, FaBitcoin, 
    FaExchangeAlt, FaGlobe, FaRedo, FaAngleLeft, FaAngleRight
} from "react-icons/fa";
import { useNewsData } from "../../../hooks/useNewsData";
import NewsSearchControls from "./components/NewsSearchControls";
import NewsLayout from "./components/NewsLayout";

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
    const [newsEndIndex, setNewsEndIndex] = useState(8);
    
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
        { label: 'Market News', icon: <FaGlobe />, key: 'general', data: generalNews },
        { label: 'Stock News', icon: <FaChartLine />, key: 'stock', data: stockNews },
        { label: 'Crypto News', icon: <FaBitcoin />, key: 'crypto', data: cryptoNews },
        { label: 'Forex News', icon: <FaExchangeAlt />, key: 'forex', data: forexNews },
        { label: 'More News', icon: <FaNewspaper />, key: 'fmp', data: fmpNews },
    ];

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setNewsStartIndex(0);
        setNewsEndIndex(8);
        
        if (searchActive) {
            handleClearSearch();
        }
    };

    // Handle search
    const handleSearch = async (query) => {
        setSearchActive(true);
        setNewsStartIndex(0);
        setNewsEndIndex(8);
        await searchNewsByTicker(query);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchActive(false);
        setSearchQuery('');
        setNewsStartIndex(0);
        setNewsEndIndex(8);
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
        setNewsStartIndex(prev => prev + 8);
        setNewsEndIndex(prev => prev + 8);
        scrollToTop();
    };

    const handleBack = () => {
        if (newsStartIndex >= 8) {
            setNewsStartIndex(prev => prev - 8);
            setNewsEndIndex(prev => prev - 8);
            scrollToTop();
        }
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
                    '&::-webkit-scrollbar': { 
                        display: 'none'
                    },
                    scrollbarWidth: 'none',
                    '-ms-overflow-style': 'none',
                }}>
                {/* Sticky Mobile Header */}
                {isSmallScreen && (
                    <Box 
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1100,
                            backgroundColor: darkBg,
                            borderBottom: `1px solid ${grey[800]}`,
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
                            fontWeight="600" 
                            color={white}
                            sx={{ fontSize: '1.3rem' }}
                        >
                            Discover
                        </Typography>
                    </Box>
                )}
                
                <Container maxWidth="xl" sx={{ mt: isSmallScreen ? 0 : 2, pb: 5 }}>
                    {/* Compact Header Section */}
                    <Box mb={1}>
                        {!isSmallScreen && (
                            <Box display="flex" alignItems="center" justifyContent="start" gap={4} mb={2}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight="600" 
                                    color={white}
                                >
                                    Discover
                                </Typography>
                                
                                {/* Compact Search */}
                                <NewsSearchControls
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    onSearch={handleSearch}
                                    onClear={handleClearSearch}
                                    loading={loading.search}
                                    searchActive={searchActive}
                                    resultsCount={searchResults.length}
                                />
                            </Box>
                        )}
                        
                        {/* Mobile Search - appears below header */}
                        {isSmallScreen && (
                            <Box px={2} py={2}>
                                <NewsSearchControls
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    onSearch={handleSearch}
                                    onClear={handleClearSearch}
                                    loading={loading.search}
                                    searchActive={searchActive}
                                    resultsCount={searchResults.length}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Compact Tabs */}
                    <Box sx={{ mb: 3, borderBottom: `1px solid ${grey[800]}` }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant={isMobile ? "scrollable" : "standard"}
                            scrollButtons={isMobile ? "auto" : false}
                            allowScrollButtonsMobile
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': {
                                    color: grey[500],
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                    minHeight: 40,
                                    minWidth: isMobile ? 90 : 110,
                                    py: 1,
                                    '&.Mui-selected': {
                                        color: teal[400],
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: teal[500],
                                    height: 2,
                                },
                                '& .MuiTabs-scrollButtons': {
                                    color: teal[400],
                                },
                            }}
                        >
                            {tabs.map((tab) => (
                                <Tab
                                    key={tab.key}
                                    icon={tab.icon}
                                    iconPosition="start"
                                    label={isMobile ? tab.label.split(' ')[0] : tab.label}
                                    sx={{
                                        '& .MuiTab-iconWrapper': {
                                            marginRight: 0.5,
                                            fontSize: '0.9rem',
                                        },
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    
                    {/* News Content */}      
                    {currentLoading ? (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="400px"
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
                            {/* News Layout Component */}
                            <NewsLayout newsData={currentData.slice(newsStartIndex, newsEndIndex)} />
                            {/* Pagination */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 5,
                                    alignItems: "center",
                                    px: { xs: 1, sm: 2 }
                                }}
                            >
                                <Button
                                    startIcon={<FaAngleLeft />}
                                    onClick={handleBack}
                                    disabled={newsStartIndex < 1}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        color: teal[400],
                                        '&:disabled': {
                                            color: grey[600]
                                        }
                                    }}
                                >
                                    Back
                                </Button>
                                <Typography sx={{ color: grey[400], fontSize:"0.8rem" }}>
                                    {newsStartIndex + 1}-{Math.min(newsEndIndex, currentData.length)} of {currentData.length}
                                </Typography>
                                <Button
                                    endIcon={<FaAngleRight />}
                                    onClick={handleNext}
                                    disabled={newsEndIndex >= currentData.length}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
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
                            minHeight="400px"
                        >
                            <Typography color={grey[400]} fontSize="0.9rem">
                                {searchActive ? `No news found for "${searchQuery}"` : 'No news available'}
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default News;