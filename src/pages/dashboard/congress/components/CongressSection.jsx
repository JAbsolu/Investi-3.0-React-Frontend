import React, { useState, useEffect } from 'react';
import { FaRedo, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Helper to format date as "Month Day Year"
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Sub-components for rendering table, card, and search controls
const TransactionTable = ({ transactions, onStockClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedTransactions = React.useMemo(() => {
    if (!sortConfig.key) return transactions;
    const sorted = [...transactions].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [transactions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-700">
          <tr className="text-zinc-400">
            <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('transactionDate')}>
              Transaction Date {sortConfig.key === 'transactionDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('disclosureDate')}>
              Disclosure Date {sortConfig.key === 'disclosureDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('office')}>
              Member {sortConfig.key === 'office' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('symbol')}>
              Stock {sortConfig.key === 'symbol' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('type')}>
              Type {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-right py-3 px-4 cursor-pointer" onClick={() => handleSort('amount')}>
              Amount {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((t, i) => (
            <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
              <td className="py-3 px-4 text-zinc-300">{formatDate(t.transactionDate)}</td>
              <td className="py-3 px-4 text-zinc-300">{formatDate(t.disclosureDate)}</td>
              <td className="py-3 px-4 text-zinc-300">
                {t.office || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'N/A'}
              </td>
              <td className="py-3 px-4">
                <button 
                  onClick={() => onStockClick?.(t.symbol)}
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {t.symbol || t.assetDescription || 'N/A'}
                </button>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  t.type === 'Purchase' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'
                }`}>
                  {t.type || 'N/A'}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-zinc-300">{t.amount || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TransactionCard = ({ transaction, onStockClick }) => (
  <div className="bg-zinc-800/50 rounded-lg p-4 mb-3 border border-zinc-700/50 hover:border-teal-700/50 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div className="text-zinc-300 font-medium">
        {transaction.office || `${transaction.firstName || ''} ${transaction.lastName || ''}`.trim() || 'N/A'}
      </div>
      <span className={`px-2 py-1 rounded text-xs ${
        transaction.type === 'Purchase' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'
      }`}>
        {transaction.type || 'N/A'}
      </span>
    </div>
    <button 
      onClick={() => onStockClick?.(transaction.symbol)}
      className="text-teal-400 hover:text-teal-300 font-semibold mb-1 transition-colors"
    >
      {transaction.symbol || transaction.assetDescription || 'N/A'}
    </button>
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{transaction.transactionDate || transaction.disclosureDate || 'N/A'}</span>
      <span className="text-zinc-300">{transaction.amount || 'N/A'}</span>
    </div>
  </div>
);

const TradingSearchControls = ({ 
  searchQuery, 
  setSearchQuery, 
  searchType, 
  setSearchType, 
  onSearch, 
  onClear, 
  loading, 
  searchActive,
  resultsCount 
}) => (
  <div className="mb-4 space-y-3">
    <div className="flex gap-2">
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        <option value="name">By Name</option>
        <option value="stock">By Stock</option>
      </select>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
        placeholder={`Search ${searchType === 'name' ? 'member name' : 'stock ticker'}...`}
        className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-zinc-500"
      />
      <button
        onClick={() => onSearch(searchQuery)}
        disabled={loading || searchQuery.length < 2}
        className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
      >
        Search
      </button>
      {searchActive && (
        <button
          onClick={onClear}
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-4 py-2 rounded-lg transition-colors"
        >
          Clear
        </button>
      )}
    </div>
    {searchActive && (
      <div className="text-sm text-zinc-400">
        Found {resultsCount} result{resultsCount !== 1 ? 's' : ''} for "{searchQuery}"
      </div>
    )}
  </div>
);

const CongressSection = ({ 
  title, 
  icon, 
  finDisclosureData, 
  tradingActivityData, 
  loading, 
  errors, 
  onRefresh,
  isCompact = false,
  constrained = false,
  searchResults = {},
  searchLoading = {},
  searchErrors = {},
  onSearch,
  onClearSearch,
  onStockClick,
  chamber = 'senate'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchActive, setSearchActive] = useState(false);

  // Responsive: mobile if width < 768px, and update on resize
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    setCurrentPage(0);
    if (newValue === 0 && searchActive) {
      handleClearSearch();
    }
  };

  const getCurrentData = () => {
    if (activeTab === 0) {
      return finDisclosureData;
    } else {
      if (searchActive && searchQuery.trim() && searchQuery.length >= 2) {
        const searchKey = `${chamber}By${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;
        return searchResults[searchKey] || [];
      }
      return tradingActivityData;
    }
  };

  const currentData = getCurrentData();
  const currentLoading = activeTab === 0 ? loading.finDisclosure : loading.tradingActivity;
  const currentError = activeTab === 0 ? errors.finDisclosure : errors.tradingActivity;
  
  const isSearching = searchActive && searchQuery.trim() && searchQuery.length >= 2 && activeTab === 1;
  const searchKey = `${chamber}By${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`;
  const currentSearchLoading = isSearching ? searchLoading[searchKey] : false;
  const currentSearchError = isSearching ? searchErrors[searchKey] : null;

  const handleSearch = (query) => {
    if (query.trim() && query.length >= 2) {
      setSearchActive(true);
      setCurrentPage(0);
      onSearch(query, searchType, chamber);
    }
  };

  const handleClearSearch = () => {
    setSearchActive(false);
    setSearchQuery('');
    setCurrentPage(0);
    onClearSearch(chamber, searchType);
  };

  const rowsPerPage = constrained ? (isMobile ? 6 : 8) : (isMobile ? 10 : 25);
  const totalPages = Math.ceil((currentData?.length || 0) / rowsPerPage);
  const paginatedData = currentData?.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  ) || [];

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderContent = () => {
    if (currentSearchLoading) {
      return (
        <div className="flex justify-center items-center bg-zinc-900 rounded-lg border border-teal-800 p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
        </div>
      );
    }

    if (currentSearchError) {
      return (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-rose-400">
              <span>⚠</span>
              <span>Search failed: {currentSearchError}</span>
            </div>
            <button
              onClick={() => handleSearch(searchQuery)}
              className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
            >
              <FaRedo className="text-sm" />
              Retry Search
            </button>
          </div>
        </div>
      );
    }

    if (currentLoading) {
      return (
        <div className="flex justify-center items-center bg-zinc-900 rounded-lg border border-teal-800 p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
        </div>
      );
    }

    if (currentError) {
      return (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-rose-400">
              <span>⚠</span>
              <span>Failed to load data: {currentError}</span>
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
            >
              <FaRedo className="text-sm" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!currentData || currentData.length === 0) {
      const message = searchActive && searchQuery.trim() && searchQuery.length >= 2
        ? `No ${searchType === 'name' ? 'members' : 'transactions'} found for "${searchQuery}"`
        : 'No transactions available';
        
      return (
        <div className="text-center py-12 bg-zinc-900 rounded-lg border border-teal-800">
          <p className="text-zinc-500 italic mb-3">{message}</p>
          {searchActive && searchQuery.trim() && searchQuery.length >= 2 ? (
            <button
              onClick={handleClearSearch}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors mx-auto"
            >
              <FaRedo className="text-sm" />
              Refresh
            </button>
          )}
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            {paginatedData.map((transaction, index) => (
              <TransactionCard key={index} transaction={transaction} onStockClick={onStockClick} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
                className={`p-2 rounded ${currentPage === 0 ? 'text-zinc-600' : 'text-teal-400 hover:bg-zinc-800'} transition-colors`}
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-zinc-500">
                Page {currentPage + 1} of {totalPages} • {currentData?.length || 0} total
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage >= totalPages - 1}
                className={`p-2 rounded ${currentPage >= totalPages - 1 ? 'text-zinc-600' : 'text-teal-400 hover:bg-zinc-800'} transition-colors`}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <TransactionTable 
            transactions={paginatedData} 
            onStockClick={onStockClick}
          />
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-teal-400 hover:bg-zinc-800'
              }`}
            >
              <FaChevronLeft />
              <span className="text-sm">Previous</span>
            </button>
            <span className="text-sm text-zinc-500">
              Page {currentPage + 1} of {totalPages} • Showing {paginatedData.length} of {currentData?.length || 0}
            </span>
            <button
              onClick={() => handlePageChange('next')}
              disabled={currentPage >= totalPages - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage >= totalPages - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-teal-400 hover:bg-zinc-800'
              }`}
            >
              <span className="text-sm">Next</span>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${constrained ? 'h-full' : ''} flex flex-col ${isCompact ? 'mb-8' : 'mb-12'}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className={`text-teal-400 ${isCompact ? 'text-xl' : 'text-2xl'}`}>
          {icon}
        </div>
        <h2 className={`text-teal-300 font-semibold ${isCompact ? 'text-xl' : 'text-2xl'}`}>
          {title}
        </h2>
        <span className="text-zinc-500 text-sm ml-auto">
          ({currentData?.length || 0})
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex border-b border-zinc-700">
          <button
            onClick={() => handleTabChange(0)}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 0 
                ? 'text-teal-300' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {"Financial Disclosures"}
            {activeTab === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 1 
                ? 'text-teal-300' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {"Trading Activity"}
            {activeTab === 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
            )}
          </button>
        </div>
      </div>

      {/* Search Controls */}
      {activeTab === 1 && (
        <TradingSearchControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={currentSearchLoading}
          searchActive={searchActive}
          resultsCount={currentData?.length || 0}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default CongressSection;