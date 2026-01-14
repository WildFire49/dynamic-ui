import React from 'react';
import { Box, Card, CardContent, Typography, keyframes } from '@mui/material';
import { Sync as SyncIcon, AccessTime as TimeIcon } from '@mui/icons-material';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const DataSyncingCard = () => {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Card
        sx={{
          border: '1px solid rgba(25, 118, 210, 0.2)',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)',
          position: 'relative',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              <SyncIcon
                sx={{
                  fontSize: { xs: 28, sm: 32 },
                  color: '#ffffff',
                  animation: `${spin} 2s linear infinite`,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1565c0',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  mb: 0.5,
                }}
              >
                Data Sync in Progress
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#1e88e5',
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                We are currently syncing the latest data to ensure you have the most up-to-date insights.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <TimeIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1565c0',
                    fontWeight: 600,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                >
                  Please come back in 2 minutes
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
        {/* Animated Progress Line */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #2196f3, transparent)',
            backgroundSize: '200% 100%',
            animation: `${shimmer} 2s linear infinite`,
          }}
        />
      </Card>
    </Box>
  );
};

export default DataSyncingCard;
