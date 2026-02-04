import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Avatar,
  keyframes,
  alpha,
} from "@mui/material";
import { LockClock, AutoAwesome, Bolt } from "@mui/icons-material";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const CreditLimitCard = ({ message, metadata }) => {
  // Extract usage numbers if available (e.g., "50/10")
  const usageMatch = message.match(/(\d+)\/(\d+)/);
  const used = usageMatch ? parseInt(usageMatch[1]) : 50;
  const limit = usageMatch ? parseInt(usageMatch[2]) : 10;
  const percentage = Math.min((used / limit) * 100, 100);

  return (
    <Box sx={{ width: "100%", maxWidth: 440, mx: "auto", my: 1 }}>
      <Card
        elevation={0}
        sx={{
          background: "#fff",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1.5,
            }}
          >
            {/* Animated Icon */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#FEF2F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 0.5,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "1px dashed #FECACA",
                  animation: "spin 12s linear infinite",
                }}
              />
              <LockClock
                sx={{
                  fontSize: 32,
                  color: "#EF4444",
                  animation: `${pulse} 2s infinite`,
                }}
              />
            </Box>

            <Typography
              variant="h6"
              sx={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}
            >
              Daily Limit Reached
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "#64748b", mb: 2, lineHeight: 1.5 }}
            >
              You've hit your daily interaction cap. Please recharge to continue.
            </Typography>

            {/* Usage Meter */}
            <Box sx={{ width: "100%", mb: 2.5, position: "relative" }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  USAGE
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#EF4444", fontWeight: 700 }}
                >
                  {used} / {limit}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: 6,
                  width: "100%",
                  borderRadius: 3,
                  bgcolor: "#f1f5f9",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${percentage}%`,
                    background: "linear-gradient(90deg, #F87171, #EF4444)",
                    borderRadius: 3,
                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </Box>
            </Box>

            {/* Info Message Box */}
            <Box
              sx={{
                background: "#FEF2F2",
                border: "1px solid #FEE2E2",
                borderRadius: 2.5,
                p: 1.5,
                width: "100%",
                mt: "auto",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#DC2626", fontSize: "0.8rem", fontWeight: 500 }}
              >
                Limit resets in <strong>24 hours</strong>. Contact admin to
                upgrade.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreditLimitCard;
