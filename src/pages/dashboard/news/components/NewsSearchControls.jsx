import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaSearch, FaTimes, FaChartLine } from 'react-icons/fa';

const NewsSearchControls = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onClear,
  loading,
  searchActive,
  resultsCount = 0
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Refs for managing timers
  const debounceTimer = useRef(null);
  const lastSearchQuery = useRef('');

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Check if this is the same search we just did
    if (query.trim() === lastSearchQuery.current && query.trim()) {
      return; // Prevent duplicate searches
    }

    debounceTimer.current = setTimeout(() => {
      if (query.trim() && query.length >= 1) {
        lastSearchQuery.current = query.trim();
        onSearch(query.trim());
      }
    }, 300);
  }, [onSearch]);

  const handleQueryChange = (event) => {
    const value = event.target.value;
    setLocalQuery(value);
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    // Clear timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Reset search params
    lastSearchQuery.current = '';
    
    // Clear local state
    setLocalQuery('');
    setSearchQuery('');
    
    // Call clear function
    onClear();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && localQuery.trim() && localQuery.length >= 1) {
      // Clear debounce timer and search immediately
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      lastSearchQuery.current = ''; // Force new search
      onSearch(localQuery.trim());
    }
  };

  // Manual search button handler
  const handleManualSearch = () => {
    if (localQuery.trim() && localQuery.length >= 1) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      lastSearchQuery.current = ''; // Force new search
      onSearch(localQuery.trim());
    }
  };

  return (
    <Box sx={{ 
      mb: 3, 
      p: 3, 
      backgroundColor: '#0d0d0d',
      borderRadius: 3,
      border: `1px solid ${teal[800]}`,
    }}>
      {/* Search Instructions */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FaChartLine size={16} color={teal[400]} />
        <Typography variant="body2" sx={{ color: teal[300], fontWeight: 500 }}>
          Search News by Ticker Symbol
        </Typography>
      </Box>

      {/* Search Input */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={localQuery}
          onChange={handleQueryChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter ticker symbol (e.g., AAPL, TSLA, NVDA)..."
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: teal[400] }}>
                <FaSearch size={16} />
              </Box>
            ),
            endAdornment: loading ? (
              <CircularProgress size={20} sx={{ color: teal[400] }} />
            ) : (
              localQuery && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  sx={{ color: grey[500] }}
                >
                  <FaTimes size={14} />
                </IconButton>
              )
            ),
            sx: {
              backgroundColor: '#1a1a1a',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: teal[800],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: teal[600],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: teal[500],
              },
              '& input': {
                color: 'white',
              },
              '& input::placeholder': {
                color: grey[500],
                opacity: 1,
              },
            },
          }}
        />
        
        {!isMobile && (
          <Button
            variant="outlined"
            onClick={handleManualSearch}
            disabled={!localQuery.trim() || localQuery.length < 1 || loading}
            sx={{
              minWidth: 100,
              color: teal[400],
              borderColor: teal[600],
              '&:hover': {
                borderColor: teal[500],
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
              },
              '&.Mui-disabled': {
                color: grey[600],
                borderColor: grey[700],
              },
            }}
          >
            Search
          </Button>
        )}
      </Box>

      {/* Search Status */}
      {searchActive && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${resultsCount} articles found`}
            size="small"
            sx={{
              backgroundColor: teal[600],
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          <Button
            size="small"
            onClick={handleClear}
            sx={{
              color: grey[400],
              textTransform: 'none',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Clear Search
          </Button>
        </Box>
      )}

      {/* Helper Text */}
      {!searchActive && (
        <Typography
          variant="caption"
          sx={{
            color: grey[500],
            display: 'block',
            mt: 1,
            fontSize: '0.75rem',
          }}
        >
          Search for news articles related to specific stocks by entering their ticker symbols.
        </Typography>
      )}
    </Box>
  );
};

export default NewsSearchControls;
