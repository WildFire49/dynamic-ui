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
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../../contexts/AuthContext";
import useRetrieverStore from "../../../../store/retrieverStore";
import fastKgService from "../../../../services/fastKgService";

const QueryHistoryPage = () => {
  const { user } = useAuth();
  const { currentConnection } = useRetrieverStore();
  
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    if (currentConnection?.id) {
      fetchQueryHistory();
    }
  }, [currentConnection]);

  useEffect(() => {
    filterHistoryData();
  }, [searchQuery, statusFilter, historyData]);

  const fetchQueryHistory = async () => {
    if (!currentConnection?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fastKgService.getQueryHistory(
        currentConnection.id,
        200,
        user?.username || user?.userId
      );
      
      setHistoryData(response.data.queries || []);
    } catch (err) {
      console.error("Error fetching query history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterHistoryData = () => {
    let filtered = [...historyData];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((query) => {
        if (statusFilter === "success") return query.execution_status === "success";
        if (statusFilter === "error") return query.execution_status === "error";
        if (statusFilter === "corrected") return query.corrected_sql !== null;
        if (statusFilter === "marked_correct") return query.is_marked_correct;
        if (statusFilter === "generation_failed") return query.execution_status === "generation_failed";
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (query) =>
          query.natural_language_query
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          query.generated_sql
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          query.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (query) => {
    setSelectedQuery(query);
    setViewDialogOpen(true);
  };

  const handleExportToCSV = () => {
    const csv = [
      [
        "Query ID",
        "Natural Language Query",
        "Generated SQL",
        "Corrected SQL",
        "Status",
        "User ID",
        "Marked Correct",
        "Created At",
      ],
      ...filteredData.map((query) => [
        query.id,
        query.natural_language_query,
        query.generated_sql || "N/A",
        query.corrected_sql || "N/A",
        query.execution_status,
        query.user_id,
        query.is_marked_correct ? "Yes" : "No",
        new Date(query.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-history-${Date.now()}.csv`;
    a.click();
  };

  const getStatusChip = (query) => {
    if (query.is_marked_correct) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Marked Correct"
          color="success"
          size="small"
        />
      );
    }
    if (query.corrected_sql) {
      return (
        <Chip
          icon={<EditIcon />}
          label="Corrected"
          color="warning"
          size="small"
        />
      );
    }
    if (query.execution_status === "success") {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Success"
          color="success"
          size="small"
          variant="outlined"
        />
      );
    }
    if (query.execution_status === "error") {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="Error"
          color="error"
          size="small"
        />
      );
    }
    if (query.execution_status === "generation_failed") {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Generation Failed"
          color="error"
          size="small"
          variant="outlined"
        />
      );
    }
    return <Chip label="Unknown" size="small" />;
  };

  const displayedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const stats = {
    total: historyData.length,
    success: historyData.filter((q) => q.execution_status === "success").length,
    errors: historyData.filter((q) => q.execution_status === "error").length,
    marked: historyData.filter((q) => q.is_marked_correct).length,
    corrected: historyData.filter((q) => q.corrected_sql).length,
    generationFailed: historyData.filter((q) => q.execution_status === "generation_failed").length,
  };

  return (
    <Box sx={{ p: 4, height: "100%", overflow: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          📝 Query History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete history of all queries including failed attempts
        </Typography>
      </Box>

      {/* Filters & Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search queries, SQL, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Queries</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="error">Errors</MenuItem>
              <MenuItem value="generation_failed">Generation Failed</MenuItem>
              <MenuItem value="corrected">Corrected</MenuItem>
              <MenuItem value="marked_correct">Marked Correct</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh">
            <IconButton onClick={fetchQueryHistory} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportToCSV}
            disabled={filteredData.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
          <Chip
            label={`Total: ${stats.total}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Success: ${stats.success}`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Errors: ${stats.errors}`}
            color="error"
            variant="outlined"
          />
          <Chip
            label={`Generation Failed: ${stats.generationFailed}`}
            color="error"
            variant="filled"
          />
          <Chip
            label={`Marked Correct: ${stats.marked}`}
            color="success"
            variant="filled"
          />
          <Chip
            label={`Corrected: ${stats.corrected}`}
            color="warning"
            variant="filled"
          />
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Query History Table */}
      {!loading && (
        <Paper sx={{ overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Query</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SQL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">
                        {searchQuery || statusFilter !== "all"
                          ? "No queries match your filters"
                          : "No query history available"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedData.map((query) => (
                    <TableRow
                      key={query.id}
                      hover
                      sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                    >
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {query.natural_language_query}
                        </Typography>
                        {query.error_message && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            Error: {query.error_message.substring(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getStatusChip(query)}</TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        {query.generated_sql ? (
                          <Box
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              bgcolor: "#f8fafc",
                              p: 0.5,
                              borderRadius: 1,
                              maxHeight: 60,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {query.generated_sql.substring(0, 80)}...
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No SQL generated
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<PersonIcon />}
                          label={query.user_id || "Unknown"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CalendarIcon />}
                          label={new Date(query.created_at).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(query)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      )}

      {/* Query Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CodeIcon />
            <Typography variant="h6">Query Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedQuery && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Natural Language Query */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Natural Language Query
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "#f8fafc" }}>
                  <Typography>{selectedQuery.natural_language_query}</Typography>
                </Paper>
              </Box>

              {/* Generated SQL */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Generated SQL
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "#f8fafc" }}>
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      m: 0,
                    }}
                  >
                    {selectedQuery.generated_sql || "No SQL generated"}
                  </Typography>
                </Paper>
              </Box>

              {/* Corrected SQL (if exists) */}
              {selectedQuery.corrected_sql && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Corrected SQL
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "#fff3cd" }}>
                    <Typography
                      component="pre"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        whiteSpace: "pre-wrap",
                        m: 0,
                      }}
                    >
                      {selectedQuery.corrected_sql}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Error Message (if exists) */}
              {selectedQuery.error_message && (
                <Box>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                    Error Message
                  </Typography>
                  <Alert severity="error">{selectedQuery.error_message}</Alert>
                </Box>
              )}

              {/* Metadata */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {getStatusChip(selectedQuery)}
                <Chip
                  label={`User: ${selectedQuery.user_id || "Unknown"}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Date: ${new Date(selectedQuery.created_at).toLocaleString()}`}
                  size="small"
                  variant="outlined"
                />
                {selectedQuery.marked_by && (
                  <Chip
                    label={`Marked by: ${selectedQuery.marked_by}`}
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QueryHistoryPage;
