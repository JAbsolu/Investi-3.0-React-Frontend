import { 
  Box, 
  Typography, 
  Container,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import { FaUniversity, FaLandmark, FaRedo, FaExternalLinkAlt } from 'react-icons/fa';
import CongressSection from './components/CongressSection';
import { useCongressData } from '../../../hooks/useCongressData';
import DashboardSidebar from '../components/DashboardSidebar';

// Constants matching dashboard background
const darkBg = "#0d0d0d";

const CongressPage = () => {
  const { 
    data, 
    loading, 
    errors, 
    refreshData 
  } = useCongressData();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      backgroundColor: darkBg, 
      color: "white",
      minHeight: "100vh",
      overflow: "auto",
      display: 'flex',
    }}>
        <DashboardSidebar />
      <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FaUniversity style={{ color: teal[400], fontSize: '2rem' }} />
          <Typography 
            variant="h4" 
            sx={{ 
              color: teal[300],
              fontWeight: 700,
              fontSize: isMobile ? '1.75rem' : '2.125rem'
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
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: grey[400],
            lineHeight: 1.6,
            mb: 2,
            fontSize: '1rem'
          }}
        >
          Track financial disclosures and trading activities from members of Congress. 
          Data is sourced from official congressional records and updated regularly.
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

      {/* Senate Section */}
      <CongressSection
        title="Senate"
        icon={<FaLandmark />}
        finDisclosureData={data.senateFinDisclosure}
        tradingActivityData={data.senateTradingActivity}
        loading={{
          finDisclosure: loading.senateFinDisclosure,
          tradingActivity: loading.senateTradingActivity
        }}
        errors={{
          finDisclosure: errors.senateFinDisclosure,
          tradingActivity: errors.senateTradingActivity
        }}
        onRefresh={() => refreshData(['senateFinDisclosure', 'senateTradingActivity'])}
      />

      <Divider sx={{ backgroundColor: teal[800], my: 4 }} />

      {/* House Section */}
      <CongressSection
        title="House of Representatives"
        icon={<FaUniversity />}
        finDisclosureData={data.houseFinDisclosure}
        tradingActivityData={data.houseTradingActivity}
        loading={{
          finDisclosure: loading.houseFinDisclosure,
          tradingActivity: loading.houseTradingActivity
        }}
        errors={{
          finDisclosure: errors.houseFinDisclosure,
          tradingActivity: errors.houseTradingActivity
        }}
        onRefresh={() => refreshData(['houseFinDisclosure', 'houseTradingActivity'])}
      />

      {/* Footer Info */}
      <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${teal[800]}` }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: grey[600],
            display: 'block',
            textAlign: 'center',
            lineHeight: 1.5
          }}
        >
          Disclosure data is provided as reported by congressional members. 
          Transaction dates may reflect reporting dates rather than actual transaction dates.
          For the most current information, please refer to official congressional disclosure databases.
        </Typography>
      </Box>
    </Container>
    </Box>
  );
};

export default CongressPage;
