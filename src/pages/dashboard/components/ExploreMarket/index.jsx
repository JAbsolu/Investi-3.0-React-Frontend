import React from 'react';
import { Box, Typography } from '@mui/material';
import { teal } from '@mui/material/colors';
import MarketCard from './MarketCard';

const marketToolsData = [
  {
    id: 'stock-monitor',
    title: 'Stock Monitor',
    description: 'Real-time stock movement monitor helps you seize trading opportunities',
    iconType: 'monitor',
    iconColor: teal[400],
    route: '/dashboard/stock-monitor'
  },
  {
    id: 'hedge-fund-tracker',
    title: 'Hedge Fund Tracker',
    description: 'Explore the portfolios and latest moves of top-performing investors',
    iconType: 'location',
    iconColor: teal[500],
    route: '/dashboard/hedge-funds'
  },
  {
    id: 'crypto-spotlight',
    title: 'Crypto Spotlight',
    description: 'Provides real-time data and analysis across major cryptocurrencies',
    iconType: 'crypto',
    iconColor: teal[300],
    route: '/dashboard/crypto'
  },
  {
    id: 'gainers-losers',
    title: 'Gainers & Losers',
    description: 'Stay updated on today\'s market movers',
    iconType: 'chart',
    iconColor: teal[600],
    route: '/dashboard/movers'
  },
  {
    id: 'congress-monitor',
    title: 'Congress Monitor',
    description: 'Track what congress members are buying and selling',
    iconType: 'government',
    iconColor: teal[400],
    route: '/dashboard/congress'
  }
];

const ExploreMarket = ({ onToolClick }) => {
  return (
    <Box sx={{ mt: 4, width: '100%' }}>
      {/* Section Title */}
      <Typography 
        variant="h5" 
        sx={{ 
          color: "#ffffff",
          fontWeight: 600,
          mb: 3,
          fontSize: '1.2rem'
        }}
      >
        Explore the Market
      </Typography>

      {/* Market Tools Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(2, 1fr)'
        },
        gap: 3,
        gridAutoRows: 'min-content'
      }}>
        {marketToolsData.map((tool) => (
          <MarketCard
            key={tool.id}
            tool={tool}
            onClick={() => onToolClick?.(tool)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ExploreMarket;