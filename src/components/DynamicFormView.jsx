"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Chip,
  Button,
  Paper,
  Divider,
  alpha,
  useTheme,
  InputLabel,
  FormHelperText,
  OutlinedInput,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add,
  Remove,
  ChevronLeft,
  ChevronRight,
  Delete,
  ExpandMore,
  Info,
  CurrencyRupee,
  TrendingUp,
  Receipt,
  Business,
  Category,
  Assignment,
  WbSunny,
  Assessment,
  AccountBalance,
  InfoOutlined,
  FileCopy,
} from "@mui/icons-material";

// Icon mapping for section icons
const sectionIconMap = {
  Info: Info,
  AttachMoney: CurrencyRupee,
  CurrencyRupee: CurrencyRupee,
  TrendingUp: TrendingUp,
  Receipt: Receipt,
  Business: Business,
  Category: Category,
  Assignment: Assignment,
  WbSunny: WbSunny,
  Assessment: Assessment,
  AccountBalance: AccountBalance,
  InfoOutlined: InfoOutlined,
  FileCopy: FileCopy,
};

/**
 * DynamicFormView - Renders dynamic forms based on stage configuration
 * Supports multiple field types: text, number, dropdown, radio, multiselect, etc.
 * 
 * @param {Object} stageConfig - Stage configuration from JSON
 * @param {Object} formData - Current form data
 * @param {Function} onDataChange - Callback when data changes
 */
const DynamicFormView = ({ stageConfig, formData = {}, onDataChange }) => {
  const theme = useTheme();
  const [repeatableSections, setRepeatableSections] = useState({});
  const [currentPage, setCurrentPage] = useState({});

  const handleFieldChange = (fieldId, value) => {
    onDataChange && onDataChange(stageConfig.id, fieldId, value);
  };

  const handleRepeatableAdd = (sectionId) => {
    const current = repeatableSections[sectionId] || 1;
    setRepeatableSections({ ...repeatableSections, [sectionId]: current + 1 });
  };

  const handleRepeatableRemove = (sectionId) => {
    const current = repeatableSections[sectionId] || 1;
    if (current > 1) {
      setRepeatableSections({ ...repeatableSections, [sectionId]: current - 1 });
    }
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    const stageData = formData[stageConfig.id] || {};
    const { field: condField, value: condValue } = field.conditional;
    const actualValue = stageData[condField];
    const shouldShow = actualValue === condValue;
    console.log('Conditional check:', { 
      fieldId: field.id, 
      condField, 
      condValue, 
      actualValue, 
      shouldShow,
      stageData 
    });
    return shouldShow;
  };

  const renderFieldLabel = (field, isRequired) => (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        color: '#374151',
        mb: 0.75,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        fontSize: '0.8125rem',
        lineHeight: 1.4,
      }}
    >
      {field.label}
      {isRequired && (
        <Box component="span" sx={{ color: '#ef4444', fontWeight: 500, ml: 0.25 }}>
          *
        </Box>
      )}
    </Typography>
  );

  // Render individual field based on type
  const renderField = (field, index) => {
    if (!shouldShowField(field)) return null;

    // Get value from stage-specific form data
    const stageData = formData[stageConfig.id] || {};
    const value = stageData[field.id] || "";
    const isRequired = field.required;

    // Common field wrapper styles for uniform spacing
    const fieldWrapperSx = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    };

    // Common input styles
    const inputSx = {
      '& .MuiOutlinedInput-root': {
        bgcolor: 'white',
        height: '44px',
        borderRadius: '8px',
        fontSize: '0.875rem',
        transition: 'all 0.2s ease',
        '& fieldset': {
          borderColor: '#e2e8f0',
        },
        '&:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
        },
      },
      '& .MuiInputBase-input': {
        padding: '10px 14px',
        '&::placeholder': {
          color: '#94a3b8',
          opacity: 1,
        },
      },
    };

    switch (field.type) {
      case "text":
      case "number":
      case "decimal":
        return (
          <Box sx={fieldWrapperSx}>
            {renderFieldLabel(field, isRequired)}
            <TextField
              key={field.id}
              fullWidth
              size="small"
              type={field.type === "number" || field.type === "decimal" ? "number" : "text"}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={isRequired}
              disabled={field.readOnly}
              InputProps={{
                readOnly: field.readOnly,
                step: field.type === "decimal" ? "0.01" : undefined,
              }}
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-root': {
                  ...inputSx['& .MuiOutlinedInput-root'],
                  bgcolor: field.readOnly ? '#f8fafc' : 'white',
                },
              }}
            />
            {field.hint && (
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.7rem' }}>
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "textarea":
        return (
          <Box sx={fieldWrapperSx}>
            {renderFieldLabel(field, isRequired)}
            <TextField
              fullWidth
              multiline
              rows={3}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={isRequired}
              disabled={field.readOnly}
              InputProps={{
                readOnly: field.readOnly,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: field.readOnly ? '#f8fafc' : 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                },
              }}
            />
            {field.hint && (
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.7rem' }}>
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "dropdown":
        return (
          <Box sx={fieldWrapperSx}>
            {renderFieldLabel(field, isRequired)}
            <FormControl fullWidth required={isRequired} size="small">
              <Select
                value={value}
                displayEmpty
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                disabled={field.readOnly}
                sx={{
                  bgcolor: field.readOnly ? '#f8fafc' : 'white',
                  height: '44px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                  '& .MuiSelect-select': {
                    padding: '10px 14px',
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Select {field.label}
                      </Typography>
                    );
                  }
                  return <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.875rem' }}>{selected}</Typography>;
                }}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem', py: 1 }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {field.hint && (
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.7rem' }}>
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "radio":
        return (
          <Box sx={{ ...fieldWrapperSx, gridColumn: field.columnSpan === 'full' ? '1 / -1' : 'auto' }}>
            {renderFieldLabel(field, isRequired)}
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: '8px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'inline-flex',
              }}
            >
              <FormControl component="fieldset" required={isRequired}>
                <RadioGroup
                  value={value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  row={true}
                  sx={{
                    gap: 3,
                    '& .MuiFormControlLabel-root': {
                      mr: 0,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#334155',
                      },
                    },
                    '& .MuiRadio-root': {
                      color: '#94a3b8',
                      padding: '4px',
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  {field.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio size="small" disabled={field.readOnly} />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
            {field.hint && (
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.7rem' }}>
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "multiselect":
        const multiValue = value || [];
        return (
          <Box sx={fieldWrapperSx}>
            {renderFieldLabel(field, isRequired)}
            <FormControl fullWidth>
              <Select
                multiple
                value={multiValue}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) {
                    return <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>{field.placeholder || 'Select options'}</Typography>;
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {Array.isArray(selected) && selected.map((val, idx) => (
                        <Chip key={`${val}-${idx}`} label={val} size="small" sx={{ height: 24, fontSize: '0.75rem' }} />
                      ))}
                    </Box>
                  );
                }}
                sx={{
                  height: '44px',
                  bgcolor: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                }}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem' }}>
                    <Checkbox checked={multiValue.indexOf(option) > -1} size="small" />
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {field.hint && (
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.7rem' }}>
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "section":
        const isRepeatable = field.repeatable;
        const sectionCount = isRepeatable ? (repeatableSections[field.id] || 1) : 1;
        const activePage = currentPage[field.id] || 0;
        
        return (
          <Box key={field.id} sx={{ mb: 4, mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                bgcolor: 'white',
              }}
            >
              {/* Section Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Assignment sx={{ color: '#2563eb', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        fontSize: '1rem',
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isRepeatable && (
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Entry {activePage + 1} of {sectionCount}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Pagination Controls */}
                {isRepeatable && sectionCount > 1 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setCurrentPage({ ...currentPage, [field.id]: Math.max(0, activePage - 1) })}
                      disabled={activePage === 0}
                      sx={{
                        bgcolor: activePage === 0 ? '#f1f5f9' : '#e2e8f0',
                        '&:hover': { bgcolor: '#cbd5e1' },
                        '&.Mui-disabled': { bgcolor: '#f8fafc' },
                      }}
                    >
                      <ChevronLeft sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: '#1e293b',
                        borderRadius: 1,
                        minWidth: 60,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                        {activePage + 1} / {sectionCount}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setCurrentPage({ ...currentPage, [field.id]: Math.min(sectionCount - 1, activePage + 1) })}
                      disabled={activePage === sectionCount - 1}
                      sx={{
                        bgcolor: activePage === sectionCount - 1 ? '#f1f5f9' : '#e2e8f0',
                        '&:hover': { bgcolor: '#cbd5e1' },
                        '&.Mui-disabled': { bgcolor: '#f8fafc' },
                      }}
                    >
                      <ChevronRight sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Section Content */}
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  {field.fields?.map((subField, subIndex) => {
                    const stageData = formData[stageConfig.id] || {};
                    const shouldShow = subField.conditional ? 
                      stageData[subField.conditional.field] === subField.conditional.value : true;
                    
                    if (!shouldShow) return null;
                    
                    const isFullWidth = subField.columnSpan === 'full' || subField.type === 'radio' || subField.type === 'textarea';
                    
                    return (
                      <Box
                        key={`${field.id}-${subField.id}-${subIndex}`}
                        sx={{
                          gridColumn: isFullWidth ? '1 / -1' : 'auto',
                        }}
                      >
                        {renderField(subField, `${index}-${subIndex}`)}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Section Footer with Actions */}
              {isRepeatable && (
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    bgcolor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {sectionCount} {sectionCount === 1 ? 'entry' : 'entries'} configured
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {sectionCount > 1 && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete sx={{ fontSize: 16 }} />}
                        onClick={() => {
                          const newCount = sectionCount - 1;
                          setRepeatableSections({ ...repeatableSections, [field.id]: newCount });
                          if (activePage >= newCount) {
                            setCurrentPage({ ...currentPage, [field.id]: newCount - 1 });
                          }
                        }}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          borderColor: '#fca5a5',
                          color: '#dc2626',
                          '&:hover': {
                            borderColor: '#dc2626',
                            bgcolor: '#fef2f2',
                          },
                        }}
                      >
                        Remove Entry
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        handleRepeatableAdd(field.id);
                        setCurrentPage({ ...currentPage, [field.id]: sectionCount });
                      }}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        bgcolor: '#2563eb',
                        '&:hover': {
                          bgcolor: '#1d4ed8',
                        },
                      }}
                    >
                      Add New Entry
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        );

      case "file":
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {renderFieldLabel(field, isRequired)}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                bgcolor: alpha(theme.palette.success.main, 0.02),
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  borderColor: theme.palette.success.main,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                },
              }}
            >
              <input
                type="file"
                accept={field.accept || ".xlsx,.xls,.csv"}
                style={{ display: 'none' }}
                id={`file-upload-${field.id}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFieldChange(field.id, file);
                  }
                }}
              />
              <label htmlFor={`file-upload-${field.id}`} style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="img"
                    src="/excel.png"
                    alt="Excel Upload"
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {field.placeholder || "Upload Excel File"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    {field.hint || "Click or drag and drop your Excel file here"}
                  </Typography>
                  {value && (
                    <Chip
                      label={value.name || value}
                      color="success"
                      size="medium"
                      onDelete={() => handleFieldChange(field.id, null)}
                      sx={{ mt: 1, fontWeight: 600 }}
                    />
                  )}
                </Box>
              </label>
            </Paper>
          </Box>
        );

      case "subsection":
        return (
          <Box 
            key={field.id} 
            sx={{ 
              width: '100%',
              p: 2.5,
              borderRadius: 2,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                mb: 2,
                fontSize: '0.875rem',
              }}
            >
              {field.label}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              {field.fields?.map((subField, subIndex) => (
                <Box key={`${field.id}-${subField.id}-${subIndex}`}>
                  {renderField(subField, `${index}-${subIndex}`)}
                </Box>
              ))}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!stageConfig) return null;

  // Check if stage has defined sections
  const hasSections = stageConfig.sections && stageConfig.sections.length > 0;

  // Group fields by their section property
  const groupFieldsBySections = () => {
    if (!hasSections) {
      // Fallback to old grouping logic if no sections defined
      return groupFieldsLegacy();
    }

    const sectionGroups = {};
    const fileUploads = [];
    const unsectionedFields = [];

    // Initialize section groups
    stageConfig.sections.forEach((section) => {
      sectionGroups[section.id] = {
        section,
        fields: [],
      };
    });

    // Group fields by section
    stageConfig.fields?.forEach((field) => {
      if (field.type === 'file') {
        fileUploads.push(field);
      } else if (field.section && sectionGroups[field.section]) {
        sectionGroups[field.section].fields.push(field);
      } else {
        unsectionedFields.push(field);
      }
    });

    return {
      type: 'sectioned',
      sectionGroups,
      unsectionedFields,
      fileUploads,
    };
  };

  // Legacy grouping for backward compatibility
  const groupFieldsLegacy = () => {
    const groups = [];
    const fileUploads = [];
    let currentGroup = [];
    
    stageConfig.fields?.forEach((field) => {
      if (field.type === 'file') {
        fileUploads.push(field);
      } else if (field.type === 'section' || field.type === 'subsection') {
        if (currentGroup.length > 0) {
          groups.push({ type: 'fields', fields: currentGroup });
          currentGroup = [];
        }
        groups.push({ type: 'section', field });
      } else {
        currentGroup.push(field);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({ type: 'fields', fields: currentGroup });
    }
    
    if (fileUploads.length > 0) {
      groups.push({ type: 'fileUploads', fields: fileUploads });
    }
    
    return { type: 'legacy', groups };
  };

  const fieldGroups = groupFieldsBySections();

  // Section colors for visual distinction
  const sectionColors = {
    basic_info: '#2e7d32',
    loan_limits: '#1976d2',
    interest_config: '#f57c00',
    processing_fee: '#9c27b0',
    partner_info: '#00838f',
    sof_master: '#f57c00',
    purpose_usage: '#2e7d32',
    season_info: '#ff9800',
    income_expense: '#7b1fa2',
    bank_master: '#0288d1',
    other_info: '#d32f2f',
    loan_docs: '#00897b',
  };

  // Render a section with its fields
  const renderSection = (sectionConfig, fields, index) => {
    const SectionIcon = sectionIconMap[sectionConfig.icon] || Info;
    const sectionColor = sectionColors[sectionConfig.id] || theme.palette.primary.main;
    const isDefaultExpanded = sectionConfig.defaultExpanded !== false;

    return (
      <Accordion
        key={sectionConfig.id}
        defaultExpanded={isDefaultExpanded}
        elevation={0}
        sx={{
          mb: 2,
          border: `1px solid ${alpha(sectionColor, 0.2)}`,
          borderRadius: '12px !important',
          overflow: 'hidden',
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            margin: '0 0 16px 0',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: sectionColor }} />}
          sx={{
            bgcolor: alpha(sectionColor, 0.04),
            borderBottom: `1px solid ${alpha(sectionColor, 0.1)}`,
            minHeight: 64,
            '&.Mui-expanded': {
              minHeight: 64,
            },
            '& .MuiAccordionSummary-content': {
              margin: '12px 0',
              '&.Mui-expanded': {
                margin: '12px 0',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: alpha(sectionColor, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SectionIcon sx={{ color: sectionColor, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {sectionConfig.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                }}
              >
                {fields.length} field{fields.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails 
          sx={{ 
            px: 4, 
            py: 3, 
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              '& > *': {
                minWidth: 0, // Prevent overflow
              },
            }}
          >
            {fields.map((field, fieldIndex) => {
              const stageData = formData[stageConfig.id] || {};
              const shouldShow = field.conditional
                ? stageData[field.conditional.field] === field.conditional.value
                : true;

              if (!shouldShow) return null;

              // Full width for specific types - subsection MUST be full width
              const isFullWidth = field.columnSpan === 'full' || 
                field.type === 'subsection' || 
                field.type === 'textarea' || 
                field.type === 'section' || 
                field.type === 'file';

              return (
                <Box 
                  key={field.id} 
                  sx={{ 
                    gridColumn: isFullWidth ? '1 / -1' : 'auto',
                  }}
                >
                  {renderField(field, `${sectionConfig.id}-${fieldIndex}`)}
                </Box>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Render sectioned layout (new enterprise design)
  const renderSectionedLayout = () => {
    const { sectionGroups, unsectionedFields, fileUploads } = fieldGroups;

    return (
      <>
        {/* Render sections in order */}
        {stageConfig.sections.map((section, index) => {
          const sectionData = sectionGroups[section.id];
          if (!sectionData || sectionData.fields.length === 0) return null;
          return renderSection(section, sectionData.fields, index);
        })}

        {/* Render unsectioned fields if any */}
        {unsectionedFields.length > 0 && (
          <Box 
            sx={{ 
              mb: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              '& > *': { minWidth: 0 },
            }}
          >
            {unsectionedFields.map((field, fieldIndex) => {
              const stageData = formData[stageConfig.id] || {};
              const shouldShow = field.conditional
                ? stageData[field.conditional.field] === field.conditional.value
                : true;
              if (!shouldShow) return null;

              const isFullWidth = field.columnSpan === 'full' || field.type === 'subsection' || field.type === 'textarea' || field.type === 'file';

              return (
                <Box 
                  key={field.id}
                  sx={{ gridColumn: isFullWidth ? '1 / -1' : 'auto' }}
                >
                  {renderField(field, `unsectioned-${fieldIndex}`)}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Render file uploads */}
        {fileUploads.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {fileUploads.map((field, fieldIndex) => (
              <Box
                key={field.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: fieldIndex < fileUploads.length - 1 ? 3 : 0,
                }}
              >
                <Box sx={{ maxWidth: 600, width: '100%' }}>
                  {renderField(field, `file-${fieldIndex}`)}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </>
    );
  };

  // Render legacy layout (backward compatibility)
  const renderLegacyLayout = () => {
    const { groups } = fieldGroups;

    return (
      <>
        {groups.map((group, groupIndex) => {
          if (group.type === 'section') {
            return (
              <React.Fragment key={`section-${group.field.id || groupIndex}`}>
                {renderField(group.field, `section-${groupIndex}`)}
              </React.Fragment>
            );
          }

          if (group.type === 'fileUploads') {
            return (
              <Box key={`file-uploads-${groupIndex}`} sx={{ mt: 4, mb: 3 }}>
                {group.fields.map((field, fieldIndex) => (
                  <Box
                    key={field.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: fieldIndex < group.fields.length - 1 ? 3 : 0,
                    }}
                  >
                    <Box sx={{ maxWidth: 600, width: '100%' }}>
                      {renderField(field, `file-${groupIndex}-${fieldIndex}`)}
                    </Box>
                  </Box>
                ))}
              </Box>
            );
          }

          return (
            <Box 
              key={`group-${groupIndex}`} 
              sx={{ 
                mb: 3,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
                '& > *': { minWidth: 0 },
              }}
            >
              {group.fields.map((field, fieldIndex) => {
                const stageData = formData[stageConfig.id] || {};
                const shouldShow = field.conditional
                  ? stageData[field.conditional.field] === field.conditional.value
                  : true;
                if (!shouldShow) return null;

                const isFullWidth = field.columnSpan === 'full' || field.type === 'subsection' || field.type === 'textarea' || field.type === 'file';

                return (
                  <Box 
                    key={field.id}
                    sx={{ gridColumn: isFullWidth ? '1 / -1' : 'auto' }}
                  >
                    {renderField(field, `${groupIndex}-${fieldIndex}`)}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </>
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%',
        mx: 'auto',
        bgcolor: alpha(theme.palette.grey[50], 0.5),
        minHeight: '100%',
        '& .MuiTextField-root': {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: 'white',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
            '&.Mui-focused': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          },
        },
        '& .MuiSelect-select': {
          bgcolor: 'white',
        },
      }}
    >
      {/* Stage Description */}
      {stageConfig.description && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.info.main, 0.04),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Info sx={{ color: theme.palette.info.main, fontSize: 20, mt: 0.25 }} />
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            {stageConfig.description}
          </Typography>
        </Paper>
      )}

      {/* Render based on layout type */}
      {fieldGroups.type === 'sectioned' ? renderSectionedLayout() : renderLegacyLayout()}

      {/* Repeatable Section Controls */}
      {stageConfig.repeatable && (
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<Add />}
            onClick={() => handleRepeatableAdd(stageConfig.id)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Another Entry
          </Button>
          {(repeatableSections[stageConfig.id] || 1) > 1 && (
            <Button
              variant="outlined"
              size="medium"
              color="error"
              startIcon={<Remove />}
              onClick={() => handleRepeatableRemove(stageConfig.id)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Remove Entry
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DynamicFormView;
