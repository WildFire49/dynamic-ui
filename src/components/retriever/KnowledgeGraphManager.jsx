"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  TableChart as TableIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import fastKgService from "@/services/fastKgService";

const KnowledgeGraphManager = ({ connectionId, schema, kgStatus, onUpdate }) => {
  const [kgTables, setKgTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [changes, setChanges] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [tableToRemove, setTableToRemove] = useState(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load KG tables
      const kgResponse = await fastKgService.getKgTables(connectionId);
      if (kgResponse.data.success) {
        setKgTables(kgResponse.data.tables || []);
      }

      // Load all available tables
      const allResponse = await fastKgService.listTables(connectionId, schema);
      if (allResponse.data.success) {
        const all = allResponse.data.tables || [];
        setAvailableTables(all);
      }
    } catch (err) {
      console.error("Failed to load tables:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [connectionId, schema]);

  useEffect(() => {
    if (connectionId && schema) {
      loadTables();
    }
  }, [connectionId, schema, loadTables]);

  const handleDetectChanges = async () => {
    setDetecting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fastKgService.detectChanges(connectionId, schema);
      if (response.data.success) {
        setChanges(response.data);
        if (response.data.changes_detected) {
          setSyncDialogOpen(true);
        } else {
          setSuccess("No schema changes detected. Your KG is up to date!");
        }
      }
    } catch (err) {
      console.error("Failed to detect changes:", err);
      setError(err.message);
    } finally {
      setDetecting(false);
    }
  };

  const handleSyncSchema = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await fastKgService.syncSchema(connectionId, schema, {
        add_new_tables: true,
        add_new_columns: true,
        remove_deleted: false,
        generate_embeddings: true,
      });
      if (response.data.success) {
        setSuccess(response.data.summary);
        setSyncDialogOpen(false);
        setChanges(null);
        await loadTables();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Failed to sync schema:", err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddTables = async () => {
    if (selectedTables.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fastKgService.addMultipleTables(
        connectionId,
        selectedTables,
        schema,
        true
      );
      if (response.data.success) {
        setSuccess(`Successfully added ${response.data.tables_added} table(s)`);
        setSelectedTables([]);
        setAddDialogOpen(false);
        await loadTables();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Failed to add tables:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTable = async () => {
    if (!tableToRemove) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fastKgService.removeTable(
        connectionId,
        tableToRemove,
        schema,
        true
      );
      if (response.data.success) {
        setSuccess(`Successfully removed table: ${tableToRemove}`);
        setTableToRemove(null);
        setRemoveDialogOpen(false);
        await loadTables();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Failed to remove table:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openRemoveDialog = (tableName) => {
    setTableToRemove(tableName);
    setRemoveDialogOpen(true);
  };

  const getTablesNotInKg = () => {
    return availableTables.filter(
      (table) => !kgTables.includes(table.name)
    );
  };

  const filteredAvailableTables = getTablesNotInKg().filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTableToggle = (tableName) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };

  return (
    <Box>
      {/* Header Actions */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadTables}
          disabled={loading}
          sx={{
            bgcolor: "#0078d7",
            "&:hover": { bgcolor: "#005a9e" },
          }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={handleDetectChanges}
          disabled={detecting}
          sx={{
            bgcolor: "#48bb78",
            "&:hover": { bgcolor: "#38a169" },
          }}
        >
          {detecting ? "Detecting..." : "Detect Changes"}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          disabled={loading}
          sx={{
            bgcolor: "#9c27b0",
            "&:hover": { bgcolor: "#7b1fa2" },
          }}
        >
          Add Tables
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#0078d715", border: "1px solid #0078d740" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TableIcon sx={{ color: "#0078d7" }} />
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Tables in KG
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#0078d7" }}>
                {kgTables.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#48bb7815", border: "1px solid #48bb7840" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TableIcon sx={{ color: "#48bb78" }} />
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Available Tables
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#48bb78" }}>
                {availableTables.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#9c27b015", border: "1px solid #9c27b040" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <AddIcon sx={{ color: "#9c27b0" }} />
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Not in KG
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#9c27b0" }}>
                {getTablesNotInKg().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables in KG */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Tables in Knowledge Graph ({kgTables.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {kgTables.length === 0 ? (
            <Alert severity="info">No tables in knowledge graph</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Table Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kgTables.map((tableName) => (
                    <TableRow key={tableName} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TableIcon sx={{ fontSize: 18, color: "#0078d7" }} />
                          {tableName}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove from KG">
                          <IconButton
                            size="small"
                            onClick={() => openRemoveDialog(tableName)}
                            sx={{ color: "#f56565" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Tables Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Tables to Knowledge Graph</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Alert severity="info" icon={<InfoIcon />}>
              Select tables to add to your knowledge graph. Selected: {selectedTables.length}
            </Alert>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        selectedTables.length === filteredAvailableTables.length &&
                        filteredAvailableTables.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTables(filteredAvailableTables.map((t) => t.name));
                        } else {
                          setSelectedTables([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Table Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Rows
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Columns
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAvailableTables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        {getTablesNotInKg().length === 0
                          ? "All tables are already in the knowledge graph"
                          : "No tables found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAvailableTables.map((table) => (
                    <TableRow
                      key={table.name}
                      hover
                      selected={selectedTables.includes(table.name)}
                      onClick={() => handleTableToggle(table.name)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedTables.includes(table.name)} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TableIcon sx={{ fontSize: 18, color: "#9c27b0" }} />
                          {table.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {table.row_count?.toLocaleString() || "—"}
                      </TableCell>
                      <TableCell align="right">{table.column_count || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTables}
            disabled={selectedTables.length === 0 || loading}
            startIcon={<AddIcon />}
          >
            {loading ? "Adding..." : `Add ${selectedTables.length} Table(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Table Dialog */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle>Remove Table from KG</DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Are you sure you want to remove <strong>{tableToRemove}</strong> from the knowledge graph?
            This will also remove associated embeddings.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveTable}
            disabled={loading}
            startIcon={<DeleteIcon />}
          >
            {loading ? "Removing..." : "Remove Table"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync Schema Dialog */}
      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schema Changes Detected</DialogTitle>
        <DialogContent>
          {changes && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                {changes.summary}
              </Alert>
              
              {changes.new_tables && changes.new_tables.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    New Tables ({changes.new_tables.length}):
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {changes.new_tables.map((table) => (
                      <Chip
                        key={table}
                        label={table}
                        size="small"
                        sx={{ bgcolor: "#48bb7815", color: "#48bb78" }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {changes.new_columns && Object.keys(changes.new_columns).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    New Columns:
                  </Typography>
                  {Object.entries(changes.new_columns).map(([table, columns]) => (
                    <Box key={table} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {table}:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {columns.map((col) => (
                          <Chip
                            key={col}
                            label={col}
                            size="small"
                            sx={{ bgcolor: "#0078d715", color: "#0078d7", fontSize: "0.7rem" }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Alert severity="success" icon={<CheckIcon />}>
                Click sync to automatically update your knowledge graph with these changes.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSyncSchema}
            disabled={syncing}
            startIcon={<SyncIcon />}
            sx={{ bgcolor: "#48bb78", "&:hover": { bgcolor: "#38a169" } }}
          >
            {syncing ? "Syncing..." : "Sync Schema"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeGraphManager;
