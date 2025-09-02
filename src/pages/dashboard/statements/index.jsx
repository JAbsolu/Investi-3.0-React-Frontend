import React, { useState, useEffect } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container, Divider,
    useMediaQuery, useTheme, IconButton, Drawer,
    Tabs, Tab, CircularProgress, Alert, Button,
    TextField, InputAdornment
} from "@mui/material";
import { teal, grey, green, red } from "@mui/material/colors";
import { 
    FaBars, FaFileInvoiceDollar, FaChartLine, FaMoneyBillWave,
    FaArrowLeft, FaRedo, FaSearch
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useFinancialStatements } from "../../../hooks/useFinancialStatements";
import IncomeStatementView from "./components/IncomeStatementView";
import BalanceSheetView from "./components/BalanceSheetView";
import CashFlowView from "./components/CashFlowView";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const StatementsPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [ticker, setTicker] = useState("AAPL");
    const [searchInput, setSearchInput] = useState("AAPL");
    
    const theme = useTheme();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        data,
        loading,
        errors,
        fetchFinancialStatements,
        refreshAllData
    } = useFinancialStatements();

    // Tab configuration
    const tabs = [
        { 
            label: 'Income Statement', 
            icon: <FaFileInvoiceDollar />, 
            key: 'incomeStatement',
            component: IncomeStatementView 
        },
        { 
            label: 'Balance Sheet', 
            icon: <FaChartLine />, 
            key: 'balanceSheet',
            component: BalanceSheetView 
        },
        { 
            label: 'Cash Flow', 
            icon: <FaMoneyBillWave />, 
            key: 'cashFlow',
            component: CashFlowView 
        },
    ];

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle search
    const handleSearch = () => {
        if (searchInput.trim()) {
            setTicker(searchInput.trim().toUpperCase());
        }
    };

    const handleSearchOnEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const currentTab = tabs[activeTab];
    const currentData = data[currentTab?.key] || [];
    const currentLoading = loading[currentTab?.key];
    const currentError = errors[currentTab?.key];

    // Effects
    useEffect(() => {
        if (ticker) {
            fetchFinancialStatements(ticker);
        }
    }, [ticker, fetchFinancialStatements]);

    const CurrentComponent = currentTab?.component;

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
                
                <Container maxWidth="xl" sx={{ mt: isSmallScreen ? 0 : 4, pb: 5 }}>
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
                            color={teal[400]} 
                            mb={1}
                            sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' } }}
                        >
                            Financial Statements
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color={white} 
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Comprehensive financial data and analysis
                        </Typography> 

                        {/* Search Bar */}
                        <Box sx={{ mb: 3, maxWidth: 400 }}>
                            <TextField
                                fullWidth
                                placeholder="Enter ticker symbol (e.g., AAPL)"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                                onKeyPress={handleSearchOnEnter}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaSearch color={teal[400]} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                onClick={handleSearch}
                                                sx={{
                                                    color: teal[400],
                                                    minWidth: 'auto',
                                                    px: 1,
                                                }}
                                            >
                                                Search
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(20, 184, 166, 0.05)',
                                        color: white,
                                        '& fieldset': {
                                            borderColor: teal[800],
                                        },
                                        '&:hover fieldset': {
                                            borderColor: teal[600],
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: teal[400],
                                        },
                                    },
                                }}
                            />
                        </Box>
                        
                        <Divider sx={{ bgcolor: teal[900], opacity: 0.5, my: 3 }} />
                    </Box>

                    {/* Current Ticker Display */}
                    {ticker && (
                        <Box sx={{ mb: 3 }}>
                            <Typography 
                                variant="h6" 
                                color={teal[300]}
                                sx={{ fontSize: '1.1rem' }}
                            >
                                Showing data for: <strong>{ticker}</strong>
                            </Typography>
                        </Box>
                    )}

                    {/* Financial Statement Tabs */}
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
                    
                    {/* Financial Statement Content */}      
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
                                    onClick={() => refreshAllData(ticker)}
                                    sx={{ color: teal[400] }}
                                    startIcon={<FaRedo />}
                                >
                                    Retry
                                </Button>
                            }
                        >
                            Failed to load {currentTab?.label.toLowerCase()}: {currentError}
                        </Alert>
                    ) : currentData && currentData.length > 0 ? (
                        <CurrentComponent data={currentData} />
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
                                No {currentTab?.label.toLowerCase()} data available for {ticker}
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default StatementsPage;
