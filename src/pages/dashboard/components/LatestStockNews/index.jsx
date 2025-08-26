import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaNewspaper, FaRedo } from 'react-icons/fa';
import NewsCard from './NewsCard';
import { useLatestNews } from '../../../../hooks/useLatestNews';

const LatestStockNews = () => {
  const {
    news,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch,
    hasNextPage,
    hasPrevPage
  } = useLatestNews();

  const handleRetry = () => {
    refetch();
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaNewspaper color={teal[400]} size={20} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: teal[300], 
                fontWeight: 'bold',
                fontSize: '2rem'
              }}
            >
              Latest Stock News
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 200,
            backgroundColor: 'rgba(20, 30, 20, 0.3)',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <CircularProgress sx={{ color: teal[400] }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaNewspaper color={teal[400]} size={20} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: teal[300], 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              Latest Stock News
            </Typography>
          </Box>
        </Box>
        
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
              onClick={handleRetry}
              sx={{ color: teal[400] }}
              startIcon={<FaRedo />}
            >
              Retry
            </Button>
          }
        >
          Failed to load news: {error}
        </Alert>
      </Box>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaNewspaper color={teal[400]} size={20} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: teal[300], 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              Latest Stock News
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6,
            backgroundColor: 'rgba(20, 30, 20, 0.3)',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <Typography color={grey[500]} sx={{ fontStyle: 'italic' }}>
            No news available at the moment
          </Typography>
          <Button
            size="small"
            onClick={handleRetry}
            sx={{ color: teal[400], mt: 1 }}
            startIcon={<FaRedo />}
          >
            Refresh
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaNewspaper color={teal[400]} size={20} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: teal[300], 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            Latest Stock News
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: grey[500],
              ml: 1,
              fontSize: '0.75rem'
            }}
          >
            ({totalItems} articles)
          </Typography>
        </Box>
        
        {/* Pagination Info */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: grey[500],
            fontSize: '0.75rem'
          }}
        >
          Page {currentPage} of {totalPages}
        </Typography>
      </Box>

      {/* News Cards */}
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}
      >
        {news.map((newsItem, index) => (
          <Box
            key={`${newsItem.url}-${index}`}
            sx={{
              flex: '1 1 280px',
              minWidth: '280px',
              maxWidth: '400px'
            }}
          >
            <NewsCard newsItem={newsItem} />
          </Box>
        ))}
      </Box>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            mt: 4,
            gap: 2
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => goToPage(page)}
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                border: `1px solid ${grey[700]}`,
                '&:hover': {
                  backgroundColor: 'rgba(0, 150, 136, 0.1)',
                  borderColor: teal[600],
                },
                '&.Mui-selected': {
                  backgroundColor: teal[600],
                  borderColor: teal[600],
                  color: 'white',
                  '&:hover': {
                    backgroundColor: teal[700],
                  },
                },
              },
            }}
          />

        </Box>
      )}
    </Box>
  );
};

export default LatestStockNews;
