"use client";

import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import LeadsSidebar from "@/components/leads/LeadsSidebar";
import RuleConfiguration from "@/components/cre/RuleConfiguration";

export default function EditRulePage() {
  const theme = useTheme();
  const { user } = useAuth();
  const params = useParams();
  const ruleId = params.id;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTab, setSelectedTab] = useState("cre-configurator");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Box
          component="nav"
          sx={{
            width: { md: 280 },
            flexShrink: { md: 0 },
          }}
        >
          <LeadsSidebar
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
            mobileOpen={mobileOpen}
            onDrawerToggle={handleDrawerToggle}
          />
        </Box>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <LeadsSidebar
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
          />
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <RuleConfiguration ruleId={ruleId} />
      </Box>
    </Box>
  );
}
