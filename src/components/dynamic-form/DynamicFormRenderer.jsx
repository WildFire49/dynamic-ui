'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  FormControl,
  RadioGroup,
  Select,
  MenuItem,
  InputAdornment,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Avatar,
  Chip,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  Transgender as TransgenderIcon,
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
  Pets as PawIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CloudUpload as UploadIcon,
  Badge as BadgeIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  TaskAlt as TaskAltIcon,
  Celebration as CelebrationIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  FamilyRestroom as FamilyIcon,
  Wc as WcIcon,
  Cake as CakeIcon,
  ContactPhone as ContactPhoneIcon,
  MarkunreadMailbox as MailboxIcon,
  Map as MapIcon,
  PinDrop as PinDropIcon,
  MyLocation as MyLocationIcon,
  Apartment as ApartmentIcon,
  Public as PublicIcon,
  LocalPostOffice as PostOfficeIcon,
  Numbers as NumbersIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import ImageCaptureUpload from './ImageCaptureUpload';

// ── Constants ──

const SECTION_PALETTES = [
  { main: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8', bg: '#EFF6FF' },
  { main: '#8B5CF6', light: '#EDE9FE', dark: '#6D28D9', bg: '#F5F3FF' },
  { main: '#06B6D4', light: '#CFFAFE', dark: '#0891B2', bg: '#ECFEFF' },
  { main: '#10B981', light: '#D1FAE5', dark: '#059669', bg: '#ECFDF5' },
  { main: '#F59E0B', light: '#FEF3C7', dark: '#D97706', bg: '#FFFBEB' },
  { main: '#EF4444', light: '#FEE2E2', dark: '#DC2626', bg: '#FEF2F2' },
  { main: '#EC4899', light: '#FCE7F3', dark: '#DB2777', bg: '#FDF2F8' },
];

const ICON_MAP = {
  'male': MaleIcon, 'female': FemaleIcon, 'transgender': TransgenderIcon,
  'person': PersonIcon, 'calendar': CalendarIcon, 'phone': PhoneIcon,
  'email': EmailIcon, 'home': HomeIcon, 'bank': BankIcon, 'camera': CameraIcon,
  'fingerprint': FingerprintIcon, 'document': DocumentIcon, 'edit': EditIcon,
  'pdf': PdfIcon, 'check_circle': CheckCircleIcon, 'pets': PetsIcon,
  'buffalo': BuffaloIcon, 'cow': CowIcon, 'goat': GoatIcon, 'pig': PigIcon,
  'rabbit': RabbitIcon, 'bird': BirdIcon, 'fish': FishIcon, 'paw': PawIcon,
  'work': WorkIcon, 'business': BusinessIcon, 'location': LocationIcon,
  'upload': UploadIcon, 'badge': BadgeIcon, 'credit_card': CreditCardIcon,
  'security': SecurityIcon, 'verified': VerifiedIcon, 'shield': ShieldIcon,
  'lock': LockIcon, 'account': AccountCircleIcon, 'family': FamilyIcon,
  'wc': WcIcon, 'cake': CakeIcon, 'contact_phone': ContactPhoneIcon,
  'mailbox': MailboxIcon, 'map': MapIcon, 'pin_drop': PinDropIcon,
  'my_location': MyLocationIcon, 'apartment': ApartmentIcon,
  'public': PublicIcon, 'post_office': PostOfficeIcon, 'numbers': NumbersIcon,
};

const getIconComponent = (iconName) => ICON_MAP[iconName?.toLowerCase()] || PersonIcon;

// ── Extracted styles ──

const getTextFieldSx = (accentColor, error, errorColor) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    '& fieldset': {
      borderColor: error ? errorColor : alpha('#000', 0.08),
    },
    '&:hover fieldset': {
      borderColor: error ? errorColor : alpha(accentColor, 0.4),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${alpha(accentColor, 0.1)}`,
      '& fieldset': {
        borderColor: accentColor,
        borderWidth: '1.5px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    fontWeight: 500,
    '&.Mui-focused': { color: accentColor },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '12px',
    ml: 0.5,
    mt: 0.5,
  },
});

const getSelectSx = (accentColor, error, errorColor, hasValue, textPrimary, textDisabled) => ({
  borderRadius: '14px',
  backgroundColor: '#ffffff',
  fontSize: '15px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: error ? errorColor : alpha('#000', 0.08),
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(accentColor, 0.4),
  },
  '&.Mui-focused': {
    boxShadow: `0 0 0 3px ${alpha(accentColor, 0.1)}`,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: accentColor,
      borderWidth: '1.5px',
    },
  },
  '& .MuiSelect-select': {
    color: hasValue ? textPrimary : textDisabled,
  },
});

const getMenuPaperSx = (accentColor) => ({
  borderRadius: '14px',
  mt: 0.5,
  boxShadow: `0 10px 40px ${alpha('#000', 0.1)}`,
  border: `1px solid ${alpha('#000', 0.04)}`,
  '& .MuiMenuItem-root': {
    fontSize: '15px',
    py: 1.25,
    mx: 0.75,
    borderRadius: '10px',
    '&.Mui-selected': {
      backgroundColor: alpha(accentColor, 0.08),
      color: accentColor,
      fontWeight: 600,
    },
  },
});

const getRadioOptionSx = (isSelected, accentColor) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.75,
  py: 2,
  px: 1.5,
  border: `2px solid ${isSelected ? accentColor : alpha('#000', 0.06)}`,
  borderRadius: '16px',
  cursor: 'pointer',
  backgroundColor: isSelected ? alpha(accentColor, 0.06) : '#ffffff',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  boxShadow: isSelected
    ? `0 4px 14px ${alpha(accentColor, 0.15)}`
    : `0 1px 3px ${alpha('#000', 0.04)}`,
  '&:active': { transform: 'scale(0.96)' },
});

const getRadioAvatarSx = (isSelected, accentColor) => ({
  width: 42,
  height: 42,
  backgroundColor: isSelected ? accentColor : alpha(accentColor, 0.1),
  color: isSelected ? '#fff' : accentColor,
  transition: 'all 0.2s ease',
  boxShadow: isSelected ? `0 3px 10px ${alpha(accentColor, 0.3)}` : 'none',
});

const radioCheckmark = {
  position: 'absolute', top: 7, right: 7,
  width: 18, height: 18, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const getBiometricContainerSx = (captured, accentColor, successColor) => ({
  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 3.5,
  border: captured
    ? `2px solid ${successColor}`
    : `2px dashed ${alpha(accentColor, 0.3)}`,
  borderRadius: '20px',
  cursor: captured ? 'default' : 'pointer',
  backgroundColor: captured ? alpha(successColor, 0.04) : '#ffffff',
  transition: 'all 0.2s ease',
  boxShadow: `0 2px 8px ${alpha('#000', 0.04)}`,
  '&:active': captured ? {} : { transform: 'scale(0.97)' },
});

const getBiometricCircle = (captured, accentColor, paletteDark, successColor, successDark) => ({
  width: 80, height: 80, borderRadius: '50%',
  background: captured
    ? `linear-gradient(135deg, ${successColor}, ${successDark})`
    : `linear-gradient(135deg, ${accentColor}, ${paletteDark})`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: `0 6px 20px ${alpha(captured ? successColor : accentColor, 0.25)}`,
});

const getSectionPaperSx = (paletteMain) => ({
  borderRadius: '20px',
  overflow: 'hidden',
  border: `1px solid ${alpha(paletteMain, 0.12)}`,
  backgroundColor: '#ffffff',
  transition: 'all 0.2s ease',
});

const getSectionBannerSx = (paletteMain, paletteLight) => ({
  background: `linear-gradient(135deg, ${alpha(paletteMain, 0.08)} 0%, ${alpha(paletteLight, 0.5)} 100%)`,
  px: 2.5,
  py: 2,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  borderBottom: `1px solid ${alpha(paletteMain, 0.06)}`,
});

const getSectionAvatarSx = (paletteMain, paletteDark) => ({
  width: 40,
  height: 40,
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${paletteMain}, ${paletteDark})`,
  color: '#fff',
  boxShadow: `0 4px 12px ${alpha(paletteMain, 0.25)}`,
});

const getCompleteBadgeSx = (successColor) => ({
  height: 20, fontSize: '10px', fontWeight: 700,
  backgroundColor: alpha(successColor, 0.1),
  color: successColor,
  '& .MuiChip-label': { px: 0.75 },
});

const sectionFieldsContainer = { p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 };

const getSubmitButtonSx = (primaryMain) => ({
  mt: 3,
  py: 1.75,
  borderRadius: '16px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${primaryMain} 0%, #8B5CF6 100%)`,
  boxShadow: `0 6px 20px ${alpha(primaryMain, 0.3)}`,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: `0 8px 28px ${alpha(primaryMain, 0.4)}`,
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'scale(0.99) translateY(0)',
  },
});

const getProgressBarSx = (progress, successColor, successLight) => ({
  flex: 1, height: 6, borderRadius: 3,
  backgroundColor: alpha('#000', 0.04),
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: progress === 100
      ? `linear-gradient(90deg, ${successColor}, ${successLight})`
      : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
    transition: 'transform 0.3s ease',
  },
});

const getSuccessCircleSx = (successColor, successDark) => ({
  width: 72, height: 72, borderRadius: '50%',
  background: `linear-gradient(135deg, ${successColor}, ${successDark})`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: `0 6px 24px ${alpha(successColor, 0.3)}`,
});

const successPopAnimation = {
  display: 'inline-flex', mb: 3,
  animation: 'pop 0.4s ease-out',
  '@keyframes pop': {
    '0%': { transform: 'scale(0)', opacity: 0 },
    '70%': { transform: 'scale(1.08)' },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
};

const getContinueButtonSx = (hasContinued, primaryMain, primaryDark, disabledBg) => ({
  py: 1.5, borderRadius: '14px', textTransform: 'none', fontSize: '16px', fontWeight: 700,
  background: hasContinued ? disabledBg : `linear-gradient(135deg, ${primaryMain}, ${primaryDark})`,
  boxShadow: hasContinued ? 'none' : `0 4px 16px ${alpha(primaryMain, 0.25)}`,
});

const getButtonFieldSx = (accentColor, paletteDark, isOutlined) => ({
  px: 4, py: 1.25, borderRadius: '14px', textTransform: 'none', fontSize: '15px', fontWeight: 600,
  borderColor: accentColor,
  color: isOutlined ? accentColor : '#fff',
  backgroundColor: isOutlined ? 'transparent' : accentColor,
  '&:hover': {
    borderColor: paletteDark,
    backgroundColor: isOutlined ? alpha(accentColor, 0.04) : paletteDark,
  },
});

const errorText = (errorColor) => ({ color: errorColor, fontSize: '12px' });

const labelStyle = (errorColor, secondaryColor, hasError) => ({
  mb: 0.75, fontSize: '13px', fontWeight: 600,
  color: hasError ? errorColor : secondaryColor,
});

// ── Component ──

const DynamicFormRenderer = ({ formSchema, onSubmit, onContinue, viewOnly = false, skipNavigation = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);

  // Cache theme colors
  const colors = useMemo(() => ({
    error: theme.palette.error.main,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textDisabled: theme.palette.text.disabled,
    successMain: theme.palette.success.main,
    successDark: theme.palette.success.dark,
    successLight: theme.palette.success.light,
    primaryMain: theme.palette.primary.main,
    primaryDark: theme.palette.primary.dark,
    disabledBg: theme.palette.action.disabledBackground,
  }), [theme]);

  React.useEffect(() => {
    if (formSchema?.mockData) setFormData(formSchema.mockData);
  }, [formSchema?.mockData]);

  const validateField = useCallback((field, value) => {
    if (!field.required && !value) return null;
    if (field.type === 'file' || field.type === 'image_capture') return null;
    if (field.required && (!value || (typeof value === 'string' && value.trim() === '')))
      return field.validation?.message || `${field.label} is required`;
    if (field.validation && value) {
      if (field.validation.minLength && value.length < field.validation.minLength)
        return field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`;
      if (field.validation.maxLength && value.length > field.validation.maxLength)
        return field.validation.message || `${field.label} must not exceed ${field.validation.maxLength} characters`;
      if (field.validation.maxDate && field.type === 'date' && new Date(value) >= new Date(field.validation.maxDate))
        return field.validation.message || `Date must be before ${field.validation.maxDate}`;
      if (field.validation.minDate && field.type === 'date' && new Date(value) <= new Date(field.validation.minDate))
        return field.validation.message || `Date must be after ${field.validation.minDate}`;
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value))
        return field.validation.message || `${field.label} format is invalid`;
      if (field.validation.minValue !== undefined && field.type === 'number') {
        const n = parseFloat(value);
        if (!isNaN(n) && n < field.validation.minValue)
          return field.validation.message || `${field.label} must be at least ${field.validation.minValue}`;
      }
      if (field.validation.maxValue !== undefined && field.type === 'number') {
        const n = parseFloat(value);
        if (!isNaN(n) && n > field.validation.maxValue)
          return field.validation.message || `${field.label} must not exceed ${field.validation.maxValue}`;
      }
    }
    return null;
  }, []);

  const handleFieldChange = useCallback((fieldId, value, field) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => ({ ...prev, [fieldId]: validateField(field, value) }));
  }, [validateField]);

  const handleSubmit = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;
    formSchema.sections?.forEach(section => {
      section.fields?.forEach(field => {
        const error = validateField(field, formData[field.id]);
        if (error) { newErrors[field.id] = error; hasErrors = true; }
      });
    });
    setErrors(newErrors);
    if (hasErrors) {
      const el = document.getElementById(`field-${Object.keys(newErrors)[0]}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitted(true);
    if (formSchema.submitApi && !skipNavigation) {
      const { onSuccess } = formSchema.submitApi;
      if (onSuccess?.action === 'navigate' && onSuccess?.path) {
        setTimeout(() => {
          if (onSuccess.openInNewTab) window.open(onSuccess.path, '_blank', 'noopener,noreferrer');
          else window.location.href = onSuccess.path;
        }, 2000);
      }
    }
    if (onSubmit) onSubmit(formData);
  }, [formSchema, formData, validateField, skipNavigation, onSubmit]);

  const handleContinue = useCallback(() => {
    if (onContinue && formSchema.nextFormId && !hasContinued) {
      setHasContinued(true);
      onContinue(formSchema.nextFormId);
    }
  }, [onContinue, formSchema?.nextFormId, hasContinued]);

  const isFieldEnabled = useCallback((field) => {
    if (viewOnly) return false;
    if (field.disabled === true) return false;
    if (!field.enabledIf) return true;
    const dep = formData[field.enabledIf.field];
    if (field.enabledIf.equals !== undefined) return dep === field.enabledIf.equals;
    if (field.enabledIf.notEquals !== undefined) return dep !== field.enabledIf.notEquals;
    return !!dep;
  }, [viewOnly, formData]);

  const isFieldVisible = useCallback((field) => {
    if (!field.showIf) return true;
    const dep = formData[field.showIf.field];
    if (field.showIf.equals !== undefined) return dep === field.showIf.equals;
    if (field.showIf.notEquals !== undefined) return dep !== field.showIf.notEquals;
    return !!dep;
  }, [formData]);

  const renderField = (field, palette) => {
    if (!isFieldVisible(field)) return null;
    const value = formData[field.id] || '';
    const error = errors[field.id];
    const isEnabled = isFieldEnabled(field);
    const accentColor = palette.main;

    const textFieldSx = getTextFieldSx(accentColor, error, colors.error);

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
              sx={textFieldSx}
              InputProps={field.icon ? {
                startAdornment: (
                  <InputAdornment position="start">
                    {React.createElement(getIconComponent(field.icon), {
                      sx: { color: error ? colors.error : alpha(accentColor, 0.5), fontSize: 20 }
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
              sx={textFieldSx}
            />
          </Box>
        );

      case 'dropdown':
      case 'select':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <FormControl fullWidth error={!!error}>
              <Typography sx={labelStyle(colors.error, colors.textSecondary, !!error)}>
                {field.label}{field.required && ' *'}
              </Typography>
              <Select
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                disabled={!isEnabled}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={{
                  PaperProps: { sx: getMenuPaperSx(accentColor) },
                }}
                sx={getSelectSx(accentColor, error, colors.error, !!value, colors.textPrimary, colors.textDisabled)}
              >
                <MenuItem value="" disabled>
                  <span style={{ color: colors.textDisabled }}>{field.placeholder || `Select ${field.label}`}</span>
                </MenuItem>
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              {error && <Typography sx={{ ...errorText(colors.error), mt: 0.5, ml: 0.5 }}>{error}</Typography>}
            </FormControl>
          </Box>
        );

      case 'radio':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <FormControl fullWidth error={!!error}>
              <Typography sx={{ mb: 1.25, fontSize: '13px', fontWeight: 600, color: error ? colors.error : colors.textSecondary }}>
                {field.label}{field.required && ' *'}
              </Typography>
              <RadioGroup
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                sx={{ opacity: isEnabled ? 1 : 0.5, pointerEvents: isEnabled ? 'auto' : 'none', display: 'flex', flexDirection: 'row', gap: 1.25 }}
              >
                {field.options?.map((option) => {
                  const isSelected = value === option.value;
                  const IconComp = option.icon ? getIconComponent(option.icon) : null;
                  return (
                    <Box
                      key={option.value}
                      onClick={() => handleFieldChange(field.id, option.value, field)}
                      sx={getRadioOptionSx(isSelected, accentColor)}
                    >
                      {IconComp && (
                        <Avatar sx={getRadioAvatarSx(isSelected, accentColor)}>
                          <IconComp sx={{ fontSize: 21 }} />
                        </Avatar>
                      )}
                      <Typography sx={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? accentColor : colors.textPrimary, textAlign: 'center' }}>
                        {option.label}
                      </Typography>
                      {isSelected && (
                        <Box sx={{ ...radioCheckmark, backgroundColor: accentColor }}>
                          <CheckIcon sx={{ fontSize: 12, color: '#fff' }} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </RadioGroup>
              {error && <Typography sx={{ ...errorText(colors.error), mt: 0.5 }}>{error}</Typography>}
            </FormControl>
          </Box>
        );

      case 'checkbox':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked, field)}
                  sx={{ color: error ? colors.error : alpha(accentColor, 0.4), '&.Mui-checked': { color: accentColor } }}
                />
              }
              label={<Typography sx={{ fontSize: '14px', color: colors.textSecondary }}>{field.label}</Typography>}
            />
            {error && <Typography sx={{ ...errorText(colors.error), ml: 4 }}>{error}</Typography>}
          </Box>
        );

      case 'biometric': {
        const captured = formData[field.id] === 'captured';
        return (
          <Box key={field.id} id={`field-${field.id}`} sx={{ textAlign: 'center', py: 1.5 }}>
            <Box
              onClick={() => { if (!captured) handleFieldChange(field.id, 'captured', field); }}
              sx={getBiometricContainerSx(captured, accentColor, colors.successMain)}
            >
              <Box sx={getBiometricCircle(captured, accentColor, palette.dark, colors.successMain, colors.successDark)}>
                {captured
                  ? <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />
                  : <FingerprintIcon sx={{ fontSize: 40, color: '#fff' }} />}
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: captured ? colors.successMain : colors.textPrimary }}>
                {captured ? 'Fingerprint Captured' : (field.label || 'Tap to scan fingerprint')}
              </Typography>
            </Box>
            {error && <Typography sx={{ ...errorText(colors.error), mt: 0.75 }}>{error}</Typography>}
          </Box>
        );
      }

      case 'image_capture':
      case 'file':
        return (
          <ImageCaptureUpload key={field.id} field={field} value={value}
            onChange={(data) => handleFieldChange(field.id, data, field)} error={error} disabled={!isEnabled}
          />
        );

      case 'button': {
        const isOutlined = field.variant === 'outlined' || !field.variant;
        return (
          <Box key={field.id} id={`field-${field.id}`} sx={{ textAlign: 'center', my: 1 }}>
            <Button
              variant={field.variant || 'outlined'}
              size="large"
              onClick={() => {
                if (field.action === 'esign') {
                  handleFieldChange(field.id, 'signed', field);
                  handleFieldChange('esign_status', 'E-sign Completed', field);
                  handleFieldChange('esign_completed', true, field);
                } else if (field.action === 'view_pdf') {
                  window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                }
              }}
              disabled={!isEnabled || (field.action === 'view_pdf' && !formData.esign_completed)}
              startIcon={field.icon && React.createElement(getIconComponent(field.icon), { sx: { fontSize: 20 } })}
              sx={getButtonFieldSx(accentColor, palette.dark, isOutlined)}
            >
              {field.buttonLabel || field.label}
            </Button>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  if (!formSchema) return null;

  // ── Success Screen ──
  if (isSubmitted) {
    const getLogo = () => {
      const logoMap = {
        'l1_customer_info': '/l1.svg',
        'instant_kcc': '/kcc.svg',
        'bank_account_details': '/bank.svg',
        'esign_documents': '/esign.svg',
        'loan_disbursement': '/esign.svg',
      };
      return logoMap[formSchema.id] || null;
    };
    const logo = getLogo();

    return (
      <Box sx={{ width: '100%', maxWidth: '500px', mx: 'auto', py: 6, px: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={successPopAnimation}>
            {logo ? (
              <Box sx={{ width: 72, height: 72, '& img': { width: '100%', height: '100%', objectFit: 'contain' } }}>
                <img src={logo} alt="Success" />
              </Box>
            ) : (
              <Box sx={getSuccessCircleSx(colors.successMain, colors.successDark)}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
            )}
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '22px', color: colors.textPrimary, mb: 0.75 }}>
            {formSchema.title} Completed!
          </Typography>
          <Typography sx={{ color: colors.textSecondary, fontSize: '15px', mb: 4, lineHeight: 1.5 }}>
            Your information has been saved successfully.
          </Typography>
          {formSchema.nextFormId && (
            <Button fullWidth variant="contained" size="large" onClick={handleContinue} disabled={hasContinued}
              endIcon={hasContinued ? <TaskAltIcon /> : <ArrowForwardIcon />}
              sx={getContinueButtonSx(hasContinued, colors.primaryMain, colors.primaryDark, colors.disabledBg)}
            >
              {hasContinued ? 'Proceeding...' : `Continue to ${formSchema.nextFormTitle || 'Next Section'}`}
            </Button>
          )}
          {!formSchema.nextFormId && (
            <Chip icon={<CelebrationIcon />} label="All Sections Complete" color="success"
              sx={{ px: 2, py: 2.5, fontSize: '14px', fontWeight: 700 }}
            />
          )}
        </Box>
      </Box>
    );
  }

  // ── Overall progress ──
  const totalRequired = formSchema.sections?.reduce((s, sec) => s + (sec.fields?.filter(f => f.required).length || 0), 0) || 0;
  const totalFilled = formSchema.sections?.reduce((s, sec) =>
    s + (sec.fields?.filter(f => f.required && formData[f.id] !== undefined && formData[f.id] !== null && formData[f.id] !== '').length || 0), 0) || 0;
  const progress = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      {/* ── Header ── */}
      {formSchema.title && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '22px', sm: '26px' }, color: colors.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {formSchema.title}
          </Typography>
          {formSchema.description && (
            <Typography sx={{ color: colors.textSecondary, fontSize: '14px', mt: 0.5, lineHeight: 1.4 }}>
              {formSchema.description}
            </Typography>
          )}
          {totalRequired > 0 && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={getProgressBarSx(progress, colors.successMain, colors.successLight)}
              />
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: progress === 100 ? colors.successMain : '#3B82F6', minWidth: 36, textAlign: 'right' }}>
                {progress}%
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Section Cards ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {formSchema.sections?.map((section, sIndex) => {
          const palette = SECTION_PALETTES[sIndex % SECTION_PALETTES.length];
          const IconComp = section.icon ? getIconComponent(section.icon) : BankIcon;

          const reqFields = section.fields?.filter(f => f.required) || [];
          const filledFields = reqFields.filter(f => formData[f.id] !== undefined && formData[f.id] !== null && formData[f.id] !== '');
          const sectionComplete = reqFields.length > 0 && filledFields.length === reqFields.length;

          return (
            <Paper key={section.id || sIndex} elevation={0} sx={getSectionPaperSx(palette.main)}>
              {/* Section Banner */}
              <Box sx={getSectionBannerSx(palette.main, palette.light)}>
                <Avatar sx={getSectionAvatarSx(palette.main, palette.dark)} variant="rounded">
                  {sectionComplete ? <TaskAltIcon sx={{ fontSize: 20 }} /> : <IconComp sx={{ fontSize: 20 }} />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '15px', color: colors.textPrimary }}>
                      {section.title}
                    </Typography>
                    {sectionComplete && (
                      <Chip label="Complete" size="small" sx={getCompleteBadgeSx(colors.successMain)} />
                    )}
                  </Box>
                  {section.subtitle && (
                    <Typography sx={{ fontSize: '12px', color: colors.textSecondary, mt: 0.25 }}>
                      {section.subtitle}
                    </Typography>
                  )}
                </Box>
                {reqFields.length > 0 && (
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: sectionComplete ? colors.successMain : palette.main }}>
                    {filledFields.length}/{reqFields.length}
                  </Typography>
                )}
              </Box>

              {/* Section Fields */}
              <Box sx={sectionFieldsContainer}>
                {section.fields?.map(field => renderField(field, palette))}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* ── Submit Button ── */}
      {!viewOnly && formSchema.submitButton && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          endIcon={<ArrowForwardIcon />}
          sx={getSubmitButtonSx(colors.primaryMain)}
        >
          {formSchema.submitButton.label || 'Submit'}
        </Button>
      )}
    </Box>
  );
};

export default DynamicFormRenderer;
