import React, { useState, useEffect } from "react";
import { 
    FaEquals, FaCalendarAlt, 
    FaChartLine, FaCoins, FaExchangeAlt 
} from "react-icons/fa";

const CashFlowView = ({ data }) => {
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
        if (change > 0) return { 
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>, 
            color: 'text-emerald-400' 
        };
        return { 
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" /></svg>, 
            color: 'text-rose-400' 
        };
    };

    // Key metrics to highlight
    const getKeyMetrics = (statement) => [
        { 
            label: 'Operating Cash Flow', 
            value: statement.netCashProvidedByOperatingActivities, 
            key: 'netCashProvidedByOperatingActivities',
            icon: <FaChartLine />
        },
        { 
            label: 'Investing Cash Flow', 
            value: statement.netCashUsedForInvestingActivites, 
            key: 'netCashUsedForInvestingActivites',
            icon: <FaCoins />
        },
        { 
            label: 'Financing Cash Flow', 
            value: statement.netCashUsedProvidedByFinancingActivities, 
            key: 'netCashUsedProvidedByFinancingActivities',
            icon: <FaExchangeAlt />
        },
        { 
            label: 'Free Cash Flow', 
            value: statement.freeCashFlow, 
            key: 'freeCashFlow',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
        },
        { 
            label: 'Net Change in Cash', 
            value: statement.netChangeInCash, 
            key: 'netChangeInCash',
            icon: <FaEquals />
        },
    ];

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-zinc-400">No cash flow data available</p>
            </div>
        );
    }

    const currentPeriod = data[0];
    const previousPeriod = data[1];
    const keyMetrics = getKeyMetrics(currentPeriod);

    // Cash flow categories
    const cashFlowCategories = [
        {
            title: 'Operating Activities',
            color: 'text-emerald-400',
            items: [
                { label: 'Net Income', key: 'netIncome' },
                { label: 'Depreciation & Amortization', key: 'depreciationAndAmortization' },
                { label: 'Stock Based Compensation', key: 'stockBasedCompensation' },
                { label: 'Deferred Income Tax', key: 'deferredIncomeTaxExpenseIncome' },
                { label: 'Change in Working Capital', key: 'changeInWorkingCapital' },
                { label: 'Accounts Receivables', key: 'accountsReceivables' },
                { label: 'Inventory', key: 'inventory' },
                { label: 'Accounts Payables', key: 'accountsPayables' },
                { label: 'Other Working Capital', key: 'otherWorkingCapital' },
                { label: 'Operating Cash Flow', key: 'netCashProvidedByOperatingActivities', isTotal: true },
            ]
        },
        {
            title: 'Investing Activities',
            color: 'text-teal-400',
            items: [
                { label: 'Capital Expenditures', key: 'capitalExpenditure' },
                { label: 'Acquisitions Net', key: 'acquisitionsNet' },
                { label: 'Purchases of Investments', key: 'purchasesOfInvestments' },
                { label: 'Sales Maturities of Investments', key: 'salesMaturitiesOfInvestments' },
                { label: 'Other Investing Activities', key: 'otherInvestingActivites' },
                { label: 'Investing Cash Flow', key: 'netCashUsedForInvestingActivites', isTotal: true },
            ]
        },
        {
            title: 'Financing Activities',
            color: 'text-rose-400',
            items: [
                { label: 'Debt Repayment', key: 'debtRepayment' },
                { label: 'Common Stock Issued', key: 'commonStockIssued' },
                { label: 'Common Stock Repurchased', key: 'commonStockRepurchased' },
                { label: 'Dividends Paid', key: 'dividendsPaid' },
                { label: 'Other Financing Activities', key: 'otherFinancingActivites' },
                { label: 'Financing Cash Flow', key: 'netCashUsedProvidedByFinancingActivities', isTotal: true },
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
                                className="bg-zinc-900 rounded-xl h-[110px] min-w-[200px] flex-shrink-0 p-4"
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
                                    {formatCurrency(metric.value)}
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
                                    {formatCurrency(metric.value)}
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

            {/* Cash Flow Statement */}
            <div className="bg-zinc-900/30 rounded-xl overflow-hidden">
                <div className="p-4 pb-0">
                    <h3 className="text-teal-300 text-md font-bold mb-4">Cash Flow Statement</h3>
                </div>
                
                <div className="overflow-x-auto" style={{ maxHeight: isMobile ? 600 : 800 }}>
                    <table className="w-full text-sm">
                        <thead className="sticky top-0">
                            <tr>
                                <th className="bg-zinc-950 text-teal-300 border-b border-zinc-800 font-bold text-left px-4 py-3 text-xs sm:text-sm">
                                    Cash Flow Item
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
                            {cashFlowCategories.map((category) => (
                                <React.Fragment key={category.title}>
                                    <tr>
                                        <td 
                                            colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                            className={`bg-teal-500/10 ${category.color} font-bold border-b border-zinc-800 px-4 py-2 text-xs sm:text-sm`}
                                        >
                                            {category.title}
                                        </td>
                                    </tr>
                                    {category.items.map((item) => (
                                        <tr key={item.key}>
                                            <td 
                                                className={`text-white border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm ${
                                                    item.isTotal ? 'font-bold pl-4 bg-teal-500/5' : 'pl-6'
                                                }`}
                                            >
                                                {item.label}
                                            </td>
                                            {data.slice(0, isMobile ? 2 : 3).map((period) => {
                                                const value = period[item.key];
                                                const isNegative = value < 0;
                                                
                                                return (
                                                    <td
                                                        key={`${period.calendarYear}-${item.key}`}
                                                        className={`border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm ${
                                                            item.isTotal 
                                                                ? `${category.color} font-bold bg-teal-500/5` 
                                                                : isNegative 
                                                                    ? 'text-rose-300' 
                                                                    : 'text-white'
                                                        }`}
                                                    >
                                                        {formatCurrency(value)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            
                            {/* Net Change in Cash */}
                            <tr>
                                <td className="text-teal-300 border-b-2 border-teal-600 font-bold bg-teal-500/15 px-4 py-3 text-xs sm:text-sm">
                                    NET CHANGE IN CASH
                                </td>
                                {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                    <td
                                        key={`${period.calendarYear}-netChangeInCash`}
                                        className="text-teal-300 border-b-2 border-teal-600 font-bold bg-teal-500/15 text-right px-4 py-3 text-xs sm:text-sm"
                                    >
                                        {formatCurrency(period.netChangeInCash)}
                                    </td>
                                ))}
                            </tr>
                            
                            {/* Cash at Beginning and End of Period */}
                            <tr>
                                <td className="text-zinc-300 border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm">
                                    Cash at Beginning of Period
                                </td>
                                {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                    <td
                                        key={`${period.calendarYear}-cashAtBeginning`}
                                        className="text-zinc-300 border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm"
                                    >
                                        {formatCurrency(period.cashAtBeginningOfPeriod)}
                                    </td>
                                ))}
                            </tr>
                            
                            <tr>
                                <td className="text-zinc-300 border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm">
                                    Cash at End of Period
                                </td>
                                {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                    <td
                                        key={`${period.calendarYear}-cashAtEnd`}
                                        className="text-zinc-300 border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm"
                                    >
                                        {formatCurrency(period.cashAtEndOfPeriod)}
                                    </td>
                                ))}
                            </tr>
                            
                            {/* Free Cash Flow */}
                            <tr>
                                <td className="text-emerald-300 border-b-2 border-emerald-600 font-bold bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm">
                                    FREE CASH FLOW
                                </td>
                                {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                    <td
                                        key={`${period.calendarYear}-freeCashFlow`}
                                        className="text-emerald-300 border-b-2 border-emerald-600 font-bold bg-emerald-500/10 text-right px-4 py-3 text-xs sm:text-sm"
                                    >
                                        {formatCurrency(period.freeCashFlow)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CashFlowView;