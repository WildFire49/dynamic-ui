"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, keyframes } from '@mui/material';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ShimmeringText = ({ phrases = [
  "I am thinking",
  "I am gathering answers",
  "Analyzing your request",
  "Processing information",
  "Finding you the best response"
] }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2500); // Change phrase every 2.5 seconds

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography
        key={currentPhrase}
        sx={{
          background: 'linear-gradient(90deg, #6c757d 0%, #495057 25%, #6c757d 50%, #495057 75%, #6c757d 100%)',
          backgroundSize: '1000px 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: `${shimmer} 2s linear infinite, ${fadeIn} 0.5s ease-out`,
          fontSize: '0.95rem',
          fontWeight: 500,
          letterSpacing: '0.3px',
        }}
      >
        {phrases[currentPhrase]}
      </Typography>
      {/* <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.3,
          ml: 0.5,
        }}
      >
        {[0, 1, 2].map((dot, index) => (
          <Box
            key={dot}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#6c757d',
              animation: `${keyframes`
                0%, 60%, 100% { 
                  transform: scale(1);
                  opacity: 0.5;
                }
                30% { 
                  transform: scale(1.3);
                  opacity: 1;
                }
              `} 1.4s ease-in-out ${index * 0.2}s infinite`,
            }}
          />
        ))}
      </Box> */}
    </Box>
  );
};

export default ShimmeringText;
