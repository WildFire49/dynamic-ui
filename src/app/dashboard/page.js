"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// Pure CSS loading screen - NO MUI IMPORTS
const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        border: "4px solid rgba(0, 120, 215, 0.2)",
        borderTop: "4px solid #0078d7",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: 16,
      }}
    />
    <p
      style={{
        color: "#64748b",
        fontWeight: 500,
        fontSize: 16,
        margin: 0,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      Loading Dashboard...
    </p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Pure CSS skeleton loader
const DashboardSkeleton = () => (
  <div style={{ padding: 24, width: "100%", background: "#f8fafc", minHeight: "100vh" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ width: 200, height: 32, background: "#e2e8f0", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ width: 100, height: 36, background: "#e2e8f0", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
        <div style={{ width: 100, height: 36, background: "#e2e8f0", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 120, background: "#e2e8f0", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 24, marginTop: 24 }}>
      {[1, 2].map((i) => (
        <div key={i} style={{ height: 300, background: "#e2e8f0", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
    <style jsx>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

// Dynamically import ALL heavy components
const ProtectedRoute = dynamic(
  () => import("../../components/auth/ProtectedRoute"),
  { ssr: false }
);

const AppLayout = dynamic(
  () => import("../../components/layout/AppLayout"),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

const Dashboard = dynamic(
  () => import("../../components/Dashboard"),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

// Separate component that uses useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const dashboardId = searchParams.get("id");

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingScreen />}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
