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
const BORDER = '#DADCE0';        // thin light gray for all borders
const CARD_BORDER = '#D0D0D0';   // slightly more visible for outer card
const RADIUS = '12px';
const BRAND = THEME.brand;       // #0078d7
const BRAND_LIGHT = '#E8F0FE';
const INPUT_FILL = '#F5F5F5';    // light gray fill for text inputs
const ROW_HEIGHT = '54px';       // uniform height for ALL interactive elements

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

  const handleChange = useCallback((id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
  }, []);

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

  const validateField = useCallback((field, value) => {
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      // Check for custom validation message in actions
      const actions = Array.isArray(field.action) ? field.action : [];
      for (const a of actions) {
        if (a.value?.validation?.message) return a.value.validation.message;
      }
      return `${txt(field.data?.label || field.id)} is required`;
    }
    const actions = Array.isArray(field.action) ? field.action : [];
    for (const a of actions) {
      if (a.value?.validation?.regex && value) {
        if (!new RegExp(a.value.validation.regex).test(value)) {
          return a.value.validation.message || 'Invalid format';
        }
      }
    }
    return null;
  }, []);

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
        const style = node.style;

        // Large white icon (used in success screens)
        if (style === 'largeWhite') {
          return (
            <Box key={key} sx={{ ...pad }}>
              <Ico sx={{ fontSize: 48, color: '#FFFFFF' }} />
            </Box>
          );
        }

        // Default icon rendering
        return (
          <Box key={key} sx={{ ...pad }}>
            <Ico sx={{ fontSize: 24, color: BRAND }} />
          </Box>
        );
      }

      case 'divider':
        return <Box key={key} sx={{ borderBottom: `1px solid #F0F0F0`, my: 0.5, ...pad }} />;

      // ── Text ──
      case 'text': {
        const label = txt(node.data?.label || node.data?.text);
        const style = node.style;

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

        const orient = ORIENTATION_MAP[node.orientation] || {};
        return (
          <Box key={key} sx={{ ...orient, ...pad, width: '100%' }}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Box>
        );
      }

      // ── Card — clean border, no shadow ──
      case 'card': {
        return (
          <Box
            key={key}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid #D0D0D0',
              mx: '4px',
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
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', mb: 1, lineHeight: 1.4 }}>
                {cleanLabel}
                {hasAsterisk && <Typography component="span" sx={{ color: '#1A1A1A', fontWeight: 700, ml: 0.5 }}>*</Typography>}
              </Typography>
            )}
            <TextField
              fullWidth
              placeholder={placeholder || `Enter ${label?.replace(/\s*\*\s*$/, '').toLowerCase()}`}
              value={value}
              onChange={(e) => handleChange(node.id, e.target.value)}
              error={!!error}
              helperText={error}
              variant="outlined"
              type={kbType === 'number' ? 'number' : kbType === 'email' ? 'email' : 'text'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: RADIUS,
                  backgroundColor: INPUT_FILL,
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#1A1A1A',
                  height: ROW_HEIGHT,
                  '& fieldset': { borderColor: BORDER, borderWidth: 1 },
                  '&:hover fieldset': { borderColor: '#BDBDBD' },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                    '& fieldset': { borderColor: BRAND, borderWidth: 1.5 },
                  },
                  '& input': { px: '16px' },
                  '& input::placeholder': { color: '#9E9E9E', opacity: 1 },
                },
                '& .MuiFormHelperText-root': { fontSize: '12px', ml: 0.5 },
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
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', mb: 1, lineHeight: 1.4 }}>
                {cleanLabel}
                {hasAsterisk && <Typography component="span" sx={{ color: '#1A1A1A', fontWeight: 700, ml: 0.5 }}>*</Typography>}
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
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: RADIUS,
                      backgroundColor: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#1A1A1A',
                      height: ROW_HEIGHT,
                      '& fieldset': { borderColor: BORDER, borderWidth: 1 },
                      '&:hover fieldset': { borderColor: '#BDBDBD' },
                      '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: 1.5 },
                      '& input': { px: '16px' },
                      '& input::placeholder': { color: '#9E9E9E', opacity: 1 },
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
                      px: '16px',
                      minHeight: ROW_HEIGHT,
                      borderRadius: RADIUS,
                      border: '1px solid',
                      borderColor: sel ? BRAND : BORDER,
                      bgcolor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                      '&:hover': { borderColor: sel ? BRAND : '#BDBDBD' },
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
                flex: 1, fontSize: '15px', fontWeight: 400, color: '#1A1A1A',
                lineHeight: 1.4,
              }}>
                {label}
                {node.required && (
                  <Typography component="span" sx={{ color: BRAND, fontWeight: 600, ml: 0.5 }}>*</Typography>
                )}
              </Typography>
            </Box>
            {error && (
              <Typography sx={{ color: '#D32F2F', fontSize: '12px', mt: 0.25, ml: '36px' }}>{error}</Typography>
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
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', mb: 1, lineHeight: 1.4 }}>
                {cleanLabel}
                {hasAsterisk && <Typography component="span" sx={{ color: '#1A1A1A', fontWeight: 700, ml: 0.5 }}>*</Typography>}
              </Typography>
            )}
            <FormControl fullWidth error={!!error}>
              <Select
                value={value}
                onChange={(e) => handleChange(node.id, e.target.value)}
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
                  backgroundColor: '#FFFFFF',
                  fontSize: '15px',
                  color: '#1A1A1A',
                  height: ROW_HEIGHT,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER, borderWidth: 1 },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND, borderWidth: 1.5 },
                  '& .MuiSelect-select': { display: 'flex', alignItems: 'center', px: '16px' },
                  '& .MuiSelect-icon': { color: '#757575' },
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
  }, [formData, errors, handleChange]);

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
          minHeight: '100%',
          bgcolor: '#FFFFFF',
        }}
      >
        <Fade in timeout={200}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {contentSections.map((section, idx) => {
              const hasOnlyButton = section.children?.every(c =>
                c.type === 'button' || (c.type === 'container' && c.children?.every(cc => cc.type === 'button'))
              );
              if (hasOnlyButton) return null;

              return renderNode(section, idx);
            })}
          </Box>
        </Fade>

        {/* ── CTA Button ── */}
        <Box sx={{ px: '20px', pt: '20px', pb: '16px' }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            endIcon={<ChevronRightIcon />}
            disableElevation
            sx={{
              py: '14px',
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              bgcolor: BRAND,
              color: '#fff',
              '&:hover': { bgcolor: '#005a9e' },
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            {txt(submitBtnData?.data?.text || 'Continue')}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default WorkflowUIRenderer;
