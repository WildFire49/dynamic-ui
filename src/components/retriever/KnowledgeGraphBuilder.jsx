import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  AccountTree as GraphIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Info as InfoIcon,
} from "@mui/icons-material";
import fastKgService from "@/services/fastKgService";
import { COLORS, COMPONENT_STYLES, SPACING, BORDER_RADIUS } from "@/styles/retrieverStyles";

const KnowledgeGraphBuilder = ({ connectionId, schema, onKGBuilt, selectedTables }) => {
  const [loading, setLoading] = useState(false);
  const [kgStatus, setKgStatus] = useState(null);
  const [buildResult, setBuildResult] = useState(null);
  const [error, setError] = useState(null);
  const [forceRebuild, setForceRebuild] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [buildProgress, setBuildProgress] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  useEffect(() => {
    if (schema) {
      fetchKGStatus();
    }
  }, [schema]);

  useEffect(() => {
    console.log("🔄 KnowledgeGraphBuilder mounted/updated");
    console.log("📊 selectedTables prop received:", selectedTables);
    console.log("📊 selectedTables length:", selectedTables?.length);
  }, [selectedTables]);

  const fetchKGStatus = async () => {
    if (!connectionId) return;
    
    try {
      const response = await fastKgService.getStatus(connectionId);
      if (response.data.success) {
        setKgStatus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch KG status:", err);
    }
  };

  const pollBuildStatus = async (jobId) => {
    const pollInterval = 2000; // Poll every 2 seconds
    const maxAttempts = 300; // 10 minutes max (300 * 2 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await kgSqlService.getBuildStatus(jobId);
        const status = response.data;

        console.log("📊 Build status:", status.status);
        
        setBuildProgress(status.progress);

        if (status.status === "completed") {
          console.log("✅ Build completed successfully");
          setBuildResult(status.result);
          setKgStatus(status.result);
          setLoading(false);
          setBuildProgress(null);
          setCurrentJobId(null);

          if (onKGBuilt) {
            onKGBuilt(status.result);
          }
          return;
        }

        if (status.status === "failed") {
          console.log("❌ Build failed:", status.error);
          setError(status.error || "Build failed");
          setLoading(false);
          setBuildProgress(null);
          setCurrentJobId(null);
          return;
        }

        // Continue polling if in_progress or pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setError("Build timeout - exceeded maximum wait time");
          setLoading(false);
          setBuildProgress(null);
          setCurrentJobId(null);
        }
      } catch (err) {
        console.error("❌ Error polling build status:", err);
        setError("Failed to check build status");
        setLoading(false);
        setBuildProgress(null);
        setCurrentJobId(null);
      }
    };

    poll();
  };

  const handleBuildKG = async () => {
    if (!connectionId) {
      setError("Connection ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    setBuildResult(null);
    setBuildProgress({ message: "Starting build...", percent: 0 });

    console.log("🚀 handleBuildKG called with fast-kg API");
    console.log("📊 Connection ID:", connectionId);
    console.log("📊 Schema:", schema);
    console.log("📊 selectedTables:", selectedTables);

    try {
      const options = {
        include_enums: includeStatistics,
      };

      // Add table filter if tables are selected
      if (selectedTables && selectedTables.length > 0) {
        options.table_filter = selectedTables;
        console.log("✅ Building with", selectedTables.length, "selected tables");
      } else {
        console.log("⚠️ Building with all tables");
      }

      console.log("📤 Build options:", options);

      // Call fast-kg build API
      const response = await fastKgService.buildKG(connectionId, schema, options);

      console.log("✅ Build response:", response.data);

      if (response.data.success) {
        setBuildResult(response.data);
        setKgStatus(response.data);
        setBuildProgress({ message: "Build completed!", percent: 100 });
        
        setTimeout(() => {
          setLoading(false);
          setBuildProgress(null);
          
          if (onKGBuilt) {
            onKGBuilt(response.data);
          }
        }, 1000);
      }
    } catch (err) {
      console.error("❌ Error building KG:", err);
      setError(err.message || "Failed to build knowledge graph");
      setLoading(false);
      setBuildProgress(null);
    }
  };

  const handleClearKG = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear the knowledge graph? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await kgSqlService.clearKnowledgeGraph(schema);
      if (response.data.success) {
        setKgStatus(null);
        setBuildResult(null);
        alert("Knowledge graph cleared successfully");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to clear knowledge graph");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={COMPONENT_STYLES.connectionCard}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 0.5 }}>
            Knowledge Graph Builder
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Extract schema metadata and build knowledge graph
          </Typography>
        </Box>
        {kgStatus && (
          <Chip
            label="Active"
            color="success"
            size="small"
            icon={<CheckCircle sx={{ fontSize: 16 }} />}
            sx={{ ...COMPONENT_STYLES.statusChip, fontWeight: 500 }}
          />
        )}
      </Box>

      {kgStatus && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2, fontSize: "0.875rem" }}>
            Last updated: {new Date(kgStatus.timestamp).toLocaleString()}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: COLORS.background,
                  borderRadius: BORDER_RADIUS.medium,
                  border: `1px solid ${COLORS.borderLight}`,
                }}
              >
                <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 600, mb: 0.5 }}>
                  {kgStatus.table_count}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                  Tables
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: COLORS.background,
                  borderRadius: BORDER_RADIUS.medium,
                  border: `1px solid ${COLORS.borderLight}`,
                }}
              >
                <Typography variant="h5" sx={{ color: COLORS.success, fontWeight: 600, mb: 0.5 }}>
                  {kgStatus.column_count}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                  Columns
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: COLORS.background,
                  borderRadius: BORDER_RADIUS.medium,
                  border: `1px solid ${COLORS.borderLight}`,
                }}
              >
                <Typography variant="h5" sx={{ color: COLORS.warning, fontWeight: 600, mb: 0.5 }}>
                  {kgStatus.relationship_count}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                  Relations
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: COLORS.background,
                  borderRadius: BORDER_RADIUS.medium,
                  border: `1px solid ${COLORS.borderLight}`,
                }}
              >
                <Typography variant="h5" sx={{ color: COLORS.info, fontWeight: 600, mb: 0.5 }}>
                  {kgStatus.total_rows?.toLocaleString() || "N/A"}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                  Total Rows
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {selectedTables && selectedTables.length > 0 && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />} 
          sx={{ 
            mb: 2,
            borderRadius: BORDER_RADIUS.medium,
            border: `1px solid ${COLORS.info}20`,
            backgroundColor: `${COLORS.info}08`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
            {selectedTables.length} tables selected
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: COLORS.textSecondary }}>
            Estimated build time: {selectedTables.length <= 10 ? "30-60 seconds" : selectedTables.length <= 30 ? "2-3 minutes" : "5-10 minutes"}
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 3, flexWrap: "wrap" }}>
        <FormControlLabel
          control={
            <Switch
              checked={forceRebuild}
              onChange={(e) => setForceRebuild(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={<Typography variant="body2" sx={{ color: COLORS.textSecondary }}>Force Rebuild</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              checked={includeStatistics}
              onChange={(e) => setIncludeStatistics(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={<Typography variant="body2" sx={{ color: COLORS.textSecondary }}>Include Statistics</Typography>}
        />
      </Box>

      {loading && (
        <Box sx={{ mb: 3, p: 2.5, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.medium, border: `1px solid ${COLORS.borderLight}` }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
              Building Knowledge Graph
            </Typography>
            {buildProgress?.percent && (
              <Chip 
                label={`${buildProgress.percent}%`} 
                size="small" 
                sx={{ backgroundColor: COLORS.primary, color: "white", fontWeight: 600, height: "22px" }}
              />
            )}
          </Box>
          <LinearProgress sx={{ mb: 1.5, borderRadius: "4px", height: "6px" }} />
          <Typography variant="caption" sx={{ display: "block", color: COLORS.textSecondary }}>
            {buildProgress?.message || "Extracting schema metadata and building graph..."}
          </Typography>
          {currentJobId && (
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: COLORS.textMuted, fontFamily: "monospace", fontSize: "0.7rem" }}>
              Job: {currentJobId.slice(0, 8)}...
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={handleBuildKG}
          disabled={loading || !schema}
          sx={{
            ...COMPONENT_STYLES.actionButton,
            backgroundColor: COLORS.primary,
            "&:hover": { backgroundColor: COLORS.secondary },
          }}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <GraphIcon />}
        >
          {kgStatus ? "Rebuild" : "Build Knowledge Graph"}
        </Button>

        {kgStatus && (
          <>
            <Button
              variant="outlined"
              onClick={fetchKGStatus}
              disabled={loading}
              sx={COMPONENT_STYLES.actionButton}
              startIcon={<RefreshIcon />}
            >
              Refresh Status
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearKG}
              disabled={loading}
              sx={COMPONENT_STYLES.actionButton}
              startIcon={<DeleteIcon />}
            >
              Clear KG
            </Button>
          </>
        )}
      </Box>

      {buildResult && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mt: SPACING.md }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {buildResult.message}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            Built at: {new Date(buildResult.timestamp).toLocaleString()}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: SPACING.md }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default KnowledgeGraphBuilder;
