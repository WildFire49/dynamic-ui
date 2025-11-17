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
} from "@mui/material";
import { Add, Remove, ChevronLeft, ChevronRight, Delete } from "@mui/icons-material";

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
      variant="subtitle2"
      sx={{
        fontWeight: 600,
        color: theme.palette.text.primary,
        mb: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {field.label}
      {isRequired && (
        <Box component="span" sx={{ color: theme.palette.error.main }}>
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

    switch (field.type) {
      case "text":
      case "number":
      case "decimal":
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {renderFieldLabel(field, isRequired)}
            <TextField
              key={field.id}
              fullWidth
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
                '& .MuiOutlinedInput-root': {
                  bgcolor: field.readOnly ? alpha(theme.palette.grey[100], 0.5) : 'white',
                  minHeight: '56px',
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                },
              }}
            />
            {field.hint && (
              <Typography variant="caption" color="text.secondary">
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "textarea":
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {renderFieldLabel(field, isRequired)}
            <TextField
              fullWidth
              multiline
              rows={4}
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
                  bgcolor: field.readOnly ? alpha(theme.palette.grey[100], 0.5) : 'white',
                  borderRadius: 1,
                },
              }}
            />
            {field.hint && (
              <Typography variant="caption" color="text.secondary">
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "dropdown":
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {renderFieldLabel(field, isRequired)}
            <FormControl fullWidth required={isRequired}>
              <Select
                value={value}
                displayEmpty
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                disabled={field.readOnly}
                sx={{
                  bgcolor: field.readOnly ? alpha(theme.palette.grey[100], 0.5) : 'white',
                  minHeight: '56px',
                  borderRadius: 1,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        Select {field.label}
                      </Typography>
                    );
                  }
                  return selected;
                }}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {field.hint && (
              <Typography variant="caption" color="text.secondary">
                {field.hint}
              </Typography>
            )}
          </Box>
        );

      case "radio":
        return (
          <Box sx={{ width: '100%' }}>
            {renderFieldLabel(field, isRequired)}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.grey[50], 0.3),
                pointerEvents: 'auto',
              }}
            >
              <FormControl component="fieldset" required={isRequired} fullWidth>
                <RadioGroup
                  value={value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  row={field.options?.length <= 3}
                  sx={{
                    '& .MuiFormControlLabel-root': {
                      mr: 4,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      },
                    },
                    '& .MuiRadio-root': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {field.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio disabled={field.readOnly} />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
                {field.hint && (
                  <FormHelperText sx={{ mt: 1, fontSize: '0.75rem' }}>
                    {field.hint}
                  </FormHelperText>
                )}
              </FormControl>
            </Paper>
          </Box>
        );

      case "multiselect":
        const multiValue = value || [];
        return (
          <Box sx={{ width: '100%' }}>
            <FormControl fullWidth required={isRequired}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                multiple
                value={multiValue}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                input={<OutlinedInput label={field.label} />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {Array.isArray(selected) && selected.map((val, idx) => (
                      <Chip key={`${val}-${idx}`} label={val} size="small" />
                    ))}
                  </Box>
                )}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={multiValue.indexOf(option) > -1} />
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {field.hint && <FormHelperText>{field.hint}</FormHelperText>}
            </FormControl>
          </Box>
        );

      case "section":
        const isRepeatable = field.repeatable;
        const sectionCount = isRepeatable ? (repeatableSections[field.id] || 1) : 1;
        const activePage = currentPage[field.id] || 0;
        
        return (
          <Box key={field.id} sx={{ mb: 4, mt: 3 }}>
            <Grid container spacing={3}>
              {/* Main Form Area */}
              <Grid item xs={12} md={isRepeatable ? 8 : 12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      pb: 2,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        fontSize: '1.125rem',
                      }}
                    >
                      {field.label} {isRepeatable && `(${activePage + 1}/${sectionCount})`}
                    </Typography>
                    {isRepeatable && sectionCount > 1 && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setCurrentPage({ ...currentPage, [field.id]: Math.max(0, activePage - 1) })}
                          disabled={activePage === 0}
                        >
                          <ChevronLeft />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setCurrentPage({ ...currentPage, [field.id]: Math.min(sectionCount - 1, activePage + 1) })}
                          disabled={activePage === sectionCount - 1}
                        >
                          <ChevronRight />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {field.fields?.map((subField, subIndex) => {
                const stageData = formData[stageConfig.id] || {};
                const shouldShow = subField.conditional ? 
                  stageData[subField.conditional.field] === subField.conditional.value : true;
                
                if (!shouldShow) return null;
                
                let gridSize = { xs: 12, sm: 6, md: 4 }; // Default: 3 per row
                
                if (subField.columnSpan === 'full' || subField.type === 'radio' || subField.type === 'textarea') {
                  gridSize = { xs: 12, sm: 12, md: 12 };
                } else if (subField.columnSpan === 'half') {
                  gridSize = { xs: 12, sm: 6, md: 6 };
                }
                
                return (
                  <Grid item key={`${field.id}-${subField.id}-${subIndex}`} {...gridSize}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {renderField(subField, `${index}-${subIndex}`)}
                    </Box>
                  </Grid>
                );
              })}
              </Grid>
              
              {/* Add/Remove Buttons */}
              {isRepeatable && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      handleRepeatableAdd(field.id);
                      setCurrentPage({ ...currentPage, [field.id]: sectionCount });
                    }}
                  >
                    Add Range
                  </Button>
                  {sectionCount > 1 && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => {
                        const newCount = sectionCount - 1;
                        setRepeatableSections({ ...repeatableSections, [field.id]: newCount });
                        if (activePage >= newCount) {
                          setCurrentPage({ ...currentPage, [field.id]: newCount - 1 });
                        }
                      }}
                    >
                      Remove Range {activePage + 1}
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
          
         
        </Grid>
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
          <Box key={field.id} sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2,
              }}
            >
              {field.label}
            </Typography>
            <Box sx={{ pl: 2 }}>
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

  // Group fields into sections for better organization
  const groupFields = () => {
    const groups = [];
    const fileUploads = [];
    let currentGroup = [];
    
    stageConfig.fields?.forEach((field) => {
      if (field.type === 'file') {
        // Separate file upload fields
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
    
    // Add file uploads at the end
    if (fileUploads.length > 0) {
      groups.push({ type: 'fileUploads', fields: fileUploads });
    }
    
    return groups;
  };

  const fieldGroups = groupFields();

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%',
        mx: 'auto',
        '& .MuiTextField-root': {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 600,
            color: theme.palette.text.primary,
            '&.Mui-focused': {
              color: theme.palette.primary.main,
            },
          },
        },
      }}
    >
      {fieldGroups.map((group, groupIndex) => {
        if (group.type === 'section') {
          return (
            <React.Fragment key={`section-${group.field.id || groupIndex}`}>
              {renderField(group.field, `section-${groupIndex}`)}
            </React.Fragment>
          );
        }
        
        if (group.type === 'fileUploads') {
          return (
            <Box key={`file-uploads-${groupIndex}`} sx={{ mt: 6, mb: 4 }}>
              {group.fields.map((field, fieldIndex) => (
                <Box
                  key={field.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: fieldIndex < group.fields.length - 1 ? 4 : 0,
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
          <Box key={`group-${groupIndex}`} sx={{ mb: 4 }}>
            <Grid container spacing={{ xs: 2.5, sm: 3, md: 3.5 }}>
              {group.fields.map((field, fieldIndex) => {
                const stageData = formData[stageConfig.id] || {};
                const shouldShowField = field.conditional ? 
                  stageData[field.conditional.field] === field.conditional.value : true;
                
                if (!shouldShowField) return null;
                
                // Simple grid sizing based on columnSpan property
                let gridSize = { xs: 12, sm: 6, md: 4 }; // Default: 3 per row on desktop
                
                if (field.columnSpan === 'full' || field.type === 'radio' || field.type === 'textarea') {
                  gridSize = { xs: 12, sm: 12, md: 12 }; // Full width
                } else if (field.columnSpan === 'half') {
                  gridSize = { xs: 12, sm: 6, md: 6 }; // Half width - 2 per row
                }
                
                return (
                  <Grid
                    item
                    key={field.id}
                    {...gridSize}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {renderField(field, `${groupIndex}-${fieldIndex}`)}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
      
      {/* Repeatable Section Controls */}
      {stageConfig.repeatable && (
        <Box sx={{ mt: 3, display: "flex", gap: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => handleRepeatableAdd(stageConfig.id)}
          >
            Add Another Entry
          </Button>
          {(repeatableSections[stageConfig.id] || 1) > 1 && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<Remove />}
              onClick={() => handleRepeatableRemove(stageConfig.id)}
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
