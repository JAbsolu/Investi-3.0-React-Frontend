import { useState, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const useFinancialStatements = () => {
  const [data, setData] = useState({
    incomeStatement: [],
    balanceSheet: [],
    cashFlow: [],
  });
  
  const [loading, setLoading] = useState({
    incomeStatement: false,
    balanceSheet: false,
    cashFlow: false,
  });
  
  const [errors, setErrors] = useState({
    incomeStatement: null,
    balanceSheet: null,
    cashFlow: null,
  });

  const fetchFinancialStatements = useCallback(async (ticker) => {
    if (!ticker) return;

    // Reset previous data
    setData({
      incomeStatement: [],
      balanceSheet: [],
      cashFlow: [],
    });

    setErrors({
      incomeStatement: null,
      balanceSheet: null,
      cashFlow: null,
    });

    setLoading({
      incomeStatement: true,
      balanceSheet: true,
      cashFlow: true,
    });

    const baseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

    // Fetch all three statements in parallel
    const endpoints = [
      { key: 'incomeStatement', url: `${baseUrl}fmp/income-statements?ticker=${ticker}` },
      { key: 'balanceSheet', url: `${baseUrl}fmp/balance-sheet?ticker=${ticker}` },
      { key: 'cashFlow', url: `${baseUrl}fmp/cash-flow?ticker=${ticker}` },
    ];

    const fetchPromises = endpoints.map(async ({ key, url }) => {
      try {
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `Failed to fetch ${key}`);
        }

        setData(prev => ({
          ...prev,
          [key]: Array.isArray(result) ? result : []
        }));

        setErrors(prev => ({
          ...prev,
          [key]: null
        }));

      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        setErrors(prev => ({
          ...prev,
          [key]: error.message
        }));
      } finally {
        setLoading(prev => ({
          ...prev,
          [key]: false
        }));
      }
    });

    await Promise.all(fetchPromises);
  }, []);

  const refreshAllData = useCallback((ticker) => {
    if (ticker) {
      fetchFinancialStatements(ticker);
    }
  }, [fetchFinancialStatements]);

  return {
    data,
    loading,
    errors,
    fetchFinancialStatements,
    refreshAllData,
  };
};
