/**
 * Form Theme Configuration
 * Centralized theme + style token mapping for all form renderers.
 * Uniform blue + off-white design across all JSON schemas.
 */

// ── Theme palette — Blue (#0078d7) + Off-white, matching MuiThemeProvider ──
export const THEME = {
  // Primary — matches app's primary: '#0078d7'
  brand: '#0078d7',
  brandDark: '#005a9e',
  brandLight: '#E3F2FD',
  brandGlow: 'rgba(0, 120, 215, 0.12)',
  accent: '#2f8fef',
  accentLight: '#BBDEFB',

  // Surfaces
  surface: '#F8FAFC',
  surfaceAlt: '#F1F5F9',
  card: '#FFFFFF',
  inputBg: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderFocus: '#1565C0',

  // Semantic
  success: '#059669',
  successLight: '#D1FAE5',
  error: '#DC2626',
  errorLight: '#FEE2E2',

  // Effects
  gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)',
  gradientSubtle: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.06)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.08)',
  shadowLg: '0 12px 40px rgba(0, 0, 0, 0.12)',
  shadowBrand: '0 4px 20px rgba(0, 120, 215, 0.3)',

  // Radii
  radius: '14px',
  radiusLg: '18px',
  radiusSm: '10px',
};

// ── Padding token → px value ──
export const PADDING_MAP = {
  none: 0,
  xxsmall: 2,
  xsmall: 4,
  small: 8,
  slarge: 12,
  medium: 16,
  large: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
};

// ── Resolve padding object to sx ──
export const resolvePadding = (padding) => {
  if (!padding) return {};
  const sx = {};
  if (padding.all) {
    const v = PADDING_MAP[padding.all] ?? 16;
    sx.p = `${v}px`;
  }
  if (padding.top) sx.pt = `${PADDING_MAP[padding.top] ?? 0}px`;
  if (padding.bottom) sx.pb = `${PADDING_MAP[padding.bottom] ?? 0}px`;
  if (padding.start) sx.pl = `${PADDING_MAP[padding.start] ?? 0}px`;
  if (padding.end) sx.pr = `${PADDING_MAP[padding.end] ?? 0}px`;
  if (padding.horizontal) {
    const v = PADDING_MAP[padding.horizontal] ?? 0;
    sx.px = `${v}px`;
  }
  if (padding.vertical) {
    const v = PADDING_MAP[padding.vertical] ?? 0;
    sx.py = `${v}px`;
  }
  return sx;
};

// ── Text style token → typography sx ──
export const TEXT_STYLE_MAP = {
  displayLarge: {
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.25,
    color: THEME.textPrimary,
  },
  displayMedium: {
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.35,
    color: THEME.textSecondary,
  },
  labelLarge: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: THEME.textSecondary,
  },
  labelMedium: {
    fontSize: '14px',
    fontWeight: 500,
    color: THEME.textPrimary,
  },
  labelMediumSemibold: {
    fontSize: '14px',
    fontWeight: 600,
    color: THEME.textPrimary,
  },
  placeholder: {
    fontSize: '15px',
    fontWeight: 400,
    color: THEME.textMuted,
  },
  placeholderLarge: {
    fontSize: '15px',
    fontWeight: 400,
    color: THEME.textMuted,
  },
};

// ── Orientation token → flex sx ──
export const ORIENTATION_MAP = {
  columnStart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  columnStartLargeSpaced: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '14px',
  },
  rowSpaceBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowStart: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// ── Kept for backward compat with DynamicFormRenderer ──
export const DEFAULT_THEME = THEME;

export const getFormTheme = () => THEME;

export const detectCategory = () => 'onboarding';
