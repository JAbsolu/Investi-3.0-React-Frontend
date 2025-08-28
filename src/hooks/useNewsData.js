import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const useNewsData = () => {
  // State for different news categories
  const [fmpNews, setFmpNews] = useState([]);
  const [generalNews, setGeneralNews] = useState([]);
  const [stockNews, setStockNews] = useState([]);
  const [cryptoNews, setCryptoNews] = useState([]);
  const [forexNews, setForexNews] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    fmpNews: false,
    generalNews: false,
    stockNews: false,
    cryptoNews: false,
    forexNews: false,
    search: false
  });

  // Error states
  const [errors, setErrors] = useState({
    fmpNews: null,
    generalNews: null,
    stockNews: null,
    cryptoNews: null,
    forexNews: null,
    search: null
  });

  // Refs for request cancellation
  const abortControllers = useRef({});
  const searchCache = useRef({});

  // Generic fetch function with error handling and cancellation
  const fetchData = useCallback(async (endpoint, setter, loadingKey) => {
    // Cancel any existing request for this endpoint
    if (abortControllers.current[loadingKey]) {
      abortControllers.current[loadingKey].abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllers.current[loadingKey] = controller;

    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setErrors(prev => ({ ...prev, [loadingKey]: null }));
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const newsArray = Array.isArray(data) ? data : [];
      setter(newsArray);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled:', loadingKey);
        return;
      }
      
      console.error(`Error fetching ${endpoint}:`, err);
      setErrors(prev => ({ ...prev, [loadingKey]: err.message }));
      setter([]);
    } finally {
      // Only clear loading if this request wasn't cancelled
      if (!controller.signal.aborted) {
        setLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
      
      // Clean up the abort controller
      if (abortControllers.current[loadingKey] === controller) {
        delete abortControllers.current[loadingKey];
      }
    }
  }, []);

  // Specific fetch functions for each news category
  const fetchFmpNews = useCallback(() => 
    fetchData('/fmp/news', setFmpNews, 'fmpNews'), [fetchData]);
  
  const fetchGeneralNews = useCallback(() => 
    fetchData('/fmp/general-news', setGeneralNews, 'generalNews'), [fetchData]);
  
  const fetchStockNews = useCallback(() => 
    fetchData('/fmp/latest-stock-news', setStockNews, 'stockNews'), [fetchData]);
  
  const fetchCryptoNews = useCallback(() => 
    fetchData('/fmp/latest-crypto-news', setCryptoNews, 'cryptoNews'), [fetchData]);
  
  const fetchForexNews = useCallback(() => 
    fetchData('/fmp/forex-news', setForexNews, 'forexNews'), [fetchData]);

  // Search news by ticker with caching
  const searchNewsByTicker = useCallback(async (ticker) => {
    if (!ticker.trim() || ticker.length < 1) {
      setSearchResults([]);
      return;
    }

    const cacheKey = ticker.trim().toLowerCase();
    
    // Check cache first
    if (searchCache.current[cacheKey]) {
      console.log('Using cached search result for:', cacheKey);
      setSearchResults(searchCache.current[cacheKey]);
      return searchCache.current[cacheKey];
    }

    // Cancel any existing search request
    if (abortControllers.current.search) {
      abortControllers.current.search.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllers.current.search = controller;

    setLoading(prev => ({ ...prev, search: true }));
    setErrors(prev => ({ ...prev, search: null }));

    try {
      const response = await fetch(
        `${API_URL}/fmp/search-stock-news?ticker=${encodeURIComponent(ticker.trim())}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : [];

      // Cache the results
      searchCache.current[cacheKey] = results;
      setSearchResults(results);

      return results;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Search request was cancelled');
        return;
      }

      console.error('Error searching news by ticker:', err);
      setErrors(prev => ({ ...prev, search: err.message }));
      setSearchResults([]);
      return [];
    } finally {
      // Only clear loading if this request wasn't cancelled
      if (!controller.signal.aborted) {
        setLoading(prev => ({ ...prev, search: false }));
      }

      // Clean up the abort controller
      if (abortControllers.current.search === controller) {
        delete abortControllers.current.search;
      }
    }
  }, []);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setErrors(prev => ({ ...prev, search: null }));
    
    // Cancel any pending search request
    if (abortControllers.current.search) {
      abortControllers.current.search.abort();
      delete abortControllers.current.search;
    }
  }, []);

  // Refresh all news data
  const refreshAllNews = useCallback(async () => {
    await Promise.all([
      fetchFmpNews(),
      fetchGeneralNews(),
      fetchStockNews(),
      fetchCryptoNews(),
      fetchForexNews()
    ]);
  }, [fetchFmpNews, fetchGeneralNews, fetchStockNews, fetchCryptoNews, fetchForexNews]);

  // Initial data fetch
  useEffect(() => {
    refreshAllNews();
  }, [refreshAllNews]);

  // Cleanup effect to cancel pending requests on unmount
  useEffect(() => {
    return () => {
      Object.keys(abortControllers.current).forEach(key => {
        if (abortControllers.current[key]) {
          abortControllers.current[key].abort();
        }
      });
    };
  }, []);

  // Computed states
  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(error => error !== null);

  return {
    // Data
    fmpNews,
    generalNews,
    stockNews,
    cryptoNews,
    forexNews,
    searchResults,
    
    // Loading states
    loading,
    isLoading,
    
    // Error states
    errors,
    hasErrors,
    
    // Actions
    fetchFmpNews,
    fetchGeneralNews,
    fetchStockNews,
    fetchCryptoNews,
    fetchForexNews,
    searchNewsByTicker,
    clearSearch,
    refreshAllNews
  };
};

export default useNewsData;
