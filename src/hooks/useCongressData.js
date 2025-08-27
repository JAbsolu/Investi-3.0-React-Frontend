import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const useCongressData = () => {
  const [senateFinDisclosure, setSenateFinDisclosure] = useState([]);
  const [senateTradingActivity, setSenateTradingActivity] = useState([]);
  const [houseFinDisclosure, setHouseFinDisclosure] = useState([]);
  const [houseTradingActivity, setHouseTradingActivity] = useState([]);
  
  // Search results state
  const [searchResults, setSearchResults] = useState({
    senateByName: [],
    senateByTicker: [],
    houseByName: [],
    houseByTicker: []
  });
  
  const [loading, setLoading] = useState({
    senateFinDisclosure: false,
    senateTradingActivity: false,
    houseFinDisclosure: false,
    houseTradingActivity: false
  });

  // Search loading state
  const [searchLoading, setSearchLoading] = useState({
    senateByName: false,
    senateByTicker: false,
    houseByName: false,
    houseByTicker: false
  });
  
  const [errors, setErrors] = useState({
    senateFinDisclosure: null,
    senateTradingActivity: null,
    houseFinDisclosure: null,
    houseTradingActivity: null
  });

  // Search errors state
  const [searchErrors, setSearchErrors] = useState({
    senateByName: null,
    senateByTicker: null,
    houseByName: null,
    houseByTicker: null
  });

  // Refs for request cancellation
  const abortControllers = useRef({});
  const searchCache = useRef({});

  const fetchData = useCallback(async (endpoint, setter, loadingKey) => {
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setErrors(prev => ({ ...prev, [loadingKey]: null }));
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setter(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setErrors(prev => ({ ...prev, [loadingKey]: err.message }));
      setter([]);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  // Generic search function with caching and request cancellation
  const searchData = useCallback(async (query, searchType, chamber) => {
    if (!query.trim() || query.length < 2) {
      return;
    }

    const searchKey = `${chamber}By${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;
    const cacheKey = `${searchKey}_${query.trim().toLowerCase()}`;
    
    // Check cache first
    if (searchCache.current[cacheKey]) {
      console.log('Using cached search result for:', cacheKey);
      setSearchResults(prev => ({ 
        ...prev, 
        [searchKey]: searchCache.current[cacheKey] 
      }));
      return searchCache.current[cacheKey];
    }

    // Cancel any existing request for this search type
    if (abortControllers.current[searchKey]) {
      console.log('Cancelling previous request for:', searchKey);
      abortControllers.current[searchKey].abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllers.current[searchKey] = controller;
    
    setSearchLoading(prev => ({ ...prev, [searchKey]: true }));
    setSearchErrors(prev => ({ ...prev, [searchKey]: null }));
    
    try {
      let endpoint = '';
      const encodedQuery = encodeURIComponent(query.trim());
      
      if (chamber === 'senate') {
        endpoint = searchType === 'name' 
          ? `/fmp/senate-trades-by-name?name=${encodedQuery}`
          : `/fmp/senate-trading-activity?ticker=${encodedQuery}`;
      } else {
        endpoint = searchType === 'name'
          ? `/fmp/house-trades-by-name?name=${encodedQuery}`
          : `/fmp/house-trading-activity?ticker=${encodedQuery}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : [];
      
      // Cache the results
      searchCache.current[cacheKey] = results;
      
      setSearchResults(prev => ({ 
        ...prev, 
        [searchKey]: results 
      }));
      
      return results;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Search request was cancelled:', searchKey);
        return;
      }
      
      console.error(`Error searching ${chamber} by ${searchType}:`, err);
      setSearchErrors(prev => ({ ...prev, [searchKey]: err.message }));
      setSearchResults(prev => ({ ...prev, [searchKey]: [] }));
      return [];
    } finally {
      // Only clear loading if this request wasn't cancelled
      if (!controller.signal.aborted) {
        setSearchLoading(prev => ({ ...prev, [searchKey]: false }));
      }
      
      // Clean up the abort controller
      if (abortControllers.current[searchKey] === controller) {
        delete abortControllers.current[searchKey];
      }
    }
  }, []);

  // Specific search functions
  const searchSenateTradingByName = useCallback((name) => searchData(name, 'name', 'senate'), [searchData]);
  const searchSenateTradingByTicker = useCallback((ticker) => searchData(ticker, 'ticker', 'senate'), [searchData]);
  const searchHouseTradingByName = useCallback((name) => searchData(name, 'name', 'house'), [searchData]);
  const searchHouseTradingByTicker = useCallback((ticker) => searchData(ticker, 'ticker', 'house'), [searchData]);

  // Clear search results
  const clearSearchResults = useCallback((chamber, searchType) => {
    // Cancel any pending requests
    Object.keys(abortControllers.current).forEach(key => {
      if (abortControllers.current[key]) {
        abortControllers.current[key].abort();
        delete abortControllers.current[key];
      }
    });

    if (chamber && searchType) {
      const searchKey = `${chamber}By${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;
      setSearchResults(prev => ({ ...prev, [searchKey]: [] }));
      setSearchErrors(prev => ({ ...prev, [searchKey]: null }));
      setSearchLoading(prev => ({ ...prev, [searchKey]: false }));
    } else {
      // Clear all search results
      setSearchResults({
        senateByName: [],
        senateByTicker: [],
        houseByName: [],
        houseByTicker: []
      });
      setSearchErrors({
        senateByName: null,
        senateByTicker: null,
        houseByName: null,
        houseByTicker: null
      });
      setSearchLoading({
        senateByName: false,
        senateByTicker: false,
        houseByName: false,
        houseByTicker: false
      });
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchData('/fmp/senate-fin-disclosure', setSenateFinDisclosure, 'senateFinDisclosure'),
      fetchData('/fmp/senate-trading-activity', setSenateTradingActivity, 'senateTradingActivity'),
      fetchData('/fmp/house-fin-disclosure', setHouseFinDisclosure, 'houseFinDisclosure'),
      fetchData('/fmp/house-trading-activity', setHouseTradingActivity, 'houseTradingActivity')
    ]);
  }, [fetchData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);
  const isSearchLoading = Object.values(searchLoading).some(Boolean);
  const hasSearchErrors = Object.values(searchErrors).some(Boolean);

  return {
    data: {
      senateFinDisclosure,
      senateTradingActivity,
      houseFinDisclosure,
      houseTradingActivity
    },
    searchResults,
    loading,
    searchLoading,
    errors,
    searchErrors,
    isLoading,
    hasErrors,
    isSearchLoading,
    hasSearchErrors,
    refreshData: fetchAllData,
    searchSenateTradingByName,
    searchSenateTradingByTicker,
    searchHouseTradingByName,
    searchHouseTradingByTicker,
    clearSearchResults
  };
};
