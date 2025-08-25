import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { teal, red, blue, purple, amber } from '@mui/material/colors';

const ChartMini = ({ strategy }) => {
  const { chartType, chartData, indicators, liveData, stockList, patternData } = strategy;

  if (chartType === 'bar' && chartData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'center',
        height: '100%',
        gap: 0.5,
        p: 1
      }}>
        {chartData.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 16,
                height: `${(item.value / 100) * 80}px`,
                backgroundColor: item.color,
                borderRadius: '2px 2px 0 0',
                mb: 0.5
              }}
            />
            <Typography sx={{ fontSize: '0.6rem', color: 'white', opacity: 0.8 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (chartType === 'line' && indicators) {
    return (
      <Box sx={{ 
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Simplified Line Chart */}
        <svg width="100%" height="80%" viewBox="0 0 100 60">
          <path
            d="M10,45 Q30,20 50,30 T90,15"
            stroke={teal[400]}
            strokeWidth="2"
            fill="none"
          />
          {/* Buy Indicator */}
          <circle cx="25" cy="35" r="3" fill={teal[400]} />
          <text x="25" y="50" textAnchor="middle" fontSize="6" fill="white">Buy</text>
          {/* Sell Indicator */}
          <circle cx="75" cy="20" r="3" fill={red[400]} />
          <text x="75" y="55" textAnchor="middle" fontSize="6" fill="white">Sell</text>
        </svg>
      </Box>
    );
  }

  if (chartType === 'candlestick' && liveData) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 1
      }}>
        {/* Live Market Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: teal[400],
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography sx={{ fontSize: '0.7rem', color: teal[400], fontWeight: 600 }}>
            {liveData.symbol}
          </Typography>
        </Box>
        
        <Typography sx={{ fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
          {liveData.price}
        </Typography>

        {/* Mini Candlesticks */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 3,
                height: Math.random() * 20 + 10,
                backgroundColor: Math.random() > 0.5 ? teal[400] : red[400],
                borderRadius: 0.5
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (stockList) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        p: 1,
        gap: 0.5
      }}>
        {stockList.slice(0, 3).map((stock, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.6rem', color: 'white', fontWeight: 600 }}>
              {stock.symbol}
            </Typography>
            <Chip
              label={stock.status}
              size="small"
              sx={{
                fontSize: '0.5rem',
                height: 16,
                backgroundColor: stock.status === 'Positive' ? teal[700] : red[700],
                color: 'white'
              }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (chartType === 'pattern' && patternData) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 1
      }}>
        {/* Pattern Visualization */}
        <svg width="80%" height="60%" viewBox="0 0 80 40">
          <path
            d="M10,30 Q20,10 30,20 Q40,5 50,15 Q60,25 70,10"
            stroke={amber[400]}
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M10,35 L70,15"
            stroke={purple[400]}
            strokeWidth="1"
            strokeDasharray="3,3"
            fill="none"
          />
          <circle cx="65" cy="18" r="2" fill={teal[400]} />
        </svg>
        
        <Typography sx={{ 
          fontSize: '0.6rem', 
          color: teal[400], 
          fontWeight: 600,
          mt: 0.5
        }}>
          {patternData.confidence}% Bullish
        </Typography>
      </Box>
    );
  }

  return null;
};

export default ChartMini;