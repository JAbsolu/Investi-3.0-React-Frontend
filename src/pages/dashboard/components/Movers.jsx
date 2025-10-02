import React from 'react';
import { 
  Box, Typography, Card, CardContent, CircularProgress, 
  Button, useMediaQuery, useTheme, Alert,
  Avatar
} from '@mui/material';
import { teal, green, red } from '@mui/material/colors';
import { FaFire, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMarketActivity } from '../../../hooks/useMarketActivity';
import { motion } from 'framer-motion';
import StockDetailsModal from './StockDetailsModal';

const Movers = ({ wishlist = [], addToWishlist }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for pausing animation on hover
  const [isPaused, setIsPaused] = React.useState(false);
  
  // State for stock details modal
  const [selectedStock, setSelectedStock] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  
  const {
    biggestGainers,
    // biggestLosers,
    mostTraded,
    loading,
    errors,
    refreshAllData
  } = useMarketActivity();

  // Handle stock click
  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStock(null);
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

  // Check if stock is in wishlist
  const isInWishlist = (symbol) => {
    return wishlist.includes(symbol);
  };

  // Handle add to wishlist
  const handleAddToWishlist = async (stock) => {
    if (addToWishlist && !isInWishlist(stock.symbol)) {
      await addToWishlist(stock.symbol);
    }
  };

  // get stock logo component
  const StockLogo = ({ ticker, size = 24 }) => {
    const [imageSrc, setImageSrc] = React.useState(
      ticker?.symbol ? `https://images.financialmodelingprep.com/symbol/${ticker.symbol}.png` : "/favicon.png"
    );
    const [hasError, setHasError] = React.useState(false);

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
          borderRadius: 0,
          mr: 0.5,
          backgroundColor: 'transparent',
          padding: 0
        }}
      />
    ) : null;
  };

  // Stock item component
  const StockItem = ({ stock, type }) => (
    <div
      onClick={() => handleStockClick(stock)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-800 transition-all duration-200 cursor-pointer
        min-w-[200px] md:min-w-[240px] w-[300px] md:w-[330px] h-[140px] mt-1 grow relative
      `}
    >
      <div className="p-3 h-full flex flex-col justify-between text-teal-500">
        <p className='font-bold text-teal-600'>
          {stock.symbol}
        </p>
        <div className="flex gap-1 mt-2 justify-start items-end mb-1">
          <p className={`
            text-zinc-300 text-md leading-tight
            line-clamp-2 overflow-hidden min-h-[28px] max-h-[38px]
          `}>
            {stock.name}
          </p>
        </div>
        
        <div className="flex justify-between items-end mt-auto">
          <p className="text-zinc-300 text-sm leading-tight">
            {formatPrice(stock.price)}
          </p>

          <div className="text-right min-w-[65px]">
            <p className={`
              ${getChangeColor(stock.change)} text-zinc-300 text-sm leading-tight
            `}>
              {formatPercentage(stock.changesPercentage)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Section component with infinite scroll for gainers
  const InfiniteScrollSection = ({ title, data, type }) => (
    <Box mb={2}>
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent={'space-between'}
        mb={2}
        sx={{ px: isMobile ? 1 : 0 }}
      >
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          color={"#ffffff"}
          sx={{ fontSize: '1.2rem' }}
        >
          {title}
        </Typography>
        <Button
            onClick={() => navigate('/dashboard/movers')}
            sx={{
                color: teal[400],
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                },
            }}
            >
            View More
        </Button>
      </Box>
      
      {loading[type] ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="180px"
        >
          <CircularProgress sx={{ color: teal[400] }} size={24} />
        </Box>
      ) : errors[type] ? (
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
            >
              <FaRedo size={12} />
            </Button>
          }
        >
          Failed to load {title.toLowerCase()}
        </Alert>
      ) : (
        <Box 
          sx={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: 'auto'
          }}
        >
          <motion.div
            animate={{
              x: !isMobile && !isPaused ? [0, -50 + '%'] : 0
            }}
            transition={{
              x: !isMobile && !isPaused ? {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              } : { duration: 0 },
            }}
            style={{
              display: 'flex',
              gap: 4,
              paddingLeft: !isMobile ? '16px' : '0',
              width: !isMobile ? '200%' : '100%',
              overflowX: isMobile ? 'auto' : 'visible',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {/* Render cards twice for seamless loop on desktop, once on mobile */}
            {(isMobile ? data.slice(0, 4) : [...data.slice(0, 20), ...data.slice(0, 20)]).map((stock, index) => (
              <StockItem key={`${stock.symbol}-${index}` || index} stock={stock} type={type} />
            ))}
          </motion.div>
        </Box>
      )}
    </Box>
  );

  // Regular section component for other sections
  const MarketSection = ({ title, icon: Icon, data, type, color }) => (
    <Box mb={2}>
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent={'space-between'}
        mb={0}
        sx={{ px: isMobile ? 1 : 0 }}
      >
        {/* <Icon size={18} color={color} style={{ marginRight: '8px' }} /> */}
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color={"white"}
          sx={{ fontSize: '1.2rem' }}
        >
          {title}
        </Typography>
        <Button
            onClick={() => navigate('/dashboard/movers')}
            sx={{
                color: teal[400],
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                },
            }}
            >
            View More
        </Button>
      </Box>
      
      {loading[type] ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="180px"
        >
          <CircularProgress sx={{ color: teal[400] }} size={24} />
        </Box>
      ) : errors[type] ? (
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
            >
              <FaRedo size={12} />
            </Button>
          }
        >
          Failed to load {title.toLowerCase()}
        </Alert>
      ) : (
        <Box 
          display="flex"
          gap={3}
          sx={{
            overflowX: 'auto',
            flexDirection: 'row',
            pb: 1,
            flexWrap: 'wrap'
          }}
        >
          {data.slice(0, 6).map((stock, index) => (
            <StockItem key={stock.symbol || index} stock={stock} type={type} />
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ mt: 4, mb: 0 }}>
      {/* Market Data Sections */}
      <Box 
        display="flex" 
        gap={3}
        sx={{
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {/* <InfiniteScrollSection
          title="Daily Movers"
          data={biggestGainers}
          type="gainers"
        /> */}
        <MarketSection
          title="Daily Movers"
          data={biggestGainers}
          type="gainers"
          color={teal[400]}
        />
        {/*  
        <MarketSection
          title="Losers"
          icon={FaArrowDown}
          data={biggestLosers}
          type="losers"
          color={red[400]}
        />
          */}
      {/*         
        <MarketSection
          title="Most Traded"
          icon={FaFire}
          data={mostTraded}
          type="traded"
          color={teal[400]}
        /> */}
      
      </Box>

      {/* Stock Details Modal */}
      <StockDetailsModal
        open={modalOpen}
        onClose={handleModalClose}
        stock={selectedStock}
        wishlist={wishlist}
        addToWishlist={addToWishlist}
      />
    </Box>
  );
};

export default Movers;
