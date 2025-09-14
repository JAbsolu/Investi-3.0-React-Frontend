import { Box, Button, Paper } from '@mui/material';
import { teal } from '@mui/material/colors';
import StockChart from "./stockChart"
import Analysis from './Analysis';
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

const StockDataView = ({
  stockData,
  companyMetadata,
  currentStock,
  showAnalysis,
  currentView,
  setCurrentView,
  isSmallScreen
}) => {
  if (!stockData?.regularMarketPrice) {
    return null;
  }

  return (
    <Paper sx={{ 
      py: 1, 
      px: isSmallScreen ? 0 : 1,  
      backgroundColor: 'inherit', 
      borderRadius: 2,
      mb: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      {/* Content Area - Toggle between Chart and Analysis */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        minHeight: showAnalysis ? '400px' : 'auto',
        mt: isSmallScreen ? 2.5 : 0,
        overflow: 'hidden'
      }}>
        {/* Stock Chart View */}
        <Box sx={{ 
          width: '100%',
          display: currentView === 'analysis' ? 'none' : 'block'
        }}>
          <StockChart 
            companyName={companyMetadata?.name}  
            ticker={currentStock} 
            price={stockData?.regularMarketPrice?.toFixed(2)} 
            marketPriceChange={stockData?.regularMarketChange} 
          />
        </Box>

        {/* AI Analysis View */}
        {showAnalysis && (
          <Box sx={{ 
            width: '100%',
            display: currentView === 'analysis' ? 'block' : 'none'
          }}>
            <Analysis ticker={currentStock} showAnalysis={showAnalysis} />
          </Box>
        )}
      </Box>

      {/* Toggle Navigation Controls */}
      {showAnalysis && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          borderRadius: '8px',
          mt: 2,
        }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => setCurrentView('chart')}
            variant={currentView === 'chart' ? 'contained' : 'outlined'}
            size="small"
            sx={{
              backgroundColor: currentView === 'chart' ? teal[600] : 'transparent',
              borderColor: teal[500],
              color: currentView === 'chart' ? 'white' : teal[400],
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: currentView === 'chart' ? teal[700] : 'rgba(0, 150, 136, 0.1)',
              }
            }}
          >
            Chart
          </Button>
          
          <Button
            endIcon={<NavigateNextIcon />}
            onClick={() => setCurrentView('analysis')}
            variant={currentView === 'analysis' ? 'contained' : 'outlined'}
            size="small"
            sx={{
              backgroundColor: currentView === 'analysis' ? teal[600] : 'transparent',
              borderColor: teal[500],
              color: currentView === 'analysis' ? 'white' : teal[400],
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: currentView === 'analysis' ? teal[700] : 'rgba(0, 150, 136, 0.1)',
              }
            }}
          >
            Analysis
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default StockDataView;