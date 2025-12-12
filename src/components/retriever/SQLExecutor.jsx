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
  DragIndicator as DragIcon,
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
  const [editorHeight, setEditorHeight] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const fetchedConnectionRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

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

  // Handle drag resize
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = editorHeight;
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - dragStartY.current;
      const newHeight = Math.min(Math.max(dragStartHeight.current + deltaY, 300), 800);
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

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
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Section - Fixed */}
      <Box sx={{ flexShrink: 0, p: 3, pb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#00bcd4", // Cyan color for light mode
            mb: 1,
          }}
        >
          SQL Executor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Execute raw SQL queries directly against your connected database
        </Typography>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Editor Section - Resizable Height */}
        <Paper
        elevation={0}
        sx={{
          mx: 3,
          mb: 2,
          flexShrink: 0,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          bgcolor: "#ffffff",
          height: editorHeight, // Dynamic resizable height
          transition: isDragging ? 'none' : 'height 0.2s ease-out',
        }}
      >
        {/* Editor Toolbar - Light Mode */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "#f8f9fa",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<StorageIcon sx={{ fontSize: 16 }} />}
              label={currentConnection?.connection_name || "Database"}
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1976d2",
                "& .MuiChip-icon": { color: "#1976d2" },
                fontWeight: 600,
                border: "none",
              }}
            />
            <Chip
              icon={<PlayIcon sx={{ fontSize: 16 }} />}
              label={`Executing on: ${executionSource === 'duckdb' ? 'DuckDB' : 'PostgreSQL'}`}
              deleteIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
              onDelete={handleOpenMenu}
              onClick={handleOpenMenu}
              size="small"
              sx={{
                bgcolor: executionSource === 'duckdb' ? "#f3e5f5" : "#fff3e0",
                color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00",
                "& .MuiChip-icon": { color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00" },
                "& .MuiChip-deleteIcon": { color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00" },
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: executionSource === 'duckdb' ? "#e1bee7" : "#ffe0b2",
                },
              }}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <MenuItem 
                onClick={() => handleChangeExecutionSource('duckdb')}
                selected={executionSource === 'duckdb'}
                sx={{
                  bgcolor: executionSource === 'duckdb' ? '#f3e5f5' : 'transparent',
                  '&:hover': {
                    bgcolor: '#f3e5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <PlayIcon sx={{ color: '#9c27b0' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="DuckDB" 
                  secondary="Faster for Query Execution (default)"
                  primaryTypographyProps={{ fontWeight: executionSource === 'duckdb' ? 600 : 400 }}
                />
                {executionSource === 'duckdb' && <CheckCircleIcon sx={{ color: '#9c27b0', ml: 1 }} />}
              </MenuItem>
              <MenuItem 
                onClick={() => handleChangeExecutionSource('postgres')}
                selected={executionSource === 'postgres'}
                sx={{
                  bgcolor: executionSource === 'postgres' ? '#fff3e0' : 'transparent',
                  '&:hover': {
                    bgcolor: '#fff3e0',
                  },
                }}
              >
                <ListItemIcon>
                  <PlayIcon sx={{ color: '#f57c00' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="PostgreSQL" 
                  secondary="Direct database execution"
                  primaryTypographyProps={{ fontWeight: executionSource === 'postgres' ? 600 : 400 }}
                />
                {executionSource === 'postgres' && <CheckCircleIcon sx={{ color: '#f57c00', ml: 1 }} />}
              </MenuItem>
            </Menu>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Copy Query">
              <IconButton size="small" onClick={handleCopy} sx={{ color: "text.secondary" }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear">
              <IconButton size="small" onClick={handleClear} sx={{ color: "text.secondary" }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Monaco Editor - Light Mode */}
        <Box sx={{ flex: 1, width: "100%", py: 1, overflow: "hidden" }}>
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={query}
            onChange={(value) => setQuery(value || "")}
            onMount={handleEditorDidMount}
            theme="light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </Box>

        {/* Actions Bar - Light Mode */}
        <Box
          sx={{
            p: 2,
            flexShrink: 0,
            bgcolor: "#f8f9fa",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
             <Typography variant="caption" component="div" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
                Press <Chip label="Cmd + Enter" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#e0e0e0' }} /> to execute
             </Typography>
          </Box>
          <Button
            id="execute-query-btn"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
            onClick={handleExecute}
            disabled={!query.trim() || loading}
            sx={{
              bgcolor: "#00bcd4",
              "&:hover": { bgcolor: "#00acc1" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,188,212,0.3)",
              color: "white"
            }}
          >
            {loading ? "Executing..." : "Execute Query"}
          </Button>
        </Box>

        {/* Drag Handle for Resizing */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            height: 6,
            width: "100%",
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.2) : "transparent",
            cursor: "ns-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
            "&:active": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <DragIcon 
            sx={{ 
              fontSize: 16, 
              color: isDragging ? "primary.main" : "text.disabled",
              transform: "rotate(90deg)",
              transition: "color 0.2s",
            }} 
          />
        </Box>
      </Paper>

      {/* Results Section */}
      {(result || error || executionStats) && (
        <Fade in timeout={500}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 3, pb: 6 }}>
            {/* Stats Cards */}
            {executionStats && !error && (
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    bgcolor: "#f0fdf4", // Light green
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "#4caf50",
                      borderRadius: "50%",
                      color: "white",
                      display: "flex",
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      STATUS
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="success.main">
                      Success
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    bgcolor: "#e3f2fd", // Light blue
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "#2196f3",
                      borderRadius: "50%",
                      color: "white",
                      display: "flex",
                    }}
                  >
                    <StorageIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      ROWS RETURNED
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                      {executionStats.rowCount}
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    bgcolor: "#fff3e0", // Light orange
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "#ff9800",
                      borderRadius: "50%",
                      color: "white",
                      display: "flex",
                    }}
                  >
                    <SpeedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      EXECUTION TIME
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="warning.main">
                      {executionStats.executionTime} ms
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            )}

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon fontSize="inherit" />}
                sx={{
                  borderRadius: 2,
                  bgcolor: "#ffebee",
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Execution Failed
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontFamily: "monospace" }}>
                  {error}
                </Typography>
              </Alert>
            )}

            {/* Results Grid */}
            {result && (
              <Box sx={{ width: "100%", minHeight: 500, mb: 4 }}>
                <EnhancedDataGrid
                  title="Query Results"
                  data={result}
                  height={500}
                  hideHeader={false}
                />
              </Box>
            )}
          </Box>
        </Fade>
      )}
      </Box>
    </Box>
  );
};

export default SQLExecutor;
