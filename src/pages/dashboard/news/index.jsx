import { useEffect, useState } from "react";
import DashboardSidebar from "../../../components/DashboardSidebar";
import { 
    Box, Divider, Link, Typography, Container, Paper, Grid,
    useMediaQuery, useTheme, IconButton, Drawer , TextField, InputAdornment, Button
} from "@mui/material";
import { green, teal, grey } from "@mui/material/colors";
import { HiOutlineMenu } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const cardBg = 'rgba(20, 30, 20, 0.4)';
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

    const getStockNews = async (searchTerm) => {
        const url = `${API_URL}/tiingo/news?ticker=${searchTerm}`;
        try {
            const response = await fetch(url);
            if (response.status == 200){
                const result = await response.json();
                setSearchResults(result.data);
                console.log(result.data);
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
                    console.log(response.status, response.statusText, result.message);
                    return;
                }

                console.log(response.status, response.statusText, result.message, result);
                setMarketNews(result.data.slice(0, 100));

            } catch(error) {
                console.log(error);
            }
        }
        getNews();
    },[]);
    const [search, setSearch] = useState("");
    // ------------------ Search Functionality ------------------
    const handleSearch = () => {};

    //---------- hanle search on key down ----------
    const handleSearchOnEnter = (e) => {
        if (e.key === "Enter") {
        e.preventDefault(); 
        //handleSearch(e.target.value); 
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
            <Box sx={{ 
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
                            px={3}
                            sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' } }}
                        >
                            Market News
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color={grey[400]} 
                            px={3}
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Stay updated with the latest financial news and insights
                        </Typography> 
                        {/* Search Bar */}
                        <Box
                            component="form"
                            sx={{ display: "flex", 
                                alignItems: "center", 
                                gap: 0.5, 
                                mb: 2, 
                                mt: 0,
                                background: 'rgba(40, 60, 40, 0.8)',
                                borderRadius: '10px',
                                border: `2px solid ${green[500]}`,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                width: '100%',
                                alignSelf: 'flex-start',
                                height: '50px',
                                zIndex: 10, }}
                            noValidate
                            autoComplete="off"
                            >
                            <TextField fullWidth
                                placeholder="Search for a news..."
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                //onKeyDown={(e) => handleSearchOnEnter(e)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                    borderRadius: 0,
                                    '& fieldset': { border: 'none' }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: white,
                                        fontSize: '1rem',
                                        padding: '12px 16px',
                                        '&::placeholder': {
                                            color: grey[300],
                                            opacity: 1
                                        }
                                    },
                                    height: '100%',
                                    backgroundColor: 'transparent'
                                }}
                                InputProps={{
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch style={{ 
                                            color: teal[300], 
                                            fontSize: '16px' 
                                        }} />
                                    </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: green[700],
                                    color: white,
                                    px: 3,
                                    py: 1.6,
                                    borderRadius: 2,
                                    "&:hover": { 
                                    backgroundColor: green[600],
                                    transform: 'translateX(2px)'
                                    },
                                    textTransform: "none",
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => getStockNews(ticker)} // Example search term
                                >
                                Search
                            </Button>
                        </Box>                           
                        <Divider sx={{ bgcolor: green[900], opacity: 0.5 }} />
                    </Box>
                    
                    {/* News Articles */}      
                    {searchResults && searchResults.length > 0 ? (
                        <Box sx={{ maxWidth: "100%", mx: "auto" }}>
                            {searchResults.map((news, index) => (
                                <Paper 
                                    key={news.id || index}
                                    elevation={0}
                                    sx={{
                                        backgroundColor: 'transparent',
                                        borderBottom: `1px solid ${grey[900]}`,
                                        borderRadius: 0,
                                        transition: 'all 0.2s ease',
                                        width: "100%", // Full fixed width
                                        maxWidth: "100%", // Ensure it doesn't overflow container
                                        marginBottom: 0,
                                        '&:hover': {
                                            backgroundColor: 'rgba(20, 35, 20, 0.3)',
                                            '& .news-title': {
                                                color: teal[300],
                                            }
                                        }
                                    }}
                                >
                                    <Link 
                                        href={news?.url} 
                                        target="_blank" 
                                        underline="none" 
                                        color={white}
                                        sx={{ 
                                            display: 'block',
                                            width: "100%"
                                        }}
                                    >
                                        <Box 
                                            py={3} 
                                            px={{ xs: 2, sm: 3 }}
                                            sx={{
                                                width: "100%",
                                                boxSizing: "border-box"
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" mb={1} flexWrap="wrap">
                                                <Typography 
                                                    fontSize={{ xs: '0.75rem', sm: '0.85rem' }} 
                                                    sx={{ 
                                                        color: teal[400],
                                                        fontWeight: 500,
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {news?.source ? (news.source.charAt(0).toUpperCase() + news.source.slice(1)) : 'News Source'}
                                                </Typography>
                                                
                                                {news?.publishedDate && (
                                                    <Typography 
                                                        fontSize={{ xs: '0.7rem', sm: '0.75rem' }} 
                                                        color={grey[500]}
                                                    >
                                                        {formatDate(news.publishedDate)}
                                                    </Typography>
                                                )}
                                            </Box>
                                            
                                            <Typography 
                                                className="news-title"
                                                fontWeight="bold" 
                                                color={white}
                                                mb={1}
                                                sx={{ 
                                                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                                    transition: 'color 0.2s ease'
                                                }}
                                            >
                                                {news?.title}
                                            </Typography>
                                            
                                            <Typography 
                                                fontSize={{ xs: '0.8rem', sm: '0.9rem' }} 
                                                color={grey[400]}
                                                sx={{
                                                    lineHeight: 1.5,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {news?.description}
                                            </Typography>
                                        </Box>
                                    </Link>
                                </Paper>
                            ))}
                        </Box>
                    ) : marketNews && marketNews.length > 0 ? (
                        <Box sx={{ maxWidth: "100%", mx: "auto" }}>
                            {marketNews.map((news, index) => (
                                <Paper 
                                    key={news.id || index}
                                    elevation={0}
                                    sx={{
                                        backgroundColor: 'transparent',
                                        borderBottom: `1px solid ${grey[900]}`,
                                        borderRadius: 0,
                                        transition: 'all 0.2s ease',
                                        width: "100%", // Full fixed width
                                        maxWidth: "100%", // Ensure it doesn't overflow container
                                        marginBottom: 0,
                                        '&:hover': {
                                            backgroundColor: 'rgba(20, 35, 20, 0.3)',
                                            '& .news-title': {
                                                color: teal[300],
                                            }
                                        }
                                    }}
                                >
                                    <Link 
                                        href={news?.url} 
                                        target="_blank" 
                                        underline="none" 
                                        color={white}
                                        sx={{ 
                                            display: 'block',
                                            width: "100%"
                                        }}
                                    >
                                        <Box 
                                            py={3} 
                                            px={{ xs: 2, sm: 3 }}
                                            sx={{
                                                width: "100%",
                                                boxSizing: "border-box"
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" mb={1} flexWrap="wrap">
                                                <Typography 
                                                    fontSize={{ xs: '0.75rem', sm: '0.85rem' }} 
                                                    sx={{ 
                                                        color: teal[400],
                                                        fontWeight: 500,
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {news?.source ? (news.source.charAt(0).toUpperCase() + news.source.slice(1)) : 'News Source'}
                                                </Typography>
                                                
                                                {news?.publishedDate && (
                                                    <Typography 
                                                        fontSize={{ xs: '0.7rem', sm: '0.75rem' }} 
                                                        color={grey[500]}
                                                    >
                                                        {formatDate(news.publishedDate)}
                                                    </Typography>
                                                )}
                                            </Box>
                                            
                                            <Typography 
                                                className="news-title"
                                                fontWeight="bold" 
                                                color={white}
                                                mb={1}
                                                sx={{ 
                                                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                                    transition: 'color 0.2s ease'
                                                }}
                                            >
                                                {news?.title}
                                            </Typography>
                                            
                                            <Typography 
                                                fontSize={{ xs: '0.8rem', sm: '0.9rem' }} 
                                                color={grey[400]}
                                                sx={{
                                                    lineHeight: 1.5,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {news?.description}
                                            </Typography>
                                        </Box>
                                    </Link>
                                </Paper>
                            ))}
                        </Box>
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