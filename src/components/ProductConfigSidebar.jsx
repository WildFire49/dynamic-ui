"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  alpha,
  useTheme,
  LinearProgress,
  Chip,
  TextField,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Layers,
  Assignment,
  Schedule,
  Info,
  Warning,
  TrendingUp,
  Business,
  Calculate,
  Receipt,
  Percent,
  Link as LinkIcon,
  Category,
  AttachMoney,
  AccountBalance,
  Security,
  Person,
  Assessment,
  Pets,
  CheckCircleOutline,
  HelpOutline,
  ErrorOutline,
  Lightbulb,
  Science,
} from "@mui/icons-material";

// Icon mapping
const iconMap = {
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Layers,
  Assignment,
  Schedule,
  Info,
  Warning,
  TrendingUp,
  Business,
  Calculate,
  Receipt,
  Percent,
  Link: LinkIcon,
  Category,
  AttachMoney,
  AccountBalance,
  Security,
  Person,
  Assessment,
  Pets,
  CheckCircleOutline,
  HelpOutline,
  ErrorOutline,
  Lightbulb,
  Science,
};

/**
 * ProductConfigSidebar - Context-aware sidebar showing calculations and info
 * Renders different sections based on current stage
 * 
 * @param {Object} config - Sidebar configuration from JSON
 * @param {Array} stages - List of stages
 * @param {Number} currentStageIndex - Current active stage index
 * @param {Object} formData - Form data for calculations
 */
const ProductConfigSidebar = ({ config, stages = [], currentStageIndex = 0, formData = {} }) => {
  const theme = useTheme();
  const [simulatorInputs, setSimulatorInputs] = React.useState({});
  
  // Get current stage ID
  const currentStage = stages[currentStageIndex];
  const currentStageId = currentStage?.id;
  
  // Get context sections for current stage
  const contextSections = config?.stageContexts?.[currentStageId] || [];

  // Handle simulator input change
  const handleSimulatorInput = (sectionId, value) => {
    setSimulatorInputs(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const renderIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon /> : null;
  };

  // Format values based on type
  const formatValue = (value, format, suffix = "") => {
    if (!value && value !== 0) return "—";
    
    switch (format) {
      case "currency":
        return `₹ ${parseFloat(value).toLocaleString("en-IN")}`;
      case "percentage":
        return `${value}%`;
      case "number":
        return `${value}${suffix ? ` ${suffix}` : ""}`;
      case "text":
      default:
        return `${value}${suffix ? ` ${suffix}` : ""}`;
    }
  };

  // Get form value by key
  const getFormValue = (key) => {
    // Check if key is in current stage's form data
    if (currentStageId && formData[currentStageId]) {
      return formData[currentStageId][key];
    }
    // Check all stages
    for (const stageKey in formData) {
      if (formData[stageKey][key] !== undefined) {
        return formData[stageKey][key];
      }
    }
    return null;
  };

  const renderProgress = (section) => {
    const progress = ((currentStageIndex + 1) / stages.length) * 100;
    
    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: "0.875rem" }}
          >
            {section.title}
          </Typography>
          {section.showPercentage && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontSize: "1.25rem",
              }}
            >
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              transition: "width 0.3s ease-in-out",
            }}
          />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1, fontSize: "0.75rem" }}
        >
          Stage {currentStageIndex + 1} of {stages.length}
        </Typography>
      </Box>
    );
  };

  const renderChecklist = (section) => {
    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.875rem",
            mb: 1.5,
          }}
        >
          {section.title}
        </Typography>
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          let icon = section.pendingIcon;
          let iconColor = theme.palette.text.disabled;
          let bgColor = alpha(theme.palette.grey[300], 0.2);

          if (isCompleted) {
            icon = section.completedIcon;
            iconColor = theme.palette.success.main;
            bgColor = alpha(theme.palette.success.main, 0.1);
          } else if (isCurrent) {
            icon = section.currentIcon;
            iconColor = theme.palette.primary.main;
            bgColor = alpha(theme.palette.primary.main, 0.1);
          }

          return (
            <Box
              key={stage.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: isCurrent ? bgColor : "transparent",
                border: `1px solid ${isCurrent ? iconColor : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              {section.showNumbers ? (
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: isCompleted
                      ? theme.palette.success.main
                      : isCurrent
                      ? theme.palette.primary.main
                      : alpha(theme.palette.grey[300], 0.3),
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? "✓" : index + 1}
                </Box>
              ) : (
                <Box sx={{ color: iconColor, fontSize: 20, flexShrink: 0 }}>
                  {renderIcon(icon)}
                </Box>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.813rem",
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? iconColor : theme.palette.text.secondary,
                  flex: 1,
                }}
              >
                {stage.title}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderStats = (section) => {
    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.875rem",
            mb: 1.5,
          }}
        >
          {section.title}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {section.stats?.map((stat, index) => {
            const colorKey = stat.color || "primary";
            const color = theme.palette[colorKey]?.main || theme.palette.primary.main;

            return (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.05),
                  border: `1px solid ${alpha(color, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color,
                    fontSize: 20,
                  }}
                >
                  {renderIcon(stat.icon)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: color,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderTips = (section) => {
    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.875rem",
            mb: 1.5,
          }}
        >
          {section.title}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {section.tips?.map((tip, index) => {
            const colorKey = tip.color || "info";
            const color = theme.palette[colorKey]?.main || theme.palette.info.main;

            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.05),
                  border: `1px solid ${alpha(color, 0.15)}`,
                }}
              >
                <Box sx={{ color: color, fontSize: 20, mt: 0.25, flexShrink: 0 }}>
                  {renderIcon(tip.icon)}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.813rem",
                    color: theme.palette.text.secondary,
                    lineHeight: 1.5,
                  }}
                >
                  {tip.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Render calculation section
  const renderCalculation = (section) => {
    const colorKey = section.color || "primary";
    const color = theme.palette[colorKey]?.main || theme.palette.primary.main;

    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: "0.875rem", color: color }}
          >
            {section.title}
          </Typography>
        </Box>
        
        {section.calculations?.map((calc, index) => {
          const value = getFormValue(calc.formula);
          const formattedValue = formatValue(value, calc.format, calc.suffix);
          
          return (
            <Box
              key={index}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                bgcolor: calc.highlight ? alpha(color, 0.08) : alpha(theme.palette.grey[100], 0.5),
                border: `1px solid ${alpha(calc.highlight ? color : theme.palette.divider, 0.2)}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
                >
                  {calc.label}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: calc.highlight ? 700 : 600,
                    fontSize: calc.highlight ? "1.125rem" : "0.938rem",
                    color: calc.highlight ? color : theme.palette.text.primary,
                  }}
                >
                  {formattedValue}
                </Typography>
              </Box>
              {calc.helpText && (
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.688rem", color: theme.palette.text.disabled, display: "block", mt: 0.5 }}
                >
                  {calc.helpText}
                </Typography>
              )}
            </Box>
          );
        })}

        {/* Render slab info if present */}
        {section.slabInfo && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, fontSize: "0.75rem", color: theme.palette.info.main, mb: 1, display: "block" }}
            >
              {section.slabInfo.title}
            </Typography>
            {section.slabInfo.data?.map((slab, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.75,
                  borderBottom: idx < section.slabInfo.data.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : "none",
                }}
              >
                <Typography variant="caption" sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                  {slab.range}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600, color: theme.palette.text.primary }}>
                  {slab.fee}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    );
  };

  // Render info section
  const renderInfo = (section) => {
    const colorKey = section.color || "primary";
    const color = theme.palette[colorKey]?.main || theme.palette.primary.main;

    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: "0.875rem" }}
          >
            {section.title}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.grey[100], 0.3),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          {/* Regular fields */}
          {section.fields?.map((field, index) => {
            const value = getFormValue(field.key);
            const formattedValue = formatValue(value, field.format, field.suffix);

            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderBottom:
                    index < section.fields.length - 1
                      ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      : "none",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
                >
                  {field.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.813rem", fontWeight: 600, color: theme.palette.text.primary }}
                >
                  {formattedValue}
                </Typography>
              </Box>
            );
          })}
          
          {/* Questions list */}
          {section.questions?.map((question, index) => (
            <Box
              key={index}
              sx={{
                py: 1.5,
                px: 1,
                mb: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    flex: 1,
                    pr: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {question.question}
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: question.required ? theme.palette.error.main : theme.palette.success.main,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.7rem",
                    color: theme.palette.text.secondary,
                    fontStyle: 'italic',
                  }}
                >
                  {question.type}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: question.required ? theme.palette.error.main : theme.palette.success.main,
                    textTransform: 'uppercase',
                  }}
                >
                  {question.required ? 'Required' : 'Optional'}
                </Typography>
              </Box>
              {question.note && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    color: theme.palette.info.main,
                    display: 'block',
                    mt: 0.5,
                    fontStyle: 'italic',
                  }}
                >
                  {question.note}
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  // Render status section
  const renderStatus = (section) => {
    const statusIcons = {
      pending: { icon: "HelpOutline", color: theme.palette.warning.main },
      checking: { icon: "Info", color: theme.palette.info.main },
      success: { icon: "CheckCircleOutline", color: theme.palette.success.main },
      error: { icon: "ErrorOutline", color: theme.palette.error.main },
    };

    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, fontSize: "0.875rem", mb: 1.5 }}
        >
          {section.title}
        </Typography>

        {section.items?.map((item, index) => {
          const statusConfig = statusIcons[item.status] || statusIcons.pending;

          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                bgcolor: alpha(statusConfig.color, 0.05),
                border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
              }}
            >
              <Box sx={{ color: statusConfig.color, fontSize: 20, mt: 0.25, flexShrink: 0 }}>
                {renderIcon(statusConfig.icon)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.813rem", fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}
                >
                  {item.label}
                </Typography>
                {item.message && (
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
                  >
                    {item.message}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Render guidance section
  const renderGuidance = (section) => {
    const colorKey = section.color || "info";
    const color = theme.palette[colorKey]?.main || theme.palette.info.main;

    return (
      <Alert
        key={section.id}
        severity={section.color || "info"}
        icon={false}
        sx={{
          mb: 3,
          borderRadius: 2,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.875rem", mb: 0.5 }}>
          {section.title}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.813rem", lineHeight: 1.6 }}>
          {section.content}
        </Typography>
      </Alert>
    );
  };

  // Render impact & consequence section
  const renderImpact = (section) => {
    const colorKey = section.color || "warning";
    const color = theme.palette[colorKey]?.main || theme.palette.warning.main;

    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: "0.875rem", color: color, letterSpacing: 0.5 }}
          >
            {section.title}
          </Typography>
        </Box>

        {section.sections?.map((subsection, index) => (
          <Paper
            key={subsection.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              bgcolor: alpha(color, 0.05),
              border: `1px solid ${alpha(color, 0.2)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "0.813rem",
                color: theme.palette.text.primary,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {subsection.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.813rem",
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            >
              {subsection.content}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  // Render simulator section with live calculator
  const renderSimulator = (section) => {
    const colorKey = section.color || "success";
    const color = theme.palette[colorKey]?.main || theme.palette.success.main;
    const inputValue = simulatorInputs[section.id] || "";

    // Calculate fee based on input
    const calculateSimulatorFee = () => {
      const loanAmount = parseFloat(inputValue) || 0;
      if (loanAmount === 0) return { fee: 0, gst: 0, total: 0 };

      // Simple slab logic (this should match your actual slab rules from form)
      let fee = 0;
      if (loanAmount < 25000) {
        fee = 0;
      } else if (loanAmount >= 25001 && loanAmount <= 50000) {
        fee = 500;
      } else if (loanAmount >= 50001 && loanAmount <= 100000) {
        fee = 750;
      } else if (loanAmount >= 100001 && loanAmount <= 160000) {
        fee = 1000;
      } else {
        fee = 1000; // Default for higher amounts
      }

      const gst = fee * 0.18;
      const total = fee + gst;

      return { fee, gst, total };
    };

    const results = calculateSimulatorFee();

    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: "0.875rem", color: color }}
          >
            {section.title}
          </Typography>
        </Box>

        {section.description && (
          <Typography
            variant="caption"
            sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary, display: "block", mb: 2 }}
          >
            {section.description}
          </Typography>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(color, 0.05),
            border: `2px solid ${alpha(color, 0.3)}`,
          }}
        >
          <TextField
            fullWidth
            size="small"
            type="number"
            label={section.inputLabel}
            placeholder={section.inputPlaceholder}
            value={inputValue}
            onChange={(e) => handleSimulatorInput(section.id, e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
              },
            }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1, color: theme.palette.text.secondary }}>₹</Typography>,
            }}
          />

          {inputValue && parseFloat(inputValue) > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              
              {section.calculations?.map((calc, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    px: 1.5,
                    mb: 1,
                    borderRadius: 1.5,
                    bgcolor: calc.highlight ? alpha(color, 0.1) : "transparent",
                    border: calc.highlight ? `1px solid ${alpha(color, 0.3)}` : "none",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: calc.highlight ? 700 : 600,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {calc.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: calc.highlight ? 700 : 600,
                      fontSize: calc.highlight ? "1.125rem" : "0.938rem",
                      color: calc.highlight ? color : theme.palette.text.primary,
                    }}
                  >
                    {calc.formula === "calculateSlabFee" && formatValue(results.fee, "currency")}
                    {calc.formula === "processing_fee * 0.18" && formatValue(results.gst, "currency")}
                    {calc.formula === "processing_fee + gst" && formatValue(results.total, "currency")}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {(!inputValue || parseFloat(inputValue) === 0) && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                color: theme.palette.text.disabled,
                fontStyle: "italic",
                display: "block",
                textAlign: "center",
                py: 2,
              }}
            >
              Enter a loan amount to see the calculated fee
            </Typography>
          )}
        </Paper>
      </Box>
    );
  };

  const renderSection = (section) => {
    switch (section.type) {
      case "guidance":
        return renderGuidance(section);
      case "impact":
        return renderImpact(section);
      case "simulator":
        return renderSimulator(section);
      case "calculation":
        return renderCalculation(section);
      case "info":
        return renderInfo(section);
      case "status":
        return renderStatus(section);
      case "progress":
        return renderProgress(section);
      case "checklist":
        return renderChecklist(section);
      case "stats":
        return renderStats(section);
      case "tips":
        return renderTips(section);
      default:
        return null;
    }
  };

  // No context sections defined - show empty state
  if (!contextSections || contextSections.length === 0) {
    return (
      <Box
        sx={{
          p: 2.5,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          No context available for this stage
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2.5,
        height: "100%",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: alpha(theme.palette.grey[400], 0.5),
          borderRadius: 3,
        },
      }}
    >
      {contextSections.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < contextSections.length - 1 && (
            <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.1) }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default ProductConfigSidebar;
