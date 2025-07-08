"use client";

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// A custom theme for this app - styled to match MiFiX AI look and feel
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
      main: '#f5f5f5', // Light grey for UI elements
      dark: '#d7d7d7',
      light: '#ffffff',
    },
    background: {
      default: '#f7fafc', // Light gray background
      paper: '#ffffff',  // White for cards and panels
      chat: {
        bot: '#0078d7',   // Blue for bot chat bubbles
        user: '#f1f1f1', // Light grey for user chat bubbles
      }
    },
    text: {
      primary: '#000000',
      secondary: '#5f6368',
      bot: '#ffffff',     // White text for bot messages
      user: '#000000',    // Black text for user messages
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
