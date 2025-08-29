import React from 'react';
import { 
  Box, Typography, Card, CardContent, CircularProgress, 
  Button, useMediaQuery, useTheme, Alert 
} from '@mui/material';
import { teal, grey, green, red } from '@mui/material/colors';
import { 
  FaArrowUp, FaArrowDown, FaFire, FaArrowRight,
  FaRedo 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMarketActivity } from '../../../hooks/useMarketActivity';

const MarketActivity = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    biggestGainers,
    biggestLosers,
    mostTraded,
    loading,
    errors,
    refreshAllData
  } = useMarketActivity();

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

  // Stock item component
  const StockItem = ({ stock, type }) => (
    <Card
      sx={{
        backgroundColor: 'rgba(20, 30, 30, 0.4)',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        minWidth: isMobile ? '260px' : '280px',
        '&:hover': {
          transform: 'translateY(-4px)',
          backgroundColor: 'rgba(20, 30, 30, 0.6)',
          boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            color="white"
            sx={{ fontSize: '0.95rem' }}
          >
            {stock.symbol}
          </Typography>
          <Typography 
            variant="body2" 
            color={teal[400]}
            sx={{ fontSize: '0.7rem' }}
          >
            {stock.exchange}
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          color={teal[300]}
          sx={{ 
            mb: 1,
            fontSize: '0.8rem',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {stock.name}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            color="white"
            sx={{ fontSize: '0.9rem' }}
          >
            {formatPrice(stock.price)}
          </Typography>
          <Box textAlign="right">
            <Typography 
              variant="body2" 
              color={getChangeColor(stock.change)}
              fontWeight="bold"
              sx={{ fontSize: '0.75rem' }}
            >
              {formatPercentage(stock.changesPercentage)}
            </Typography>
            <Typography 
              variant="caption" 
              color={getChangeColor(stock.change)}
              sx={{ fontSize: '0.65rem' }}
            >
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Section component
  const MarketSection = ({ title, icon: Icon, data, type, color }) => (
    <Box mb={4}>
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent={'space-between'}
        mb={2}
        sx={{ px: isMobile ? 1 : 0 }}
      >
        {/* <Icon size={18} color={color} style={{ marginRight: '8px' }} /> */}
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color={teal[400]}
          sx={{ fontSize: '1rem' }}
        >
          {title}
        </Typography>
        <Button
            onClick={() => navigate('/dashboard/market-activity')}
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
          gap={2}
          sx={{
            overflowX: 'auto',
            flexDirection: 'row',
            pb: 1,
            '&::-webkit-scrollbar': {
              height: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: grey[900],
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: teal[600],
              borderRadius: '2px',
            },
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
        <MarketSection
          title="Biggest Gainers"
          icon={FaArrowUp}
          data={biggestGainers}
          type="gainers"
          color={green[400]}
        />
        {/*  
        <MarketSection
          title="Losers"
          icon={FaArrowDown}
          data={biggestLosers}
          type="losers"
          color={red[400]}
        />
        
        <MarketSection
          title="Most Traded"
          icon={FaFire}
          data={mostTraded}
          type="traded"
          color={teal[400]}
        />
        */}
      </Box>
    </Box>
  );
};

export default MarketActivity;
