import { useState, useCallback } from 'react';
import { getStartDay } from '../util';

const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";

export const useStockData = () => {
  const [stockData, setStockData] = useState([]);
  const [currentStock, setCurrentStock] = useState("");
  const [candleSticksData, setCandleSticksData] = useState([]);
  const [companyMetadata, setCompanyMetadata] = useState([]);
  const [stockNews, setStockNews] = useState([]);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const handleApiCall = useCallback(async (key, apiCall) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: error.message }));
      console.log(`Error in ${key}:`, error.message);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const getCandleSticks = useCallback(async (ticker, startDate) => {
    return handleApiCall('candlesticks', async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const url = `${API_URL}/fmp/chart?ticker=${ticker}&interval=5min&from=${startDate}&to=${endDate}&resampleFreq=4hour`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch candlesticks');
      }

      const dataArray = Array.isArray(result) ? result : result.data || [];
      setCandleSticksData(dataArray);
      return dataArray;
    });
  }, [handleApiCall]);

  const getStockData = useCallback(async (ticker) => {
    return handleApiCall('stockData', async () => {
      const response = await fetch(`${API_URL}/yf/stockdata?ticker=${ticker}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch stock data');
      }

      if (result?.data?.body && result.data.body.length > 0) {
        const stockDataResult = result.data.body[0];
        setStockData(stockDataResult);
        return stockDataResult;
      } else {
        throw new Error('No valid stock data in response');
      }
    });
  }, [handleApiCall]);

  const getCompanyMetadata = useCallback(async (ticker) => {
    return handleApiCall('companyMetadata', async () => {
      const response = await fetch(`${API_URL}/tiingo/company-metadata?ticker=${ticker}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch company metadata');
      }

      setCompanyMetadata(result.data);
      return result.data;
    });
  }, [handleApiCall]);

  const getNews = useCallback(async (ticker) => {
    return handleApiCall('news', async () => {
      const url = ticker ? `${API_URL}/tiingo/news?ticker=${ticker}` : `${API_URL}/tiingo/news`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch news');
      }

      setStockNews(result.data);
      return result.data;
    });
  }, [handleApiCall]);

  const searchStock = useCallback(async (ticker) => {
    if (!ticker) return;
    
    setCurrentStock(ticker);
    const startDate = getStartDay();
    
    // Execute all API calls in parallel
    await Promise.all([
      getStockData(ticker),
      getCandleSticks(ticker, startDate),
      getCompanyMetadata(ticker),
      getNews(ticker)
    ]);
  }, [getStockData, getCandleSticks, getCompanyMetadata, getNews]);

  return {
    // State
    stockData,
    currentStock,
    candleSticksData,
    companyMetadata,
    stockNews,
    loading,
    errors,
    
    // Actions
    searchStock,
    getCandleSticks,
    getStockData,
    getCompanyMetadata,
    getNews,
    setCurrentStock
  };
};