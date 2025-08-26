import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const useLatestNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // Show only 1 row of 4 items

  const fetchLatestNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/fmp/latest-stock-news`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching latest news:', err);
      setError(err.message || 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = news.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Reset to first page when news changes
  useEffect(() => {
    setCurrentPage(1);
  }, [news.length]);

  // Fetch news on mount
  useEffect(() => {
    fetchLatestNews();
  }, [fetchLatestNews]);

  return {
    news: currentNews,
    allNews: news,
    loading,
    error,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: news.length,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch: fetchLatestNews,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
