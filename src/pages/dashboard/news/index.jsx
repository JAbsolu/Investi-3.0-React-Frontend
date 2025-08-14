import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Divider, Typography, Container,
    useMediaQuery, useTheme, IconButton, Drawer
} from "@mui/material";
import { green, teal, grey } from "@mui/material/colors";
import { HiOutlineMenu } from "react-icons/hi";
import SearchBar from "../components/SearchBar";
import SearchPagination from "../components/SearchPagination";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";
const API_URL = process.env.REACT_APP_API_URL;

const News = () => {
    const [marketNews, setMarketNews] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const [ticker, setTicker] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [newsStartIndex, setNewsStartIndex] = useState(0);
    const [newsEndIndex, setNewsEndIndex] = useState(10);

    const scrollToTop = () => {
        const scrollableElement = document.querySelector('[data-scrollable="true"]');
        if (scrollableElement) {
            scrollableElement.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const handleNext = () => {
        setNewsStartIndex( prev => prev += 10);
        setNewsEndIndex(prev => prev += 10);
        scrollToTop();
    }

    const handleBack = () => {
        if (newsEndIndex === 0) {
            setNewsStartIndex(0);
            setNewsEndIndex(10);
        }
        setNewsStartIndex( prev => prev -= 10);
        setNewsEndIndex(prev => prev -= 10);
        scrollToTop();
    }

    const getStockNews = async (searchTerm) => {
        const url = `${API_URL}/tiingo/news?ticker=${searchTerm}`;
        try {
            const response = await fetch(url);
            if (response.status == 200){
                const result = await response.json();
                setSearchResults(result.data);
                // console.log(result.data);
            }else{
                console.warn(`Error fetching news for ${searchTerm}:`, response.status, response.message);
            }
        }catch(error){
            console.error(`Error fetching news for ${searchTerm}:`, error);
        }
    }

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        // ------------------ Get News ------------------
        const getNews = async () => {
            const url = `${API_URL}/tiingo/market-news`
            try {
                const response = await fetch(url);
                const result = await response.json();

                if (!response.ok) {
                    // console.log(response.status, response.statusText, result.message);
                    return;
                }

                // console.log(response.status, response.statusText, result.message, result);
                setMarketNews(result.data.slice(0, 200));

            } catch(error) {
                // console.log(error);
                return;
            }
        }
        getNews();
    },[]);

    //---------- hanle search on key down ----------
    const handleSearchOnEnter = (e) => {
        if (e.key === "Enter") {
        e.preventDefault(); 
        getStockNews(e.target.value); 
        }
    };

    // Format published date
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

    return (
        <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: isSmallScreen 
                ? "1fr" 
                : isMediumScreen 
                    ? "220px 1fr" 
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
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        width: 240,
                        boxSizing: 'border-box',
                        background: darkGradient,
                        borderRight: `1px solid ${green[900]}`,
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
                        display: 'none' // Chrome, Safari, and newer versions of Edge
                    },
                    scrollbarWidth: 'none', // Firefox
                    '-ms-overflow-style': 'none', // IE and Edge legacy
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
                            <HiOutlineMenu />
                        </IconButton>
                    </Box>
                )}
                
                <Container maxWidth="lg" sx={{ mt: isSmallScreen ? 0 : 4, pb: 5 }}>
                    <Box mb={3}>
                        <Typography 
                            variant="h5" 
                            fontWeight="bold" 
                            color={white} 
                            mb={1}
                            px={1}
                            sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' } }}
                        >
                            Market News
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color={grey[400]} 
                            px={1}
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Stay updated with the latest financial news and insights
                        </Typography> 
                        {/* Search Bar */}
                        <SearchBar 
                            ticker={ticker}
                            handleSearchOnEnter={handleSearchOnEnter}
                            setTicker={setTicker}
                            placeholder="Search for news"
                        />                     
                        <Divider sx={{ bgcolor: green[900], opacity: 0.5 }} />
                    </Box>
                    
                    {/* News Articles */}      
                    {searchResults && searchResults.length > 0 ? (
                        <SearchPagination
                            searchResults={searchResults}
                            startingIndex={newsStartIndex}
                            endingIndex={newsEndIndex}
                            handleBack={handleBack}
                            handleNext={handleNext}
                        />
                    ) : marketNews && marketNews.length > 0 ? (
                        <SearchPagination
                            searchResults={marketNews}
                            startingIndex={newsStartIndex}
                            endingIndex={newsEndIndex}
                            handleBack={handleBack}
                            handleNext={handleNext}
                        />
                    ) : (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            minHeight="300px"
                            sx={{
                                backgroundColor: 'rgba(20, 30, 20, 0.3)',
                                borderRadius: '10px',
                                border: `1px solid ${green[900]}`,
                                my: 4,
                                width: "100%"
                            }}
                        >
                            <Typography color={grey[400]}>
                                Loading news...
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default News;