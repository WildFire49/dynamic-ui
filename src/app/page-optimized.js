"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, Suspense } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Loading component for initial render
const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    }}
  >
    <Box
      component="img"
      src="/mifix-logo.png"
      alt="MiFiX AI"
      sx={{
        width: 120,
        height: "auto",
        mb: 3,
        filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))",
      }}
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
    <CircularProgress
      size={40}
      thickness={4}
      sx={{
        color: "#3b82f6",
        mb: 2,
      }}
    />
    <Typography
      variant="body1"
      sx={{
        color: "#94a3b8",
        fontWeight: 500,
        letterSpacing: "0.05em",
      }}
    >
      Loading MiFiX AI...
    </Typography>
  </Box>
);

// Dynamically import the heavy chat component
const ChatPage = dynamic(
  () => import("../components/chat/ChatPage"),
  {
    loading: () => <LoadingScreen />,
    ssr: false,
  }
);

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingScreen />}>
        <ChatPage />
      </Suspense>
    </ProtectedRoute>
  );
}
