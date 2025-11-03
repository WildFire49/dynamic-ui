"use client";

import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Paper, Typography, Alert, Chip } from "@mui/material";
import {
  Dashboard,
  Description,
  School,
  Storage,
  AccountTree,
  History,
} from "@mui/icons-material";
import { useRetrieverStore } from "@/store/retrieverStore";
import MetricsDashboard from "@/components/retriever/MetricsDashboard";
import TemplateManagement from "@/components/retriever/TemplateManagement";
import TrainingDataGenerator from "@/components/retriever/TrainingDataGenerator";
import LearnedExamples from "@/components/retriever/LearnedExamples";
import VersionManagement from "@/components/retriever/VersionManagement";
import AuditLog from "@/components/retriever/AuditLog";
import TemplateWorkflow from "@/components/retriever/TemplateWorkflow";

const SelfLearningPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentConnection } = useRetrieverStore();
  const userId = "admin@company.com";

  const tabs = [
    {
      label: "Workflow",
      icon: <AccountTree />,
      component: TemplateWorkflow,
    },
    {
      label: "Dashboard",
      icon: <Dashboard />,
      component: MetricsDashboard,
    },
    {
      label: "Templates",
      icon: <Description />,
      component: TemplateManagement,
    },
    {
      label: "Training",
      icon: <School />,
      component: TrainingDataGenerator,
    },
    {
      label: "Examples",
      icon: <Storage />,
      component: LearnedExamples,
    },
    {
      label: "Versions",
      icon: <AccountTree />,
      component: VersionManagement,
    },
    {
      label: "Audit Log",
      icon: <History />,
      component: AuditLog,
    },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 3,
          px: 3,
        }}
      >
        <Typography variant="h4" fontWeight="600" gutterBottom color="text.primary">
          Self-Learning Query System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage templates, training data, and AI model versions
        </Typography>

        {currentConnection && (
          <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`Connected: ${currentConnection.database}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${currentConnection.host}:${currentConnection.port}`}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* No Connection Warning */}
      {!currentConnection && (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            Please select a database connection from the Retriever page before
            using the self-learning system.
          </Alert>
        </Box>
      )}

      {/* Tabs */}
      {currentConnection && (
        <Paper
          sx={{
            borderRadius: 0,
            boxShadow: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: 15,
                fontWeight: 500,
                minHeight: 64,
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "action.hover",
                },
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 2,
                bgcolor: "primary.main",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          <Box>
            <ActiveComponent
              connectionId={currentConnection?.id}
              userId={userId}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SelfLearningPage;
