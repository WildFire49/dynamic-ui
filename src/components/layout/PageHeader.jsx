
'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Toolbar,
  alpha,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/auth/UserMenu';

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
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        borderBottom: `1px solid ${alpha('#000', 0.08)}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          minHeight: '64px',
          px: 3,
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showBackButton && (
            <IconButton
              onClick={handleBackClick}
              size="small"
              sx={{
                color: '#64748b',
                width: 34,
                height: 34,
                borderRadius: 2,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          )}

          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img
              src="/mifix-logo.png"
              alt="MiFiX Studio"
              style={{
                height: '30px',
                width: 'auto',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '1.1rem',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
              }}
            >
              MiFiX Studio
            </Typography>
          </Box>

          {/* Separator */}
          {leftContent && (
            <Box sx={{
              width: '1px',
              height: 28,
              bgcolor: alpha('#000', 0.1),
              mx: 0.5,
            }} />
          )}

          {/* Custom Left Content */}
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
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {rightContent}

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
                    fontSize: '13px',
                    color: '#334155',
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
                    color: '#94a3b8',
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
