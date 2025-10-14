"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Close,
  ExpandMore,
  CheckCircle,
  Http,
  Edit,
  Add,
  RadioButtonChecked,
  TextFields,
  ArrowDropDown,
  CalendarToday,
  Phone,
  Email,
  Image,
  TouchApp,
} from "@mui/icons-material";

const FieldManagerDialog = ({ open, onClose, component, schema, onConfigureApi }) => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);

  const getFieldIcon = (fieldType) => {
    const icons = {
      text: TextFields,
      email: Email,
      phone: Phone,
      number: TextFields,
      date: CalendarToday,
      dropdown: ArrowDropDown,
      radio: RadioButtonChecked,
      checkbox: CheckCircle,
      button: TouchApp,
      image: Image,
    };
    return icons[fieldType] || TextFields;
  };

  const getFieldTypeLabel = (fieldType) => {
    const labels = {
      text: "Text",
      email: "Email",
      phone: "Phone",
      number: "Number",
      date: "Date",
      dropdown: "Dropdown",
      radio: "Radio",
      checkbox: "Checkbox",
      button: "Button",
      image: "Image",
    };
    return labels[fieldType] || fieldType;
  };

  const canHaveApi = (field) => {
    return ["button", "dropdown"].includes(field.type);
  };

  const hasApiConfigured = (field) => {
    return field.api && (field.api.url || field.api.endpoint);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Edit sx={{ color: "primary.main", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Field Manager
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure API calls for {component?.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, maxHeight: "60vh", overflowY: "auto" }}>
        {!schema?.sections || schema.sections.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No sections found in this form
            </Typography>
          </Box>
        ) : (
          schema.sections.map((section, sectionIndex) => (
            <Accordion
              key={section.id}
              expanded={expandedSection === section.id}
              onChange={(e, isExpanded) =>
                setExpandedSection(isExpanded ? section.id : null)
              }
              sx={{
                mb: 2,
                "&:before": { display: "none" },
                boxShadow: "none",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px !important",
                "&.Mui-expanded": {
                  margin: "0 0 16px 0",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  borderRadius: "8px",
                  "&.Mui-expanded": {
                    borderRadius: "8px 8px 0 0",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    pr: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {section.fields?.length || 0} fields
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${section.fields?.filter(canHaveApi).length || 0} API-enabled`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: "info.main",
                    }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {section.fields?.map((field, fieldIndex) => {
                    const FieldIcon = getFieldIcon(field.type);
                    const apiEnabled = canHaveApi(field);
                    const apiConfigured = hasApiConfigured(field);

                    return (
                      <ListItem
                        key={field.id}
                        sx={{
                          borderBottom:
                            fieldIndex < section.fields.length - 1
                              ? `1px solid ${theme.palette.divider}`
                              : "none",
                          bgcolor: "white",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FieldIcon
                              sx={{ color: "primary.main", fontSize: 18 }}
                            />
                          </Box>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {field.label || field.buttonLabel || field.id}
                              </Typography>
                              <Chip
                                label={getFieldTypeLabel(field.type)}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  bgcolor: alpha("#000", 0.05),
                                }}
                              />
                              {apiConfigured && (
                                <Chip
                                  icon={<Http sx={{ fontSize: 14 }} />}
                                  label="API"
                                  size="small"
                                  color="success"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {field.placeholder || `Field ID: ${field.id}`}
                            </Typography>
                          }
                        />

                        <Box sx={{ display: "flex", gap: 1 }}>
                          {apiEnabled ? (
                            <Tooltip
                              title={
                                apiConfigured
                                  ? "Edit API Configuration"
                                  : "Configure API"
                              }
                            >
                              <Button
                                size="small"
                                variant={apiConfigured ? "contained" : "outlined"}
                                startIcon={
                                  apiConfigured ? <Http /> : <Add />
                                }
                                onClick={() => onConfigureApi(field)}
                                sx={{
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  px: 1.5,
                                  py: 0.5,
                                }}
                              >
                                {apiConfigured ? "Edit API" : "Add API"}
                              </Button>
                            </Tooltip>
                          ) : (
                            <Chip
                              label="No API Support"
                              size="small"
                              disabled
                              sx={{
                                height: 24,
                                fontSize: "0.7rem",
                                opacity: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}

        {/* Info Box */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mt: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            borderColor: alpha(theme.palette.info.main, 0.2),
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Http sx={{ color: "info.main", fontSize: 20 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                API Configuration Tips
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Buttons:</strong> Configure API calls triggered on click
                <br />
                • <strong>Dropdowns:</strong> Load options dynamically from API
                <br />
                • <strong>cURL Import:</strong> Paste cURL commands for quick setup
                <br />
                • <strong>Testing:</strong> Test APIs before saving configuration
              </Typography>
            </Box>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldManagerDialog;
