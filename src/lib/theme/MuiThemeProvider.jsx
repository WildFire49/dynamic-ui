"use client";

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00468e', // Deep blue for buttons and accents
    },
    secondary: {
      main: '#b3c7dd', // Lighter blue for secondary elements
    },
    background: {
      default: '#ffffff', // Clean white background
      paper: '#f1f1f1',   // Light grey for chat bubbles and cards
    },
    text: {
      primary: '#000000',
      secondary: '#5f6368',
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
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #b3c7dd 0%, #ffffff 80%)',
          boxShadow: 'none',
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
