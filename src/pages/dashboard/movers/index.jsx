import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container, Divider,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button,
    Grid
} from "@mui/material";
import { teal, grey, green, red } from "@mui/material/colors";
import { 
    FaBars, FaArrowUp, FaArrowDown, FaFire, FaRedo,
    FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMarketActivity } from "../../../hooks/useMarketActivity";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const MoversPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    const theme = useTheme();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Custom hooks
    const {
        biggestGainers,
        biggestLosers,
        mostTraded,
        loading,
        errors,
        refreshAllData
    } = useMarketActivity();

    // Tab configuration
    const tabs = [
        { label: 'Biggest Gainers', icon: <FaArrowUp />, key: 'gainers', data: biggestGainers },
        { label: 'Biggest Losers', icon: <FaArrowDown />, key: 'losers', data: biggestLosers },
        { label: 'Most Traded', icon: <FaFire />, key: 'traded', data: mostTraded },
    ];

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle stock selection (for potential future use)
    const handleSearch = async (ticker) => {
        if (!ticker) return;
        // Navigate back to dashboard with the selected stock
        navigate('/dashboard');
        // You could add additional logic here to set the stock in a global state
    };

    // Format price
    const formatPrice = (price) => {
        if (price < 1) {
            return `$${price.toFixed(4)}`;
        }
        return `$${price.toFixed(2)}`;
    };

    // Format percentage change
    const formatPercentage = (percentage) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage.toFixed(2)}%`;
    };

    // Get color for change
    const getChangeColor = (change) => {
        return change >= 0 ? green[400] : red[400];
    };

    const currentTab = tabs[activeTab];
    const currentData = currentTab?.data || [];
    const currentLoading = loading[currentTab?.key];
    const currentError = errors[currentTab?.key];

    // Stock item component (list style)
    const StockItem = ({ stock }) => (
        <Box
            sx={{
                backgroundColor: 'rgba(20, 184, 166, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: "5em",
                borderRadius: 2,
                transition: 'all 0.2s ease',
                // maxWidth: isMobile ? "100%" : "20em",
                cursor: 'pointer',
                p: 2,
                mb: 1,
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 2px rgba(3, 15, 14, 0.1)`,
                }
            }}
        >

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: "70%", textWrap: 'wrap' }}>
                <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="white"
                    sx={{ fontSize: '0.85rem' }}
                >
                    {stock.symbol}
                </Typography>
                 <Typography 
                variant="body2" 
                color={teal[300]}
                sx={{ 
                    fontSize: '0.85rem',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {stock.name}
            </Typography>
                {/* <Typography 
                    variant="caption" 
                    color={teal[400]}
                    sx={{ fontSize: '0.7rem' }}
                >
                    {stock.exchange}
                </Typography> */}
            </Box>
                
            <Box textAlign="right" sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: "70%" }}>
                <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="white"
                    sx={{ fontSize: '1rem' }}
                >
                    {formatPrice(stock.price)}
                </Typography>
                <Typography 
                    variant="body2" 
                    color={getChangeColor(stock.change)}
                    fontWeight="bold"
                    sx={{ fontSize: '0.9rem' }}
                >
                    {formatPercentage(stock.changesPercentage)}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: isSmallScreen 
                ? "1fr" 
                : "220px minmax(0, 1fr)",
            gridAutoFlow: "column",
            height: "100vh",
            backgroundColor: darkBg, 
            color: white, 
            background: darkGradient,
            overflow: "hidden"
        }}>
            {/* Sidebar - Hidden on mobile */}
            {!isSmallScreen && <DashboardSidebar />}
            
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
                {/* Mobile nav toggle - only visible on mobile */}
                {isSmallScreen && (
                    <Box px={2} pt={2}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ 
                                mb: 2, 
                                display: { md: 'none' },
                                color: teal[400],
                                '&:hover': { 
                                    backgroundColor: 'rgba(0, 128, 128, 0.1)',
                                }
                            }}
                        >
                            <FaBars />
                        </IconButton>
                    </Box>
                )}
                
                <Container maxWidth="xl" sx={{ mt: isSmallScreen ? 0 : 2, pb: 5 }}>
                    <Box mb={2}>
                        {/* Back Button */}
                        {/* <Button
                            onClick={() => navigate('/dashboard')}
                            startIcon={<FaArrowLeft />}
                            sx={{
                                color: teal[400],
                                textTransform: 'none',
                                mb: 2,
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                },
                            }}
                        >
                            Back to Dashboard
                        </Button> */}

                        <Typography 
                            variant="h4" 
                            fontWeight="bold" 
                            color={teal[400]} 
                            mb={1}
                            sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' } }}
                        >
                            Movers
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color={"#ffffff"} 
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Explore the most active stocks in today's market
                        </Typography> 
                        
                        {/* <Divider sx={{ bgcolor: teal[900], opacity: 0.5, my: 3 }} /> */}
                    </Box>

                    {/* Movers Tabs */}
                    <Box sx={{ mb: 4, borderBottom: `1px solid ${teal[800]}` }}>
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
                                    fontSize: isMobile ? '0.8rem' : '1rem',
                                    minWidth: isMobile ? 120 : 160,
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
                                    label={tab.label}
                                    sx={{
                                        '& .MuiTab-iconWrapper': {
                                            marginRight: 1,
                                        },
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    
                    {/* Market Data List */}      
                    {currentLoading ? (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="400px"
                            sx={{
                                backgroundColor: 'rgba(20, 30, 20, 0.3)',
                                borderRadius: '10px',
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
                                    onClick={refreshAllData}
                                    sx={{ color: teal[400] }}
                                    startIcon={<FaRedo />}
                                >
                                    Retry
                                </Button>
                            }
                        >
                            Failed to load {currentTab?.label.toLowerCase()}
                        </Alert>
                    ) : currentData && currentData.length > 0 ? (
                        <Box>
                            {currentData.map((stock, index) => (
                                <StockItem key={stock.symbol || index} stock={stock} />
                            ))}
                        </Box>
                    ) : (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="400px"
                            sx={{
                                backgroundColor: 'rgba(20, 30, 20, 0.3)',
                                borderRadius: '10px',
                                my: 4,
                                width: "100%"
                            }}
                        >
                            <Typography color={grey[400]}>
                                No {currentTab?.label.toLowerCase()} data available
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default MoversPage;
