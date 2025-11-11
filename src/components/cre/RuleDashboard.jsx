import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { mockRules, loanTypes, outcomes } from "./mockData";

const RuleDashboard = () => {
  const theme = useTheme();
  const router = useRouter();
  const [rules, setRules] = useState(mockRules);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleStatus = (ruleId) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === ruleId ? { ...rule, status: !rule.status } : rule
      )
    );
  };

  const handleEdit = (ruleId) => {
    router.push(`/configurator/cre/edit/${ruleId}`);
  };

  const handleDelete = (ruleId) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      setRules((prevRules) => prevRules.filter((rule) => rule.id !== ruleId));
    }
  };

  const handleViewHistory = (ruleId) => {
    alert(`Viewing history for rule ${ruleId}`);
  };

  const handleCreateNew = () => {
    router.push("/configurator/cre/create");
  };

  const getOutcomeColor = (outcome) => {
    const outcomeConfig = outcomes.find((o) => o.id === outcome);
    return outcomeConfig?.color || "default";
  };

  const getLoanTypeLabels = (loanTypeIds) => {
    return loanTypeIds
      .map((id) => loanTypes.find((lt) => lt.id === id)?.label || id)
      .join(", ");
  };

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Credit Rule Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and configure credit decisioning rules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            py: 1.5,
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          Create New Rule
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder="Search rules by name, ID, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Tooltip title="Advanced Filters">
            <IconButton
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {/* Rules Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <TableCell sx={{ fontWeight: 700, width: 100 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 100 }}>Rule ID</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                Rule Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                Applies To
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>
                Summary of Logic
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }}>
                Outcome
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 150 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No rules found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow
                  key={rule.id}
                  hover
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Switch
                      checked={rule.status}
                      onChange={() => handleToggleStatus(rule.id)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.id}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {rule.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {getLoanTypeLabels(rule.loanTypes)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {rule.summary}
                    </Typography>
                    {rule.exceptions.length > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          color: theme.palette.warning.main,
                          fontStyle: "italic",
                        }}
                      >
                        Except: {getLoanTypeLabels(rule.exceptions)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.outcome.toUpperCase()}
                      size="small"
                      color={getOutcomeColor(rule.outcome)}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <Tooltip title="Edit Rule">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(rule.id)}
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View History">
                        <IconButton
                          size="small"
                          onClick={() => handleViewHistory(rule.id)}
                          sx={{
                            color: theme.palette.info.main,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                            },
                          }}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Rule">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(rule.id)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Stats */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3,
          justifyContent: "flex-end",
        }}
      >
        <Chip
          label={`Total Rules: ${rules.length}`}
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`Active: ${rules.filter((r) => r.status).length}`}
          color="success"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`Inactive: ${rules.filter((r) => !r.status).length}`}
          color="default"
          sx={{ fontWeight: 600 }}
        />
      </Box>
    </Box>
  );
};

export default RuleDashboard;
