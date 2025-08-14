import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Container, TextField, Button, Typography, Box, Avatar} from "@mui/material";
import { FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import Cookies from "js-cookie";

const API_URL = process.env.REACT_APP_API_URL;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email;
  
      // You can store it in state, cookies, localStorage, etc.
      Cookies.set("userEmail", email); // Example of storing in a cookie
  
      navigate("/dashboard");
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signed in successfully");
      navigate("/dashboard")
    } catch (error) {
      console.error("Error signing in:", error.message);
      alert("Failed to sign in. Please check your credentials.");
    }
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
        <Avatar sx={{ m: 1, bgcolor: "#05df72" }}>
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
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "green",
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
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "green",
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
              bgcolor: "green.500",
              "&:hover": { bgcolor: "green.600" },
            }}
          >
            Sign In
          </Button>
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
          <a href="/signup" style={{ color: "#66bb6a" }}>
            Sign up
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignIn;
