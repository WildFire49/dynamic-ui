"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import AppLayout from "../../components/layout/AppLayout";
import Dashboard from "../../components/Dashboard";

export default function DashboardPage() {
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
    <ProtectedRoute>
      <AppLayout
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        onLoadConversation={loadConversationHistory}
        mode="dashboard"
        onSelectAnalysis={handleSelectAnalysis}
      >
        <Dashboard initialDashboardId={dashboardId} />
      </AppLayout>
    </ProtectedRoute>
  );
}
