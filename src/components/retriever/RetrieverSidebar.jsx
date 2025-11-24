import React from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Chip, Divider } from "@mui/material";
import {
  Storage as StorageIcon,
  Hub as GraphIcon,
  Psychology as AIIcon,
  CheckCircle as CheckIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AccountTree as WorkflowIcon,
  ArrowForward as ArrowIcon,
  School as TrainingIcon,
  History as HistoryIcon,
  Rocket as RocketIcon,
  Code as CodeIcon,
} from "@mui/icons-material";

const RetrieverSidebar = ({
  activeStep,
  onStepChange,
  connectionExists,
  kgExists,
}) => {
  const router = useRouter();
  const steps = [
    {
      id: 0,
      title: "Database Connection",
      description: "Connect to your database",
      icon: StorageIcon,
      color: "#0078d7",
      completed: connectionExists,
      disabled: false,
    },
    {
      id: 1,
      title: "Knowledge Base",
      description: "Build knowledge base",
      icon: GraphIcon,
      color: "#48bb78",
      completed: kgExists,
      disabled: !connectionExists,
    },
    {
      id: 2,
      title: "Data Retriever",
      description: "Ask questions in natural language",
      icon: AIIcon,
      color: "#9c27b0",
      completed: false,
      disabled: !kgExists,
    },
    {
      id: 3,
      title: "Template Workflow",
      description: "Commit & embed examples, create templates",
      icon: RocketIcon,
      color: "#667eea",
      completed: false,
      disabled: !kgExists,
    },
    {
      id: 4,
      title: "Regression Testing",
      description: "Test queries against training data",
      icon: TrainingIcon,
      color: "#f59e0b",
      completed: false,
      disabled: !kgExists,
    },
    {
      id: 5,
      title: "SQL Executor",
      description: "Execute raw SQL queries directly",
      icon: CodeIcon,
      color: "#00bcd4",
      completed: false,
      disabled: !connectionExists,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        pb: 2,
        "&::-webkit-scrollbar": {
          width: 0,
        },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.9rem" }}
        >
          Configuration Stages
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: "0.75rem" }}
        >
          Follow these steps to configure
        </Typography>
      </Box>

      {/* Vertical Tabs */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.7 }}>
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = activeStep === step.id;

          return (
            <Paper
              key={step.id}
              elevation={0}
              onClick={() => !step.disabled && onStepChange(step.id)}
              sx={{
                width: "100%",
                p: 1.5,
                border: isActive
                  ? `2px solid ${step.color}`
                  : "2px solid #e2e8f0",
                borderRadius: 2,
                cursor: step.disabled ? "not-allowed" : "pointer",
                backgroundColor: isActive ? `${step.color}08` : "#ffffff",
                transition: "all 0.2s ease",
                opacity: step.disabled ? 0.5 : 1,
                minHeight: 70,
                maxHeight: 70,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: step.disabled
                    ? "#ffffff"
                    : isActive
                    ? `${step.color}12`
                    : "#f8fafc",
                  borderColor: step.disabled ? "#e2e8f0" : step.color,
                  transform: step.disabled ? "none" : "translateY(-2px)",
                  boxShadow: step.disabled
                    ? "none"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: step.completed ? step.color : `${step.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mr: 1.5,
                }}
              >
                {step.completed ? (
                  <CheckIcon sx={{ color: "white", fontSize: 18 }} />
                ) : (
                  <IconComponent
                    sx={{
                      color: step.color,
                      fontSize: 18,
                    }}
                  />
                )}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.25,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: isActive ? step.color : "text.primary",
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {step.title}
                  </Typography>
                  {step.completed && (
                    <Chip
                      label="Done"
                      size="small"
                      sx={{
                        bgcolor: `${step.color}15`,
                        color: step.color,
                        fontWeight: 600,
                        height: 18,
                        fontSize: "0.65rem",
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    lineHeight: 1.3,
                    display: "block",
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Quick Links Section */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />
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
            Navigate to other pages
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Home Link */}
          <Paper
            elevation={2}
            onClick={() => router.push("/")}
            sx={{
              width: "100%",
              p: 1.5,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#0078d7",
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
                  bgcolor: "#0078d715",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HomeIcon sx={{ color: "#0078d7", fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  fontSize: "0.85rem",
                }}
              >
                Home
              </Typography>
            </Box>
            <ArrowIcon sx={{ fontSize: 16, color: "#64748b" }} />
          </Paper>

          {/* Dashboard Link */}
          <Paper
            elevation={0}
            onClick={() => router.push("/dashboard")}
            sx={{
              width: "100%",
              p: 1.5,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#48bb78",
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
                  bgcolor: "#48bb7815",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DashboardIcon sx={{ color: "#48bb78", fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  fontSize: "0.85rem",
                }}
              >
                Dashboard
              </Typography>
            </Box>
            <ArrowIcon sx={{ fontSize: 16, color: "#64748b" }} />
          </Paper>

          {/* Workflow Configurator Link */}
          <Paper
            elevation={0}
            onClick={() => router.push("/configurator/ui")}
            sx={{
              width: "100%",
              p: 1.5,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#9c27b0",
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
                  bgcolor: "#9c27b015",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WorkflowIcon sx={{ color: "#9c27b0", fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  fontSize: "0.85rem",
                }}
              >
                Workflow Configurator
              </Typography>
            </Box>
            <ArrowIcon sx={{ fontSize: 16, color: "#64748b" }} />
          </Paper>
        </Box>
      </Box>

      {/* Training & History Section */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.9rem" }}
          >
            Query Management
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            Manage and review queries
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Training Directory Link */}
          <Paper
            elevation={0}
            onClick={() => router.push("/configurator/retriever/training")}
            sx={{
              width: "100%",
              p: 1.5,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#ed8936",
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
                  bgcolor: "#ed893615",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrainingIcon sx={{ color: "#ed8936", fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  fontSize: "0.85rem",
                }}
              >
                Training Directory
              </Typography>
            </Box>
            <ArrowIcon sx={{ fontSize: 16, color: "#64748b" }} />
          </Paper>

          {/* Query History Link */}
          <Paper
            elevation={0}
            onClick={() => router.push("/configurator/retriever/history")}
            sx={{
              width: "100%",
              p: 1.5,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#3b82f6",
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
                  bgcolor: "#3b82f615",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HistoryIcon sx={{ color: "#3b82f6", fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  fontSize: "0.85rem",
                }}
              >
                Query History
              </Typography>
            </Box>
            <ArrowIcon sx={{ fontSize: 16, color: "#64748b" }} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default RetrieverSidebar;
