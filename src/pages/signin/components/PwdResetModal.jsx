import React, { useState } from "react";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { Modal, Box, Typography, TextField, Button, Alert } from "@mui/material";
import { auth } from "../../../firebaseConfig";
import { teal } from "@mui/material/colors";

const PwdResetModal = ({ open, onClose, initialEmail = "" }) => {
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      // First check if email exists in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, resetEmail);
      
      if (signInMethods.length === 0) {
        // Email doesn't exist in the database
        setResetError("No account found with this email address.");
        return;
      }

      // Email exists, proceed with password reset
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          setResetError("Please enter a valid email address.");
          break;
        case 'auth/too-many-requests':
          setResetError("Too many attempts. Please try again later.");
          break;
        default:
          setResetError("Failed to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleClose = () => {
    setResetEmail("");
    setResetError("");
    setResetMessage("");
    setResetLoading(false);
    onClose();
  };

  // Update email when initialEmail prop changes
  React.useEffect(() => {
    if (open) {
      setResetEmail(initialEmail);
      setResetError("");
      setResetMessage("");
    }
  }, [open, initialEmail]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="reset-password-modal"
      aria-describedby="reset-password-form"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id="reset-password-modal"
          variant="h6"
          component="h2"
          sx={{ mb: 2, textAlign: 'center', color: 'black' }}
        >
          Reset Password
        </Typography>
        
        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: 'center', color: 'gray' }}
        >
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <Box component="form" onSubmit={handlePasswordReset}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="reset-email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            InputProps={{
              style: { color: "black" },
            }}
            InputLabelProps={{
              style: { color: "gray" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: teal[500],
                },
                "&.Mui-focused fieldset": {
                  borderColor: teal[700],
                },
              },
            }}
          />

          {resetError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {resetError}
            </Alert>
          )}

          {resetMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {resetMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Button
              onClick={handleClose}
              fullWidth
              variant="outlined"
              sx={{
                color: "gray",
                borderColor: "gray",
                py: 1,
                "&:hover": {
                  borderColor: teal[500],
                  color: teal[500],
                },
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={resetLoading}
              sx={{
                bgcolor: teal[500],
                py: 1,
                "&:hover": { bgcolor: teal[700] },
                "&:disabled": { bgcolor: "gray" },
              }}
            >
              {resetLoading ? "Sending..." : "Send Reset link"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PwdResetModal;
