import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { teal, grey, blue } from '@mui/material/colors';
import { FaExternalLinkAlt, FaClock, FaNewspaper, FaUser } from 'react-icons/fa';

const NewsCard = ({ article, category = 'general' }) => {
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
  const articleImage = image;
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

  const finalImage = articleImage || getDefaultImage();

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

  // Get preview text (first 150 characters)
  const getPreviewText = () => {
    const cleanText = stripHtml(articleContent);
    return cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
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
      default: return 'News';
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: teal[50],
        borderRadius: 3,
        mb: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(20, 184, 166, 0.15)',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: teal[100],
          boxShadow: '0 8px 16px rgba(20, 184, 166, 0.25)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease-in-out',
      }}
      onClick={handleLinkClick}
    >
      {/* Image Section - Always show */}
      <CardMedia
        component="img"
        height="200"
        image={finalImage}
        alt={articleTitle}
        sx={{
          objectFit: 'cover',
        }}
        onError={(e) => {
          // Fallback to default image if original fails
          if (e.target.src !== getDefaultImage()) {
            e.target.src = getDefaultImage();
          }
        }}
      />

      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with Category and Symbol */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={getCategoryLabel()}
            size="small"
            sx={{
              backgroundColor: teal[600],
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
            }}
          />
          {articleSymbol && (
            <Chip
              label={articleSymbol}
              size="small"
              variant="outlined"
              sx={{
                borderColor: teal[400],
                color: teal[700],
                fontSize: '0.7rem',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            color: '#0d1421',
            fontWeight: 700,
            fontSize: '1.1rem',
            lineHeight: 1.3,
            mb: 2,
            cursor: 'pointer',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6rem', // Ensure consistent height for 2 lines
            '&:hover': {
              color: teal[700],
            },
          }}
          onClick={handleLinkClick}
        >
          {articleTitle}
        </Typography>

        {/* Content Preview */}
        {articleContent && (
          <Typography
            variant="body2"
            sx={{
              color: '#374151',
              mb: 2,
              lineHeight: 1.6,
              fontSize: '0.9rem',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {getPreviewText()}
          </Typography>
        )}

        {/* Bottom Section - Author/Publisher and Date */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
              {articleAuthor && (
                <>
                  <Avatar sx={{ width: 20, height: 20, backgroundColor: teal[600] }}>
                    <FaUser size={10} />
                  </Avatar>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: teal[700], 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {articleAuthor}
                  </Typography>
                </>
              )}
            </Box>

            {articleDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <FaClock size={10} color={teal[500]} />
                <Typography variant="caption" sx={{ color: teal[600], fontSize: '0.75rem', fontWeight: 500 }}>
                  {formatDate(articleDate)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Site and External Link */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${teal[200]}` }}>
            {articleSite && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                <FaNewspaper size={10} color={teal[600]} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: teal[600], 
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}
                >
                  {articleSite}
                </Typography>
              </Box>
            )}

            <Typography 
              variant="caption" 
              sx={{ 
                color: teal[600], 
                fontWeight: 700,
                fontSize: '0.75rem',
                ml: 'auto',
                '&:hover': { color: teal[800] }
              }}
            >
              Read Article →
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
