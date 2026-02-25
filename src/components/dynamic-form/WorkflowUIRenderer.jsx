/**
 * Workflow UI Renderer — Native Android/iOS Feel
 * Recursively renders Beta API JSON tree.
 * White bg, visible cards, uniform input styling across all field types.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  alpha,
  Fade,
  Paper,
  Radio,
  Checkbox,
  FormControlLabel,
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
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  Fingerprint as FingerprintIcon,
  Description as DocumentIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarIcon,
  CameraAlt as CameraIcon,
  CloudUpload as UploadIcon,
  FamilyRestroom as FamilyIcon,
  Wc as WcIcon,
  Cake as CakeIcon,
  Agriculture as CowIcon,
  Pets as PetsIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as BikeIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckCircleIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import ImageCaptureUpload from './ImageCaptureUpload';
import { THEME, resolvePadding, ORIENTATION_MAP } from './formTheme';

// ── Icon lookup ──
const ICON_MAP = {
  male: MaleIcon, female: FemaleIcon, transgender: TransgenderIcon,
  person: PersonIcon, phone: PhoneIcon, email: EmailIcon,
  home: HomeIcon, bank: BankIcon, fingerprint: FingerprintIcon,
  document: DocumentIcon, badge: BadgeIcon, location: LocationIcon,
  work: WorkIcon, business: BusinessIcon, credit_card: CreditCardIcon,
  calendar: CalendarIcon, camera: CameraIcon, upload: UploadIcon,
  family: FamilyIcon, wc: WcIcon, cake: CakeIcon, cow: CowIcon,
  pets: PetsIcon, lock: LockIcon, account: AccountCircleIcon,
  verified: VerifiedIcon, shield: ShieldIcon, car: CarIcon,
  bike: BikeIcon, married: FamilyIcon, single: PersonIcon,
  divorced: PersonIcon, widowed: PersonIcon,
  trophy: TrophyIcon, celebration: CelebrationIcon,
  check_circle: CheckCircleIcon, arrow_forward: ChevronRightIcon,
};
const getIcon = (name) => ICON_MAP[name?.toLowerCase()] || null;

// ── Text value extractor ──
const txt = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (v.data) return txt(v.data);
  if (v.text) return v.text;
  return String(v);
};

// ── Design tokens — uniform across all field types ──
const BORDER = '#e2e8f0';        // thin light gray for all borders
const CARD_BORDER = '#f1f5f9';   // slightly more visible for outer card
const RADIUS = '20px';
const BRAND = THEME.brand;       // #0078d7
const BRAND_LIGHT = '#eff6ff';
const INPUT_FILL = '#f8fafc';    // light gray fill for text inputs
const ROW_HEIGHT = '60px';       // uniform height for ALL interactive elements

// ══════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════

const WorkflowUIRenderer = ({ uiConfig, onSubmit, onNavigate }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const sections = useMemo(() => {
    if (uiConfig?.ui?.sections) return uiConfig.ui.sections;
    if (uiConfig?.forms?.ui?.sections) return uiConfig.forms.ui.sections;
    return [];
  }, [uiConfig]);

  const collectFields = useCallback((nodes) => {
    const fields = [];
    if (!nodes) return fields;
    nodes.forEach(n => {
      if (n.children) fields.push(...collectFields(n.children));
      if (['textField', 'date', 'radioGroup', 'dropdown', 'fileUpload', 'image_capture', 'checkbox'].includes(n.type)) {
        fields.push(n);
      }
    });
    return fields;
  }, []);

  const allFields = useMemo(() => {
    const fields = [];
    sections.forEach(s => { if (s.children) fields.push(...collectFields(s.children)); });
    return fields;
  }, [sections, collectFields]);

  const isSuccessScreen = useMemo(() => allFields.length === 0, [allFields]);

  // Helper: extract all validation rules from a field (handles action as array or object, plus fallback paths)
  const getValidationRules = useCallback((field) => {
    const rules = [];
    // 1. field.action (array or single object)
    const actionList = Array.isArray(field.action) ? field.action : field.action ? [field.action] : [];
    for (const a of actionList) {
      if (a.value?.validation) rules.push(a.value.validation);
      if (a.validation) rules.push(a.validation);
    }
    // 2. field.data?.validation
    if (field.data?.validation) rules.push(field.data.validation);
    // 3. field.validation
    if (field.validation) rules.push(field.validation);
    return rules;
  }, []);

  // Full validation (required + regex) — used on blur and submit
  const validateField = useCallback((field, value) => {
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      const rules = getValidationRules(field);
      for (const r of rules) {
        if (r.message) return r.message;
      }
      return `${txt(field.data?.label || field.id)} is required`;
    }
    const rules = getValidationRules(field);
    for (const r of rules) {
      if (r.regex && value) {
        if (!new RegExp(r.regex).test(String(value))) {
          return r.message || 'Invalid format';
        }
      }
      if (r.pattern && value) {
        if (!new RegExp(r.pattern).test(String(value))) {
          return r.message || 'Invalid format';
        }
      }
      if (r.maxValue != null && value) {
        if (Number(value) > Number(r.maxValue)) {
          return r.message || `Maximum value is ${r.maxValue}`;
        }
      }
      if (r.minValue != null && value) {
        if (Number(value) < Number(r.minValue)) {
          return r.message || `Minimum value is ${r.minValue}`;
        }
      }
      if (r.maxLength && value && String(value).length > r.maxLength) {
        return r.message || `Maximum ${r.maxLength} characters`;
      }
      if (r.minLength && value && String(value).length < r.minLength) {
        return r.message || `Minimum ${r.minLength} characters`;
      }
    }
    return null;
  }, [getValidationRules]);

  // Format-only validation (no required check) — used for real-time typing feedback
  const validateFieldFormat = useCallback((field, value) => {
    if (!value || (typeof value === 'string' && !value.trim())) return null;
    const strVal = String(value);
    const rules = getValidationRules(field);
    for (const r of rules) {
      if (r.regex && !new RegExp(r.regex).test(strVal)) {
        return r.message || 'Invalid format';
      }
      if (r.pattern && !new RegExp(r.pattern).test(strVal)) {
        return r.message || 'Invalid format';
      }
      if (r.maxValue != null && Number(value) > Number(r.maxValue)) {
        return r.message || `Maximum value is ${r.maxValue}`;
      }
      if (r.minValue != null && Number(value) < Number(r.minValue)) {
        return r.message || `Minimum value is ${r.minValue}`;
      }
      if (r.maxLength && strVal.length > r.maxLength) {
        return r.message || `Maximum ${r.maxLength} characters`;
      }
    }
    return null;
  }, [getValidationRules]);

  const handleChange = useCallback((id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Real-time: show format/regex errors as user types, clear required errors once filled
    const field = allFields.find(f => f.id === id);
    if (field) {
      const rules = getValidationRules(field);
      const formatErr = validateFieldFormat(field, value);
      if (rules.length > 0) {
        console.log(`🔍 Validation [${id}]: value="${value}", regex=${rules[0]?.regex}, maxValue=${rules[0]?.maxValue}, error=`, formatErr);
      }
      setErrors(prev => {
        const n = { ...prev };
        if (formatErr) { n[id] = formatErr; } else { delete n[id]; }
        return n;
      });
    } else {
      console.warn(`⚠️ handleChange: field "${id}" not found in allFields (${allFields.length} fields)`);
      setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }, [allFields, validateFieldFormat, getValidationRules]);

  // Full validation on blur (includes required check)
  const handleBlur = useCallback((id) => {
    const field = allFields.find(f => f.id === id);
    if (field) {
      const err = validateField(field, formData[id]);
      setErrors(prev => {
        const n = { ...prev };
        if (err) { n[id] = err; } else { delete n[id]; }
        return n;
      });
    }
  }, [allFields, formData, validateField]);

  const handleSubmit = useCallback(() => {
    const errs = {};
    allFields.forEach(f => {
      const e = validateField(f, formData[f.id]);
      if (e) errs[f.id] = e;
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      const el = document.getElementById(`field-${Object.keys(errs)[0]}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit?.({ formData });
  }, [allFields, formData, validateField, onSubmit]);

  const submitBtnData = useMemo(() => {
    const find = (nodes) => {
      if (!nodes) return null;
      for (const n of nodes) {
        if (n.type === 'button') return n;
        if (n.children) { const r = find(n.children); if (r) return r; }
      }
      return null;
    };
    for (const s of sections) { const b = find(s.children); if (b) return b; }
    return null;
  }, [sections]);

  // ══════════════════════════════════════════
  //  RECURSIVE NODE RENDERER
  // ══════════════════════════════════════════

  const renderNode = useCallback((node, idx) => {
    if (!node) return null;
    const key = node.id || `node-${idx}`;
    const pad = resolvePadding(node.padding);

    switch (node.type) {

      case 'header':
      case 'image':
        return null;

      // ── Icon ──
      case 'icon': {
        // Skip navigation icons (back, spacer etc.)
        const iconName = node.data?.icon;
        if (!iconName || iconName === 'arrow_back') return null;
        const Ico = getIcon(iconName);
        if (!Ico) return null;
        let style = node.style;
        
        let color = BRAND;
        let size = 24;
        
        if (typeof style === 'object') {
          if (style.color) color = style.color;
          if (style.size) size = parseInt(style.size.replace(/dp|sp/g, ''));
        } else if (style === 'largeWhite') {
          color = '#FFFFFF';
          size = 48;
        }

        return (
          <Box key={key} sx={{ ...pad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico sx={{ fontSize: size, color: color }} />
          </Box>
        );
      }

      case 'divider':
        return <Box key={key} sx={{ borderBottom: `1px solid #F0F0F0`, my: 0.5, ...pad }} />;

      // ── Text ──
      case 'text': {
        const label = txt(node.data?.label || node.data?.text);
        let style = node.style;

        if (typeof style === 'object') {
           return (
             <Box key={key} sx={{ ...pad, width: '100%', display: 'flex', justifyContent: style.textAlign === 'center' ? 'center' : 'flex-start' }}>
               <Typography sx={{
                 color: style.color || '#1A1A1A',
                 fontSize: style.fontSize ? style.fontSize.replace('sp', 'px') : '14px',
                 fontWeight: style.fontWeight === 'bold' ? 700 : style.fontWeight === 'normal' ? 400 : 500,
                 textAlign: style.textAlign || 'left',
                 lineHeight: 1.4,
               }}>
                 {label}
               </Typography>
             </Box>
           );
        }

        if (style === 'displayLarge') {
          return (
            <Box key={key} sx={{ ...pad }}>
              <Typography sx={{
                fontSize: '22px', fontWeight: 700, color: '#1A1A1A',
                lineHeight: 1.25, letterSpacing: '-0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {label}
              </Typography>
            </Box>
          );
        }

        if (style === 'displayMedium') {
          return (
            <Box key={key} sx={{ ...pad }}>
              <Typography sx={{
                fontSize: '17px', fontWeight: 700, color: '#1A1A1A',
                lineHeight: 1.3,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {label}
              </Typography>
            </Box>
          );
        }

        if (style === 'labelLarge' || style === 'labelLargeBold') {
          const hasAsterisk = label.includes('*');
          const cleanLabel = label.replace(/\s*\*\s*$/, '');
          return (
            <Box key={key} sx={{ ...pad }}>
              <Typography sx={{
                fontSize: '14px', fontWeight: 700, color: '#1A1A1A',
                lineHeight: 1.4,
              }}>
                {cleanLabel}
                {hasAsterisk && (
                  <Typography component="span" sx={{ color: BRAND, fontWeight: 700, ml: 0.5 }}>*</Typography>
                )}
              </Typography>
            </Box>
          );
        }

        // Success title — large centered bold
        if (style === 'successTitle') {
          return (
            <Box key={key} sx={{ ...pad, textAlign: 'center' }}>
              <Typography sx={{
                fontSize: '20px', fontWeight: 700, color: '#1A1A1A',
                lineHeight: 1.35, letterSpacing: '-0.01em',
              }}>
                {label}
              </Typography>
            </Box>
          );
        }

        // Success subtitle — centered muted
        if (style === 'successSubtitle') {
          return (
            <Box key={key} sx={{ ...pad, textAlign: 'center' }}>
              <Typography sx={{
                fontSize: '15px', fontWeight: 400, color: '#666',
                lineHeight: 1.5,
              }}>
                {label}
              </Typography>
            </Box>
          );
        }

        return (
          <Box key={key} sx={{ ...pad }}>
            <Typography sx={{ fontSize: '14px', color: '#666' }}>
              {label}
            </Typography>
          </Box>
        );
      }

      // ── Container ──
      case 'container': {
        if (node.style === 'spacerMedium' || node.style === 'spacerLarge') return null;

        // Success icon box — green gradient circle
        if (node.style === 'successIconBox') {
          return (
            <Box key={key} sx={{
              width: 88, height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)',
              ...pad,
            }}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Box>
          );
        }

        let orient = ORIENTATION_MAP[node.orientation] || {};
        if (node.orientation === 'columnCenter') {
          orient = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
        }

        let extraSx = {};
        if (typeof node.style === 'object') {
          if (node.style.backgroundColor) extraSx.bgcolor = node.style.backgroundColor;
          if (node.style.cornerRadius) extraSx.borderRadius = node.style.cornerRadius.replace('dp', 'px');
          if (node.style.height) extraSx.height = node.style.height === 'weight' ? '100%' : node.style.height.replace(/dp|sp/g, 'px');
          if (node.style.width) extraSx.width = node.style.width === 'weight' ? '100%' : node.style.width.replace(/dp|sp/g, 'px');
          if (node.style.weight) extraSx.flex = node.style.weight;
          if (node.style.fillMaxSize) {
            extraSx.flex = 1;
            extraSx.height = '100%';
          }
          if (node.style.align === 'center') {
            extraSx.alignItems = 'center';
            extraSx.justifyContent = 'center';
            if (!orient.display) orient.display = 'flex';
          }
        }
        
        let ht = extraSx.height;
        if (node.style?.weight || (node.id && node.id.startsWith('spacer'))) {
           return <Box key={key} sx={{ width: '100%', minHeight: ht || '24px', flex: node.style?.weight || undefined }} />;
        }

        return (
          <Box key={key} sx={{ ...orient, ...extraSx, ...pad, width: extraSx.width || '100%' }}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Box>
        );
      }

      // ── Card — beautiful translucent glass ──
      case 'card': {
        return (
          <Box
            key={key}
            sx={{
              borderRadius: '24px',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha('#0f172a', 0.08)}`,
              boxShadow: `0 12px 32px ${alpha('#0f172a', 0.05)}, 0 4px 12px ${alpha('#0f172a', 0.02)}`,
              mx: '8px',
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${BRAND}, #0ea5e9, ${BRAND})`,
                backgroundSize: '200% auto',
                animation: 'gradientMove 3s linear infinite',
              },
              '@keyframes gradientMove': {
                '0%': { backgroundPosition: '0% center' },
                '100%': { backgroundPosition: '200% center' },
              },
              ...pad,
            }}
          >
            {node.children?.map((child, i) => renderNode(child, i))}
          </Box>
        );
      }

      // ── Text Field — full width, with label above ──
      case 'textField': {
        const label = txt(node.data?.label);
        const placeholder = txt(node.data?.placeholder);
        const value = formData[node.id] || '';
        const error = errors[node.id];
        const kbType = node.data?.keyboardType;
        const hasAsterisk = label?.includes('*');
        const cleanLabel = label?.replace(/\s*\*\s*$/, '');

        return (
          <Box key={key} id={`field-${node.id}`} sx={{ width: '100%' }}>
            {label && (
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', mb: 1, ml: 0.5, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                {cleanLabel}
                {hasAsterisk && <Typography component="span" sx={{ color: '#ef4444', fontWeight: 700, ml: 0.5 }}>*</Typography>}
              </Typography>
            )}
            <TextField
              fullWidth
              placeholder={placeholder || `Enter ${label?.replace(/\s*\*\s*$/, '').toLowerCase()}`}
              value={value}
              onChange={(e) => handleChange(node.id, e.target.value)}
              onBlur={() => handleBlur(node.id)}
              error={!!error}
              helperText={error}
              variant="outlined"
              type={kbType === 'number' ? 'number' : kbType === 'email' ? 'email' : 'text'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: RADIUS,
                  backgroundColor: INPUT_FILL,
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0f172a',
                  height: ROW_HEIGHT,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '& fieldset': { borderColor: 'transparent', borderWidth: 1 },
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    '& fieldset': { borderColor: 'transparent' },
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    '& fieldset': { borderColor: BRAND, borderWidth: 2 },
                    boxShadow: `0 0 0 4px ${alpha(BRAND, 0.15)}`,
                  },
                  '& input': { px: '20px' },
                  '& input::placeholder': { color: '#94a3b8', opacity: 1 },
                },
                '& .MuiFormHelperText-root': { fontSize: '13px', ml: 0.5, mt: 0.5, fontWeight: 500 },
              }}
            />
          </Box>
        );
      }

      // ── Date — full width, with label above ──
      case 'date': {
        const label = txt(node.data?.label);
        const placeholder = txt(node.data?.placeholder) || 'dd / mm / yyyy';
        const value = formData[node.id] || '';
        const error = errors[node.id];
        const hasAsterisk = label?.includes('*');
        const cleanLabel = label?.replace(/\s*\*\s*$/, '');

        return (
          <Box key={key} id={`field-${node.id}`} sx={{ width: '100%' }}>
            {label && (
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', mb: 1, ml: 0.5, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                {cleanLabel}
                {hasAsterisk && <Typography component="span" sx={{ color: '#ef4444', fontWeight: 700, ml: 0.5 }}>*</Typography>}
              </Typography>
            )}
            <DatePicker
              value={value ? dayjs(value) : null}
              onChange={(v) => handleChange(node.id, v ? v.format('YYYY-MM-DD') : '')}
              format="DD / MM / YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error,
                  helperText: error,
                  placeholder,
                  onBlur: () => handleBlur(node.id),
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: RADIUS,
                      backgroundColor: INPUT_FILL,
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#0f172a',
                      height: ROW_HEIGHT,
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '& fieldset': { borderColor: 'transparent', borderWidth: 1 },
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        '& fieldset': { borderColor: 'transparent' },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& fieldset': { borderColor: BRAND, borderWidth: 2 },
                        boxShadow: `0 0 0 4px ${alpha(BRAND, 0.15)}`,
                      },
                      '& input': { px: '20px' },
                      '& input::placeholder': { color: '#94a3b8', opacity: 1 },
                    },
                  },
                },
                openPickerIcon: { sx: { color: BRAND } },
                popper: {
                  sx: {
                    '& .MuiPaper-root': { borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                    '& .MuiPickersDay-root': {
                      borderRadius: '10px',
                      '&.Mui-selected': { bgcolor: BRAND },
                      '&:hover': { bgcolor: alpha(BRAND, 0.08) },
                    },
                  },
                },
              }}
            />
          </Box>
        );
      }

      // ── Radio Group — uniform border rows matching text fields ──
      case 'radioGroup': {
        const options = node.data?.options || [];
        const value = formData[node.id] || '';
        const error = errors[node.id];

        return (
          <Box key={key} id={`field-${node.id}`} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {options.map((opt) => {
                const sel = value === opt.value;
                const Ico = opt.icon ? getIcon(opt.icon) : null;
                return (
                  <Box
                    key={opt.value}
                    onClick={() => handleChange(node.id, opt.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      px: '20px',
                      minHeight: ROW_HEIGHT,
                      borderRadius: RADIUS,
                      border: '2px solid',
                      borderColor: sel ? BRAND : 'transparent',
                      bgcolor: sel ? alpha(BRAND, 0.04) : INPUT_FILL,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        bgcolor: sel ? alpha(BRAND, 0.06) : '#f1f5f9',
                        transform: 'translateY(-2px)'
                      },
                    }}
                  >
                    {Ico && (
                      <Avatar sx={{
                        width: 40, height: 40,
                        borderRadius: '10px',
                        bgcolor: BRAND_LIGHT,
                        color: BRAND,
                      }}>
                        <Ico sx={{ fontSize: 22 }} />
                      </Avatar>
                    )}
                    <Typography sx={{
                      flex: 1, fontSize: '15px',
                      fontWeight: sel ? 600 : 400,
                      color: '#1A1A1A',
                    }}>
                      {txt(opt.label)}
                    </Typography>
                    <Radio
                      checked={sel}
                      sx={{
                        p: 0,
                        color: '#BDBDBD',
                        '&.Mui-checked': { color: BRAND },
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                      }}
                      disableRipple
                    />
                  </Box>
                );
              })}
            </Box>
            {error && (
              <Typography sx={{ color: '#D32F2F', fontSize: '12px', mt: 0.75 }}>{error}</Typography>
            )}
          </Box>
        );
      }

      // ── Checkbox — native app style toggle row ──
      case 'checkbox': {
        const label = txt(node.data?.label);
        const checked = !!formData[node.id];
        const error = errors[node.id];

        return (
          <Box key={key} id={`field-${node.id}`} sx={{ width: '100%' }}>
            <Box
              onClick={() => handleChange(node.id, !checked)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                px: '4px',
                py: '8px',
                cursor: 'pointer',
                borderRadius: RADIUS,
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: '#F8F8F8' },
              }}
            >
              <Checkbox
                checked={checked}
                disableRipple
                sx={{
                  p: 0,
                  color: BORDER,
                  '&.Mui-checked': { color: BRAND },
                  '& .MuiSvgIcon-root': { fontSize: 24, borderRadius: '6px' },
                }}
              />
              <Typography sx={{
                flex: 1, fontSize: '16px', fontWeight: 500, color: '#0f172a',
                lineHeight: 1.4,
              }}>
                {label}
                {node.required && (
                  <Typography component="span" sx={{ color: BRAND, fontWeight: 700, ml: 0.5 }}>*</Typography>
                )}
              </Typography>
            </Box>
            {error && (
              <Typography sx={{ color: '#ef4444', fontSize: '13px', mt: 0.25, ml: '48px', fontWeight: 500 }}>{error}</Typography>
            )}
          </Box>
        );
      }

      // ── Dropdown — with label above, uniform style ──
      case 'dropdown': {
        const options = node.data?.options || [];
        const label = txt(node.data?.label);
        const placeholder = txt(node.data?.placeholder) || 'Select Item';
        const value = formData[node.id] || '';
        const error = errors[node.id];
        const hasAsterisk = label?.includes('*');
        const cleanLabel = label?.replace(/\s*\*\s*$/, '');

        return (
          <Box key={key} id={`field-${node.id}`} sx={{ width: '100%' }}>
            {label && (
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', mb: 1, ml: 0.5, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                {cleanLabel}
                {hasAsterisk && <Typography component="span" sx={{ color: '#ef4444', fontWeight: 700, ml: 0.5 }}>*</Typography>}
              </Typography>
            )}
            <FormControl fullWidth error={!!error}>
              <Select
                value={value}
                onChange={(e) => handleChange(node.id, e.target.value)}
                onBlur={() => handleBlur(node.id)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px', mt: 0.5,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      '& .MuiMenuItem-root': {
                        fontSize: '15px', color: '#1A1A1A',
                        py: 1.5, mx: 1, borderRadius: '8px',
                        '&.Mui-selected': { bgcolor: alpha(BRAND, 0.08), color: BRAND, fontWeight: 600 },
                        '&:hover': { bgcolor: '#F5F5F5' },
                      },
                    },
                  },
                }}
                sx={{
                  borderRadius: RADIUS,
                  backgroundColor: INPUT_FILL,
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0f172a',
                  height: ROW_HEIGHT,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent', borderWidth: 1 },
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: `0 0 0 4px ${alpha(BRAND, 0.15)}`,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND, borderWidth: 2 },
                  '& .MuiSelect-select': { display: 'flex', alignItems: 'center', px: '20px' },
                  '& .MuiSelect-icon': { color: '#94a3b8' },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ color: '#9E9E9E' }}>{placeholder}</Typography>
                </MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{txt(opt.label)}</MenuItem>
                ))}
              </Select>
              {error && (
                <Typography sx={{ color: '#D32F2F', fontSize: '12px', mt: 0.75, ml: 0.5 }}>{error}</Typography>
              )}
            </FormControl>
          </Box>
        );
      }

      // ── File / Image upload ──
      case 'fileUpload':
      case 'file':
      case 'image_capture': {
        const label = txt(node.data?.label);
        const value = formData[node.id] || '';
        const error = errors[node.id];
        return (
          <Box key={key} id={`field-${node.id}`} sx={{ ...pad }}>
            <ImageCaptureUpload
              field={{ ...node, label }}
              value={value}
              onChange={(data) => handleChange(node.id, data)}
              error={error}
            />
          </Box>
        );
      }

      case 'button':
        if (isSuccessScreen) {
          return (
             <Box key={key} sx={{ ...pad, width: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disableElevation
                sx={{
                  py: '18px',
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '17px',
                  fontWeight: 700,
                  bgcolor: BRAND,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  background: `linear-gradient(135deg, ${BRAND}, #0ea5e9)`,
                  boxShadow: `0 12px 32px ${alpha(BRAND, 0.3)}, 0 4px 12px ${alpha(BRAND, 0.1)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    background: `linear-gradient(135deg, ${BRAND}, #0ea5e9)`,
                    filter: 'brightness(1.1)',
                    boxShadow: `0 16px 40px ${alpha(BRAND, 0.4)}, 0 6px 16px ${alpha(BRAND, 0.2)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': { transform: 'scale(0.98) translateY(0)' },
                }}
              >
                {txt(node.data?.text || 'Continue')}
              </Button>
            </Box>
          );
        }
        return null;

      default:
        if (node.children) {
          const orient = ORIENTATION_MAP[node.orientation] || {};
          return (
            <Box key={key} sx={{ ...orient, ...pad }}>
              {node.children.map((child, i) => renderNode(child, i))}
            </Box>
          );
        }
        return null;
    }
  }, [formData, errors, handleChange, handleBlur]);

  // ══════════════════════════════════════════
  //  MAIN RENDER
  // ══════════════════════════════════════════

  const contentSections = useMemo(() =>
    sections.filter(s => s.type !== 'header'),
    [sections]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        id="dynamic-form-top"
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'transparent',
        }}
      >
        <Fade in timeout={200}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {contentSections.map((section, idx) => {
              // On screens with input fields, hide button-only sections
              // (the CTA is rendered separately at the bottom).
              // On action/success screens (no input fields), keep them
              // so the buttons are visible.
              if (!isSuccessScreen) {
                const hasOnlyButton = section.children?.every(c =>
                  c.type === 'button' || (c.type === 'container' && c.children?.every(cc => cc.type === 'button'))
                );
                if (hasOnlyButton) return null;
              }

              return renderNode(section, idx);
            })}
          </Box>
        </Fade>

        {/* ── CTA Button (Only if not success/action screen) ── */}
        {!isSuccessScreen && submitBtnData && (
          <Box sx={{ px: '20px', pt: '20px', pb: '16px' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              endIcon={<ChevronRightIcon />}
              disableElevation
              sx={{
                py: '20px',
                borderRadius: '24px',
                textTransform: 'none',
                fontSize: '18px',
                fontWeight: 700,
                bgcolor: BRAND,
                color: '#fff',
                letterSpacing: '-0.01em',
                background: `linear-gradient(135deg, ${BRAND}, #0ea5e9)`,
                boxShadow: `0 12px 32px ${alpha(BRAND, 0.3)}, 0 4px 12px ${alpha(BRAND, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${BRAND}, #0ea5e9)`,
                  filter: 'brightness(1.1)',
                  boxShadow: `0 16px 40px ${alpha(BRAND, 0.4)}, 0 6px 16px ${alpha(BRAND, 0.2)}`,
                  transform: 'translateY(-2px)',
                },
                '&:active': { transform: 'scale(0.98) translateY(0)' },
              }}
            >
              {txt(submitBtnData?.data?.text || 'Continue')}
            </Button>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default WorkflowUIRenderer;
