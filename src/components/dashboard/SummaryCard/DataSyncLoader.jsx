import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { Storage as StorageIcon } from '@mui/icons-material';

const DataSyncLoader = ({ theme }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    flex: 1, gap: 1.5, py: 2, position: 'relative', zIndex: 1,
  }}>
    <Box sx={{
      position: 'relative', width: 48, height: 48,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Box sx={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `2.5px solid ${alpha(theme.primary, 0.1)}`,
        borderTopColor: theme.primary,
        animation: 'summaryCardSpin 1.2s linear infinite',
        '@keyframes summaryCardSpin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }} />
      <StorageIcon sx={{
        fontSize: 20, color: alpha(theme.primary, 0.5),
        animation: 'summaryCardPulse 2s ease-in-out infinite',
        '@keyframes summaryCardPulse': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(0.95)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
      }} />
    </Box>
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{
        fontSize: '0.75rem', fontWeight: 700, color: theme.primary,
        letterSpacing: '0.03em',
      }}>
        Syncing Data
      </Typography>
      <Typography sx={{
        fontSize: '0.65rem', fontWeight: 500, color: '#94A3B8', mt: 0.25,
      }}>
        Please wait a moment...
      </Typography>
    </Box>
  </Box>
);

export default DataSyncLoader;
