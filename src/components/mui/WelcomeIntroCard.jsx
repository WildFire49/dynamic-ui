"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import {
  TrendingUp as TrendingIcon,
  Dashboard as DashboardIcon,
  TableChart as TableIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";
import { keyframes } from "@emotion/react";

// Subtle animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const promptIcons = [TrendingIcon, DashboardIcon, TableIcon, InsightsIcon];

const WelcomeIntroCard = ({ content, onPromptClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        animation: `${fadeIn} 0.4s ease-out`,
      }}
    >
      {/* Header - No avatar here, just text */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "#1a202c",
          mb: 0.5,
        }}
      >
        Hey there!
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: "#64748b", 
          mb: 2.5, 
          lineHeight: 1.5,
        }}
      >
        I can help you analyze disbursements, collections, create dashboards, and explore your data.
      </Typography>

      {/* Prompts section */}
      <Typography 
        variant="caption" 
        sx={{ 
          fontWeight: 600, 
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          mb: 1.5,
          display: "block",
          fontSize: "0.7rem",
        }}
      >
        Try asking
      </Typography>
      
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {content.prompts?.map((prompt, index) => {
          const IconComponent = promptIcons[index % promptIcons.length];
          return (
            <Box
              key={index}
              onClick={() => onPromptClick && onPromptClick(prompt)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  transform: "translateX(4px)",
                },
                "&:active": {
                  transform: "translateX(4px) scale(0.99)",
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconComponent sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#334155",
                  fontWeight: 450,
                  lineHeight: 1.4,
                  flex: 1,
                  fontSize: "0.8125rem",
                }}
              >
                {prompt}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default WelcomeIntroCard;
