
import { Box, Button, IconButton } from '@mui/material';
import { HiOutlineMenu } from "react-icons/hi";
import { AutoAwesome, RemoveRedEye } from '@mui/icons-material';
import { teal, grey, amber } from '@mui/material/colors';
import SearchBar from './SearchBar';
import { FaCrown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({
  isSmallScreen,
  handleDrawerToggle,
  stock,
  setStock,
  handleSearchOnEnter,
  onAnalysis,
  onAddToWishlist
}) => {

  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Navigation & Search */}
      {isSmallScreen && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 0.5,
          mb: 1.5,
          px: 0
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              color: teal[400],
              p: 1,
              '&:hover': { backgroundColor: 'rgba(0, 128, 128, 0.1)' }
            }}
          >
            <HiOutlineMenu />
          </IconButton>
          
          <SearchBar 
            handleSearchOnEnter={handleSearchOnEnter}
            onChange={(e) => setStock(e.target.value?.trim())}
            ticker={stock}
            setTicker={setStock}
            placeholder="Search stock..."
            mobile={true}
          />
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: isSmallScreen ? "space-between" : "end",
        gap: isSmallScreen ? 1 : 1.5, 
        mb: 0,
        width: "100%",
      }}>
        {/* Desktop search bar */}
        {!isSmallScreen && (
          <SearchBar 
            handleSearchOnEnter={handleSearchOnEnter}
            onChange={(e) => setStock(e.target.value?.trim())}
            ticker={stock}
            setTicker={setStock}
            placeholder="Search stock"
          />
        )}

        <Button
          variant="contained"
          startIcon={<AutoAwesome />}
          sx={{ 
            color: 'white', 
            minWidth: "12em",
            maxHeight: "3em",
            backgroundColor: teal[700],
            textTransform: "none",
            borderRadius: '10px',
            px: isSmallScreen ? 1.2 : 2.5,
            fontSize: isSmallScreen ? '0.8rem' : '10pt',
            flexGrow: isSmallScreen ? 1 : 0,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: teal[600],
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 12px rgba(0,128,128,0.3)`
            },
            '&:disabled': { 
              backgroundColor: teal[200],
              color: grey[500],
              border: `1px solid ${grey[700]}`,
              cursor: 'not-allowed',
              transform: 'none',
              boxShadow: 'none'
            }
          }}
          // onClick={() => navigate("/upgrades")}
        >
          AI Analysis
        </Button>
        
        <Button
          startIcon={<RemoveRedEye/>}
          variant="outlined"
          sx={{ 
            minWidth: "12em",
            maxHeight: "3em",
            color: grey[200], 
            borderColor: teal[500], 
            borderRadius: '10px',
            textTransform: "none",
            px: isSmallScreen ? 1 : 2,
            fontSize: isSmallScreen ? '0.8rem' : '10pt',
            flexGrow: isSmallScreen ? 1 : 0,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(100, 100, 100, 0.1)',
              transform: 'translateX(3px)'
            }
          }}
          onClick={onAddToWishlist}
        >
          Watch
        </Button>
      </Box>
    </>
  );
};

export default DashboardHeader;