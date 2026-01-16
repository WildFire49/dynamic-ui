'use client';

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../auth/UserMenu';
import Sidebar from '../Sidebar';
import authService from '../../services/authService';

const AppLayout = ({ 
  children, 
  selectedTab, 
  onTabChange, 
  onLoadConversation, 
  mode = 'chat', 
  onSelectAnalysis 
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        selectedTab={selectedTab}
        onTabChange={(tabId) => {
          onTabChange(tabId);
          // Close mobile drawer when tab changes
          if (mobileOpen) {
            setMobileOpen(false);
          }
        }}
        onLoadConversation={onLoadConversation}
        mode={mode}
        onSelectAnalysis={onSelectAnalysis}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: { xs: 0, md:'0px' },
        width: { xs: '100%', md: 'calc(100% - 320px)' },
        maxWidth: '100%',
        overflowX: 'hidden',
        height: '100%'
      }}>
        {/* Top Navigation Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 4px 20px rgba(25, 118, 210, 0.08)",
            borderBottom: "1px solid rgba(25, 118, 210, 0.1)",
            backdropFilter: "blur(10px)",
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ 
            justifyContent: 'space-between',
            minHeight: { xs: 56, md: 64 },
            px: { xs: 2, md: 3 }
          }}>
            {/* Left side - Dashboard Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Hamburger Menu for Mobile */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  display: { md: 'none' },
                  color: '#0078d7'
                }}
              >
                <MenuIcon />
              </IconButton>
              {mode === 'dashboard' ? (
                <DashboardIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              ) : (
                <SmartToyIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              )}
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#1F2937',
                  lineHeight: 1,
                }}
              >
                {mode === 'dashboard' ? 'Dashboard' : 'AI Assistant'}
              </Typography>
            </Box>

            {/* Right Side - Unified Status & User Panel */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                flex: "0 0 auto",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,249,250,0.9))",
                borderRadius: 4,
                px: { xs: 1, sm: 2 },
                py: 1,
                border: "1px solid rgba(25, 118, 210, 0.08)",
                boxShadow: "0 4px 20px rgba(25, 118, 210, 0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Bot Status Section */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  pr: { xs: 1, md: 2 },
                  borderRight: {
                    xs: "none",
                    md: "1px solid rgba(25, 118, 210, 0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))",
                    border: "2px solid rgba(25, 118, 210, 0.2)",
                  }}
                >
                  <Image
                    src="/ai-chatbot.png"
                    alt="MiFiX AI"
                    width={32}
                    height={32}
                    style={{
                      borderRadius: "50%",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -1,
                      right: -1,
                      width: 10,
                      height: 10,
                      backgroundColor: "#4caf50",
                      borderRadius: "50%",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
                    }}
                  />
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#1976d2", lineHeight: 1.2 }}>
                    MiFiX.ai
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#4caf50", lineHeight: 1, fontWeight: 500 }}>
                    Online
                  </Typography>
                </Box>
              </Box>

              {/* User Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#1976d2",
                      lineHeight: 1.2,
                      textAlign: "right",
                    }}
                  >
                    {user?.roles?.find(
                      (role) =>
                        role.productCode ===
                        authService.getCurrentProductCode()
                    )?.roleName ||
                      user?.roles?.[0]?.roleName ||
                      "User"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.8,
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "#22C55E",
                        boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                        animation: "blink 2s infinite",
                        "@keyframes blink": {
                          "0%": {
                            opacity: 1,
                            boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                          },
                          "50%": {
                            opacity: 0.5,
                            boxShadow: "0 0 0 4px rgba(34, 197, 94, 0)",
                          },
                          "100%": {
                            opacity: 1,
                            boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                          },
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#6B7280",
                        lineHeight: 1,
                        fontWeight: 500,
                      }}
                    >
                      Logged In
                  </Typography>
                  </Box>
                </Box>
                <UserMenu />
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          background: theme.palette.background.default,
          // Hide scrollbar but keep scroll functionality
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          '&::-webkit-scrollbar': {
            display: 'none', // Chrome/Safari/Opera
          },
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
