import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { teal, grey } from "@mui/material/colors";
import { FaTimes } from "react-icons/fa";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

export default function StripeModal({ open, onClose, amount, planName }) {
  const stripe = useStripe();
  const elements = useElements();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/complete`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "accordion",
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: teal[400],
        colorBackground: darkBg,
        colorText: white,
        colorDanger: '#df1b41',
        fontFamily: 'Roboto, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          background: darkGradient,
          color: white,
          borderRadius: isMobile ? 0 : 3,
          border: `1px solid ${teal[800]}`,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3, 
        pb: 1,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${grey[800]}`
      }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color={teal[300]} mb={1}>
            Complete Payment
          </Typography>
          {planName && (
            <Typography variant="body2" color={grey[400]}>
              {planName} {amount && `- $${amount}`}
            </Typography>
          )}
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: grey[400],
            '&:hover': { 
              color: white,
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            }
          }}
        >
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Payment Element */}
          <Box sx={{ mb: 3 }}>
            <PaymentElement 
              options={paymentElementOptions}
              style={{
                base: {
                  backgroundColor: darkBg,
                  color: white,
                }
              }}
            />
          </Box>

          {/* Error/Success Messages */}
          {message && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: white,
                border: `1px solid rgba(211, 47, 47, 0.3)`,
                '& .MuiAlert-icon': { 
                  color: 'rgba(211, 47, 47, 0.8)' 
                }
              }}
            >
              {message}
            </Alert>
          )}

          {/* Payment Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !stripe || !elements}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: teal[600],
              color: white,
              '&:hover': {
                backgroundColor: teal[700],
              },
              '&:disabled': {
                backgroundColor: grey[700],
                color: grey[400],
              },
            }}
          >
            {isLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} sx={{ color: white }} />
                <span>Processing...</span>
              </Box>
            ) : (
              `Pay ${amount ? `$${amount}` : 'Now'}`
            )}
          </Button>

          {/* Security Notice */}
          <Typography 
            variant="caption" 
            color={grey[500]} 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 2,
              fontSize: '0.75rem' 
            }}
          >
            🔒 Your payment information is secure and encrypted
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}