import { alpha } from '@mui/material';

// Color constants
export const COLORS = {
  primary: '#3B82F6',
  primaryLight: '#93C5FD',
  primaryDark: '#2563EB',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  accent: '#b5c8de',
  accentDark: '#8FA8C7',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
  background: {
    default: '#F5F7FA',
    paper: '#FFFFFF',
    light: '#F8FAFC',
    lighter: '#F1F5F9',
  },
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

// Common gradients
export const GRADIENTS = {
  widgetHeader: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #FFFFFF 100%)',
  widgetHeaderBorder: 'linear-gradient(90deg, #b5c8de 0%, #8FA8C7 50%, #b5c8de 100%)',
  widgetFooter: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  singleRecordCard: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  titleBackground: {
    table: 'linear-gradient(135deg, rgba(238, 241, 245, 0.2) 0%, rgba(220, 225, 232, 0.15) 50%, rgba(181, 200, 222, 0.2) 100%)',
    default: 'linear-gradient(135deg, rgba(181, 200, 222, 0.1) 0%, transparent 100%)',
  },
  chatHeader: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  filterHeader: `linear-gradient(135deg, ${alpha('#3B82F6', 0.05)} 0%, ${alpha('#3B82F6', 0.12)} 100%)`,
};

// Common shadows
export const SHADOWS = {
  widget: {
    default: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    hover: '0 4px 12px rgba(0,0,0,0.08)',
    dragged: '0 12px 32px rgba(59, 130, 246, 0.25)',
    header: '0 2px 8px rgba(0,0,0,0.04), inset 0 -1px 0 rgba(181, 200, 222, 0.2)',
  },
  button: {
    default: '0 2px 4px rgba(0,0,0,0.08)',
    hover: '0 4px 12px rgba(0,0,0,0.12)',
  },
  card: {
    default: '0 1px 2px rgba(0,0,0,0.06)',
    elevated: '0 4px 12px rgba(0,0,0,0.1)',
  },
  menu: '0 10px 40px rgba(0,0,0,0.12)',
  chatButton: '0 4px 20px rgba(59, 130, 246, 0.35)',
};

// Common border radius
export const BORDER_RADIUS = {
  small: 1,
  medium: 2,
  large: 3,
  xlarge: 4,
  widget: 12,
  button: 2,
  input: 3,
  card: 2,
  chip: 1.5,
};

// Common spacing
export const SPACING = {
  xs: 0.5,
  sm: 1,
  md: 1.5,
  lg: 2,
  xl: 2.5,
  xxl: 3,
};

// Typography styles
export const TYPOGRAPHY = {
  title: {
    fontWeight: 800,
    color: COLORS.text.primary,
    fontSize: { xs: '0.9375rem', md: '1.125rem' },
    lineHeight: 1.4,
    letterSpacing: '-0.02em',
  },
  caption: {
    fontSize: '0.75rem',
    color: COLORS.text.secondary,
    fontWeight: 500,
  },
  body: {
    fontSize: '0.875rem',
    color: COLORS.text.primary,
  },
};

// Widget styles
export const WIDGET_STYLES = {
  paper: {
    elevation: 0,
    borderRadius: `${BORDER_RADIUS.widget}px`,
    bgcolor: COLORS.background.paper,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: COLORS.border.light,
    boxShadow: SHADOWS.widget.default,
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: SHADOWS.widget.hover,
      borderColor: COLORS.border.medium,
    },
  },
  header: {
    px: SPACING.xl,
    py: 1.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: GRADIENTS.widgetHeader,
    borderBottom: '3px solid transparent',
    borderImage: `${GRADIENTS.widgetHeaderBorder} 1`,
    borderRadius: `${BORDER_RADIUS.widget}px ${BORDER_RADIUS.widget}px 0 0`,
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: SHADOWS.widget.header,
  },
  footer: {
    px: SPACING.xl,
    py: SPACING.sm,
    borderTop: `1px solid ${COLORS.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: GRADIENTS.widgetFooter,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 150,
    contain: 'content',
    willChange: 'contents',
    transform: 'translateZ(0)',
    '& > *': {
      flex: 1,
      minHeight: 0,
    },
  },
};

// Button styles
export const BUTTON_STYLES = {
  actionGroup: {
    bgcolor: COLORS.background.light,
    borderRadius: BORDER_RADIUS.medium,
    border: `1px solid ${COLORS.border.light}`,
    p: 0.25,
    '& .MuiToggleButton-root': {
      border: 'none',
      px: 1.25,
      py: 0.5,
      minWidth: 32,
      height: 32,
      color: COLORS.text.secondary,
      '&:hover': {
        bgcolor: alpha(COLORS.accent, 0.1),
        color: COLORS.accent,
      },
      '&.Mui-selected': {
        bgcolor: alpha(COLORS.accent, 0.1),
        color: COLORS.accent,
        '&:hover': {
          bgcolor: alpha(COLORS.accent, 0.15),
        },
      },
    },
  },
  primary: {
    bgcolor: COLORS.primary,
    color: '#fff',
    textTransform: 'none',
    '&:hover': {
      bgcolor: COLORS.primaryDark,
    },
  },
  secondary: {
    bgcolor: COLORS.background.paper,
    color: COLORS.text.primary,
    border: `1px solid ${COLORS.border.light}`,
    '&:hover': {
      bgcolor: COLORS.background.light,
    },
  },
};

// Icon badge styles
export const ICON_BADGE_STYLES = {
  default: {
    width: 36,
    height: 36,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gradient: {
    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
    boxShadow: `0 4px 12px ${alpha(COLORS.accent, 0.3)}`,
  },
};

// Edit icon badge styles
export const EDIT_BADGE_STYLES = {
  position: 'absolute',
  top: -8,
  right: -8,
  width: 25,
  height: 25,
  color: COLORS.accent,
  bgcolor: COLORS.background.paper,
  border: `2px solid ${COLORS.accent}`,
  borderRadius: '50%',
  transition: 'all 0.2s ease',
  zIndex: 2,
  boxShadow: `0 2px 8px ${alpha(COLORS.accent, 0.25)}`,
  '&:hover': {
    color: COLORS.accentDark,
    bgcolor: alpha(COLORS.accent, 0.1),
    borderColor: COLORS.accentDark,
    transform: 'scale(1.15)',
    boxShadow: `0 4px 10px ${alpha(COLORS.accent, 0.5)}`,
  },
};

// Title styles
export const TITLE_STYLES = {
  container: {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '100%',
  },
  typography: {
    fontWeight: 800,
    color: COLORS.text.primary,
    fontSize: { xs: '0.9375rem', md: '1.125rem' },
    lineHeight: 1.4,
    cursor: 'text',
    px: 1.25,
    py: 0,
    pr: 4,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.02em',
    borderRadius: BORDER_RADIUS.small,
    userSelect: 'none',
  },
  input: {
    fontWeight: 800,
    color: COLORS.text.primary,
    fontSize: { xs: '0.9375rem', md: '1.125rem' },
    lineHeight: 1.4,
    px: 1.5,
    py: 0.75,
    borderRadius: BORDER_RADIUS.medium,
    bgcolor: COLORS.background.paper,
    border: `2px solid ${COLORS.border.medium}`,
    minWidth: 200,
    maxWidth: '100%',
    background: GRADIENTS.widgetHeader,
    transition: 'all 0.2s ease',
    '&:focus-within': {
      borderColor: COLORS.accentDark,
      boxShadow: `0 6px 16px ${alpha(COLORS.accent, 0.4)}, inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
      transform: 'translateY(-1px)',
    },
  },
};

// Menu styles
export const MENU_STYLES = {
  paper: {
    elevation: 0,
    border: `1px solid ${COLORS.border.light}`,
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.menu,
    mt: 1,
    minWidth: 200,
    py: 1,
  },
  item: {
    py: 1.5,
    px: 2,
  },
  itemHover: {
    '&:hover': {
      bgcolor: '#FEF3C7',
    },
  },
  itemDanger: {
    '&:hover': {
      bgcolor: '#FEF2F2',
    },
  },
};

// Toolbar styles
export const TOOLBAR_STYLES = {
  container: {
    bgcolor: COLORS.background.paper,
    borderBottom: `1px solid ${COLORS.border.light}`,
    px: 3,
    py: 2,
  },
  searchBox: {
    bgcolor: COLORS.background.light,
    borderRadius: BORDER_RADIUS.large,
    p: 0.75,
    border: `1px solid ${COLORS.border.light}`,
    flex: 1,
    minWidth: 0,
  },
  viewModeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1.5,
    py: 0.75,
    borderRadius: BORDER_RADIUS.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Chat panel styles
export const CHAT_STYLES = {
  panel: {
    bgcolor: COLORS.background.paper,
    boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
    borderLeft: `1px solid ${COLORS.border.light}`,
  },
  header: {
    bgcolor: COLORS.primary,
    p: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  input: {
    border: `1px solid ${COLORS.border.medium}`,
    borderRadius: `${BORDER_RADIUS.large}px`,
    px: 1.5,
    py: 1,
    transition: 'all 0.2s',
    '&:focus-within': {
      borderColor: COLORS.primary,
      boxShadow: `0 0 0 2px ${alpha(COLORS.primary, 0.1)}`,
    },
  },
};

// Fullscreen dialog styles
export const FULLSCREEN_STYLES = {
  paper: {
    borderRadius: 0,
    bgcolor: COLORS.background.light,
  },
  title: {
    px: { xs: 2, sm: 4 },
    py: { xs: 1.5, sm: 2 },
    borderBottom: `1px solid ${COLORS.border.light}`,
    display: 'flex',
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1, sm: 0 },
    background: GRADIENTS.chatHeader,
    color: '#fff',
  },
  filterSidebar: {
    bgcolor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.xlarge,
    border: `1px solid ${COLORS.border.light}`,
    boxShadow: SHADOWS.card.elevated,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: `linear-gradient(145deg, ${COLORS.background.paper} 0%, ${COLORS.background.light} 100%)`,
  },
};

// Animation keyframes
export const ANIMATIONS = {
  shimmer: {
    '@keyframes shimmer': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  },
  spin: {
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  bounce: {
    '@keyframes bounce': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
  },
  slideIn: {
    '@keyframes slideIn': {
      '0%': { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
      '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
    },
  },
};
