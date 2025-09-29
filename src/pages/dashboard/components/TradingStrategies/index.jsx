import { Box, Typography } from '@mui/material';
import { teal } from '@mui/material/colors';
import StrategyCard from './StrategyCard';

const strategiesData = [
  {
    id: 'ai-stock-picker',
    category: 'AI Investment',
    title: 'AI Stock Picker',
    description: 'AI-selected top daily stocks to day trade',
    chartType: 'bar',
    chartData: [
      { label: 'Top1', value: 85, color: '#4ade80' },
      { label: 'Top2', value: 75, color: '#22d3ee' },
      { label: 'Top3', value: 65, color: '#a78bfa' },
      { label: 'Top4', value: 55, color: '#f59e0b' },
      { label: 'Top5', value: 45, color: '#ef4444' }
    ],
    color: teal[400],
    size: 'medium'
  },
  {
    id: 'swing-trades',
    category: 'Stock & Crypto',
    title: 'Swing Trades',
    description: 'Trade like a pro simply by following AI-guided signals',
    chartType: 'line',
    indicators: [
      { type: 'Buy', position: 25 },
      { type: 'Sell', position: 75 }
    ],
    color: '#22c55e',
    size: 'medium'
  },
  {
    id: 'daytrading-center',
    category: 'Stock & Crypto',
    title: 'Daytrading Center',
    description: 'Real-time market tracker for fast-paced day trading decisions.',
    chartType: 'candlestick',
    liveData: {
      symbol: 'The Dip',
      price: '13:30',
      trend: 'up'
    },
    color: '#10b981',
    size: 'large'
  },
  {
    id: 'earnings-trading',
    category: 'AI Investment',
    title: 'Earnings Trading',
    description: 'Leverage earnings data for winning trades',
    stockList: [
      { symbol: 'AVGO.O', status: 'Positive', date: 'Q2 2025 Dec 20, 2024' },
      { symbol: 'ACN.N', status: 'Positive', date: 'Q1 2025 Dec 19, 2024' },
      { symbol: 'NKE', status: 'Negative', date: 'Q2 2025 Dec 20, 2024' }
    ],
    color: '#6366f1',
    size: 'large'
  },
  {
    id: 'pattern-detection',
    category: 'Stock & Crypto',
    title: 'Pattern Detection',
    description: 'AI-automated chart pattern detection for stocks, crypto, and ETFs',
    chartType: 'pattern',
    patternData: {
      trend: 'bullish',
      confidence: 85
    },
    color: '#8b5cf6',
    size: 'large'
  }
];

const TradingStrategies = ({ onStrategyClick }) => {
  return (
    <Box sx={{ mt: 4, width: '100%' }}>
      {/* Section Header */}
      <Typography 
        variant="h5" 
        sx={{ 
          color: "#ffffff",
          fontWeight: 600,
          mb: 3,
          fontSize: '1.2rem'
        }}
      >
        Trading Strategies
      </Typography>

      {/* Strategies Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)'
        },
        gap: 3,
        gridAutoRows: 'min-content'
      }}>
        {strategiesData.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            onClick={() => onStrategyClick?.(strategy)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TradingStrategies;