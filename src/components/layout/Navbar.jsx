import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Container,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  AccountTree,
  Psychology,
  Storage,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

const ConfiguratorNavbar = ({
  title = "Configurator",
  subtitle = "Build and configure",
  icon: IconComponent = AccountTree,
  showBackButton = true,
  backPath = "/configurator",
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(backPath);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        boxShadow: "0 4px 20px rgba(25, 118, 210, 0.08)",
        borderBottom: "1px solid rgba(25, 118, 210, 0.1)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            py: 1.5,
            minHeight: "72px",
            px: 0,
            gap: 0,
            ml: 0,
            mr: 0,
          }}
        >
          {/* Left Side - Back Button (No Padding) */}
          {showBackButton && (
            <Tooltip title="Back to Configurator">
              <IconButton
                onClick={handleBackClick}
                sx={{
                  color: "primary.main",
                  borderRadius: 0,
                  px: 2,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ArrowBack fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}

          {/* Logo and Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
            }}
          >
            <img
              src="/mifix-logo.png"
              alt="MiFiX Studio"
              style={{
                height: "28px",
                width: "auto",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "1.1rem",
                whiteSpace: "nowrap",
              }}
            >
              MiFiX Studio
            </Typography>
          </Box>

          {/* Center Title - Takes remaining space */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: 2,
            }}
          >
            {title && (
              <>
                <IconComponent sx={{ fontSize: 20, color: "primary.main" }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "1.1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </Typography>
              </>
            )}
          </Box>
        </Toolbar>
      </Box>
    </Paper>
  );
};

export default ConfiguratorNavbar;
