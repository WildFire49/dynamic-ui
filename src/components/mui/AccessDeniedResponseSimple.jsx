import React from "react";
import { Box, Typography, Card, CardContent, Alert, Chip } from "@mui/material";

/**
 * Simplified AccessDeniedResponse for better mobile compatibility
 * Uses native HTML links instead of MUI buttons to avoid iOS issues
 */
const AccessDeniedResponseSimple = ({ content }) => {
  console.log("🔍 AccessDeniedResponseSimple rendering with:", content);

  // Safe extraction
  const responseData = content?.response || content || {};
  const current_usage = responseData.current_usage || 0;
  const limit = responseData.limit || 0;
  const message = responseData.message || "Request limit exceeded";

  // Check if connection error
  const isConnectionError =
    typeof message === "string" &&
    (message.includes("Unable to connect") ||
      message.includes("CORS") ||
      message.includes("network"));

  return (
    <Card
      sx={{
        maxWidth: "100%",
        border: "2px solid #f57c00",
        backgroundColor: "#fff8e1",
        boxShadow: "0 4px 20px rgba(245, 124, 0, 0.15)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#ff9800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            ⚠️
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#e65100" }}>
            {isConnectionError ? "Connection Error" : "Demo Instance Limit Reached"}
          </Typography>
        </Box>

        {/* Message */}
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            backgroundColor: "#fff3e0",
            border: "1px solid #ffb74d",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {typeof message === "string" ? message : "Request limit exceeded"}
          </Typography>
          {!isConnectionError && (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Chip
                label={`${current_usage}/${limit} requests used`}
                size="small"
                sx={{
                  backgroundColor: "#ff9800",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            </Box>
          )}
        </Alert>

        {/* Help Text */}
        <Typography variant="body1" sx={{ color: "#424242", mb: 3, textAlign: "center" }}>
          {isConnectionError
            ? "Contact our team for technical assistance and to resolve this issue."
            : "Contact our team to upgrade your plan and continue using MiFiX.ai."}
        </Typography>

        {/* Contact Buttons - Using native links for better iOS compatibility */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Call Button */}
          <a
            href="tel:8511044804"
            style={{
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#4caf50",
                color: "white",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "#45a049",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              <span>📞</span>
              <span>Call Support</span>
            </Box>
          </a>

          {/* Email Button */}
          <a
            href="mailto:vaishakh.krishnan@newstreettech.com?subject=Demo%20Instance%20Request%20Limit%20Increase&body=Hi,%0D%0A%0D%0AI%20have%20exceeded%20my%20demo%20instance%20request%20limit%20and%20would%20like%20to%20discuss%20upgrading%20my%20plan.%0D%0A%0D%0ACurrent%20usage:%20${current_usage}/${limit}%20requests%20used%0D%0A%0D%0AThanks!"
            style={{
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            <Box
              sx={{
                border: "2px solid #ff9800",
                color: "#ff9800",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.2s",
                backgroundColor: "transparent",
                "&:hover": {
                  borderColor: "#f57c00",
                  backgroundColor: "rgba(255, 152, 0, 0.08)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              <span>✉️</span>
              <span>Email Support</span>
            </Box>
          </a>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccessDeniedResponseSimple;
