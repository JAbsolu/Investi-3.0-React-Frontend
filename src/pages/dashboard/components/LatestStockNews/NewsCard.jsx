import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  CardActionArea
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';

const NewsCard = ({ newsItem }) => {
  const [imageError, setImageError] = useState(false);

  const {
    symbol,
    publishedDate,
    publisher,
    title,
    image,
    site,
    text,
    url
  } = newsItem;

  const handleCardClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: 'rgba(20, 30, 30, 0.4)',
        border: `1px solid rgba(${teal[500]}, 0.3)`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
           borderColor: `rgba(${teal[500]}, 0.6)`,
           backgroundColor: 'rgba(20, 30, 30, 0.6)',
           transform: 'translateY(-4px)',
           boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`
        },
      }}
    >
      <CardActionArea 
        onClick={handleCardClick}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 0
        }}
      >
        {/* Image Section */}
        {image && !imageError && (
          <Box
            sx={{
              width: '100%',
              height: 110,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: teal[900],
            }}
          >
            <img
              src={image || "/image/market.jpg"}
              alt={title}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.9) contrast(1.1)',
                transition: 'all 0.3s ease',
              }}
            />
            {/* Teal overlay gradient */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, rgba(0, 150, 136, 0.1) 0%, rgba(0, 150, 136, 0.05) 50%, transparent 100%)`,
                pointerEvents: 'none',
              }}
            />
            {/* Overlay with symbol */}
            {symbol && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                }}
              >
                <Chip
                  label={symbol}
                  size="small"
                  sx={{
                    backgroundColor: teal[600],
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    boxShadow: `0 2px 8px rgba(0, 150, 136, 0.3)`,
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Content Section */}
        <CardContent 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            '&:last-child': { pb: 2 }
          }}
        >
          {/* Publisher and Date */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: teal[300],
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {publisher || site}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FaCalendarAlt size={10} color={grey[500]} />
              <Typography
                variant="caption"
                sx={{
                  color: grey[500],
                  fontSize: '0.7rem',
                }}
              >
                {formatDate(publishedDate)}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: grey[300],
              fontSize: '0.85rem',
              lineHeight: 1.4,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {truncateText(text)}
          </Typography>

          {/* Read More Link */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center',
              mt: 2,
              gap: 0.5
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: teal[300],
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Read More
            </Typography>
            <FaExternalLinkAlt size={10} color={teal[300]} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default NewsCard;
