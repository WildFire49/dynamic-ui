import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Chip,
  OutlinedInput,
  alpha,
  Paper,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import {
  loanTypes,
  accountStatuses,
  fields,
  timePeriods,
  numericOperators,
  textOperators,
  loanStatuses,
  outcomes,
  mockRules,
} from "./mockData";

const RuleConfiguration = ({ ruleId = null }) => {
  const theme = useTheme();
  const router = useRouter();
  const isEditMode = !!ruleId;

  // Form state
  const [formData, setFormData] = useState({
    ruleName: "",
    status: true,
    ruleId: "",
    loanTypes: [],
    accountStatus: "any",
    field: "",
    timePeriod: "",
    operator: "",
    value: "",
    value2: "", // For 'between' operator
    outcome: "",
    exceptions: [],
  });

  // Load existing rule data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const existingRule = mockRules.find((r) => r.id === ruleId);
      if (existingRule) {
        setFormData({
          ruleName: existingRule.name,
          status: existingRule.status,
          ruleId: existingRule.id,
          loanTypes: existingRule.loanTypes,
          accountStatus: "any",
          field: existingRule.field,
          timePeriod: existingRule.timePeriod,
          operator: existingRule.operator,
          value: Array.isArray(existingRule.value)
            ? existingRule.value
            : existingRule.value,
          value2: "",
          outcome: existingRule.outcome,
          exceptions: existingRule.exceptions,
        });
      }
    } else {
      // Auto-generate rule ID for new rules
      const nextId = `R${mockRules.length + 1}`;
      setFormData((prev) => ({ ...prev, ruleId: nextId }));
    }
  }, [ruleId, isEditMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset dependent fields when field changes
      if (field === "field") {
        updated.operator = "";
        updated.value = "";
        updated.value2 = "";
        updated.timePeriod = "";
      }

      return updated;
    });
  };

  const selectedField = fields.find((f) => f.id === formData.field);
  const availableOperators =
    selectedField?.type === "numeric" ? numericOperators : textOperators;

  const handleSave = () => {
    // Validation
    if (!formData.ruleName.trim()) {
      alert("Please enter a rule name");
      return;
    }
    if (formData.loanTypes.length === 0) {
      alert("Please select at least one loan type");
      return;
    }
    if (!formData.field) {
      alert("Please select a field/column");
      return;
    }
    if (!formData.operator) {
      alert("Please select an operator");
      return;
    }
    if (!formData.value) {
      alert("Please enter a value");
      return;
    }
    if (!formData.outcome) {
      alert("Please select an outcome");
      return;
    }

    // Save logic here
    console.log("Saving rule:", formData);
    alert(
      isEditMode
        ? "Rule updated successfully!"
        : "Rule created and activated successfully!"
    );
    router.push("/configurator/cre");
  };

  const handleCancel = () => {
    router.push("/configurator/cre");
  };

  const handleViewHistory = () => {
    alert("Viewing version history...");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {isEditMode ? "Edit Rule" : "Create New Rule"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode
            ? "Modify the configuration of an existing credit rule"
            : "Define a new credit decisioning rule"}
        </Typography>
      </Box>

      {/* Section 1: Rule Details */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
        >
          1. Rule Details
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            label="Rule Name *"
            value={formData.ruleName}
            onChange={(e) => handleChange("ruleName", e.target.value)}
            placeholder="e.g., Reject on Recent High DPD for Consumer Loans"
            helperText="A descriptive name for this rule"
          />
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Rule ID"
              value={formData.ruleId}
              disabled={isEditMode}
              onChange={(e) => handleChange("ruleId", e.target.value)}
              sx={{ width: 200 }}
              helperText="Auto-generated unique identifier"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={(e) => handleChange("status", e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">Status:</Typography>
                  <Chip
                    label={formData.status ? "Active" : "Inactive"}
                    size="small"
                    color={formData.status ? "success" : "default"}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              }
            />
          </Box>
        </Box>
      </Card>

      {/* Section 2: Rule Scope */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
        >
          2. Rule Scope (When does this rule apply?)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <FormControl fullWidth>
            <InputLabel>Loan Types *</InputLabel>
            <Select
              multiple
              value={formData.loanTypes}
              onChange={(e) => handleChange("loanTypes", e.target.value)}
              input={<OutlinedInput label="Loan Types *" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        loanTypes.find((lt) => lt.id === value)?.label || value
                      }
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {loanTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Account Status</InputLabel>
            <Select
              value={formData.accountStatus}
              onChange={(e) => handleChange("accountStatus", e.target.value)}
              label="Account Status"
            >
              {accountStatuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Section 3: Condition */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
        >
          3. Condition (IF...)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <FormControl fullWidth>
            <InputLabel>Field / Column *</InputLabel>
            <Select
              value={formData.field}
              onChange={(e) => handleChange("field", e.target.value)}
              label="Field / Column *"
            >
              {fields.map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedField?.requiresTimePeriod && (
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={formData.timePeriod}
                onChange={(e) => handleChange("timePeriod", e.target.value)}
                label="Time Period"
              >
                {timePeriods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {formData.field && (
            <FormControl fullWidth>
              <InputLabel>Operator *</InputLabel>
              <Select
                value={formData.operator}
                onChange={(e) => handleChange("operator", e.target.value)}
                label="Operator *"
              >
                {availableOperators.map((op) => (
                  <MenuItem key={op.id} value={op.id}>
                    {op.label} ({op.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {formData.operator && (
            <>
              {formData.operator === "between" ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Value From *"
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleChange("value", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Value To *"
                    type="number"
                    value={formData.value2}
                    onChange={(e) => handleChange("value2", e.target.value)}
                  />
                </Box>
              ) : selectedField?.type === "numeric" ? (
                <TextField
                  fullWidth
                  label="Value *"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder="Enter numeric value"
                />
              ) : formData.field === "loan_status" &&
                (formData.operator === "includes" ||
                  formData.operator === "equals") ? (
                <FormControl fullWidth>
                  <InputLabel>Loan Status Values *</InputLabel>
                  <Select
                    multiple
                    value={
                      Array.isArray(formData.value) ? formData.value : []
                    }
                    onChange={(e) => handleChange("value", e.target.value)}
                    input={<OutlinedInput label="Loan Status Values *" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={
                              loanStatuses.find((ls) => ls.id === value)
                                ?.label || value
                            }
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {loanStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label="Value *"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder="Enter value"
                />
              )}
            </>
          )}
        </Box>
      </Card>

      {/* Section 4: Outcome & Exceptions */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
        >
          4. Outcome & Exceptions (THEN... EXCEPT...)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <FormControl fullWidth>
            <InputLabel>Outcome *</InputLabel>
            <Select
              value={formData.outcome}
              onChange={(e) => handleChange("outcome", e.target.value)}
              label="Outcome *"
            >
              {outcomes.map((outcome) => (
                <MenuItem key={outcome.id} value={outcome.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={outcome.label}
                      size="small"
                      color={outcome.color}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Exceptions (Exclude Loan Types)</InputLabel>
            <Select
              multiple
              value={formData.exceptions}
              onChange={(e) => handleChange("exceptions", e.target.value)}
              input={<OutlinedInput label="Exceptions (Exclude Loan Types)" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        loanTypes.find((lt) => lt.id === value)?.label || value
                      }
                      size="small"
                      color="warning"
                    />
                  ))}
                </Box>
              )}
            >
              {loanTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Action Bar */}
      <Paper
        elevation={3}
        sx={{
          position: "sticky",
          bottom: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: `0 -2px 12px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={handleViewHistory}
          disabled={!isEditMode}
          sx={{ textTransform: "none" }}
        >
          View Version History
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              textTransform: "none",
              px: 4,
              boxShadow: `0 4px 12px ${alpha(
                theme.palette.primary.main,
                0.3
              )}`,
            }}
          >
            {isEditMode ? "Save Changes" : "Save & Activate"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RuleConfiguration;
