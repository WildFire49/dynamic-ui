/**
 * API Version Toggle Component
 * Allows users to switch between Alpha and Beta API endpoints
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Switch,
  Chip,
} from '@mui/material';
import { getApiVersion, setApiVersion } from '../../lib/api/workflowService';

const ApiVersionToggle = () => {
  const [version, setVersion] = useState('alpha');

  useEffect(() => {
    const currentVersion = getApiVersion();
    setVersion(currentVersion);
  }, []);

  const handleToggle = (event) => {
    const newVersion = event.target.checked ? 'beta' : 'alpha';
    setApiVersion(newVersion);
    setVersion(newVersion);

    // Reload the page to apply new API configuration
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const isBeta = version === 'beta';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: isBeta ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 120, 215, 0.06)',
        border: '1px solid',
        borderColor: isBeta ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 120, 215, 0.15)',
        transition: 'all 0.2s ease',
      }}
    >
      <Chip
        label={isBeta ? 'BETA' : 'ALPHA'}
        size="small"
        sx={{
          bgcolor: isBeta ? '#f59e0b' : '#0078d7',
          color: '#fff',
          fontWeight: 700,
          fontSize: '10px',
          height: 20,
          '& .MuiChip-label': {
            px: 1,
          },
        }}
      />
      <Switch
        checked={isBeta}
        onChange={handleToggle}
        size="small"
        sx={{
          width: 42,
          height: 24,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: '2px',
            transitionDuration: '200ms',
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#f59e0b',
                opacity: 1,
                border: 0,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 20,
            height: 20,
          },
          '& .MuiSwitch-track': {
            borderRadius: 12,
            backgroundColor: '#0078d7',
            opacity: 1,
          },
        }}
      />
    </Box>
  );
};

export default ApiVersionToggle;
