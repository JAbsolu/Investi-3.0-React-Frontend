import { Box, Button, Typography, Tooltip, Divider } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { green, blue, grey, teal, red } from "@mui/material/colors";
import { 
  IoHomeSharp, 
  IoNewspaperOutline, 
  IoChatbubbleEllipsesOutline,
  IoSettingsOutline, 
  IoLogOutOutline,
  IoAnalyticsSharp
} from "react-icons/io5";

function DashboardSidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if a route is active
  const isActive = (path) => {
    if (path === "/dashboard" && currentPath === "/dashboard") return true;
    if (path !== "/dashboard" && currentPath.includes(path)) return true;
    return false;
  };

  // ------------------ Sign Out ------------------
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Button styles with active state
  const getButtonStyle = (path) => ({
    justifyContent: "flex-start",
    color: isActive(path) ? green[400] : grey[300],
    backgroundColor: isActive(path) ? 'rgba(0, 128, 0, 0.1)' : 'transparent',
    borderRadius: '10px',
    py: 1.2,
    px: 2,
    mb: 0.5,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 128, 0, 0.15)',
      color: isActive(path) ? green[300] : grey[100],
      transform: 'translateX(5px)',
    },
    '& .MuiButton-startIcon': {
      color: isActive(path) ? green[400] : teal[300],
      marginRight: 1.5,
      transition: 'all 0.2s ease',
    },
    '&:hover .MuiButton-startIcon': {
      color: isActive(path) ? green[300] : green[400],
    },
    fontWeight: isActive(path) ? 600 : 400,
    textTransform: 'none',
    fontSize: '0.95rem',
    letterSpacing: 0.3,
  });

  // Add click handler for mobile
  const handleItemClick = () => {
    if (onClose) {
      onClose(); // Close drawer when item is clicked on mobile
    }
  };

  return (
    <Box
      sx={{
        width: "220px", // Changed from minWidth: "15em" to match grid column
        flexShrink: 0, // Prevent shrinking
        borderRight: `solid 1px ${grey[900]}`,
        background: 'linear-gradient(to bottom, #121212, #0d0d0d)',
        px: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh", // Use height instead of minHeight
        boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '1px',
          height: '100%',
          background: `linear-gradient(to bottom, transparent, ${green[900]}, transparent)`,
          opacity: 0.6,
        }
      }}
    >
      <Box>
        {/* Logo Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            py: 3, 
            px: 2, 
            mb: 3,
            borderBottom: `1px solid ${grey[900]}`,
          }}
        >
          <IoAnalyticsSharp size={28} style={{ color: green[400], marginRight: '12px' }} />
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ 
              color: 'white',
              background: `linear-gradient(90deg, ${teal[400]}, ${green[400]})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: 0.5,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(5px)',
              }
            }} 
            onClick={() => navigate("/dashboard")}
          >
            Investi
          </Typography>
        </Box>

        {/* Navigation Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
          <Tooltip title="Dashboard" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard");
                handleItemClick();
              }}
              startIcon={<IoHomeSharp size={20} />}
              sx={getButtonStyle("/dashboard")}
            >
              Dashboard
            </Button>
          </Tooltip>

          <Tooltip title="Chat with AI" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/chat");
                handleItemClick();
              }}
              startIcon={<IoChatbubbleEllipsesOutline size={20} />}
              sx={getButtonStyle("/dashboard/chat")}
            >
              Chat
            </Button>
          </Tooltip>

          <Tooltip title="Latest News" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/news");
                handleItemClick();
              }}
              startIcon={<IoNewspaperOutline size={20} />}
              sx={getButtonStyle("/dashboard/news")}
            >
              Market News
            </Button>
          </Tooltip>

          <Tooltip title="Settings" placement="right" arrow>
            <Button 
              onClick={() => {
                navigate("/dashboard/settings");
                handleItemClick();
              }}
              startIcon={<IoSettingsOutline size={20} />}
              sx={getButtonStyle("/dashboard/settings")}
            >
              Settings
            </Button>
          </Tooltip>
          
          {/* Divider before Sign Out */}
          <Divider sx={{ 
            my: 2, 
            bgcolor: grey[900], 
            width: '90%', 
            mx: 'auto',
            opacity: 0.7 
          }} />
          
          {/* Sign Out Button integrated into main navigation */}
          <Tooltip title="Sign Out" placement="right" arrow>
            <Button
              onClick={handleSignOut}
              startIcon={<IoLogOutOutline size={20} />}
              sx={{
                justifyContent: "flex-start",
                color: red[400],
                backgroundColor: 'transparent',
                borderRadius: '10px',
                py: 1.2,
                px: 2,
                mb: 0.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: red[300],
                  transform: 'translateX(5px)',
                },
                '& .MuiButton-startIcon': {
                  color: red[400],
                  marginRight: 1.5,
                  transition: 'all 0.2s ease',
                },
                '&:hover .MuiButton-startIcon': {
                  color: red[300],
                },
                fontWeight: 400,
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: 0.3,
              }}
            >
              Sign Out
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Removed the footer section with Sign Out button */}
      <Box sx={{ mb: 4, px: 1 }}>
        {/* You can add a version number or other info here */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: grey[700],
            display: 'block',
            textAlign: 'center',
            fontSize: '0.7rem',
            mt: 2 
          }}
        >
          Investi v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardSidebar;
