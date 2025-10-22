import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import fastKgService from "../../services/fastKgService";
import connectionService from "../../services/connectionService";
import useRetrieverStore from "../../store/retrieverStore";
import DynamicDataVisualization from "../mui/DynamicDataVisualization";

const SQLQueryGenerator = () => {
  const { userId, savedConnections, setSavedConnections, currentConnection } =
    useRetrieverStore();

  // State
  const [selectedConnection, setSelectedConnection] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // SQL Keywords for syntax highlighting
  const SQL_KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL',
    'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT',
    'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX',
    'VIEW', 'UNION', 'ALL', 'WITH', 'RECURSIVE', 'CAST', 'EXTRACT', 'DATE',
    'TIMESTAMP', 'INTERVAL', 'TRUE', 'FALSE'
  ];

  // Function to highlight SQL syntax
  const highlightSQL = (sql) => {
    if (!sql) return '';
    
    let highlightedSQL = sql;
    
    // Highlight keywords
    SQL_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedSQL = highlightedSQL.replace(regex, `<span class="sql-keyword">${keyword.toUpperCase()}</span>`);
    });
    
    // Highlight strings (single and double quotes)
    highlightedSQL = highlightedSQL.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');
    highlightedSQL = highlightedSQL.replace(/"([^"]*)"/g, '<span class="sql-string">"$1"</span>');
    
    // Highlight numbers
    highlightedSQL = highlightedSQL.replace(/\b\d+(\.\d+)?\b/g, '<span class="sql-number">$&</span>');
    
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
        true
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

  // Transform API results for DynamicDataVisualization
  const transformResultsForVisualization = () => {
    if (!result?.execution?.results) return null;

    return {
      analysis_result: {
        supporting_data: result.execution.results,
        summary: {
          total_records: result.execution.row_count,
          query: result.query?.natural_language || query,
          execution_time: result.execution.execution_time_ms,
        },
      },
      metadata: {
        query_id: result.query?.query_id,
        timestamp: result.timestamp,
        sql: result.query?.generated_sql || result.sql,
      },
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleGenerateSQL();
    }
  };

  const getSelectedConnectionDetails = () => {
    return savedConnections.find((c) => c.id === selectedConnection);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1a202c",
            mb: 1,
            fontSize: { xs: "1.75rem", md: "2.25rem" },
          }}
        >
          Natural Language Query
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#64748b",
            fontSize: "1.1rem",
          }}
        >
          Ask questions in plain English and get intelligent data visualizations
        </Typography>
      </Box>

      {/* Connection Selection & Query Input */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
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
                      {conn.connection_name}
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
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<DatabaseIcon />}
                label={`${getSelectedConnectionDetails()?.connection_name || getSelectedConnectionDetails()?.name}`}
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
                  getSelectedConnectionDetails()?.schema_name || "public"
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
            label="Natural language query"
            placeholder="e.g., Show me all customers who got disbursed today in federal bank with their amounts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleGenerateSQL();
              }
            }}
            disabled={loading}
            helperText="Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to generate and execute SQL"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "1.1rem",
                lineHeight: 1.6,
              },
              "& .MuiInputLabel-root": {
                fontSize: "1rem",
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
              disabled={loading || !selectedConnection || !query.trim()}
              startIcon={
                loading ? <CircularProgress size={20} /> : <PlayIcon />
              }
              sx={{
                bgcolor: "#0078d7",
                "&:hover": { bgcolor: "#005a9e" },
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
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
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
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
      {result && !loading && (
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
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#1a202c",
                  "& .sql-keyword": {
                    color: "#0078d7",
                    fontWeight: 600,
                  },
                  "& .sql-string": {
                    color: "#48bb78",
                  },
                  "& .sql-number": {
                    color: "#ed8936",
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightSQL(result.query?.generated_sql || result.sql)
                }}
              />

              {/* Query Performance Info */}
              <Box sx={{ mt: 3, display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Chip
                  label={`${result.execution?.row_count || 0} records returned`}
                  sx={{
                    bgcolor:
                      result.execution?.row_count > 0
                        ? "#48bb7815"
                        : "#ed893615",
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
              <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box
                  sx={{
                    p: 3,
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
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
                          result.execution.row_count > 0
                            ? "#48bb78"
                            : "#ed8936",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 0 }}>
                  {result.execution.results &&
                  result.execution.results.length > 0 ? (
                    <DynamicDataVisualization
                      analysisResult={transformResultsForVisualization()}
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
                        Your query executed successfully but returned no
                        results. Try adjusting your query parameters.
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
      )}

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
    </Box>
  );
};

export default SQLQueryGenerator;
