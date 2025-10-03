import { Box, Button, Typography, Tooltip, Divider } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { grey, teal } from "@mui/material/colors";
import { 
  IoHomeSharp, 
  IoSettingsOutline, 
  IoAnalyticsSharp,
  IoCompassOutline,
  IoTrendingUpOutline,
  IoDocumentTextOutline,
  IoSearchOutline
} from "react-icons/io5";
import { FaUniversity } from "react-icons/fa";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState } from "react";
import { useResponsive } from "../../../hooks/useResponsive";
function DashboardSidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isMobile, isDesktop } = useResponsive();

  const [isCollapsed, setIsCollapsed] = useState(true);

  // Check if a route is active
  const isActive = (path) => {
    if (path === "/dashboard" && currentPath === "/dashboard") return true;
    if (path !== "/dashboard" && currentPath.includes(path)) return true;
    return false;
  };

  // Button styles with active state
  const getButtonStyle = (path) => ({
    justifyContent: "flex-start",
    color: isActive(path) ? teal[400] : grey[300],
    backgroundColor: isActive(path) && !isCollapsed ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
    borderRadius: '10px',
    py: 1.2,
    px: 2,
    mb: 0.5,
    maxWidth: '90%',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: !isCollapsed && 'rgba(20, 184, 166, 0.15)',
      color: isActive(path) ? teal[300] : grey[100],
      transform: 'translateX(5px)',
    },
    '& .MuiButton-startIcon': {
      color: isActive(path) && isCollapsed ? teal[100] : isActive(path) ? teal[400] : teal[300],
      marginRight: 1.5,
      transition: 'all 0.2s ease',
    },
    '&:hover .MuiButton-startIcon': {
      color: isActive(path) ? teal[300] : teal[400],
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
    <>
      {!isCollapsed && (
        <Box
          sx={{
            // width: "220px",
            flexShrink: 0,
            borderRight: `solid 1px ${grey[900]}`,
            background: 'linear-gradient(to bottom, #121212, #0d0d0d)',
            px: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            height: "100vh",
            position: "sticky", 
            top: 0,
            boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '1px',
              height: '100%',
              background: `linear-gradient(to bottom, transparent, ${teal[900]}, transparent)`,
              opacity: 0.6,
            }
          }}
        >
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
            <IoAnalyticsSharp size={28} style={{ color: teal[400], marginRight: !isCollapsed && '12px' }} />
            {isCollapsed && !isMobile && (
              <ChevronRightIcon 
                sx={{ 
                  color: teal[400], 
                  fontSize: 28,
                  "&:hover": { 
                    cursor: 'pointer', 
                    color: teal[300] 
                  }
                }} 
                onClick={() => setIsCollapsed(false)}
              />
            )}
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ 
                color: 'white',
                background: `linear-gradient(90deg, ${teal[400]}, ${teal[300]})`,
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
            {!isCollapsed && !isMobile && (
              <ChevronLeftIcon 
                sx={{ 
                  color: teal[400], 
                  ml: 4,
                  fontSize: 28,
                  "&:hover": { 
                    cursor: 'pointer', 
                    color: teal[300] 
                  }
                }} 
                onClick={() => setIsCollapsed(true)}
              />
            )}
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

            <Tooltip title="AI Research Analysis" placement="right" arrow>
              <Button
                onClick={() => {
                  navigate("/dashboard/research");
                  handleItemClick();
                }}
                startIcon={<IoSearchOutline size={20} />}
                sx={getButtonStyle("/dashboard/research")}
              >
                AI Research
              </Button>
            </Tooltip>

            <Tooltip title="Discover News" placement="right" arrow>
              <Button
                onClick={() => {
                  navigate("/dashboard/news");
                  handleItemClick();
                }}
                startIcon={<IoCompassOutline size={24} />}
                sx={getButtonStyle("/dashboard/news")}
              >
                Discover
              </Button>
            </Tooltip>

            <Tooltip title="Congressional Trading" placement="right" arrow>
              <Button
                onClick={() => {
                  navigate("/dashboard/congress");
                  handleItemClick();
                }}
                startIcon={<FaUniversity size={20} />}
                sx={getButtonStyle("/dashboard/congress")}
              >
                Congress
              </Button>
            </Tooltip>

            <Tooltip title="Movers" placement="right" arrow>
              <Button
                onClick={() => {
                  navigate("/dashboard/movers");
                  handleItemClick();
                }}
                startIcon={<IoTrendingUpOutline size={20} />}
                sx={getButtonStyle("/dashboard/movers")}
              >
                Movers
              </Button>
            </Tooltip>

            <Tooltip title="Financial Statements" placement="right" arrow>
              <Button
                onClick={() => {
                  navigate("/dashboard/statements");
                  handleItemClick();
                }}
                startIcon={<IoDocumentTextOutline size={20} />}
                sx={getButtonStyle("/dashboard/statements")}
              >
                Statements
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

            {/* {!hasPremiumAccess && (
              <Chip
                icon={<FaCrown color='black' />}
                label="UPGRADE"
                sx={{
                  backgroundColor: amber[600],
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 1,
                  "&:hover": { cursor: 'pointer', backgroundColor: amber[500] }
                }}
                onClick={() => setShowPaywall(true)}
              />
            )} */}

          </Box>
        </Box>
      )}

      {isCollapsed && (
        <Box
          sx={{
            width: "65px",
            flexShrink: 0,
            borderRight: `solid 1px ${grey[900]}`,
            background: 'linear-gradient(to bottom, #121212, #0d0d0d)',
            // px: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            height: "100vh",
            position: "sticky", 
            top: 0,
            boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '1px',
              height: '100%',
              background: `linear-gradient(to bottom, transparent, ${teal[900]}, transparent)`,
              opacity: 0.6,
            }
          }}
        >
        {/* Logo Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            mb: 3,
            borderBottom: `1px solid ${grey[900]}`,
          }}
        >
          {/* <IoAnalyticsSharp size={28} style={{ color: teal[400], marginRight: !isCollapsed && '12px' }} /> */}
          <ChevronRightIcon 
            sx={{ 
              color: teal[400], 
              fontSize: 28,
              "&:hover": { 
                cursor: 'pointer', 
                color: teal[300] 
              }
            }} 
            onClick={() => setIsCollapsed(false)}
          />
        </Box>

        {/* Navigation Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
          <Tooltip title="Dashboard" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard");
                handleItemClick();
              }}
              startIcon={<IoHomeSharp size={24} />}
              sx={getButtonStyle("/dashboard")}
            >
            </Button>
          </Tooltip>

          <Tooltip title="AI Research Analysis" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/research");
                handleItemClick();
              }}
              startIcon={<IoSearchOutline size={24} />}
              sx={getButtonStyle("/dashboard/research")}
            >
            </Button>
          </Tooltip>

          <Tooltip title="Discover News" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/news");
                handleItemClick();
              }}
              startIcon={<IoCompassOutline size={24} />}
              sx={getButtonStyle("/dashboard/news")}
            >
            </Button>
          </Tooltip>

          <Tooltip title="Congressional Trading" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/congress");
                handleItemClick();
              }}
              startIcon={<FaUniversity size={24} />}
              sx={getButtonStyle("/dashboard/congress")}
            >
            </Button>
          </Tooltip>

          <Tooltip title="Movers" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/movers");
                handleItemClick();
              }}
              startIcon={<IoTrendingUpOutline size={24} />}
              sx={getButtonStyle("/dashboard/movers")}
            >
            </Button>
          </Tooltip>

          <Tooltip title="Financial Statements" placement="right" arrow>
            <Button
              onClick={() => {
                navigate("/dashboard/statements");
                handleItemClick();
              }}
              startIcon={<IoDocumentTextOutline size={24} />}
              sx={getButtonStyle("/dashboard/statements")}
            >
            </Button>
          </Tooltip>

          <Tooltip title="Settings" placement="right" arrow>
            <Button 
              onClick={() => {
                navigate("/dashboard/settings");
                handleItemClick();
              }}
              startIcon={<IoSettingsOutline size={24} />}
              sx={getButtonStyle("/dashboard/settings")}
            >
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
        </Box>
        </Box>
      )}
    </>
  )
};

export default DashboardSidebar;
