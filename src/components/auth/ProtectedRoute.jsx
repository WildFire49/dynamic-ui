'use client';

import React from 'react';
import { Box, CircularProgress, Typography, useTheme, alpha } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LoginScreen from './LoginScreen';
import { keyframes } from '@emotion/react';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const theme = useTheme();
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)',
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 15s ease infinite`,
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'white',
            animation: `${float} 3s ease-in-out infinite`,
          }} 
        />
      </Box>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Check role-based access if required role is specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: `linear-gradient(-45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 15s ease infinite`,
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            p: 4,
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Required role: {requiredRole}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Your roles: {user?.roles?.map(role => role.roleCode).join(', ') || 'None'}
          </Typography>
        </Box>
      </Box>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;
