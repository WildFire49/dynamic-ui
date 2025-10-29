"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PlayArrow,
  CheckCircle,
  School,
  Refresh,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";

const TrainingDataGenerator = ({
  connectionId,
  userId = "admin@company.com",
}) => {
  const [queryHistoryId, setQueryHistoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [operationId, setOperationId] = useState(null);
  const [status, setStatus] = useState(null);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchConfig, setBatchConfig] = useState({
    since_date: "",
    limit: 100,
    version_name: "",
  });

  const steps = [
    "Extract Schema",
    "Parse SQL",
    "Generate Business Logic",
    "Generate Tags",
    "Create Example",
    "Embed in ChromaDB",
  ];

  const stepMapping = {
    extract_schema: 0,
    parse_sql: 1,
    generate_business_logic: 2,
    generate_tags: 3,
    create_example: 4,
    embed_chromadb: 5,
    completed: 6,
  };

  useEffect(() => {
    let interval;
    if (operationId && status?.is_processing) {
      interval = setInterval(async () => {
        try {
          const statusData = await queryLearningService.getTrainingStatus(
            operationId
          );
          setStatus(statusData);

          if (!statusData.is_processing) {
            clearInterval(interval);
            if (statusData.current_step === "completed") {
              setSuccess("Training data generated successfully!");
              setOperationId(null);
            }
          }
        } catch (err) {
          setError(err.message);
          clearInterval(interval);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [operationId, status?.is_processing]);

  const handleGenerateTraining = async () => {
    if (!queryHistoryId.trim()) {
      setError("Please enter a query history ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setStatus(null);

    try {
      const result = await queryLearningService.generateTrainingData(
        queryHistoryId,
        connectionId,
        userId,
        true,
        true
      );
      setOperationId(result.operation_id);
      setStatus({ is_processing: true, progress_percentage: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchLearn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setStatus(null);

    try {
      const result = await queryLearningService.batchLearn(
        connectionId,
        userId,
        batchConfig.since_date,
        batchConfig.limit,
        true,
        batchConfig.version_name
      );
      setOperationId(result.operation_id);
      setStatus({ is_processing: true, progress_percentage: 0 });
      setBatchDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!status) return 0;
    return stepMapping[status.current_step] || 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Training Data Generator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate training examples from successful queries to improve AI
          accuracy
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Single Query Training */}
      <Paper sx={{ p: 3, mb: 3, border: "1px solid #e2e8f0" }}>
        <Typography variant="h6" gutterBottom>
          Generate from Single Query
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Mark a successful query as training data
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Query History ID"
            placeholder="Enter query UUID"
            value={queryHistoryId}
            onChange={(e) => setQueryHistoryId(e.target.value)}
            fullWidth
            disabled={loading || status?.is_processing}
          />
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleGenerateTraining}
            disabled={loading || status?.is_processing || !queryHistoryId}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              minWidth: 150,
            }}
          >
            Generate
          </Button>
        </Box>

        {/* Progress Indicator */}
        {status?.is_processing && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {status.message}
              </Typography>
              <Typography variant="body2" fontWeight="600" color="primary">
                {status.progress_percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={status.progress_percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 3,
                "& .MuiLinearProgress-bar": {
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                },
              }}
            />

            {/* Stepper */}
            <Stepper activeStep={getCurrentStep()} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index < getCurrentStep()}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        "&.Mui-completed": {
                          color: "#48bb78",
                        },
                        "&.Mui-active": {
                          color: "#667eea",
                        },
                      },
                    }}
                  >
                    <Typography variant="caption">{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {status.estimated_time_remaining_seconds && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 2 }}
              >
                Estimated time remaining: {status.estimated_time_remaining_seconds}s
              </Typography>
            )}
          </Box>
        )}

        {/* Completed */}
        {status && !status.is_processing && status.current_step === "completed" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              p: 3,
              background: "#d1fae5",
              borderRadius: 2,
            }}
          >
            <CheckCircle sx={{ color: "#065f46" }} />
            <Typography fontWeight="600" sx={{ color: "#065f46" }}>
              Training data generated successfully!
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Batch Learning */}
      <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
        <Typography variant="h6" gutterBottom>
          Batch Learning
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Learn from all correct queries in a date range
        </Typography>

        <Button
          variant="outlined"
          startIcon={<School />}
          onClick={() => setBatchDialogOpen(true)}
          disabled={loading || status?.is_processing}
          fullWidth
          sx={{
            py: 1.5,
            borderColor: "#667eea",
            color: "#667eea",
            "&:hover": {
              borderColor: "#764ba2",
              background: "rgba(102, 126, 234, 0.05)",
            },
          }}
        >
          Start Batch Learning
        </Button>
      </Paper>

      {/* Batch Learn Dialog */}
      <Dialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Batch Learn Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Since Date"
              type="date"
              value={batchConfig.since_date}
              onChange={(e) =>
                setBatchConfig({ ...batchConfig, since_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Learn from queries after this date"
            />
            <TextField
              label="Limit"
              type="number"
              value={batchConfig.limit}
              onChange={(e) =>
                setBatchConfig({
                  ...batchConfig,
                  limit: parseInt(e.target.value),
                })
              }
              fullWidth
              helperText="Maximum number of queries to process"
            />
            <TextField
              label="Version Name"
              placeholder="v1.1-batch-oct-24"
              value={batchConfig.version_name}
              onChange={(e) =>
                setBatchConfig({ ...batchConfig, version_name: e.target.value })
              }
              fullWidth
              helperText="Name for the new version"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBatchLearn}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Start Batch Learning
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingDataGenerator;
