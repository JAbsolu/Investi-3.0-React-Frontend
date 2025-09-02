import React from "react";
import {
    Box, Typography, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, useMediaQuery, useTheme
} from "@mui/material";
import { teal, green, red, grey } from "@mui/material/colors";
import { 
    FaTrendUp, FaTrendDown, FaEquals, FaCalendarAlt, 
    FaChartLine, FaCoins, FaCog, FaExchangeAlt 
} from "react-icons/fa";

const darkBg = "#0d0d0d";
const white = "#ffffff";

const CashFlowView = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        if (change === null || Math.abs(change) < 0.1) return { icon: <FaEquals />, color: grey[400] };
        if (change > 0) return { icon: <FaTrendUp />, color: green[400] };
        return { icon: <FaTrendDown />, color: red[400] };
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
            icon: <FaTrendUp />
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
            <Box textAlign="center" py={8}>
                <Typography color={grey[400]}>
                    No cash flow data available
                </Typography>
            </Box>
        );
    }

    const currentPeriod = data[0];
    const previousPeriod = data[1];
    const keyMetrics = getKeyMetrics(currentPeriod);

    // Cash flow categories
    const cashFlowCategories = [
        {
            title: 'Operating Activities',
            color: green[400],
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
            color: teal[400],
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
            color: red[400],
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
        <Box>
            {/* Key Metrics Cards */}
            <Grid container spacing={2} mb={4}>
                {keyMetrics.map((metric) => {
                    const trend = previousPeriod ? getTrendIcon(metric.value, previousPeriod[metric.key]) : null;
                    const change = previousPeriod ? calculateChange(metric.value, previousPeriod[metric.key]) : null;
                    
                    return (
                        <Grid item xs={12} sm={6} md={isMobile ? 6 : 2.4} key={metric.key}>
                            <Card
                                sx={{
                                    background: 'rgba(20, 184, 166, 0.05)',
                                    border: `1px solid ${teal[800]}`,
                                    borderRadius: '12px',
                                    height: '120px',
                                }}
                            >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        <Box sx={{ color: teal[400], fontSize: '0.8rem' }}>
                                            {metric.icon}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color={grey[400]}
                                            fontSize="0.75rem"
                                        >
                                            {metric.label}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        color={white}
                                        fontWeight="bold"
                                        fontSize={isMobile ? '0.9rem' : '1.1rem'}
                                        mb={1}
                                    >
                                        {formatCurrency(metric.value)}
                                    </Typography>
                                    {trend && change !== null && (
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Box sx={{ color: trend.color, fontSize: '0.7rem' }}>
                                                {trend.icon}
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{ 
                                                    color: trend.color,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                {Math.abs(change).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Cash Flow Statement */}
            <Card
                sx={{
                    background: 'rgba(20, 30, 20, 0.3)',
                    border: `1px solid ${teal[900]}`,
                    borderRadius: '12px',
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Box p={3} pb={0}>
                        <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                            Cash Flow Statement
                        </Typography>
                    </Box>
                    
                    <TableContainer sx={{ maxHeight: isMobile ? 600 : 800 }}>
                        <Table stickyHeader size={isMobile ? "small" : "medium"}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ 
                                        backgroundColor: darkBg, 
                                        color: teal[300],
                                        borderBottom: `1px solid ${teal[800]}`,
                                        fontWeight: 'bold',
                                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                                    }}>
                                        Cash Flow Item
                                    </TableCell>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <TableCell
                                            key={period.calendarYear}
                                            align="right"
                                            sx={{ 
                                                backgroundColor: darkBg, 
                                                color: white,
                                                borderBottom: `1px solid ${teal[800]}`,
                                                fontWeight: 'bold',
                                                fontSize: isMobile ? '0.8rem' : '0.9rem'
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                                                <FaCalendarAlt size={12} />
                                                {period.calendarYear}
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cashFlowCategories.map((category) => (
                                    <React.Fragment key={category.title}>
                                        <TableRow>
                                            <TableCell 
                                                colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                                sx={{ 
                                                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                                    color: category.color,
                                                    fontWeight: 'bold',
                                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                    borderBottom: `1px solid ${teal[800]}`
                                                }}
                                            >
                                                {category.title}
                                            </TableCell>
                                        </TableRow>
                                        {category.items.map((item) => (
                                            <TableRow key={item.key}>
                                                <TableCell 
                                                    sx={{ 
                                                        color: white, 
                                                        borderBottom: `1px solid ${teal[900]}`,
                                                        fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                        fontWeight: item.isTotal ? 'bold' : 'normal',
                                                        pl: item.isTotal ? 2 : 3,
                                                        backgroundColor: item.isTotal ? 'rgba(20, 184, 166, 0.05)' : 'transparent'
                                                    }}
                                                >
                                                    {item.label}
                                                </TableCell>
                                                {data.slice(0, isMobile ? 2 : 3).map((period) => {
                                                    const value = period[item.key];
                                                    const isNegative = value < 0;
                                                    
                                                    return (
                                                        <TableCell
                                                            key={`${period.calendarYear}-${item.key}`}
                                                            align="right"
                                                            sx={{ 
                                                                color: item.isTotal 
                                                                    ? category.color 
                                                                    : isNegative 
                                                                        ? red[300] 
                                                                        : white,
                                                                borderBottom: `1px solid ${teal[900]}`,
                                                                fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                                fontWeight: item.isTotal ? 'bold' : 'normal',
                                                                backgroundColor: item.isTotal ? 'rgba(20, 184, 166, 0.05)' : 'transparent'
                                                            }}
                                                        >
                                                            {formatCurrency(value)}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                                
                                {/* Net Change in Cash */}
                                <TableRow>
                                    <TableCell 
                                        sx={{ 
                                            color: teal[300], 
                                            borderBottom: `2px solid ${teal[600]}`,
                                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                                            fontWeight: 'bold',
                                            backgroundColor: 'rgba(20, 184, 166, 0.15)'
                                        }}
                                    >
                                        NET CHANGE IN CASH
                                    </TableCell>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <TableCell
                                            key={`${period.calendarYear}-netChangeInCash`}
                                            align="right"
                                            sx={{ 
                                                color: teal[300],
                                                borderBottom: `2px solid ${teal[600]}`,
                                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                fontWeight: 'bold',
                                                backgroundColor: 'rgba(20, 184, 166, 0.15)'
                                            }}
                                        >
                                            {formatCurrency(period.netChangeInCash)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                
                                {/* Cash at Beginning and End of Period */}
                                <TableRow>
                                    <TableCell 
                                        sx={{ 
                                            color: grey[300], 
                                            borderBottom: `1px solid ${teal[900]}`,
                                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                                        }}
                                    >
                                        Cash at Beginning of Period
                                    </TableCell>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <TableCell
                                            key={`${period.calendarYear}-cashAtBeginning`}
                                            align="right"
                                            sx={{ 
                                                color: grey[300],
                                                borderBottom: `1px solid ${teal[900]}`,
                                                fontSize: isMobile ? '0.75rem' : '0.85rem'
                                            }}
                                        >
                                            {formatCurrency(period.cashAtBeginningOfPeriod)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                
                                <TableRow>
                                    <TableCell 
                                        sx={{ 
                                            color: grey[300], 
                                            borderBottom: `1px solid ${teal[900]}`,
                                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                                        }}
                                    >
                                        Cash at End of Period
                                    </TableCell>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <TableCell
                                            key={`${period.calendarYear}-cashAtEnd`}
                                            align="right"
                                            sx={{ 
                                                color: grey[300],
                                                borderBottom: `1px solid ${teal[900]}`,
                                                fontSize: isMobile ? '0.75rem' : '0.85rem'
                                            }}
                                        >
                                            {formatCurrency(period.cashAtEndOfPeriod)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                
                                {/* Free Cash Flow */}
                                <TableRow>
                                    <TableCell 
                                        sx={{ 
                                            color: green[300], 
                                            borderBottom: `2px solid ${green[600]}`,
                                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                                            fontWeight: 'bold',
                                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                        }}
                                    >
                                        FREE CASH FLOW
                                    </TableCell>
                                    {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                        <TableCell
                                            key={`${period.calendarYear}-freeCashFlow`}
                                            align="right"
                                            sx={{ 
                                                color: green[300],
                                                borderBottom: `2px solid ${green[600]}`,
                                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                fontWeight: 'bold',
                                                backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                            }}
                                        >
                                            {formatCurrency(period.freeCashFlow)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CashFlowView;
