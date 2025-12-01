"use client";

import React from "react";
import { Box, Paper, Typography, Container, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { keyframes } from "@emotion/react";
import MiFixLogoLight from "../../../public/assets/MiFixLogoLight";
import MifixBg from "../../../public/assets/MifixBg";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

// Animations
const slideInFromBottom = keyframes`
  0% {
    opacity: 0;
    transform: translateY(60px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const ChangePasswordPage = () => {
  const theme = useTheme();
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to home page after successful password change
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, rgba(185, 198, 228, 0.2) 0%, rgba(170, 185, 235, 0.3) 15%, rgba(155, 175, 242, 0.4) 30%, rgba(130, 165, 248, 0.5) 45%, rgba(105, 155, 250, 0.6) 60%, rgba(80, 148, 248, 0.7) 75%, rgba(60, 145, 245, 0.8) 85%, rgb(47, 143, 239) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Side - 3D Background with MiFiX Cubes */}
      <Box
        sx={{
          width: { xs: "0%", md: "50%" },
          display: { xs: "none", md: "flex" },
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* MiFiX Background Component */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MifixBg width="100%" height="100%" />
        </Box>
      </Box>

      {/* Right Side - Change Password Card */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
          position: { xs: "absolute", md: "relative" },
          top: { xs: 0, md: "auto" },
          left: { xs: 0, md: "auto" },
          right: { xs: 0, md: "auto" },
          bottom: { xs: 0, md: "auto" },
          background: {
            xs: "linear-gradient(135deg,rgb(216, 174, 176) 0%,rgb(19, 33, 114) 100%)",
            md: "transparent",
          },
          backdropFilter: { xs: "blur(10px)", md: "none" },
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 32px 64px rgba(0, 0, 0, 0.15)",
            animation: `${slideInFromBottom} 0.8s ease-out`,
            width: "100%",
            maxWidth: "450px",
          }}
        >
          {/* Logo and Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
              <MiFixLogoLight width={120} height={45} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "#333",
                mb: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Change Your Password
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.875rem",
              }}
            >
              Enter your current password and choose a new one
            </Typography>
          </Box>

          {/* Change Password Form */}
          <ChangePasswordForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            showCancelButton={true}
          />

          {/* Footer */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.75rem",
              }}
            >
              Powered By <strong>NEW STREET TECH</strong>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
