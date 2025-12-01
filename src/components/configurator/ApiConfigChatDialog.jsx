"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
  alpha,
  Divider,
} from "@mui/material";
import {
  Send,
  Close,
  Settings,
  CheckCircle,
  ErrorOutline,
  Code,
  Visibility,
  Refresh,
} from "@mui/icons-material";
import DynamicUIRenderer from "../dynamic-form/DynamicUIRenderer";
import apiClient from "@/services/apiClient";
import authService from "@/services/authService";

/**
 * API Configuration Chat Dialog
 * Allows users to configure component APIs using natural language
 */
const ApiConfigChatDialog = ({
  open,
  onClose,
  component,
  formId,
  onConfigUpdate,
  onWorkflowRefresh,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [componentSchema, setComponentSchema] = useState(null);
  const [previewFormSchema, setPreviewFormSchema] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch component schema when dialog opens
  useEffect(() => {
    if (open && formId) {
      fetchComponentSchema();
    }
  }, [open, formId]);

  // Initialize welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: "system",
          content: `Component Configuration Assistant\n\nI'm here to help you edit components and configure APIs. Describe the changes you need, and I'll generate the configuration for you.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Fetch component schema from backend
   */
  const fetchComponentSchema = async () => {
    try {
      const data = await apiClient.get(
        `/api/v1/configurator/ui-configurator/schemas/${formId}`
      );

      if (data.success) {
        setComponentSchema(data.data);

        // Calculate total field count across all sections
        // Try both schema and parsed_schema for compatibility
        const schema = data.data.schema || data.data.parsed_schema;
        const totalFields =
          schema?.sections?.reduce(
            (total, section) => total + (section.fields?.length || 0),
            0
          ) || 0;

        // Add schema info message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "system",
            content: `Component schema loaded.\n\nComponent ID: ${formId}\nTotal fields: ${totalFields}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching schema:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          content: "Failed to load component schema. Please try again.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  /**
   * Send configuration request to backend
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get user_id from authService
      const userId = authService.getUserId();
      
      const data = await apiClient.post(
        `/api/v1/configurator/ui-configurator/generate`,
        {
          prompt: input,
          user_id: userId,
          form_id: formId,
        }
      );

      if (data.success) {
        // Check if this is a form schema generation
        const isFormSchema =
          data.data?.type === "form_schema" && data.data?.schema;

        // Refresh workflow list after successful generation
        if (isFormSchema && onWorkflowRefresh) {
          onWorkflowRefresh();
        }

        // Add success message with configuration
        const assistantMessage = {
          id: Date.now() + 1,
          type: "assistant",
          content: data.data.message || "Configuration updated successfully!",
          config: data.data.config,
          schema: isFormSchema ? data.data.schema : null,
          formId: isFormSchema ? data.data.form_id : null,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Call parent callback with updated config
        if (onConfigUpdate && data.data.config) {
          onConfigUpdate(data.data.config);
        }

        // If form schema, also update parent with the schema
        if (isFormSchema && onConfigUpdate) {
          onConfigUpdate(data.data.schema);
        }
      } else {
        throw new Error(data.message || "Configuration failed");
      }
    } catch (error) {
      console.error("Error configuring API:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "error",
          content: `❌ Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Render message based on type
   */
  const renderMessage = (message) => {
    const isUser = message.type === "user";
    const isSystem = message.type === "system";
    const isError = message.type === "error";

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          mb: 2,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: "80%",
            bgcolor: isUser
              ? "#1976d2"
              : isError
              ? alpha("#f44336", 0.1)
              : isSystem
              ? alpha("#9c27b0", 0.05)
              : "white",
            color: isUser ? "white" : "text.primary",
            borderRadius: 2,
          }}
        >
          {/* Message Content */}
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              "& strong": {
                fontWeight: 700,
              },
            }}
          >
            {message.content}
          </Typography>

          {/* Show form schema preview if present */}
          {message.schema && (
            <Box
              sx={{
                mt: 2,
                border: "2px solid",
                borderColor: alpha("#9c27b0", 0.3),
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  p: 1.5,
                  bgcolor: alpha("#9c27b0", 0.1),
                  borderBottom: "1px solid",
                  borderColor: alpha("#9c27b0", 0.2),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Visibility fontSize="small" sx={{ color: "#9c27b0" }} />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="#9c27b0"
                  >
                    Form Preview: {message.schema.title}
                  </Typography>
                </Box>
                <Chip
                  label={message.formId}
                  size="small"
                  sx={{
                    fontSize: "10px",
                    height: 20,
                    bgcolor: alpha("#9c27b0", 0.2),
                  }}
                />
              </Box>
              <Box
                sx={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  bgcolor: "#fafafa",
                }}
              >
                <DynamicUIRenderer data={message.schema} />
              </Box>
            </Box>
          )}

          {/* Show configuration if present */}
          {message.config && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: alpha("#000", 0.05),
                borderRadius: 1,
                border: "1px solid",
                borderColor: alpha("#000", 0.1),
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Code fontSize="small" color="primary" />
                <Typography variant="caption" fontWeight="bold">
                  Generated Configuration
                </Typography>
              </Box>
              <pre
                style={{
                  margin: 0,
                  fontSize: "12px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {JSON.stringify(message.config, null, 2)}
              </pre>
            </Box>
          )}

          {/* Timestamp */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              opacity: 0.7,
              fontSize: "10px",
            }}
          >
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha("#9c27b0", 0.05),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Settings sx={{ color: "#9c27b0" }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Configure Component
            </Typography>
            {component && (
              <Typography variant="caption" color="text.secondary">
                {component.name || component.id} • Edit fields & configure APIs
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onWorkflowRefresh && (
            <IconButton 
              size="small" 
              onClick={onWorkflowRefresh}
              sx={{
                color: "#9c27b0",
                '&:hover': {
                  bgcolor: alpha("#9c27b0", 0.1),
                },
              }}
              title="Refresh workflow list"
            >
              <Refresh />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Chat Messages */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          bgcolor: "#fafafa",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: alpha("#000", 0.05),
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: alpha("#000", 0.2),
            borderRadius: "4px",
            "&:hover": {
              bgcolor: alpha("#000", 0.3),
            },
          },
        }}
      >
        {messages.map((message) => (
          <Box key={message.id}>{renderMessage(message)}</Box>
        ))}

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              p: 2,
              bgcolor: alpha("#1976d2", 0.05),
              borderRadius: 2,
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Configuring UI based on your description...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      {/* Input Area */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe changes or API configuration you need..."
            disabled={loading}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: alpha("#000", 0.02),
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              "&:hover": {
                bgcolor: "#1565c0",
              },
              "&.Mui-disabled": {
                bgcolor: alpha("#000", 0.12),
                color: alpha("#000", 0.26),
              },
            }}
          >
            <Send fontSize="small" />
          </IconButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ApiConfigChatDialog;
