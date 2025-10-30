"use client";

import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { keyframes } from "@emotion/react";

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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const NavigationLoader = ({ message = "Loading..." }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Main Loading Content */}
      <Box
        sx={{
          textAlign: "center",
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        {/* Loading Spinner */}
        <Box
          sx={{
            mb: 3,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <CircularProgress
            size={60}
            thickness={3.5}
            sx={{
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 4px 8px ${alpha(
                theme.palette.primary.main,
                0.3
              )})`,
            }}
          />
        </Box>

        {/* Loading Text */}
        {message && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            {message}
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
          }}
        >
          Please wait...
        </Typography>
      </Box>
    </Box>
  );
};

export default NavigationLoader;
