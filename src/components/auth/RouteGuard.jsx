'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { hasRouteAccess, ROLES } from '../../config/roleConfig';

/**
 * RouteGuard component to protect routes based on user roles
 * @param {Object} props
 * @param {string} props.routeId - The route identifier to check permissions for
 * @param {Array} props.allowedRoles - Array of role codes that can access this route
 * @param {ReactNode} props.children - The protected content to render if authorized
 * @param {string} props.redirectTo - Where to redirect if not authorized (default: '/')
 */
const RouteGuard = ({ 
  routeId, 
  allowedRoles = [], 
  children, 
  redirectTo = '/' 
}) => {
  const router = useRouter();
  const { user, isAuthenticated, getUserRoles, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // Wait for auth to finish loading
      if (loading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Get user's role codes
      const userRoleCodes = getUserRoles();
      
      // Check access using routeId if provided, otherwise use allowedRoles
      let hasPermission = false;
      if (routeId) {
        hasPermission = hasRouteAccess(routeId, userRoleCodes);
      } else if (allowedRoles.length > 0) {
        hasPermission = userRoleCodes.some(role => allowedRoles.includes(role));
      }

      setHasAccess(hasPermission);
      setIsChecking(false);

      // If no access, show unauthorized page (don't redirect immediately)
      if (!hasPermission) {
        // Could redirect after a delay, but showing 403 is better UX
        // setTimeout(() => router.push(redirectTo), 3000);
      }
    };

    checkAccess();
  }, [loading, isAuthenticated, user, routeId, allowedRoles, router, redirectTo, getUserRoles]);

  // Show loading spinner while checking
  if (loading || isChecking) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Show access denied page if user doesn't have permission
  if (!hasAccess) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)',
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
              Access Denied
            </Typography>

            <Typography variant="body1" sx={{ color: '#666', mb: 1, lineHeight: 1.6 }}>
              You don't have permission to access this page.
            </Typography>

            <Typography variant="body2" sx={{ color: '#999', mb: 4 }}>
              Contact your administrator if you believe this is an error.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => router.push(redirectTo)}
                sx={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976D2 0%, #1BA3D3 100%)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Go to Home
              </Button>

              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{
                  borderColor: '#2196F3',
                  color: '#2196F3',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#1976D2',
                    background: 'rgba(33, 150, 243, 0.04)',
                  },
                }}
              >
                Go Back
              </Button>
            </Box>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                  Debug Info:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '11px' }}>
                  Route: {routeId} | User Roles: {getUserRoles().join(', ')} | Required: {allowedRoles.join(', ')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Render protected content if user has access
  return <>{children}</>;
};

export default RouteGuard;
