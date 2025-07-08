import React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
`;

const TypingIndicator = () => {
  const Dot = ({ delay }) => (
    <Box
      sx={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: 'primary.main',
        animation: `${bounce} 1.4s infinite ease-in-out both`,
        animationDelay: delay,
      }}
    />
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', p: '18px' }}>
      <Dot delay="-0.32s" />
      <Dot delay="-0.16s" />
      <Dot delay="0s" />
    </Box>
  );
};

export default TypingIndicator;
