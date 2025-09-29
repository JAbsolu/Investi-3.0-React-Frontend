import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaExternalLinkAlt, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const NewsCard = ({ newsItem }) => {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    setModalOpen(true);
  };

  const handleReadFullArticle = () => {
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
    <>
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

    {/* News Modal */}
    <Dialog
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: '#0d0d0d',
          color: '#ffffff',
          borderRadius: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${teal[800]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" color="#ffffff">News Article</Typography>
        <IconButton onClick={() => setModalOpen(false)} sx={{ color: grey[400] }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box>
          {image && !imageError && (
            <Box 
              component="img"
              src={image}
              alt={title}
              onError={() => setImageError(true)}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2
              }}
            />
          )}
          <Typography variant="h5" color="#ffffff" fontWeight="bold" mb={2}>
            {title}
          </Typography>
          <Box display="flex" gap={2} mb={2}>
            <Typography variant="body2" color={teal[400]}>
              {publisher || site}
            </Typography>
            <Typography variant="body2" color={grey[400]}>
              {formatDate(publishedDate)}
            </Typography>
            {symbol && (
              <Chip
                label={symbol}
                size="small"
                sx={{
                  backgroundColor: teal[600],
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
          <Typography variant="body1" color={grey[300]} mb={3} sx={{ lineHeight: 1.6 }}>
            {text}
          </Typography>
          <Button
            variant="contained"
            onClick={handleReadFullArticle}
            startIcon={<FaExternalLinkAlt />}
            sx={{
              backgroundColor: teal[600],
              '&:hover': { backgroundColor: teal[700] }
            }}
          >
            Read Full Article
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  </>
  );
};

export default NewsCard;
