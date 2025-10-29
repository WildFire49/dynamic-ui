"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Edit,
  Refresh,
  Code,
  TrendingUp,
  CheckCircle,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";

const LearnedExamples = ({ connectionId }) => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const [editForm, setEditForm] = useState({
    business_logic: "",
    tags: "",
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (connectionId) {
      loadExamples();
    }
  }, [connectionId]);

  const loadExamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryLearningService.listExamples(connectionId, {
        limit: 100,
      });
      setExamples(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await queryLearningService.searchExamples(
        connectionId,
        searchQuery,
        5
      );
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExample = (example) => {
    setSelectedExample(example);
    setEditForm({
      business_logic: example.business_logic || "",
      tags: example.tags?.join(", ") || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedExample) return;

    setLoading(true);
    setError(null);
    try {
      await queryLearningService.updateExample(selectedExample.id, {
        business_logic: editForm.business_logic,
        tags: editForm.tags.split(",").map((t) => t.trim()),
      });
      setSuccess("Example updated successfully");
      setEditDialogOpen(false);
      loadExamples();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (example) => {
    setSelectedExample(example);
    setDetailDialogOpen(true);
  };

  const getComplexityColor = (level) => {
    switch (level) {
      case "simple":
        return { bg: "#d1fae5", color: "#065f46" };
      case "medium":
        return { bg: "#fef3c7", color: "#92400e" };
      case "complex":
        return { bg: "#fee2e2", color: "#991b1b" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(0)}%`;

  const displayExamples =
    searchResults?.results.map((r) => r.example) || examples;
  const paginatedExamples = displayExamples.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && examples.length === 0) {
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
          Learned Examples
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse and manage training examples
        </Typography>
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

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Semantic Search"
            placeholder="Search for similar examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSemanticSearch()}
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSemanticSearch}
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              minWidth: 120,
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setSearchQuery("");
              setSearchResults(null);
              loadExamples();
            }}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>

        {searchResults && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Found {searchResults.results.length} similar examples
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Examples Table */}
      <TableContainer
        component={Paper}
        sx={{ border: "1px solid #e2e8f0", boxShadow: "none" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f8fafc" }}>
              <TableCell>
                <strong>Question</strong>
              </TableCell>
              <TableCell>
                <strong>Tables Used</strong>
              </TableCell>
              <TableCell>
                <strong>Tags</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Complexity</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Usage</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Confidence</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExamples.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No examples found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedExamples.map((example, idx) => {
                const complexityStyle = getComplexityColor(
                  example.complexity_level
                );
                const similarity = searchResults?.results.find(
                  (r) => r.example.id === example.id
                )?.similarity_score;

                return (
                  <TableRow
                    key={example.id}
                    sx={{
                      "&:hover": { background: "#f8fafc" },
                      transition: "background 0.2s",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            "&:hover": { color: "#667eea" },
                          }}
                          onClick={() => handleViewDetails(example)}
                        >
                          {example.natural_language_question}
                        </Typography>
                        {similarity && (
                          <Chip
                            label={`${formatPercentage(similarity)} match`}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: 11,
                              background: "#d1fae5",
                              color: "#065f46",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {example.tables_used?.slice(0, 2).map((table, i) => (
                          <Chip
                            key={i}
                            label={table}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        ))}
                        {example.tables_used?.length > 2 && (
                          <Chip
                            label={`+${example.tables_used.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {example.tags?.slice(0, 2).map((tag, i) => (
                          <Chip
                            key={i}
                            label={tag}
                            size="small"
                            sx={{
                              background: "#e0e7ff",
                              color: "#4338ca",
                              height: 24,
                              fontSize: 11,
                            }}
                          />
                        ))}
                        {example.tags?.length > 2 && (
                          <Chip
                            label={`+${example.tags.length - 2}`}
                            size="small"
                            sx={{
                              background: "#f3f4f6",
                              color: "#6b7280",
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={example.complexity_level || "N/A"}
                        size="small"
                        sx={{
                          background: complexityStyle.bg,
                          color: complexityStyle.color,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 18, color: "#6b7280" }} />
                        <Typography variant="body2">
                          {example.usage_count || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ color: "#48bb78" }}
                      >
                        {formatPercentage(example.confidence_score || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                      >
                        <Tooltip title="View SQL">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(example)}
                          >
                            <Code sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditExample(example)}
                          >
                            <Edit sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={displayExamples.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Example</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Business Logic"
              value={editForm.business_logic}
              onChange={(e) =>
                setEditForm({ ...editForm, business_logic: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Tags (comma-separated)"
              value={editForm.tags}
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
              fullWidth
              helperText="Separate tags with commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Example Details</DialogTitle>
        <DialogContent>
          {selectedExample && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Question:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedExample.natural_language_question}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Generated SQL:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  mb: 2,
                  fontFamily: "monospace",
                  fontSize: 13,
                  overflow: "auto",
                }}
              >
                <pre style={{ margin: 0 }}>{selectedExample.generated_sql}</pre>
              </Paper>

              {selectedExample.business_logic && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Business Logic:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedExample.business_logic}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" gutterBottom>
                Metadata:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Chip
                  label={`Complexity: ${selectedExample.complexity_level}`}
                  size="small"
                />
                <Chip
                  label={`Usage: ${selectedExample.usage_count}`}
                  size="small"
                />
                <Chip
                  label={`Confidence: ${formatPercentage(
                    selectedExample.confidence_score || 0
                  )}`}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearnedExamples;
