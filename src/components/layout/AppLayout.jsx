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
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../auth/UserMenu';
import Sidebar from '../Sidebar';

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
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ 
            justifyContent: 'space-between',
            minHeight: { xs: 56, md: 64 },
            px: { xs: 2, md: 3 }
          }}>
            {/* Left side - App title/breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Hamburger Menu for Mobile */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  display: { md: 'none' },
                  color: theme.palette.primary.main
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

            {/* Right side - User menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* User role indicator */}
                  <Box sx={{ 
                    display: { xs: 'none', md: 'flex' }, 
                    flexDirection: 'column', 
                    alignItems: 'flex-end' 
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                      }}
                    >
                      {user.username}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                      }}
                    >
                      {user.roles?.find(role => role.productCode === 'MIFIX-AI')?.roleName || 'User'}
                    </Typography>
                  </Box>
                  
                  {/* User menu */}
                  <UserMenu />
                </Box>
              )}
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
