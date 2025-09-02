import React from "react";
import {
    Box, Typography, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, useMediaQuery, useTheme
} from "@mui/material";
import { teal, green, red, grey } from "@mui/material/colors";
import { FaTrendUp, FaTrendDown, FaEquals, FaCalendarAlt } from "react-icons/fa";

const darkBg = "#0d0d0d";
const white = "#ffffff";

const IncomeStatementView = ({ data }) => {
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
        { label: 'Revenue', value: statement.revenue, key: 'revenue' },
        { label: 'Gross Profit', value: statement.grossProfit, key: 'grossProfit' },
        { label: 'Operating Income', value: statement.operatingIncome, key: 'operatingIncome' },
        { label: 'Net Income', value: statement.netIncome, key: 'netIncome' },
        { label: 'EPS', value: statement.eps, key: 'eps', isCurrency: false },
    ];

    if (!data || data.length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <Typography color={grey[400]}>
                    No income statement data available
                </Typography>
            </Box>
        );
    }

    const currentPeriod = data[0];
    const previousPeriod = data[1];
    const keyMetrics = getKeyMetrics(currentPeriod);

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
                                    <Typography
                                        variant="body2"
                                        color={grey[400]}
                                        fontSize="0.75rem"
                                        mb={0.5}
                                    >
                                        {metric.label}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        color={white}
                                        fontWeight="bold"
                                        fontSize={isMobile ? '0.9rem' : '1.1rem'}
                                        mb={1}
                                    >
                                        {metric.isCurrency === false 
                                            ? metric.value?.toFixed(2) || 'N/A'
                                            : formatCurrency(metric.value)
                                        }
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

            {/* Detailed Income Statement Table */}
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
                            Detailed Income Statement
                        </Typography>
                    </Box>
                    
                    <TableContainer sx={{ maxHeight: isMobile ? 400 : 600 }}>
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
                                        Metric
                                    </TableCell>
                                    {data.slice(0, isMobile ? 2 : 3).map((period, index) => (
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
                                    <TableRow key={item.key}>
                                        <TableCell 
                                            sx={{ 
                                                color: white, 
                                                borderBottom: `1px solid ${teal[900]}`,
                                                fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                fontWeight: 'medium'
                                            }}
                                        >
                                            {item.label}
                                        </TableCell>
                                        {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                            <TableCell
                                                key={`${period.calendarYear}-${item.key}`}
                                                align="right"
                                                sx={{ 
                                                    color: white,
                                                    borderBottom: `1px solid ${teal[900]}`,
                                                    fontSize: isMobile ? '0.75rem' : '0.85rem'
                                                }}
                                            >
                                                {item.key.includes('eps') || item.key === 'weightedAverageShsOut'
                                                    ? (period[item.key]?.toFixed(2) || 'N/A')
                                                    : formatCurrency(period[item.key])
                                                }
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default IncomeStatementView;
