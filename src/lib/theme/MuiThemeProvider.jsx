"use client";

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// A custom theme for this app - sleek and professional financial dashboard
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0078d7', // Bright blue for buttons and accents (from screenshot)
      dark: '#00468e', // Darker blue
      light: '#4ca6ff', // Lighter blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2f8fef', // Blue to match the login gradient
      dark: '#1e6bb8', // Darker blue
      light: '#5ba3f2', // Lighter blue
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#37527e', // Deep blue for performance metrics
      dark: '#2a3f60',
      light: '#5a6f94',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Clean light background
      paper: '#ffffff',   // Pure white for cards and panels
      gradient: 'linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)', // Blue gradient to match login
      chat: {
        bot: '#0078d7',   // Blue for bot chat bubbles
        user: '#f1f1f1', // Light grey for user chat bubbles
      }
    },
    text: {
      primary: '#1a202c',    // Dark professional text
      secondary: '#4a5568',  // Muted secondary text
      disabled: '#a0aec0',   // Disabled text
      bot: '#ffffff',        // White text for bot messages
      user: '#1a202c',       // Dark text for user messages
    },
    success: {
      main: '#48bb78',   // Professional green
      dark: '#38a169',
      light: '#68d391',
    },
    warning: {
      main: '#ed8936',   // Professional orange
      dark: '#dd6b20',
      light: '#f6ad55',
    },
    error: {
      main: '#f56565',   // Professional red
      dark: '#e53e3e',
      light: '#fc8181',
    },
    info: {
      main: '#0078d7',   // Blue for information
      dark: '#00468e',
      light: '#4ca6ff',
    },
    action: {
      active: '#0078d7',
      hover: 'rgba(0, 120, 215, 0.08)',
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
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0078d7',
              borderWidth: 2,
            },
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
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
