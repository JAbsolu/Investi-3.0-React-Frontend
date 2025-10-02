import React, { useState, useEffect } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import StockDetailsModal from "../components/StockDetailsModal";
import { 
    Box, Typography, Container, Divider,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button,
    Avatar,
} from "@mui/material";
import { teal, grey, green, red, orange } from "@mui/material/colors";
import { 
    FaBars, FaArrowUp, FaArrowDown, FaFire, FaRedo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMarketActivity } from "../../../hooks/useMarketActivity";
import { useWishlist } from "../../../hooks/useWishlist";
import { useAuth } from "../../../hooks/useAuth";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const MoversPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedStock, setSelectedStock] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    
    const theme = useTheme();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Custom hooks
    const { user, userId } = useAuth();
    const {
        biggestGainers,
        biggestLosers,
        mostTraded,
        loading,
        errors,
        refreshAllData
    } = useMarketActivity();

    const { wishlist, addToWishlist, fetchWishlist } = useWishlist(userId);

    // Fetch wishlist when userId is available
    useEffect(() => {
        if (userId) {
            fetchWishlist();
        }
    }, [userId, fetchWishlist]);

    // Tab configuration
    const tabs = [
        { label: 'Biggest Gainers', icon: <FaArrowUp color={green[400]} />, key: 'gainers', data: biggestGainers },
        { label: 'Biggest Losers', icon: <FaArrowDown color={red[600]} />, key: 'losers', data: biggestLosers },
        { label: 'Most Traded', icon: <FaFire color={orange[600]} />, key: 'traded', data: mostTraded },
    ];

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle stock click
    const handleStockClick = (stock) => {
        setSelectedStock({
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: stock.price,
            change: stock.change,
            changesPercentage: stock.changesPercentage
        });
        setStockModalOpen(true);
    };

    const handleCloseStockModal = () => {
        setStockModalOpen(false);
        setSelectedStock(null);
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

     // Stock Logo Component
    const StockLogo = ({ ticker, size = 24 }) => {
        const [hasError, setHasError] = React.useState(false);

        const [imageSrc, setImageSrc] = React.useState(
              ticker?.symbol ? `https://images.financialmodelingprep.com/symbol/${ticker.symbol}.png` : ""
        );

        const handleImageError = () => {
            if (!hasError) {
                setHasError(true);
                setImageSrc("/investi_favicon2.png");
            }
        };
        return ticker?.symbol ? (
            <Avatar 
                src={imageSrc}
                onError={handleImageError}
                sx={{ 
                width: size, 
                height: size, 
                borderRadius: "50%",
                mr: 0.5,
                backgroundColor: 'transparent',
                padding: 0
                }}
            />
        ) : null;
    };

    // Stock item component (list style)
    const StockItem = ({ stock }) => (
        <Box
            onClick={() => handleStockClick(stock)}
            sx={{
                backgroundColor: 'transparent',
                border: `1px solid ${teal[600]}`,
                display: 'flex',
                justifyContent: 'start',
                gap: 4,
                alignItems: 'center',
                width: isSmallScreen ? '100%' : '75%',
                height: "7em",
                borderRadius: 2,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                pl: 2,
                pr: 4,
                mb: 2,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                }
            }}
        >
            <StockLogo ticker={stock} size={80}/>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: "70%", textWrap: 'wrap' }}>
                    <Typography 
                        variant="body1" 
                        color={"white"}
                        sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                    >
                        {stock.exchange}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color={teal[300]}
                        sx={{ 
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {stock.name}
                    </Typography>
                </Box>
                    
                <Box textAlign="left" sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: "70%" }}>
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
        </Box>
    );

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
                            // backgroundColor: darkBg,
                            background: '#000000',
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
                            color={teal[400]}
                            sx={{ fontSize: '1.2rem' }}
                        >
                            Movers
                        </Typography>
                    </Box>
                )}
                
                <Container maxWidth="xl" sx={{ mt: isSmallScreen ? 0 : 2, pb: 5 }}>
                    {!isSmallScreen && (<Box mb={2}>
                        {/* Desktop Title */}
                        {!isSmallScreen && (
                            <Typography 
                                variant="h4" 
                                fontWeight="bold" 
                                color={"white"} 
                                sx={{ fontSize: { xs: '1.6rem', sm: '1.8rem' } }}
                            >
                                Movers
                            </Typography>
                        )}
                        <Typography 
                            variant="body1" 
                            color={"#ffffff"} 
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Explore the most active stocks in today's market
                        </Typography> 
                        
                        {/* <Divider sx={{ bgcolor: teal[900], opacity: 0.5, my: 3 }} /> */}
                    </Box>
                    )}

                    {/* Movers Tabs */}
                    <Box sx={{ mb: 2, borderBottom: `1px solid ${teal[800]}` }}>
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
                                    fontSize: isMobile ? '0.8rem' : '.9rem',
                                    minWidth: isMobile ? 120 : 160,
                                    '&.Mui-selected': {
                                        color: teal[300],
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

            {/* Stock Details Modal */}
            {selectedStock && (
                <StockDetailsModal
                    open={stockModalOpen}
                    onClose={handleCloseStockModal}
                    stock={selectedStock}
                    wishlist={wishlist}
                    addToWishlist={addToWishlist}
                />
            )}
        </Box>
    );
};

export default MoversPage;
