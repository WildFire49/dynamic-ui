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
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Clear as ClearIcon,
  ContentCopy as CopyIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import Editor from "@monaco-editor/react";
import EnhancedDataGrid from "@/components/widgets/EnhancedDataGrid";
import fastKgService from "@/services/fastKgService";
import useRetrieverStore from "@/store/retrieverStore";

const SQLExecutor = () => {
  const theme = useTheme();
  const { currentConnection } = useRetrieverStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const editorRef = useRef(null);

  const handleExecute = useCallback(async () => {
    if (!query.trim() || !currentConnection?.id) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setExecutionStats(null);

    try {
      const startTime = performance.now();
      const response = await fastKgService.executeSql(
        currentConnection.id,
        query
      );
      const endTime = performance.now();

      if (response.data.success) {
        setResult(response.data.results);
        setExecutionStats({
          rowCount: response.data.row_count,
          executionTime: response.data.execution_time_ms,
          totalTime: Math.round(endTime - startTime),
        });
      } else {
        setError(response.data.error || "Query execution failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred while executing the query");
    } finally {
      setLoading(false);
    }
  }, [query, currentConnection?.id]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add Command/Ctrl + Enter shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Trigger the execute button programmatically to handle latest state
      document.getElementById('execute-query-btn')?.click();
    });
  };

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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Section */}
      <Box>
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

      {/* Editor Section */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          bgcolor: "#ffffff",
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
            <Typography
              variant="caption"
              sx={{ 
                color: "text.secondary", 
                fontFamily: "monospace",
                bgcolor: alpha(theme.palette.action.hover, 0.05),
                px: 1,
                py: 0.5,
                borderRadius: 1
              }}
            >
              PostgreSQL / DuckDB Auto-switch
            </Typography>
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
        <Box sx={{ height: 350, width: "100%", py: 1 }}>
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
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
            onClick={handleExecute}
            disabled={loading || !query.trim()}
            sx={{
              bgcolor: "#00bcd4",
              "&:hover": { bgcolor: "#00acc1" },
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0, 188, 212, 0.3)",
              color: "white"
            }}
          >
            {loading ? "Executing..." : "Execute Query"}
          </Button>
        </Box>
      </Paper>

      {/* Results Section */}
      {(result || error || executionStats) && (
        <Fade in timeout={500}>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
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
                    <SuccessIcon fontSize="small" />
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
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  bgcolor: "white",
                }}
              >
                <EnhancedDataGrid
                  title="Query Results"
                  data={result}
                  height="100%"
                  hideHeader={false}
                />
              </Paper>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default SQLExecutor;
