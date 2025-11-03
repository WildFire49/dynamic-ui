"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Storage as StorageIcon,
  AccountTree as AccountTreeIcon,
  Schedule as ScheduleIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  AttachMoney as MoneyIcon,
  DataObject as TokenIcon,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";
import { useAuth } from "@/contexts/AuthContext";

const TemplateWorkflow = ({ connectionId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [pendingExamples, setPendingExamples] = useState([]);
  const [versions, setVersions] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [businessDomain, setBusinessDomain] = useState("");
  const [committing, setCommitting] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState([]);

  // Load initial data
  useEffect(() => {
    if (connectionId) {
      loadAllData();
    }
  }, [connectionId]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadSummary(),
        loadPendingExamples(),
        loadVersions(),
        loadChangelog(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await queryLearningService.getExamplesSummary(
        connectionId
      );
      setSummary(response.summary);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  };

  const loadPendingExamples = async () => {
    try {
      const response = await queryLearningService.getPendingExamples(
        connectionId
      );
      setPendingExamples(response.pending_examples || []);
    } catch (err) {
      console.error("Failed to load pending examples:", err);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await queryLearningService.getTemplateVersions(
        connectionId
      );
      setVersions(response.templates || []);
    } catch (err) {
      console.error("Failed to load versions:", err);
    }
  };

  const loadChangelog = async () => {
    try {
      const response = await queryLearningService.getTemplateChangelog(
        connectionId
      );
      setChangelog(response.changelog || []);
    } catch (err) {
      console.error("Failed to load changelog:", err);
    }
  };

  const handlePreviewCommit = async () => {
    if (!businessDomain.trim()) {
      setError("Please provide business domain");
      return;
    }

    setLoadingPreview(true);
    setError(null);

    try {
      const response = await queryLearningService.previewCommit(
        connectionId,
        businessDomain
      );

      setPreviewData(response.preview);
      setCommitDialogOpen(false);
      setPreviewDialogOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCommitAndEmbed = async () => {
    if (!templateName.trim() || !businessDomain.trim()) {
      setError("Please provide template name and business domain");
      return;
    }

    setCommitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await queryLearningService.commitAndEmbed(
        connectionId,
        templateName,
        businessDomain,
        user?.username || "system",
        true // confirmed
      );

      setSuccess(response.message || "Template created successfully!");
      setPreviewDialogOpen(false);
      setTemplateName("");
      setBusinessDomain("");
      setPreviewData(null);

      // Reload all data
      await loadAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCommitting(false);
    }
  };

  const handleActivateTemplate = async (templateId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await queryLearningService.activateTemplate(
        templateId,
        connectionId,
        user?.username || "system"
      );

      setSuccess(response.message || "Template activated successfully!");
      await loadAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewExamples = (examples) => {
    setSelectedExamples(examples);
    setViewDialogOpen(true);
  };

  const getComplexityColor = (score) => {
    if (score <= 1) return "success";
    if (score <= 2) return "warning";
    return "error";
  };

  const getComplexityLabel = (score) => {
    if (score <= 1) return "Simple";
    if (score <= 2) return "Medium";
    return "Complex";
  };

  if (loading && !summary) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 200px)", overflow: "auto", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}
          >
            Template Management Workflow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage learned examples, create templates, and track versions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAllData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* Summary Stats */}
      {summary && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            width: "100%",
          }}
        >
          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: 1,
              },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  mb: 1.5,
                }}
              >
                <StorageIcon />
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
              >
                {summary.total_examples}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Total Examples
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              "&:hover": {
                borderColor: "warning.main",
                boxShadow: 1,
              },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "warning.main",
                  color: "white",
                  mb: 1.5,
                }}
              >
                <ScheduleIcon />
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
              >
                {summary.pending_embed_count}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Pending Embed
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              "&:hover": {
                borderColor: "success.main",
                boxShadow: 1,
              },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "success.main",
                  color: "white",
                  mb: 1.5,
                }}
              >
                <CheckCircleIcon />
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
              >
                {summary.embedded_count}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Embedded
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              "&:hover": {
                borderColor: "info.main",
                boxShadow: 1,
              },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "info.main",
                  color: "white",
                  mb: 1.5,
                }}
              >
                <AccountTreeIcon />
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
              >
                {summary.in_template_count}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                In Templates
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Workflow Stepper */}
      <Paper sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Workflow Steps
          </Typography>
        </Box>
        <Stepper activeStep={-1} alternativeLabel>
          <Step>
            <StepLabel>View Examples</StepLabel>
          </Step>
          <Step>
            <StepLabel>Check Pending</StepLabel>
          </Step>
          <Step>
            <StepLabel>Commit & Embed</StepLabel>
          </Step>
          <Step>
            <StepLabel>Activate Template</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - Examples & Pending */}
        <Grid item xs={12} md={6}>
          {/* Pending Examples */}
          <Paper
            sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ScheduleIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pending Examples
                </Typography>
                <Chip
                  label={pendingExamples.length}
                  size="small"
                  color="warning"
                />
              </Box>
              {pendingExamples.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setCommitDialogOpen(true)}
                  color="primary"
                >
                  Commit & Embed
                </Button>
              )}
            </Box>

            {pendingExamples.length === 0 ? (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                All examples are embedded! Ready to create templates.
              </Alert>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  These examples will be embedded into ChromaDB for semantic
                  search and template matching.
                </Alert>
                <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                        >
                          Query
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                        >
                          SQL
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                        >
                          Domain
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                        >
                          Tags
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                        >
                          Complexity
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingExamples.map((example, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ maxWidth: 300 }}>
                            <Typography variant="body2">
                              {example.natural_language_query}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 400 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                bgcolor: "grey.100",
                                p: 1,
                                borderRadius: 1,
                                overflow: "auto",
                                maxHeight: 80,
                              }}
                            >
                              {example.generated_sql}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={example.business_domain}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              {example.tags?.slice(0, 3).map((tag, i) => (
                                <Chip
                                  key={i}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem" }}
                                />
                              ))}
                              {example.tags?.length > 3 && (
                                <Chip
                                  label={`+${example.tags.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem" }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getComplexityLabel(
                                example.complexity_score
                              )}
                              size="small"
                              color={getComplexityColor(
                                example.complexity_score
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>

          {/* All Examples Summary */}
          {summary && summary.examples && (
            <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    All Examples
                  </Typography>
                  <Chip
                    label={summary.examples.length}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewExamples(summary.examples)}
                >
                  View All
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Unique Domains
                  </Typography>
                  <Typography variant="h6">{summary.unique_domains}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    No Template
                  </Typography>
                  <Typography variant="h6">
                    {summary.no_template_count}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Versions & Changelog */}
        <Grid item xs={12} md={6}>
          {/* Template Versions */}
          <Paper
            sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AccountTreeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Template Versions
              </Typography>
              <Chip label={versions.length} size="small" color="primary" />
            </Box>

            {versions.length === 0 ? (
              <Alert severity="info">
                No templates created yet. Commit pending examples to create your
                first template.
              </Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Template Name</TableCell>
                      <TableCell>Domain</TableCell>
                      <TableCell>Examples</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version) => (
                      <TableRow key={version.template_id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {version.template_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(version.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={version.business_domain}
                            size="small"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell>{version.example_count}</TableCell>
                        <TableCell>
                          {version.is_active ? (
                            <Chip
                              label="Active"
                              size="small"
                              color="success"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip
                              label="Inactive"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {!version.is_active && (
                            <Tooltip title="Activate this template">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleActivateTemplate(version.template_id)
                                }
                                color="primary"
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Changelog */}
          <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <HistoryIcon color="action" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Chip label={changelog.length} size="small" />
            </Box>

            {changelog.length === 0 ? (
              <Alert severity="info">No activity yet.</Alert>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {changelog.slice(0, 10).map((log, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: idx < 9 ? "1px solid #e0e0e0" : "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <HistoryIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {log.operation.replace(/_/g, " ").toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {log.change_summary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.created_at).toLocaleString()} •{" "}
                      {log.performed_by}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Commit & Embed Dialog */}
      <Dialog
        open={commitDialogOpen}
        onClose={() => !committing && setCommitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CloudUploadIcon color="primary" />
            <Typography variant="h6">Commit & Embed Workflow</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will embed all {pendingExamples.length} pending examples and
            create a new template version.
          </Alert>

          <TextField
            fullWidth
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Customer Onboarding v2"
            sx={{ mb: 2 }}
            disabled={committing}
          />

          <TextField
            fullWidth
            label="Business Domain"
            value={businessDomain}
            onChange={(e) => setBusinessDomain(e.target.value)}
            placeholder="e.g., customer_onboarding"
            disabled={committing}
          />

          {committing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Embedding examples and creating template...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCommitDialogOpen(false)}
            disabled={loadingPreview}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePreviewCommit}
            variant="contained"
            disabled={loadingPreview || !businessDomain.trim()}
            startIcon={
              loadingPreview ? (
                <CircularProgress size={20} />
              ) : (
                <VisibilityIcon />
              )
            }
          >
            {loadingPreview ? "Loading Preview..." : "Preview Embedding"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => !committing && setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VisibilityIcon color="primary" />
              <Typography variant="h6">Embedding Preview</Typography>
            </Box>
            {previewData && (
              <Chip
                label={`${previewData.pending_count} examples to embed`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewData && (
            <Box>
              {/* Cost Summary Cards */}
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1,
                      borderRadius: 1,
                      bgcolor: "primary.main",
                      color: "white",
                      mb: 1,
                    }}
                  >
                    <TokenIcon />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {previewData.embedding_stats?.total_estimated_tokens || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tokens
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1,
                      borderRadius: 1,
                      bgcolor: "success.main",
                      color: "white",
                      mb: 1,
                    }}
                  >
                    <MoneyIcon />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    $
                    {previewData.embedding_stats?.estimated_cost_usd?.toFixed(
                      6
                    ) || "0.000000"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Cost
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1,
                      borderRadius: 1,
                      bgcolor: "info.main",
                      color: "white",
                      mb: 1,
                    }}
                  >
                    <AccountTreeIcon />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {previewData.template_preview?.will_include_examples || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total in Template
                  </Typography>
                </Paper>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                Model:{" "}
                {previewData.embedding_stats?.model || "text-embedding-ada-002"}
              </Alert>

              {/* Pending Examples with Embedding Preview */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Examples to be Embedded ({previewData.pending_count})
              </Typography>

              <TableContainer
                sx={{
                  maxHeight: 400,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                      >
                        Query
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                      >
                        Embedding Text
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                      >
                        Tokens
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                      >
                        Tags
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.pending_examples?.map((example, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {example.natural_language_query}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Complexity: {example.complexity_score}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 400 }}>
                          <Box
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              bgcolor: "grey.100",
                              p: 1,
                              borderRadius: 1,
                              maxHeight: 100,
                              overflow: "auto",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {example.embedding_preview?.text}
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: "block" }}
                          >
                            Length: {example.embedding_preview?.text_length}{" "}
                            chars
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={example.embedding_preview?.estimated_tokens}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Box
                            sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                          >
                            {example.tags?.slice(0, 2).map((tag, i) => (
                              <Chip
                                key={i}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.65rem" }}
                              />
                            ))}
                            {example.tags?.length > 2 && (
                              <Chip
                                label={`+${example.tags.length - 2}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.65rem" }}
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Template Name Input */}
              <TextField
                fullWidth
                label="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Customer Onboarding v2"
                sx={{ mt: 3 }}
                disabled={committing}
              />

              {committing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    Embedding {previewData.pending_count} examples and creating
                    template...
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPreviewDialogOpen(false);
              setPreviewData(null);
            }}
            disabled={committing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommitAndEmbed}
            variant="contained"
            disabled={committing || !templateName.trim()}
            startIcon={
              committing ? <CircularProgress size={20} /> : <SendIcon />
            }
            color="primary"
          >
            {committing
              ? "Processing..."
              : `Confirm & Embed (${previewData?.pending_count || 0} examples)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Examples Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          All Learned Examples ({selectedExamples.length})
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Query</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Template</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedExamples.map((example, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {example.natural_language_query}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={example.business_domain}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {example.tags?.slice(0, 2).map((tag, i) => (
                          <Chip
                            key={i}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {example.is_embedded ? (
                        <Chip label="Embedded" size="small" color="success" />
                      ) : (
                        <Chip label="Pending" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      {example.has_template ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No template
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateWorkflow;
