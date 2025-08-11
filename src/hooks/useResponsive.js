import { useMediaQuery, useTheme } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isTablet: useMediaQuery(theme.breakpoints.down('lg')),
    isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    isSmallScreen: useMediaQuery(theme.breakpoints.down('md')),
    isMediumScreen: useMediaQuery(theme.breakpoints.down('lg'))
  };
};