
'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Toolbar,
  alpha,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/auth/UserMenu';
import Image from 'next/image';

/**
 * Reusable Page Header Component
 * Provides consistent header with logo, title, user info, and optional actions
 */
const PageHeader = ({
  title,
  subtitle,
  showBackButton = false,
  backPath = '/',
  leftContent = null,
  rightContent = null,
  showUserInfo = true,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  const handleBackClick = () => {
    router.push(backPath);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.08)',
        borderBottom: '1px solid rgba(25, 118, 210, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          minHeight: '72px',
          px: 3,
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Back Button + Logo (Extreme Left) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Back Button */}
            {showBackButton && (
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBackClick}
                sx={{
                  color: 'primary.main',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                Back
              </Button>
            )}

            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <img
                src="/mifix-logo.png"
                alt="MiFiX Studio"
                style={{
                  height: '28px',
                  width: 'auto',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '1.1rem',
                  whiteSpace: 'nowrap',
                }}
              >
                MiFiX Studio
              </Typography>
            </Box>
          </Box>

          {/* Custom Left Content (Separated with Gap) */}
          {leftContent}
        </Box>

        {/* Center Section - Title */}
        {title && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              px: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1.1rem',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Right Section - User Info & Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Custom Right Content */}
          {rightContent}

          {/* User Info & Menu */}
          {showUserInfo && user && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'right',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1976d2',
                    lineHeight: 1.2,
                  }}
                >
                  {user?.roles
                    ?.find((role) => role.productCode === 'MIFIX-AI')
                    ?.roleName?.replace('Configurator', 'User') || 'User'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#666',
                    lineHeight: 1,
                    fontWeight: 500,
                  }}
                >
                  Logged In
                </Typography>
              </Box>
              <UserMenu />
            </Box>
          )}
        </Box>
      </Toolbar>
    </Paper>
  );
};

export default PageHeader;
