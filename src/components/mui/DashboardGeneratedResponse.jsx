"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Typography,
  alpha,
  Tooltip,
  IconButton,
  keyframes,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";

// Animations
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

/**
 * Professional dashboard creation response component
 * Large, animated, theme-consistent design
 */
const DashboardGeneratedResponse = ({ data }) => {
  const router = useRouter();
  
  const {
    dashboard_id,
    name,
    widgets_count = 0,
    successful_count = 0,
    success,
  } = data || {};

  const handleNavigate = () => {
    router.push(`/dashboard?id=${dashboard_id}`);
  };

  // Widget type icons for visual variety
  const widgetIcons = [BarChartIcon, ShowChartIcon, PieChartIcon, TableChartIcon];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha("#3B82F6", 0.15),
        bgcolor: "#fff",
        overflow: "hidden",
        width: "100%",
        maxWidth: 550, // Wider card
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)",
        animation: `${slideIn} 0.5s ease-out forwards`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.15)",
          transform: "translateY(-2px)",
          borderColor: alpha("#3B82F6", 0.3),
        },
      }}
    >
      <Box sx={{ p: 3.5 }}>
        {/* Main Content Area */}
        <Box sx={{ display: "flex", gap: 2.5, mb: 3 }}>
          {/* Icon Box */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
              border: "1px solid #BFDBFE",
              color: "#2563EB",
              flexShrink: 0,
            }}
          >
            <DashboardIcon sx={{ fontSize: 32 }} />
          </Box>

          {/* Text Content */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 20, color: "#10B981" }} />
              <Typography
                variant="subtitle2"
                sx={{ 
                  color: "#10B981", 
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.75rem"
                }}
              >
                SUCCESSFULLY CREATED
              </Typography>
            </Box>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1F2937",
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {name || "New Dashboard"}
            </Typography>
            
            <Typography variant="body1" sx={{ color: "#6B7280", lineHeight: 1.5 }}>
              Your custom dashboard with <strong>{successful_count} widgets</strong> is ready.
            </Typography>
          </Box>
        </Box>

        

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleNavigate}
          endIcon={<ArrowForwardIcon />}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
            animation: `${pulse} 2s infinite`,
            "&:hover": {
              background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Click here to view Dashboard
        </Button>
      </Box>
    </Card>
  );
};

export default DashboardGeneratedResponse;
