import { useState } from "react";
import { 
    Box, 
    Typography,
    Container,
    useMediaQuery, 
    useTheme, 
    IconButton, 
    Drawer,
    Divider
} from "@mui/material";
import AIChat from "../components/AIchat";
import DashboardSidebar from "../components/DashboardSidebar";
import { green, teal, grey } from "@mui/material/colors";
import { HiOutlineMenu } from "react-icons/hi";

const ChatPage = () => {
    // Match color scheme with rest of dashboard
    const darkBg = "#0d0d0d";
    const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
    const white = "#ffffff";
    
    // Mobile responsive handling
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);
    
    // Chat state
    const [chatQuery, setChatQuery] = useState('');
    const [currentStock, setCurrentStock] = useState('');
    
    // Toggle drawer for mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle query submission
    const handleSubmitQuery = () => {
        if (chatQuery.trim()) {
            // Pass the query to AIChat component
            // This would depend on how your AIChat component works
            setChatQuery('');
        }
    };

    // Handle enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitQuery();
        }
    };

    return (
        <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: isSmallScreen 
                ? "1fr" 
                : isMediumScreen 
                    ? "220px 1fr" 
                    : "220px minmax(0, 1fr)",
            gridAutoFlow: "column",
            height: "100vh",
            backgroundColor: darkBg, 
            color: white, 
            background: darkGradient,
            overflow: "hidden"
        }}>
            {/* Sidebar - Hidden on mobile */}
            {!isSmallScreen && <DashboardSidebar />}
            
            {/* Mobile sidebar drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                variant="temporary"
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        width: 240,
                        boxSizing: 'border-box',
                        background: darkGradient,
                        borderRight: `1px solid ${green[900]}`,
                    },
                }}
            >
                <DashboardSidebar onClose={handleDrawerToggle} />
            </Drawer>
            
            {/* Main Content */}
            <Box sx={{ 
                overflow: "auto",
                height: "100vh",
                width: "100%",
                // Hide scrollbar but keep scroll functionality
                '&::-webkit-scrollbar': { display: 'none' },
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
                                '&:hover': { backgroundColor: 'rgba(0, 128, 128, 0.1)' }
                            }}
                        >
                            <HiOutlineMenu />
                        </IconButton>
                    </Box>
                )}
                
                {/* Page Header */}
                <Container maxWidth="lg" sx={{ mt: isSmallScreen ? 0 : 4, mb: 3 }}>
                    <Box mb={3}>
                        <Typography 
                            variant="h5" 
                            fontWeight="bold" 
                            color={white} 
                            mb={1}
                            sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' } }}
                        >
                            AI Investment Assistant
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color={grey[400]} 
                            mb={3}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                            Ask questions about stocks, market trends, or investment strategies
                        </Typography>
                        <Divider sx={{ bgcolor: green[900], opacity: 0.5 }} />
                    </Box>
                </Container>
                
                {/* Chat Interface */}
                <Container 
                    maxWidth="lg" 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        flexGrow: 1,
                        height: isSmallScreen ? 'calc(100vh - 180px)' : 'calc(100vh - 220px)',
                        mb: 3
                    }}
                >
                    {/* Main chat area - this will be replaced by your AIChat component */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* This is where we render the AIChat component */}
                        <AIChat 
                            isOpen={true} 
                            onClose={() => {}} 
                            stockSymbol={currentStock}
                            fullPage={true} // Add this prop to your AIChat component to handle full page mode
                        />
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default ChatPage;