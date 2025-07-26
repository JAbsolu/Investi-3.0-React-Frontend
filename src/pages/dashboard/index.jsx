import { useEffect, useState } from "react";
import { 
  Box, Button, TextField, Typography, Grid, Paper, 
  Divider, Link, InputAdornment, useMediaQuery, useTheme,
  IconButton, Drawer, Fab
} from "@mui/material";
import { FaSearch, FaRegCommentDots, FaChartLine, FaTimes, FaList } from "react-icons/fa";
import { IoAnalyticsSharp } from "react-icons/io5";
import { HiOutlineMenu } from "react-icons/hi"; // Add this import for the hamburger icon
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { red, green, blue, lightBlue, cyan, teal, lightGreen, grey } from '@mui/material/colors';
import { ref, set, get, child } from "firebase/database";
import { database } from "../../firebaseConfig";
import DashboardSidebar from "../../components/DashboardSidebar";
import { onAuthStateChanged } from "firebase/auth";
import WishlistWIdget from "../../components/WishlistWidget";
import StockChart from "../../components/stockChart";
import StockAnalysisModal from "../../components/AnalysisModal";
import { getCurrentDate, isStockMarketOpen } from "../../util/apis";
import { AutoAwesome, List } from '@mui/icons-material';

// ------------------ Color Variables ------------------
const darkGray = "#121212";
const white = "#ffffff";
const darkBg = "#0d0d0d";
const black = "#000000";
const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';

export default function DashboardPage() {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add state for mobile sidebar drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Handle toggle drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Add state for mobile wishlist drawer
  const [mobileWishlistOpen, setMobileWishlistOpen] = useState(false);

  // ------------------ State ------------------
  const [stock, setStock] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [stockData, setStockData] = useState([]);
  const [stockMetaData, setStockMetaData] = useState([]);
  const [isBullish, setIsBullish] = useState(true);
  const [companyMetadata, setCompanyMetadata] = useState([]);
  const [stockNews, setStockNews] = useState([]);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [wishlist, setWishlist] = useState(null);
  const [candleSticksData, setCandleSticksData] = useState([]);
  const [openAnalysisModal, setOpenAnalysisModal] = useState(false);
  const [aiAnalysis, setAiAnalysy] = useState([]);

  // ------------------ use navigate  ------------------
  const navigate = useNavigate();
  
  //-------- get date from 1 year ago -------------
  const getDate365DaysAgo = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 365);
  
    // Format to YYYY-MM-DD
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  
  //-------------- get candlesticks -------------
  const getCandleSticks = async(ticker, startDate) => {
    const url = `${API_URL}/tiingo/candlestics?ticker=${ticker}&startDate=${startDate}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      console.log("Status", response.status, result.message);
      return;
    }

    setCandleSticksData(result.data);
    console.log("status", response.status, result.message);
  }

  // ------------------ Search ------------------
  const handleSearch = async (ticker) => {
    //write save last searched stock
    if (!ticker) {
      console.log("no user id found");
      return;
    }
    
    /**
     * call get stock data, if we get stock data
     */
    getStockData(ticker); 
    getCandleSticks(ticker, getDate365DaysAgo());
    getCompanyMetadata(ticker);
    getNews(ticker)
    setCurrentStock(ticker);
    setStock(""); 
  };

  //---------- hanle search on key down ----------
  const handleSearchOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // optional: prevents default form submission
      handleSearch(e.target.value); 
    }
  };
  
  // -------------------- save last search ------------------
  const saveLastSearch = async (userId, stock) => {
    try {
      await set(ref(database, `lastSearch/${userId}`), stock)
    } catch (error) {
      console.log(error);
    }
  }

  // --------------------- add to wishlist ------------------------
  const addToWishlist = async () => {
    if (!userId || !currentStock) console.log("userid not found", "current stock not found", currentStock)

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);
  
      let currentWishlist = [];
  
      if (snapshot.exists()) {
        currentWishlist = snapshot.val();
      }
  
      // Prevent duplicates
      if (!currentWishlist.includes(currentStock)) {
        const updatedWishlist = [...currentWishlist, currentStock.toUpperCase()];
        await set(wishlistRef, updatedWishlist);
        console.log("Stock added to wishlist!");
        fetchWishlist();
      } else {
        console.log("Stock already in wishlist");
      }
  
    } catch (error) {
      console.log("Error saving to wishlist:", error.message || "");
    }
  }

  // -------------- get wishlist ----------------------
  const fetchWishlist = async () => {
    if (!userId) return;

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);

      if (snapshot.exists()) {
        setWishlist(snapshot.val()); // should be an array like ["AAPL", "TSLA"]
        console.log("Wishlist loaded:", snapshot.val());
      } else {
        console.log("No wishlist found");
        setWishlist([]); // Optional: reset to empty array if not found
      }
    } catch (error) {
      console.log("Error fetching wishlist:", error.message || "");
    }
  };

  //------------- remove from wishlish -------------
  const removeFromWishlist = async (tickerToRemove) => {
    if (!userId) return;
  
    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);
  
      if (snapshot.exists()) {
        const currentWishlist = snapshot.val();
        const updatedWishlist = currentWishlist.filter((ticker) => ticker !== tickerToRemove);
  
        await set(wishlistRef, updatedWishlist);
        setWishlist(updatedWishlist); // update local state
        console.log(`${tickerToRemove} removed from wishlist`);
        fetchWishlist() // update client
      }
    } catch (error) {
      console.log("Error removing stock from wishlist:", error.message || "");
    }
  };
  
  // ------------------ Company Metadata ------------------
  const getCompanyMetadata = async (ticker) => {
    if (!ticker) return;
    
    try {
      const response = await fetch(`${API_URL}/tiingo/company-metadata?ticker=${ticker}`);
      const result = await response.json();

      if (!response.ok){
        console.log("Status:", response.status, response.statusText);
        window.location.reload();
        return;
      }

      console.log("Status:", response.status, response.statusText, result.message);
      setCompanyMetadata(result.data);

    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  // ------------------ Stock Data ------------------
  const getStockData = async (ticker) => {
    // console.log("Getting stock data for ticker:", ticker);
    if (!ticker) {
      // console.log("No ticker provided, ticker is", ticker);
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/yf/stockdata?ticker=${ticker}`);
      const result = await response.json();
  
      if (!response.ok) {
        console.log(response.status, response.statusText, result.message);
        return;
      }
      
      // Check if we have valid stock data in the response
      if (result?.data?.body && result.data.body.length > 0) {
        const stockDataResult = result.data.body[0];
        
        // Set the stock data in state
        setStockData(stockDataResult);
        
        // Only save the last search if we have valid stock data
        if (userId && stockDataResult.regularMarketPrice !== undefined) {
          // console.log("Valid stock data received, saving last search:", ticker);
          saveLastSearch(userId, ticker);
        }
        
        console.log("Stock data successfully loaded:", response.status, response.statusText);
      } else {
        console.log("No valid stock data in response");
      }
    } catch (error) {
      console.log("Error fetching stock data:", error.message || "");
    }
  };

  // ------------------ Number Formatter ------------------
  const formatNumber = n => {
    if (n >= 1e12) return (n / 1e12).toFixed(n % 1e12 === 0 ? 0 : 1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
    return n.toLocaleString();
  };

  // ------------------ Get News ------------------
  const getNews = async (ticker) => {
    const url = ticker ? `${API_URL}/tiingo/news?ticker=${ticker}` 
                : `${API_URL}/tiingo/news`
    try {
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        console.log(response.status, response.statusText, result.message);
      }

      console.log(response.status, response.statusText, result.message);
      setStockNews(result.data);

    } catch (error) {
      console.log(error);
    }
  }

  //----------------- perform analysis with global cache ----------------
const getAiAnalysis = async (ticker) => {
  if (!ticker) return;
  
  setOpenAnalysisModal(true);
  
  try {
    // Standardize ticker to uppercase for consistent keys
    const standardizedTicker = ticker.toUpperCase();
    
    // Check Firebase for cached analysis
    console.log(`Checking global cache for ${standardizedTicker} analysis...`);
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `stockAnalyses/${standardizedTicker}`));
    
    if (snapshot.exists()) {
      const cachedAnalysis = snapshot.val();
      const analysisDate = new Date(cachedAnalysis.timestamp);
      const now = new Date();
      
      // Calculate difference in days
      const diffTime = Math.abs(now - analysisDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If analysis is less than 3 days old, use it
      if (diffDays < 3) {
        console.log(`Using cached analysis for ${standardizedTicker} from ${analysisDate.toLocaleString()} (${diffDays} days old)`);
        
        // Set the cached analysis data to state
        setAiAnalysy(cachedAnalysis.analysis);
        return;
      } else {
        console.log(`Cached analysis for ${standardizedTicker} is ${diffDays} days old. Getting fresh analysis.`);
      }
    } else {
      console.log(`No cached analysis found for ${standardizedTicker}. Performing new analysis.`);
    }
    
    // If we got here, we need a fresh analysis
    const deepSeekUrl = `${API_URL}/deepseek-analysis?ticker=${standardizedTicker}`;
    const openAiURL = `${API_URL}/analysis?ticker=${standardizedTicker}`;
    
    const response = await fetch(openAiURL);
    const result = await response.json();
    
    if (!response.ok) {
      console.log(response.status, result.message);
      return;
    }
    
    // Get analysis data from API response
    const analysisData = result.data;
    setAiAnalysy(analysisData);
    
    // Save new analysis to Firebase
    await saveAnalysisToCache(standardizedTicker, analysisData);
    
    console.log(`Fresh analysis for ${standardizedTicker} completed and cached.`);
  } catch (error) {
    console.log("Error in AI Analysis:", error.message || "");
  }
};

// Helper function to save analysis to Firebase cache
const saveAnalysisToCache = async (ticker, analysisData) => {
  try {
    const dbRef = ref(database, `stockAnalyses/${ticker}`);
    await set(dbRef, {
      analysis: analysisData,
      timestamp: new Date().toISOString(),
      ticker: ticker
    });
    console.log(`Analysis for ${ticker} saved to global cache!`);
    return true;
  } catch (error) {
    console.log("Error saving analysis to Firebase:", error.message || "");
    return false;
  }
};

//----------------- useEffects ------------------

  //get candlesticks live
  useEffect(() => {

    const startDate = getDate365DaysAgo();

    // Fetch immediately if market is open
    if (isStockMarketOpen()) {
      getCandleSticks(currentStock, startDate);
    }

    const interval = setInterval(() => {
      if (isStockMarketOpen()) {
        getCandleSticks(currentStock, startDate);
      }
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, [currentStock]);

  //get user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);
      }
    });
  
    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const startDate = getDate365DaysAgo();

    const fetchLastSearch = async () => {
      if (!userId) return;
  
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `/lastSearch/${userId}`));
  
        if (snapshot.exists()) {
          const ticker = snapshot.val();
          console.log("Found last search:", ticker);
          setCurrentStock(ticker);
          getCandleSticks(ticker, startDate);
          getStockData(ticker);
          getNews(ticker);
          getCompanyMetadata(ticker);
        } else {
          console.log("No last search found, defaulting to AAPL");
          getCandleSticks("AAPL", startDate);
          getStockData("AAPL");
          getNews("AAPL");
          getCompanyMetadata("AAPL");
        }
      } catch (error) {
        console.log("Error getting data:", error.message || "");
        // Fallback to default ticker on error
        console.log("Error occurred, defaulting to AAPL");
        const ticker = "AAPL";
        setCurrentStock(ticker);
        getCandleSticks(ticker, startDate);
        getStockData(ticker);
        getNews(ticker);
        getCompanyMetadata(ticker);
      }
    };
  
    fetchLastSearch();
  }, [userId]); 

  //------------- get wishlist -----------------
  useEffect(() => {  
    fetchWishlist();
  }, [userId]);
  
  // ------------------ JSX ------------------
  return (
    <Box sx={{ 
      display: "flex",
      height: "100vh",
      backgroundColor: darkBg, 
      color: "white", 
      background: 'linear-gradient(to bottom, #121212, #0d0d0d)',
      overflow: "hidden",
    }}>

      {/* Left Sidebar - Fixed width */}
      {!isSmallScreen && (
        <Box sx={{ 
          width: "240px", 
          flexShrink: 0,
          borderRight: `1px solid ${green[900]}`,
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
            background: darkGradient || 'linear-gradient(to bottom, #121212, #0d0d0d)',
            borderRight: `1px solid ${green[900]}`,
          },
        }}
      >
        <DashboardSidebar onClose={handleDrawerToggle} />
      </Drawer>

      {/* Main Content Area - Flexible width */}
      <Box sx={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}>
        
        {/* Main Content Container */}
        <Box sx={{ 
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}>
          
          {/* Central Content Area */}
          <Box sx={{ 
            flex: 1,
            px: { xs: 1, sm: 2, md: 3 }, 
            py: { xs: 1, sm: 2, md: 2 },  
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
          }}>
        
        {/* Mobile Navigation & Search - Combined in one line */}
        {isSmallScreen && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
            px: 1 // Small horizontal padding to prevent edge touching
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                color: teal[400],
                p: 1,
                '&:hover': { backgroundColor: 'rgba(0, 128, 128, 0.1)' }
              }}
            >
              <HiOutlineMenu />
            </IconButton>
            
            {/* Search Bar - Mobile Optimized */}
            <Box sx={{ 
              display: "flex", 
              flexGrow: 1,
              alignItems: "center",
              background: 'rgba(20, 30, 20, 0.3)',
              borderRadius: '8px',
              border: `1px solid ${grey[900]}`,
              overflow: 'hidden',
              height: '38px',
            }}>
              <TextField
                fullWidth
                placeholder="Search stock..."
                value={stock}
                onChange={(e) => setStock(e.target.value?.trim())}
                onKeyDown={(e) => handleSearchOnEnter(e)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '& fieldset': { border: 'none' }
                  },
                  '& .MuiInputBase-input': {
                    color: grey[100],
                    fontSize: '0.85rem',
                    padding: '6px 8px',
                    height: '18px',
                    '&::placeholder': {
                      color: grey[500],
                      opacity: 1
                    }
                  },
                  backgroundColor: 'transparent'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch style={{ color: teal[300], fontSize: '14px' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton
                size="small"
                sx={{
                  color: white,
                  backgroundColor: green[700],
                  borderRadius: 0,
                  height: '100%',
                  width: '38px',
                  '&:hover': { backgroundColor: green[600] },
                  padding: 0,
                }}
                onClick={() => handleSearch(stock)}
              >
                <FaSearch size={14} />
              </IconButton>
            </Box>
          </Box>
        )}
        
        {/* Desktop search bar */}
        {!isSmallScreen && (
          <Box sx={{ 
            display: "flex", 
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
            zIndex: 10,
          }}>
            <TextField
              fullWidth
              placeholder="Search for a stock (e.g., TSLA, AAPL)"
              value={stock}
              onChange={(e) => setStock(e.target.value?.trim())}
              onKeyDown={(e) => handleSearchOnEnter(e)}
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
              onClick={() => handleSearch(stock)}
            >
              Search
            </Button>
          </Box>
        )}
        
        <Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            gap: 2
          }}>

            {/* Stock Chart */}
            <Box sx={{ width: '100%' }}>
              <Paper sx={{ 
                py: 3, 
                px: isSmallScreen ? 0.7 : 1.5, 
                backgroundColor: 'rgba(20, 30, 20, 0.4)', 
                minHeight: "26em", 
                borderRadius: 2,
                mb: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                {/* Action buttons - Full width container on mobile */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: isSmallScreen ? "space-between" : "end",
                  gap: isSmallScreen ? 1 : 1.5, 
                  mb: 2,
                  width: "100%", // Full width container
                }}>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesome />}
                    sx={{ 
                      color: 'white', 
                      backgroundColor: teal[700],
                      textTransform: "none", 
                      borderRadius: '10px',
                      px: isSmallScreen ? 1.2 : 2.5, // Smaller padding on mobile
                      fontSize: isSmallScreen ? '0.8rem' : 'inherit',
                      flexGrow: isSmallScreen ? 1 : 0, // Take full width on mobile
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: teal[600],
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 12px rgba(0,128,128,0.3)`
                      }
                    }}
                    onClick={() => {
                      setOpenAnalysisModal(true);
                      getAiAnalysis(currentStock)
                    }}
                  >
                    AI Analysis 
                  </Button>
                  <Button
                    startIcon={<List/>}
                    variant="outlined"
                    sx={{ 
                      color: grey[200], 
                      borderColor: green[900], 
                      borderRadius: '10px',
                      textTransform: "none",
                      px: isSmallScreen ? 1 : 2,
                      fontSize: isSmallScreen ? '0.8rem' : 'inherit',
                      flexGrow: isSmallScreen ? 1 : 0, // Take full width on mobile
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: green[700],
                        backgroundColor: 'rgba(0, 128, 0, 0.1)',
                        transform: 'translateX(3px)'
                      }
                    }}
                    onClick={addToWishlist}
                  >
                    Add to List
                  </Button>
                </Box>
                
                {stockData?.regularMarketPrice !== undefined && stockData?.regularMarketChange !== undefined && stockData?.regularMarketChangePercent !== undefined ? (
                  <Box sx={{ width: '100%' }}> {/* Full width container for chart */}
                    <StockChart 
                      data={candleSticksData} 
                      companyName={stockData?.shortName} 
                      exchangeCode={companyMetadata?.exchangeCode} 
                      price={stockData?.regularMarketPrice}
                      marketPriceChange={`${stockData.regularMarketChange.toFixed(2)} (${stockData.regularMarketChangePercent.toFixed(2)}%) Today`}
                    />
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%'
                  }}>
                    <FaChartLine size={40} style={{ color: teal[400], opacity: 0.7 }} />
                    <Typography variant="body1" color={grey[400]} sx={{ fontStyle: 'italic' }}>
                      Search for a stock to view its chart
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Company Profile */}
            <Paper sx={{ 
              px: 3, 
              py: 3, 
              backgroundColor: 'rgba(20, 30, 20, 0.4)',
              maxWidth: '100%',
              minHeight: "26em", 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <Typography color={teal[300]} fontWeight="bold" variant="h6" sx={{ mb: 1 }}>
                Company Profile
              </Typography>

              {companyMetadata?.description ? (
                <Typography mt={1} variant="body2" color={grey[300]} sx={{ lineHeight: 1.7, letterSpacing: 0.3 }}>
                  {companyMetadata.description}
                </Typography>
              ) : (
                <Typography variant="body2" color={grey[500]} sx={{ fontStyle: 'italic' }}>
                  Search a stock to get company profile
                </Typography>
              )}
            
              {/* Stock key statistics */}
              <Box container spacing={2} mt={3} color={grey[300]}>
                <Box 
                  display="flex" 
                  flexWrap="wrap" 
                  columnGap={6} 
                  rowGap={3}
                  sx={{
                    background: 'rgba(0, 30, 0, 0.3)',
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${green[900]}`,
                  }}
                >
                  <Typography variant="body2"><strong>Market cap</strong> <br/> {stockData?.marketCap ? formatNumber(stockData.marketCap) : "—"}</Typography>
                  <Typography variant="body2"><strong>Dividend yield</strong> <br/> {stockData?.dividendYield ? `${stockData?.dividendYield}%` : "—"}</Typography>
                  <Typography variant="body2"><strong>Average 10D volume</strong> <br/> {stockData?.averageDailyVolume10Day ? formatNumber(stockData.averageDailyVolume10Day) : "—" }</Typography>
                  <Typography variant="body2"><strong>Volume</strong> <br/> {stockData?.regularMarketVolume ? formatNumber(stockData.regularMarketVolume) : "—" }</Typography>
                  <Typography variant="body2"><strong>Today High</strong> <br/> {stockData?.regularMarketDayHigh ? stockData.regularMarketDayHigh.toFixed(2) : "—" }</Typography>
                  <Typography variant="body2"><strong>Today Low</strong> <br/> {stockData?.regularMarketDayLow ? stockData.regularMarketDayLow.toFixed(2) : "—"}</Typography>
                  <Typography variant="body2"><strong>Open Price</strong> <br/> {stockData?.regularMarketOpen || "—"}</Typography>
                  <Typography variant="body2"><strong>Market Price</strong> <br/> {stockData?.regularMarketPrice || "—"}</Typography>
                  <Typography variant="body2"><strong>52 Week low</strong> <br/> {stockData?.fiftyTwoWeekLow || "—"}</Typography>
                  <Typography variant="body2"><strong>52 Week high</strong> <br/> {stockData?.fiftyTwoWeekHigh || "—"}</Typography>
                  <Typography variant="body2"><strong>52 Week range</strong> <br/> {stockData?.fiftyTwoWeekRange || "—"}</Typography>
                </Box>

                <Box mt={5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" color={teal[300]}>
                      Recent News
                    </Typography>
                    <Button 
                      size="small" 
                      variant="text" 
                      sx={{ 
                        color: green[400], 
                        textTransform: 'none',
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 128, 0, 0.1)',
                          color: green[300]
                        }
                      }}
                    >
                      View all news
                    </Button>
                  </Box>
                
                  <Divider sx={{ my: 2, bgcolor: green[900], opacity: 0.7 }} />
                  
                  { stockNews?.length > 0 ? (
                    stockNews.slice(0,10).map((news, index) => (
                      <Link key={news.id} href={news?.url} target="_blank" underline="none" color={white}>
                        <Box key={index} py={2.5} px={2.5} mb={0.5} 
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          "&:hover": {
                            backgroundColor: 'rgba(0, 30, 0, 0.3)',
                            transform: 'translateX(5px)',
                          }
                        }}>
                          <Typography fontSize="11pt" color={teal[400]}>{news?.source.charAt(0).toUpperCase() + news?.source.slice(1)}</Typography>
                          <Typography fontWeight="bold" color={grey[100]} sx={{ my: 0.5 }}>{news?.title}</Typography>
                          <Typography fontSize="10pt" color={grey[500]} sx={{ opacity: 0.9 }}>{news?.description}</Typography>
                        </Box>
                      </Link>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography color={grey[500]} sx={{ fontStyle: 'italic' }}>No news available for this stock</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar - Wishlist (only on large screens) */}
      {!isSmallScreen && !isMediumScreen && (
        <Box sx={{ 
          width: "320px", 
          flexShrink: 0,
          borderLeft: `1px solid ${green[900]}`,
          overflow: "auto",
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
        }}>
          <WishlistWIdget 
            wishlist={wishlist} 
            removeFromWishlist={removeFromWishlist} 
            handleSearch={handleSearch} 
            ticker={currentStock} 
            marketChange={stockData?.regularMarketChange}
          />
        </Box>
      )}

      </Box>
    </Box>

      {/* Mobile Wishlist Drawer */}
      <Drawer
        anchor="right"
        open={mobileWishlistOpen}
        onClose={() => setMobileWishlistOpen(false)}
        variant="temporary"
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': { 
            width: '85%',
            maxWidth: '320px',
            boxSizing: 'border-box',
            background: darkGradient,
            borderLeft: `1px solid ${green[900]}`,
          },
        }}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          p: 0
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${green[900]}`,
            background: `linear-gradient(90deg, ${teal[900]}, ${green[900]})`,
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              My Watchlist
            </Typography>
            <IconButton 
              onClick={() => setMobileWishlistOpen(false)}
              sx={{ color: 'white' }}
            >
              <FaTimes />
            </IconButton>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
            <WishlistWIdget 
              wishlist={wishlist} 
              removeFromWishlist={removeFromWishlist} 
              handleSearch={(ticker) => {
                handleSearch(ticker);
                setMobileWishlistOpen(false);
              }} 
              ticker={currentStock} 
              marketChange={stockData?.regularMarketChange}
              isMobile={true}
            />
          </Box>
        </Box>
      </Drawer>

      {/* Mobile Wishlist Toggle Button */}
      {isSmallScreen && (
        <Fab
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            bgcolor: teal[700],
            color: 'white',
            '&:hover': {
              bgcolor: teal[600],
            },
            zIndex: 1000
          }}
          onClick={() => setMobileWishlistOpen(true)}
        >
          <FaList />
        </Fab>
      )}

      <StockAnalysisModal open={openAnalysisModal} handleClose={() => setOpenAnalysisModal(false)} result={aiAnalysis} stock={currentStock}/>
    </Box>
  );
}