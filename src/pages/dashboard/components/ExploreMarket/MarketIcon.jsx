import React from 'react';
import { Box } from '@mui/material';
import { teal } from '@mui/material/colors';
import { 
  FaChartLine, 
  FaMapMarkerAlt, 
  FaBitcoin, 
  FaChartBar, 
  FaUniversity 
} from 'react-icons/fa';

const MarketIcon = ({ iconType, iconColor }) => {
  const getIcon = () => {
    switch (iconType) {
      case 'monitor':
        return <FaChartLine size={20} />;
      case 'location':
        return <FaMapMarkerAlt size={20} />;
      case 'crypto':
        return <FaBitcoin size={20} />;
      case 'chart':
        return <FaChartBar size={20} />;
      case 'government':
        return <FaUniversity size={20} />;
      default:
        return <FaChartLine size={20} />;
    }
  };

  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '12px',
        backgroundColor: `rgba(${iconColor}, 0.2)`,
        border: `1px solid rgba(${iconColor}, 0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: `rgba(${iconColor}, 0.3)`,
          borderColor: `rgba(${iconColor}, 0.5)`,
          transform: 'scale(1.05)'
        }
      }}
    >
      {getIcon()}
    </Box>
  );
};

export default MarketIcon;