'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  alpha,
  Grid,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { keyframes } from '@emotion/react';
import MiFixLogoLight from '../../../public/assets/MiFixLogoLight';
import MifixBg from '../../../public/assets/MifixBg';

// Stunning animations
const slideInFromBottom = keyframes`
  0% {
    opacity: 0;
    transform: translateY(60px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const LoginScreen = () => {
  const theme = useTheme();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData.username.trim(), formData.password);
      
      if (!result.success) {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
      // Success is handled by the auth context redirecting to the main app
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)',
          position: 'relative',
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)',
        position: 'relative', 
        overflow: 'hidden',
      }}
    >
      {/* Left Side - 3D Background with MiFiX Cubes */}
      <Box
        sx={{
          width: { xs: '0%', md: '50%' },
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle background to ensure visibility
        }}
      >
        {/* MiFiX Background Component */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MifixBg width="100%" height="100%" />
        </Box>
      </Box>

      {/* Right Side - Login Card */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 4 },
          position: { xs: 'absolute', md: 'relative' },
          top: { xs: 0, md: 'auto' },
          left: { xs: 0, md: 'auto' },
          right: { xs: 0, md: 'auto' },
          bottom: { xs: 0, md: 'auto' },
          background: { xs: 'linear-gradient(135deg,rgb(216, 174, 176) 0%,rgb(19, 33, 114) 100%)', md: 'transparent' },
          backdropFilter: { xs: 'blur(10px)', md: 'none' },
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15)',
            animation: `${slideInFromBottom} 0.8s ease-out`,
            width: '100%',
            maxWidth: '400px',
          }}
        >
          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <MiFixLogoLight width={120} height={45} />
            </Box>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#333',
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              Sign In to your Account
            </Typography>
          </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              {error && (
                <Fade in timeout={300}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: 24,
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* User ID Field */}
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                User ID*
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="Enter User ID"
                value={formData.username}
                onChange={handleChange('username')}
                disabled={isSubmitting}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#f8f9fa',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ccc',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#E4222D',
                      borderWidth: 2,
                    },
                  },
                }}
              />

              {/* Password Field */}
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                Password*
              </Typography>
              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange('password')}
                disabled={isSubmitting}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#f8f9fa',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ccc',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00468e',
                      borderWidth: 2,
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={isSubmitting}
                        sx={{
                          color: '#666',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || !formData.username.trim() || !formData.password.trim()}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  background: '#00468e',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(20, 25, 167, 0.3)',
                  '&:hover': {
                    background: '#00468e',
                    boxShadow: '0 12px 32px rgba(35, 91, 212, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: alpha(theme.palette.action.disabled, 0.1),
                    color: theme.palette.action.disabled,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                  ) : (
                    <LoginIcon />
                  )
                }
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: '0.75rem',
              }}
            >
              Powered By <strong>NEW STREET TECH</strong>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginScreen;
