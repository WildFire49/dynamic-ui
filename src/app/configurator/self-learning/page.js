"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
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

const SelfLearningPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentConnection } = useRetrieverStore();
  const userId = "admin@company.com";

  const tabs = [
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
    <Box sx={{ width: "100%", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 4,
          px: 3,
        }}
      >
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Self-Learning Query System
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage templates, training data, and AI model versions
        </Typography>

        {currentConnection && (
          <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`Connected: ${currentConnection.database}`}
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${currentConnection.host}:${currentConnection.port}`}
              sx={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "white",
              }}
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
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: "1px solid #e2e8f0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: 15,
                fontWeight: 600,
                minHeight: 64,
                color: "#64748b",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.05)",
                },
                "&.Mui-selected": {
                  color: "#667eea",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
