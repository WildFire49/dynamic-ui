
"use client";

import React, { useState, useMemo } from "react";
import { Box, CssBaseline, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import { LightMode, DarkMode, Menu as MenuIcon } from "@mui/icons-material";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import SupervisoryHeader from "./components/Header";
import { THEME_DARK, THEME_LIGHT } from './config/theme';

export default function SupervisoryConfigPage() {
  const [mode, setMode] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: "#0078d7",
        light: "#2f8fef",
        dark: "#005a9e",
      },
      secondary: {
        main: "#e8364e",
        light: "#ff6b6b",
        dark: "#c62828",
      },
      background: {
        default: mode === 'dark' ? "#0b1120" : "#f7f8fc",
        paper: mode === 'dark' ? "#151d2e" : "#ffffff",
      },
      text: {
        primary: mode === 'dark' ? "#e2e8f0" : "#1e293b",
        secondary: mode === 'dark' ? "#94a3b8" : "#64748b",
      }
    },
    typography: {
      fontFamily: "'Inter', 'Outfit', 'Roboto', sans-serif",
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? "#94a3b8" : "#64748b",
          }
        }
      }
    }
  }), [mode]);

  const themeColors = mode === 'dark' ? THEME_DARK : THEME_LIGHT;

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // On mobile, sidebar should be hidden by default
  const effectiveSidebarOpen = isMobile ? false : sidebarOpen;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",                                          // mobile: full width chat
          md: effectiveSidebarOpen ? "280px 1fr" : "1fr",     // tablet+: sidebar + chat
          lg: effectiveSidebarOpen ? "300px 1fr" : "1fr",     // desktop: wider sidebar
        },
        gridTemplateRows: "1fr",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "background.default",
        transition: "grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>

        {/* Sidebar - hidden on mobile, collapsible on tablet+ */}
        {effectiveSidebarOpen && (
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}>
            <Sidebar mode={mode} onClose={() => setSidebarOpen(false)} />
          </Box>
        )}

        {/* Main Area */}
        <Box sx={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          height: "100vh",
          overflow: "hidden",
          position: 'relative',
        }}>
          <SupervisoryHeader
            mode={mode}
            themeColors={themeColors}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            sidebarOpen={effectiveSidebarOpen}
            onToggleTheme={toggleTheme}
          />
          <ChatInterface mode={mode} />
        </Box>

      </Box>
    </ThemeProvider>
  );
}
