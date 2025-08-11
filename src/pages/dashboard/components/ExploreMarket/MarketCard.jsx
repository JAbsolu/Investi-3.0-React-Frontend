import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaChevronRight } from 'react-icons/fa';
import MarketIcon from './MarketIcon';

const MarketCard = ({ tool, onClick }) => {
  const { title, description, iconType, iconColor } = tool;

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: 'rgba(20, 30, 30, 0.4)',
        border: `1px solid rgba(${teal[500]}, 0.3)`,
        borderRadius: 2,
        p: 3,
        height: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: `rgba(${teal[500]}, 0.6)`,
          backgroundColor: 'rgba(20, 30, 30, 0.6)',
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`
        }
      }}
    >
      {/* Header with Icon */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <MarketIcon iconType={iconType} iconColor={iconColor} />
        
        {/* Navigation Arrow */}
        <IconButton
          size="small"
          sx={{
            backgroundColor: `rgba(${teal[500]}, 0.2)`,
            color: teal[400],
            width: 32,
            height: 32,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `rgba(${teal[500]}, 0.3)`,
              color: teal[300],
              transform: 'translateX(4px)'
            }
          }}
        >
          <FaChevronRight size={12} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            mb: 1.5,
            lineHeight: 1.3
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: grey[300],
            fontSize: '0.875rem',
            lineHeight: 1.5,
            opacity: 0.9
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export default MarketCard;