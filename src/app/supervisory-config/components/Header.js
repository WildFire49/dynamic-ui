
import React from 'react';
import { Box, Paper, Typography, Toolbar, Button, IconButton, Tooltip, Chip, alpha } from '@mui/material';
import { ArrowBack, LightMode, DarkMode, ViewSidebar, ViewSidebarOutlined, FiberManualRecord } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/auth/UserMenu';

const SupervisoryHeader = ({ mode, themeColors, onToggleSidebar, sidebarOpen, onToggleTheme }) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: mode === 'dark'
          ? alpha(themeColors.bgDeep, 0.85)
          : alpha(themeColors.bgDeep, 0.92),
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${themeColors.borderSubtle}`,
        position: 'relative',
        zIndex: 1100,
        width: '100%',
        // Subtle blue accent line at top
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          minHeight: { xs: '56px', sm: '64px' },
          px: { xs: 1.5, sm: 2, md: 3 },
          gap: 1,
        }}
      >
        {/* Left: Sidebar toggle + Back + Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
          {/* Sidebar toggle */}
          <Tooltip title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
            <IconButton
              onClick={onToggleSidebar}
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: themeColors.textDim,
                '&:hover': { color: themeColors.primary, bgcolor: alpha(themeColors.primary, 0.08) },
              }}
            >
              {sidebarOpen ? <ViewSidebar fontSize="small" /> : <ViewSidebarOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Button
            startIcon={<ArrowBack sx={{ fontSize: '18px !important' }} />}
            onClick={handleBackClick}
            sx={{
              color: themeColors.primary,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              borderRadius: '8px',
              px: { xs: 1, sm: 1.5 },
              minWidth: 'auto',
              '&:hover': {
                bgcolor: alpha(themeColors.primary, 0.08),
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Exit Studio</Box>
          </Button>

          {/* Divider dot */}
          <Box sx={{
            width: 4, height: 4, borderRadius: '50%',
            bgcolor: themeColors.accent,
            display: { xs: 'none', sm: 'block' },
            flexShrink: 0,
          }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              component="img"
              src="/supervisory.png"
              sx={{
                height: { xs: 26, sm: 30 },
                display: { xs: 'none', sm: 'block' },
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: themeColors.textBright,
                  lineHeight: 1.2,
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                Supervisory Config
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: themeColors.textDim,
                  display: 'block',
                  fontSize: '0.7rem',
                }}
              >
                Enterprise System Builder
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: Theme toggle + User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
          {/* Theme toggle */}
          <Tooltip title={mode === 'dark' ? "Light mode" : "Dark mode"}>
            <IconButton
              onClick={onToggleTheme}
              size="small"
              sx={{
                color: mode === 'dark' ? '#f7b733' : '#64748b',
                border: `1px solid ${alpha(mode === 'dark' ? '#f7b733' : '#94a3b8', 0.2)}`,
                width: 34,
                height: 34,
                '&:hover': {
                  bgcolor: mode === 'dark' ? alpha('#f7b733', 0.12) : alpha('#64748b', 0.08),
                },
              }}
            >
              {mode === 'dark' ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          {/* User pill */}
          {user && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1.5 },
                background: alpha(themeColors.primary, 0.06),
                padding: '4px 8px 4px 14px',
                borderRadius: '50px',
                border: `1px solid ${alpha(themeColors.primary, 0.15)}`,
              }}
            >
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'right',
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: themeColors.primary,
                    lineHeight: 1.2,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {user.username || 'Super Admin'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: themeColors.textDim,
                    lineHeight: 1,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 0.4,
                  }}
                >
                  <FiberManualRecord sx={{ fontSize: 6, color: themeColors.statusOnline }} />
                  Online
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

export default SupervisoryHeader;
