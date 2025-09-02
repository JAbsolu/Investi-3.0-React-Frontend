import React from "react";
import {
    Box, Typography, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, useMediaQuery, useTheme
} from "@mui/material";
import { teal, green, red, grey } from "@mui/material/colors";
import { FaEquals, FaCalendarAlt, FaBuilding, FaMoneyBillWave, FaBalanceScale } from "react-icons/fa";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const darkBg = "#0d0d0d";
const white = "#ffffff";

const BalanceSheetView = ({ data }) => {
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
        if (change > 0) return { icon: <TrendingUpIcon />, color: green[400] };
        return { icon: <TrendingDownIcon />, color: red[400] };
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
            { label: 'Stockholders Equity', value: statement.totalStockholdersEquity, key: 'totalStockholdersEquity', icon: <TrendingDownIcon /> },
            { label: 'Current Ratio', value: ratios.currentRatio, key: 'currentRatio', isCurrency: false, isRatio: true },
        ];
    };

    if (!data || data.length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <Typography color={grey[400]}>
                    No balance sheet data available
                </Typography>
            </Box>
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
                                        {metric.isRatio 
                                            ? (metric.value?.toFixed(2) || 'N/A')
                                            : metric.isCurrency === false 
                                                ? (metric.value?.toFixed(2) || 'N/A')
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

            {/* Balance Sheet Sections */}
            <Grid container spacing={3}>
                {/* Assets Section */}
                <Grid item xs={12} lg={6}>
                    <Card
                        sx={{
                            background: 'rgba(20, 30, 20, 0.3)',
                            borderRadius: '12px',
                            height: 'fit-content'
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <Box p={3} pb={0}>
                                <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                    Assets
                                </Typography>
                            </Box>
                            
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table size={isMobile ? "small" : "medium"}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ 
                                                backgroundColor: darkBg, 
                                                color: teal[300],
                                                borderBottom: `1px solid ${teal[800]}`,
                                                fontWeight: 'bold',
                                                fontSize: isMobile ? '0.8rem' : '0.9rem'
                                            }}>
                                                Asset Type
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
                                        {assetCategories.map((category) => (
                                            <React.Fragment key={category.title}>
                                                <TableRow>
                                                    <TableCell 
                                                        colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                                        sx={{ 
                                                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                                            color: teal[300],
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
                                                                pl: item.isTotal ? 2 : 3
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
                                                                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                                    fontWeight: item.isTotal ? 'bold' : 'normal'
                                                                }}
                                                            >
                                                                {formatCurrency(period[item.key])}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                        {/* Total Assets */}
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
                                                TOTAL ASSETS
                                            </TableCell>
                                            {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                                <TableCell
                                                    key={`${period.calendarYear}-totalAssets`}
                                                    align="right"
                                                    sx={{ 
                                                        color: teal[300],
                                                        borderBottom: `2px solid ${teal[600]}`,
                                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: 'rgba(20, 184, 166, 0.15)'
                                                    }}
                                                >
                                                    {formatCurrency(period.totalAssets)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Liabilities & Equity Section */}
                <Grid item xs={12} lg={6}>
                    <Card
                        sx={{
                            background: 'rgba(20, 30, 20, 0.3)',
                            borderRadius: '12px',
                            height: 'fit-content'
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <Box p={3} pb={0}>
                                <Typography variant="h6" color={teal[300]} fontWeight="bold" mb={2}>
                                    Liabilities & Equity
                                </Typography>
                            </Box>
                            
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table size={isMobile ? "small" : "medium"}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ 
                                                backgroundColor: darkBg, 
                                                color: teal[300],
                                                borderBottom: `1px solid ${teal[800]}`,
                                                fontWeight: 'bold',
                                                fontSize: isMobile ? '0.8rem' : '0.9rem'
                                            }}>
                                                Liability/Equity Type
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
                                        {liabilityCategories.map((category) => (
                                            <React.Fragment key={category.title}>
                                                <TableRow>
                                                    <TableCell 
                                                        colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                                        sx={{ 
                                                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                                            color: teal[300],
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
                                                                pl: item.isTotal ? 2 : 3
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
                                                                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                                    fontWeight: item.isTotal ? 'bold' : 'normal'
                                                                }}
                                                            >
                                                                {formatCurrency(period[item.key])}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                        
                                        {/* Equity Section */}
                                        <TableRow>
                                            <TableCell 
                                                colSpan={data.slice(0, isMobile ? 2 : 3).length + 1}
                                                sx={{ 
                                                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                                    color: teal[300],
                                                    fontWeight: 'bold',
                                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                    borderBottom: `1px solid ${teal[800]}`
                                                }}
                                            >
                                                Stockholders' Equity
                                            </TableCell>
                                        </TableRow>
                                        
                                        {[
                                            { label: 'Common Stock', key: 'commonStock' },
                                            { label: 'Retained Earnings', key: 'retainedEarnings' },
                                            { label: 'Accumulated Other Comprehensive Income', key: 'accumulatedOtherComprehensiveIncomeLoss' },
                                            { label: 'Total Stockholders Equity', key: 'totalStockholdersEquity', isTotal: true },
                                        ].map((item) => (
                                            <TableRow key={item.key}>
                                                <TableCell 
                                                    sx={{ 
                                                        color: white, 
                                                        borderBottom: `1px solid ${teal[900]}`,
                                                        fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                        fontWeight: item.isTotal ? 'bold' : 'normal',
                                                        pl: item.isTotal ? 2 : 3
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
                                                            fontSize: isMobile ? '0.75rem' : '0.85rem',
                                                            fontWeight: item.isTotal ? 'bold' : 'normal'
                                                        }}
                                                    >
                                                        {formatCurrency(period[item.key])}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                        
                                        {/* Total Liabilities & Equity */}
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
                                                TOTAL LIABILITIES & EQUITY
                                            </TableCell>
                                            {data.slice(0, isMobile ? 2 : 3).map((period) => (
                                                <TableCell
                                                    key={`${period.calendarYear}-totalLiabilitiesAndEquity`}
                                                    align="right"
                                                    sx={{ 
                                                        color: teal[300],
                                                        borderBottom: `2px solid ${teal[600]}`,
                                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: 'rgba(20, 184, 166, 0.15)'
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        (period.totalLiabilities || 0) + (period.totalStockholdersEquity || 0)
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BalanceSheetView;
