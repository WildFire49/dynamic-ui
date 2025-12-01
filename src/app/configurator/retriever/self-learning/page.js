"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  useTheme,
  Collapse,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Tooltip,
  TablePagination,
  Alert,
} from "@mui/material";
import {
  PlayArrow as RunIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Error as ErrorIcon,
  Code as CodeIcon,
  CompareArrows as DiffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import useRetrieverStore from "../../../../store/retrieverStore";
import queryLearningService from "../../../../services/queryLearningService";

// --- Components ---

const StatCard = ({ title, value, icon, color, subtext }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 24px -10px rgba(0,0,0,0.1)",
      },
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: "50%",
        bgcolor: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 60, color: `${color}40` } })}
    </Box>
    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
      {title}
    </Typography>
    <Typography variant="h3" fontWeight={700} sx={{ my: 1, color: color }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {subtext}
    </Typography>
  </Paper>
);

const DiffViewer = ({ expected, actual, label }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
      >
        <DiffIcon fontSize="small" color="action" />
        {label} Comparison
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "#f8fafc",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.success.main,
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              EXPECTED (Training Data)
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 0,
                overflowX: "auto",
                fontFamily:
                  "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
                fontSize: "0.8rem",
                color: "#334155",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {typeof expected === "object"
                ? JSON.stringify(expected, null, 2)
                : expected}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "#fff5f5",
              border: "1px solid",
              borderColor: theme.palette.error.light,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.error.main,
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              ACTUAL (Generated)
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 0,
                overflowX: "auto",
                fontFamily:
                  "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
                fontSize: "0.8rem",
                color: "#334155",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {typeof actual === "object"
                ? JSON.stringify(actual, null, 2)
                : actual}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const ResultItem = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const isPassed = result.passed;
  const hasError = result.error;

  let statusColor = theme.palette.success.main;
  let StatusIcon = PassIcon;

  if (hasError) {
    statusColor = theme.palette.error.main;
    StatusIcon = ErrorIcon;
  } else if (!isPassed) {
    statusColor = theme.palette.warning.main;
    StatusIcon = FailIcon;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        border: "1px solid",
        borderColor: expanded ? statusColor : "divider",
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "flex-start",
          cursor: "pointer",
          bgcolor: expanded ? `${statusColor}08` : "white",
          "&:hover": { bgcolor: `${statusColor}05` },
        }}
      >
        <Box sx={{ mt: 0.5, mr: 2 }}>
          <StatusIcon sx={{ color: statusColor }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            {result.natural_language_query}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Chip
              label={isPassed ? "PASSED" : "FAILED"}
              size="small"
              sx={{
                bgcolor: `${statusColor}15`,
                color: statusColor,
                fontWeight: 700,
                fontSize: "0.7rem",
                borderRadius: 1,
              }}
            />
            <Chip
              label={result.sql_match ? "✓ SQL Match" : "✗ SQL Mismatch"}
              size="small"
              variant="outlined"
              sx={{
                borderColor: result.sql_match
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
                color: result.sql_match
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
                fontSize: "0.7rem",
              }}
            />
            <Chip
              label={
                result.result_match ? "✓ Result Match" : "✗ Result Mismatch"
              }
              size="small"
              variant="outlined"
              sx={{
                borderColor: result.result_match
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                color: result.result_match
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontSize: "0.7rem",
              }}
            />
            <Chip
              label={`Score: ${(result.accuracy_score * 100).toFixed(0)}%`}
              size="small"
              sx={{
                bgcolor: "#f1f5f9",
                color: "#64748b",
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </Box>
        <IconButton size="small" sx={{ ml: 1 }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Tabbed Content */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ bgcolor: "#f8fafc" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              bgcolor: "white",
              borderBottom: "1px solid #e2e8f0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="SQL Comparison" />
            <Tab label="Execution Results" />
            <Tab label="Metadata" />
          </Tabs>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Test Summary
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "white",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Accuracy Score
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color={statusColor}
                      >
                        {(result.accuracy_score * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "white",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Execution Time
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {result.execution_time_ms}ms
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Diff Summary
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "white", border: "1px solid #e2e8f0" }}
                  >
                    <Typography variant="body2">
                      {result.diff_summary || "No diff summary available"}
                    </Typography>
                  </Paper>
                </Box>

                {hasError && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="error"
                      gutterBottom
                    >
                      Error Details
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {result.error}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {/* SQL Comparison Tab */}
            {activeTab === 1 && (
              <Box>
                <DiffViewer
                  label="SQL Comparison"
                  expected={result.expected_sql}
                  actual={result.generated_sql}
                />
              </Box>
            )}

            {/* Execution Results Tab */}
            {activeTab === 2 && (
              <Box>
                {/* Status Banner */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: result.result_match ? "#f0fdf4" : "#FEF2F2",
                    border: `1px solid ${
                      result.result_match ? "#86efac" : "#FCA5A5"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {result.result_match ? (
                    <PassIcon
                      sx={{ fontSize: 32, color: theme.palette.success.main }}
                    />
                  ) : (
                    <FailIcon
                      sx={{ fontSize: 32, color: theme.palette.error.main }}
                    />
                  )}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color={
                        result.result_match ? "success.main" : "error.main"
                      }
                    >
                      {result.result_match
                        ? "Results Match!"
                        : "Results Differ"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expected: {result.corrected_row_count || 0} rows |
                      Generated: {result.regenerated_row_count || 0} rows
                    </Typography>
                  </Box>
                </Paper>

                {/* SQL Output Data */}
                <Grid container spacing={3}>
                  {/* Expected Results */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                        }}
                      />
                      Expected Output
                      {result.corrected_results && (
                        <Chip
                          label={`${result.corrected_results.length} rows`}
                          size="small"
                          sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        border: "1px solid #e2e8f0",
                        maxHeight: 300,
                        overflow: "auto",
                      }}
                    >
                      {result.corrected_results &&
                      result.corrected_results.length > 0 ? (
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {Object.keys(result.corrected_results[0]).map(
                                (key) => (
                                  <TableCell
                                    key={key}
                                    sx={{
                                      fontWeight: 700,
                                      bgcolor: "#f8fafc",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {key}
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {result.corrected_results
                              .slice(0, 50)
                              .map((row, idx) => (
                                <TableRow key={idx} hover>
                                  {Object.values(row).map((val, i) => (
                                    <TableCell
                                      key={i}
                                      sx={{
                                        fontSize: "0.75rem",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {val === null ? (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          NULL
                                        </Typography>
                                      ) : (
                                        String(val)
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            No data available
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Regenerated Results */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "info.main",
                        }}
                      />
                      Generated Output
                      {result.regenerated_results && (
                        <Chip
                          label={`${result.regenerated_results.length} rows`}
                          size="small"
                          sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        border: "1px solid #e2e8f0",
                        maxHeight: 300,
                        overflow: "auto",
                      }}
                    >
                      {result.regenerated_results &&
                      result.regenerated_results.length > 0 ? (
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {Object.keys(result.regenerated_results[0]).map(
                                (key) => (
                                  <TableCell
                                    key={key}
                                    sx={{
                                      fontWeight: 700,
                                      bgcolor: "#f8fafc",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {key}
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {result.regenerated_results
                              .slice(0, 50)
                              .map((row, idx) => (
                                <TableRow key={idx} hover>
                                  {Object.values(row).map((val, i) => (
                                    <TableCell
                                      key={i}
                                      sx={{
                                        fontSize: "0.75rem",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {val === null ? (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          NULL
                                        </Typography>
                                      ) : (
                                        String(val)
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            No data available
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>

                {/* Sample Differences (if any) */}
                {result.sample_diff && result.sample_diff.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      gutterBottom
                    >
                      Sample Differences
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          overflow: "auto",
                        }}
                      >
                        {JSON.stringify(result.sample_diff, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {/* Metadata Tab */}
            {activeTab === 3 && (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0" }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: "30%" }}>
                        Query History ID
                      </TableCell>
                      <TableCell
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {result.query_history_id}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>SQL Match</TableCell>
                      <TableCell>
                        <Chip
                          label={result.sql_match ? "Yes" : "No"}
                          size="small"
                          color={result.sql_match ? "success" : "warning"}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Result Match
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.result_match ? "Yes" : "No"}
                          size="small"
                          color={result.result_match ? "success" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Accuracy Score
                      </TableCell>
                      <TableCell>
                        {(result.accuracy_score * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Execution Time
                      </TableCell>
                      <TableCell>{result.execution_time_ms} ms</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Test Status
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isPassed ? "Passed" : "Failed"}
                          size="small"
                          color={isPassed ? "success" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

// --- Main Page ---

const RegressionTestingPage = () => {
  const theme = useTheme();
  const { currentConnection } = useRetrieverStore();

  // State
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openRunDialog, setOpenRunDialog] = useState(false);
  const [runConfig, setRunConfig] = useState({
    limit: 10,
    business_domain: "",
    only_latest_embedding: true,
    include_marked_correct: true,
  });
  const [runningTest, setRunningTest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, failed, passed - default to "all"

  // Testable Queries State
  const [testableQueries, setTestableQueries] = useState([]);
  const [testableQueriesLoading, setTestableQueriesLoading] = useState(false);
  const [selectedQueryIds, setSelectedQueryIds] = useState([]);
  const [querySearchTerm, setQuerySearchTerm] = useState("");
  const [queryPage, setQueryPage] = useState(0);
  const [queryRowsPerPage, setQueryRowsPerPage] = useState(10);
  const [testableQueryStats, setTestableQueryStats] = useState({
    total: 0,
    distinct: 0,
    withExamples: 0,
    markedCorrect: 0,
  });
  const [showQuerySelector, setShowQuerySelector] = useState(false);
  const [queryFilter, setQueryFilter] = useState("all"); // all, distinct, duplicates

  // Ref to track fetched connection ID to prevent duplicate API calls
  const fetchedConnectionRef = useRef(null);
  // Ref for AbortController to cancel running test
  const abortControllerRef = useRef(null);

  const handleSelectSession = useCallback(
    async (session) => {
      console.log("🎯 Session clicked:", session.test_session_id);
      setDetailsLoading(true);
      try {
        // Always fetch detailed results with test_session_id
        console.log(
          "📞 Fetching detailed results for:",
          session.test_session_id
        );
        const res = await queryLearningService.getTestSessions(
          currentConnection.id,
          1,
          session.test_session_id
        );
        console.log("📦 Detailed API response:", res);

        // Handle both full_results (from detailed session API) and results (from bulk test API)
        // full_results can be an object containing results array or direct results array
        let resultsArray = null;
        let sessionData = null;

        console.log("🔍 Checking res:", res);
        console.log("🔍 res.full_results:", res?.full_results);
        console.log("� Type of full_results:", typeof res?.full_results);
        console.log("🔍 full_results.results:", res?.full_results?.results);

        if (res?.full_results) {
          // Detailed session API returns full_results as an object
          if (
            typeof res.full_results === "object" &&
            res.full_results.results
          ) {
            console.log("✅ Using full_results.results");
            resultsArray = res.full_results.results;
            sessionData = res.full_results;
          } else if (Array.isArray(res.full_results)) {
            console.log("✅ Using full_results as array");
            resultsArray = res.full_results;
          }
        } else if (res?.results) {
          console.log("✅ Using res.results");
          resultsArray = res.results;
        }

        console.log("📊 Final resultsArray:", resultsArray);
        console.log("� resultsArray length:", resultsArray?.length);

        if (resultsArray && resultsArray.length > 0) {
          console.log("✅ Found results:", resultsArray.length, "results");
          // Map API response to our expected format
          const mappedResults = resultsArray.map((result) => ({
            query_history_id: result.query_history_id,
            natural_language_query: result.natural_language_query,
            expected_sql:
              result.corrected_sql || result.sql_comparison?.corrected_sql,
            generated_sql:
              result.regenerated_sql || result.sql_comparison?.regenerated_sql,
            expected_result: result.corrected_result,
            actual_result: result.regenerated_result,
            // SQL output data
            corrected_results: result.corrected_results,
            regenerated_results: result.regenerated_results,
            sql_match: result.sql_comparison?.sql_match ?? result.sql_match,
            result_match:
              result.result_comparison?.results_match ?? result.results_match,
            passed: result.passed,
            accuracy_score: result.accuracy_score,
            error:
              result.regenerated_error ||
              result.corrected_error ||
              result.error,
            execution_time_ms:
              result.regeneration_time_ms || result.execution_time_ms,
            diff_summary:
              result.sql_comparison?.diff_summary || result.diff_summary,
            // Add result_comparison fields for Execution Results tab
            corrected_row_count: result.result_comparison?.corrected_row_count,
            regenerated_row_count:
              result.result_comparison?.regenerated_row_count,
            row_count_match: result.result_comparison?.row_count_match,
            column_match: result.result_comparison?.column_match,
            diff_percentage: result.result_comparison?.diff_percentage,
            sample_diff: result.result_comparison?.sample_diff,
          }));

          console.log("🔄 Mapped results:", mappedResults);
          console.log("📊 Session data:", sessionData);
          // Merge session summary with detailed results
          // If we have sessionData from full_results object, use those stats
          const mergedSession = {
            ...session,
            ...(sessionData || {}),
            results: mappedResults,
          };
          console.log("📦 Final merged session:", mergedSession);
          console.log(
            "📦 Results array length:",
            mergedSession.results?.length
          );
          setSelectedSession(mergedSession);
        } else if (res?.sessions?.[0]) {
          console.log("⚠️ Using fallback sessions format");
          // Fallback if API returns sessions format
          setSelectedSession(res.sessions[0]);
        } else {
          console.warn(
            "⚠️ No results in response, setting session without detailed results"
          );
          setSelectedSession(session);
        }
      } catch (err) {
        console.error("❌ Failed to fetch session details:", err);
        console.error("Error details:", err.response?.data || err.message);
        // Still set the session even if details fail
        setSelectedSession(session);
      } finally {
        setDetailsLoading(false);
      }
    },
    [currentConnection?.id]
  );

  const fetchSessions = useCallback(
    async (autoSelectFirst = false) => {
      console.log(
        "🔍 Fetching sessions for connection:",
        currentConnection?.id
      );
      setLoading(true);
      try {
        const res = await queryLearningService.getTestSessions(
          currentConnection.id,
          20
        );
        console.log("📊 Sessions API response:", res);

        // Check if sessions exist in the response
        const sessionsData = res.sessions;

        if (sessionsData && sessionsData.length > 0) {
          console.log("✅ Found sessions:", sessionsData.length);
          setSessions(sessionsData);
          // Select first session only if autoSelectFirst is true
          if (autoSelectFirst) {
            console.log("🎯 Auto-selecting first session");
            handleSelectSession(sessionsData[0]);
          }
        } else {
          console.warn("⚠️ No sessions in response:", res);
          setSessions([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch sessions:", err);
        console.error("Error details:", err.response?.data || err.message);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    },
    [currentConnection?.id, handleSelectSession]
  );

  // Fetch testable queries
  const fetchTestableQueries = useCallback(async () => {
    if (!currentConnection?.id) return;

    setTestableQueriesLoading(true);
    try {
      const res = await queryLearningService.listTestableQueries(
        currentConnection.id,
        runConfig.include_marked_correct,
        runConfig.business_domain || null
      );
      console.log("📋 Testable queries response:", res);

      if (res?.queries) {
        setTestableQueries(res.queries);
        setTestableQueryStats({
          total: res.total_queries || 0,
          distinct: res.distinct_questions || 0,
          withExamples: res.with_learned_examples || 0,
          markedCorrect: res.marked_correct_only || 0,
        });
      } else {
        setTestableQueries([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch testable queries:", err);
      setTestableQueries([]);
    } finally {
      setTestableQueriesLoading(false);
    }
  }, [
    currentConnection?.id,
    runConfig.include_marked_correct,
    runConfig.business_domain,
  ]);

  // Handle query selection
  const handleToggleQuery = (queryId) => {
    setSelectedQueryIds((prev) =>
      prev.includes(queryId)
        ? prev.filter((id) => id !== queryId)
        : [...prev, queryId]
    );
  };

  const handleSelectAllQueries = () => {
    const filteredIds = filteredTestableQueries.map((q) => q.query_id);
    setSelectedQueryIds(filteredIds);
  };

  const handleClearSelection = () => {
    setSelectedQueryIds([]);
  };

  // Build duplicate map - group queries by natural_language_query
  const queryDuplicateMap = React.useMemo(() => {
    const map = {};
    testableQueries.forEach((q) => {
      const key = q.natural_language_query?.toLowerCase().trim();
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(q.query_id);
    });
    return map;
  }, [testableQueries]);

  // Check if a query is a duplicate (has same question as another query)
  const isDuplicate = (query) => {
    const key = query.natural_language_query?.toLowerCase().trim();
    return queryDuplicateMap[key]?.length > 1;
  };

  // Get duplicate count for a query
  const getDuplicateCount = (query) => {
    const key = query.natural_language_query?.toLowerCase().trim();
    return queryDuplicateMap[key]?.length || 1;
  };

  // Filter testable queries based on search and duplicate filter
  const filteredTestableQueries = testableQueries.filter((q) => {
    // Search filter
    const matchesSearch =
      q.natural_language_query
        ?.toLowerCase()
        .includes(querySearchTerm.toLowerCase()) ||
      q.corrected_sql?.toLowerCase().includes(querySearchTerm.toLowerCase());

    // Duplicate filter
    let matchesDuplicateFilter = true;
    if (queryFilter === "distinct") {
      // Show only first occurrence of each unique question
      const key = q.natural_language_query?.toLowerCase().trim();
      const firstId = queryDuplicateMap[key]?.[0];
      matchesDuplicateFilter = q.query_id === firstId;
    } else if (queryFilter === "duplicates") {
      // Show only queries that have duplicates
      matchesDuplicateFilter = isDuplicate(q);
    }

    return matchesSearch && matchesDuplicateFilter;
  });

  // Paginated queries
  const paginatedQueries = filteredTestableQueries.slice(
    queryPage * queryRowsPerPage,
    queryPage * queryRowsPerPage + queryRowsPerPage
  );

  // Fetch sessions on load - only once per connection
  useEffect(() => {
    if (currentConnection?.id) {
      // Only fetch if connection ID has changed
      if (fetchedConnectionRef.current !== currentConnection.id) {
        console.log(
          "🚀 Fetching sessions for new connection:",
          currentConnection.id
        );
        fetchedConnectionRef.current = currentConnection.id;
        fetchSessions(true); // Auto-select first session on initial load
      }
    } else {
      console.warn("⚠️ No connection ID available");
      fetchedConnectionRef.current = null;
    }
  }, [currentConnection?.id, fetchSessions]);

  // Fetch testable queries when dialog opens
  useEffect(() => {
    if (showQuerySelector && currentConnection?.id) {
      fetchTestableQueries();
    }
  }, [showQuerySelector, currentConnection?.id, fetchTestableQueries]);

  // Cancel running test
  const handleCancelTest = () => {
    if (abortControllerRef.current) {
      console.log("🛑 Cancelling test...");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleRunTest = async () => {
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setRunningTest(true);
    try {
      let res;

      // If specific queries are selected, use runBulkTestByIds
      if (selectedQueryIds.length > 0) {
        console.log(
          "🚀 Starting bulk test with selected queries:",
          selectedQueryIds
        );
        res = await queryLearningService.runBulkTestByIds(
          currentConnection.id,
          "vaishakhsk",
          selectedQueryIds,
          runConfig.include_marked_correct,
          signal
        );
      } else {
        console.log("🚀 Starting bulk test with config:", runConfig);
        res = await queryLearningService.runBulkTest(
          currentConnection.id,
          "vaishakhsk",
          runConfig.limit,
          runConfig.business_domain || null,
          runConfig.only_latest_embedding,
          runConfig.include_marked_correct,
          signal
        );
      }

      // Handle both res.data and res directly (apiClient returns data directly)
      const data = res.data || res;
      console.log("✅ Bulk test completed:", data);

      if (data && data.success !== false) {
        // Map the bulk test response to session format
        const newSession = {
          test_session_id: data.test_session_id,
          connection_id: data.connection_id,
          total_queries: data.total_queries_tested,
          passed: data.queries_passed,
          failed: data.queries_failed,
          average_accuracy: data.average_accuracy,
          tested_at: data.tested_at,
          test_duration_seconds: data.test_duration_seconds,
          sql_match_count: data.sql_match_count,
          result_match_count: data.result_match_count,
          // Include the results array directly from bulk test response
          results:
            data.results?.map((result) => ({
              query_history_id: result.query_history_id,
              natural_language_query: result.natural_language_query,
              expected_sql: result.corrected_sql,
              generated_sql: result.regenerated_sql,
              expected_result: result.corrected_result,
              actual_result: result.regenerated_result,
              corrected_results: result.corrected_results,
              regenerated_results: result.regenerated_results,
              sql_match: result.sql_comparison?.sql_match,
              result_match: result.result_comparison?.results_match,
              corrected_row_count:
                result.result_comparison?.corrected_row_count,
              regenerated_row_count:
                result.result_comparison?.regenerated_row_count,
              passed: result.passed,
              accuracy_score: result.accuracy_score,
              error: result.regenerated_error || result.corrected_error,
              execution_time_ms: result.regeneration_time_ms,
              diff_summary: result.sql_comparison?.diff_summary,
            })) || [],
        };

        console.log("📦 Mapped new session:", newSession);

        // Refresh sessions list to get updated data
        await fetchSessions(false);

        // Select the newly created session and close dialog
        setSelectedSession(newSession);
        setOpenRunDialog(false);
        setShowQuerySelector(false);
        setSelectedQueryIds([]);
        setQueryFilter("all");
      }
    } catch (err) {
      // Check if it was cancelled
      if (
        err.message === "Test cancelled by user" ||
        err.name === "AbortError"
      ) {
        console.log("🛑 Test was cancelled by user");
      } else {
        console.error("❌ Failed to run test:", err);
        console.error("Error details:", err.response?.data || err.message);
      }
    } finally {
      setRunningTest(false);
      abortControllerRef.current = null;
    }
  };

  // Filter results based on search and status
  const filteredResults =
    selectedSession?.results?.filter((r) => {
      // Search filter
      const matchesSearch =
        r.natural_language_query
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        r.expected_sql?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.generated_sql?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "failed" && !r.passed) ||
        (statusFilter === "passed" && r.passed);

      return matchesSearch && matchesStatus;
    }) || [];

  console.log("🔍 Filter Debug:", {
    selectedSession: selectedSession?.test_session_id,
    resultsCount: selectedSession?.results?.length,
    filteredCount: filteredResults.length,
    searchTerm,
    statusFilter,
  });

  if (!currentConnection) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Please select a database connection first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        bgcolor: "#f8fafc",
      }}
    >
      {/* Left Sidebar - Session History */}
      <Box
        sx={{
          width: 320,
          bgcolor: "white",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TimelineIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Test Runs
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => fetchSessions(false)}
              title="Refresh sessions"
              sx={{ color: theme.palette.primary.main }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<RunIcon />}
            onClick={() => setOpenRunDialog(true)}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0,120,215,0.3)",
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            New Test Run
          </Button>
        </Box>

        <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <LinearProgress />
            </Box>
          ) : sessions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center", opacity: 0.6 }}>
              <TimelineIcon
                sx={{ fontSize: 48, mb: 1, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                No test sessions yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click &ldquo;New Test Run&rdquo; to start
              </Typography>
            </Box>
          ) : (
            sessions.map((session) => (
              <React.Fragment key={session.test_session_id}>
                <ListItem
                  component="div"
                  selected={
                    selectedSession?.test_session_id === session.test_session_id
                  }
                  onClick={() => handleSelectSession(session)}
                  sx={{
                    py: 2,
                    px: 3,
                    cursor: "pointer",
                    borderLeft: "4px solid transparent",
                    "&.Mui-selected": {
                      bgcolor: `${theme.palette.primary.main}08`,
                      borderLeftColor: theme.palette.primary.main,
                    },
                    "&:hover": {
                      bgcolor: `${theme.palette.primary.main}05`,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {session.test_session_id.split("_")[1]
                            ? new Date(
                                session.test_session_id
                                  .split("_")[1]
                                  .replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
                              ).toLocaleDateString()
                            : session.test_session_id}
                        </Typography>
                        <Chip
                          label={`${Math.round(
                            session.average_accuracy * 100
                          )}%`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            bgcolor:
                              session.average_accuracy >= 0.8
                                ? `${theme.palette.success.main}20`
                                : session.average_accuracy >= 0.5
                                ? `${theme.palette.warning.main}20`
                                : `${theme.palette.error.main}20`,
                            color:
                              session.average_accuracy >= 0.8
                                ? theme.palette.success.main
                                : session.average_accuracy >= 0.5
                                ? theme.palette.warning.main
                                : theme.palette.error.main,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                        >
                          {session.total_queries || 0} Queries •{" "}
                          {session.passed || 0} Passed
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {selectedSession ? (
          <>
            {/* Header with Stats */}
            <Box
              sx={{
                p: 4,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="text.primary"
                  >
                    Test Results
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Session ID: {selectedSession.test_session_id}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Showing {filteredResults.length} of{" "}
                    {selectedSession.results?.length || 0} results
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: "white" }}
                    >
                      <MenuItem value="all">All Results</MenuItem>
                      <MenuItem value="passed">✓ Passed Only</MenuItem>
                      <MenuItem value="failed">✗ Failed Only</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    placeholder="Search results..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                    sx={{ width: 300 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Total Queries"
                    value={
                      selectedSession.total_queries_tested ||
                      selectedSession.total_queries ||
                      0
                    }
                    icon={<StorageIcon />}
                    color={theme.palette.primary.main}
                    subtext="Executed in batch"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Success Rate"
                    value={`${Math.round(
                      (selectedSession.average_accuracy || 0) * 100
                    )}%`}
                    icon={<SpeedIcon />}
                    color={
                      (selectedSession.average_accuracy || 0) >= 0.8
                        ? theme.palette.success.main
                        : theme.palette.warning.main
                    }
                    subtext={`${
                      selectedSession.queries_passed ||
                      selectedSession.passed ||
                      0
                    } Passed / ${
                      selectedSession.queries_failed ||
                      selectedSession.failed ||
                      0
                    } Failed`}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="SQL Matches"
                    value={
                      selectedSession.sql_match_count ||
                      selectedSession.results?.filter((r) => r.sql_match)
                        .length ||
                      0
                    }
                    icon={<CodeIcon />}
                    color={theme.palette.info.main}
                    subtext="Exact SQL syntax match"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Result Matches"
                    value={
                      selectedSession.result_match_count ||
                      selectedSession.results?.filter((r) => r.result_match)
                        .length ||
                      0
                    }
                    icon={<PassIcon />}
                    color={theme.palette.success.main}
                    subtext="Data execution match"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Results List */}
            <Box
              sx={{ flexGrow: 1, overflowY: "auto", p: 4, bgcolor: "#f8fafc" }}
            >
              {detailsLoading ? (
                <LinearProgress />
              ) : (
                <>
                  {filteredResults.map((result, index) => (
                    <ResultItem key={index} result={result} />
                  ))}
                  {filteredResults.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8, opacity: 0.6 }}>
                      <SearchIcon sx={{ fontSize: 64, mb: 2 }} />
                      <Typography variant="h6">
                        No results found matching your search
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <TimelineIcon sx={{ fontSize: 100, color: "divider", mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
              Select a test session to view details
            </Typography>
          </Box>
        )}
      </Box>

      {/* Run Test Dialog */}
      <Dialog
        open={openRunDialog}
        onClose={() => !runningTest && setOpenRunDialog(false)}
        maxWidth={showQuerySelector ? "lg" : "sm"}
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RunIcon color="primary" />
            Start New Regression Test
          </Box>
          {selectedQueryIds.length > 0 && (
            <Chip
              label={`${selectedQueryIds.length} queries selected`}
              color="primary"
              size="small"
              onDelete={handleClearSelection}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Execute queries from your training data against the current
              Knowledge Graph to verify accuracy.
            </Typography>

            {/* Toggle between Quick Config and Query Selector */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant={!showQuerySelector ? "contained" : "outlined"}
                onClick={() => {
                  setShowQuerySelector(false);
                  setSelectedQueryIds([]);
                }}
                size="small"
                startIcon={<SpeedIcon />}
              >
                Quick Test
              </Button>
              <Button
                variant={showQuerySelector ? "contained" : "outlined"}
                onClick={() => setShowQuerySelector(true)}
                size="small"
                startIcon={<QuizIcon />}
              >
                Select Queries
              </Button>
            </Box>

            {!showQuerySelector ? (
              // Quick Config Mode
              <>
                <TextField
                  label="Limit Queries"
                  type="number"
                  value={runConfig.limit}
                  onChange={(e) =>
                    setRunConfig({
                      ...runConfig,
                      limit: parseInt(e.target.value) || 10,
                    })
                  }
                  fullWidth
                  helperText="Number of training examples to test"
                />

                <TextField
                  label="Business Domain (Optional)"
                  value={runConfig.business_domain}
                  onChange={(e) =>
                    setRunConfig({
                      ...runConfig,
                      business_domain: e.target.value,
                    })
                  }
                  fullWidth
                  placeholder="e.g., collections, onboarding"
                  helperText="Filter specific domain queries only"
                />

                <FormControl fullWidth>
                  <InputLabel>Embedding Version</InputLabel>
                  <Select
                    value={runConfig.only_latest_embedding ? "latest" : "all"}
                    onChange={(e) =>
                      setRunConfig({
                        ...runConfig,
                        only_latest_embedding: e.target.value === "latest",
                      })
                    }
                    label="Embedding Version"
                  >
                    <MenuItem value="latest">Latest Version Only</MenuItem>
                    <MenuItem value="all">All Versions</MenuItem>
                  </Select>
                </FormControl>
              </>
            ) : (
              // Query Selector Mode
              <Box>
                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {testableQueryStats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Queries
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="info.main"
                      >
                        {testableQueryStats.distinct}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Distinct Questions
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="success.main"
                      >
                        {testableQueryStats.withExamples}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        With Examples
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="warning.main"
                      >
                        {testableQueryStats.markedCorrect}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Marked Correct
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Filter Tabs */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Button
                    size="small"
                    variant={queryFilter === "all" ? "contained" : "outlined"}
                    onClick={() => {
                      setQueryFilter("all");
                      setQueryPage(0);
                    }}
                    sx={{ minWidth: 80 }}
                  >
                    All ({testableQueries.length})
                  </Button>
                  <Button
                    size="small"
                    variant={
                      queryFilter === "distinct" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setQueryFilter("distinct");
                      setQueryPage(0);
                    }}
                    color="info"
                    sx={{ minWidth: 100 }}
                  >
                    Distinct ({testableQueryStats.distinct})
                  </Button>
                  <Button
                    size="small"
                    variant={
                      queryFilter === "duplicates" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setQueryFilter("duplicates");
                      setQueryPage(0);
                    }}
                    color="warning"
                    sx={{ minWidth: 120 }}
                  >
                    Duplicates (
                    {testableQueries.length - testableQueryStats.distinct})
                  </Button>
                </Box>

                {/* Search and Actions */}
                <Box
                  sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
                >
                  <TextField
                    placeholder="Search queries..."
                    size="small"
                    value={querySearchTerm}
                    onChange={(e) => {
                      setQuerySearchTerm(e.target.value);
                      setQueryPage(0);
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Tooltip title="Select all visible queries">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleSelectAllQueries}
                      startIcon={<SelectAllIcon />}
                    >
                      Select All
                    </Button>
                  </Tooltip>
                  <Tooltip title="Clear selection">
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleClearSelection}
                      startIcon={<ClearIcon />}
                      disabled={selectedQueryIds.length === 0}
                    >
                      Clear
                    </Button>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={fetchTestableQueries}
                    title="Refresh queries"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>

                {/* Query Table */}
                {testableQueriesLoading ? (
                  <Box sx={{ py: 4 }}>
                    <LinearProgress />
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: "block", textAlign: "center" }}
                    >
                      Loading testable queries...
                    </Typography>
                  </Box>
                ) : testableQueries.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No testable queries found. Make sure you have marked some
                    queries as correct or have learned examples.
                  </Alert>
                ) : (
                  <>
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        maxHeight: 400,
                        overflow: "auto",
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              padding="checkbox"
                              sx={{ bgcolor: "#f8fafc" }}
                            >
                              <Checkbox
                                indeterminate={
                                  selectedQueryIds.length > 0 &&
                                  selectedQueryIds.length <
                                    filteredTestableQueries.length
                                }
                                checked={
                                  filteredTestableQueries.length > 0 &&
                                  selectedQueryIds.length ===
                                    filteredTestableQueries.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleSelectAllQueries();
                                  } else {
                                    handleClearSelection();
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                            >
                              Query
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#f8fafc",
                                width: 120,
                              }}
                            >
                              Status
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#f8fafc",
                                width: 100,
                              }}
                            >
                              Version
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#f8fafc",
                                width: 100,
                              }}
                            >
                              By
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedQueries.map((query) => (
                            <TableRow
                              key={query.query_id}
                              hover
                              selected={selectedQueryIds.includes(
                                query.query_id
                              )}
                              onClick={() => handleToggleQuery(query.query_id)}
                              sx={{ cursor: "pointer" }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedQueryIds.includes(
                                    query.query_id
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() =>
                                    handleToggleQuery(query.query_id)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      maxWidth: 350,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {query.natural_language_query}
                                  </Typography>
                                  {isDuplicate(query) && (
                                    <Tooltip
                                      title={`This question has ${getDuplicateCount(
                                        query
                                      )} versions with different SQL`}
                                    >
                                      <Chip
                                        label={`${getDuplicateCount(query)}x`}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: "0.6rem",
                                          fontWeight: 700,
                                          bgcolor: `${theme.palette.warning.main}20`,
                                          color: theme.palette.warning.dark,
                                          border: `1px solid ${theme.palette.warning.main}`,
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    fontFamily: "monospace",
                                    fontSize: "0.7rem",
                                    maxWidth: 400,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {query.corrected_sql?.substring(0, 80)}...
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {query.has_learned_example && (
                                    <Tooltip title="Has learned example">
                                      <Chip
                                        icon={
                                          <SchoolIcon sx={{ fontSize: 14 }} />
                                        }
                                        label="Learned"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          bgcolor: `${theme.palette.success.main}15`,
                                          color: theme.palette.success.main,
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  {query.is_marked_correct && (
                                    <Tooltip title="Marked as correct">
                                      <Chip
                                        icon={
                                          <PassIcon sx={{ fontSize: 14 }} />
                                        }
                                        label="Correct"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          bgcolor: `${theme.palette.info.main}15`,
                                          color: theme.palette.info.main,
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {query.embedding_version ? (
                                  <Chip
                                    label={`v${query.embedding_version}`}
                                    size="small"
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                  />
                                ) : (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Tooltip title={query.marked_by || "Unknown"}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <PersonIcon
                                      sx={{
                                        fontSize: 14,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {query.marked_by?.substring(0, 8) || "-"}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      component="div"
                      count={filteredTestableQueries.length}
                      page={queryPage}
                      onPageChange={(e, newPage) => setQueryPage(newPage)}
                      rowsPerPage={queryRowsPerPage}
                      onRowsPerPageChange={(e) => {
                        setQueryRowsPerPage(parseInt(e.target.value, 10));
                        setQueryPage(0);
                      }}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                  </>
                )}
              </Box>
            )}

            {runningTest && (
              <Box>
                <LinearProgress />
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: "block", textAlign: "center" }}
                >
                  Running tests
                  {selectedQueryIds.length > 0
                    ? ` on ${selectedQueryIds.length} queries`
                    : ""}
                  ... this may take a minute.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          {runningTest ? (
            <Button
              onClick={handleCancelTest}
              color="error"
              variant="outlined"
              startIcon={<ClearIcon />}
            >
              Cancel Test
            </Button>
          ) : (
            <Button
              onClick={() => {
                setOpenRunDialog(false);
                setShowQuerySelector(false);
                setSelectedQueryIds([]);
              }}
            >
              Close
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleRunTest}
            disabled={
              runningTest ||
              (showQuerySelector && selectedQueryIds.length === 0)
            }
            startIcon={<RunIcon />}
            sx={{ bgcolor: theme.palette.primary.main, fontWeight: 700 }}
          >
            {showQuerySelector
              ? `Run Test (${selectedQueryIds.length} queries)`
              : `Run Test (${runConfig.limit} queries)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegressionTestingPage;
