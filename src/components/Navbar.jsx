import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoAnalyticsSharp } from "react-icons/io5";
import { Box, Typography } from "@mui/material";
import { teal } from "@mui/material/colors";

// Constants for colors
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";
// const teal = {
//   400: '#2dd4bf',
//   700: '#0f766e',
//   800: '#115e59'
// };
const grey = {
  100: '#f3f4f6',
  900: '#111827'
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileNav(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleDrawer = (open) => () => {
    setMenuOpen(open);
  };

  const navigate = useNavigate();

  return (
    <div>
      {/* Navbar */}
      <div style={{ 
        background: darkGradient,
        borderBottom: `1px solid ${grey[900]}`,
        zIndex: 10,
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 auto',
          width: '98%',
          height: '64px',
          padding: '0 16px'
        }}>
          {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
              }}
            >
              <IoAnalyticsSharp size={28} style={{ color: teal[400], marginRight: '12px' }} />
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  color: white, // Fallback color
                  background: `linear-gradient(90deg, ${teal[400]}, ${teal[300]})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  MozBackgroundClip: 'text',
                  MozTextFillColor: 'transparent',
                  letterSpacing: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                  },
                  // Fallback for browsers that don't support gradient text
                  '@supports not (background-clip: text)': {
                    color: teal[400],
                    background: 'none',
                  }
                }} 
                onClick={() => navigate("/")}
              >
                Investi
              </Typography>
            </Box>

          {/* Auth Buttons - Desktop */}
          <div style={{ 
            display: isMobileNav ? 'none' : 'flex', 
            gap: '16px',
            alignItems: 'center'
          }}>
            <button 
                onClick={() => navigate('/signin')}
                style={{
                color: grey[100],
                border: `1px solid ${teal[800]}`,
                borderRadius: '8px',
                background: 'transparent',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in
            </button>
            <button style={{
              backgroundColor: teal[700],
              color: white,
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button style={{
            display: isMobileNav ? 'block' : 'none',
            color: teal[400],
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px'
          }}
          onClick={toggleDrawer(true)}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '250px',
          height: '100vh',
          background: darkGradient,
          borderLeft: `1px solid ${grey[900]}`,
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
              }}
            >
              <IoAnalyticsSharp size={28} style={{ color: teal[400], marginRight: '12px' }} />
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  color: white, // Fallback color
                  background: `linear-gradient(90deg, ${teal[400]}, ${teal[300]})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  MozBackgroundClip: 'text',
                  MozTextFillColor: 'transparent',
                  letterSpacing: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                  },
                  // Fallback for browsers that don't support gradient text
                  '@supports not (background-clip: text)': {
                    color: teal[400],
                    background: 'none',
                  }
                }} 
                onClick={() => navigate("/")}
              >
                Investi
              </Typography>
            </Box>
            <button 
              onClick={toggleDrawer(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: white,
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ borderTop: `1px solid ${teal[800]}`, opacity: 0.5, margin: '16px 0' }} />
          
          {/* Mobile Auth Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <button 
              onClick={() => navigate('/signin')}
              style={{
                color: grey[100],
                border: `1px solid ${teal[800]}`,
                borderRadius: '8px',
                background: 'transparent',
                padding: '10px 14px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Sign In
            </button>
            
            <button style={{
              backgroundColor: teal[700],
              color: white,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={toggleDrawer(false)}
        />
      )}
    </div>
  );
};

export default Navbar;