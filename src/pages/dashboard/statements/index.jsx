import React, { useState, useEffect } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    FaBars, FaFileInvoiceDollar, FaChartLine, FaMoneyBillWave,
    FaRedo, FaSearch
} from "react-icons/fa";
import { useFinancialStatements } from "../../../hooks/useFinancialStatements";
import IncomeStatementView from "./components/IncomeStatementView";
import BalanceSheetView from "./components/BalanceSheetView";
import CashFlowView from "./components/CashFlowView";

const StatementsPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [ticker, setTicker] = useState("AAPL");
    const [searchInput, setSearchInput] = useState("AAPL");
    const [period, setPeriod] = useState("annual");
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    const {
        data,
        loading,
        errors,
        fetchFinancialStatements,
        refreshAllData
    } = useFinancialStatements();

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768);
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const periodOptions = [
        { value: 'Q1', label: 'Q1' },
        { value: 'Q2', label: 'Q2' },
        { value: 'Q3', label: 'Q3' },
        { value: 'Q4', label: 'Q4' },
        { value: 'FY', label: 'FY' },
        { value: 'annual', label: 'Annual' },
        { value: 'quarter', label: 'Quarter' },
    ];

    const tabs = [
        { 
            label: 'Income Statement', 
            icon: <FaFileInvoiceDollar />, 
            key: 'incomeStatement',
            component: IncomeStatementView 
        },
        { 
            label: 'Balance Sheet', 
            icon: <FaChartLine />, 
            key: 'balanceSheet',
            component: BalanceSheetView 
        },
        { 
            label: 'Cash Flow', 
            icon: <FaMoneyBillWave />, 
            key: 'cashFlow',
            component: CashFlowView 
        },
    ];

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const handleSearch = () => {
        if (searchInput.trim()) {
            setTicker(searchInput.trim().toUpperCase());
        }
    };
    const handleSearchOnEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };
    const handlePeriodChange = (event) => setPeriod(event.target.value);

    const currentTab = tabs[activeTab];
    const currentData = data[currentTab?.key] || [];
    const currentLoading = loading[currentTab?.key];
    const currentError = errors[currentTab?.key];

    useEffect(() => {
        if (ticker) {
            fetchFinancialStatements(ticker, period);
        }
    }, [ticker, period, fetchFinancialStatements]);

    const CurrentComponent = currentTab?.component;

    return (
        <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
            {!isSmallScreen && (
                <div className="flex-shrink-0">
                    <DashboardSidebar />
                </div>
            )}
            
            {isSmallScreen && mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={handleDrawerToggle} />
                    <div className="absolute left-0 top-0 bottom-0 w-60 bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800">
                        <DashboardSidebar onClose={handleDrawerToggle} />
                    </div>
                </div>
            )}
            
            <div className="overflow-auto h-screen w-full scrollbar-hide">
                {isSmallScreen && (
                    <div className="sticky top-0 z-[1100] bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
                        <button onClick={handleDrawerToggle} className="text-teal-400 hover:bg-teal-500/10 p-1 rounded transition-colors">
                            <FaBars />
                        </button>
                        <h1 className="text-lg font-bold text-white">Financial Statements</h1>
                    </div>
                )}
                
                <div className="max-w-7xl mx-auto px-4 pb-10" style={{ marginTop: isSmallScreen ? 0 : '.5rem' }}>
                    <div className="mb-2">
                        {!isSmallScreen && <h2 className="text-xl font-bold text-white mb-2">Financial Statements</h2>}
                        <p className="text-zinc-300 mb-6 text-sm">Comprehensive financial data and analysis</p>

                        <div className="mb-0 flex gap-4 flex-col sm:flex-row items-stretch sm:items-end">
                            <div className="flex-1 max-w-full sm:max-w-md">
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
                                        <FaSearch />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter ticker symbol (e.g., AAPL)"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                                        onKeyPress={handleSearchOnEnter}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg pl-10 pr-24 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-zinc-700 transition-colors"
                                        style={{ fontSize: isMobile ? '12pt' : '10pt' }}
                                    />
                                    <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-teal-300 px-3 transition-colors">
                                        Search
                                    </button>
                                </div>
                            </div>

                            <div className="min-w-[150px]">
                                <select value={period} onChange={handlePeriodChange} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-zinc-700 transition-colors" style={{ fontSize: isMobile ? '12pt' : '10pt' }}>
                                    {periodOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-zinc-900">{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 border-b border-zinc-800">
                        <div className={`flex ${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
                            {tabs.map((tab, index) => (
                                <button key={tab.key} onClick={(e) => handleTabChange(e, index)} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${isMobile ? 'text-xs min-w-[120px]' : 'text-base min-w-[160px]'} ${activeTab === index ? 'text-teal-300' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                    {tab.icon}
                                    <span className="text-sm">{tab.label}</span>
                                    {activeTab === index && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {currentLoading ? (
                        <div className="flex justify-center items-center min-h-[400px] bg-zinc-900/30 rounded-xl border border-zinc-800 my-8 w-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                        </div>
                    ) : currentError ? (
                        <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-4 my-8">
                            <div className="flex justify-between items-center flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-rose-400">
                                    <span>⚠</span>
                                    <span>Failed to load {currentTab?.label.toLowerCase()}: {currentError}</span>
                                </div>
                                <button onClick={() => refreshAllData(ticker, period)} className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm">
                                    <FaRedo />
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : currentData && currentData.length > 0 ? (
                        <>
                            {ticker && (
                                <div className="mb-2">
                                    <p className="text-white text-sm mb-6">
                                        Showing <strong>{periodOptions.find(p => p.value === period)?.label}</strong> data for: <strong>{ticker}</strong>
                                    </p>
                                    <CurrentComponent data={currentData} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex justify-center items-center min-h-[400px] bg-zinc-900/30 rounded-xl border border-zinc-800 my-8 w-full">
                            <p className="text-zinc-400">No {currentTab?.label.toLowerCase()} data available for {ticker}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatementsPage;