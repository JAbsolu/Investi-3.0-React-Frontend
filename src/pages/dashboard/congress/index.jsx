import React, { useState } from 'react';
import { FaUniversity, FaLandmark, FaRedo, FaBars } from 'react-icons/fa';
import CongressSection from './components/CongressSection';
import { useCongressData } from '../../../hooks/useCongressData';
import { useWishlist } from '../../../hooks/useWishlist';
import DashboardSidebar from '../components/DashboardSidebar';
import StockDetailsModal from '../components/StockDetailsModal';

const CongressPage = () => {
  const { 
    data, 
    loading, 
    errors, 
    refreshData,
    searchResults,
    searchLoading,
    searchErrors,
    searchSenateTradingByName,
    searchSenateTradingByTicker,
    searchHouseTradingByName,
    searchHouseTradingByTicker,
    clearSearchResults
  } = useCongressData();
  
  const { wishlist, addToWishlist } = useWishlist();
  
  // Detect screen sizes
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // State for mobile sidebar, tab navigation, and stock modal
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = Senate, 1 = House
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    clearSearchResults();
  };

  // Handle search functionality
  const handleSearch = async (query, searchType, chamber) => {
    if (chamber === 'senate') {
      if (searchType === 'name') {
        await searchSenateTradingByName(query);
      } else {
        await searchSenateTradingByTicker(query);
      }
    } else {
      if (searchType === 'name') {
        await searchHouseTradingByName(query);
      } else {
        await searchHouseTradingByTicker(query);
      }
    }
  };

  const handleClearSearch = (chamber, searchType) => {
    clearSearchResults(chamber, searchType);
  };

  // Handle stock click
  const handleStockClick = (symbol) => {
    if (symbol) {
      setSelectedStock({
        symbol: symbol,
        name: symbol
      });
      setStockModalOpen(true);
    }
  };

  const handleCloseStockModal = () => {
    setStockModalOpen(false);
    setSelectedStock(null);
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 0) {
      return {
        finDisclosureData: data.senateFinDisclosure,
        tradingActivityData: data.senateTradingActivity,
        loading: {
          finDisclosure: loading.senateFinDisclosure,
          tradingActivity: loading.senateTradingActivity
        },
        errors: {
          finDisclosure: errors.senateFinDisclosure,
          tradingActivity: errors.senateTradingActivity
        },
        onRefresh: () => refreshData(['senateFinDisclosure', 'senateTradingActivity'])
      };
    } else {
      return {
        finDisclosureData: data.houseFinDisclosure,
        tradingActivityData: data.houseTradingActivity,
        loading: {
          finDisclosure: loading.houseFinDisclosure,
          tradingActivity: loading.houseTradingActivity
        },
        errors: {
          finDisclosure: errors.houseFinDisclosure,
          tradingActivity: errors.houseTradingActivity
        },
        onRefresh: () => refreshData(['houseFinDisclosure', 'houseTradingActivity'])
      };
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Left Sidebar */}
      {!isSmallScreen && (
        <div className="flex-shrink-0">
          <DashboardSidebar />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {isSmallScreen && mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleDrawerToggle}
          />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-gradient-to-b from-zinc-900 to-zinc-950">
            <DashboardSidebar onClose={handleDrawerToggle} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 px-2 py-2 overflow-auto flex flex-col scrollbar-hide">
            <div className="max-w-7xl mx-auto w-full py-2 flex-1 flex flex-col">
              {/* Sticky Mobile Header */}
              {isSmallScreen && (
                <div className="sticky top-0 z-[1100] bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-3 -mx-4 mb-4">
                  <button
                    onClick={handleDrawerToggle}
                    className="text-teal-400 p-1"
                    aria-label="open drawer"
                  >
                    <FaBars />
                  </button>
                  <h1 className="text-lg text-teal-300 font-semibold">
                    Congress Monitor
                  </h1>
                </div>
              )}

              {/* Page Header */}
              <div className="mb-0">
                {!isSmallScreen && (
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl text-zinc-100 font-bold">
                      Congressional Trading Monitor
                    </h2>
                    <button
                      onClick={refreshData}
                      disabled={loading.senateFinDisclosure || loading.senateTradingActivity || 
                               loading.houseFinDisclosure || loading.houseTradingActivity}
                      className="ml-auto flex items-center gap-2 px-4 py-2 border border-teal-900 text-zinc-400 rounded-sm hover:bg-teal-900 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <FaRedo className="text-sm" />
                      Refresh Table
                    </button>
                  </div>
                )}
                
                <p className="text-zinc-400 leading-relaxed mb-2 mt-0 text-sm md:text-base">
                  Track financial disclosures and trading activities from members of Congress.
                </p>
              </div>

              {/* Senate/House Tab Navigation */}
              <div className="mb-0 border-b border-zinc-800">
                <div className="flex">
                  <button
                    onClick={(e) => handleTabChange(e, 0)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors relative ${
                      isMobile ? 'text-xs' : 'text-sm'
                    } ${
                      activeTab === 0 
                        ? 'text-teal-300' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    style={{ minWidth: isMobile ? 100 : 120 }}
                  >
                    <FaLandmark />
                    <span>Senate</span>
                    {activeTab === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleTabChange(e, 1)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors relative ${
                      isMobile ? 'text-xs' : 'text-sm'
                    } ${
                      activeTab === 1 
                        ? 'text-teal-300' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    style={{ minWidth: isMobile ? 100 : 120 }}
                  >
                    <FaUniversity />
                    <span>House</span>
                    {activeTab === 1 && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Congressional Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <CongressSection
                  title={currentData.title}
                  icon={currentData.icon}
                  finDisclosureData={currentData.finDisclosureData}
                  tradingActivityData={currentData.tradingActivityData}
                  loading={currentData.loading}
                  errors={currentData.errors}
                  onRefresh={currentData.onRefresh}
                  isCompact={true}
                  constrained={true}
                  chamber={activeTab === 0 ? 'senate' : 'house'}
                  searchResults={searchResults}
                  searchLoading={searchLoading}
                  searchErrors={searchErrors}
                  onSearch={handleSearch}
                  onClearSearch={handleClearSearch}
                  onStockClick={handleStockClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Details Modal */}
      {selectedStock && (
        <StockDetailsModal
          open={stockModalOpen}
          onClose={handleCloseStockModal}
          stock={selectedStock}
          wishlist={wishlist}
          addToWishlist={addToWishlist}
        />
      )}
    </div>
  );
};

export default CongressPage;