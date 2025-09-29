import { Box, Typography, Chip } from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import ChartMini from './ChartMini';

const StrategyCard = ({ strategy, onClick }) => {
  const { category, title, description, chartType, color, size } = strategy;

  const getCardHeight = () => {
    switch (size) {
      case 'large': return '280px';
      case 'medium': return '220px';
      default: return '200px';
    }
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: 'rgba(20, 30, 30, 0.4)',
        border: `1px solid rgba(${teal[500]}, 0.3)`,
        borderRadius: 2,
        p: 3,
        height: getCardHeight(),
        display: 'flex',
        flexDirection: 'column',
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
      {/* Category Badge */}
      <Chip
        label={category}
        size="small"
        sx={{
          backgroundColor: `rgba(${teal[500]}, 0.2)`,
          color: teal[300],
          fontSize: '0.7rem',
          fontWeight: 500,
          mb: 2,
          alignSelf: 'flex-start',
          border: `1px solid rgba(${teal[500]}, 0.3)`
        }}
      />

      {/* Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            mb: 1.5,
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: grey[300],
            fontSize: '0.9rem',
            lineHeight: 1.4,
            mb: 2,
            flex: 1
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Chart Area */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '60%',
        height: '50%',
        opacity: 0.8
      }}>
        <ChartMini strategy={strategy} />
      </Box>
    </Box>
  );
};

export default StrategyCard;