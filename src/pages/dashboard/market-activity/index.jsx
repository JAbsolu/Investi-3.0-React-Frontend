import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container, Divider,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button,
    Paper, Card, CardContent, Grid
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

const MarketActivityPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    const theme = useTheme();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    // Stock item component
    const StockItem = ({ stock }) => (
        <Card
            sx={{
                backgroundColor: '#0cac990d',
                border: `1px solid ${grey[800]}`,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                    borderColor: teal[600],
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px rgba(20, 184, 166, 0.1)`,
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        color="white"
                    >
                        {stock.symbol}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color={grey[400]}
                        sx={{ 
                            backgroundColor: grey[800],
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        {stock.exchange}
                    </Typography>
                </Box>
                
                <Typography 
                    variant="body1" 
                    color={grey[300]}
                    sx={{ 
                        mb: 3,
                        fontSize: '0.95rem',
                        lineHeight: 1.4
                    }}
                >
                    {stock.name}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography 
                        variant="h4" 
                        fontWeight="bold" 
                        color="white"
                    >
                        {formatPrice(stock.price)}
                    </Typography>
                    <Box textAlign="right">
                        <Typography 
                            variant="h6" 
                            color={getChangeColor(stock.change)}
                            fontWeight="bold"
                        >
                            {formatPercentage(stock.changesPercentage)}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color={getChangeColor(stock.change)}
                        >
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
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
                
                <Container maxWidth="lg" sx={{ mt: isSmallScreen ? 0 : 4, pb: 5 }}>
                    <Box mb={4}>
                        {/* Back Button */}
                        <Button
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
                        </Button>

                        <Typography 
                            variant="h4" 
                            fontWeight="bold" 
                            color={white} 
                            mb={1}
                            sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' } }}
                        >
                            Market Activity
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color={grey[400]} 
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Explore the most active stocks in today's market
                        </Typography> 
                        
                        <Divider sx={{ bgcolor: teal[900], opacity: 0.5, my: 3 }} />
                    </Box>

                    {/* Market Activity Tabs */}
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
                    
                    {/* Market Data Grid */}      
                    {currentLoading ? (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="400px"
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
                        <Grid container spacing={3}>
                            {currentData.map((stock, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={stock.symbol || index}>
                                    <StockItem stock={stock} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="400px"
                            sx={{
                                backgroundColor: 'rgba(20, 30, 20, 0.3)',
                                borderRadius: '10px',
                                border: `1px solid ${teal[900]}`,
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

export default MarketActivityPage;
