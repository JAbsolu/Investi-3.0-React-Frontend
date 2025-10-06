import React, { useState, useEffect } from "react";
import { FaEquals, FaCalendarAlt, FaBuilding, FaMoneyBillWave, FaBalanceScale } from "react-icons/fa";

const BalanceSheetView = ({ data }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format currency values
    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'N/A';
        const num = Number(value);
        if (Math.abs(num) >= 1e9) {
            return `$${(num / 1e9).toFixed(2)}B`;
        } else if (Math.abs(num) >= 1e6) {
            return `$${(num / 1e6).toFixed(2)}M`;
        } else if (Math.abs(num) >= 1e3) {
            return `$${(num / 1e3).toFixed(2)}K`;
        }
        return `$${num.toLocaleString()}`;
    };

    // Calculate percentage change between periods
    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return null;
        return ((current - previous) / Math.abs(previous)) * 100;
    };

    // Get trend icon and color
    const getTrendIcon = (current, previous) => {
        const change = calculateChange(current, previous);
        if (change === null || Math.abs(change) < 0.1) return { icon: <FaEquals />, color: 'text-zinc-400' };
        if (change > 0) return { icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>, color: 'text-emerald-400' };
        return { icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" /></svg>, color: 'text-rose-400' };
    };

    // Calculate financial ratios
    const calculateRatios = (statement) => {
        const currentRatio = statement.totalCurrentAssets && statement.totalCurrentLiabilities 
            ? statement.totalCurrentAssets / statement.totalCurrentLiabilities 
            : null;
        
        const debtToEquity = statement.totalDebt && statement.totalStockholdersEquity 
            ? statement.totalDebt / statement.totalStockholdersEquity 
            : null;
        
        const bookValue = statement.totalStockholdersEquity || 0;
        
        return { currentRatio, debtToEquity, bookValue };
    };

    // Key metrics to highlight
    const getKeyMetrics = (statement) => {
        const ratios = calculateRatios(statement);
        return [
            { label: 'Total Assets', value: statement.totalAssets, key: 'totalAssets', icon: <FaBuilding /> },
            { label: 'Cash & Equivalents', value: statement.cashAndCashEquivalents, key: 'cashAndCashEquivalents', icon: <FaMoneyBillWave /> },
            { label: 'Total Debt', value: statement.totalDebt, key: 'totalDebt', icon: <FaBalanceScale /> },
            { label: 'Stockholders Equity', value: statement.totalStockholdersEquity, key: 'totalStockholdersEquity', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" /></svg> },
            { label: 'Current Ratio', value: ratios.currentRatio, key: 'currentRatio', isCurrency: false, isRatio: true },
        ];
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-zinc-400">No balance sheet data available</p>
            </div>
        );
    }

    const currentPeriod = data[0];
    const previousPeriod = data[1];
    const keyMetrics = getKeyMetrics(currentPeriod);

    // Asset categories
    const assetCategories = [
        {
            title: 'Current Assets',
            items: [
                { label: 'Cash and Cash Equivalents', key: 'cashAndCashEquivalents' },
                { label: 'Short Term Investments', key: 'shortTermInvestments' },
                { label: 'Net Receivables', key: 'netReceivables' },
                { label: 'Inventory', key: 'inventory' },
                { label: 'Other Current Assets', key: 'otherCurrentAssets' },
                { label: 'Total Current Assets', key: 'totalCurrentAssets', isTotal: true },
            ]
        },
        {
            title: 'Non-Current Assets',
            items: [
                { label: 'Property Plant Equipment Net', key: 'propertyPlantEquipmentNet' },
                { label: 'Goodwill', key: 'goodwill' },
                { label: 'Intangible Assets', key: 'intangibleAssets' },
                { label: 'Long Term Investments', key: 'longTermInvestments' },
                { label: 'Other Non Current Assets', key: 'otherNonCurrentAssets' },
                { label: 'Total Non Current Assets', key: 'totalNonCurrentAssets', isTotal: true },
            ]
        }
    ];

    // Liability categories
    const liabilityCategories = [
        {
            title: 'Current Liabilities',
            items: [
                { label: 'Accounts Payable', key: 'accountPayables' },
                { label: 'Short Term Debt', key: 'shortTermDebt' },
                { label: 'Accrued Liabilities', key: 'otherCurrentLiabilities' },
                { label: 'Total Current Liabilities', key: 'totalCurrentLiabilities', isTotal: true },
            ]
        },
        {
            title: 'Non-Current Liabilities',
            items: [
                { label: 'Long Term Debt', key: 'longTermDebt' },
                { label: 'Other Non Current Liabilities', key: 'otherNonCurrentLiabilities' },
                { label: 'Total Non Current Liabilities', key: 'totalNonCurrentLiabilities', isTotal: true },
            ]
        }
    ];

    return (
        <div>
            {/* Key Metrics Cards */}
            {isMobile ? (
                <div className="flex overflow-x-auto gap-4 mb-6 pb-2 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-white/10">
                    {keyMetrics.map((metric) => {
                        const trend = previousPeriod ? getTrendIcon(metric.value, previousPeriod[metric.key]) : null;
                        const change = previousPeriod ? calculateChange(metric.value, previousPeriod[metric.key]) : null;
                        
                        return (
                            <div
                                key={metric.key}
                                className="bg-zinc-900 rounded-xl min-w-[200px] flex-shrink-0 p-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-teal-400 text-xs">
                                        {metric.icon}
                                    </div>
                                    <p className="text-zinc-400 text-xs">
                                        {metric.label}
                                    </p>
                                </div>
                                <p className="text-white text-md font-bold mb-2">
                                    {metric.isRatio 
                                        ? (metric.value?.toFixed(2) || 'N/A')
                                        : metric.isCurrency === false 
                                            ? (metric.value?.toFixed(2) || 'N/A')
                                            : formatCurrency(metric.value)
                                    }
                                </p>
                                {trend && change !== null && (
                                    <div className="flex items-center gap-1">
                                        <div className={trend.color}>
                                            {trend.icon}
                                        </div>
                                        <span className={`text-xs font-medium ${trend.color}`}>
                                            {Math.abs(change).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {keyMetrics.map((metric) => {
                        const trend = previousPeriod ? getTrendIcon(metric.value, previousPeriod[metric.key]) : null;
                        const change = previousPeriod ? calculateChange(metric.value, previousPeriod[metric.key]) : null;
                        
                        return (
                            <div
                                key={metric.key}
                                className="bg-zinc-900 rounded-xl h-[120px] p-4 min-w-[13.4em]"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-teal-400 text-xs">
                                        {metric.icon}
                                    </div>
                                    <p className="text-zinc-400 text-xs">
                                        {metric.label}
                                    </p>
                                </div>
                                <p className="text-white text-md font-bold mb-2">
                                    {metric.isRatio 
                                        ? (metric.value?.toFixed(2) || 'N/A')
                                        : metric.isCurrency === false 
                                            ? (metric.value?.toFixed(2) || 'N/A')
                                            : formatCurrency(metric.value)
                                    }
                                </p>
                                {trend && change !== null && (
                                    <div className="flex items-center gap-1">
                                        <div className={trend.color}>
                                            {trend.icon}
                                        </div>
                                        <span className={`text-xs font-medium ${trend.color}`}>
                                            {Math.abs(change).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Balance Sheet Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets Section */}
                <div className="bg-zinc-900/30 rounded-xl overflow-hidden">
                    <div className="p-4 pb-0">
                        <h3 className="text-teal-300 text-md font-bold mb-4">Assets</h3>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0">
                                <tr>
                                    <th className="bg-zinc-950 text-teal-300 border-b border-zinc-800 font-bold text-left px-4 py-3 text-xs sm:text-sm">
                                        Asset Type
                                    </th>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <th
                                            key={period.calendarYear}
                                            className="bg-zinc-950 text-white border-b border-zinc-800 font-bold text-right px-4 py-3 text-xs sm:text-sm"
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                <FaCalendarAlt size={12} />
                                                {period.calendarYear}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assetCategories.map((category) => (
                                    <React.Fragment key={category.title}>
                                        <tr>
                                            <td 
                                                colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                                className="bg-teal-500/10 text-teal-300 font-bold border-b border-zinc-800 px-4 py-2 text-xs sm:text-sm"
                                            >
                                                {category.title}
                                            </td>
                                        </tr>
                                        {category.items.map((item) => (
                                            <tr key={item.key}>
                                                <td 
                                                    className={`text-white border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm ${item.isTotal ? 'font-bold pl-4' : 'pl-6'}`}
                                                >
                                                    {item.label}
                                                </td>
                                                {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                                    <td
                                                        key={`${period.calendarYear}-${item.key}`}
                                                        className={`text-white border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm ${item.isTotal ? 'font-bold' : ''}`}
                                                    >
                                                        {formatCurrency(period[item.key])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                                {/* Total Assets */}
                                <tr>
                                    <td className="text-teal-300 border-b-2 border-teal-600 font-bold bg-teal-500/15 px-4 py-3 text-xs sm:text-sm">
                                        TOTAL ASSETS
                                    </td>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <td
                                            key={`${period.calendarYear}-totalAssets`}
                                            className="text-teal-300 border-b-2 border-teal-600 font-bold bg-teal-500/15 text-right px-4 py-3 text-xs sm:text-sm"
                                        >
                                            {formatCurrency(period.totalAssets)}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Liabilities & Equity Section */}
                <div className="bg-zinc-900/30 rounded-xl overflow-hidden">
                    <div className="p-4 pb-0">
                        <h3 className="text-teal-300 text-md font-bold mb-4">Liabilities & Equity</h3>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0">
                                <tr>
                                    <th className="bg-zinc-950 text-teal-300 border-b border-zinc-800 font-bold text-left px-4 py-3 text-xs sm:text-sm">
                                        Liability/Equity Type
                                    </th>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <th
                                            key={period.calendarYear}
                                            className="bg-zinc-950 text-white border-b border-zinc-800 font-bold text-right px-4 py-3 text-xs sm:text-sm"
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                <FaCalendarAlt size={12} />
                                                {period.calendarYear}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {liabilityCategories.map((category) => (
                                    <React.Fragment key={category.title}>
                                        <tr>
                                            <td 
                                                colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                                className="bg-teal-500/10 text-teal-300 font-bold border-b border-zinc-800 px-4 py-2 text-xs sm:text-sm"
                                            >
                                                {category.title}
                                            </td>
                                        </tr>
                                        {category.items.map((item) => (
                                            <tr key={item.key}>
                                                <td 
                                                    className={`text-white border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm ${item.isTotal ? 'font-bold pl-4' : 'pl-6'}`}
                                                >
                                                    {item.label}
                                                </td>
                                                {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                                    <td
                                                        key={`${period.calendarYear}-${item.key}`}
                                                        className={`text-white border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm ${item.isTotal ? 'font-bold' : ''}`}
                                                    >
                                                        {formatCurrency(period[item.key])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                                
                                {/* Equity Section */}
                                <tr>
                                    <td 
                                        colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                        className="bg-teal-500/10 text-teal-300 font-bold border-b border-zinc-800 px-4 py-2 text-xs sm:text-sm"
                                    >
                                        Stockholders' Equity
                                    </td>
                                </tr>
                                
                                {[
                                    { label: 'Common Stock', key: 'commonStock' },
                                    { label: 'Retained Earnings', key: 'retainedEarnings' },
                                    { label: 'Accumulated Other Comprehensive Income', key: 'accumulatedOtherComprehensiveIncomeLoss' },
                                    { label: 'Total Stockholders Equity', key: 'totalStockholdersEquity', isTotal: true },
                                ].map((item) => (
                                    <tr key={item.key}>
                                        <td 
                                            className={`text-white border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm ${item.isTotal ? 'font-bold pl-4' : 'pl-6'}`}
                                        >
                                            {item.label}
                                        </td>
                                        {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                            <td
                                                key={`${period.calendarYear}-${item.key}`}
                                                className={`text-white border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm ${item.isTotal ? 'font-bold' : ''}`}
                                            >
                                                {formatCurrency(period[item.key])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                
                                {/* Total Liabilities & Equity */}
                                <tr>
                                    <td className="text-teal-300 border-b-2 border-teal-600 font-bold bg-teal-500/15 px-4 py-3 text-xs sm:text-sm">
                                        TOTAL LIABILITIES & EQUITY
                                    </td>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <td
                                            key={`${period.calendarYear}-totalLiabilitiesAndEquity`}
                                            className="text-teal-300 border-b-2 border-teal-600 font-bold bg-teal-500/15 text-right px-4 py-3 text-xs sm:text-sm"
                                        >
                                            {formatCurrency(
                                                (period.totalLiabilities || 0) + (period.totalStockholdersEquity || 0)
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheetView;