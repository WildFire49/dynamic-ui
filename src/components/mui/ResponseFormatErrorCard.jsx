import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { SmartToy } from "@mui/icons-material";

const ResponseFormatErrorCard = ({ title, message }) => {
  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Card
        sx={{
          border: "1px solid #fee",
          backgroundColor: "#fef5f5",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
              }}
            >
              <SmartToy sx={{ fontSize: { xs: 28, sm: 32 }, color: "#dc2626" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#991b1b",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  mb: 0.5,
                }}
              >
                {title || "Unexpected Response Format"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#7f1d1d",
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                }}
              >
                {message || "The query response is missing expected data fields."}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResponseFormatErrorCard;
