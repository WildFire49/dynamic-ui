"use client";
import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  keyframes,
  useTheme,
  alpha
} from '@mui/material';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export default function Loading() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.02)} 50%, 
          ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          animation: `${float} 3s ease-in-out infinite`,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
          animation: `${float} 4s ease-in-out infinite reverse`,
          zIndex: 0
        }}
      />

      {/* Main Loading Content */}
      <Box
        sx={{
          textAlign: 'center',
          zIndex: 1,
          animation: `${fadeIn} 0.8s ease-out`
        }}
      >
        {/* Loading Spinner */}
        <Box
          sx={{
            mb: 4,
            animation: `${pulse} 2s ease-in-out infinite`
          }}
        >
          <CircularProgress
            size={80}
            thickness={3}
            sx={{
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`
            }}
          />
        </Box>

        {/* Loading Text */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '1.8rem', sm: '2.5rem' }
          }}
        >
          Loading...
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.95rem', sm: '1.1rem' }
          }}
        >
          Please wait while we prepare your experience
        </Typography>
      </Box>
    </Box>
  );
}
