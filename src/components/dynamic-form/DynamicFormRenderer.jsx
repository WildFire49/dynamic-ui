'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  RadioGroup,
  Select,
  MenuItem,
  InputAdornment,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Avatar,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
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
  ArrowBack as ArrowBackIcon,
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
  Check as CheckIcon,
  EmojiEvents as TrophyIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import ImageCaptureUpload from './ImageCaptureUpload';
import { getFormTheme, detectCategory } from './formTheme';

// ── Fallback constants (overridden per-render by theme) ──

const SURFACE = '#f8fafc';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#475569';
const TEXT_MUTED = '#94a3b8';
const BORDER = '#e2e8f0';

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

// ── Dynamic style builders (accept theme colors) ──

const buildInputSx = (t) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    fontSize: '15px',
    color: TEXT_PRIMARY,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: BORDER },
    '&:hover fieldset': { borderColor: alpha(t.brand, 0.4) },
    '&.Mui-focused': {
      '& fieldset': { borderColor: t.brand, borderWidth: 2 },
      boxShadow: `0 0 0 3px ${t.brandGlow}`,
    },
    '& input': { color: TEXT_PRIMARY, fontWeight: 500 },
    '& input::placeholder': { color: TEXT_MUTED, opacity: 1 },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px', fontWeight: 500, color: TEXT_SECONDARY,
    '&.Mui-focused': { color: t.brand, fontWeight: 600 },
  },
  '& .MuiFormHelperText-root': { fontSize: '12px', ml: 0.5, mt: 0.5 },
});

const buildDatePickerSx = (t) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    fontSize: '15px',
    color: TEXT_PRIMARY,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: BORDER },
    '&:hover fieldset': { borderColor: alpha(t.brand, 0.4) },
    '&.Mui-focused': {
      '& fieldset': { borderColor: t.brand, borderWidth: 2 },
      boxShadow: `0 0 0 3px ${t.brandGlow}`,
    },
    '& input': { color: TEXT_PRIMARY, fontWeight: 500 },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px', fontWeight: 500, color: TEXT_SECONDARY,
    '&.Mui-focused': { color: t.brand, fontWeight: 600 },
  },
});

const buildSelectSx = (t) => ({
  borderRadius: '12px',
  backgroundColor: '#fff',
  fontSize: '15px',
  color: TEXT_PRIMARY,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(t.brand, 0.4) },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: t.brand, borderWidth: 2 },
  '&.Mui-focused': { boxShadow: `0 0 0 3px ${t.brandGlow}` },
  '& .MuiSelect-select': { color: TEXT_PRIMARY },
});

const buildMenuPaperSx = (t) => ({
  borderRadius: '16px', mt: 0.5,
  boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.05)',
  border: 'none',
  '& .MuiMenuItem-root': {
    fontSize: '15px', fontWeight: 500, color: TEXT_PRIMARY,
    py: 1.5, mx: 1, borderRadius: '12px',
    transition: 'all 0.15s ease',
    '&.Mui-selected': { backgroundColor: t.brandLight, color: t.brand, fontWeight: 600 },
    '&:hover': { backgroundColor: SURFACE },
  },
});

// Radio — compact pill style with themed colors
const buildRadioSx = (selected, t) => ({
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
  py: 1.75, px: 1,
  bgcolor: selected ? alpha(t.brand, 0.06) : '#fff',
  borderRadius: '14px', cursor: 'pointer',
  border: '2px solid',
  borderColor: selected ? t.brand : BORDER,
  boxShadow: selected ? `0 0 0 3px ${t.brandGlow}` : 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    borderColor: selected ? t.brand : alpha(t.brand, 0.3),
    bgcolor: selected ? alpha(t.brand, 0.08) : alpha(t.brand, 0.02),
  },
  '&:active': { transform: 'scale(0.96)' },
});

const buildRadioAvatarSx = (selected, t) => ({
  width: 44, height: 44,
  bgcolor: selected ? t.brand : alpha(t.brand, 0.08),
  color: selected ? '#fff' : t.brand,
  transition: 'all 0.2s ease',
  boxShadow: selected ? `0 4px 12px ${alpha(t.brand, 0.25)}` : 'none',
});

const buildRadioCheckSx = (t) => ({
  position: 'absolute', top: 6, right: 6,
  width: 18, height: 18, borderRadius: '50%', bgcolor: t.brand,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: `0 2px 6px ${alpha(t.brand, 0.3)}`,
  animation: 'checkPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '@keyframes checkPop': { '0%': { transform: 'scale(0)' }, '100%': { transform: 'scale(1)' } },
});

// Biometric
const getBiometricSx = (captured, successColor) => ({
  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: 1.5, py: 4,
  bgcolor: captured ? alpha(successColor, 0.04) : '#fff',
  borderRadius: '20px', cursor: captured ? 'default' : 'pointer',
  border: '2px solid',
  borderColor: captured ? successColor : 'transparent',
  transition: 'all 0.25s ease',
  '&:active': captured ? {} : { transform: 'scale(0.98)' },
});

const buildBiometricCircleSx = (captured, successColor, successDark, t) => ({
  width: 72, height: 72, borderRadius: '50%',
  background: captured
    ? `linear-gradient(135deg, ${successColor}, ${successDark})`
    : t.gradient,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: `0 8px 32px ${alpha(captured ? successColor : t.brand, 0.3)}`,
});

// CTA button
const buildContinueBtnSx = (t) => ({
  py: 1.75, borderRadius: '16px', textTransform: 'none',
  fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em',
  background: t.gradient, color: '#fff',
  boxShadow: t.shadowBrand,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: t.gradient,
    filter: 'brightness(0.92)',
    boxShadow: `0 8px 32px ${alpha(t.brand, 0.4)}`,
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'scale(0.98) translateY(0)' },
  '&.Mui-disabled': { background: '#e2e5ea', boxShadow: 'none', color: '#a0a8b4' },
});

// ── Component ──

const DynamicFormRenderer = ({ formSchema, onSubmit, onContinue, viewOnly = false, skipNavigation = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const errorColor = theme.palette.error.main;
  const successMain = theme.palette.success.main;
  const successDark = theme.palette.success.dark;

  // Resolve form theme from schema category
  const ft = useMemo(() => {
    const cat = detectCategory(formSchema);
    return getFormTheme(cat);
  }, [formSchema]);

  // Build themed styles
  const inputSx = useMemo(() => buildInputSx(ft), [ft]);
  const datePickerSx = useMemo(() => buildDatePickerSx(ft), [ft]);
  const selectSx = useMemo(() => buildSelectSx(ft), [ft]);
  const menuPaperSx = useMemo(() => buildMenuPaperSx(ft), [ft]);
  const continueBtnSx = useMemo(() => buildContinueBtnSx(ft), [ft]);

  const sections = useMemo(() => formSchema?.sections || [], [formSchema]);
  const totalSteps = sections.length;
  const currentSection = sections[currentStep];

  useEffect(() => {
    if (formSchema?.mockData) setFormData(formSchema.mockData);
  }, [formSchema?.mockData]);

  // Scroll to top of parent on step change
  useEffect(() => {
    document.getElementById('dynamic-form-top')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

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

  const validateCurrentSection = useCallback(() => {
    if (!currentSection) return true;
    const newErrors = {};
    let valid = true;
    currentSection.fields?.forEach(field => {
      const err = validateField(field, formData[field.id]);
      if (err) { newErrors[field.id] = err; valid = false; }
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (!valid) {
      const el = document.getElementById(`field-${Object.keys(newErrors)[0]}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }, [currentSection, formData, validateField]);

  const goNext = useCallback(() => {
    if (!validateCurrentSection()) return;
    if (currentStep < totalSteps - 1) {
      setTransitioning(true);
      setTimeout(() => { setCurrentStep(s => s + 1); setTransitioning(false); }, 200);
    }
  }, [currentStep, totalSteps, validateCurrentSection]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setTransitioning(true);
      setTimeout(() => { setCurrentStep(s => s - 1); setTransitioning(false); }, 200);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(() => {
    if (!validateCurrentSection()) return;
    const allErrors = {};
    let hasErrors = false;
    sections.forEach(section => {
      section.fields?.forEach(field => {
        const err = validateField(field, formData[field.id]);
        if (err) { allErrors[field.id] = err; hasErrors = true; }
      });
    });
    if (hasErrors) {
      setErrors(allErrors);
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].fields?.some(f => allErrors[f.id])) { setCurrentStep(i); break; }
      }
      return;
    }
    setIsSubmitted(true);
    // NOTE: Page navigation on submit is disabled.
    // To re-enable, uncomment the block below.
    // if (formSchema.submitApi && !skipNavigation) {
    //   const { onSuccess } = formSchema.submitApi;
    //   if (onSuccess?.action === 'navigate' && onSuccess?.path) {
    //     setTimeout(() => {
    //       if (onSuccess.openInNewTab) window.open(onSuccess.path, '_blank', 'noopener,noreferrer');
    //       else window.location.href = onSuccess.path;
    //     }, 2000);
    //   }
    // }
    if (onSubmit) onSubmit(formData);
  }, [validateCurrentSection, sections, formData, validateField, formSchema, skipNavigation, onSubmit]);

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

  const sectionStats = useMemo(() => {
    return sections.map(section => {
      const req = section.fields?.filter(f => f.required) || [];
      const filled = req.filter(f => formData[f.id] !== undefined && formData[f.id] !== null && formData[f.id] !== '');
      return { total: req.length, filled: filled.length, complete: req.length > 0 && filled.length === req.length };
    });
  }, [sections, formData]);

  const overallProgress = useMemo(() => {
    const tReq = sectionStats.reduce((s, st) => s + st.total, 0);
    const tFill = sectionStats.reduce((s, st) => s + st.filled, 0);
    return tReq > 0 ? Math.round((tFill / tReq) * 100) : 0;
  }, [sectionStats]);

  const completedSections = sectionStats.filter(s => s.complete).length;

  // ── Field label ──
  const FieldLabel = ({ label, required, error }) => (
    <Typography sx={{
      fontSize: '13px', fontWeight: 600, color: error ? errorColor : TEXT_SECONDARY,
      mb: 0.75, letterSpacing: '0.02em', textTransform: 'uppercase',
    }}>
      {label}{required && <Box component="span" sx={{ color: ft.brand, ml: 0.25 }}>*</Box>}
    </Typography>
  );

  // ── Render field ──
  const renderField = (field) => {
    if (!isFieldVisible(field)) return null;
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
              fullWidth label={field.label} placeholder={field.placeholder}
              type={field.type} value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              required={field.required} error={!!error} helperText={error}
              disabled={!isEnabled} variant="outlined" sx={inputSx}
              InputProps={field.icon ? {
                startAdornment: (
                  <InputAdornment position="start">
                    {React.createElement(getIconComponent(field.icon), {
                      sx: { color: alpha(ft.brand, 0.5), fontSize: 20 }
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
            <DatePicker
              label={field.label}
              value={value ? dayjs(value) : null}
              onChange={(newVal) => {
                const formatted = newVal ? newVal.format('YYYY-MM-DD') : '';
                handleFieldChange(field.id, formatted, field);
              }}
              disabled={!isEnabled}
              format="DD/MM/YYYY"
              maxDate={field.validation?.maxDate ? dayjs(field.validation.maxDate) : undefined}
              minDate={field.validation?.minDate ? dayjs(field.validation.minDate) : undefined}
              slotProps={{
                textField: {
                  fullWidth: true, required: field.required,
                  error: !!error, helperText: error,
                  variant: 'outlined', sx: datePickerSx,
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      borderRadius: '20px',
                      boxShadow: '0 24px 80px rgba(0,0,0,0.14)',
                      border: 'none',
                    },
                    '& .MuiPickersDay-root': {
                      borderRadius: '12px', fontWeight: 500,
                      '&.Mui-selected': { bgcolor: ft.brand, fontWeight: 700 },
                      '&:hover': { bgcolor: ft.brandLight },
                    },
                  },
                },
              }}
            />
          </Box>
        );

      case 'dropdown':
      case 'select':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <FormControl fullWidth error={!!error}>
              <FieldLabel label={field.label} required={field.required} error={!!error} />
              <Select
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                disabled={!isEnabled} displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={{ PaperProps: { sx: menuPaperSx } }}
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ color: TEXT_MUTED, fontWeight: 400 }}>
                    {field.placeholder || `Select ${field.label}`}
                  </Typography>
                </MenuItem>
                {field.options?.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
              {error && <Typography sx={{ color: errorColor, fontSize: '12px', mt: 0.5, ml: 0.5 }}>{error}</Typography>}
            </FormControl>
          </Box>
        );

      case 'radio':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <FormControl fullWidth error={!!error}>
              <FieldLabel label={field.label} required={field.required} error={!!error} />
              <RadioGroup
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                sx={{ opacity: isEnabled ? 1 : 0.5, pointerEvents: isEnabled ? 'auto' : 'none', display: 'flex', flexDirection: 'row', gap: 1 }}
              >
                {field.options?.map((opt) => {
                  const sel = value === opt.value;
                  const Ico = opt.icon ? getIconComponent(opt.icon) : null;
                  return (
                    <Box key={opt.value} onClick={() => handleFieldChange(field.id, opt.value, field)}
                      sx={buildRadioSx(sel, ft)}>
                      {Ico && (
                        <Avatar sx={buildRadioAvatarSx(sel, ft)}>
                          <Ico sx={{ fontSize: 20 }} />
                        </Avatar>
                      )}
                      <Typography sx={{ fontSize: '12px', fontWeight: sel ? 700 : 500, color: sel ? ft.brand : TEXT_PRIMARY, textAlign: 'center' }}>
                        {opt.label}
                      </Typography>
                      {sel && (
                        <Box sx={buildRadioCheckSx(ft)}>
                          <CheckIcon sx={{ fontSize: 12, color: '#fff' }} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </RadioGroup>
              {error && <Typography sx={{ color: errorColor, fontSize: '12px', mt: 0.5 }}>{error}</Typography>}
            </FormControl>
          </Box>
        );

      case 'checkbox':
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <MuiFormControlLabel
              control={
                <Checkbox checked={!!value}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked, field)}
                  sx={{ color: '#d1d5db', '&.Mui-checked': { color: ft.brand } }}
                />
              }
              label={<Typography sx={{ fontSize: '15px', color: TEXT_PRIMARY, fontWeight: 500 }}>{field.label}</Typography>}
            />
            {error && <Typography sx={{ color: errorColor, fontSize: '12px', ml: 4 }}>{error}</Typography>}
          </Box>
        );

      case 'biometric': {
        const captured = formData[field.id] === 'captured';
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <Box onClick={() => { if (!captured) handleFieldChange(field.id, 'captured', field); }}
              sx={getBiometricSx(captured, successMain)}>
              <Box sx={buildBiometricCircleSx(captured, successMain, successDark, ft)}>
                {captured
                  ? <CheckCircleIcon sx={{ fontSize: 34, color: '#fff' }} />
                  : <FingerprintIcon sx={{ fontSize: 34, color: '#fff' }} />}
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: captured ? successMain : TEXT_PRIMARY }}>
                {captured ? 'Fingerprint Captured' : (field.label || 'Tap to Scan')}
              </Typography>
              {!captured && (
                <Typography sx={{ fontSize: '12px', color: TEXT_MUTED }}>
                  Place your finger on the scanner
                </Typography>
              )}
            </Box>
            {error && <Typography sx={{ color: errorColor, fontSize: '12px', mt: 0.5, textAlign: 'center' }}>{error}</Typography>}
          </Box>
        );
      }

      case 'image_capture':
      case 'file':
        return (
          <Box key={field.id}>
            <ImageCaptureUpload field={field} value={value}
              onChange={(data) => handleFieldChange(field.id, data, field)} error={error} disabled={!isEnabled}
            />
          </Box>
        );

      case 'button': {
        const isOutlined = field.variant === 'outlined' || !field.variant;
        return (
          <Box key={field.id} id={`field-${field.id}`}>
            <Button
              fullWidth variant={field.variant || 'outlined'} size="large"
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
              sx={{
                py: 1.5, borderRadius: '14px', textTransform: 'none',
                fontSize: '15px', fontWeight: 600,
                borderColor: isOutlined ? BORDER : 'transparent',
                color: isOutlined ? ft.brand : '#fff',
                bgcolor: isOutlined ? 'transparent' : ft.brand,
                '&:hover': {
                  borderColor: isOutlined ? ft.brand : 'transparent',
                  bgcolor: isOutlined ? alpha(ft.brand, 0.04) : ft.brandDark,
                },
              }}
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

  // ── Success ──
  if (isSubmitted) {
    const logoMap = {
      'l1_customer_info': '/l1.svg', 'instant_kcc': '/kcc.svg',
      'bank_account_details': '/bank.svg', 'esign_documents': '/esign.svg',
      'loan_disbursement': '/esign.svg',
    };
    const logo = logoMap[formSchema.id] || null;

    return (
      <Box sx={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', px: 3, bgcolor: '#fff',
      }}>
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Box sx={{
              display: 'inline-flex', mb: 4,
              animation: 'successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '@keyframes successPop': { '0%': { transform: 'scale(0)' }, '100%': { transform: 'scale(1)' } },
            }}>
              {logo ? (
                <Box sx={{ width: 88, height: 88, '& img': { width: '100%', height: '100%', objectFit: 'contain' } }}>
                  <img src={logo} alt="Done" />
                </Box>
              ) : (
                <Box sx={{
                  width: 88, height: 88, borderRadius: '28px',
                  background: `linear-gradient(135deg, ${ft.success}, #34d399)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 12px 40px ${alpha(ft.success, 0.3)}`,
                }}>
                  <TrophyIcon sx={{ fontSize: 44, color: '#fff' }} />
                </Box>
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '26px', color: TEXT_PRIMARY, mb: 1, letterSpacing: '-0.02em' }}>
              {formSchema.title} Complete!
            </Typography>
            <Typography sx={{ color: TEXT_MUTED, fontSize: '15px', mb: 5, lineHeight: 1.6, maxWidth: 280, mx: 'auto' }}>
              All information has been saved and verified successfully.
            </Typography>
            {formSchema.nextFormId && (
              <Button fullWidth variant="contained" size="large" onClick={handleContinue} disabled={hasContinued}
                endIcon={hasContinued ? <TaskAltIcon /> : <ArrowForwardIcon />}
                sx={continueBtnSx}
              >
                {hasContinued ? 'Proceeding...' : `Continue to ${formSchema.nextFormTitle || 'Next'}`}
              </Button>
            )}
            {!formSchema.nextFormId && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                bgcolor: alpha(ft.success, 0.06), color: ft.success,
                px: 2.5, py: 1.25, borderRadius: '14px',
              }}>
                <CelebrationIcon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>All Sections Complete</Typography>
              </Box>
            )}
          </Box>
        </Fade>
      </Box>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* No own padding — parent formContent provides px:2 py:2 and scrolling */}
      <Box id="dynamic-form-top" sx={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Fade in={!transitioning} timeout={200}>
          <Box sx={{ flex: 1 }}>

            {/* ── Section header ── */}
            <Box sx={{ mb: 2.5 }}>
              {/* Segmented progress bar */}
              <Box sx={{ display: 'flex', gap: '3px', mb: 2 }}>
                {sections.map((_, i) => {
                  const st = sectionStats[i] || { total: 0, filled: 0, complete: false };
                  const pct = st.total > 0 ? (st.filled / st.total) * 100 : (i < currentStep ? 100 : 0);
                  return (
                    <Box
                      key={i}
                      onClick={() => {
                        if (i < currentStep || st.complete) {
                          setTransitioning(true);
                          setTimeout(() => { setCurrentStep(i); setTransitioning(false); }, 200);
                        }
                      }}
                      sx={{
                        flex: 1, height: 3, borderRadius: 2,
                        bgcolor: '#e9ebf0', overflow: 'hidden',
                        cursor: (i < currentStep || st.complete) ? 'pointer' : 'default',
                      }}
                    >
                      <Box sx={{
                        height: '100%', borderRadius: 2,
                        width: `${pct}%`,
                        bgcolor: st.complete ? ft.success : i <= currentStep ? ft.brand : 'transparent',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} />
                    </Box>
                  );
                })}
              </Box>

              {/* Step + back row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                {currentStep > 0 ? (
                  <Box
                    onClick={goBack}
                    sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.25,
                      cursor: 'pointer', color: ft.brand, fontSize: '13px', fontWeight: 600,
                      '&:hover': { opacity: 0.7 },
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 16 }} />
                    Back
                  </Box>
                ) : (
                  <Box />
                )}
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: TEXT_MUTED }}>
                  Step {currentStep + 1} of {totalSteps}
                </Typography>
              </Box>

              {/* Section title with accent */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 4, height: 28, borderRadius: 2,
                  background: ft.gradient, flexShrink: 0,
                }} />
                <Box>
                  <Typography sx={{
                    fontWeight: 800, fontSize: '21px', color: TEXT_PRIMARY,
                    lineHeight: 1.2, letterSpacing: '-0.02em',
                  }}>
                    {currentSection?.title}
                  </Typography>
                  {currentSection?.subtitle && (
                    <Typography sx={{ fontSize: '13px', color: TEXT_MUTED, mt: 0.5, lineHeight: 1.4 }}>
                      {currentSection.subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* ── Fields — grouped in a surface container ── */}
            <Box sx={{
              bgcolor: ft.surface,
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${alpha(ft.brand, 0.06)}`,
            }}>
              {currentSection?.fields?.map((field, idx) => {
                if (!isFieldVisible(field)) return null;
                return (
                  <Box key={field.id}>
                    {idx > 0 && (
                      <Box sx={{ mx: 2, borderTop: `1px solid ${BORDER}` }} />
                    )}
                    <Box sx={{ px: 2, py: 1.75 }}>
                      {renderField(field)}
                    </Box>
                  </Box>
                );
              })}
            </Box>

          </Box>
        </Fade>

        {/* ── CTA ── */}
        <Box sx={{ pt: 3, pb: 1 }}>
          {!viewOnly && (
            <Button
              fullWidth variant="contained" size="large"
              onClick={isLastStep ? handleSubmit : goNext}
              endIcon={isLastStep ? <CheckIcon /> : <ChevronRightIcon />}
              sx={continueBtnSx}
            >
              {isLastStep ? (formSchema.submitButton?.label || 'Submit') : 'Continue'}
            </Button>
          )}
          {completedSections > 0 && (
            <Typography sx={{
              fontSize: '11px', fontWeight: 600, color: TEXT_MUTED,
              textAlign: 'center', mt: 1.5,
            }}>
              {completedSections} of {totalSteps} sections complete
            </Typography>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DynamicFormRenderer;
