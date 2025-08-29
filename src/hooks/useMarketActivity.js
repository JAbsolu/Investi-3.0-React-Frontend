import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const useMarketActivity = () => {
  // State for different market data
  const [biggestGainers, setBiggestGainers] = useState([]);
  const [biggestLosers, setBiggestLosers] = useState([]);
  const [mostTraded, setMostTraded] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    gainers: false,
    losers: false,
    traded: false
  });

  // Error states
  const [errors, setErrors] = useState({
    gainers: null,
    losers: null,
    traded: null
  });

  // Refs for request cancellation
  const abortControllers = useRef({});

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
      const dataArray = Array.isArray(data) ? data.slice(0, 4) : []; // Limit to 4 items
      setter(dataArray);
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

  // Specific fetch functions for each market data type
  const fetchGainers = useCallback(() => 
    fetchData('/fmp/biggest-gainers', setBiggestGainers, 'gainers'), [fetchData]);
  
  const fetchLosers = useCallback(() => 
    fetchData('/fmp/biggest-losers', setBiggestLosers, 'losers'), [fetchData]);
  
  const fetchMostTraded = useCallback(() => 
    fetchData('/fmp/top-traded-stocks', setMostTraded, 'traded'), [fetchData]);

  // Refresh all market data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchGainers(),
      fetchLosers(),
      fetchMostTraded()
    ]);
  }, [fetchGainers, fetchLosers, fetchMostTraded]);

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

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
    biggestGainers,
    biggestLosers,
    mostTraded,
    
    // Loading states
    loading,
    isLoading,
    
    // Error states
    errors,
    hasErrors,
    
    // Actions
    fetchGainers,
    fetchLosers,
    fetchMostTraded,
    refreshAllData
  };
};

export default useMarketActivity;
