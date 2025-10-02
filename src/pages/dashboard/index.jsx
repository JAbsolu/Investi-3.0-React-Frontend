import { useEffect, useState } from "react";
import { 
  Box, Typography,
  IconButton, Drawer, Fab
} from "@mui/material";
import { FaTimes, FaList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { teal } from '@mui/material/colors';
import { ref, set, get, child } from "firebase/database";
import { database } from "../../firebaseConfig";
import DashboardSidebar from "./components/DashboardSidebar";
import { isStockMarketOpen } from "../../util/apis";
import { getStartDay } from "../../util";
import WatchlistWidget from "./components/WatchlistWidget";
import { useStockData } from "../../hooks/useStockData";
import { useWishlist } from "../../hooks/useWishlist";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import DashboardHeader from "./components/DashboardHeader";
import StockDataView from "./components/StockDataView";
// import TradingStreategies from "./components/TradingStrategies";
// import ExploreMarket from "./components/ExploreMarket";
import LatestStockNews from "./components/LatestStockNews";
import Movers from "./components/Movers";
import NewsLayout from "./news/components/NewsLayout";
import useNewsData from "../../hooks/useNewsData";


// Constants  
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Custom hooks
  const { userId } = useAuth();
  const { isSmallScreen, isMediumScreen } = useResponsive();
  const {
    stockData,
    currentStock,
    candleSticksData,
    companyMetadata,
    stockNews,
    loading,
    errors,
    searchStock,
    getCandleSticks,
    setCurrentStock
  } = useStockData();
  
  const {
    wishlist,
    loading: wishlistLoading,
    error: wishlistError,
    fetchWishlist,
    addToWishlist: addToWishlistHook,
    removeFromWishlist
  } = useWishlist(userId);

  // Local state
  const [stock, setStock] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileWishlistOpen, setMobileWishlistOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentView, setCurrentView] = useState('chart');

  // Pagination state
  const [newsStartIndex, setNewsStartIndex] = useState(0);
  const [newsEndIndex, setNewsEndIndex] = useState(4);

  // Event handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = async (ticker) => {
    if (!ticker) return;
    
    await searchStock(ticker);
    setStock("");
    setCurrentView('chart');
    
    // Save last search
    if (userId) {
      saveLastSearch(userId, ticker);
    }
  };

  const handleSearchOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e.target.value);
    }
  };

  const handleAddToWishlist = async () => {
    if (currentStock) {
      await addToWishlistHook(currentStock);
    }
  };

  const handleAnalysis = () => {
    setShowAnalysis(true);
    setCurrentView('analysis');
  };

  const handleStrategyClick = (strategy) => {
    // console.log('Strategy clicked:', strategy);
    // navigate(`/dashboard/strategy/${strategy.id}`);
  };

  const handleToolClick = (tool) => {
    // console.log('Market tool clicked:', tool);
    navigate(tool.route);
  };

  // Utility functions
  const saveLastSearch = async (userId, stock) => {
    try {
      // await set(ref(database, `lastSearch/${userId}`), stock);
      await set(ref(database, `users/${userId}/lastSearch`), stock);
    } catch (error) {
      console.log(error.message);
    }
  };

  // Pagination handlers
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
    if (newsEndIndex >= stockNews.length) return;
    setNewsStartIndex(prev => prev + 5);
    setNewsEndIndex(prev => prev + 5);
    scrollToTop();
  };

  const handleBack = () => {
    if (newsEndIndex === 0) {
      setNewsStartIndex(0);
      setNewsEndIndex(10);
    }
    setNewsStartIndex(prev => prev - 5);
    setNewsEndIndex(prev => prev - 5);
    scrollToTop();
  };

  // Effects
  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId, fetchWishlist]);

  // Load last search or default to AAPL
  useEffect(() => {
    const fetchLastSearch = async () => {
      if (!userId) return;

      try {
        const dbRef = ref(database);
        // const snapshot = await get(child(dbRef, `/lastSearch/${userId}`));
        const snapshot = await get(child(dbRef, `users/${userId}/lastSearch`));

        if (snapshot.exists()) {
          const ticker = snapshot.val();
          // console.log("Found last search:", ticker);
          await searchStock(ticker);
        } else {
          // console.log("No last search found, defaulting to AAPL");
          await searchStock("AAPL");
        }
      } catch (error) {
        // console.log("Error getting last search:", error);
        await searchStock("AAPL");
      }
    };

    fetchLastSearch();
  }, [userId, searchStock]);

  // Live candlesticks updates
  useEffect(() => {
    if (!currentStock) return;

    const startDate = getStartDay();

    if (isStockMarketOpen()) {
      getCandleSticks(currentStock, startDate);
    }

    const interval = setInterval(() => {
      if (isStockMarketOpen()) {
        getCandleSticks(currentStock, startDate);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentStock, getCandleSticks]);

  const { generalNews } = useNewsData();

  return (
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
        {/* Fixed Header on Mobile */}
        {isSmallScreen && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: darkBg,
            borderBottom: `1px solid ${teal[900]}`,
            px: 2,
            py: 1.5,
          }}>
            <DashboardHeader
              isSmallScreen={isSmallScreen}
              mobileOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
              stock={stock}
              setStock={setStock}
              handleOpenPaywall={() => navigate('/upgrades')}
              // handleClosePaywall={handleClosePaywall}
              handleSearchOnEnter={handleSearchOnEnter}
              onAnalysis={handleAnalysis}
              onAddToWishlist={handleAddToWishlist}
            />
          </Box>
        )}

        <Box sx={{ 
          flex: 1,
          display: "flex",
          overflow: "hidden",
          mt: isSmallScreen ? '80px' : 0, // Add top margin on mobile to account for fixed header
        }}>
          <Box sx={{ 
            flex: 1,
            px: 1, 
            py: 1,  
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
          }}>
            {/* Header with search and actions - Desktop only */}
            {!isSmallScreen && (
              <DashboardHeader
                isSmallScreen={isSmallScreen}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                stock={stock}
                setStock={setStock}
                handleSearchOnEnter={handleSearchOnEnter}
                onAnalysis={handleAnalysis}
                onAddToWishlist={handleAddToWishlist}
              />
            )}
            
            <Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                gap: 0
              }}>
                {/* Stock Data View */}
                <Box sx={{ width: '100%' }}>
                  <StockDataView
                    stockData={stockData}
                    companyMetadata={companyMetadata}
                    currentStock={currentStock}
                    showAnalysis={showAnalysis}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    isSmallScreen={isSmallScreen}
                  />
                </Box>

                <NewsLayout newsData={generalNews.slice(newsStartIndex, newsEndIndex)} />

                {/* Movers Section */}
                <Box sx={{ width: '100%' }}>
                  <Movers 
                    wishlist={wishlist} 
                    addToWishlist={addToWishlistHook} 
                  />
                </Box>

                {/* Latest Stock News Section */}
                <Box sx={{ width: '100%' }}>
                  <LatestStockNews />
                </Box>

                {/* Trading Strategies Section */}
                {/*
                <Box sx={{ width: '100%', mt: 3 }}>
                  <TradingStrategies onStrategyClick={handleStrategyClick} />
                </Box>
                */}

                {/* Explore Market Section */}
                {/*}
                <Box sx={{ width: '100%', mt: 4 }}>
                  <ExploreMarket onToolClick={handleToolClick} />
                </Box>
                */}
              </Box>
            </Box>
          </Box>

          {/* Right Sidebar - Wishlist */}
          {!isSmallScreen && !isMediumScreen && (
            <Box sx={{ 
              width: "320px", 
              flexShrink: 0,
              overflow: "auto",
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              '-ms-overflow-style': 'none',
            }}>
              <WatchlistWidget 
                wishlist={wishlist} 
                removeFromWishlist={removeFromWishlist} 
                handleSearch={handleSearch} 
                ticker={currentStock} 
                marketChange={stockData?.regularMarketChange}
                setCurrentView={setCurrentView}
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
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': { 
            width: '85%',
            maxWidth: '320px',
            boxSizing: 'border-box',
            background: darkGradient,
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
            borderBottom: `1px solid ${teal[500]}`,
            background: `linear-gradient(90deg, ${teal[900]}, ${teal[800]})`,
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
            <WatchlistWidget 
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
    </Box>
  );
}