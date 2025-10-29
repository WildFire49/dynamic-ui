"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Refresh,
  Add,
  Edit,
  Delete,
  Rocket,
  Undo,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";

const AuditLog = ({ connectionId }) => {
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({
    entity_type: "",
    change_type: "",
    since_date: "",
  });

  useEffect(() => {
    if (connectionId) {
      loadChangelog();
    }
  }, [connectionId, filters]);

  const loadChangelog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryLearningService.getChangelog(connectionId, {
        entityType: filters.entity_type || undefined,
        changeType: filters.change_type || undefined,
        sinceDate: filters.since_date || undefined,
        limit: 100,
      });
      setChangelog(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeIcon = (type) => {
    switch (type) {
      case "added":
      case "example_added":
      case "template_added":
        return <Add sx={{ fontSize: 16 }} />;
      case "updated":
      case "example_updated":
      case "template_updated":
        return <Edit sx={{ fontSize: 16 }} />;
      case "removed":
      case "example_removed":
      case "template_removed":
        return <Delete sx={{ fontSize: 16 }} />;
      case "deployed":
        return <Rocket sx={{ fontSize: 16 }} />;
      case "rolled_back":
        return <Undo sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getChangeTypeColor = (type) => {
    if (type.includes("added")) {
      return { bg: "#d1fae5", color: "#065f46" };
    }
    if (type.includes("updated")) {
      return { bg: "#e0e7ff", color: "#4338ca" };
    }
    if (type.includes("removed")) {
      return { bg: "#fee2e2", color: "#991b1b" };
    }
    if (type === "deployed") {
      return { bg: "#dbeafe", color: "#1e40af" };
    }
    if (type === "rolled_back") {
      return { bg: "#fef3c7", color: "#92400e" };
    }
    return { bg: "#f3f4f6", color: "#374151" };
  };

  const getEntityTypeColor = (type) => {
    switch (type) {
      case "example":
        return { bg: "#e0e7ff", color: "#4338ca" };
      case "template":
        return { bg: "#fce7f3", color: "#9f1239" };
      case "version":
        return { bg: "#dbeafe", color: "#1e40af" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const paginatedLogs = changelog.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && changelog.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Audit Log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track all changes to templates, examples, and versions
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            select
            label="Entity Type"
            value={filters.entity_type}
            onChange={(e) =>
              setFilters({ ...filters, entity_type: e.target.value })
            }
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="example">Example</MenuItem>
            <MenuItem value="template">Template</MenuItem>
            <MenuItem value="version">Version</MenuItem>
          </TextField>

          <TextField
            select
            label="Change Type"
            value={filters.change_type}
            onChange={(e) =>
              setFilters({ ...filters, change_type: e.target.value })
            }
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="added">Added</MenuItem>
            <MenuItem value="updated">Updated</MenuItem>
            <MenuItem value="removed">Removed</MenuItem>
            <MenuItem value="deployed">Deployed</MenuItem>
            <MenuItem value="rolled_back">Rolled Back</MenuItem>
          </TextField>

          <TextField
            label="Since Date"
            type="date"
            value={filters.since_date}
            onChange={(e) =>
              setFilters({ ...filters, since_date: e.target.value })
            }
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setFilters({ entity_type: "", change_type: "", since_date: "" });
              setPage(0);
            }}
            size="small"
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Audit Log Table */}
      <TableContainer
        component={Paper}
        sx={{ border: "1px solid #e2e8f0", boxShadow: "none" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f8fafc" }}>
              <TableCell>
                <strong>Timestamp</strong>
              </TableCell>
              <TableCell>
                <strong>Entity Type</strong>
              </TableCell>
              <TableCell>
                <strong>Change Type</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Reason</strong>
              </TableCell>
              <TableCell>
                <strong>Changed By</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No activity logs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => {
                const changeTypeStyle = getChangeTypeColor(log.change_type);
                const entityTypeStyle = getEntityTypeColor(log.entity_type);

                return (
                  <TableRow
                    key={log.id}
                    sx={{
                      "&:hover": { background: "#f8fafc" },
                      transition: "background 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontSize={12}>
                        {formatDate(log.changed_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.entity_type}
                        size="small"
                        sx={{
                          background: entityTypeStyle.bg,
                          color: entityTypeStyle.color,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getChangeTypeIcon(log.change_type)}
                        label={log.change_type.replace("_", " ")}
                        size="small"
                        sx={{
                          background: changeTypeStyle.bg,
                          color: changeTypeStyle.color,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.impact_description}
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
                        {log.change_reason || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize={12}>
                        {log.changed_by}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={changelog.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Summary Stats */}
      {changelog.length > 0 && (
        <Paper sx={{ p: 2, mt: 3, border: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Activities
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {changelog.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Examples
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {changelog.filter((l) => l.entity_type === "example").length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Templates
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {changelog.filter((l) => l.entity_type === "template").length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Versions
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {changelog.filter((l) => l.entity_type === "version").length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AuditLog;
