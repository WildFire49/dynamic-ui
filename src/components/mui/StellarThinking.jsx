"use client";
import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { 
  Autorenew, 
  CheckCircle,
  Psychology
} from "@mui/icons-material";

// Enterprise color palette - just 3 colors
const COLORS = {
  primary: "#2563EB",    // Blue - main accent
  success: "#059669",    // Green - completion
  neutral: "#6B7280",    // Gray - text/secondary
};

// Stage configuration with simplified enterprise colors
const STAGE_CONFIG = {
  connected: { progress: 10 },
  initializing: { progress: 20 },
  routing: { progress: 35 },
  starting: { progress: 45 },
  agent_executing: { progress: 55 },
  connecting: { progress: 65 },
  building_context: { progress: 75 },
  query_generated: { progress: 85 },
  executing: { progress: 92 },
  completed: { progress: 100 },
  processing: { progress: 50 }
};

/**
 * StellarThinking - Enterprise-grade loading indicator with real-time SSE progress
 * Uses only 3 colors: Blue (primary), Green (success), Gray (neutral)
 */
const StellarThinking = ({ stage, message }) => {
  const stageKey = stage && typeof stage === 'string' ? stage.toLowerCase() : 'processing';
  const config = STAGE_CONFIG[stageKey] || { progress: 50 };
  const isCompleted = stageKey === 'completed' || stageKey === 'query_generated';
  
  // Determine which icon to show
  const StageIcon = isCompleted ? CheckCircle : (stageKey === 'processing' ? Psychology : Autorenew);
  const iconColor = isCompleted ? COLORS.success : COLORS.primary;
  
  // SAFETY: Ensure message is always a string
  const safeMessage = typeof message === 'string' ? message : 
                      (message && typeof message === 'object' ? JSON.stringify(message) : 'Processing...');
  
  // Timestamp logging for debugging
  React.useEffect(() => {
    const now = new Date();
    const timestamp = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    console.log(`[StellarThinking ${timestamp}] stage="${stage}", message="${safeMessage}"`);
  }, [stage, safeMessage]);

  return (
    <Box 
      sx={{ 
        display: "flex", 
        gap: 1.5, 
        alignItems: "flex-start", 
        px: { xs: 1, sm: 2 },
        py: 1,
      }}
    >
      {/* AI Avatar */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          border: `2px solid ${COLORS.primary}20`,
        }}
      >
        <img 
          src="/ai-chatbot.png" 
          alt="AI" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </Box>

      {/* Thinking Bubble */}
      <Box sx={{ flex: 1, maxWidth: { xs: "calc(100% - 52px)", sm: "480px" } }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "#FAFBFC",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
          }}
        >
          {/* Header Row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
            {/* Icon */}
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: isCompleted ? `${COLORS.success}15` : `${COLORS.primary}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                animation: !isCompleted ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" }
                }
              }}
            >
              <StageIcon sx={{ fontSize: 14, color: iconColor }} />
            </Box>

            {/* Message */}
            <Typography 
              sx={{ 
                color: COLORS.neutral, 
                fontSize: "0.8125rem",
                fontWeight: 500,
                flex: 1,
              }}
            >
              {safeMessage}
            </Typography>

            {/* Loading dots */}
            {!isCompleted && (
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: COLORS.primary,
                      animation: "dotPulse 1.2s infinite ease-in-out",
                      animationDelay: `${i * 0.15}s`,
                      "@keyframes dotPulse": {
                        "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                        "40%": { opacity: 1, transform: "scale(1)" }
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={config.progress}
            sx={{
              height: 3,
              borderRadius: 1.5,
              backgroundColor: "#E5E7EB",
              '& .MuiLinearProgress-bar': {
                backgroundColor: isCompleted ? COLORS.success : COLORS.primary,
                borderRadius: 1.5,
                transition: "transform 0.15s ease-out",
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default StellarThinking;
