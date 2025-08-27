import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const useCongressData = () => {
  const [senateFinDisclosure, setSenateFinDisclosure] = useState([]);
  const [senateTradingActivity, setSenateTradingActivity] = useState([]);
  const [houseFinDisclosure, setHouseFinDisclosure] = useState([]);
  const [houseTradingActivity, setHouseTradingActivity] = useState([]);
  
  const [loading, setLoading] = useState({
    senateFinDisclosure: false,
    senateTradingActivity: false,
    houseFinDisclosure: false,
    houseTradingActivity: false
  });
  
  const [errors, setErrors] = useState({
    senateFinDisclosure: null,
    senateTradingActivity: null,
    houseFinDisclosure: null,
    houseTradingActivity: null
  });

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

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);

  return {
    data: {
      senateFinDisclosure,
      senateTradingActivity,
      houseFinDisclosure,
      houseTradingActivity
    },
    loading,
    errors,
    isLoading,
    hasErrors,
    refetch: fetchAllData
  };
};
