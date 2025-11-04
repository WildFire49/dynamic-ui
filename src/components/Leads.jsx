"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Search,
  Close,
  Phone,
  LocationOn,
  Person,
  AttachMoney,
  BusinessCenter,
  Edit,
} from "@mui/icons-material";

// Mock data for prospects
const mockProspects = [
  {
    id: 1,
    name: "John Doe",
    address: "123 Main St, New York, NY 10001",
    requirement: "Home Loan",
    amount: "$250,000",
    sourcedBy: "Sarah Johnson",
    mobileNumber: "+1 (555) 123-4567",
    email: "john.doe@email.com",
    loanType: "Home Loan",
    income: "$85,000",
    creditScore: 720,
    employmentStatus: "Full-time",
    notes: "Looking for a 30-year fixed-rate mortgage",
  },
  {
    id: 2,
    name: "Jane Smith",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    requirement: "Personal Loan",
    amount: "$15,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 234-5678",
    email: "jane.smith@email.com",
    loanType: "Personal Loan",
    income: "$65,000",
    creditScore: 680,
    employmentStatus: "Full-time",
    notes: "Debt consolidation purpose",
  },
  {
    id: 3,
    name: "Robert Johnson",
    address: "789 Pine Rd, Chicago, IL 60601",
    requirement: "Business Loan",
    amount: "$500,000",
    sourcedBy: "Emily Davis",
    mobileNumber: "+1 (555) 345-6789",
    email: "robert.johnson@email.com",
    loanType: "Business Loan",
    income: "$150,000",
    creditScore: 750,
    employmentStatus: "Self-employed",
    notes: "Expanding restaurant business",
  },
  {
    id: 4,
    name: "Maria Garcia",
    address: "321 Elm St, Houston, TX 77001",
    requirement: "Auto Loan",
    amount: "$35,000",
    sourcedBy: "David Brown",
    mobileNumber: "+1 (555) 456-7890",
    email: "maria.garcia@email.com",
    loanType: "Auto Loan",
    income: "$72,000",
    creditScore: 695,
    employmentStatus: "Full-time",
    notes: "New SUV purchase",
  },
  {
    id: 5,
    name: "Michael Chen",
    address: "654 Maple Dr, Phoenix, AZ 85001",
    requirement: "Home Loan",
    amount: "$400,000",
    sourcedBy: "Sarah Johnson",
    mobileNumber: "+1 (555) 567-8901",
    email: "michael.chen@email.com",
    loanType: "Home Loan",
    income: "$125,000",
    creditScore: 780,
    employmentStatus: "Full-time",
    notes: "First-time home buyer",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    requirement: "Personal Loan",
    amount: "$25,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 678-9012",
    email: "lisa.anderson@email.com",
    loanType: "Personal Loan",
    income: "$58,000",
    creditScore: 670,
    employmentStatus: "Part-time",
    notes: "Medical expenses",
  },
  {
    id: 7,
    name: "Lisa Anderson",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    requirement: "Personal Loan",
    amount: "$25,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 678-9012",
    email: "lisa.anderson@email.com",
    loanType: "Personal Loan",
    income: "$58,000",
    creditScore: 670,
    employmentStatus: "Part-time",
    notes: "Medical expenses",
  },
  {
    id: 8,
    name: "Lisa Anderson",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    requirement: "Personal Loan",
    amount: "$25,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 678-9012",
    email: "lisa.anderson@email.com",
    loanType: "Personal Loan",
    income: "$58,000",
    creditScore: 670,
    employmentStatus: "Part-time",
    notes: "Medical expenses",
  },
  {
    id: 9,
    name: "Lisa Anderson",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    requirement: "Personal Loan",
    amount: "$25,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 678-9012",
    email: "lisa.anderson@email.com",
    loanType: "Personal Loan",
    income: "$58,000",
    creditScore: 670,
    employmentStatus: "Part-time",
    notes: "Medical expenses",
  },
  {
    id: 10,
    name: "Lisa Anderson",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    requirement: "Personal Loan",
    amount: "$25,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 678-9012",
    email: "lisa.anderson@email.com",
    loanType: "Personal Loan",
    income: "$58,000",
    creditScore: 670,
    employmentStatus: "Part-time",
    notes: "Medical expenses",
  },
  {
    id: 11,
    name: "Lisa Anderson",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    requirement: "Personal Loan",
    amount: "$25,000",
    sourcedBy: "Mike Williams",
    mobileNumber: "+1 (555) 678-9012",
    email: "lisa.anderson@email.com",
    loanType: "Personal Loan",
    income: "$58,000",
    creditScore: 670,
    employmentStatus: "Part-time",
    notes: "Medical expenses",
  },
];

const Leads = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filter prospects based on search query
  const filteredProspects = useMemo(() => {
    if (!searchQuery.trim()) return mockProspects;

    const query = searchQuery.toLowerCase();
    return mockProspects.filter(
      (prospect) =>
        prospect.name.toLowerCase().includes(query) ||
        prospect.address.toLowerCase().includes(query) ||
        prospect.requirement.toLowerCase().includes(query) ||
        prospect.sourcedBy.toLowerCase().includes(query) ||
        prospect.mobileNumber.includes(query)
    );
  }, [searchQuery]);

  const handleCardClick = (prospect) => {
    setSelectedProspect(prospect);
    setIsDialogOpen(true);
    setIsEditing(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProspect(null);
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 3 }}>
      {/* Search Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
          pt: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 3,
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            Lead Management
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, address, requirement, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {filteredProspects.length} prospect
            {filteredProspects.length !== 1 ? "s" : ""} found
          </Typography>
        </Box>
      </Box>

      {/* Prospects Grid */}
      <Box sx={{ maxWidth: 1600, mx: "auto", px: 2 }}>
        {filteredProspects.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            <Search
              sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No prospects found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your search criteria
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {filteredProspects.map((prospect) => (
              <Grid item key={prospect.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 24px ${alpha(
                        theme.palette.primary.main,
                        0.15
                      )}`,
                    },
                  }}
                  onClick={() => handleCardClick(prospect)}
                >
                  <CardContent
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        minHeight: "72px",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(prospect.name),
                          width: 56,
                          height: 56,
                          mr: 2,
                          fontSize: "1.25rem",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(prospect.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {prospect.name}
                        </Typography>
                        <Chip
                          label={prospect.requirement}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          minHeight: "38px",
                        }}
                      >
                        <LocationOn
                          sx={{
                            fontSize: 18,
                            color: theme.palette.text.secondary,
                            mt: 0.25,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.4,
                          }}
                        >
                          {prospect.address}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minHeight: "24px",
                        }}
                      >
                        <Phone
                          sx={{
                            fontSize: 18,
                            color: theme.palette.text.secondary,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}
                        >
                          {prospect.mobileNumber}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minHeight: "24px",
                        }}
                      >
                        <AttachMoney
                          sx={{
                            fontSize: 18,
                            color: theme.palette.text.secondary,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: theme.palette.success.main,
                            lineHeight: 1.4,
                          }}
                        >
                          {prospect.amount}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minHeight: "24px",
                        }}
                      >
                        <Person
                          sx={{
                            fontSize: 18,
                            color: theme.palette.text.secondary,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}
                        >
                          Sourced by: <strong>{prospect.sourcedBy}</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Customer Details Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: selectedProspect
                  ? getAvatarColor(selectedProspect.name)
                  : theme.palette.primary.main,
                width: 56,
                height: 56,
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {selectedProspect && getInitials(selectedProspect.name)}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, lineHeight: 1.3 }}
              >
                {selectedProspect?.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Customer Details
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton
              onClick={() => setIsEditing(!isEditing)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Edit fontSize="small" sx={{ color: "primary.main" }} />
            </IconButton>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedProspect && (
            <Grid
              container
              spacing={3}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={selectedProspect.name}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={selectedProspect.mobileNumber}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedProspect.email}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={selectedProspect.address}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  Loan Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Requirement"
                  value={selectedProspect.requirement}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={selectedProspect.amount}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Loan Type"
                  value={selectedProspect.loanType}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sourced By"
                  value={selectedProspect.sourcedBy}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  Financial Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Annual Income"
                  value={selectedProspect.income}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Credit Score"
                  value={selectedProspect.creditScore}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Employment Status"
                  value={selectedProspect.employmentStatus}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={selectedProspect.notes}
                  disabled={!isEditing}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions
          sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outlined">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  // Handle save logic here
                  setIsEditing(false);
                }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleCloseDialog} variant="contained">
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leads;
