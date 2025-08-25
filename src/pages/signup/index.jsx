import { Box, TextField, Button, Typography, Avatar } from "@mui/material";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { ref, set } from "firebase/database";
import { database } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const auth = getAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            // Create user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile with first and last name
            await updateProfile(user, {
                displayName: `${firstname} ${lastname}`
            });

            // Add user to database
            await set(ref(database, `users/${user.uid}`), {
                firstName: firstname,
                lastName: lastname,
                email: email,
                createdAt: Date.now()
            });

            setSuccess("Signup successful!");
            navigate("/dashboard");
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
                    <Avatar sx={{ m: 1, bgcolor: "#05df72" }}>
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
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                    <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        Sign Up
                    </Button>
                </form>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Already have an account?{" "}
                  <a href="/signin" style={{ color: "#66bb6a" }}>
                    Sign in
                  </a>
                </Typography>
            </Box>
        </Box>
    );
};

export default Signup;