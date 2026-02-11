"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const AnalysisWidget = dynamic(
  () => import("../../components/widgets/AnalysisWidget"),
  { ssr: false }
);

const STORAGE_KEY = "reconDashboardItems";

export default function ReconciliationDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load saved items from localStorage
  const loadItems = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading reconciliation dashboard items:", e);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updated = items.filter((item) => item.id !== itemToDelete);
      setItems(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleClearAll = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Tooltip title="Back to Chat">
              <IconButton onClick={() => router.push("/")} size="small">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <DashboardIcon
              sx={{ fontSize: 28, color: theme.palette.primary.main }}
            />
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                Reconciliation Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {items.length} saved{" "}
                {items.length === 1 ? "analysis" : "analyses"}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={loadItems} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {items.length > 0 && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={handleClearAll}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 3, maxWidth: 1600, mx: "auto" }}>
        {items.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 3,
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <DashboardIcon
              sx={{
                fontSize: 64,
                color: alpha(theme.palette.primary.main, 0.2),
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Reconciliation Analyses Saved
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
            >
              Run a reconciliation from the chat and click &quot;Save to
              Dashboard&quot; to see your results here.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/")}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Go to Chat
            </Button>
          </Paper>
        ) : (
          <Stack spacing={4}>
            {items.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )}`,
                  overflow: "hidden",
                }}
              >
                {/* Item header */}
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.5
                    )}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {item.title || "Reconciliation Analysis"}
                    </Typography>
                    <Chip
                      label={new Date(item.timestamp).toLocaleString()}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        height: 22,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Stack>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      sx={{
                        color: theme.palette.error.main,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Render the full AnalysisWidget with saved data */}
                <Box sx={{ p: 2 }}>
                  <AnalysisWidget
                    data={item.data}
                    title={item.title}
                    initialExpandedStates={item.expandedStates}
                  />
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Remove Analysis</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this reconciliation analysis from the
            dashboard?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
