import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { SmartToy, Lightbulb } from "@mui/icons-material";

const NoDataCard = ({ message, query }) => {
  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Card
        sx={{
          border: "1px solid #e3f2fd",
          backgroundColor: "#f0f9ff",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Robot Avatar with Info Icon */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
              }}
            >
              <SmartToy sx={{ fontSize: { xs: 28, sm: 32 }, color: "#2563eb" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1e40af",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  mb: 0.5,
                }}
              >
                No Data Found
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#1e3a8a",
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                }}
              >
                {message || "The query executed successfully but returned no results."}
              </Typography>
            </Box>
          </Box>

          {/* Query Info */}
          {query && (
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                backgroundColor: "white",
                borderRadius: 2,
                border: "1px solid #bfdbfe",
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  fontWeight: 600,
                  display: "block",
                  mb: 0.5,
                }}
              >
                Your Query:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#374151",
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                }}
              >
                {query}
              </Typography>
            </Box>
          )}

          {/* Helpful Message */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              backgroundColor: "#eff6ff",
              borderRadius: 2,
              border: "1px solid #dbeafe",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Lightbulb sx={{ fontSize: 20, color: "#2563eb" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "#1e40af",
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                }}
              >
                Suggestions:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#1e3a8a",
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                lineHeight: 1.5,
              }}
            >
              • Try adjusting the date range or filters
              <br />
              • Check if the data exists for this criteria
              <br />• Rephrase your question with different parameters
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NoDataCard;
