'use client';

import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Chip,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const UserMenu = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout, isSuperAdmin, isRegularUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    handleClose();
    router.push('/change-password');
  };

  const handleLogout = async () => {
    handleClose();
    try {
      console.log("🚪 User initiated logout");
      await logout();
      console.log("✅ Logout completed, redirecting...");
      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still redirect even if logout fails
      router.push('/');
    }
  };

  if (!user) return null;

  // Get the primary role for display
  const primaryRole = user.roles?.find(role => role.productCode === 'MIFIX-AI') || user.roles?.[0];
  const isAdmin = isSuperAdmin();

  return (
    <Box>
      <Tooltip title="Account Menu" arrow placement="left">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            p: 0,
            borderRadius: '50%',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            '&:hover': {
              border: `2px solid ${theme.palette.primary.main}`,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              color: 'white',
            }}
          >
            <PersonIcon />
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          mt: 1.5,
          '& .MuiPaper-root': {
            borderRadius: 4,
            minWidth: 320,
            maxWidth: 380,
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.12)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header Section - Off White */}
        <Box
          sx={{
            background: '#FAFBFC',
            p: 3,
            color: theme.palette.text.primary,
            position: 'relative',
            borderBottom: '1px solid #E9ECEF',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                border: '3px solid #E9ECEF',
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  mb: 0.5,
                  color: '#212529',
                }}
              >
                {user.fullName || user.username || 'Welcome Back'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#6C757D',
                }}
              >
                {user.username || user.userId}
              </Typography>
            </Box>
          </Box>

          {/* Role Badge */}
          {primaryRole && (
            <Box sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
              <Chip
                icon={<BadgeIcon sx={{ color: 'inherit !important' }} />}
                label={primaryRole.roleName?.replace('Configurator', 'User') || 'User'}
                sx={{
                  backgroundColor: '#F1F3F5',
                  color: '#495057',
                  border: '1px solid #DEE2E6',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '& .MuiChip-icon': {
                    color: '#495057',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Menu Items Section */}
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={handleClose} 
            sx={{ 
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonIcon 
                fontSize="small" 
                sx={{ color: theme.palette.primary.main }}
              />
            </ListItemIcon>
            <ListItemText 
              primary="My Profile" 
              secondary="View and edit your profile"
              primaryTypographyProps={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
              }}
            />
            <ArrowIcon sx={{ color: theme.palette.text.secondary, ml: 1 }} />
          </MenuItem>
          <MenuItem 
            onClick={handleChangePassword} 
            sx={{ 
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LockIcon 
                fontSize="small" 
                sx={{ color: theme.palette.primary.main }}
              />
            </ListItemIcon>
            <ListItemText 
              primary="Change Password" 
              secondary="Change your password"
              primaryTypographyProps={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
              secondaryTypographyProps  ={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
              }}
            />
            <ArrowIcon sx={{ color: theme.palette.text.secondary, ml: 1 }} />
          </MenuItem>

          {/* <MenuItem 
            onClick={handleClose} 
            sx={{ 
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon 
                fontSize="small" 
                sx={{ color: theme.palette.primary.main }}
              />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              secondary="Manage your preferences"
              primaryTypographyProps={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
              }}
            />
            <ArrowIcon sx={{ color: theme.palette.text.secondary, ml: 1 }} />
          </MenuItem> */}

          <Divider sx={{ my: 1, mx: 3 }} />

          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon 
                fontSize="small" 
                sx={{ color: theme.palette.error.main }}
              />
            </ListItemIcon>
            <ListItemText 
              primary="Sign Out" 
              secondary="Logout from your account"
              primaryTypographyProps={{
                fontWeight: 600,
                color: theme.palette.error.main,
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
              }}
            />
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

export default UserMenu;
