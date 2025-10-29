"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Refresh,
  Search,
  CheckCircle,
  Cancel,
  BarChart,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";

const TemplateManagement = ({ connectionId, userId = "admin@company.com" }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchQuery, setMatchQuery] = useState("");
  const [matchResults, setMatchResults] = useState(null);

  // Create template form state
  const [newTemplate, setNewTemplate] = useState({
    template_id: "",
    template_name: "",
    keywords: "",
    primary_tables: "",
    default_filters: "{}",
    business_domain: "",
  });

  useEffect(() => {
    if (connectionId) {
      loadTemplates();
    }
  }, [connectionId]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryLearningService.listTemplates(connectionId, true);
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTemplates = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await queryLearningService.seedTemplates(
        connectionId,
        userId
      );
      setSuccess(
        `Seeded ${result.created} templates (${result.skipped} skipped)`
      );
      loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    setError(null);
    setSuccess(null);
    try {
      const templateData = {
        connection_id: connectionId,
        template_id: newTemplate.template_id,
        template_name: newTemplate.template_name,
        keywords: newTemplate.keywords.split(",").map((k) => k.trim()),
        primary_tables: newTemplate.primary_tables
          .split(",")
          .map((t) => t.trim()),
        default_filters: JSON.parse(newTemplate.default_filters),
        business_domain: newTemplate.business_domain,
        created_by: userId,
      };

      await queryLearningService.createTemplate(templateData);
      setSuccess("Template created successfully");
      setCreateDialogOpen(false);
      loadTemplates();
      
      // Reset form
      setNewTemplate({
        template_id: "",
        template_name: "",
        keywords: "",
        primary_tables: "",
        default_filters: "{}",
        business_domain: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMatchTemplate = async () => {
    setError(null);
    try {
      const result = await queryLearningService.matchTemplate(
        connectionId,
        matchQuery,
        3
      );
      setMatchResults(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(0)}%`;

  if (loading && templates.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="600">
          Query Templates
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={() => setMatchDialogOpen(true)}
          >
            Test Match
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleSeedTemplates}
            disabled={loading}
          >
            Seed Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Create Template
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Templates Table */}
      <TableContainer
        component={Paper}
        sx={{ border: "1px solid #e2e8f0", boxShadow: "none" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f8fafc" }}>
              <TableCell>
                <strong>Template ID</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Keywords</strong>
              </TableCell>
              <TableCell>
                <strong>Primary Tables</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Usage</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Success Rate</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No templates found. Click "Seed Templates" to initialize.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow
                  key={template.id}
                  sx={{
                    "&:hover": { background: "#f8fafc" },
                    transition: "background 0.2s",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {template.template_id}
                    </Typography>
                  </TableCell>
                  <TableCell>{template.template_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {template.keywords?.slice(0, 3).map((keyword, idx) => (
                        <Chip
                          key={idx}
                          label={keyword}
                          size="small"
                          sx={{
                            background: "#e0e7ff",
                            color: "#4338ca",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                      {template.keywords?.length > 3 && (
                        <Chip
                          label={`+${template.keywords.length - 3}`}
                          size="small"
                          sx={{
                            background: "#f3f4f6",
                            color: "#6b7280",
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {template.primary_tables?.slice(0, 2).map((table, idx) => (
                        <Chip
                          key={idx}
                          label={table}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {template.primary_tables?.length > 2 && (
                        <Chip
                          label={`+${template.primary_tables.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Total usage count">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                        <BarChart sx={{ fontSize: 18, color: "#6b7280" }} />
                        <Typography variant="body2">
                          {template.usage_count || 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      sx={{
                        color:
                          template.success_count / template.usage_count >= 0.85
                            ? "#48bb78"
                            : template.success_count / template.usage_count >= 0.7
                            ? "#f6ad55"
                            : "#f56565",
                      }}
                    >
                      {template.usage_count > 0
                        ? formatPercentage(
                            template.success_count / template.usage_count
                          )
                        : "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {template.is_active ? (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 16 }} />}
                        label="Active"
                        size="small"
                        sx={{
                          background: "#d1fae5",
                          color: "#065f46",
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<Cancel sx={{ fontSize: 16 }} />}
                        label="Inactive"
                        size="small"
                        sx={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Template Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Custom Template</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Template ID"
              placeholder="TMPL_CUSTOM"
              value={newTemplate.template_id}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, template_id: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Template Name"
              placeholder="My Custom Pattern"
              value={newTemplate.template_name}
              onChange={(e) =>
                setNewTemplate({
                  ...newTemplate,
                  template_name: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Keywords (comma-separated)"
              placeholder="keyword1, keyword2, keyword3"
              value={newTemplate.keywords}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, keywords: e.target.value })
              }
              fullWidth
              required
              helperText="Used for matching user queries"
            />
            <TextField
              label="Primary Tables (comma-separated)"
              placeholder="table1, table2"
              value={newTemplate.primary_tables}
              onChange={(e) =>
                setNewTemplate({
                  ...newTemplate,
                  primary_tables: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Default Filters (JSON)"
              placeholder='{"table1": {"column": "value"}}'
              value={newTemplate.default_filters}
              onChange={(e) =>
                setNewTemplate({
                  ...newTemplate,
                  default_filters: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={3}
              helperText="JSON object with default filter conditions"
            />
            <TextField
              label="Business Domain"
              placeholder="custom"
              value={newTemplate.business_domain}
              onChange={(e) =>
                setNewTemplate({
                  ...newTemplate,
                  business_domain: e.target.value,
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Match Template Dialog */}
      <Dialog
        open={matchDialogOpen}
        onClose={() => {
          setMatchDialogOpen(false);
          setMatchResults(null);
          setMatchQuery("");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Test Template Matching</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Test Query"
              placeholder="show customers who onboarded today"
              value={matchQuery}
              onChange={(e) => setMatchQuery(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              onClick={handleMatchTemplate}
              sx={{
                mt: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              fullWidth
            >
              Find Matching Templates
            </Button>

            {matchResults && matchResults.matches && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Matched Templates:
                </Typography>
                {matchResults.matches.map((match, idx) => (
                  <Paper
                    key={idx}
                    sx={{ p: 2, mt: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography fontWeight="600">
                        {match.template.template_name}
                      </Typography>
                      <Chip
                        label={`${(match.match_score * 100).toFixed(0)}% Match`}
                        size="small"
                        sx={{
                          background: "#d1fae5",
                          color: "#065f46",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Matched Keywords: {match.matched_keywords.join(", ")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suggested Tables: {match.suggested_tables.join(", ")}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setMatchDialogOpen(false);
              setMatchResults(null);
              setMatchQuery("");
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateManagement;
