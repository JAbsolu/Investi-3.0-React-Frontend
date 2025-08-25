import { Box, Typography, List, ListItem, ListItemText, Paper, Divider } from "@mui/material";
import { teal, green, grey } from "@mui/material/colors";
import { FaBrain, FaChartLine, FaUsers, FaRocket, FaCloudDownloadAlt, FaHistory } from "react-icons/fa";
import Navbar from "../../components/Navbar";

const Features = () => {
    return (
        <Box backgroundColor="#000000" color="#FFFFFF" minHeight="100vh" padding={2}>
            <Navbar />
            <Typography variant="h3" gutterBottom sx={{ textAlign: "start", marginTop: 4 }}>
                App Features
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "start", width: "100%", marginBottom: 4 }}>
                Welcome to Investi, your go-to research app for stock analysis. Our application leverages cutting-edge
                generative AI to provide detailed insights into whether a stock is bullish or bearish. Additionally, we
                provide key statistics to help you make informed investment decisions.
            </Typography>
            
            <Paper elevation={3} sx={{ 
                backgroundColor: 'rgba(10, 25, 10, 0.7)', 
                borderRadius: 2,
                border: `1px solid ${green[900]}`,
                mb: 4,
                p: 3
            }}>
                <Typography variant="h5" gutterBottom sx={{ color: teal[400], fontWeight: 'bold' }}>
                    Core Features
                </Typography>
                <Divider sx={{ bgcolor: green[900], my: 2 }} />
                
                <List sx={{ width: "100%"}}>
                    <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: teal[400], mt: 0.5 }}>
                            <FaBrain size={24} />
                        </Box>
                        <ListItemText
                            primary="AI-Powered Stock Analysis"
                            secondary="Our app uses generative AI to analyze market trends, technical indicators, and fundamental data to provide comprehensive predictions on whether a stock is bullish or bearish."
                            sx={{
                                "& .MuiTypography-primary": { fontWeight: "bold", color: teal[400], mb: 0.5 },
                                "& .MuiTypography-body2": { color: grey[300] } 
                            }}
                        />
                    </ListItem>
                    
                    <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: teal[400], mt: 0.5 }}>
                            <FaChartLine size={24} />
                        </Box>
                        <ListItemText
                            primary="Real-Time Stock Statistics"
                            secondary="Access detailed statistics such as price-to-earnings ratio, market cap, dividend yield, historical performance charts, and more to make data-driven investment decisions."
                            sx={{
                                "& .MuiTypography-primary": { fontWeight: "bold", color: teal[400], mb: 0.5 },
                                "& .MuiTypography-body2": { color: grey[300] } 
                            }}
                        />
                    </ListItem>
                    
                    <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: teal[400], mt: 0.5 }}>
                            <FaCloudDownloadAlt size={24} />
                        </Box>
                        <ListItemText
                            primary="Globally Cached Analysis Results"
                            secondary="Our platform intelligently caches stock analyses, making them instantly available to all users. This means you get immediate access to recent analyses without waiting for processing, while ensuring data stays fresh and relevant."
                            sx={{
                                "& .MuiTypography-primary": { fontWeight: "bold", color: teal[400], mb: 0.5 },
                                "& .MuiTypography-body2": { color: grey[300] } 
                            }}
                        />
                    </ListItem>
                    
                    <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: teal[400], mt: 0.5 }}>
                            <FaHistory size={24} />
                        </Box>
                        <ListItemText
                            primary="Conversation History"
                            secondary="Engage with our AI in meaningful follow-up conversations about any stock. Your interaction history is preserved, allowing you to pick up where you left off and access your previous insights anytime."
                            sx={{
                                "& .MuiTypography-primary": { fontWeight: "bold", color: teal[400], mb: 0.5 },
                                "& .MuiTypography-body2": { color: grey[300] } 
                            }}
                        />
                    </ListItem>
                </List>
            </Paper>
            
            <Paper elevation={3} sx={{ 
                backgroundColor: 'rgba(10, 25, 10, 0.7)', 
                borderRadius: 2,
                border: `1px solid ${green[900]}`,
                p: 3
            }}>
                <Typography variant="h5" gutterBottom sx={{ color: teal[400], fontWeight: 'bold' }}>
                    User Experience
                </Typography>
                <Divider sx={{ bgcolor: green[900], my: 2 }} />
                
                <List sx={{ width: "100%"}}>
                    <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: teal[400], mt: 0.5 }}>
                            <FaUsers size={24} />
                        </Box>
                        <ListItemText
                            primary="User-Friendly Interface"
                            secondary="Easily navigate through stock data and analysis with our intuitive and clean interface, designed for both beginner investors and experienced traders."
                            sx={{
                                "& .MuiTypography-primary": { fontWeight: "bold", color: teal[400], mb: 0.5 },
                                "& .MuiTypography-body2": { color: grey[300] } 
                            }}
                        />
                    </ListItem>
                    
                    <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: teal[400], mt: 0.5 }}>
                            <FaRocket size={24} />
                        </Box>
                        <ListItemText
                            primary="Real-Time Updates"
                            secondary="Stay updated with real-time stock data and analysis to make timely investment decisions. Our platform refreshes cached analyses after three days to ensure you always have current information."
                            sx={{ 
                                "& .MuiTypography-primary": { fontWeight: "bold", color: green[400], mb: 0.5 },
                                "& .MuiTypography-body2": { color: grey[300] } 
                            }}
                        />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default Features;