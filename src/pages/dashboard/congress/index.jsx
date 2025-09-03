import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  IconButton,
  Drawer
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaUniversity, FaLandmark, FaRedo, FaExternalLinkAlt, FaTimes, FaBars } from 'react-icons/fa';
import CongressSection from './components/CongressSection';
import { useCongressData } from '../../../hooks/useCongressData';
import DashboardSidebar from '../components/DashboardSidebar';

// Constants matching dashboard background
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';

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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for mobile sidebar and tab navigation
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = Senate, 1 = House

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Clear search results when switching tabs
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
    <Box sx={{ 
      display: "flex",
      height: "100vh",
      backgroundColor: darkBg, 
      color: "white", 
      overflow: "hidden",
    }}>
      {/* Left Sidebar */}
      {!isSmallScreen && (
        <Box sx={{ 
          width: "240px", 
          flexShrink: 0,
        }}>
          <DashboardSidebar />
        </Box>
      )}

      {/* Mobile sidebar drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: 240,
            boxSizing: 'border-box',
            background: darkGradient,
          },
        }}
      >
        <DashboardSidebar onClose={handleDrawerToggle} />
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}>
        <Box sx={{ 
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}>
          <Box sx={{ 
            flex: 1,
            px: 1, 
            py: 1,  
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
          }}>
            <Container maxWidth="xl" sx={{ py: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Sticky Mobile Header */}
              {isSmallScreen && (
                <Box 
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    backgroundColor: darkBg,
                    borderBottom: `1px solid ${teal[800]}`,
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mx: -2,
                    mb: 2
                  }}
                >
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ color: teal[400] }}
                  >
                    <FaBars />
                  </IconButton>
                  <Typography variant="h6" sx={{ color: teal[300], fontWeight: 600 }}>
                    Congress Monitor
                  </Typography>
                </Box>
              )}

              {/* Page Header */}
              <Box sx={{ mb: 3 }}>
                {!isSmallScreen && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <FaUniversity style={{ color: teal[400], fontSize: '2rem' }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: teal[300],
                        fontWeight: 700,
                        fontSize: '2.125rem'
                      }}
                    >
                      Congressional Trading Monitor
                    </Typography>
                    <Button
                      onClick={refreshData}
                      size="small"
                      sx={{ 
                        color: teal[400],
                        ml: 'auto',
                        border: `1px solid ${teal[600]}`,
                        '&:hover': {
                          backgroundColor: teal[900],
                          borderColor: teal[500],
                        }
                      }}
                      startIcon={<FaRedo />}
                      disabled={loading.senateFinDisclosure || loading.senateTradingActivity || 
                               loading.houseFinDisclosure || loading.houseTradingActivity}
                    >
                      Refresh All
                    </Button>
                  </Box>
                )}
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: grey[400],
                    lineHeight: 1.6,
                    mb: 2,
                    fontSize: isMobile ? '0.85rem' : '1rem'
                  }}
                >
                  Track financial disclosures and trading activities from members of Congress.
                </Typography>

                {/* Data Source Info */}
                <Alert 
                  severity="info"
                  sx={{ 
                    backgroundColor: 'rgba(2, 136, 209, 0.1)',
                    color: 'white',
                    border: `1px solid rgba(2, 136, 209, 0.3)`,
                    '& .MuiAlert-icon': { color: 'rgba(2, 136, 209, 0.8)' }
                  }}
                  action={
                    <Button
                      size="small"
                      href="https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: teal[400] }}
                      endIcon={<FaExternalLinkAlt />}
                    >
                      View Source
                    </Button>
                  }
                >
                  Data sourced from official House and Senate financial disclosure databases
                </Alert>
              </Box>

              {/* Senate/House Tab Navigation */}
              <Box sx={{ mb: 1, borderBottom: `1px solid ${teal[800]}` }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: grey[500],
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      minWidth: isMobile ? 100 : 120,
                      '&.Mui-selected': {
                        color: teal[300],
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: teal[500],
                      height: 3,
                    },
                  }}
                >
                  <Tab 
                    icon={<FaLandmark style={{ marginRight: 8 }} />}
                    iconPosition="start"
                    label="Senate"
                  />
                  <Tab 
                    icon={<FaUniversity style={{ marginRight: 8 }} />}
                    iconPosition="start"
                    label="House"
                  />
                </Tabs>
              </Box>

              {/* Congressional Section */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
                />
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CongressPage;
