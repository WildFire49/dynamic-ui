import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  PlayArrow as PlayIcon,
  Clear as ClearIcon,
  ContentCopy as CopyIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Error as ErrorIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Code as CodeIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";
import Editor from "@monaco-editor/react";
import EnhancedDataGrid from "@/components/widgets/EnhancedDataGrid";
import fastKgService from "@/services/fastKgService";
import useRetrieverStore from "@/store/retrieverStore";
import { useSnackbar } from "@/contexts/SnackbarContext";

const SQLExecutor = () => {
  const theme = useTheme();
  const { currentConnection, executionSource, setExecutionSource } = useRetrieverStore();
  const { showSuccess, showError } = useSnackbar();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const [schemaMetadata, setSchemaMetadata] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const fetchedConnectionRef = useRef(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangeExecutionSource = (source) => {
    console.log('🔄 Changing execution source to:', source);
    setExecutionSource(source);
    handleCloseMenu();
    showSuccess(`Execution source changed to ${source === 'duckdb' ? 'DuckDB' : 'PostgreSQL'}`);
  };

  // Log current execution source on mount
  React.useEffect(() => {
    console.log('📊 SQL Executor - Current execution source from store:', executionSource);
  }, []);

  // Auto-collapse editor when results are shown
  React.useEffect(() => {
    if (result && !editorCollapsed) {
      setEditorCollapsed(true);
    }
  }, [result]);

  // Download results as CSV
  const handleDownloadCSV = useCallback(() => {
    if (!result || result.length === 0) return;
    
    const headers = Object.keys(result[0]);
    const csvContent = [
      headers.join(','),
      ...result.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess('Results downloaded as CSV');
  }, [result, showSuccess]);

  // Fetch schema metadata for autocomplete
  React.useEffect(() => {
    const fetchSchemaMetadata = async () => {
      if (!currentConnection?.id) return;
      
      // Prevent duplicate fetches for the same connection
      if (fetchedConnectionRef.current === currentConnection.id) return;
      
      fetchedConnectionRef.current = currentConnection.id;
      
      try {
        const response = await fastKgService.getSchemaMetadata(currentConnection.id);
        if (response.data.success) {
          setSchemaMetadata(response.data);
          showSuccess("Schema metadata loaded successfully");
        } else {
          showError(response.data.error || "Failed to load schema metadata");
          fetchedConnectionRef.current = null;
        }
      } catch (err) {
        console.error("Failed to fetch schema metadata:", err);
        const errorMsg = err.response?.data?.detail || err.message || "Failed to load schema metadata";
        showError(errorMsg);
        // Reset ref on error so it can retry
        fetchedConnectionRef.current = null;
      }
    };

    fetchSchemaMetadata();
  }, [currentConnection?.id]);

  const handleExecute = useCallback(async () => {
    if (!query.trim() || !currentConnection?.id) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setExecutionStats(null);

    try {
      console.log('🚀 SQL Executor - Execution Source:', executionSource);
      const startTime = performance.now();
      const response = await fastKgService.executeSql(
        currentConnection.id,
        query,
        executionSource // Pass execution source (postgres or duckdb)
      );
      const endTime = performance.now();

      if (response.data.success) {
        setResult(response.data.results);
        setExecutionStats({
          rowCount: response.data.row_count,
          executionTime: response.data.execution_time_ms,
          totalTime: Math.round(endTime - startTime),
        });
        showSuccess(
          `Query executed successfully! ${response.data.row_count} rows returned in ${response.data.execution_time_ms}ms`,
          5000
        );
      } else {
        // Prefer backend-provided detail or error message when success=false
        const errorMsg =
          response.data.detail ||
          response.data.error ||
          "Query execution failed";
        setError(errorMsg);
        showError(errorMsg, 6000);
      }
    } catch (err) {
      // Prefer rich error info from apiClient (detail & data) when available
      const errorMsg =
        err.detail ||
        err.data?.detail ||
        err.data?.message ||
        err.message ||
        "An error occurred while executing the query";

      setError(errorMsg);
      showError(errorMsg, 6000);
    } finally {
      setLoading(false);
    }
  }, [query, currentConnection?.id, executionSource, showSuccess, showError]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Add Command/Ctrl + Enter shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Trigger the execute button programmatically to handle latest state
      document.getElementById('execute-query-btn')?.click();
    });
  };

  // Register autocomplete provider when schema metadata is available
  React.useEffect(() => {
    if (!monacoRef.current || !schemaMetadata) return;

    const monaco = monacoRef.current;

    // Register custom autocomplete provider for SQL
    const disposable = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        if (!schemaMetadata || !schemaMetadata.tables) {
          return { suggestions: [] };
        }

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [];

        // Get text before cursor to determine context
        const textBeforeCursor = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Check if we're after FROM, JOIN, or UPDATE keywords (table context)
        const tableContext = /\b(FROM|JOIN|UPDATE|INTO)\s+\w*$/i.test(textBeforeCursor);
        
        // Check if we're after a table name followed by a dot (column context)
        const columnContext = /\b(\w+)\.\w*$/.test(textBeforeCursor);
        const tableMatch = textBeforeCursor.match(/\b(\w+)\.\w*$/);
        const contextTableName = tableMatch ? tableMatch[1] : null;

        if (tableContext) {
          // Suggest table names
          schemaMetadata.tables.forEach((table) => {
            suggestions.push({
              label: table.name,
              kind: monaco.languages.CompletionItemKind.Class,
              detail: `Table (${table.columns?.length || 0} columns)`,
              documentation: `Schema: ${schemaMetadata.schema}`,
              insertText: table.name,
              range: range,
            });
          });
        } else if (columnContext && contextTableName) {
          // Suggest columns for specific table
          const table = schemaMetadata.tables.find(
            (t) => t.name.toLowerCase() === contextTableName.toLowerCase()
          );
          
          if (table && table.columns) {
            table.columns.forEach((column) => {
              suggestions.push({
                label: column.name,
                kind: monaco.languages.CompletionItemKind.Field,
                detail: column.type,
                documentation: `Column in ${table.name}`,
                insertText: column.name,
                range: range,
              });
            });
          }
        } else {
          // General context: suggest both tables and common SQL keywords
          // Add table suggestions
          schemaMetadata.tables.forEach((table) => {
            suggestions.push({
              label: table.name,
              kind: monaco.languages.CompletionItemKind.Class,
              detail: `Table (${table.columns?.length || 0} columns)`,
              documentation: `Schema: ${schemaMetadata.schema}`,
              insertText: table.name,
              range: range,
              sortText: `1_${table.name}`, // Tables appear first
            });
          });

          // Add all columns from all tables
          schemaMetadata.tables.forEach((table) => {
            if (table.columns) {
              table.columns.forEach((column) => {
                suggestions.push({
                  label: `${table.name}.${column.name}`,
                  kind: monaco.languages.CompletionItemKind.Field,
                  detail: `${column.type} (${table.name})`,
                  documentation: `Column in ${table.name}`,
                  insertText: `${table.name}.${column.name}`,
                  range: range,
                  sortText: `2_${table.name}_${column.name}`, // Columns appear after tables
                });
              });
            }
          });
        }

        return { suggestions };
      },
    });

    // Cleanup on unmount or when schema changes
    return () => disposable.dispose();
  }, [schemaMetadata]);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setError(null);
    setExecutionStats(null);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Section - Fixed */}
      <Box sx={{ flexShrink: 0, px: 3, pt: 2, pb: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#00bcd4",
            mb: 0.5,
          }}
        >
          SQL Executor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Execute raw SQL queries directly against your connected database
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: "auto", 
        display: "flex", 
        flexDirection: "column",
        px: 3,
        pb: 3,
        gap: 2,
      }}>
        {/* Collapsible Editor Section */}
        <Paper
          elevation={0}
          sx={{
            flexShrink: 0,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          {/* Editor Header - Always Visible */}
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: "#f8f9fa",
              borderBottom: editorCollapsed ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => setEditorCollapsed(!editorCollapsed)}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton 
                size="small" 
                sx={{ 
                  p: 0.5,
                  bgcolor: alpha("#00bcd4", 0.1),
                  color: "#00bcd4",
                }}
              >
                <CodeIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                SQL Editor
              </Typography>
              {editorCollapsed && query && (
                <Chip 
                  label={`${query.split('\n').length} lines`} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: alpha("#00bcd4", 0.1),
                    color: "#00bcd4",
                  }} 
                />
              )}
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center" onClick={(e) => e.stopPropagation()}>
              <Chip
                icon={<StorageIcon sx={{ fontSize: 14 }} />}
                label={currentConnection?.connection_name || "Database"}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: "#e3f2fd",
                  color: "#1976d2",
                  "& .MuiChip-icon": { color: "#1976d2" },
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
              <Chip
                icon={<PlayIcon sx={{ fontSize: 14 }} />}
                label={executionSource === 'duckdb' ? 'DuckDB' : 'PostgreSQL'}
                deleteIcon={<ArrowDownIcon sx={{ fontSize: 16 }} />}
                onDelete={handleOpenMenu}
                onClick={handleOpenMenu}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: executionSource === 'duckdb' ? "#f3e5f5" : "#fff3e0",
                  color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00",
                  "& .MuiChip-icon": { color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00" },
                  "& .MuiChip-deleteIcon": { color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00" },
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  cursor: "pointer",
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
              >
                <MenuItem 
                  onClick={() => handleChangeExecutionSource('duckdb')}
                  selected={executionSource === 'duckdb'}
                >
                  <ListItemIcon><PlayIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                  <ListItemText primary="DuckDB" secondary="Faster execution" />
                  {executionSource === 'duckdb' && <CheckCircleIcon sx={{ color: '#9c27b0', ml: 1 }} />}
                </MenuItem>
                <MenuItem 
                  onClick={() => handleChangeExecutionSource('postgres')}
                  selected={executionSource === 'postgres'}
                >
                  <ListItemIcon><PlayIcon sx={{ color: '#f57c00' }} /></ListItemIcon>
                  <ListItemText primary="PostgreSQL" secondary="Direct execution" />
                  {executionSource === 'postgres' && <CheckCircleIcon sx={{ color: '#f57c00', ml: 1 }} />}
                </MenuItem>
              </Menu>
              <Tooltip title="Copy Query">
                <IconButton size="small" onClick={handleCopy} sx={{ color: "text.secondary" }}>
                  <CopyIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear">
                <IconButton size="small" onClick={handleClear} sx={{ color: "text.secondary" }}>
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); setEditorCollapsed(!editorCollapsed); }}
                sx={{ color: "text.secondary" }}
              >
                {editorCollapsed ? <ArrowDownIcon /> : <ArrowUpIcon />}
              </IconButton>
            </Stack>
          </Box>

          {/* Collapsible Editor Content */}
          <Collapse in={!editorCollapsed}>
            <Box sx={{ height: 250, width: "100%" }}>
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={(value) => setQuery(value || "")}
                onMount={handleEditorDidMount}
                theme="light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Fira Code', monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            </Box>
            
            {/* Actions Bar */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f8f9fa",
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                Press <Chip label="Cmd + Enter" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#e0e0e0' }} /> to execute
              </Typography>
              <Button
                id="execute-query-btn"
                variant="contained"
                size="small"
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <PlayIcon />}
                onClick={handleExecute}
                disabled={!query.trim() || loading}
                sx={{
                  bgcolor: "#00bcd4",
                  "&:hover": { bgcolor: "#00acc1" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  borderRadius: 1.5,
                  fontSize: "0.8rem",
                }}
              >
                {loading ? "Executing..." : "Execute"}
              </Button>
            </Box>
          </Collapse>
        </Paper>

        {/* Results Section */}
        {(result || error || executionStats) && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Stats Row */}
            {executionStats && !error && (
              <Stack 
                direction="row" 
                spacing={1.5}
                sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
              >
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="Success"
                  size="small"
                  sx={{
                    bgcolor: "#e8f5e9",
                    color: "#2e7d32",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#2e7d32" },
                  }}
                />
                <Chip
                  icon={<StorageIcon sx={{ fontSize: 16 }} />}
                  label={`${executionStats.rowCount} rows`}
                  size="small"
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#1565c0" },
                  }}
                />
                <Chip
                  icon={<SpeedIcon sx={{ fontSize: 16 }} />}
                  label={`${executionStats.executionTime} ms`}
                  size="small"
                  sx={{
                    bgcolor: "#fff3e0",
                    color: "#e65100",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#e65100" },
                  }}
                />
                {result && result.length > 0 && (
                  <Tooltip title="Download as CSV">
                    <Chip
                      icon={<DownloadIcon sx={{ fontSize: 16 }} />}
                      label="Download CSV"
                      size="small"
                      onClick={handleDownloadCSV}
                      sx={{
                        bgcolor: "#f3e5f5",
                        color: "#7b1fa2",
                        fontWeight: 600,
                        cursor: "pointer",
                        "& .MuiChip-icon": { color: "#7b1fa2" },
                        "&:hover": { bgcolor: "#e1bee7" },
                      }}
                    />
                  </Tooltip>
                )}
              </Stack>
            )}

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon fontSize="inherit" />}
                sx={{
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Execution Failed
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {error}
                </Typography>
              </Alert>
            )}

            {/* Results Grid - Takes remaining space */}
            {result && (
              <Paper
                elevation={0}
                sx={{ 
                  flex: 1,
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  overflow: "hidden",
                }}
              >
                {/* Results Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: "#f8f9fa",
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StorageIcon sx={{ fontSize: 18, color: "#00bcd4" }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Query Results
                    </Typography>
                    <Chip 
                      label={`${result.length} records`} 
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: alpha("#00bcd4", 0.1),
                        color: "#00bcd4",
                      }} 
                    />
                  </Stack>
                  <Tooltip title="Download as CSV">
                    <IconButton size="small" onClick={handleDownloadCSV} sx={{ color: "#7b1fa2" }}>
                      <DownloadIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {/* DataGrid Container */}
                <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                  <EnhancedDataGrid
                    title=""
                    data={result}
                    height="100%"
                    hideHeader={true}
                  />
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SQLExecutor;
