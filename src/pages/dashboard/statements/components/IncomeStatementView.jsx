import React, { useState, useEffect } from "react";
import { FaEquals, FaCalendarAlt } from "react-icons/fa";

const IncomeStatementView = ({ data }) => {
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

    const formatNumber = (value) => {
        if (!value && value !== 0) return 'N/A';
        const num = Number(value);
        if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
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
        { label: 'Revenue', value: statement.revenue, key: 'revenue' },
        { label: 'Gross Profit', value: statement.grossProfit, key: 'grossProfit' },
        { label: 'Operating Income', value: statement.operatingIncome, key: 'operatingIncome' },
        { label: 'Net Income', value: statement.netIncome, key: 'netIncome' },
        { label: 'EPS', value: statement.eps, key: 'eps', isCurrency: false },
    ];

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-zinc-400">No income statement data available</p>
            </div>
        );
    }

    const currentPeriod = data[0];
    const previousPeriod = data[1];
    const keyMetrics = getKeyMetrics(currentPeriod);

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
                                className="bg-zinc-900 rounded-xl h-[120px] min-w-[200px] flex-shrink-0 p-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-teal-400 text-xs">
                                        {metric.icon || <FaEquals />}
                                    </div>
                                    <p className="text-zinc-400 text-xs">
                                        {metric.label}
                                    </p>
                                </div>
                                <p className="text-white text-md font-bold mb-2">
                                    {metric.isCurrency === false 
                                        ? metric.value?.toFixed(2) || 'N/A'
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
                                        {metric.icon || <FaEquals />}
                                    </div>
                                    <p className="text-zinc-400 text-xs">
                                        {metric.label}
                                    </p>
                                </div>
                                <p className="text-white text-md font-bold mb-2">
                                    {metric.isCurrency === false 
                                        ? metric.value?.toFixed(2) || 'N/A'
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

            {/* Detailed Income Statement Table */}
            <div className="bg-zinc-900/30 rounded-xl overflow-hidden">
                <div className="p-6 pb-0">
                    <h3 className="text-teal-300 text-xl font-bold mb-4">Detailed Income Statement</h3>
                </div>
                
                <div className="overflow-x-auto" style={{ maxHeight: isMobile ? 400 : 600 }}>
                    <table className="w-full text-sm">
                        <thead className="sticky top-0">
                            <tr>
                                <th className="bg-zinc-950 text-teal-300 border-b border-zinc-800 font-bold text-left px-4 py-3 text-xs sm:text-sm">
                                    Metric
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
                            {[
                                { label: 'Revenue', key: 'revenue' },
                                { label: 'Cost of Revenue', key: 'costOfRevenue' },
                                { label: 'Gross Profit', key: 'grossProfit' },
                                { label: 'R&D Expenses', key: 'researchAndDevelopmentExpenses' },
                                { label: 'SG&A Expenses', key: 'sellingGeneralAndAdministrativeExpenses' },
                                { label: 'Operating Expenses', key: 'operatingExpenses' },
                                { label: 'Operating Income', key: 'operatingIncome' },
                                { label: 'Interest Income', key: 'interestIncome' },
                                { label: 'Interest Expense', key: 'interestExpense' },
                                { label: 'Income Before Tax', key: 'incomeBeforeTax' },
                                { label: 'Income Tax Expense', key: 'incomeTaxExpense' },
                                { label: 'Net Income', key: 'netIncome' },
                                { label: 'EPS', key: 'eps' },
                                { label: 'EPS Diluted', key: 'epsdiluted' },
                                { label: 'Weighted Avg Shares', key: 'weightedAverageShsOut' },
                                { label: 'EBITDA', key: 'ebitda' },
                            ].map((item) => (
                                <tr key={item.key}>
                                    <td className="text-white border-b border-zinc-900 px-4 py-2 text-xs sm:text-sm font-medium">
                                        {item.label}
                                    </td>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <td
                                            key={`${period.calendarYear}-${item.key}`}
                                            className="text-white border-b border-zinc-900 text-right px-4 py-2 text-xs sm:text-sm"
                                        >
                                            {item.key === 'weightedAverageShsOut'
                                                ? formatNumber(period[item.key])
                                                : item.key.includes('eps')
                                                    ? (period[item.key]?.toFixed(2) || 'N/A')
                                                    : formatCurrency(period[item.key])
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatementView;