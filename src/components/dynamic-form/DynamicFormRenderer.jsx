'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputAdornment,
  Collapse,
  IconButton,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Avatar,
  Chip,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  Transgender as TransgenderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  CameraAlt as CameraIcon,
  Fingerprint as FingerprintIcon,
  CheckCircle as CheckCircleIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Pets as PetsIcon,
  Phishing as BuffaloIcon,
  Agriculture as CowIcon,
  Diversity3 as GoatIcon,
  EmojiNature as PigIcon,
  CrueltyFree as RabbitIcon,
  FlightTakeoff as BirdIcon,
  Phishing as FishIcon,
  Pets as PawIcon
} from '@mui/icons-material';
import ImageCaptureUpload from './ImageCaptureUpload';

// Styles defined at the top for better maintainability
const getStyles = (theme) => ({
  // Success Card Styles
  successContainer: {
    width: '100%',
    maxWidth: '500px',
    mx: 'auto',
    py: 4
  },
  successCard: {
    background: alpha(theme.palette.success.light, 0.08),
    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
    borderRadius: '24px',
    p: 5,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  successLogoContainer: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 3,
    animation: 'scaleIn 0.5s ease-out',
    '@keyframes scaleIn': {
      '0%': { transform: 'scale(0)', opacity: 0 },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
  },
  successLogoBox: {
    width: '80px',
    height: '80px',
    mb: 2,
    position: 'relative',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    }
  },
  successFallbackIconCircle: {
    width: '80px',
    height: '80px',
    mb: 2,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.4)}`,
  },
  successCheckIcon: {
    fontSize: '48px',
    color: '#fff'
  },
  successTitleText: {
    fontWeight: 700,
    mb: 1.5,
    color: theme.palette.text.primary,
    fontSize: { xs: '20px', sm: '24px' },
  },
  successSubtitleText: {
    color: theme.palette.text.secondary,
    mb: 4,
    fontSize: '15px',
    lineHeight: 1.6,
  },
  successContinueButton: (hasContinued) => ({
    px: 5,
    py: 1.75,
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 600,
    background: hasContinued 
      ? theme.palette.action.disabledBackground
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: hasContinued 
      ? 'none'
      : `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
      boxShadow: hasContinued 
        ? 'none'
        : `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: hasContinued ? 'none' : 'translateY(-2px)',
    },
    transition: 'all 0.3s ease',
  }),
  successCompletionChip: {
    px: 2,
    py: 2.5,
    fontSize: '14px',
    fontWeight: 600
  },
  
  // Form Container Styles
  formContainer: {
    width: '100%',
    maxWidth: '100%',
    mx: 'auto',
  },
  formHeader: {
    mb: 3,
    textAlign: 'left'
  },
  formTitle: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    mb: 0.5,
    fontSize: { xs: '20px', sm: '24px' }
  },
  formDescription: {
    color: theme.palette.text.secondary,
    fontSize: '14px'
  },
  
  // Section Styles
  sectionPaper: {
    mb: 3,
    borderRadius: '16px',
    overflow: 'hidden',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
      borderColor: alpha(theme.palette.primary.main, 0.2),
    }
  },
  sectionHeader: {
    p: 2.5,
    cursor: 'pointer',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    transition: 'background 0.2s ease',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
    }
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  sectionIcon: {
    color: '#fff',
    fontSize: 24
  },
  sectionTitleContainer: {
    flex: 1
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '16px',
    color: theme.palette.text.primary,
    mb: 0.25
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: theme.palette.text.secondary
  },
  sectionContent: {
    p: 3
  },
  
  // Field Styles
  fieldBox: {
    mb: 2
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      }
    }
  },
  
  // Radio Button Styles
  radioOption: (isSelected) => ({
    flex: '1 1 0',
    p: 2,
    cursor: 'pointer',
    border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    background: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: alpha(theme.palette.primary.main, 0.04),
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
    }
  }),
  radioIconCircle: (isSelected) => ({
    width: 48,
    height: 48,
    borderRadius: '12px',
    background: isSelected 
      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` 
      : alpha(theme.palette.action.hover, 0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 1.5,
    transition: 'all 0.2s ease',
  }),
  radioIconStyle: (isSelected) => ({
    fontSize: 28,
    color: isSelected ? '#fff' : theme.palette.text.secondary,
  }),
  radioLabel: (isSelected) => ({
    fontWeight: isSelected ? 600 : 500,
    fontSize: '15px',
    color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
  }),
  
  // Submit Button Styles
  submitButton: {
    mt: 3,
    py: 1.75,
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
      boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-2px)',
    },
    transition: 'all 0.2s ease',
  },
  
  // Biometric Scanner Styles
  biometricContainer: {
    textAlign: 'center',
    py: 3
  },
  biometricPaper: (captured) => ({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    p: 5,
    border: captured 
      ? `2px solid ${theme.palette.success.main}`
      : `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
    borderRadius: '20px',
    cursor: captured ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: captured 
      ? alpha(theme.palette.success.main, 0.05)
      : '#ffffff',
    '&:hover': {
      borderColor: captured 
        ? theme.palette.success.main
        : theme.palette.primary.main,
      backgroundColor: captured 
        ? alpha(theme.palette.success.main, 0.05)
        : alpha(theme.palette.primary.main, 0.02),
      transform: captured ? 'none' : 'scale(1.02)',
    }
  }),
  biometricIconCircle: (captured) => ({
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: captured
      ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 32px ${alpha(captured ? theme.palette.success.main : theme.palette.primary.main, 0.3)}`,
    animation: captured ? 'none' : 'biometricPulse 2s ease-in-out infinite',
    '@keyframes biometricPulse': {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
    },
  }),
  biometricIcon: {
    fontSize: 64,
    color: '#fff'
  },
  biometricLabel: (captured) => ({
    fontWeight: 600,
    color: captured ? theme.palette.success.main : theme.palette.text.primary,
    fontSize: '16px'
  }),
  biometricSubtext: {
    color: theme.palette.text.secondary,
    fontSize: '14px'
  },
});

const DynamicFormRenderer = ({ formSchema, onSubmit, onContinue, viewOnly = false }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [formData, setFormData] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);

  // Initialize form data with mock data if available
  React.useEffect(() => {
    if (formSchema?.mockData) {
      setFormData(formSchema.mockData);
    }
  }, [formSchema?.mockData]);

  // Initialize expanded sections
  React.useEffect(() => {
    if (formSchema?.sections) {
      const initialExpanded = {};
      formSchema.sections.forEach((section, index) => {
        initialExpanded[section.id || index] = index === 0; // First section expanded by default
      });
      setExpandedSections(initialExpanded);
    }
  }, [formSchema]);

  const validateField = (field, value) => {
    // Skip validation if field is not required and empty
    if (!field.required && !value) {
      return null;
    }

    // TEMPORARY: Skip file upload validation for testing workflow navigation
    if (field.type === 'file' || field.type === 'image_capture') {
      console.log(`⚠️ Skipping validation for file upload field: ${field.label}`);
      return null;
    }

    // Required field validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return field.validation?.message || `${field.label} is required`;
    }

    // Custom validation rules from JSON
    if (field.validation && value) {
      // Min length validation
      if (field.validation.minLength && value.length < field.validation.minLength) {
        return field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`;
      }

      // Max length validation
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        return field.validation.message || `${field.label} must not exceed ${field.validation.maxLength} characters`;
      }

      // Date validation - maxDate
      if (field.validation.maxDate && field.type === 'date') {
        const selectedDate = new Date(value);
        const maxDate = new Date(field.validation.maxDate);
        if (selectedDate >= maxDate) {
          return field.validation.message || `Date must be before ${field.validation.maxDate}`;
        }
      }

      // Date validation - minDate
      if (field.validation.minDate && field.type === 'date') {
        const selectedDate = new Date(value);
        const minDate = new Date(field.validation.minDate);
        if (selectedDate <= minDate) {
          return field.validation.message || `Date must be after ${field.validation.minDate}`;
        }
      }

      // Pattern validation (regex from JSON)
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return field.validation.message || `${field.label} format is invalid`;
        }
      }

      // Min value validation (for number fields)
      if (field.validation.minValue !== undefined && field.type === 'number') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue < field.validation.minValue) {
          return field.validation.message || `${field.label} must be at least ${field.validation.minValue}`;
        }
      }

      // Max value validation (for number fields)
      if (field.validation.maxValue !== undefined && field.type === 'number') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > field.validation.maxValue) {
          return field.validation.message || `${field.label} must not exceed ${field.validation.maxValue}`;
        }
      }
    }

    return null;
  };

  const handleFieldChange = (fieldId, value, field) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Validate on change
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [fieldId]: error
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSubmit = () => {
    console.log("🔘 Submit button clicked in DynamicFormRenderer");
    console.log("🔘 Current form data:", formData);
    
    // Validate all fields before submit
    const newErrors = {};
    let hasErrors = false;

    formSchema.sections?.forEach(section => {
      section.fields?.forEach(field => {
        const value = formData[field.id];
        const error = validateField(field, value);
        if (error) {
          console.log(`❌ Validation error for field "${field.label}" (${field.id}):`, error);
          newErrors[field.id] = error;
          hasErrors = true;
        }
      });
    });

    setErrors(newErrors);

    if (hasErrors) {
      console.log("❌ Form has validation errors:", newErrors);
      console.log("❌ Total errors:", Object.keys(newErrors).length);
      
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(`field-${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log("✅ Form validation passed!");
    console.log("✅ Calling onSubmit with data:", formData);
    
    // Mark as submitted
    setIsSubmitted(true);
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleContinue = () => {
    if (onContinue && formSchema.nextFormId && !hasContinued) {
      setHasContinued(true);
      onContinue(formSchema.nextFormId);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'male': MaleIcon,
      'female': FemaleIcon,
      'transgender': TransgenderIcon,
      'person': PersonIcon,
      'calendar': CalendarIcon,
      'phone': PhoneIcon,
      'email': EmailIcon,
      'home': HomeIcon,
      'bank': BankIcon,
      'camera': CameraIcon,
      'fingerprint': FingerprintIcon,
      'document': DocumentIcon,
      'edit': EditIcon,
      'pdf': PdfIcon,
      'check_circle': CheckCircleIcon,
      'pets': PetsIcon,
      'buffalo': BuffaloIcon,
      'cow': CowIcon,
      'goat': GoatIcon,
      'pig': PigIcon,
      'rabbit': RabbitIcon,
      'bird': BirdIcon,
      'fish': FishIcon,
      'paw': PawIcon
    };
    return iconMap[iconName?.toLowerCase()] || PersonIcon;
  };

  const isFieldEnabled = (field) => {
    // If viewOnly mode is active, all fields are disabled
    if (viewOnly) {
      return false;
    }
    
    // If field is explicitly disabled in config, always return false
    if (field.disabled === true) {
      return false;
    }
    // If no enabledIf condition, field is always enabled
    if (!field.enabledIf) {
      return true;
    }

    // Check if the dependent field has the required value
    const dependentFieldValue = formData[field.enabledIf.field];
    
    if (field.enabledIf.equals !== undefined) {
      return dependentFieldValue === field.enabledIf.equals;
    }
    
    if (field.enabledIf.notEquals !== undefined) {
      return dependentFieldValue !== field.enabledIf.notEquals;
    }
    
    // For boolean fields (like checkbox), check if it's truthy
    return !!dependentFieldValue;
  };

  const isFieldVisible = (field) => {
    // If no showIf condition, field is always visible
    if (!field.showIf) {
      return true;
    }

    // Check if the dependent field has the required value
    const dependentFieldValue = formData[field.showIf.field];
    
    if (field.showIf.equals !== undefined) {
      return dependentFieldValue === field.showIf.equals;
    }
    
    if (field.showIf.notEquals !== undefined) {
      return dependentFieldValue !== field.showIf.notEquals;
    }
    
    // For boolean fields (like checkbox), check if it's truthy
    return !!dependentFieldValue;
  };

  const renderField = (field) => {
    // Check if field should be visible
    const isVisible = isFieldVisible(field);
    if (!isVisible) {
      return null; // Don't render the field at all
    }

    const value = formData[field.id] || '';
    const error = errors[field.id];
    const isEnabled = isFieldEnabled(field);

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <TextField
              fullWidth
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              required={field.required}
              error={!!error}
              helperText={error}
              disabled={!isEnabled}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  fontSize: '14px',
                  fontWeight: 500,
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '12px',
                  marginLeft: 0,
                  marginTop: 0.5
                }
              }}
              InputProps={field.icon ? {
                startAdornment: (
                  <InputAdornment position="start">
                    {React.createElement(getIconComponent(field.icon), {
                      sx: { color: error ? theme.palette.error.main : theme.palette.primary.main, fontSize: 20 }
                    })}
                  </InputAdornment>
                ),
              } : undefined}
            />
          </Box>
        );

      case 'date':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <TextField
              fullWidth
              label={field.label}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              required={field.required}
              error={!!error}
              helperText={error}
              disabled={!isEnabled}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '12px',
                  marginLeft: 0,
                  marginTop: 0.5
                }
              }}
            />
          </Box>
        );

      case 'dropdown':
      case 'select':
        return (
          <FormControl key={field.id} fullWidth error={!!error} id={`field-${field.id}`}>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: error ? theme.palette.error.main : theme.palette.text.primary,
                fontSize: '15px',
                fontWeight: 600
              }}
            >
              {field.label}{field.required && '*'}
            </Typography>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              disabled={!isEnabled}
              displayEmpty
              sx={{
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: error ? theme.palette.error.main : alpha(theme.palette.divider, 0.3),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                },
                '& .MuiSelect-select': {
                  color: value ? theme.palette.text.primary : theme.palette.text.disabled,
                }
              }}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ color: theme.palette.text.disabled, fontSize: '14px' }}>
                  {field.placeholder || `Select ${field.label}`}
                </Typography>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography sx={{ color: theme.palette.error.main, fontSize: '12px', mt: 0.5, ml: 0 }}>
                {error}
              </Typography>
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl key={field.id} fullWidth sx={{ mb: 2 }} error={!!error} id={`field-${field.id}`}>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: error ? theme.palette.error.main : theme.palette.text.primary,
                fontSize: '15px',
                fontWeight: 600
              }}
            >
              {field.label}{field.required && '*'}
            </Typography>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              sx={{
                opacity: isEnabled ? 1 : 0.5,
                pointerEvents: isEnabled ? 'auto' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {field.options?.map((option) => {
                const isSelected = value === option.value;
                const IconComponent = option.icon ? getIconComponent(option.icon) : null;

                return (
                  <Paper
                    key={option.value}
                    elevation={0}
                    sx={{
                      width: '100%',
                      maxWidth: '100%',
                      p: 2,
                      border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : '#ffffff',
                      boxSizing: 'border-box',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      }
                    }}
                    onClick={() => handleFieldChange(field.id, option.value, field)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {IconComponent && (
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                            color: isSelected ? '#ffffff' : theme.palette.primary.main,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 22 }} />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                            fontSize: '15px',
                            wordBreak: 'normal',
                            whiteSpace: 'normal',
                            lineHeight: 1.4
                          }}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                      <Radio
                        checked={isSelected}
                        value={option.value}
                        sx={{
                          color: alpha(theme.palette.primary.main, 0.3),
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                );
              })}
            </RadioGroup>
            {error && (
              <Typography sx={{ color: theme.palette.error.main, fontSize: '12px', mt: 1, ml: 0 }}>
                {error}
              </Typography>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked, field)}
                  sx={{
                    color: error ? theme.palette.error.main : theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '13px', color: theme.palette.text.secondary }}>
                  {field.label}
                </Typography>
              }
              sx={{ mb: 2 }}
            />
            {error && (
              <Typography sx={{ color: theme.palette.error.main, fontSize: '12px', mt: 0.5, ml: 0 }}>
                {error}
              </Typography>
            )}
          </Box>
        );

      case 'biometric':
        const biometricCaptured = formData[field.id] === 'captured';
        return (
          <Box key={field.id} sx={styles.biometricContainer} id={`field-${field.id}`}>
            <Paper
              elevation={0}
              onClick={() => {
                if (!biometricCaptured) {
                  handleFieldChange(field.id, 'captured', field);
                }
              }}
              sx={styles.biometricPaper(biometricCaptured)}
            >
              <Box sx={styles.biometricIconCircle(biometricCaptured)}>
                {biometricCaptured ? (
                  <CheckCircleIcon sx={styles.biometricIcon} />
                ) : (
                  <FingerprintIcon sx={styles.biometricIcon} />
                )}
              </Box>
              <Typography variant="body1" sx={styles.biometricLabel(biometricCaptured)}>
                {biometricCaptured ? '✓ Fingerprint Captured' : (field.label || 'Tap to scan fingerprint')}
              </Typography>
              {biometricCaptured && (
                <Typography variant="body2" sx={styles.biometricSubtext}>
                  Authentication successful
                </Typography>
              )}
            </Paper>
            {error && (
              <Typography sx={{ color: theme.palette.error.main, fontSize: '12px', mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        );

      case 'image_capture':
      case 'file':
        return (
          <ImageCaptureUpload
            key={field.id}
            field={field}
            value={value}
            onChange={(imageData) => handleFieldChange(field.id, imageData, field)}
            error={error}
            disabled={!isEnabled}
          />
        );

      case 'button':
        return (
          <Box key={field.id} sx={{ textAlign: 'center', my: 3 }} id={`field-${field.id}`}>
            <Button
              variant={field.variant || 'outlined'}
              size="large"
              onClick={() => {
                if (field.action === 'esign') {
                  // Simulate e-sign process
                  handleFieldChange(field.id, 'signed', field);
                  handleFieldChange('esign_status', '✅ E-sign Completed', field);
                  handleFieldChange('esign_completed', true, field);
                } else if (field.action === 'view_pdf') {
                  // Open mock PDF in new tab
                  window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                }
              }}
              disabled={!isEnabled || (field.action === 'view_pdf' && !formData.esign_completed)}
              startIcon={field.icon && React.createElement(getIconComponent(field.icon), { sx: { fontSize: 20 } })}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                minWidth: 200,
                border: field.variant === 'outlined' ? `2px solid ${theme.palette.primary.main}` : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.2s ease',
              }}
            >
              {field.buttonLabel || field.label}
            </Button>
            {error && (
              <Typography sx={{ color: theme.palette.error.main, fontSize: '12px', mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const renderSection = (section, index) => {
    const sectionId = section.id || index;
    const isExpanded = expandedSections[sectionId];
    const IconComponent = section.icon ? getIconComponent(section.icon) : BankIcon;

    return (
      <Paper
        key={sectionId}
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Section Header */}
        <Box
          onClick={() => toggleSection(sectionId)}
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              backgroundColor: theme.palette.primary.main,
              color: '#ffffff',
            }}
          >
            <IconComponent sx={{ fontSize: 24 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', color: theme.palette.text.primary }}>
              {section.title}
            </Typography>
            {section.subtitle && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '12px' }}>
                {section.subtitle}
              </Typography>
            )}
          </Box>
          <IconButton size="small">
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Section Content */}
        <Collapse in={isExpanded}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {section.fields?.map(field => renderField(field))}
            </Box>
          </Box>
        </Collapse>
      </Paper>
    );
  };

  if (!formSchema) {
    return null;
  }

  // If form is submitted, show success message
  if (isSubmitted) {
    // Get the appropriate logo based on form ID
    const getLogo = () => {
      if (formSchema.id === 'l1_customer_info') return '/l1.svg';
      if (formSchema.id === 'instant_kcc') return '/kcc.svg';
      if (formSchema.id === 'bank_account_details') return '/bank.svg';
      if (formSchema.id === 'esign_documents') return '/esign.svg';
      if (formSchema.id === 'loan_disbursement') return '/esign.svg';
      return null;
    };

    const logo = getLogo();

    return (
      <Box sx={styles.successContainer}>
        <Paper elevation={0} sx={styles.successCard}>
          {/* Success Icon with Logo */}
          <Box sx={styles.successLogoContainer}>
            {logo ? (
              <Box sx={styles.successLogoBox}>
                <img src={logo} alt="Success" />
              </Box>
            ) : (
              <Box sx={styles.successFallbackIconCircle}>
                <CheckCircleIcon sx={styles.successCheckIcon} />
              </Box>
            )}
          </Box>

          {/* Title */}
          <Typography variant="h5" sx={styles.successTitleText}>
            {formSchema.title} Completed!
          </Typography>

          {/* Subtitle */}
          <Typography variant="body1" sx={styles.successSubtitleText}>
            Your information has been saved successfully.
          </Typography>
          
          {/* Continue Button */}
          {formSchema.nextFormId && (
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              disabled={hasContinued}
              sx={styles.successContinueButton(hasContinued)}
            >
              {hasContinued 
                ? '✓ Proceeding to Next Section...'
                : `Continue to ${formSchema.nextFormTitle || 'Next Section'}`
              }
            </Button>
          )}

          {/* No next form message */}
          {!formSchema.nextFormId && (
            <Chip
              icon={<CheckCircleIcon />}
              label="All Sections Complete"
              color="success"
              sx={styles.successCompletionChip}
            />
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={styles.formContainer}>
      {/* Form Header */}
      {formSchema.title && (
        <Box sx={styles.formHeader}>
          <Typography variant="h5" sx={styles.formTitle}>
            {formSchema.title}
          </Typography>
          {formSchema.description && (
            <Typography variant="body2" sx={styles.formDescription}>
              {formSchema.description}
            </Typography>
          )}
        </Box>
      )}

      {/* Form Sections */}
      {formSchema.sections?.map((section, index) => renderSection(section, index))}

      {/* Submit Button - Hidden in view-only mode */}
      {!viewOnly && formSchema.submitButton && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          endIcon={<CheckCircleIcon />}
          sx={styles.submitButton}
        >
          {formSchema.submitButton.label || 'Submit'}
        </Button>
      )}
    </Box>
  );
};

export default DynamicFormRenderer;
