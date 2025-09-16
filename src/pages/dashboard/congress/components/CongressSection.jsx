import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Pagination
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaRedo, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TransactionTable from './TransactionTable';
import TransactionCard from './TransactionCard';
import TradingSearchControls from './TradingSearchControls';

const CongressSection = ({ 
  title, 
  icon, 
  finDisclosureData, 
  tradingActivityData, 
  loading, 
  errors, 
  onRefresh,
  isCompact = false,
  constrained = false,
  // Search related props
  searchResults = {},
  searchLoading = {},
  searchErrors = {},
  onSearch,
  onClearSearch,
  onStockClick,
  chamber = 'senate' // 'senate' or 'house'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchActive, setSearchActive] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(0); // Reset pagination when switching tabs
    
    // Clear search when switching away from trading activity
    if (newValue === 0 && searchActive) {
      handleClearSearch();
    }
  };

  // Get current data based on tab and search state
  const getCurrentData = () => {
    if (activeTab === 0) {
      // Financial Disclosures tab - no search functionality
      return finDisclosureData;
    } else {
      // Trading Activity tab - check for search results
      if (searchActive && searchQuery.trim() && searchQuery.length >= 2) {
        const searchKey = `${chamber}By${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;
        return searchResults[searchKey] || [];
      }
      return tradingActivityData;
    }
  };

  const currentData = getCurrentData();
  const currentLoading = activeTab === 0 ? loading.finDisclosure : loading.tradingActivity;
  const currentError = activeTab === 0 ? errors.finDisclosure : errors.tradingActivity;
  
  // Check if we're currently searching
  const isSearching = searchActive && searchQuery.trim() && searchQuery.length >= 2 && activeTab === 1;
  const searchKey = `${chamber}By${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;
  const currentSearchLoading = isSearching ? searchLoading[searchKey] : false;
  const currentSearchError = isSearching ? searchErrors[searchKey] : null;

  // Handle search
  const handleSearch = (query) => {
    if (query.trim() && query.length >= 2) {
      setSearchActive(true);
      setCurrentPage(0);
      onSearch(query, searchType, chamber);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchActive(false);
    setSearchQuery('');
    setCurrentPage(0);
    onClearSearch(chamber, searchType);
  };

  // Pagination settings
  const rowsPerPage = constrained ? (isMobile ? 6 : 8) : (isMobile ? 10 : 25);
  const totalPages = Math.ceil((currentData?.length || 0) / rowsPerPage);
  const paginatedData = currentData?.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  ) || [];

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderContent = () => {
    // Show search loading if actively searching
    if (currentSearchLoading) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: constrained ? 120 : (isCompact ? 150 : 200),
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <CircularProgress sx={{ color: teal[400] }} />
        </Box>
      );
    }

    // Show search error if there's one
    if (currentSearchError) {
      return (
        <Alert 
          severity="error" 
          sx={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: 'white',
            border: `1px solid rgba(211, 47, 47, 0.3)`,
            '& .MuiAlert-icon': { color: 'rgba(211, 47, 47, 0.8)' }
          }}
          action={
            <Button
              size="small"
              onClick={() => handleSearch(searchQuery)}
              sx={{ color: teal[400] }}
              startIcon={<FaRedo />}
            >
              Retry Search
            </Button>
          }
        >
          Search failed: {currentSearchError}
        </Alert>
      );
    }

    // Show regular loading for initial data fetch
    if (currentLoading) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: constrained ? 120 : (isCompact ? 150 : 200),
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <CircularProgress sx={{ color: teal[400] }} />
        </Box>
      );
    }

    // Show regular error for data fetch
    if (currentError) {
      return (
        <Alert 
          severity="error" 
          sx={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: 'white',
            border: `1px solid rgba(211, 47, 47, 0.3)`,
            '& .MuiAlert-icon': { color: 'rgba(211, 47, 47, 0.8)' }
          }}
          action={
            <Button
              size="small"
              onClick={onRefresh}
              sx={{ color: teal[400] }}
              startIcon={<FaRedo />}
            >
              Retry
            </Button>
          }
        >
          Failed to load data: {currentError}
        </Alert>
      );
    }

    // Show no results message
    if (!currentData || currentData.length === 0) {
      const message = searchActive && searchQuery.trim() && searchQuery.length >= 2
        ? `No ${searchType === 'name' ? 'members' : 'transactions'} found for "${searchQuery}"`
        : 'No transactions available';
        
      return (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: constrained ? 3 : (isCompact ? 4 : 6),
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <Typography color={grey[500]} sx={{ fontStyle: 'italic' }}>
            {message}
          </Typography>
          {searchActive && searchQuery.trim() && searchQuery.length >= 2 ? (
            <Button
              size="small"
              onClick={handleClearSearch}
              sx={{ color: teal[400], mt: 1 }}
            >
              Clear Search
            </Button>
          ) : (
            <Button
              size="small"
              onClick={onRefresh}
              sx={{ color: teal[400], mt: 1 }}
              startIcon={<FaRedo />}
            >
              Refresh
            </Button>
          )}
        </Box>
      );
    }

    if (isMobile) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: constrained ? '100%' : 'auto' }}>
          <Box sx={{ flex: constrained ? 1 : 'none', overflow: constrained ? 'auto' : 'visible' }}>
            {paginatedData.map((transaction, index) => (
              <TransactionCard key={index} index={index} transaction={transaction} onStockClick={onStockClick} />
            ))}
          </Box>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
              <IconButton
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
                sx={{ color: currentPage === 0 ? grey[600] : teal[400] }}
              >
                <FaChevronLeft />
              </IconButton>
              <Typography variant="caption" sx={{ color: grey[500] }}>
                Page {currentPage + 1} of {totalPages} • {currentData?.length || 0} total
              </Typography>
              <IconButton
                onClick={() => handlePageChange('next')}
                disabled={currentPage >= totalPages - 1}
                sx={{ color: currentPage >= totalPages - 1 ? grey[600] : teal[400] }}
              >
                <FaChevronRight />
              </IconButton>
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: constrained ? '100%' : 'auto' }}>
        <Box sx={{ flex: constrained ? 1 : 'none', minHeight: 0 }}>
          <TransactionTable 
            transactions={paginatedData} 
            title={title} 
            isCompact={isCompact} 
            constrained={constrained}
            onStockClick={onStockClick}
          />
        </Box>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
            <Button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 0}
              size="small"
              sx={{ color: currentPage === 0 ? grey[600] : teal[400] }}
              startIcon={<FaChevronLeft />}
            >
              Previous
            </Button>
            <Typography variant="caption" sx={{ color: grey[500] }}>
              Page {currentPage + 1} of {totalPages} • Showing {paginatedData.length} of {currentData?.length || 0}
            </Typography>
            <Button
              onClick={() => handlePageChange('next')}
              disabled={currentPage >= totalPages - 1}
              size="small"
              sx={{ color: currentPage >= totalPages - 1 ? grey[600] : teal[400] }}
              endIcon={<FaChevronRight />}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ mb: constrained ? 0 : (isCompact ? 4 : 6), height: constrained ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexShrink: 0 }}>
        <Box sx={{ color: teal[400], fontSize: isCompact ? '1.25rem' : '1.5rem' }}>
          {icon}
        </Box>
        <Typography 
          variant={isCompact ? "h6" : "h5"} 
          sx={{ 
            color: teal[300],
            fontWeight: 600,
            fontSize: isCompact ? '1.25rem' : '1.5rem'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: grey[500],
            ml: 'auto',
            fontSize: '0.75rem'
          }}
        >
          ({currentData?.length || 0})
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isCompact ? "fullWidth" : "standard"}
          sx={{
            '& .MuiTab-root': {
              color: grey[500],
              textTransform: 'none',
              fontWeight: 600,
              fontSize: isCompact ? '0.8rem' : '0.9rem',
              '&.Mui-selected': {
                color: teal[300],
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: teal[500],
            },
          }}
        >
          <Tab 
            label={isCompact ? "Disclosures" : "Financial Disclosures"}
          />
          <Tab 
            label={isCompact ? "Activity" : "Trading Activity"}
          />
        </Tabs>
      </Box>

      {/* Search Controls - Only show for Trading Activity tab */}
      {activeTab === 1 && (
        <TradingSearchControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={currentSearchLoading}
          searchActive={searchActive}
          resultsCount={currentData?.length || 0}
        />
      )}

      {/* Content - Flex 1 to take remaining space */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default CongressSection;
