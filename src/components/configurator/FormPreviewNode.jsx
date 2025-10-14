"use client";

import React, { useState, memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Paper,
  alpha,
  useTheme,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Visibility,
  Delete,
  Settings,
  CheckCircle,
  Person,
  Agriculture,
  AccountBalance,
  Fingerprint,
  Check,
} from "@mui/icons-material";

// Custom equality check for memo - only re-render if data actually changed
const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.data.component?.id === nextProps.data.component?.id &&
         prevProps.selected === nextProps.selected &&
         prevProps.isConnectable === nextProps.isConnectable;
};

const FormPreviewNode = memo(({ data, isConnectable, selected }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { component, schema, onDelete, onConfigure, onPreview } = data;

  const getIconComponent = (iconName) => {
    const iconMap = {
      person: Person,
      agriculture: Agriculture,
      account_balance: AccountBalance,
      fingerprint: Fingerprint,
      check_circle: CheckCircle,
    };
    return iconMap[iconName] || Person;
  };

  const IconComponent = getIconComponent(component?.icon);

  // Memoize expensive calculations
  const totalFields = React.useMemo(() => 
    schema?.sections?.reduce(
      (sum, section) => sum + (section.fields?.length || 0),
      0
    ) || 0,
    [schema]
  );
  
  const totalSections = React.useMemo(() => 
    schema?.sections?.length || 0,
    [schema]
  );

  // Memoize color values
  const componentColor = React.useMemo(() => 
    component?.color || "#1976d2",
    [component?.color]
  );
  
  const borderColor = React.useMemo(() => 
    selected ? theme.palette.primary.main : alpha(componentColor, 0.3),
    [selected, theme.palette.primary.main, componentColor]
  );

  // Memoize callbacks to prevent re-renders
  const handleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete && onDelete();
  }, [onDelete]);

  const handleConfigure = useCallback(() => {
    onConfigure && onConfigure(component);
  }, [onConfigure, component]);

  const handlePreview = useCallback(() => {
    onPreview && onPreview(component);
  }, [onPreview, component]);

  return (
    <Paper
      elevation={selected ? 8 : 3}
      sx={{
        minWidth: 320,
        maxWidth: 400,
        background: alpha("#fff", 0.98),
        border: `2px solid ${borderColor}`,
        borderRadius: 3,
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: selected
          ? `0 12px 40px ${alpha(componentColor, 0.4)}`
          : `0 4px 12px ${alpha("#000", 0.1)}`,
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "subpixel-antialiased",
        "&:hover": {
          boxShadow: `0 12px 40px ${alpha(componentColor, 0.3)}`,
        },
      }}
    >
      {/* Top Gradient Bar */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${componentColor} 0%, ${alpha(componentColor, 0.6)} 100%)`,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: alpha(componentColor, 0.05),
          borderBottom: `1px solid ${alpha(componentColor, 0.1)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${componentColor} 0%, ${alpha(componentColor, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${alpha(componentColor, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <IconComponent sx={{ color: "white", fontSize: 28 }} />
          </Box>

          {/* Title and Badges */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                mb: 0.5,
                lineHeight: 1.3,
                color: theme.palette.text.primary,
              }}
            >
              {component?.name || "Form Component"}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              <Chip
                label={component?.category || "form"}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  bgcolor: alpha(componentColor, 0.15),
                  color: componentColor,
                  fontWeight: 600,
                }}
              />
              {component?.is_entry_point && (
                <Chip
                  label="Start"
                  size="small"
                  sx={{
                    fontSize: "0.65rem",
                    height: 20,
                    bgcolor: alpha("#4caf50", 0.15),
                    color: "#4caf50",
                    fontWeight: 600,
                  }}
                />
              )}
              {component?.is_exit_point && (
                <Chip
                  label="End"
                  size="small"
                  sx={{
                    fontSize: "0.65rem",
                    height: 20,
                    bgcolor: alpha("#f44336", 0.15),
                    color: "#f44336",
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Expand Button */}
          <IconButton
            size="small"
            onClick={handleExpand}
            sx={{
              bgcolor: alpha(componentColor, 0.1),
              "&:hover": { bgcolor: alpha(componentColor, 0.2) },
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Compact Stats (Always Visible) */}
      <Box sx={{ p: 2, py: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              {totalSections}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sections
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              {totalFields}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fields
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Expanded Schema Preview */}
      <Collapse in={expanded}>
        <Divider />
        <Box
          sx={{
            p: 2,
            bgcolor: alpha("#f5f5f5", 0.5),
            maxHeight: 250,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: alpha("#000", 0.05),
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: "3px",
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.5),
              },
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, mb: 1, display: "block", color: "text.secondary" }}
          >
            Form Sections Preview:
          </Typography>
          {schema?.sections?.map((section, index) => (
            <Paper
              key={section.id}
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                "&:last-child": { mb: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircle
                  sx={{
                    fontSize: 16,
                    color: theme.palette.success.main,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  {section.title}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", fontSize: "0.7rem", mb: 0.5 }}
              >
                {section.subtitle}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {section.fields?.slice(0, 3).map((field) => (
                  <Chip
                    key={field.id}
                    label={field.label}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 18,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                ))}
                {section.fields?.length > 3 && (
                  <Chip
                    label={`+${section.fields.length - 3} more`}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 18,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Collapse>

      {/* Action Buttons */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          gap: 1,
          bgcolor: alpha("#f5f5f5", 0.3),
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Tooltip title="Preview Full Form">
          <IconButton
            size="small"
            onClick={handlePreview}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Configure">
          <IconButton
            size="small"
            onClick={handleConfigure}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.2) },
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Remove from Canvas">
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: componentColor,
          border: `2px solid white`,
          boxShadow: `0 2px 8px ${alpha(componentColor, 0.4)}`,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: componentColor,
          border: `2px solid white`,
          boxShadow: `0 2px 8px ${alpha(componentColor, 0.4)}`,
        }}
      />
    </Paper>
  );
}, arePropsEqual);

FormPreviewNode.displayName = "FormPreviewNode";

export default FormPreviewNode;
