import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  AutoAwesome as SparkleIcon,
  Keyboard as KeyboardIcon,
  TipsAndUpdates as TipsIcon,
  Search as SearchIcon,
  Bolt as BoltIcon,
  DataObject as DataObjectIcon,
  ArrowForward as ArrowForwardIcon,
  BuildCircle as FixIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import fastKgService from "../../services/fastKgService";
import connectionService from "../../services/connectionService";
import queryLearningService from "../../services/queryLearningService";
import useRetrieverStore from "../../store/retrieverStore";
import EnhancedDataGrid from "../widgets/EnhancedDataGrid";
import { useAuth } from "../../contexts/AuthContext";

const SQLQueryGenerator = React.memo(() => {
  const { user } = useAuth();
  const { userId, savedConnections, setSavedConnections, currentConnection, executionSource, setExecutionSource } =
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
  const [businessDomain, setBusinessDomain] = useState("");
  const [testingCorrection, setTestingCorrection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [markingFeedback, setMarkingFeedback] = useState(false);
  const [sqlCollapsed, setSqlCollapsed] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [failedQueryId, setFailedQueryId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [templateVersions, setTemplateVersions] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(""); // Selected template version

  // Animated placeholder examples
  const PLACEHOLDER_EXAMPLES = useMemo(() => [
    "Show me all customers who got disbursed today...",
    "What was the total collection amount this month by branch?",
    "List top 10 overdue loans with customer details and amounts...",
    "Compare disbursement trends between Q3 and Q4 2024...",
    "Which agents had the highest recovery rate last week?",
    "Show me the daily transaction summary for the past 30 days...",
  ], []);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const typingTimeoutRef = useRef(null);

  // Animated typing effect for placeholder
  useEffect(() => {
    if (query) return; // Don't animate when user is typing

    const currentExample = PLACEHOLDER_EXAMPLES[placeholderIndex];
    let charIndex = 0;
    setIsTyping(true);
    setPlaceholderText("");

    const typeChar = () => {
      if (charIndex <= currentExample.length) {
        setPlaceholderText(currentExample.slice(0, charIndex));
        charIndex++;
        typingTimeoutRef.current = setTimeout(typeChar, 35);
      } else {
        setIsTyping(false);
        // Pause then move to next example
        typingTimeoutRef.current = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
        }, 2500);
      }
    };

    typingTimeoutRef.current = setTimeout(typeChar, 500);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [placeholderIndex, query, PLACEHOLDER_EXAMPLES]);

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

    // Safety check: If SQL is too large (>100KB), return plain text to avoid RangeError
    const MAX_SQL_LENGTH = 100000; // 100KB
    if (sql.length > MAX_SQL_LENGTH) {
      console.warn(`SQL query too large (${sql.length} chars), skipping syntax highlighting`);
      return sql; // Return plain text without highlighting
    }

    let highlightedSQL = sql;

    try {
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
    } catch (error) {
      console.error('Error highlighting SQL:', error);
      return sql; // Return plain text if highlighting fails
    }
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

  // Load template versions when connection changes
  useEffect(() => {
    if (selectedConnection) {
      loadTemplateVersions(selectedConnection);
    }
  }, [selectedConnection]);

  const loadTemplateVersions = async (connectionId) => {
    try {
      setLoadingVersions(true);
      const response = await fastKgService.getTemplateVersions(connectionId);
      setTemplateVersions(response.data);
    } catch (err) {
      console.error("Failed to load template versions:", err);
      setTemplateVersions(null);
    } finally {
      setLoadingVersions(false);
    }
  };

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
        false, // Don't save to history yet
        executionSource // Pass execution source (postgres or duckdb)
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
        message: "✅ Corrected SQL saved successfully! Template version updated.",
        severity: "success",
      });
      setShowCorrectionDialog(false);
      setCorrectedSql("");
      setCorrectionNotes("");
      setTestResult(null);
      
      // Reload template versions to show the updated version
      if (selectedConnection) {
        loadTemplateVersions(selectedConnection);
      }
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
      setValidationError(null);
      setPage(0);

      const connection =
        savedConnections.find((c) => c.id === connId) || currentConnection;
      if (!connection) {
        throw new Error("Connection not found");
      }

      console.log('🚀 SQL Query Generator - Execution Source:', executionSource);
      // Use new askQuery API with validation (optionally with specific version)
      const response = await queryLearningService.askQuery(
        connection.id,
        query,
        user?.username || user?.userId || "system",
        selectedVersion || undefined, // Pass selected version if specified
        executionSource // Pass execution source (postgres or duckdb)
      );

      setResult(response);
      setSnackbar({
        open: true,
        message: "Query executed successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to generate and execute SQL:", err);

      // Check if it's a validation error (400)
      if (err.response?.status === 400 && err.response?.data) {
        const errorData = err.response.data.detail || err.response.data;
        console.log("Validation error detected. Query ID:", errorData.query_id);
        setValidationError(errorData);
        setFailedQueryId(errorData.query_id);
        setCorrectedSql(errorData.generated_sql || "");
        setError(null); // Clear generic error
        setShowCorrectionDialog(true); // Open correction dialog
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail?.message || err.message || "Failed to generate and execute SQL");
      }
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

  const handleSubmitCorrection = async () => {
    if (!correctedSql.trim() || !businessDomain.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide corrected SQL and business domain",
        severity: "error",
      });
      return;
    }

    try {
      setTestingCorrection(true);
      const connId = selectedConnection || currentConnection?.id;

      console.log("Submitting correction with query_id:", failedQueryId);

      const response = await queryLearningService.provideCorrectSql(
        failedQueryId,
        connId,
        correctedSql,
        query,
        businessDomain,
        correctionNotes,
        user?.username || user?.userId || "system",
        executionSource // Pass execution source (postgres or duckdb)
      );

      setSnackbar({
        open: true,
        message: "Correction submitted and embedded successfully!",
        severity: "success",
      });

      setShowCorrectionDialog(false);
      setCorrectedSql("");
      setCorrectionNotes("");
      setBusinessDomain("");
      setValidationError(null);

      // Re-run the query with the corrected context
      setTimeout(() => handleGenerateSQL(), 1000);
    } catch (err) {
      console.error("Failed to submit correction:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to submit correction",
        severity: "error",
      });
    } finally {
      setTestingCorrection(false);
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

  // Apple-grade textarea styles — no label, clean border
  const textFieldStyles = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        fontSize: "1.05rem",
        lineHeight: 1.7,
        borderRadius: "14px",
        bgcolor: "#fafbfc",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "contents",
        transform: "translateZ(0)",
        "& fieldset": {
          borderColor: "#e5e7eb",
          borderWidth: "1.5px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          // Remove the notch gap entirely
          "& legend": {
            display: "none",
          },
        },
        "&:hover fieldset": {
          borderColor: "#cbd5e1",
        },
        "&.Mui-focused": {
          bgcolor: "#fff",
          boxShadow: "0 0 0 4px rgba(0, 120, 215, 0.07), 0 4px 16px rgba(0, 120, 215, 0.05)",
          "& fieldset": {
            borderColor: "#0078d7 !important",
            borderWidth: "1.5px",
          },
        },
      },
      // Hide the floating label completely
      "& .MuiInputLabel-root": {
        display: "none",
      },
      "& textarea": {
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

    const totalTimeMs = result.performance?.total_time_ms || result.execution?.execution_time_ms || 0;
    const totalTimeSec = (totalTimeMs / 1000).toFixed(1);
    const isFast = totalTimeMs <= 6000;
    const isSlow = totalTimeMs > 10000;

    return (
      <Fade in timeout={300}>
        <Box>
          {/* Rocket speed overlay toast — only for fast queries */}
          {isFast && !isSlow && (
            <Box
              sx={{
                position: "fixed",
                top: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 3,
                py: 1.5,
                borderRadius: 100,
                bgcolor: "#fff",
                border: "1px solid #d1fae5",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(16, 185, 129, 0.1)",
                animation: "toastSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, toastFadeOut 0.4s ease 3.5s forwards",
                pointerEvents: "none",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: "1.4rem",
                  animation: "rocketLaunch 0.8s ease-out both",
                  display: "inline-block",
                }}
              >
                🚀
              </Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#065f46", whiteSpace: "nowrap" }}>
                Query executed in {totalTimeSec}s
              </Typography>
              <BoltIcon sx={{ fontSize: 16, color: "#10b981" }} />
            </Box>
          )}

          {/* SQL Editor — light pgAdmin style */}
          <Paper
            sx={{
              mb: 3,
              borderRadius: 2.5,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            {/* Editor title bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 0.85,
                bgcolor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Traffic light dots */}
                <Box sx={{ display: "flex", gap: 0.6, mr: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#f87171" }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#fbbf24" }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#34d399" }} />
                </Box>
                <CodeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" }}>
                  SQL Query
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title={copied ? "Copied!" : "Copy SQL"}>
                  <IconButton
                    onClick={handleCopySQL}
                    size="small"
                    sx={{
                      width: 34,
                      height: 34,
                      color: copied ? "#059669" : "#64748b",
                      "&:hover": { bgcolor: "#f1f5f9" },
                    }}
                  >
                    {copied ? <CheckIcon sx={{ fontSize: 18 }} /> : <CopyIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={sqlCollapsed ? "Expand SQL" : "Collapse SQL"}>
                  <IconButton
                    onClick={() => setSqlCollapsed((prev) => !prev)}
                    size="small"
                    sx={{
                      width: 34,
                      height: 34,
                      color: "#64748b",
                      "&:hover": { bgcolor: "#f1f5f9" },
                    }}
                  >
                    {sqlCollapsed ? <ExpandMoreIcon sx={{ fontSize: 20 }} /> : <ExpandLessIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* SQL code — light editor, collapsible */}
            <Box
              sx={{
                px: 2.5,
                py: sqlCollapsed ? 0 : 2,
                bgcolor: "#fff",
                overflow: "hidden",
                maxHeight: sqlCollapsed ? 0 : 2000,
                opacity: sqlCollapsed ? 0 : 1,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                  fontSize: "0.88rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#1e293b",
                  tabSize: 2,
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightSQL(
                    result.query?.generated_sql || result.sql
                  ),
                }}
              />
              <style>{`
                .sql-keyword { color: #0078d7; font-weight: 600; }
                .sql-string { color: #16a34a; }
                .sql-number { color: #ea580c; }
                @keyframes toastSlideIn {
                  0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
                  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
                @keyframes toastFadeOut {
                  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
                  100% { opacity: 0; transform: translateX(-50%) translateY(-12px); }
                }
                @keyframes rocketLaunch {
                  0% { transform: translateY(10px) rotate(45deg) scale(0.5); opacity: 0; }
                  40% { transform: translateY(-4px) rotate(0deg) scale(1.3); opacity: 1; }
                  100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                }
              `}</style>
            </Box>
          </Paper>

          {/* Query Results Data Grid — minimal */}
          {result.execution && (
            <>
              {result.execution.results &&
              result.execution.results.length > 0 ? (
                <EnhancedDataGrid
                  title="Results"
                  data={result.execution.results}
                  height={420}
                  exportFileName={`query_results_${result.query_id || "export"}`}
                />
              ) : (
                <Paper
                  sx={{
                    textAlign: "center",
                    py: 5,
                    px: 4,
                    borderRadius: 3,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <DatabaseIcon sx={{ fontSize: 36, color: "#d97706", mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                    No Data Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Query ran successfully but returned no results.
                  </Typography>
                </Paper>
              )}
            </>
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
  }, [result, loading, copied, sqlCollapsed]);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <img
            src="/retrieval.png"
            alt="Data Retrieval"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1a202c",
                fontSize: { xs: "1.75rem", md: "2rem" },
                lineHeight: 1.2,
              }}
            >
              Data Retriever Configurator
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", mt: 0.25, fontSize: "0.875rem" }}
            >
              Query your data using natural language — powered by MiFiX.ai
            </Typography>
          </Box>
        </Box>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <DatabaseIcon sx={{ color: "#0078d7", fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1a202c" }}
            >
              Database Connection
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="medium">
                <InputLabel>Select Connection</InputLabel>
                <Select
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                  label="Select Connection"
                  disabled={loadingConnections}
                  startAdornment={
                    <DatabaseIcon sx={{ mr: 1, color: "action.active" }} />
                  }
                  sx={{ minHeight: 56 }}
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
            </Grid>
            
            {/* <Grid item xs={12} md={6}>
              <FormControl fullWidth size="medium" disabled={!selectedConnection || loadingVersions}>
                <InputLabel>Template Version (Optional)</InputLabel>
                <Select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  label="Template Version (Optional)"
                  startAdornment={
                    <TimelineIcon sx={{ mr: 1, color: "action.active" }} />
                  }
                  sx={{ minHeight: 56 }}
                >
                  <MenuItem value="">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Use Active Version
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {templateVersions?.active_version || "Default"}
                      </Typography>
                    </Box>
                  </MenuItem>
                  {templateVersions?.versions?.map((version) => (
                    <MenuItem key={version.version} value={version.version}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {version.version}
                          {version.active && (
                            <Chip
                              label="Active"
                              size="small"
                              color="success"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {version.examples} examples • {version.collection}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}

            {/* Execution Source Selector */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="medium">
                <InputLabel>Execution Source</InputLabel>
                <Select
                  value={executionSource}
                  onChange={(e) => setExecutionSource(e.target.value)}
                  label="Execution Source"
                  startAdornment={
                    <PlayIcon sx={{ mr: 1, color: "action.active" }} />
                  }
                  sx={{ minHeight: 56 }}
                >
                  <MenuItem value="duckdb">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        DuckDB
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Faster for Query Execution (default)
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="postgres">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        PostgreSQL
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Direct database execution
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedConnection && (
            <>
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
              <Chip
                icon={<PlayIcon />}
                label={`Executing on: ${executionSource === 'duckdb' ? 'DuckDB' : 'PostgreSQL'}`}
                sx={{
                  bgcolor: executionSource === 'duckdb' ? "#9c27b015" : "#f57c0015",
                  color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: executionSource === 'duckdb' ? "#9c27b0" : "#f57c00" },
                }}
                size="small"
              />
            </Box>

              {/* Template Versions Display */}
              {loadingVersions ? (
                <Box sx={{ mt: 3 }}>
                  <Skeleton variant="rectangular" height={80} />
                </Box>
              ) : templateVersions && templateVersions.versions && templateVersions.versions.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1a202c", mb: 1.5 }}>
                    📚 Template Versions ({templateVersions.total_versions})
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {templateVersions.versions.map((version) => (
                      <Chip
                        key={version.version}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {version.version}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              ({version.examples} examples)
                            </Typography>
                          </Box>
                        }
                        size="small"
                        sx={{
                          bgcolor: version.active ? "#9c27b015" : "#e2e8f0",
                          color: version.active ? "#9c27b0" : "#64748b",
                          fontWeight: version.active ? 600 : 500,
                          border: version.active ? "1px solid #9c27b0" : "1px solid #e2e8f0",
                        }}
                        icon={version.active ? <CheckIcon sx={{ fontSize: 16 }} /> : null}
                      />
                    ))}
                  </Box>
                  {templateVersions.connection_name && (
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 1, display: "block" }}>
                      Template: {templateVersions.connection_name} • Active: {templateVersions.active_version}
                    </Typography>
                  )}
                </Box>
              ) : null}
            </>
          )}
        </Box>

        {/* Query Input */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SearchIcon sx={{ color: "#9c27b0", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1a202c" }}
              >
                Ask Your Question
              </Typography>
            </Box>
          </Box>

          {/* Query textarea with animated placeholder */}
          <Box sx={{ position: "relative", mb: 5 }}>
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder={query ? "Type your question here..." : placeholderText}
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              sx={{
                ...textFieldStyles,
                "& .MuiInputBase-input::placeholder": {
                  opacity: 0.45,
                  fontStyle: "italic",
                  color: "#94a3b8",
                },
              }}
              InputProps={{
                spellCheck: false,
                autoComplete: "off",
                autoCorrect: "off",
                autoCapitalize: "off",
                inputProps: {
                  style: {
                    transform: "translateZ(0)",
                    willChange: "contents",
                    textRendering: "optimizeSpeed",
                  },
                },
              }}
            />
            {/* Keyboard shortcut — positioned below textarea */}
            <Box
              sx={{
                position: "absolute",
                bottom: -44,
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                Press
              </Typography>
              {/* Modifier keycap */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 0.85,
                  py: 0.35,
                  borderRadius: 1.25,
                  bgcolor: "#f8fafc",
                  border: "1px solid #d4d4d8",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.06)",
                  fontFamily: '-apple-system, "SF Pro Display", system-ui, monospace',
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#334155",
                  minWidth: 28,
                  height: 24,
                  lineHeight: 1,
                }}
              >
                {typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent) ? '⌘' : 'Ctrl'}
              </Box>
              <Typography sx={{ color: "#cbd5e1", fontSize: "0.75rem", fontWeight: 600, lineHeight: 1 }}>+</Typography>
              {/* Enter keycap */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1,
                  py: 0.35,
                  borderRadius: 1.25,
                  bgcolor: "#f8fafc",
                  border: "1px solid #d4d4d8",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.06)",
                  fontFamily: '-apple-system, "SF Pro Display", system-ui, monospace',
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#334155",
                  height: 24,
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                }}
              >
                Enter
              </Box>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                to fire up your query
              </Typography>
              <BoltIcon sx={{ fontSize: 15, color: "#0078d7", ml: -0.25 }} />
            </Box>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateSQL}
              disabled={!canGenerate}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <BoltIcon />
                )
              }
              sx={{
                ...buttonStyles,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: canGenerate ? "0 4px 14px rgba(0, 120, 215, 0.35)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#005a9e",
                  boxShadow: "0 6px 20px rgba(0, 120, 215, 0.45)",
                  transform: "translateY(-1px)",
                },
              }}
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
                sx={{
                  ...newQueryButtonStyles,
                  textTransform: "none",
                  borderColor: "#cbd5e1",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#0078d7",
                    color: "#0078d7",
                    bgcolor: "#0078d708",
                  },
                }}
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
            sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
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
              <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                Click "Provide Correction" below to help improve the system with the correct SQL.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  setCorrectedSql("");
                  setShowCorrectionDialog(true);
                }}
              >
                Provide Correction
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Loading State — AI brain animation */}
      {loading && (
        <Fade in timeout={400}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            {/* Pulsing brain icon with orbiting dots */}
            <Box
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                mb: 4,
              }}
            >
              {/* Outer ring */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "#0078d7",
                  borderRightColor: "#0078d740",
                  animation: "spinRing 1.5s linear infinite",
                }}
              />
              {/* Inner ring — counter rotation */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderBottomColor: "#9c27b0",
                  borderLeftColor: "#9c27b040",
                  animation: "spinRing 2s linear infinite reverse",
                }}
              />
              {/* Center brain icon */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "brainPulse 2s ease-in-out infinite",
                }}
              >
                <BrainIcon sx={{ fontSize: 36, color: "#0078d7" }} />
              </Box>
            </Box>

            {/* Animated status messages */}
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#1e293b",
                mb: 1.5,
              }}
            >
              Generating your query
            </Typography>

            {/* Cycling status steps */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              {[
                { text: "Analyzing knowledge graph", delay: "0s" },
                { text: "Mapping table relationships", delay: "0.15s" },
                { text: "Optimizing SQL query", delay: "0.3s" },
              ].map((step, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    animation: `stepFadeIn 0.5s ease both`,
                    animationDelay: step.delay,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#0078d7",
                      animation: "dotPulse 1.4s ease-in-out infinite",
                      animationDelay: step.delay,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontSize: "0.85rem" }}
                  >
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            <style>{`
              @keyframes spinRing {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes brainPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.08); opacity: 0.8; }
              }
              @keyframes dotPulse {
                0%, 100% { opacity: 0.4; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              @keyframes stepFadeIn {
                0% { opacity: 0; transform: translateY(8px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </Box>
        </Fade>
      )}

      {/* Results Section */}
      {resultsSection}


      {/* Floating Feedback Buttons - Always show when there's a result or error */}
      {(result || error || validationError) && !loading && (
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
          {result && (
            <Tooltip title="Mark as Correct" placement="left">
              <Fab
                onClick={handleMarkCorrect}
                disabled={markingFeedback}
                size="large"
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#16a34a",
                  color: "#fff",
                  boxShadow: "0 8px 16px rgba(22, 163, 74, 0.3)",
                  "&:hover": {
                    bgcolor: "#15803d",
                    transform: "scale(1.1)",
                    boxShadow: "0 12px 24px rgba(22, 163, 74, 0.4)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ThumbUpIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Fab>
            </Tooltip>
          )}
          <Tooltip title="Fix & Train" placement="left">
            <Fab
              onClick={() => {
                setCorrectedSql(result?.query?.generated_sql || validationError?.generated_sql || "");
                setFailedQueryId(result?.query?.query_id || validationError?.query_id || null);
                setShowCorrectionDialog(true);
              }}
              disabled={markingFeedback}
              size="large"
              sx={{
                width: 60,
                height: 60,
                bgcolor: "#dc2626",
                color: "#fff",
                boxShadow: "0 8px 16px rgba(220, 38, 38, 0.3)",
                "&:hover": {
                  bgcolor: "#b91c1c",
                  transform: "scale(1.1)",
                  boxShadow: "0 12px 24px rgba(220, 38, 38, 0.4)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ThumbDownIcon sx={{ color: "#fff", fontSize: 28 }} />
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
          {/* Validation Error Display */}
          {validationError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {validationError.error}: {validationError.message}
              </Typography>
              {validationError.validation_errors && (
                <Box sx={{ mt: 1 }}>
                  {validationError.validation_errors.map((err, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {err}
                    </Typography>
                  ))}
                </Box>
              )}
              {validationError.suggestion && (
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: "block", fontStyle: "italic" }}
                >
                  💡 {validationError.suggestion}
                </Typography>
              )}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Provide the corrected SQL query below. The system will validate
              and embed it for future learning.
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
              value={businessDomain}
              onChange={(e) => setBusinessDomain(e.target.value)}
              label="Business Domain *"
              placeholder="e.g., collections, disbursement, customer_onboarding"
              required
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              label="Explanation *"
              placeholder="Explain what was wrong and how you fixed it (e.g., 'loan_emi_mapping uses source_id not cust_id')"
              required
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
            onClick={() => {
              setShowCorrectionDialog(false);
              setValidationError(null);
            }}
            disabled={testingCorrection}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitCorrection}
            disabled={
              !correctedSql.trim() ||
              !businessDomain.trim() ||
              testingCorrection
            }
            startIcon={
              testingCorrection ? <CircularProgress size={16} /> : <CheckIcon />
            }
          >
            {testingCorrection ? "Submitting..." : "Submit & Learn"}
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
