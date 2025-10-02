import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { grey, teal } from '@mui/material/colors';

const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

export default function NewsLayout({ newsData = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNewsContent = (news) => {
    if (news?.content) return news.content;
    if (news?.text) return news.text;
    if (news?.description) return news.description;
    return 'No additional content available.';
  };

  const hasHtmlContent = (news) => {
    const content = getNewsContent(news);
    return content && content.includes('<');
  };

  const handleNewsClick = (article, event) => {
    event.preventDefault();
    setSelectedNews(article);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNews(null);
  };

  const renderMobileCard = (article, index) => {
    return (
      <div 
        key={index}
        onClick={(e) => handleNewsClick(article, e)}
        className="block bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer"
      >
        <div className="relative h-80 overflow-hidden">
          <img 
            src={article.image || '/image/market.jpg'} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2 py-1 rounded">
              {article.symbol}
            </span>
            <span className="text-xs text-zinc-500">
              {article.publisher}
            </span>
          </div>
          <h3 className="text-cyan-400 text-xl font-medium mb-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
            {article.text}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs">{formatDate(article.publishedDate)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopCard = (article, index, isFeatured = false) => {
    if (isFeatured) {
      return (
        <div 
          key={index}
          onClick={(e) => handleNewsClick(article, e)}
          className="block bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-zinc-800 transition-all cursor-pointer"
        >
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2 py-1 rounded">
                  {article.symbol}
                </span>
                <span className="text-xs text-zinc-500">{article.publisher}</span>
              </div>
              <h2 className="text-4xl font-serif text-white mb-4 leading-tight">
                {article.title}
              </h2>
              <div className="flex items-center text-zinc-500 text-sm mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Published {formatDate(article.publishedDate)}
              </div>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6 max-h-14 overflow-hidden">
                {article.text}
              </p>
              <div className="flex items-center">
                <span className="text-zinc-400 text-sm">{article.site}</span>
              </div>
            </div>
            <div className="md:w-1/2 h-full min-h-[400px]">
              <img 
                src={article.image || '/image/market.jpg'} 
                alt={article.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={index}
        onClick={(e) => handleNewsClick(article, e)}
        className="block bg-zinc-900 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-zinc-800 transition-all"
      >
        <div className="relative h-64 overflow-hidden">
          <img 
            src={article.image || '/image/market.jpg'} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2 py-1 rounded">
              {article.symbol}
            </span>
            <span className="text-xs text-zinc-500">{article.publisher}</span>
          </div>
          <h3 className="text-white text-xl font-medium mb-3 leading-snug group-hover:text-zinc-300 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">{formatDate(article.publishedDate)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopGroup = (articles) => {
    if (articles.length === 0) return null;
    
    const featured = articles[0];
    const cards = articles.slice(1, 4);

    return (
      <div className="space-y-6">
        {renderDesktopCard(featured, 0, true)}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => renderDesktopCard(card, idx + 1, false))}
          </div>
        )}
      </div>
    );
  };

  // Group news into sets of 4 for desktop
  const newsGroups = [];
  for (let i = 0; i < newsData.length; i += 4) {
    newsGroups.push(newsData.slice(i, i + 4));
  }

  return (
    <>
      <div className="min-h-screen bg-none">
        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4">
          {newsData.length > 0 ? (
            newsData.map((article, idx) => renderMobileCard(article, idx))
          ) : (
            <div className="text-center text-zinc-500 py-20">
              No news articles available
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block p-0" style={{ background: "transparent"}}>
          <div className="max-w-7xl mx-auto space-y-12">
            {newsGroups.length > 0 ? (
              newsGroups.map((group, idx) => (
                <div key={idx}>
                  {renderDesktopGroup(group)}
                </div>
              ))
            ) : (
              <div className="text-center text-zinc-500 py-20">
                No news articles available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News Content Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkBg,
            backgroundImage: darkGradient,
            border: `1px solid ${teal[800]}`,
            borderRadius: 3,
            maxHeight: '90vh',
          }
        }}
      >
        {selectedNews && (
          <>
            <DialogTitle sx={{ 
              color: white, 
              borderBottom: `1px solid ${teal[800]}`,
              pb: 2
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                {selectedNews.title}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Typography fontSize="0.9rem" color={teal[400]}>
                  {selectedNews.publisher}
                </Typography>
                {selectedNews.publishedDate && (
                  <Typography fontSize="0.9rem" color={grey[400]}>
                    {formatDate(selectedNews.publishedDate)}
                  </Typography>
                )}
              </Box>
            </DialogTitle>

            <DialogContent sx={{ color: white, py: 3 }}>
              {/* Image */}
              {selectedNews.image && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <img
                    src={selectedNews.image || '/image/market.jpg'}
                    alt={selectedNews.title}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: `1px solid ${grey[700]}`,
                    }}
                  />
                </Box>
              )}

              {/* Content */}
              <Box>
                {hasHtmlContent(selectedNews) ? (
                  <Box
                    dangerouslySetInnerHTML={{ 
                      __html: getNewsContent(selectedNews) 
                    }}
                    sx={{
                      color: white,
                      lineHeight: 1.7,
                      '& p': {
                        marginBottom: 2,
                        color: grey[300],
                      },
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: teal[300],
                        marginBottom: 2,
                        marginTop: 3,
                      },
                      '& a': {
                        color: teal[400],
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        border: `1px solid ${grey[700]}`,
                        margin: '16px 0',
                      },
                      '& blockquote': {
                        borderLeft: `4px solid ${teal[500]}`,
                        paddingLeft: 2,
                        margin: '16px 0',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        padding: 2,
                        borderRadius: 1,
                      },
                      '& code': {
                        backgroundColor: grey[800],
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                      },
                      '& pre': {
                        backgroundColor: grey[900],
                        padding: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        border: `1px solid ${grey[700]}`,
                      },
                    }}
                  />
                ) : (
                  <Typography sx={{ 
                    color: grey[300], 
                    lineHeight: 1.7,
                    fontSize: '1rem'
                  }}>
                    {getNewsContent(selectedNews)}
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ 
              borderTop: `1px solid ${teal[800]}`,
              px: 3,
              py: 2,
              gap: 2
            }}>
              <Button 
                onClick={handleCloseModal}
                sx={{ 
                  color: grey[400],
                  '&:hover': { 
                    color: white,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Close
              </Button>
              {selectedNews.url && (
                <Button
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  sx={{
                    color: teal[400],
                    borderColor: teal[600],
                    '&:hover': {
                      borderColor: teal[500],
                      backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    },
                  }}
                  startIcon={<FaExternalLinkAlt />}
                >
                  Read Full Article
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}