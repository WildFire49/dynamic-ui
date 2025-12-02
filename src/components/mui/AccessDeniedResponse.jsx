import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import {
  Block as BlockIcon,
  ContactSupport as ContactIcon,
  Warning as WarningIcon,
  Call as CallIcon,
} from "@mui/icons-material";

const AccessDeniedResponse = ({ content }) => {
  try {
    console.log("🔍 AccessDeniedResponse rendering with content:", content);

    // Safe extraction with fallbacks
    const responseData = content?.response || content || {};
    const current_usage = responseData.current_usage || 0;
    const limit = responseData.limit || 0;
    const remaining = responseData.remaining || 0;
    const message = responseData.message || "Request limit exceeded";

    console.log("📊 Extracted data:", {
      current_usage,
      limit,
      remaining,
      message,
    });

    // Check if this is a connection/CORS error (with safe string check)
    const isConnectionError =
      typeof message === "string" &&
      (message.includes("Unable to connect") ||
        message.includes("CORS") ||
        message.includes("network"));

    const handleContactSupport = () => {
      const email = "vaishakh.krishnan@newstreettech.com";
      const subject = "Demo Instance Request Limit Increase";
      const body = `Hi,

I have exceeded my demo instance request limit and would like to discuss upgrading my plan.

Current usage: ${current_usage}/${limit} requests used

Thanks!`;

      // Create mailto link with proper encoding
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      console.log("Opening email client with:", mailtoLink); // Debug log

      // Try multiple approaches to ensure it works
      try {
        // Method 1: Direct window location
        window.location.href = mailtoLink;

        // Method 2: Fallback with window.open (in case the first doesn't work)
        setTimeout(() => {
          window.open(mailtoLink, "_self");
        }, 100);
      } catch (error) {
        console.error("Error opening email client:", error);
        // Fallback: copy email info to clipboard
        navigator.clipboard.writeText(
          `Email: ${email}\nSubject: ${subject}\n\n${body}`
        );
        alert(
          "Email client could not be opened. Email details have been copied to clipboard."
        );
      }
    };

    return (
      <Card
        sx={{
          maxWidth: "100%",
          border: "2px solid #f57c00",
          backgroundColor: "#fff8e1",
          boxShadow: "0 4px 20px rgba(245, 124, 0, 0.15)",
          position: "relative",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header with icon */}
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
              }}
            >
              <WarningIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#e65100",
                }}
              >
                {isConnectionError
                  ? "Connection Error"
                  : "Demo Instance Limit Reached"}
              </Typography>
            </Box>
          </Box>

          {/* Usage Statistics */}
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

          {/* Simple Message */}
          <Typography
            variant="body1"
            sx={{ color: "#424242", mb: 3, textAlign: "center" }}
          >
            {isConnectionError
              ? "Contact our team for technical assistance and to resolve this issue."
              : "Contact our team to upgrade your plan and continue using MiFiX.ai."}
          </Typography>

          {/* Contact Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                try {
                  // Open phone dialer
                  window.location.href = "tel:8511044804";
                } catch (error) {
                  console.error("Error opening phone dialer:", error);
                }
              }}
              sx={{
                backgroundColor: "#4caf50",
                color: "white",
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#45a049",
                },
              }}
            >
              <CallIcon sx={{ mr: 1 }} />
              Call Support
            </Button>

            <Button
              variant="outlined"
              onClick={handleContactSupport}
              sx={{
                borderColor: "#ff9800",
                color: "#ff9800",
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#f57c00",
                  backgroundColor: "rgba(255, 152, 0, 0.08)",
                },
              }}
            >
              <ContactIcon sx={{ mr: 1 }} />
              Email Support
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error rendering AccessDeniedResponse:", error);
    // Fallback UI if component fails to render
    return (
      <Card
        sx={{
          maxWidth: "100%",
          border: "2px solid #f57c00",
          backgroundColor: "#fff8e1",
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: "#e65100", mb: 2 }}>
          Access Limit Reached
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please contact support for assistance.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => {
              try {
                window.location.href = "tel:8511044804";
              } catch (e) {
                console.error(e);
              }
            }}
            sx={{ backgroundColor: "#4caf50", color: "white" }}
          >
            Call: 8511044804
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              try {
                window.location.href =
                  "mailto:vaishakh.krishnan@newstreettech.com";
              } catch (e) {
                console.error(e);
              }
            }}
            sx={{ borderColor: "#ff9800", color: "#ff9800" }}
          >
            Email Support
          </Button>
        </Box>
      </Card>
    );
  }
};

export default AccessDeniedResponse;
