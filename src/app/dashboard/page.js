"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import AppLayout from "../../components/layout/AppLayout";
import Dashboard from "../../components/Dashboard";
import { CircularProgress, Box } from "@mui/material";

// Separate component that uses useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const dashboardId = searchParams.get("id"); // Get dashboard ID from URL

  const [selectedTab, setSelectedTab] = useState("dashboard");

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
  };

  const loadConversationHistory = (conversationHistory) => {
    console.log("Loading conversation:", conversationHistory);
  };

  const handleSelectAnalysis = (timestamp) => {
    console.log("Selected analysis:", timestamp);
  };

  return (
    <AppLayout
      selectedTab={selectedTab}
      onTabChange={handleTabChange}
      onLoadConversation={loadConversationHistory}
      mode="dashboard"
      onSelectAnalysis={handleSelectAnalysis}
    >
      <Dashboard
        key={dashboardId || "default"}
        initialDashboardId={dashboardId}
      />
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
