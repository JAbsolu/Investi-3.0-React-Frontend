import React, { useState, useEffect } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Box, Typography, Container, Card, CardContent,
    useMediaQuery, useTheme, IconButton, Drawer,
    Button, Avatar, Divider, Alert
} from "@mui/material";
import { teal, grey, red } from "@mui/material/colors";
import { 
    FaBars, FaUser, FaEnvelope, FaSignOutAlt, FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebaseConfig";
import { signOut } from "firebase/auth";

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const SettingsPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [signOutLoading, setSignOutLoading] = useState(false);
    
    const theme = useTheme();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // Get current user info
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser({
                name: currentUser.displayName || 'User',
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                uid: currentUser.uid
            });
        }
    }, []);

    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle sign out
    const handleSignOut = async () => {
        setSignOutLoading(true);
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setSignOutLoading(false);
        }
    };

    return (
        <Box sx={{ 
            display: "flex",
            height: "100vh",
            backgroundColor: darkBg, 
            color: white, 
            background: darkGradient,
            overflow: "hidden"
        }}>
            {/* Left Sidebar - Desktop */}
            {!isSmallScreen && (
                <Box sx={{ 
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
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        width: 240,
                        boxSizing: 'border-box',
                        background: darkGradient,
                        borderRight: `1px solid ${teal[900]}`,
                    },
                }}
            >
                <DashboardSidebar onClose={handleDrawerToggle} />
            </Drawer>
            
            {/* Main Content */}
            <Box 
                data-scrollable="true"
                sx={{ 
                    overflow: "auto",
                    height: "100vh",
                    width: "100%",
                    '&::-webkit-scrollbar': { 
                        display: 'none'
                    },
                    scrollbarWidth: 'none',
                    '-ms-overflow-style': 'none',
                }}>
                {/* Mobile nav toggle - only visible on mobile */}
                {isSmallScreen && (
                    <Box px={2} pt={2}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ 
                                mb: 2, 
                                display: { md: 'none' },
                                color: teal[400],
                                '&:hover': { 
                                    backgroundColor: 'rgba(0, 128, 128, 0.1)',
                                }
                            }}
                        >
                            <FaBars />
                        </IconButton>
                    </Box>
                )}
                
                <Container maxWidth="lg" sx={{ mt: isSmallScreen ? 0 : 4, pb: 5 }}>

                    {/* User Profile Section */}
                    <Card
                        sx={{
                            background: 'rgba(20, 30, 20, 0.3)',
                            borderRadius: '12px',
                            mb: 4,
                            minWidth: '100%',
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Typography 
                                variant="h6" 
                                color={teal[300]} 
                                fontWeight="bold" 
                                mb={3}
                                sx={{ fontSize: '1.1rem' }}
                            >
                                Account Information
                            </Typography>
                            
                            {user && (
                                <Box>
                                    {/* User Avatar and Name */}
                                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                                        <Avatar
                                            src={user.photoURL}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                backgroundColor: teal[600],
                                                fontSize: '2rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography 
                                                variant="h6" 
                                                color={white} 
                                                fontWeight="bold"
                                                sx={{ fontSize: '1.2rem' }}
                                            >
                                                {user.name}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                color={grey[400]}
                                                sx={{ fontSize: '0.9rem' }}
                                            >
                                                Member since {new Date().getFullYear()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ bgcolor: teal[800], opacity: 0.3, my: 3 }} />

                                    {/* User Details */}
                                    <Box mb={3}>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <FaUser color={teal[400]} />
                                            <Box>
                                                <Typography 
                                                    variant="body2" 
                                                    color={grey[400]}
                                                    sx={{ fontSize: '0.8rem' }}
                                                >
                                                    Display Name
                                                </Typography>
                                                <Typography 
                                                    variant="body1" 
                                                    color={white}
                                                    sx={{ fontSize: '1rem' }}
                                                >
                                                    {user.name}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <FaEnvelope color={teal[400]} />
                                            <Box>
                                                <Typography 
                                                    variant="body2" 
                                                    color={grey[400]}
                                                    sx={{ fontSize: '0.8rem' }}
                                                >
                                                    Email Address
                                                </Typography>
                                                <Typography 
                                                    variant="body1" 
                                                    color={white}
                                                    sx={{ fontSize: '1rem' }}
                                                >
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ bgcolor: teal[800], opacity: 0.3, my: 3 }} />

                                    {/* Sign Out Section */}
                                    <Box>
                                        <Typography 
                                            variant="body1" 
                                            color={white} 
                                            mb={2}
                                            sx={{ fontSize: '1rem' }}
                                        >
                                            Account Actions
                                        </Typography>
                                        <Button
                                            onClick={handleSignOut}
                                            disabled={signOutLoading}
                                            startIcon={<FaSignOutAlt />}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: red[600],
                                                color: white,
                                                textTransform: 'none',
                                                fontWeight: 'bold',
                                                px: 3,
                                                py: 1.5,
                                                '&:hover': {
                                                    backgroundColor: red[700],
                                                },
                                                '&:disabled': {
                                                    backgroundColor: grey[700],
                                                    color: grey[400],
                                                }
                                            }}
                                        >
                                            {signOutLoading ? 'Signing Out...' : 'Sign Out'}
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Settings Sections can be added here */}
                    <Alert 
                        severity="info"
                        sx={{
                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                            color: white,
                            border: `1px solid ${teal[800]}`,
                            '& .MuiAlert-icon': { color: teal[400] },
                            maxWidth: 600
                        }}
                    >
                        More settings and preferences will be available in future updates.
                    </Alert>
                </Container>
            </Box>
        </Box>
    );
};

export default SettingsPage;
