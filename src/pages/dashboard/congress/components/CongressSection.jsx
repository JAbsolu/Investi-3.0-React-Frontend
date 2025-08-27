import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaRedo } from 'react-icons/fa';
import TransactionTable from './TransactionTable';
import TransactionCard from './TransactionCard';

const CongressSection = ({ 
  title, 
  icon, 
  finDisclosureData, 
  tradingActivityData, 
  loading, 
  errors, 
  onRefresh,
  isCompact = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const currentData = activeTab === 0 ? finDisclosureData : tradingActivityData;
  const currentLoading = activeTab === 0 ? loading.finDisclosure : loading.tradingActivity;
  const currentError = activeTab === 0 ? errors.finDisclosure : errors.tradingActivity;

  // Adjust display limits based on layout
  const mobileLimit = isCompact ? 10 : 20;
  const desktopLimit = isCompact ? 25 : 50;

  const renderContent = () => {
    if (currentLoading) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: isCompact ? 150 : 200,
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <CircularProgress sx={{ color: teal[400] }} />
        </Box>
      );
    }

    if (currentError) {
      return (
        <Alert 
          severity="error" 
          sx={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: 'white',
            border: `1px solid rgba(211, 47, 47, 0.3)`,
            '& .MuiAlert-icon': { color: 'rgba(211, 47, 47, 0.8)' }
          }}
          action={
            <Button
              size="small"
              onClick={onRefresh}
              sx={{ color: teal[400] }}
              startIcon={<FaRedo />}
            >
              Retry
            </Button>
          }
        >
          Failed to load data: {currentError}
        </Alert>
      );
    }

    if (!currentData || currentData.length === 0) {
      return (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: isCompact ? 4 : 6,
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            border: `1px solid ${teal[800]}`,
          }}
        >
          <Typography color={grey[500]} sx={{ fontStyle: 'italic' }}>
            No transactions available
          </Typography>
          <Button
            size="small"
            onClick={onRefresh}
            sx={{ color: teal[400], mt: 1 }}
            startIcon={<FaRedo />}
          >
            Refresh
          </Button>
        </Box>
      );
    }

    if (isMobile) {
      return (
        <Box>
          {currentData.slice(0, mobileLimit).map((transaction, index) => (
            <TransactionCard key={index} transaction={transaction} />
          ))}
          {currentData.length > mobileLimit && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: grey[500], 
                textAlign: 'center', 
                display: 'block',
                mt: 2 
              }}
            >
              Showing first {mobileLimit} transactions
            </Typography>
          )}
        </Box>
      );
    }

    return <TransactionTable transactions={currentData.slice(0, desktopLimit)} title={title} isCompact={isCompact} />;
  };

  return (
    <Box sx={{ mb: isCompact ? 4 : 6 }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ color: teal[400], fontSize: isCompact ? '1.25rem' : '1.5rem' }}>
          {icon}
        </Box>
        <Typography 
          variant={isCompact ? "h6" : "h5"} 
          sx={{ 
            color: teal[300],
            fontWeight: 600,
            fontSize: isCompact ? '1.25rem' : '1.5rem'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: grey[500],
            ml: 'auto',
            fontSize: '0.75rem'
          }}
        >
          ({currentData?.length || 0})
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isCompact ? "fullWidth" : "standard"}
          sx={{
            '& .MuiTab-root': {
              color: grey[500],
              textTransform: 'none',
              fontWeight: 600,
              fontSize: isCompact ? '0.8rem' : '0.9rem',
              '&.Mui-selected': {
                color: teal[300],
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: teal[500],
            },
          }}
        >
          <Tab 
            label={isCompact ? "Disclosures" : "Financial Disclosures"}
          />
          <Tab 
            label={isCompact ? "Activity" : "Trading Activity"}
          />
        </Tabs>
      </Box>

      {/* Content */}
      {renderContent()}
    </Box>
  );
};

export default CongressSection;
