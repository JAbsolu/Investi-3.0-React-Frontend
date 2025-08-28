import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { teal, grey, blue } from '@mui/material/colors';
import { FaExternalLinkAlt, FaClock, FaNewspaper, FaUser } from 'react-icons/fa';

const FeaturedNewsCard = ({ article, category = 'general' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    title,
    content,
    text,
    date,
    publishedDate,
    author,
    publisher,
    site,
    symbol,
    tickers,
    image,
    link,
    url
  } = article;

  // Determine the actual values based on different API response formats
  const articleTitle = title || '';
  const articleContent = content || text || '';
  const articleDate = date || publishedDate || '';
  const articleAuthor = author || publisher || '';
  const articleSite = site || '';
  const articleSymbol = symbol || (tickers && tickers.split(',')[0]);
  const articleUrl = link || url || '';

  // Default image based on category
  const getDefaultImage = () => {
    const basePath = '/image';
    switch (category) {
      case 'stock': return `${basePath}/market.jpg`;
      case 'crypto': return `${basePath}/market.jpg`;
      case 'forex': return `${basePath}/market.jpg`;
      case 'fmp': return `${basePath}/market.jpg`;
      default: return `${basePath}/market.jpg`;
    }
  };

  const finalImage = image || getDefaultImage();

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (articleUrl) {
      window.open(articleUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Strip HTML tags from content for preview
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get preview text (first 200 characters for featured)
  const getPreviewText = () => {
    const cleanText = stripHtml(articleContent);
    return cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;
  };

  // Category colors
  const getCategoryColor = () => {
    switch (category) {
      case 'fmp': return teal[500];
      case 'stock': return blue[500];
      case 'crypto': return '#f7931e'; // Bitcoin orange
      case 'forex': return '#9c27b0'; // Purple
      case 'general': return grey[500];
      default: return grey[500];
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'fmp': return 'FMP News';
      case 'stock': return 'Stock News';
      case 'crypto': return 'Crypto News';
      case 'forex': return 'Forex News';
      case 'general': return 'General News';
      default: return 'Breaking News';
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: '#0d0d0d',
        border: `1px solid ${teal[800]}`,
        borderRadius: 3,
        mb: 4,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        '&:hover': {
          borderColor: teal[500],
          backgroundColor: '#1a1a1a',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'auto' : 400
      }}>
        {/* Content Section */}
        <Box sx={{ 
          flex: isMobile ? 'none' : 1, 
          display: 'flex', 
          flexDirection: 'column',
          order: isMobile ? 2 : 1
        }}>
          <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header with Category and Symbol */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Chip
                label={getCategoryLabel()}
                size="medium"
                sx={{
                  backgroundColor: getCategoryColor(),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  px: 2,
                }}
              />
              {articleSymbol && (
                <Chip
                  label={articleSymbol}
                  size="medium"
                  variant="outlined"
                  sx={{
                    borderColor: teal[600],
                    color: teal[300],
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Box>

            {/* Title */}
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: isMobile ? '1.75rem' : '2.25rem',
                lineHeight: 1.2,
                mb: 3,
                cursor: 'pointer',
                '&:hover': {
                  color: teal[300],
                },
              }}
              onClick={handleLinkClick}
            >
              {articleTitle}
            </Typography>

            {/* Content Preview */}
            {articleContent && (
              <Typography
                variant="body1"
                sx={{
                  color: grey[300],
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: '1.1rem',
                  flex: 1,
                }}
              >
                {getPreviewText()}
              </Typography>
            )}

            {/* Bottom Section */}
            <Box sx={{ mt: 'auto' }}>
              {/* Author/Publisher and Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {articleAuthor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, backgroundColor: teal[600] }}>
                        <FaUser size={16} />
                      </Avatar>
                      <Typography variant="body2" sx={{ color: teal[300], fontWeight: 600 }}>
                        {articleAuthor}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {articleDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaClock size={16} color={grey[500]} />
                    <Typography variant="body2" sx={{ color: grey[400] }}>
                      {formatDate(articleDate)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Site and External Link */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {articleSite && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaNewspaper size={16} color={teal[400]} />
                    <Typography variant="body2" sx={{ color: teal[400], fontWeight: 500 }}>
                      {articleSite}
                    </Typography>
                  </Box>
                )}

                {articleUrl && (
                  <IconButton
                    size="large"
                    onClick={handleLinkClick}
                    sx={{
                      color: teal[400],
                      backgroundColor: 'rgba(20, 184, 166, 0.1)',
                      border: `2px solid ${teal[700]}`,
                      width: 48,
                      height: 48,
                      '&:hover': {
                        color: teal[200],
                        backgroundColor: 'rgba(20, 184, 166, 0.2)',
                        borderColor: teal[500],
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <FaExternalLinkAlt size={18} />
                  </IconButton>
                )}
              </Box>
            </Box>
          </CardContent>
        </Box>

        {/* Image Section */}
        <Box sx={{ 
          flex: isMobile ? 'none' : 1,
          order: isMobile ? 1 : 2,
          height: isMobile ? 250 : 'auto'
        }}>
          <CardMedia
            component="img"
            image={finalImage}
            alt={articleTitle}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Fallback to default image if original fails
              if (e.target.src !== getDefaultImage()) {
                e.target.src = getDefaultImage();
              }
            }}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default FeaturedNewsCard;
