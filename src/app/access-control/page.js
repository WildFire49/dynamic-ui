"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES, ROLE_DISPLAY_NAMES } from "../../config/roleConfig";

export default function AccessControlPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    roleCode: "",
    roleName: "",
  });

  // Mock data - Replace with actual API calls
  const mockUsers = [
    {
      id: "1",
      username: "kishore",
      email: "kishore@mifix.io",
      roleCode: "RE-20920",
      roleName: "MIS",
      productCode: "MIFIX-AI",
    },
    {
      id: "2",
      username: "shrish",
      email: "shrish@mifix.io",
      roleCode: "RE-231875",
      roleName: "Product Lead",
      productCode: "MIFIX-AI",
    },
    {
      id: "3",
      username: "vaishakhsk",
      email: "vaishakh@mifix.io",
      roleCode: "RE-20448",
      roleName: "Super Admin",
      productCode: "MIFIX-AI",
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/users');
      // setUsers(response.data);

      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      showSnackbar("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        roleCode: user.roleCode,
        roleName: user.roleName,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        roleCode: "",
        roleName: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      roleCode: "",
      roleName: "",
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Replace with actual API call
      // if (editingUser) {
      //   await apiClient.put(`/users/${editingUser.id}`, formData);
      // } else {
      //   await apiClient.post('/users', formData);
      // }

      showSnackbar(
        editingUser ? "User updated successfully" : "User created successfully",
        "success"
      );
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      showSnackbar("Failed to save user", "error");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await apiClient.delete(`/users/${userId}`);

      showSnackbar("User deleted successfully", "success");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar("Failed to delete user", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getRoleColor = (roleCode) => {
    switch (roleCode) {
      case ROLES.SUPER_ADMIN:
        return "error";
      case ROLES.PRODUCT_LEAD:
        return "primary";
      case ROLES.MIS:
        return "secondary";
      default:
        return "default";
    }
  };

  const getRoleIcon = (roleCode) => {
    switch (roleCode) {
      case ROLES.SUPER_ADMIN:
        return <AdminIcon />;
      case ROLES.PRODUCT_LEAD:
        return <SecurityIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Stats cards
  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <PersonIcon />,
      color: "#1976d2",
    },
    {
      label: "Super Admins",
      value: users.filter((u) => u.roleCode === ROLES.SUPER_ADMIN).length,
      icon: <AdminIcon />,
      color: "#d32f2f",
    },
    {
      label: "Product Leads",
      value: users.filter((u) => u.roleCode === ROLES.PRODUCT_LEAD).length,
      icon: <SecurityIcon />,
      color: "#1976d2",
    },
    {
      label: "MIS Users",
      value: users.filter((u) => u.roleCode === ROLES.MIS).length,
      icon: <PersonIcon />,
      color: "#9c27b0",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#fff",
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <SecurityIcon sx={{ fontSize: 40 }} />
              Access Control
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Manage user roles and permissions
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                    color: "#fff",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          borderRadius: 2,
                          p: 1.5,
                          display: "flex",
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Users Table */}
          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                }}
              >
                Add User
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {getRoleIcon(user.roleCode)}
                            <Typography sx={{ fontWeight: 500 }}>
                              {user.username}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.roleName}
                            color={getRoleColor(user.roleCode)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              bgcolor: "#f5f5f5",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: "inline-block",
                            }}
                          >
                            {user.roleCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.productCode}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(user)}
                              sx={{ color: "#1976d2" }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user.id)}
                              sx={{ color: "#d32f2f" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>

        {/* Add/Edit User Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Username"
                fullWidth
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.roleCode}
                  label="Role"
                  onChange={(e) => {
                    const roleCode = e.target.value;
                    setFormData({
                      ...formData,
                      roleCode,
                      roleName: ROLE_DISPLAY_NAMES[roleCode] || "",
                    });
                  }}
                >
                  {Object.entries(ROLES).map(([key, value]) => (
                    <MenuItem key={value} value={value}>
                      {ROLE_DISPLAY_NAMES[value]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                !formData.username || !formData.email || !formData.roleCode
              }
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ProtectedRoute>
  );
}
