"use client";

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Default color palette
const defaultColors = {
  primary: '#0078d7',
  secondary: '#2f8fef',
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  info: '#0078d7',
};

// Create a context for theme customization
export const ThemeCustomizationContext = React.createContext({
  colors: defaultColors,
  updateColor: (key, value) => {},
  resetColors: () => {},
});

// Custom hook to use theme customization
export const useThemeCustomization = () => {
  const context = React.useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error('useThemeCustomization must be used within MuiThemeProvider');
  }
  return context;
};

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
  const clamp = (val) => Math.min(Math.max(val, 0), 255);
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Function to create theme based on colors
const createAppTheme = (colors) => createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      dark: adjustColor(colors.primary, -20),
      light: adjustColor(colors.primary, 20),
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      dark: adjustColor(colors.secondary, -20),
      light: adjustColor(colors.secondary, 20),
      contrastText: '#ffffff',
    },
    tertiary: {
      main: adjustColor(colors.primary, -40),
      dark: adjustColor(colors.primary, -60),
      light: adjustColor(colors.primary, -20),
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      gradient: `linear-gradient(135deg, ${adjustColor(colors.primary, 100)} 0%, ${colors.secondary} 100%)`,
      chat: {
        bot: colors.primary,
        user: '#f1f1f1',
      }
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
      disabled: '#a0aec0',
      bot: '#ffffff',
      user: '#1a202c',
    },
    success: {
      main: colors.success,
      dark: adjustColor(colors.success, -20),
      light: adjustColor(colors.success, 20),
    },
    warning: {
      main: colors.warning,
      dark: adjustColor(colors.warning, -20),
      light: adjustColor(colors.warning, 20),
    },
    error: {
      main: colors.error,
      dark: adjustColor(colors.error, -20),
      light: adjustColor(colors.error, 20),
    },
    info: {
      main: colors.info,
      dark: adjustColor(colors.info, -20),
      light: adjustColor(colors.info, 20),
    },
    action: {
      active: colors.primary,
      hover: `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.08)`,
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  shape: {
    borderRadius: 8, // Rounded corners for all components
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          color: '#000000',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 16px',
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
  },
});

export default function MuiThemeProvider({ children }) {
  // Initialize with default colors to prevent hydration mismatch
  const [colors, setColors] = React.useState(defaultColors);
  const [isClient, setIsClient] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch theme colors from API
  const fetchThemeFromAPI = React.useCallback(async () => {
    try {
      const response = await fetch('/api/theme', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store', // Always fetch fresh data
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setColors(result.data);
        // Also cache in localStorage for instant load on next visit
        if (typeof window !== 'undefined') {
          localStorage.setItem('themeColors', JSON.stringify(result.data));
        }
      }
    } catch (error) {
      console.error('Failed to fetch theme from API:', error);
      // Fallback to localStorage if API fails
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('themeColors');
        if (saved) {
          try {
            setColors(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved theme colors:', e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load theme on mount and set up polling for updates
  React.useEffect(() => {
    setIsClient(true);
    
    // Initial fetch
    fetchThemeFromAPI();
    
    // Poll for updates every 30 seconds (adjust as needed)
    const interval = setInterval(() => {
      fetchThemeFromAPI();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchThemeFromAPI]);

  // Create theme based on current colors
  const theme = React.useMemo(() => createAppTheme(colors), [colors]);

  // Update a specific color (saves to API)
  const updateColor = React.useCallback(async (key, value) => {
    // Optimistic update
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    
    // Save to API
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: newColors }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update with server response (in case of normalization)
        setColors(result.data);
        
        // Also update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('themeColors', JSON.stringify(result.data));
        }
      } else {
        console.error('Failed to update theme:', result.error);
        // Revert on error
        setColors(colors);
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Revert on error
      setColors(colors);
    }
  }, [colors]);

  // Reset to default colors (calls API DELETE)
  const resetColors = React.useCallback(async () => {
    try {
      const response = await fetch('/api/theme', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setColors(result.data);
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('themeColors');
        }
      }
    } catch (error) {
      console.error('Failed to reset theme:', error);
      // Fallback to default
      setColors(defaultColors);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('themeColors');
      }
    }
  }, []);

  const contextValue = React.useMemo(
    () => ({ colors, updateColor, resetColors }),
    [colors, updateColor, resetColors]
  );

  return (
    <ThemeCustomizationContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCustomizationContext.Provider>
  );
}
