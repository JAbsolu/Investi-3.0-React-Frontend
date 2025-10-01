import { Box, TextField, Button, Typography, Avatar } from "@mui/material";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { ref, set } from "firebase/database";
import { database } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { teal } from "@mui/material/colors";

const Signup = () => {
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        selectedPlan: "premium",
        subscriptions: null
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const auth = getAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (userInfo.password !== userInfo.passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setSuccess("");

        try {
            // Create user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password);
            const user = userCredential.user;

            // Update user profile with first and last name
            await updateProfile(user, {
                displayName: `${userInfo.firstName} ${userInfo.lastName}`
            });

            // Add user to database
            await set(ref(database, `users/${user.uid}`), {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                plan: userInfo.selectedPlan,
                subscriptions: null,
                createdAt: Date.now()
            });

            setSuccess("Signup successful!");
            setTimeout(() => {
                navigate("/onboarding", { replace: true });
            }, 2000);
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                padding: 2,
                backgroundColor: "#000000",
                color: "#FFFFFF",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    padding: 6,
                }}
            >
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}> 
                    <Avatar sx={{ m: 1, bgcolor: teal[500] }}>
                        <FaChartLine />
                    </Avatar>
                    <Typography sx={{ mt: 1.5 }} component="h1" variant="h5">
                        investi
                    </Typography>
                </Box>
                 <Typography variant="body1" gutterBottom sx={{ color: "#000000", textAlign: "center" }}>
                    Create an Account
                </Typography>
                <form onSubmit={handleSignup} style={{ width: "100%", maxWidth: 400 }}>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userInfo.firstName}
                        onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                    />
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userInfo.lastName}
                        onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                    />
                    <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={userInfo.password}
                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                    />
                    <TextField
                        label="Password confirmation"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={userInfo.passwordConfirmation}
                        onChange={(e) => setUserInfo({ ...userInfo, passwordConfirmation: e.target.value })}
                    />
                    {error && (
                        <Typography color="error" variant="body2" gutterBottom>
                            {error}
                        </Typography>
                    )}
                    {success && (
                        <Typography color="success" variant="body2" gutterBottom>
                            {success}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ 
                            marginTop: 2,
                            bgcolor: teal[500],
                            "&:hover": { bgcolor: teal[600] }
                        }}
                    >
                        Sign Up
                    </Button>
                </form>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Already have an account?{" "}
                  <a href="/signin" style={{ color: teal[500] }}>
                    Sign in
                  </a>
                </Typography>
            </Box>
        </Box>
    );
};

export default Signup;