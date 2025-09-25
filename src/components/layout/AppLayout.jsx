'use client';

import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
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

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        selectedTab={selectedTab}
        onTabChange={onTabChange}
        onLoadConversation={onLoadConversation}
        mode={mode}
        onSelectAnalysis={onSelectAnalysis}
      />

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: { xs: 0, md: '320px' },
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {mode === 'dashboard' ? 'Analytics Dashboard' : 'AI Assistant'}
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
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
