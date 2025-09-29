import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { teal, grey, amber, green } from '@mui/material/colors';
import {
  FaTimes,
  FaRocket,
  FaShieldAlt,
  FaCheck,
  FaChartLine,
  FaSearch,
  FaUserTie,
  FaExchangeAlt,
  FaFilter,
  FaStar
} from 'react-icons/fa';
import { IoAnalyticsSharp } from 'react-icons/io5';

// Constants for colors matching dashboard
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const Paywall = ({ 
  open, 
  onClose, 
  onUpgrade, 
  // triggerFeature = null,
  // currentPlan = "free" 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  // All premium benefits consolidated into one list
  const allBenefits = [
    {
      icon: <IoAnalyticsSharp />,
      title: "AI-Powered Stock Analysis",
      description: "Get comprehensive AI insights and recommendations for any stock"
    },
    {
      icon: <FaChartLine />,
      title: "Advanced Price Performance",
      description: "Track detailed historical performance and technical indicators"
    },
    {
      icon: <FaSearch />,
      title: "Search by Representative Name",
      description: "Track trades by specific senators and house members"
    },
    {
      icon: <FaExchangeAlt />,
      title: "Search by Stock Symbol",
      description: "See which politicians are trading your favorite stocks"
    },
    {
      icon: <FaUserTie />,
      title: "Search by Executive Name",
      description: "Follow key decision makers and their trading patterns"
    },
    {
      icon: <FaSearch />,
      title: "Search by Company Symbol",
      description: "Get insider trading data for any public company"
    },
    {
      icon: <FaFilter />,
      title: "Filter by Transaction Type",
      description: "Sort by buys, sells, options, and other transaction types"
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for all your trading data"
    },
    {
      icon: <FaRocket />,
      title: "Instant Access",
      description: "Immediate access to all premium features upon upgrade"
    },
    {
      icon: <FaStar />,
      title: "Cancel Anytime",
      description: "No long-term commitments - cancel your subscription anytime"
    },
    {
      icon: <FaCheck />,
      title: "30-Day Guarantee",
      description: "Full money-back guarantee if you're not completely satisfied"
    }
  ];

  const handleUpgradeClick = () => {
    setStripeModalOpen(true);
  };

  const handleStripeClose = () => {
    setStripeModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    setStripeModalOpen(false);
    if (onUpgrade) {
      onUpgrade();
    }
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: darkGradient,
            color: white,
            borderRadius: isMobile ? 0 : 3,
            border: `1px solid ${teal[800]}`,
            maxHeight: '95vh',
            overflow: 'scroll'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'scroll', background: `linear-gradient(135deg, ${teal[900]}, ${teal[700]})`, }}>
          {/* Header Section */}
          <Box sx={{ 
            position: 'relative',
            // background: `linear-gradient(135deg, ${teal[900]}, ${teal[700]})`,
            // p: { xs: 3, md: 4 },
            textAlign: 'center'
          }}>
            {/* Close Button */}
            <IconButton 
              onClick={onClose}
              sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                color: white,
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              <FaTimes />
            </IconButton>

            {/* Title */}
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              color={white}
              mb={2}
              sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Unlock Professional
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color={teal[200]}
              mb={3}
              sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}
            >
              AI Powered Insights
            </Typography>

              <p className='h2 text-2xl font-semibold line-through'>
                $40/month {" "}
              </p>

            {/* Price */}
            <Box display="flex" justifyContent="center" alignItems="baseline" gap={1} mb={2}>
              <p className='h2 text-8xl font-bold'>
                $20
              </p>
              <Typography variant="h6" color={teal[200]}>
                /month {" "}
                <br />
              </Typography>
            </Box>

            <Typography 
              variant="body1" 
              color={teal[100]} 
              mb={4}
              sx={{ maxWidth: '600px', mx: 'auto' }}
            >
              Get exclusive access to AI analysis, congressional trading data, 
              and insider trading intelligence to make informed investment decisions.
            </Typography>

            {/* CTA Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleUpgradeClick}
              startIcon={<FaRocket />}
              sx={{
                backgroundColor: amber[600],
                color: 'black',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: amber[500],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Upgrade to Premium
            </Button>
          </Box>

          {/* Features Section */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>

            {/* Benefits List */}
            <Box sx={{ 
              maxWidth: '500px', 
              padding: 2,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#000000',
              // background: `linear-gradient(135deg, ${teal[900]}, ${teal[700]})`,
              border: `solid 1px ${teal[500]}`,
              borderRadius: 2,
              gap: 1
            }}>
              {allBenefits.map((benefit, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: 1,
                    p: 0,
                    borderRadius: 2,
                  }}
                >
                  {/* Checkmark */}
                  <Box sx={{ 
                    mt: 0,
                    color: teal[500],
                    fontSize: '0.9rem',
                    mt: 0.5,
                    flexShrink: 0
                  }}>
                    <FaCheck />
                  </Box>
                  
                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="600" 
                      color={teal[500]}
                      sx={{ 
                        mb: 0,
                        fontSize: '0.9rem',
                        lineHeight: 2
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={grey[400]}
                      sx={{ 
                        fontSize: '0.85rem',
                        lineHeight: 1.5
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            {/* CTA Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleUpgradeClick}
              startIcon={<FaRocket />}
              sx={{
                backgroundColor: amber[600],
                color: 'black',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: amber[500],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Upgrade to Premium
            </Button>
            {/* Trust Indicators */}
            <Typography 
              variant="caption" 
              color={teal[200]}
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                my: 1.5,
                fontSize: '1rem' 
              }}
            >
              🔒 Secure payment • Cancel anytime • Join 1000+ premium members
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      {/* <StripeModal
        open={stripeModalOpen}
        onClose={handleStripeClose}
        amount="29.00"
        planName="Premium Plan"
        onSuccess={handlePaymentSuccess}
      /> */}
    </>
  );
};

export default Paywall;
