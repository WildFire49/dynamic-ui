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
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../../contexts/AuthContext";
import useRetrieverStore from "../../../../store/retrieverStore";
import fastKgService from "../../../../services/fastKgService";

const TrainingDirectoryPage = () => {
  const { user } = useAuth();
  const { currentConnection, savedConnections } = useRetrieverStore();
  
  const [loading, setLoading] = useState(false);
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedSql, setSelectedSql] = useState(null);

  useEffect(() => {
    if (currentConnection?.id) {
      fetchTrainingDirectory();
    }
  }, [currentConnection]);

  useEffect(() => {
    filterTrainingData();
  }, [searchQuery, filterBy, trainingData]);

  const fetchTrainingDirectory = async () => {
    if (!currentConnection?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fastKgService.getTrainingDirectory(
        currentConnection.id,
        200,
        filterBy === "my_queries" ? user?.username || user?.userId : null
      );
      
      setTrainingData(response.data.queries || []);
    } catch (err) {
      console.error("Error fetching training directory:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterTrainingData = () => {
    let filtered = [...trainingData];

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (query) =>
          query.natural_language_query
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          query.generated_sql
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
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

  const handleExportToCSV = () => {
    const csv = [
      ["Query ID", "Natural Language Query", "Generated SQL", "Marked By", "Marked At"],
      ...filteredData.map((query) => [
        query.id,
        query.natural_language_query,
        query.generated_sql,
        query.marked_by,
        new Date(query.marked_correct_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-directory-${Date.now()}.csv`;
    a.click();
  };

  const displayedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 4, height: "100%", overflow: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          📚 Training Directory
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Queries marked as correct for training the AI model
        </Typography>
      </Box>

      {/* Filters & Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search queries or SQL..."
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
            <InputLabel>Filter By</InputLabel>
            <Select
              value={filterBy}
              label="Filter By"
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <MenuItem value="all">All Queries</MenuItem>
              <MenuItem value="my_queries">My Queries</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh">
            <IconButton onClick={fetchTrainingDirectory} disabled={loading}>
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
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Chip
            label={`Total: ${filteredData.length}`}
            color="primary"
            variant="outlined"
          />
          {filterBy === "my_queries" && (
            <Chip
              label={`My Contributions: ${filteredData.length}`}
              color="success"
              variant="outlined"
            />
          )}
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

      {/* Training Directory Table */}
      {!loading && (
        <Paper sx={{ overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Natural Language Query</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SQL Query</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Marked By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">
                        {searchQuery
                          ? "No queries match your search"
                          : "No training data available"}
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
                      </TableCell>
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Box
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            bgcolor: "#f8fafc",
                            p: 1,
                            borderRadius: 1,
                            maxHeight: 100,
                            overflow: "auto",
                          }}
                        >
                          {query.generated_sql}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<PersonIcon />}
                          label={query.marked_by}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CalendarIcon />}
                          label={new Date(
                            query.marked_correct_at
                          ).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Full SQL">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedSql(query.generated_sql)}
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

      {/* SQL Viewer Dialog (Simple) */}
      {selectedSql && (
        <Paper
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 800,
            maxHeight: "80vh",
            overflow: "auto",
            p: 3,
            zIndex: 1300,
            boxShadow: 24,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">SQL Query</Typography>
            <Button onClick={() => setSelectedSql(null)}>Close</Button>
          </Box>
          <Box
            sx={{
              fontFamily: "monospace",
              fontSize: "0.9rem",
              bgcolor: "#f8fafc",
              p: 2,
              borderRadius: 1,
              whiteSpace: "pre-wrap",
            }}
          >
            {selectedSql}
          </Box>
        </Paper>
      )}

      {/* Backdrop for SQL Viewer */}
      {selectedSql && (
        <Box
          onClick={() => setSelectedSql(null)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1299,
          }}
        />
      )}
    </Box>
  );
};

export default TrainingDirectoryPage;
