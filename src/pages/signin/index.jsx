import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Container, TextField, Button, Typography, Box, Avatar } from "@mui/material";
import { FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import Cookies from "js-cookie";
import PwdResetModal from "./components/PwdResetModal";
import { teal } from "@mui/material/colors";

// const API_URL = process.env.REACT_APP_API_URL;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email;
      const username = user.displayName;
      
      Cookies.set("userName", username);
      Cookies.set("userEmail", email);
  
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const email = user.email;
        const name = user.displayName;
        Cookies.set("userEmail", email);
        Cookies.set("userName", name);
        console.info("User is signed in");
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error("Error signing in", error.message);
      });
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "black",
        color: "white",
      }}
    >
      {showResetModal && (
        <PwdResetModal
          open={showResetModal}
          onClose={() => setShowResetModal(false)}
          initialEmail={email}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "white",
          color: "black",
          p: 4,
          maxWidth: "25em",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
       <Box 
        sx={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          gap: "3px"
        }} 
      >
        <Avatar sx={{ m: 1, bgcolor: teal[500] }}>
            <FaChartLine />
          </Avatar>
          <Typography sx={{ mt: 1.5 }} component="h1" variant="h5">
            investi
          </Typography>
       </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, textAlign: "center", color: "#000000"}}>
          Enter your credentials to access Investi's powerful stock insights.
        </Typography>
        <Box component="form" onSubmit={handleSignIn} sx={{ mt: 3 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            InputProps={{
              style: { color: "black" },
            }}
            InputLabelProps={{
              style: { color: "gray" },
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: teal[300],
                },
                "&.Mui-focused fieldset": {
                  borderColor: teal[500],
                },
              },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            InputProps={{
              style: { color: "black" },
            }}
            InputLabelProps={{
              style: { color: "gray" },
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: teal[300],
                },
                "&.Mui-focused fieldset": {
                  borderColor: teal[500],
                },
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: teal[500],
              "&:hover": { bgcolor: teal[600] },
            }}
          >
            Sign In
          </Button>
          
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="body2"
              onClick={() => setShowResetModal(true)}
              sx={{
                color: teal[600],
                cursor: "pointer",
                textDecoration: "underline",
                "&:hover": {
                  color: teal[400],
                },
              }}
            >
              Forgot your password?
            </Typography>
          </Box>

          {errorMessage && (
            <Typography color="error" variant="body2" align="center">
              {errorMessage}
            </Typography>
          )}
        </Box>
       {/* sign in with google */}
       <Box 
        sx={{
          display: "flex",
          justifyContent: "start",
          msxWidth: "25em"
        }}
       >
        <button 
            onClick={signInWithGoogle}
            style={{
              padding: "0.4em 3em"
            }}
          >
            <Typography 
              sx={{ 
                color: "#fffffff", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                gap: "10px",
                fontSize: "11pt",
                "&:hover": {
                  cursor: "pointer"
                }
              }
            }>
              <FcGoogle /> 
              Google
          </Typography>
          </button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <a href="/signup" style={{ color: teal[500], textDecoration: "none" }}>
            Sign up
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignIn;
