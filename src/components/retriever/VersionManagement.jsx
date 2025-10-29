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
  Rocket,
  Undo,
  Compare,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Engineering,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";

const VersionManagement = ({
  connectionId,
  userId = "admin@company.com",
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareResult, setCompareResult] = useState(null);

  const [newVersion, setNewVersion] = useState({
    version_name: "",
    description: "",
  });

  const [rollbackData, setRollbackData] = useState({
    target_version_id: "",
    rollback_reason: "",
  });

  useEffect(() => {
    if (connectionId) {
      loadVersions();
    }
  }, [connectionId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryLearningService.listVersions(connectionId);
      setVersions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    setError(null);
    setSuccess(null);
    try {
      await queryLearningService.createVersion(
        connectionId,
        newVersion.version_name,
        newVersion.description,
        userId
      );
      setSuccess("Version created successfully");
      setCreateDialogOpen(false);
      loadVersions();
      setNewVersion({ version_name: "", description: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeployVersion = async (versionId, versionName) => {
    if (
      !confirm(
        `Deploy version "${versionName}"? This will replace the current active version.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await queryLearningService.deployVersion(versionId, userId);
      setSuccess(`Version "${versionName}" deployed successfully`);
      loadVersions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await queryLearningService.rollbackVersion(
        connectionId,
        rollbackData.target_version_id,
        userId,
        rollbackData.rollback_reason
      );
      setSuccess(result.message);
      setRollbackDialogOpen(false);
      loadVersions();
      setRollbackData({ target_version_id: "", rollback_reason: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareVersions = async (version1Id, version2Id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryLearningService.compareVersions(
        connectionId,
        version1Id,
        version2Id
      );
      setCompareResult(result.comparison);
      setCompareDialogOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "draft":
        return <Engineering sx={{ fontSize: 16 }} />;
      case "testing":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case "deprecated":
        return <Cancel sx={{ fontSize: 16 }} />;
      case "rolled_back":
        return <Undo sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "#d1fae5", color: "#065f46" };
      case "draft":
        return { bg: "#e0e7ff", color: "#4338ca" };
      case "testing":
        return { bg: "#fef3c7", color: "#92400e" };
      case "deprecated":
        return { bg: "#f3f4f6", color: "#374151" };
      case "rolled_back":
        return { bg: "#fee2e2", color: "#991b1b" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  const formatPercentage = (value) =>
    value ? `${(value * 100).toFixed(0)}%` : "N/A";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const activeVersion = versions.find((v) => v.status === "active");

  if (loading && versions.length === 0) {
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
        <Box>
          <Typography variant="h5" fontWeight="600">
            Version Management
          </Typography>
          {activeVersion && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Current Version: <strong>{activeVersion.version_name}</strong> (
              {formatNumber(activeVersion.total_embeddings)} embeddings)
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadVersions}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Create Version
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

      {/* Versions Table */}
      <TableContainer
        component={Paper}
        sx={{ border: "1px solid #e2e8f0", boxShadow: "none" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f8fafc" }}>
              <TableCell>
                <strong>Version</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Embeddings</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Accuracy</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Deployed</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No versions found. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              versions.map((version) => {
                const statusStyle = getStatusColor(version.status);
                return (
                  <TableRow
                    key={version.id}
                    sx={{
                      "&:hover": { background: "#f8fafc" },
                      transition: "background 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        v{version.version_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {version.version_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {version.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatNumber(version.total_embeddings)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ color: "#48bb78" }}
                      >
                        {formatPercentage(version.test_accuracy_score)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(version.status)}
                        label={version.status}
                        size="small"
                        sx={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontSize={12}>
                          {formatDate(version.deployed_at)}
                        </Typography>
                        {version.deployed_by && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize={11}
                          >
                            by {version.deployed_by}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}
                      >
                        {version.status !== "active" && (
                          <Tooltip title="Deploy Version">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeployVersion(
                                  version.id,
                                  version.version_name
                                )
                              }
                              disabled={loading}
                            >
                              <Rocket sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {activeVersion && version.id !== activeVersion.id && (
                          <Tooltip title="Compare with Active">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCompareVersions(activeVersion.id, version.id)
                              }
                              disabled={loading}
                            >
                              <Compare sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {version.status === "active" && versions.length > 1 && (
                          <Tooltip title="Rollback">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setRollbackDialogOpen(true);
                                setSelectedVersion(version);
                              }}
                              disabled={loading}
                            >
                              <Undo sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Version Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Version</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Version Name"
              placeholder="v1.2-october-update"
              value={newVersion.version_name}
              onChange={(e) =>
                setNewVersion({ ...newVersion, version_name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              placeholder="Added 30 new disbursement examples"
              value={newVersion.description}
              onChange={(e) =>
                setNewVersion({ ...newVersion, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateVersion}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Create Version
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog
        open={rollbackDialogOpen}
        onClose={() => setRollbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rollback Version</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will deactivate the current version and activate the selected
            target version.
          </Alert>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Target Version"
              value={rollbackData.target_version_id}
              onChange={(e) =>
                setRollbackData({
                  ...rollbackData,
                  target_version_id: e.target.value,
                })
              }
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a version</option>
              {versions
                .filter((v) => v.status !== "active")
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version_name} (v{v.version_number})
                  </option>
                ))}
            </TextField>
            <TextField
              label="Rollback Reason"
              placeholder="Explain why you're rolling back..."
              value={rollbackData.rollback_reason}
              onChange={(e) =>
                setRollbackData({
                  ...rollbackData,
                  rollback_reason: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRollback}
            color="error"
            disabled={
              !rollbackData.target_version_id || !rollbackData.rollback_reason
            }
          >
            Rollback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version Comparison</DialogTitle>
        <DialogContent>
          {compareResult && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, mb: 2, background: "#f8fafc" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Versions
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Chip
                    label={`v${compareResult.version1.version_number}: ${compareResult.version1.version_name}`}
                    color="primary"
                  />
                  <Typography variant="body2">vs</Typography>
                  <Chip
                    label={`v${compareResult.version2.version_number}: ${compareResult.version2.version_name}`}
                    color="secondary"
                  />
                </Box>
              </Paper>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Changes
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip
                  label={`${compareResult.examples_added?.length || 0} Added`}
                  size="small"
                  sx={{ background: "#d1fae5", color: "#065f46" }}
                />
                <Chip
                  label={`${compareResult.examples_removed?.length || 0} Removed`}
                  size="small"
                  sx={{ background: "#fee2e2", color: "#991b1b" }}
                />
                <Chip
                  label={`${compareResult.examples_modified?.length || 0} Modified`}
                  size="small"
                  sx={{ background: "#fef3c7", color: "#92400e" }}
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Metrics Comparison
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Metric</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Version 1</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Version 2</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Examples</TableCell>
                      <TableCell align="right">
                        {compareResult.metrics_comparison?.v1_total}
                      </TableCell>
                      <TableCell align="right">
                        {compareResult.metrics_comparison?.v2_total}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Accuracy</TableCell>
                      <TableCell align="right">
                        {formatPercentage(
                          compareResult.metrics_comparison?.v1_accuracy
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatPercentage(
                          compareResult.metrics_comparison?.v2_accuracy
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersionManagement;
