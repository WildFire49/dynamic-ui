"use client";

import React, { useState } from "react";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import AppLayout from "../../components/layout/AppLayout";
import Leads from "../../components/Leads";

export default function LeadsPage() {
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
      <Leads />
    </ProtectedRoute>
  );
}
