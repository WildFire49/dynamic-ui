import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Psychology as BrainIcon,
  Code as CodeIcon,
  Storage as DatabaseIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  BarChart as ChartIcon,
  TableChart as TableChartIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import fastKgService from "../../services/fastKgService";
import connectionService from "../../services/connectionService";
import useRetrieverStore from "../../store/retrieverStore";
import DynamicDataVisualization from "../mui/DynamicDataVisualization";
import { useAuth } from "../../contexts/AuthContext";

const SQLQueryGenerator = React.memo(() => {
  const { user } = useAuth();
  const { userId, savedConnections, setSavedConnections, currentConnection } =
    useRetrieverStore();

  // State
  const [selectedConnection, setSelectedConnection] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'chart'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [correctedSql, setCorrectedSql] = useState("");
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [testingCorrection, setTestingCorrection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [markingFeedback, setMarkingFeedback] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // SQL Keywords for syntax highlighting
  const SQL_KEYWORDS = [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "OUTER",
    "FULL",
    "ON",
    "AND",
    "OR",
    "NOT",
    "IN",
    "EXISTS",
    "BETWEEN",
    "LIKE",
    "IS",
    "NULL",
    "ORDER",
    "BY",
    "GROUP",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "DISTINCT",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "AS",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "TABLE",
    "INDEX",
    "VIEW",
    "UNION",
    "ALL",
    "WITH",
    "RECURSIVE",
    "CAST",
    "EXTRACT",
    "DATE",
    "TIMESTAMP",
    "INTERVAL",
    "TRUE",
    "FALSE",
  ];

  // Function to highlight SQL syntax
  const highlightSQL = (sql) => {
    if (!sql) return "";

    let highlightedSQL = sql;

    // First, protect strings from keyword replacement
    const stringPlaceholders = [];
    highlightedSQL = highlightedSQL.replace(/'([^']*)'/g, (match) => {
      stringPlaceholders.push(match);
      return `__STRING_${stringPlaceholders.length - 1}__`;
    });

    // Highlight keywords (from longest to shortest to avoid partial matches)
    const sortedKeywords = [...SQL_KEYWORDS].sort(
      (a, b) => b.length - a.length
    );
    sortedKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      highlightedSQL = highlightedSQL.replace(
        regex,
        `<span class="sql-keyword">${keyword.toUpperCase()}</span>`
      );
    });

    // Restore strings and highlight them
    stringPlaceholders.forEach((str, index) => {
      highlightedSQL = highlightedSQL.replace(
        `__STRING_${index}__`,
        `<span class="sql-string">${str}</span>`
      );
    });

    // Highlight numbers
    highlightedSQL = highlightedSQL.replace(
      /\b\d+(\.\d+)?\b/g,
      '<span class="sql-number">$&</span>'
    );

    return highlightedSQL;
  };

  // Load saved connections
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoadingConnections(true);
      const response = await connectionService.listConnections(userId);
      setSavedConnections(response.data || []);
    } catch (err) {
      console.error("Failed to load connections:", err);
      setError("Failed to load connections");
    } finally {
      setLoadingConnections(false);
    }
  };

  // Use currentConnection if available, otherwise use selected
  useEffect(() => {
    if (currentConnection?.id && !selectedConnection) {
      setSelectedConnection(currentConnection.id);
    }
  }, [currentConnection]);

  const handleMarkCorrect = async () => {
    if (!result?.query?.query_id || !currentConnection?.id) return;

    setMarkingFeedback(true);
    try {
      await fastKgService.markQueryCorrect(
        result.query.query_id,
        currentConnection.id,
        user?.username || user?.userId || "unknown",
        "Marked as correct from UI"
      );

      setSnackbar({
        open: true,
        message: "✅ Query marked as correct and added to training directory!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error marking query as correct:", err);
      setSnackbar({
        open: true,
        message: "Failed to mark query as correct",
        severity: "error",
      });
    } finally {
      setMarkingFeedback(false);
    }
  };

  const handleMarkWrong = () => {
    if (!result?.query?.generated_sql && !result?.sql) return;

    setCorrectedSql(result.query?.generated_sql || result.sql || "");
    setShowCorrectionDialog(true);
  };

  const handleTestCorrection = async () => {
    if (!correctedSql.trim() || !currentConnection?.id) return;

    setTestingCorrection(true);
    setTestResult(null);

    try {
      const response = await fastKgService.testCustomSql(
        currentConnection.id,
        correctedSql,
        user?.username || user?.userId || "unknown",
        false // Don't save to history yet
      );

      setTestResult(response.data);
    } catch (err) {
      console.error("Error testing SQL:", err);
      setTestResult({
        success: false,
        error: err.message,
      });
    } finally {
      setTestingCorrection(false);
    }
  };

  const handleSaveCorrection = async () => {
    if (
      !correctedSql.trim() ||
      !result?.query?.query_id ||
      !currentConnection?.id
    )
      return;

    setMarkingFeedback(true);
    try {
      await fastKgService.provideCorrectSql(
        result.query.query_id,
        currentConnection.id,
        correctedSql,
        user?.username || user?.userId || "unknown",
        correctionNotes
      );

      setSnackbar({
        open: true,
        message: "✅ Corrected SQL saved successfully!",
        severity: "success",
      });
      setShowCorrectionDialog(false);
      setCorrectedSql("");
      setCorrectionNotes("");
      setTestResult(null);
    } catch (err) {
      console.error("Error saving correction:", err);
      setSnackbar({
        open: true,
        message: "Failed to save correction",
        severity: "error",
      });
    } finally {
      setMarkingFeedback(false);
    }
  };

  const handleGenerateSQL = async () => {
    const connId = selectedConnection || currentConnection?.id;
    if (!connId || !query.trim()) {
      setError("Please select a connection and enter a query");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setPage(0);

      const connection =
        savedConnections.find((c) => c.id === connId) || currentConnection;
      if (!connection) {
        throw new Error("Connection not found");
      }

      // Use generateAndExecute to get SQL and results in one call
      const response = await fastKgService.generateAndExecute(
        connection.id,
        query,
        connection.schema_name || connection.schema || "public",
        true,
        user?.username || user?.userId || null
      );

      setResult(response.data);
    } catch (err) {
      console.error("Failed to generate and execute SQL:", err);
      setError(err.message || "Failed to generate and execute SQL");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = () => {
    if (result?.query?.generated_sql || result?.sql) {
      navigator.clipboard.writeText(result.query?.generated_sql || result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Ultra-optimized event handlers for lightning-fast typing (including backspace)
  const handleQueryChange = useCallback((e) => {
    const value = e.target.value;
    // Use React's batched updates for better performance
    setQuery(value);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerateSQL();
      }
    },
    [handleGenerateSQL]
  );

  // Optimized styles with performance-focused properties
  const textFieldStyles = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        fontSize: "1.1rem",
        lineHeight: 1.6,
        // Performance optimizations
        willChange: "contents",
        transform: "translateZ(0)", // Force GPU acceleration
      },
      "& .MuiInputLabel-root": {
        fontSize: "1rem",
      },
      "& textarea": {
        // Optimize textarea specifically for fast typing/backspace
        resize: "none",
        outline: "none",
        willChange: "contents",
        backfaceVisibility: "hidden",
        perspective: 1000,
      },
    }),
    []
  );

  const buttonStyles = useMemo(
    () => ({
      bgcolor: "#0078d7",
      "&:hover": { bgcolor: "#005a9e" },
      borderRadius: 2,
      px: 4,
      py: 1.5,
      fontSize: "1.1rem",
      fontWeight: 600,
    }),
    []
  );

  const newQueryButtonStyles = useMemo(
    () => ({
      borderRadius: 2,
      px: 4,
      py: 1.5,
      fontSize: "1.1rem",
      fontWeight: 600,
    }),
    []
  );

  // Memoized expensive computations to prevent re-renders on query changes
  const selectedConnectionDetails = useMemo(() => {
    return savedConnections.find((c) => c.id === selectedConnection);
  }, [savedConnections, selectedConnection]);

  const memoizedTransformResultsForVisualization = useMemo(() => {
    if (!result?.execution?.results) return null;

    return {
      analysis_result: {
        supporting_data: result.execution.results,
        summary: {
          total_records: result.execution.row_count,
          query: result.query?.natural_language || "",
          execution_time: result.execution.execution_time_ms,
        },
      },
      metadata: {
        query_id: result.query?.query_id,
        timestamp: result.timestamp,
        sql: result.query?.generated_sql || result.sql,
      },
    };
  }, [result]);

  // Memoized helper text to prevent recreation
  const helperText = useMemo(
    () =>
      "Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to generate and execute SQL",
    []
  );
  const placeholderText = useMemo(
    () =>
      "e.g., Show me all customers who got disbursed today in federal bank with their amounts",
    []
  );
  const labelText = useMemo(() => "Natural language query", []);

  // Memoized helper functions to prevent recalculation
  const hasValidQuery = useMemo(() => query.trim().length > 0, [query]);
  const canGenerate = useMemo(
    () => !loading && selectedConnection && hasValidQuery,
    [loading, selectedConnection, hasValidQuery]
  );

  // Memoize the results section to prevent re-renders when query changes
  const resultsSection = useMemo(() => {
    if (!result || loading) return null;

    return (
      <Fade in timeout={300}>
        <Box>
          {/* Success Message */}
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {result.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Query ID: {result.query_id} •{" "}
                  {new Date(result.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Alert>

          {/* Generated SQL */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CodeIcon sx={{ mr: 1.5, color: "#0078d7", fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1a202c" }}
                  >
                    Generated SQL Query
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Optimized query based on your natural language input
                  </Typography>
                </Box>
              </Box>
              <Tooltip title={copied ? "Copied!" : "Copy SQL"}>
                <IconButton
                  onClick={handleCopySQL}
                  sx={{
                    bgcolor: copied ? "#48bb7815" : "#0078d715",
                    color: copied ? "#48bb78" : "#0078d7",
                    "&:hover": {
                      bgcolor: copied ? "#48bb7825" : "#0078d725",
                    },
                  }}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                background: "#f8fafc",
                border: "2px solid #e2e8f0",
                borderRadius: 2,
                p: 3,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#1a202c",
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightSQL(
                    result.query?.generated_sql || result.sql
                  ),
                }}
              />
              <style>{`
                .sql-keyword {
                  color: #0078d7;
                  font-weight: 600;
                }
                .sql-string {
                  color: #48bb78;
                }
                .sql-number {
                  color: #ed8936;
                }
              `}</style>
            </Box>

            {/* Query Performance Info */}
            <Box sx={{ mt: 3, display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Chip
                label={`${result.execution?.row_count || 0} records returned`}
                sx={{
                  bgcolor:
                    result.execution?.row_count > 0 ? "#48bb7815" : "#ed893615",
                  color:
                    result.execution?.row_count > 0 ? "#48bb78" : "#ed8936",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Executed in ${
                  result.execution?.execution_time_ms || 0
                }ms`}
                sx={{
                  bgcolor: "#0078d715",
                  color: "#0078d7",
                  fontWeight: 600,
                }}
              />
              {result.performance?.total_time_ms && (
                <Chip
                  label={`Total time: ${result.performance.total_time_ms}ms`}
                  sx={{
                    bgcolor: "#64748b15",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Paper>

          {/* Data Visualization Results */}
          {result.execution && (
            <Paper
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #e2e8f0",
                  bgcolor: "#f8fafc",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ChartIcon
                      sx={{ mr: 1.5, color: "#9c27b0", fontSize: 28 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1a202c" }}
                      >
                        Data Visualization
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Interactive charts and insights from your query
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${result.execution.row_count} record${
                      result.execution.row_count !== 1 ? "s" : ""
                    }`}
                    sx={{
                      bgcolor:
                        result.execution.row_count > 0
                          ? "#48bb7815"
                          : "#ed893615",
                      color:
                        result.execution.row_count > 0 ? "#48bb78" : "#ed8936",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  p: 0,
                  overflow: "auto",
                  flex: 1,
                }}
              >
                {result.execution.results &&
                result.execution.results.length > 0 ? (
                  <DynamicDataVisualization
                    analysisResult={memoizedTransformResultsForVisualization}
                    loading={false}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", py: 8, px: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "#ed893615",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                      }}
                    >
                      <DatabaseIcon sx={{ fontSize: 40, color: "#ed8936" }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
                    >
                      No Data Found
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#64748b",
                        maxWidth: 400,
                        mx: "auto",
                        mb: 3,
                      }}
                    >
                      Your query executed successfully but returned no results.
                      Try adjusting your query parameters.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontFamily: "monospace",
                        bgcolor: "#f8fafc",
                        p: 2,
                        borderRadius: 1,
                        maxWidth: 600,
                        mx: "auto",
                      }}
                    >
                      Execution time: {result.execution.execution_time_ms}ms
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}

          {/* Reasoning Steps */}
          {result.reasoning && result.reasoning.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <BrainIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                  AI Reasoning Process
                </Typography>
              </Box>

              <Stepper orientation="vertical">
                {result.reasoning.map((step, index) => (
                  <Step key={index} active={true} completed={true}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: "primary.main",
                          "&.Mui-completed": { color: "success.main" },
                        },
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        Step {step.step}: {step.thought}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {step.reasoning}
                        </Typography>

                        {step.result && (
                          <Box
                            sx={{
                              background: "#f8fafc",
                              p: 2,
                              borderRadius: 1,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {step.result.question_type && (
                              <Chip
                                label={`Type: ${step.result.question_type}`}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                            )}

                            {step.result.tables && (
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  variant="caption"
                                  fontWeight="medium"
                                  color="text.secondary"
                                >
                                  Tables:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                    mt: 0.5,
                                  }}
                                >
                                  {step.result.tables.map((table, i) => (
                                    <Chip
                                      key={i}
                                      label={table}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {step.result.sql && (
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  variant="caption"
                                  fontWeight="medium"
                                  color="text.secondary"
                                >
                                  SQL Generated
                                </Typography>
                              </Box>
                            )}

                            {step.result.confidence && (
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={`Confidence: ${(
                                    step.result.confidence * 100
                                  ).toFixed(0)}%`}
                                  size="small"
                                  color="success"
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}
        </Box>
      </Fade>
    );
  }, [result, loading, copied, memoizedTransformResultsForVisualization]);

  const getSelectedConnectionDetails = () => {
    return savedConnections.find((c) => c.id === selectedConnection);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1a202c",
            fontSize: { xs: "1.75rem", md: "2.25rem" },
          }}
        >
          Ask Questions
        </Typography>
      </Box>

      {/* Connection Selection & Query Input */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Connection Selector */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
          >
            Database Connection
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Select Connection</InputLabel>
            <Select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              label="Select Connection"
              disabled={loadingConnections}
              startAdornment={
                <DatabaseIcon sx={{ mr: 1, color: "action.active" }} />
              }
            >
              {savedConnections.map((conn) => (
                <MenuItem key={conn.id} value={conn.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {conn.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conn.host}:{conn.port} / {conn.database_name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedConnection && (
            <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<DatabaseIcon />}
                label={`${
                  selectedConnectionDetails?.connection_name ||
                  selectedConnectionDetails?.name
                }`}
                sx={{
                  bgcolor: "#0078d715",
                  color: "#0078d7",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: "#0078d7" },
                }}
                size="small"
              />
              <Chip
                icon={<CheckIcon />}
                label={`Schema: ${
                  selectedConnectionDetails?.schema_name || "public"
                }`}
                sx={{
                  bgcolor: "#48bb7815",
                  color: "#48bb78",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: "#48bb78" },
                }}
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Query Input */}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
          >
            Ask Your Question
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label={labelText}
            placeholder={placeholderText}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            helperText={helperText}
            sx={textFieldStyles}
            InputProps={{
              // Disable spell check and autocomplete for better performance
              spellCheck: false,
              autoComplete: "off",
              autoCorrect: "off",
              autoCapitalize: "off",
              // Additional performance props
              inputProps: {
                style: {
                  // Force hardware acceleration
                  transform: "translateZ(0)",
                  willChange: "contents",
                  // Optimize for fast text editing
                  textRendering: "optimizeSpeed",
                },
              },
            }}
          />

          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateSQL}
              disabled={!canGenerate}
              startIcon={
                loading ? <CircularProgress size={20} /> : <PlayIcon />
              }
              sx={buttonStyles}
            >
              {loading ? "Analyzing..." : "Generate & Execute"}
            </Button>

            {result && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setResult(null);
                  setQuery("");
                  setError(null);
                }}
                startIcon={<RefreshIcon />}
                sx={newQueryButtonStyles}
              >
                New Query
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Error Section with SQL Correction */}
      {error && (
        <Paper
          sx={{ p: 4, mb: 4, borderRadius: 3, border: "2px solid #f56565" }}
        >
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#f5656515",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InfoIcon sx={{ fontSize: 24, color: "#f56565" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#f56565", mb: 1 }}
              >
                Query Error
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b", mb: 2 }}>
                {error}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                You can provide the correct SQL query below to help improve our
                system:
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
            >
              Provide Correct SQL (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter the correct SQL query for this question..."
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  bgcolor: "#f8fafc",
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#48bb78",
                  "&:hover": { bgcolor: "#38a169" },
                }}
              >
                Save Correction
              </Button>
              <Button variant="outlined" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Fade in timeout={300}>
          <Box>
            {/* Loading Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card>
                    <CardContent>
                      <Skeleton
                        variant="text"
                        height={20}
                        width="60%"
                        sx={{ mb: 1 }}
                      />
                      <Skeleton variant="text" height={40} width="80%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Loading SQL */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 1 }}
              />
            </Paper>

            {/* Loading Visualization */}
            <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #e2e8f0",
                  bgcolor: "#f8fafc",
                }}
              >
                <Skeleton variant="text" height={30} width="50%" />
              </Box>
              <Box sx={{ p: 4 }}>
                <Skeleton
                  variant="rectangular"
                  height={400}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* Results Section */}
      {resultsSection}

      {/* Empty State */}
      {!result && !loading && !error && (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ textAlign: "center", py: 8, px: 4 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#9c27b015",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <BrainIcon sx={{ fontSize: 48, color: "#9c27b0" }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
            >
              Ready to Analyze Your Data
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#64748b", maxWidth: 500, mx: "auto", mb: 4 }}
            >
              Select a database connection and ask your question in natural
              language. I'll generate the SQL and create beautiful
              visualizations for you.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip
                label="Natural Language Processing"
                sx={{ bgcolor: "#0078d715", color: "#0078d7", fontWeight: 600 }}
              />
              <Chip
                label="Automatic Visualizations"
                sx={{ bgcolor: "#48bb7815", color: "#48bb78", fontWeight: 600 }}
              />
              <Chip
                label="Smart SQL Generation"
                sx={{ bgcolor: "#9c27b015", color: "#9c27b0", fontWeight: 600 }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Floating Feedback Buttons */}
      {result && !error && (
        <Box
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            zIndex: 1000,
          }}
        >
          <Tooltip title="Mark as Correct" placement="left">
            <Fab
              color="success"
              onClick={handleMarkCorrect}
              disabled={markingFeedback}
              sx={{
                boxShadow: "0 8px 16px rgba(72, 187, 120, 0.3)",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 12px 24px rgba(72, 187, 120, 0.4)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ThumbUpIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Provide Correction" placement="left">
            <Fab
              color="error"
              onClick={handleMarkWrong}
              disabled={markingFeedback}
              sx={{
                boxShadow: "0 8px 16px rgba(244, 67, 54, 0.3)",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 12px 24px rgba(244, 67, 54, 0.4)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ThumbDownIcon />
            </Fab>
          </Tooltip>
        </Box>
      )}

      {/* SQL Correction Dialog */}
      <Dialog
        open={showCorrectionDialog}
        onClose={() => setShowCorrectionDialog(false)}
        maxWidth="md"
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
              <EditIcon color="error" />
              <Typography variant="h6">Provide Corrected SQL</Typography>
            </Box>
            <IconButton
              onClick={() => setShowCorrectionDialog(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Edit the SQL query below to provide the correct version. You can
              test it before saving.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={correctedSql}
              onChange={(e) => setCorrectedSql(e.target.value)}
              placeholder="Enter corrected SQL query..."
              sx={{
                fontFamily: "monospace",
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              label="Correction Notes (Optional)"
              placeholder="Explain what was wrong and how you fixed it..."
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={
                testingCorrection ? (
                  <CircularProgress size={16} />
                ) : (
                  <PlayIcon />
                )
              }
              onClick={handleTestCorrection}
              disabled={!correctedSql.trim() || testingCorrection}
              fullWidth
            >
              {testingCorrection ? "Testing SQL..." : "Test SQL"}
            </Button>
          </Box>

          {testResult && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={testResult.success ? "success" : "error"}>
                {testResult.success ? (
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      ✅ Query executed successfully!
                    </Typography>
                    <Typography variant="caption">
                      {testResult.row_count} rows returned in{" "}
                      {testResult.execution_time_ms}ms
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      ❌ Query failed
                    </Typography>
                    <Typography variant="caption">
                      {testResult.error}
                    </Typography>
                  </Box>
                )}
              </Alert>

              {/* Display Results Data */}
              {testResult.success &&
                testResult.results &&
                testResult.results.length > 0 && (
                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "#f8fafc",
                      maxHeight: 300,
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Results Preview:
                    </Typography>
                    {testResult.row_count === 1 &&
                    Object.keys(testResult.results[0]).length === 1 ? (
                      // Single value - display prominently
                      <Box
                        sx={{
                          p: 3,
                          textAlign: "center",
                          bgcolor: "white",
                          borderRadius: 2,
                          border: "2px solid #9c27b0",
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{ color: "#9c27b0", fontWeight: 700 }}
                        >
                          {Object.values(testResult.results[0])[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Object.keys(testResult.results[0])[0]}
                        </Typography>
                      </Box>
                    ) : (
                      // Multiple rows or columns - display as table
                      <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {Object.keys(testResult.results[0]).map((key) => (
                                <TableCell
                                  key={key}
                                  sx={{
                                    fontWeight: 600,
                                    bgcolor: "#9c27b0",
                                    color: "white",
                                  }}
                                >
                                  {key}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {testResult.results.slice(0, 10).map((row, idx) => (
                              <TableRow
                                key={idx}
                                sx={{
                                  "&:nth-of-type(odd)": { bgcolor: "#f8fafc" },
                                  "&:hover": { bgcolor: "#e2e8f0" },
                                }}
                              >
                                {Object.values(row).map((value, colIdx) => (
                                  <TableCell key={colIdx}>
                                    {value !== null && value !== undefined
                                      ? String(value)
                                      : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                    {testResult.row_count > 10 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Showing first 10 of {testResult.row_count} rows
                      </Typography>
                    )}
                  </Paper>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowCorrectionDialog(false)}
            disabled={markingFeedback}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCorrection}
            disabled={!correctedSql.trim() || markingFeedback}
            startIcon={
              markingFeedback ? <CircularProgress size={16} /> : <CheckIcon />
            }
          >
            {markingFeedback ? "Saving..." : "Save Correction"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default SQLQueryGenerator;
