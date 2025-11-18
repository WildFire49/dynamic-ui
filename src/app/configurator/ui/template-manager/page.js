"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  CalendarToday,
  Person,
  Verified,
  Article,
  Settings,
} from "@mui/icons-material";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
      }}
    >
      <CircularProgress />
    </Box>
  ),
});

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    description: "",
    base_template_id: "",
  });

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/configurator/ui-configurator/templates?active_only=false`
      );
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates || []);
      }
    } catch (error) {
      showSnackbar("Failed to fetch templates", "error");
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/configurator/ui-configurator/templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            created_by: "admin_user",
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        showSnackbar(
          data.message || "Template created successfully",
          "success"
        );
        fetchTemplates();
        handleCloseDialog();
      } else {
        showSnackbar(data.detail || "Failed to create template", "error");
      }
    } catch (error) {
      showSnackbar("Failed to create template", "error");
      console.error("Error creating template:", error);
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/configurator/ui-configurator/templates/${selectedTemplate.template_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: formData.content,
            description: formData.description,
            name: formData.name,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        showSnackbar(
          data.message || "Template updated successfully",
          "success"
        );
        fetchTemplates();
        handleCloseDialog();
      } else {
        showSnackbar(data.detail || "Failed to update template", "error");
      }
    } catch (error) {
      showSnackbar("Failed to update template", "error");
      console.error("Error updating template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm("Are you sure you want to deactivate this template?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/configurator/ui-configurator/templates/${templateId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.success) {
        showSnackbar("Template deactivated successfully", "success");
        fetchTemplates();
      } else {
        showSnackbar(data.detail || "Failed to deactivate template", "error");
      }
    } catch (error) {
      showSnackbar("Failed to deactivate template", "error");
      console.error("Error deleting template:", error);
    }
  };

  const handleOpenDialog = async (template = null) => {
    if (template) {
      // Fetch full template details including content
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/configurator/ui-configurator/templates/${template.template_id}?active_only=false`
        );
        const data = await response.json();
        if (data.success) {
          const fullTemplate = data.data;
          setSelectedTemplate(fullTemplate);
          setFormData({
            name: fullTemplate.name,
            content: fullTemplate.content || "",
            description: fullTemplate.description || "",
            base_template_id: fullTemplate.template_id,
          });
        } else {
          showSnackbar("Failed to fetch template details", "error");
        }
      } catch (error) {
        showSnackbar("Failed to fetch template details", "error");
        console.error("Error fetching template details:", error);
      }
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: "",
        content: "",
        description: "",
        base_template_id: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setFormData({
      name: "",
      content: "",
      description: "",
      base_template_id: "",
    });
  };

  const handleSave = () => {
    if (selectedTemplate) {
      handleUpdateTemplate();
    } else {
      handleCreateTemplate();
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1a202c",
              mb: 1,
            }}
          >
            UI Template Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage UI Templates with version control
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#0078d7",
            color: "white",
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,120,215,0.25)",
            "&:hover": {
              bgcolor: "#005a9e",
              boxShadow: "0 6px 16px rgba(0,120,215,0.35)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Create New Template
        </Button>
      </Box>

      {/* Templates Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "white",
            border: "2px dashed #e2e8f0",
          }}
        >
          <Article sx={{ fontSize: 64, color: "#9ca3af", mb: 2 }} />
          <Typography
            variant="h6"
            color="text.primary"
            gutterBottom
            fontWeight="600"
          >
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first template to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "#0078d7",
              "&:hover": { bgcolor: "#005a9e" },
            }}
          >
            Create Template
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: 3,
          }}
        >
          {templates.map((template) => (
            <Paper
              key={template.id}
              sx={{
                p: 3,
                border: "2px solid",
                borderColor: template.is_active ? "#0078d7" : "#e2e8f0",
                borderRadius: 3,
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,120,215,0.15)",
                  borderColor: "#0078d7",
                },
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: template.is_active ? "#0078d7" : "#9ca3af",
                  color: "white",
                  px: 2,
                  py: 0.5,
                  borderBottomLeftRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {template.is_active ? (
                  <Verified sx={{ fontSize: 16 }} />
                ) : (
                  <Settings sx={{ fontSize: 16 }} />
                )}
                <Typography variant="caption" fontWeight="600">
                  {template.is_active ? "Active" : "Inactive"}
                </Typography>
              </Box>

              {/* Header */}
              <Box sx={{ mb: 2, pr: 8 }}>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{ color: "#1a202c", mb: 0.5 }}
                >
                  {template.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#0078d7",
                    bgcolor: "#e6f2ff",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  v{template.version}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  lineHeight: 1.6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minHeight: "40px",
                }}
              >
                {template.description || "No description provided"}
              </Typography>

              {/* Template ID */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CodeIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                  <Typography
                    variant="caption"
                    fontWeight="600"
                    color="text.secondary"
                  >
                    TEMPLATE ID
                  </Typography>
                </Box>
                <Chip
                  label={template.template_id}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "#0078d7",
                    color: "#0078d7",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(template)}
                  sx={{
                    flex: 1,
                    bgcolor: "#f0f9ff",
                    color: "#0078d7",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#e6f2ff",
                    },
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleOpenDialog(template)}
                  sx={{
                    flex: 1,
                    bgcolor: "#f0f9ff",
                    color: "#0078d7",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#e6f2ff",
                    },
                  }}
                >
                  View
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteTemplate(template.template_id)}
                  sx={{
                    color: "#f56565",
                    "&:hover": {
                      bgcolor: "#fef2f2",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pt: 2,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 14, color: "#9ca3af" }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(template.created_at)
                      .toLocaleString("en-GB", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })
                      .replace(",", "")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person sx={{ fontSize: 14, color: "#9ca3af" }} />
                  <Typography variant="caption" color="text.secondary">
                    {template.created_by || "system"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullScreen
        PaperProps={{
          sx: {
            background: "#f5f7fa",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#0078d7",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          {selectedTemplate ? "Edit Template" : "Create New Template"}
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Top Form Fields */}
          <Box
            sx={{
              p: 3,
              background: "white",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "white",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "white",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Editor Section - Full Width */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 1.5,
                background: "white",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#0078d7" }}
              >
                Template Content
              </Typography>
              <Chip
                label="Markdown"
                size="small"
                sx={{
                  bgcolor: "#0078d7",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                background: "white",
              }}
            >
              <MonacoEditor
                height="100%"
                language="markdown"
                theme="vs-light"
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value || "" })
                }
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  renderWhitespace: "selection",
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            background: "white",
            borderTop: "1px solid #e0e0e0",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              color: "#0078d7",
              borderColor: "#0078d7",
              "&:hover": {
                borderColor: "#005a9e",
                bgcolor: "rgba(0,120,215,0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.content}
            sx={{
              bgcolor: "#0078d7",
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,120,215,0.25)",
              "&:hover": {
                bgcolor: "#005a9e",
                boxShadow: "0 6px 16px rgba(0,120,215,0.35)",
              },
              "&:disabled": {
                bgcolor: "#e0e0e0",
              },
            }}
          >
            {selectedTemplate ? "Update Template" : "Create Template"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
