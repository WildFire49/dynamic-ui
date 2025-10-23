import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudDone as CloudDoneIcon,
  DnsOutlined as ServerIcon,
  Lock as SecurityIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import connectionService from "@/services/connectionService";
import useRetrieverStore from "@/store/retrieverStore";
import {
  COLORS,
  COMPONENT_STYLES,
  SPACING,
  BORDER_RADIUS,
} from "@/styles/retrieverStyles";

const DatabaseConnection = ({ onConnectionSuccess }) => {
  const {
    userId,
    savedConnections,
    setSavedConnections,
    addSavedConnection,
    removeSavedConnection,
  } = useRetrieverStore();

  const [tabValue, setTabValue] = useState(0);
  const [connectionData, setConnectionData] = useState({
    connection_name: "",
    host: "",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
    connection_params: { schema: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);

  // Load saved connections on mount
  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await connectionService.listConnections(userId);
      setSavedConnections(response.data || []);
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    if (field === "schema") {
      setConnectionData((prev) => ({
        ...prev,
        connection_params: { ...prev.connection_params, schema: value },
      }));
    } else {
      setConnectionData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    setStatus(null);
    setError(null);
  };

  const handleCreateConnection = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await connectionService.createConnection(
        userId,
        connectionData
      );

      if (response.data.connection_id) {
        setStatus({
          type: "success",
          message: "Connection created successfully!",
        });

        // Reload connections
        await loadSavedConnections();

        // Clear form
        setConnectionData({
          connection_name: "",
          host: "",
          port: 5432,
          database_name: "",
          username: "",
          password: "",
          connection_params: { schema: "" },
        });

        // Switch to saved connections tab
        setTabValue(0);
      }
    } catch (err) {
      setError(err.message || "Failed to create connection");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConnection = (connection) => {
    if (onConnectionSuccess) {
      onConnectionSuccess({
        id: connection.id,
        host: connection.host,
        port: connection.port,
        database: connection.database_name,
        schema: "staging_dashboard", // Default schema
        connection_name: connection.name,
      });
    }
  };

  const handleDeleteConnection = async () => {
    if (!connectionToDelete) return;

    try {
      await connectionService.deleteConnection(connectionToDelete.id);
      removeSavedConnection(connectionToDelete.id);
      setDeleteDialogOpen(false);
      setConnectionToDelete(null);
    } catch (err) {
      setError("Failed to delete connection");
    }
  };

  const openDeleteDialog = (connection) => {
    setConnectionToDelete(connection);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "#0078d715",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StorageIcon sx={{ fontSize: 24, color: "#0078d7" }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1a202c", mb: 0.5 }}
              >
                Database Connection
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Select a saved connection or create a new one
              </Typography>
            </Box>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
            "& .MuiTab-root": {
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              minHeight: 48,
            },
          }}
        >
          <Tab label={`Saved Connections (${savedConnections.length})`} />
          <Tab label="New Connection" icon={<AddIcon />} iconPosition="start" />
        </Tabs>

        {/* Saved Connections Tab */}
        {tabValue === 0 && (
          <Box>
            {loadingConnections ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : savedConnections.length === 0 ? (
              <Alert
                severity="info"
                sx={{ borderRadius: BORDER_RADIUS.medium }}
              >
                No saved connections. Create a new connection to get started.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {savedConnections.map((conn) => (
                  <Grid item xs={12} md={6} key={conn.id}>
                    <Card
                      sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 3,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          borderColor: "#0078d7",
                          boxShadow: "0 4px 20px rgba(0,120,215,0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "#0078d715",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <StorageIcon
                                sx={{ fontSize: 20, color: "#0078d7" }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "1.1rem",
                                  color: "#1a202c",
                                }}
                              >
                                {conn.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#64748b", fontSize: "0.875rem" }}
                              >
                                {conn.host}:{conn.port}
                              </Typography>
                            </Box>
                          </Box>
                          {conn.is_active && (
                            <Chip
                              label="Active"
                              size="small"
                              sx={{
                                bgcolor: "#48bb7815",
                                color: "#48bb78",
                                fontWeight: 600,
                                height: 24,
                                fontSize: "0.75rem",
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", mb: 1 }}
                        >
                          Database: <strong>{conn.database_name}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Created:{" "}
                          {new Date(conn.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleSelectConnection(conn)}
                          sx={{
                            bgcolor: "#0078d7",
                            "&:hover": { bgcolor: "#005a9e" },
                            borderRadius: 2,
                            fontWeight: 600,
                            flex: 1,
                          }}
                          startIcon={<CloudDoneIcon />}
                        >
                          Connect
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => openDeleteDialog(conn)}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: "auto",
                            px: 2,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* New Connection Tab */}
        {tabValue === 1 && (
          <Box>
            {/* Info Alert */}
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                mb: 2.5,
                borderRadius: 2,
                border: "1px solid #0078d720",
                bgcolor: "#0078d708",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: "0.875rem" }}
              >
                Configure your PostgreSQL database connection details
              </Typography>
            </Alert>

            {/* Cards in One Row */}
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              {/* Connection Identity Card */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "2px solid #e2e8f0",
                    borderRadius: 2,
                    bgcolor: "#fafbfc",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: "#0078d715",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <StorageIcon sx={{ fontSize: 18, color: "#0078d7" }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: "#1a202c",
                        }}
                      >
                        Connection Identity
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontSize: "0.75rem" }}
                      >
                        Name your connection
                      </Typography>
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    label="Connection Name"
                    value={connectionData.connection_name}
                    onChange={handleInputChange("connection_name")}
                    placeholder="Production DB"
                    required
                    size="small"
                    helperText="Friendly identifier"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        "& fieldset": {
                          borderColor: "#e2e8f0",
                          borderWidth: 2,
                        },
                        "&:hover fieldset": { borderColor: "#0078d7" },
                        "&.Mui-focused fieldset": { borderColor: "#0078d7" },
                      },
                    }}
                  />
                </Paper>
              </Grid>

              {/* Server Details Card */}
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "2px solid #e2e8f0",
                    borderRadius: 2,
                    bgcolor: "#fafbfc",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: "#48bb7815",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ServerIcon sx={{ fontSize: 18, color: "#48bb78" }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: "#1a202c",
                        }}
                      >
                        Server Details
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontSize: "0.75rem" }}
                      >
                        Database server connection information
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        label="Host Address"
                        value={connectionData.host}
                        onChange={handleInputChange("host")}
                        placeholder="localhost"
                        required
                        size="small"
                        helperText="Server hostname or IP address"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#e2e8f0",
                              borderWidth: 2,
                            },
                            "&:hover fieldset": { borderColor: "#48bb78" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#48bb78",
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Port"
                        type="number"
                        value={connectionData.port}
                        onChange={handleInputChange("port")}
                        placeholder="5432"
                        required
                        size="small"
                        helperText="Default: 5432"
                        sx={{
                          width: 100,
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#e2e8f0",
                              borderWidth: 2,
                            },
                            "&:hover fieldset": { borderColor: "#48bb78" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#48bb78",
                            },
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Database Name"
                      value={connectionData.database_name}
                      onChange={handleInputChange("database_name")}
                      placeholder="mydb"
                      required
                      size="small"
                      helperText="The specific database to connect to"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "& fieldset": {
                            borderColor: "#e2e8f0",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": { borderColor: "#48bb78" },
                          "&.Mui-focused fieldset": { borderColor: "#48bb78" },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Schema (Optional)"
                      value={connectionData.connection_params.schema}
                      onChange={handleInputChange("schema")}
                      placeholder="public"
                      size="small"
                      helperText="Leave empty for default schema"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "& fieldset": {
                            borderColor: "#e2e8f0",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": { borderColor: "#48bb78" },
                          "&.Mui-focused fieldset": { borderColor: "#48bb78" },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Authentication Card */}
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "2px solid #e2e8f0",
                    borderRadius: 2,
                    bgcolor: "#fafbfc",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: "#9c27b015",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SecurityIcon sx={{ fontSize: 18, color: "#9c27b0" }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: "#1a202c",
                        }}
                      >
                        Authentication
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontSize: "0.75rem" }}
                      >
                        Database credentials
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Username"
                      value={connectionData.username}
                      onChange={handleInputChange("username")}
                      placeholder="postgres"
                      required
                      size="small"
                      helperText="Database user with appropriate permissions"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "& fieldset": {
                            borderColor: "#e2e8f0",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": { borderColor: "#9c27b0" },
                          "&.Mui-focused fieldset": { borderColor: "#9c27b0" },
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={connectionData.password}
                      onChange={handleInputChange("password")}
                      placeholder="••••••••"
                      required
                      size="small"
                      helperText="Your password is encrypted and stored securely"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "& fieldset": {
                            borderColor: "#e2e8f0",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": { borderColor: "#9c27b0" },
                          "&.Mui-focused fieldset": { borderColor: "#9c27b0" },
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Action Buttons - Separated at Bottom */}
            <Box
              sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setConnectionData({
                    connection_name: "",
                    host: "",
                    port: 5432,
                    database_name: "",
                    username: "",
                    password: "",
                    connection_params: { schema: "" },
                  });
                  setStatus(null);
                  setError(null);
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 4,
                  py: 1.2,
                  borderWidth: 2,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "#cbd5e0",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                Clear Form
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateConnection}
                disabled={
                  loading ||
                  !connectionData.connection_name ||
                  !connectionData.host ||
                  !connectionData.database_name ||
                  !connectionData.username ||
                  !connectionData.password
                }
                sx={{
                  background:
                    "linear-gradient(135deg, #0078d7 0%, #005a9e 100%)",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 6,
                  py: 1.2,
                  boxShadow: "0 4px 12px rgba(0,120,215,0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #005a9e 0%, #004578 100%)",
                    boxShadow: "0 6px 16px rgba(0,120,215,0.4)",
                  },
                  "&:disabled": {
                    background: "#e2e8f0",
                    color: "#94a3b8",
                    boxShadow: "none",
                  },
                }}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <CloudDoneIcon />
                  )
                }
              >
                {loading ? "Creating Connection..." : "Create Connection"}
              </Button>
            </Box>

            {/* Status Messages */}
            {status && (
              <Alert
                severity="success"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  border: "1px solid #48bb7840",
                  bgcolor: "#48bb7810",
                }}
                icon={<CheckCircle />}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {status.message}
                </Typography>
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  border: "1px solid #f4433640",
                  bgcolor: "#f4433610",
                }}
                icon={<ErrorIcon />}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {error}
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Connection?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the connection "
            {connectionToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConnection}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatabaseConnection;
