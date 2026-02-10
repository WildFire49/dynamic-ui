"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  alpha,
  Chip,
  Drawer,
  ListItemButton,
  Badge,
  Tooltip,
  List,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  Send,
  AutoAwesome,
  CheckCircle,
  ErrorOutline,
  Refresh,
  History,
  Close,
  Delete,
  AccountTree as WorkflowIcon,
} from "@mui/icons-material";
import DynamicUIRenderer from "../dynamic-form/DynamicUIRenderer";
import uiConfiguratorService from "@/services/uiConfiguratorService";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useAIFormGenerator } from "@/hooks/useAIFormGenerator";

/**
 * AI Component Builder
 * Generates forms using natural language with conversation history
 * @param {Function} onAddToCanvas - Callback to add generated form to canvas
 */
const AIComponentBuilder = ({ onAddToCanvas }) => {
  // UI State
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "system",
      content:
        "👋 Welcome to MiFiX Workflow Builder! Describe the workflow you want to create, and I'll generate it for you.\n\nExample: 'Create a workflow for loan application with name, amount, and tenure'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Custom Hooks
  const {
    conversations,
    loading: loadingHistory,
    loadHistory,
    deleteConversation: removeConversation,
  } = useConversationHistory();

  const {
    loading,
    error: generationError,
    conversationId,
    currentFormId,
    generateForm,
    resetConversation: resetFormState,
    loadConversation: setConversationState,
  } = useAIFormGenerator();

  /**
   * Scroll to bottom of chat
   */
  const scrollToBottom = useCallback(() => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Handle viewing a form from library
   */
  const handleViewLibraryForm = (form) => {
    // Add form to chat as a message
    addMessage({
      type: "form_schema",
      content: `📚 Loaded from library: ${form.title}`,
      schema: form.schema,
      formId: form.form_id,
    });
    // Switch to chat tab
    setActiveTab(0);
  };

  /**
   * Load a specific conversation
   */
  const loadConversation = useCallback(
    async (convId) => {
      try {
        const data = await uiConfiguratorService.loadConversation(convId);

        if (data) {
          // Convert history to messages format
          const loadedMessages = [
            {
              id: 1,
              type: "system",
              content: "👋 Conversation loaded. Continue where you left off!",
              timestamp: new Date(),
            },
            ...data.messages.map((msg, idx) => ({
              id: idx + 2,
              type:
                msg.role === "user"
                  ? "user"
                  : msg.schema
                  ? "form_schema"
                  : "assistant",
              content: msg.content,
              schema: msg.schema,
              formId: msg.form_id,
              timestamp: new Date(msg.timestamp),
            })),
          ];

          setMessages(loadedMessages);
          setConversationState(convId, data.current_form_id);
          setHistoryDrawerOpen(false);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        addMessage({
          type: "error",
          content: "Failed to load conversation. Please try again.",
        });
      }
    },
    [setConversationState]
  );

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    async (convId) => {
      try {
        await removeConversation(convId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    },
    [removeConversation]
  );

  /**
   * Add a message to the chat
   */
  const addMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date(),
        ...message,
      },
    ]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const prompt = input.trim();

    // Add user message
    addMessage({
      type: "user",
      content: prompt,
    });

    setInput("");

    try {
      const data = await generateForm(
        prompt,
        // Success callback
        (responseData) => {
          addMessage({
            type: "form_schema",
            content: responseData.message || "✅ Form generated successfully!",
            schema: responseData.schema,
            formId: responseData.form_id,
          });

          // Refresh history if new conversation
          if (responseData.conversation_id && !conversationId) {
            loadHistory();
          }
        },
        // Error callback
        (errorMessage) => {
          addMessage({
            type: "error",
            content:
              errorMessage || "Failed to generate form. Please try again.",
          });
        }
      );
    } catch (error) {
      // Error already handled in callback
      console.error("Form generation error:", error);
    }
  }, [input, loading, conversationId, generateForm, addMessage, loadHistory]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  /**
   * Add generated form to canvas
   */
  const handleAddToCanvas = useCallback(
    (schema, formId) => {
      if (onAddToCanvas && schema) {
        // Create a component object from the schema
        const component = {
          id: formId || `generated_${Date.now()}`,
          name: schema.title || "Generated Form",
          description: schema.description || "AI Generated Form",
          category: "generated",
          icon: "description",
          color: "#9c27b0",
          schema: schema,
        };

        onAddToCanvas(component);
      }
    },
    [onAddToCanvas]
  );

  /**
   * Reset conversation and start fresh
   */
  const handleResetConversation = useCallback(() => {
    setMessages([
      {
        id: 1,
        type: "system",
        content:
          "👋 Welcome to Worfklow Builder! Describe the component you want to create, and I'll generate it for you.\n\nExample: 'Create a loan application form with name, amount, and tenure'",
        timestamp: new Date(),
      },
    ]);
    resetFormState();
  }, [resetFormState]);

  const renderMessage = (message) => {
    if (message.type === "system") {
      return (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: alpha("#1976d2", 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha("#1976d2", 0.2)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              whiteSpace: "pre-wrap",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {message.content}
          </Typography>
        </Box>
      );
    }

    if (message.type === "user") {
      return (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              maxWidth: "80%",
              bgcolor: "#1976d2",
              color: "white",
              borderRadius: 2,
              borderBottomRightRadius: 4,
            }}
          >
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", fontSize: "0.875rem" }}
            >
              {message.content}
            </Typography>
          </Paper>
        </Box>
      );
    }

    if (message.type === "error") {
      return (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {message.content}
            </Typography>
            {message.hint && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                💡 {message.hint}
              </Typography>
            )}
          </Alert>
        </Box>
      );
    }

    if (message.type === "form_schema") {
      return (
        <Box sx={{ mb: 2 }}>
          {/* Success Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
              p: 1.5,
              bgcolor: alpha("#4caf50", 0.1),
              borderRadius: 2,
              border: `1px solid ${alpha("#4caf50", 0.3)}`,
            }}
          >
            <CheckCircle sx={{ color: "#4caf50", fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
              {message.content}
            </Typography>
            <Chip
              label={message.formId}
              size="small"
              sx={{
                fontSize: "0.7rem",
                height: 20,
                bgcolor: alpha("#4caf50", 0.15),
                color: "#2e7d32",
              }}
            />
          </Box>

          {/* Form Preview */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 1.5,
            }}
          >
            <DynamicUIRenderer
              data={{ response: { schema: message.schema } }}
              onSubmit={(data) => {
                console.log("Form submitted:", data);
              }}
            />
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleAddToCanvas(message.schema, message.formId)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#9c27b0",
                "&:hover": {
                  bgcolor: "#7b1fa2",
                },
              }}
            >
              Add to Canvas
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setInput(`Edit the ${message.formId} form: `);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Edit Form
            </Button>
          </Box>

          {/* Edit Instructions */}
          {message.formId && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              💡 To edit this form, describe your changes (e.g., "Add an email
              field" or "Change submit button text")
            </Typography>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fafafa",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3}}>
            <WorkflowIcon sx={{ color: "#2562b2ff", fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Component Builder
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generate Components using natural language
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* <Tooltip title="Conversation History">
              <IconButton
                size="small"
                onClick={() => setHistoryDrawerOpen(true)}
                sx={{
                  bgcolor:
                    conversations.length > 0
                      ? alpha("#9c27b0", 0.1)
                      : "transparent",
                  "&:hover": {
                    bgcolor: alpha("#9c27b0", 0.2),
                  },
                }}
              >
                <Badge badgeContent={conversations.length} color="secondary">
                  <History fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip> */}
            {/* <Tooltip title="New Conversation">
              <IconButton size="small" onClick={handleResetConversation}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip> */}
          </Box>
        </Box>
      </Box>

      {/* Chat Content Area */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
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
              Generating your form...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Current Form Indicator */}
      {currentFormId && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: alpha("#9c27b0", 0.05),
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Editing: <strong>{currentFormId}</strong> (changes will update this
            form)
          </Typography>
        </Box>
      )}

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "white",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the form you want to create..."
            disabled={loading}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: alpha("#000", 0.02),
                borderRadius: 2,
                "& fieldset": {
                  borderColor: alpha("#000", 0.1),
                },
                "&:hover fieldset": {
                  borderColor: alpha("#000", 0.2),
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
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
      </Box>

      {/* Conversation History Drawer */}
      <Drawer
        anchor="right"
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            bgcolor: "#fafafa",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Drawer Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "white",
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <History sx={{ color: "#9c27b0" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Conversation History
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setHistoryDrawerOpen(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* History List */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {loadingHistory ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            ) : conversations.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 2,
                }}
              >
                <History
                  sx={{
                    fontSize: 64,
                    color: alpha("#000", 0.1),
                    mb: 2,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  No conversation history yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Start creating forms to see your history here
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {conversations.map((conversation, index) => (
                  <Paper
                    key={conversation.conversation_id}
                    elevation={0}
                    sx={{
                      mb: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "#9c27b0",
                        boxShadow: `0 0 0 1px ${alpha("#9c27b0", 0.2)}`,
                      },
                    }}
                  >
                    <ListItemButton
                      onClick={() =>
                        loadConversation(conversation.conversation_id)
                      }
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: "#9c27b0",
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {conversation.title || `Conversation ${index + 1}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {conversation.preview || "No preview available"}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.conversation_id);
                          }}
                          sx={{
                            ml: 1,
                            color: "error.main",
                            "&:hover": {
                              bgcolor: alpha("#f44336", 0.1),
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={`${conversation.message_count || 0} messages`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: alpha("#9c27b0", 0.1),
                            color: "#9c27b0",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(
                            conversation.updated_at
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </Paper>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AIComponentBuilder;
