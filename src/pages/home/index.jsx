"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { green, teal, grey, red } from '@mui/material/colors';
import FiArrowRight from "@mui/icons-material/ArrowRight";

const API_URL = process.env.REACT_APP_API_URL;

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const cardBg = 'rgba(20, 30, 20, 0.4)';
const white = "#ffffff";

export default function Home() {
  const isSignedIn = false; // temp boolean until you hook in auth
  const [stockData, setStockData] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/yf/stockdata?ticker=NVDA,AAPL,TSLA,GOOGL,VOO,SPY,NFLX,META`);        
        const result = await response.json();

        if (!response.ok) {
          console.log(response.status, response.statusText, result.message);
        }

        setStockData(result.data.body);
        console.log(response.status, response.statusText, result.message);
      } catch (error){
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ 
      minWidth: "100vw", 
      minHeight: "100vh", 
      backgroundColor: darkBg,
      color: white,
      background: darkGradient
    }}>
      {/* App Bar */}
      <Navbar />

      {/* Hero Section */}
      <Container sx={{ 
        textAlign: "center", 
        mt: isMobile ? 5 : 8, 
        maxWidth: "lg",
        position: "relative",
        zIndex: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "10%",
          right: "10%",
          height: "300px",
          background: `radial-gradient(circle, ${teal[900]}22 0%, transparent 70%)`,
          filter: "blur(40px)",
          zIndex: -1,
        }
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                backgroundColor: 'rgba(20, 30, 20, 0.5)',
                px: 2,
                py: 1.5,
                borderRadius: "80px",
                minWidth: isMobile ? "80%" : "16em",
                border: `1px solid ${grey[900]}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: teal[700],
                  color: white,
                  px: 2,
                  py: 0.5,
                  borderRadius: "40px",
                  fontSize: { xs: "10pt", sm: "11pt" },
                  mr: 1,
                }}
              >
                New
              </Typography>
              <Typography variant="body2" sx={{ 
                fontSize: { xs: "10pt", sm: "11pt" },
                color: grey[300]
              }}>
                Join the best platform for AI stock analysis
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            component="h2" 
            sx={{ 
              fontWeight: "bold", 
              mt: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Grow your wealth with{" "}
            <span style={{ color: green[400] }}>real-time <br /> insights</span>
          </Typography>
          <Typography variant="body1" sx={{ 
            color: grey[400], 
            mt: 2,
            mx: 'auto',
            maxWidth: '600px',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Track your investments, make informed decisions, and watch your portfolio thrive—all in one app.
          </Typography>
          
          {/* Get started button */}
          <Box sx={{ display: "flex", justifyContent: "center", m: "1em 0" }}>
            <Link to={isSignedIn ? "/dashboard" : "/signup"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: "24px",
                  padding: isMobile ? "10px 20px" : "12px 24px",
                  backgroundColor: green[600],
                  color: "white",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                  border: "none",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                Get Started <FiArrowRight style={{ marginLeft: "8px" }} />
              </motion.button>
            </Link>
          </Box>
        </motion.div>
      </Container>

      {/* Stock Cards Section */}
      <Container sx={{ 
        mt: isMobile ? 4 : 10, 
        mb: isMobile ? 4 : 10, 
        maxWidth: "lg",
        px: isMobile ? 1 : 2 // Reduce padding on mobile
      }}>
        <Grid container spacing={isMobile ? 1.5 : 3} justifyContent="center">
          {stockData ? stockData.map((stock, index) => (
            <Grid item key={index} xs={6} sm={6} md={3} lg={3}>
              <motion.div style={{ width: '100%' }}>
                <Card
                  sx={{
                    backgroundColor: cardBg,
                    textAlign: "center",
                    p: 0,
                    borderRadius: isMobile ? 1.5 : 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${green[900]}`,
                    height: isMobile ? 'auto' : 98, // Responsive height on mobile
                    width: isMobile ? 360 : 250, // Use full width of grid item
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 8px 25px rgba(0,100,0,0.2)`,
                      borderColor: green[800],
                      background: 'rgba(20, 35, 20, 0.5)',
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: isMobile ? 1 : 1.5, 
                    pb: isMobile ? 1 : 1.5, // Override default padding
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                    '&:last-child': { pb: isMobile ? 1 : 1.5 } // Override MUI default
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: "bold", 
                        color: white,
                        fontSize: { xs: "0.4rem", sm: "0.6rem", md: ".7rem" },
                        mb: 0.2
                      }}>
                        {stock.symbol}
                      </Typography>
                      <Typography variant="body2" color={grey[400]} sx={{ 
                        fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        minHeight: { xs: "2.1em", sm: "2.4em" },
                      }}>
                        {stock.shortName}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} mt={0}>
                      <Typography variant="h6" color={white} sx={{ 
                        fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.8rem" }
                      }}>
                        ${stock.regularMarketPrice.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: stock.regularMarketChange >= 0 ? green[400] : red[400],
                          fontWeight: "bold",
                          fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" }
                        }}
                      >
                        {stock.regularMarketChange >= 0
                          ? `+${stock.regularMarketChange.toFixed(2)}`
                          : stock.regularMarketChange.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )): null}
        </Grid>
      </Container>

      {/* Footer */}
      <Box 
        component="footer"
        sx={{ 
          borderTop: `1px solid ${grey[900]}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '1px',
            background: `linear-gradient(to right, transparent, ${green[900]}, transparent)`,
            opacity: 0.6,
          },
          background: 'rgba(10, 15, 10, 0.8)', // Slightly darker than the main background
          py: 0,
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}
