"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Leaderboard as LeadsIcon,
  Assessment as ReportsIcon,
  Inventory as ProductConfigIcon,
  Business as CREConfigIcon,
  ArrowForward as ArrowIcon,
  Dashboard as DashboardIcon,
  AccountBalance as BankIcon,
} from "@mui/icons-material";
import Image from "next/image";
import MiFixLogoLight from "../../../public/assets/MiFixLogoLight";

const LeadsSidebar = ({ selectedTab, onTabChange, selectedFilter = "all" }) => {
  const router = useRouter();

  // Debug: Log filter changes
  React.useEffect(() => {
    console.log("LeadsSidebar - selectedFilter:", selectedFilter);
    console.log("LeadsSidebar - heading will be:", getHeading());
  }, [selectedFilter]);

  // Dynamic heading based on selected filter
  const getHeading = () => {
    console.log("getHeading called with selectedFilter:", selectedFilter);
    if (selectedFilter === "leads_only") {
      return "Anchor Corporate";
    }
    return "Bank Operation";
  };

  const quickLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: DashboardIcon,
      color: "#2196f3",
      onClick: () => onTabChange("dashboard"),
    },
    {
      id: "leads",
      label: "Leads",
      icon: LeadsIcon,
      color: "#2196f3",
      onClick: () => onTabChange("leads"),
    },
    {
      id: "reports",
      label: "Reports",
      icon: ReportsIcon,
      color: "#9c27b0",
      onClick: () => onTabChange("reports"),
    },
  ];

  const configuratorLinks = [
    {
      id: "product-configurator",
      label: "Product Configurator",
      icon: ProductConfigIcon,
      color: "#ff9800",
      onClick: () => {
        onTabChange("product-configurator");
        router.push("/product-configurator");
      },
    },
    {
      id: "cre-configurator",
      label: "CRE Configurator",
      icon: CREConfigIcon,
      color: "#4caf50",
      onClick: () => {
        onTabChange("cre-configurator");
        router.push("/configurator/cre");
      },
    },
  ];

  const bankOperationLinks = [
    {
      id: "bank-operations",
      label: "A/C Memo Limit",
      icon: BankIcon,
      color: "#4caf50",
      onClick: () => onTabChange("bank-operations"),
    },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        pb: 2,
        overflow: "auto",
        backgroundColor: "#fafbfc",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: "center", position: "relative" }}>
        <Box
          sx={{
            animation: "fadeInScale 0.5s ease-out",
            "@keyframes fadeInScale": {
              "0%": {
                opacity: 0,
                transform: "scale(0.8)",
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          <Box
            sx={{
              width: 86,
              height: 86,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, rgba(47, 143, 239, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)",
              border: "1px solid rgba(47, 143, 239, 0.1)",
              boxShadow: "0 4px 16px rgba(47, 143, 239, 0.1)",
            }}
          >
            <MiFixLogoLight width={60} height={22} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: "center",
              marginBottom: 0.5,
              color: "#1a1a1a",
            }}
          >
            {getHeading()}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
              fontSize: "0.75rem",
            }}
          >
            Farmer Lead Generation & Management
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Quick Links Section */}
      <Box sx={{ mt: 4, px: 3 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.9rem" }}
          >
            Quick Links
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            Navigate to different sections
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            const isSelected = selectedTab === link.id;

            return (
              <Paper
                key={link.id}
                elevation={isSelected ? 2 : 0}
                onClick={link.onClick}
                sx={{
                  width: "100%",
                  p: 1.5,
                  border: `1px solid ${isSelected ? link.color : "#e2e8f0"}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  backgroundColor: isSelected ? `${link.color}08` : "#ffffff",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                  "@keyframes slideInLeft": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-20px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: isSelected ? `${link.color}15` : "#f8fafc",
                    borderColor: link.color,
                    transform: "translateX(2px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: `${link.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ color: link.color, fontSize: 16 }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: "text.primary",
                      fontSize: "0.85rem",
                    }}
                  >
                    {link.label}
                  </Typography>
                </Box>
                <ArrowIcon
                  sx={{
                    fontSize: 16,
                    color: isSelected ? link.color : "#64748b",
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Divider sx={{ mt: 4 }} />

      {/* Configurator Section */}
      <Box sx={{ mt: 4, px: 3 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.9rem" }}
          >
            Configurator
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            Configure products and CRE
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {configuratorLinks.map((link, index) => {
            const Icon = link.icon;
            const isSelected = selectedTab === link.id;

            return (
              <Paper
                key={link.id}
                elevation={isSelected ? 2 : 0}
                onClick={link.onClick}
                sx={{
                  width: "100%",
                  p: 1.5,
                  border: `1px solid ${isSelected ? link.color : "#e2e8f0"}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  backgroundColor: isSelected ? `${link.color}08` : "#ffffff",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                  "@keyframes slideInLeft": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-20px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: isSelected ? `${link.color}15` : "#f8fafc",
                    borderColor: link.color,
                    transform: "translateX(2px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: `${link.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ color: link.color, fontSize: 16 }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: "text.primary",
                      fontSize: "0.85rem",
                    }}
                  >
                    {link.label}
                  </Typography>
                </Box>
                <ArrowIcon
                  sx={{
                    fontSize: 16,
                    color: isSelected ? link.color : "#64748b",
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Divider sx={{ mt: 4 }} />
      <Box sx={{ mt: 4, px: 3 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.9rem" }}
          >
            Bank Operations
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            Configure Bank Memo Limits
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {bankOperationLinks.map((link, index) => {
            const Icon = link.icon;
            const isSelected = selectedTab === link.id;

            return (
              <Paper
                key={link.id}
                elevation={isSelected ? 2 : 0}
                onClick={link.onClick}
                sx={{
                  width: "100%",
                  p: 1.5,
                  border: `1px solid ${isSelected ? link.color : "#e2e8f0"}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  backgroundColor: isSelected ? `${link.color}08` : "#ffffff",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                  "@keyframes slideInLeft": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-20px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: isSelected ? `${link.color}15` : "#f8fafc",
                    borderColor: link.color,
                    transform: "translateX(2px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: `${link.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ color: link.color, fontSize: 16 }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: "text.primary",
                      fontSize: "0.85rem",
                    }}
                  >
                    {link.label}
                  </Typography>
                </Box>
                <ArrowIcon
                  sx={{
                    fontSize: 16,
                    color: isSelected ? link.color : "#64748b",
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      </Box>
       <Divider sx={{ mt: 4 }} />
     
    </Box>
  );
};

export default LeadsSidebar;
