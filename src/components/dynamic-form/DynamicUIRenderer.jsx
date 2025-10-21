"use client";

import React, { useState, useMemo } from "react";
import DynamicFormRenderer from "./DynamicFormRenderer";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * DynamicUIRenderer - Handles API response and renders forms dynamically
 *
 * Supports two input formats:
 * 1. Direct schema object
 * 2. API response with nested schema
 */
const DynamicUIRenderer = React.memo(
  ({ data, onSubmit, onContinue, hideMetadata = false }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({});

    // Memoize schema extraction to prevent unnecessary re-renders
    const schema = useMemo(() => {
      try {
        if (!data) {
          return null;
        }

        // Format 1: Direct schema
        if (data.id && data.sections) {
          return data;
        }

        // Format 2: API response with nested schema
        if (data.response?.schema) {
          return data.response.schema;
        }

        // Format 3: Schema in data.schema
        if (data.schema) {
          return data.schema;
        }

        return null;
      } catch (error) {
        console.error("Error extracting schema:", error);
        return null;
      }
    }, [data]);

    // Memoize metadata extraction
    const metadata = useMemo(() => {
      if (!data) return null;

      if (data.response) {
        return {
          type: data.response.type,
          message: data.response.message,
          formId: data.response.form_id,
          title: data.response.title,
          description: data.response.description,
          databaseId: data.response.database_id,
          templateUsed: data.response.template_used,
          conversationId: data.conversation_id,
        };
      }

      return null;
    }, [data]);

    // Handle form submission
    const handleFormSubmit = (formData) => {
      console.log("Form submitted:", formData);

      if (onSubmit) {
        onSubmit({
          formData,
          schema,
          metadata,
        });
      }
    };

    // Handle continue to next form
    const handleContinue = (nextFormId) => {
      console.log("Continue to:", nextFormId);

      if (onContinue) {
        onContinue(nextFormId, formData);
      }
    };

    // Loading state
    if (!data) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    // Error state
    if (!schema) {
      console.error(
        "❌ DynamicUIRenderer: Invalid schema, data structure:",
        data
      );
      return (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ borderRadius: "12px" }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Invalid Schema Format
            </Typography>
            <Typography variant="body2">
              The provided data does not contain a valid form schema.
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{
                mt: 2,
                display: "block",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(data, null, 2)}
            </Typography>
          </Alert>
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%" }}>
        {/* Metadata Header (if available) - Redesigned */}
        {!hideMetadata && metadata && (
          <Paper
            elevation={0}
            sx={{
              mb: { xs: 2, sm: 3 },
              p: 0,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.success.main,
                0.08
              )} 0%, ${alpha(theme.palette.success.light, 0.03)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: { xs: "12px", sm: "16px" },
              overflow: "hidden",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                display: "flex",
                alignItems: "flex-start",
                gap: { xs: 1.5, sm: 2 },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flex: 1,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      color: theme.palette.success.main,
                      fontSize: { xs: 24, sm: 28 },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    {metadata.title || "Form Generated"}
                  </Typography>
                  {metadata.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: { xs: "0.813rem", sm: "0.875rem" },
                        lineHeight: 1.5,
                      }}
                    >
                      {metadata.description}
                    </Typography>
                  )}
                </Box>
              </Box>
              {metadata.type && (
                <Chip
                  label={metadata.type.replace("_", " ").toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    height: { xs: 24, sm: 28 },
                    alignSelf: { xs: "flex-start", sm: "center" },
                  }}
                />
              )}
            </Box>

            {/* Metadata Chips Section */}
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                pb: { xs: 2, sm: 2.5 },
                pt: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 0.75, sm: 1 },
              }}
            >
              {metadata.formId && (
                <Chip
                  icon={<InfoIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label={`ID: ${metadata.formId}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    height: { xs: 24, sm: 28 },
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    "& .MuiChip-icon": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              )}
              {metadata.databaseId && (
                <Chip
                  icon={<InfoIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label={`DB: ${metadata.databaseId.substring(0, 8)}...`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    height: { xs: 24, sm: 28 },
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    "& .MuiChip-icon": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              )}
              {metadata.templateUsed?.version && (
                <Chip
                  icon={<InfoIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label={`Template: v${metadata.templateUsed.version}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    height: { xs: 24, sm: 28 },
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    "& .MuiChip-icon": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
        )}

        {/* Render Form */}
        {schema && schema.sections ? (
          <DynamicFormRenderer
            formSchema={schema}
            onSubmit={handleFormSubmit}
            onContinue={handleContinue}
          />
        ) : (
          <Alert severity="warning" sx={{ borderRadius: "12px" }}>
            <Typography variant="body2">
              Schema is missing required 'sections' array
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{ mt: 1, display: "block" }}
            >
              {JSON.stringify(schema, null, 2)}
            </Typography>
          </Alert>
        )}
      </Box>
    );
  }
);

DynamicUIRenderer.displayName = "DynamicUIRenderer";

export default DynamicUIRenderer;
