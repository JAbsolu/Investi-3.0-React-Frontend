import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaSearch, FaTimes, FaUser, FaChartLine } from 'react-icons/fa';

const TradingSearchControls = ({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  onSearch,
  onClear,
  loading,
  searchActive,
  resultsCount = 0
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Refs for managing timers and preventing multiple calls
  const debounceTimer = useRef(null);
  const lastSearchParams = useRef({ query: '', type: '' });

  // Debounced search function
  const debouncedSearch = useCallback((query, type) => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Check if this is the same search we just did
    const currentParams = `${query.trim()}_${type}`;
    const lastParams = `${lastSearchParams.current.query}_${lastSearchParams.current.type}`;
    
    if (currentParams === lastParams && query.trim()) {
      return; // Prevent duplicate searches
    }

    debounceTimer.current = setTimeout(() => {
      if (query.trim() && query.length >= 2) {
        lastSearchParams.current = { query: query.trim(), type };
        onSearch(query.trim(), type); // <-- pass type!
      }
    }, 300); // Reduced debounce time for better UX
  }, [onSearch]);

  // Effect for handling search when localQuery or searchType changes
  useEffect(() => {
    debouncedSearch(localQuery, searchType);
    
    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localQuery, searchType, debouncedSearch]);

  const handleQueryChange = (event) => {
    const value = event.target.value;
    setLocalQuery(value);
    setSearchQuery(value);
  };

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setSearchType(newType);
    
    // If we have a valid query, search with the new type
    if (localQuery.trim() && localQuery.length >= 2) {
      // Clear the previous search params to allow new search with different type
      lastSearchParams.current = { query: '', type: '' };
      debouncedSearch(localQuery, newType);
    }
  };

  const handleClear = () => {
    // Clear timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Reset search params
    lastSearchParams.current = { query: '', type: '' };
    
    // Clear local state
    setLocalQuery('');
    setSearchQuery('');
    
    // Call clear function
    onClear();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && localQuery.trim() && localQuery.length >= 2) {
      // Clear debounce timer and search immediately
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      lastSearchParams.current = { query: '', type: '' };
      onSearch(localQuery.trim(), searchType); // <-- pass searchType!
    }
  };

  // Manual search button handler
  const handleManualSearch = () => {
    if (localQuery.trim() && localQuery.length >= 2) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      lastSearchParams.current = { query: '', type: '' };
      onSearch(localQuery.trim(), searchType); // <-- pass searchType!
    }
  };

  return (
    <Box sx={{ 
      mb: 3, 
      p: 2, 
      backgroundColor: '#1a1a1a',
      borderRadius: 2,
      border: `1px solid ${teal[800]}`,
    }}>
      {/* Search Type Selector */}
      <Box sx={{ mb: 2 }}>
        <FormControl component="fieldset">
          <RadioGroup
            row={!isMobile}
            value={searchType}
            onChange={handleTypeChange}
            sx={{
              '& .MuiFormControlLabel-root': {
                color: 'white',
                mr: isMobile ? 0 : 3,
                mb: isMobile ? 1 : 0,
              },
              '& .MuiRadio-root': {
                color: grey[500],
                '&.Mui-checked': {
                  color: teal[400],
                },
              },
            }}
          >
            <FormControlLabel
              value="name"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaUser size={14} />
                  <span>Search by Member Name</span>
                </Box>
              }
            />
            <FormControlLabel
              value="stock" // <-- was "ticker"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaChartLine size={14} />
                  <span>Search by Ticker Symbol</span>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
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
          placeholder={
            searchType === 'name' 
              ? 'Enter member name (e.g., "Pelosi", "McConnell")...' 
              : 'Enter ticker symbol (e.g., "AAPL", "TSLA")...'
          }
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
              backgroundColor: '#0d0d0d',
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
            disabled={!localQuery.trim() || localQuery.length < 2 || loading}
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
            label={`${resultsCount} results found`}
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
          Search requires at least 2 characters. Results will appear as you type.
        </Typography>
      )}
    </Box>
  );
};

export default TradingSearchControls;
