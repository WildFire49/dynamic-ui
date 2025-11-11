"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import LeadsSidebar from "../../components/leads/LeadsSidebar";
import Leads from "../../components/Leads";
import UserMenu from "../../components/auth/UserMenu";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 280;

export default function LeadsPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTab, setSelectedTab] = useState("leads");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    // Close mobile drawer when tab changes
    if (mobileOpen) {
      setMobileOpen(false);
    }
    // Handle navigation for different menu items
    if (tabId === "reports") {
      console.log("Navigate to Reports");
      // Add navigation logic here
    } else if (tabId === "product-configurator") {
      console.log("Navigate to Product Configurator");
      // Add navigation logic here
    } else if (tabId === "cre-configurator") {
      console.log("Navigate to CRE Configurator");
      // Add navigation logic here
    }
  };

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            <LeadsSidebar
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              selectedFilter={selectedFilter}
            />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            <LeadsSidebar
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              selectedFilter={selectedFilter}
            />
          </Drawer>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: { xs: 0, md: "0px" },
            width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
            maxWidth: "100%",
            overflowX: "hidden",
            height: "100%",
          }}
        >
          {/* Top Navigation Bar */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              color: theme.palette.text.primary,
            }}
          >
            <Toolbar
              sx={{
                justifyContent: "space-between",
                minHeight: { xs: 56, md: 64 },
                px: { xs: 2, md: 3 },
              }}
            >
              {/* Left side - App title/breadcrumb */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Hamburger Menu for Mobile */}
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    display: { md: "none" },
                    color: theme.palette.primary.main,
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>

              {/* Right side - User menu */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {user && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* User role indicator */}
                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          lineHeight: 1.2,
                        }}
                      >
                        {user.username}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        {user.roles?.find(
                          (role) => role.productCode === "MIFIX-AI"
                        )?.roleName || "User"}
                      </Typography>
                    </Box>

                    {/* User menu */}
                    <UserMenu />
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <Leads 
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
            />
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
