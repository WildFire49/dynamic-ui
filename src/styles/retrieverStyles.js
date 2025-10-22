// Retriever Configurator Styling Constants
// Uses theme colors for consistency

export const COLORS = {
  primary: "#0078d7",
  secondary: "#2f8fef",
  success: "#48bb78",
  error: "#f56565",
  warning: "#ed8936",
  info: "#0078d7",
  background: "#f8fafc",
  cardBg: "#ffffff",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  textPrimary: "#1a202c",
  textSecondary: "#4a5568",
  textMuted: "#718096",
  // Subtle, professional gradients
  gradient: "linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)",
  gradientSubtle: "linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  small: "6px",
  medium: "8px",
  large: "12px",
  xl: "16px",
};

export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

export const TRANSITIONS = {
  default: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  fast: "all 0.15s ease-in-out",
  slow: "all 0.3s ease-in-out",
};

// Component-specific styles
export const COMPONENT_STYLES = {
  connectionCard: {
    p: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.base,
    backgroundColor: COLORS.cardBg,
    border: `1px solid ${COLORS.borderLight}`,
    transition: TRANSITIONS.default,
  },

  statusChip: {
    fontWeight: 500,
    borderRadius: BORDER_RADIUS.small,
    fontSize: "0.75rem",
    height: "24px",
  },

  actionButton: {
    borderRadius: BORDER_RADIUS.medium,
    textTransform: "none",
    fontWeight: 500,
    px: 3,
    py: 1.25,
    boxShadow: SHADOWS.none,
    transition: TRANSITIONS.default,
  },

  inputField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: BORDER_RADIUS.medium,
      backgroundColor: COLORS.cardBg,
      "&:hover fieldset": {
        borderColor: COLORS.primary,
      },
    },
  },

  sectionHeader: {
    mb: SPACING.md,
    pb: SPACING.sm,
    borderBottom: `1px solid ${COLORS.border}`,
  },

  codeBlock: {
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    p: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    fontFamily: "Monaco, Courier, monospace",
    fontSize: "0.875rem",
    overflow: "auto",
    maxHeight: "400px",
  },

  reasoningStep: {
    p: SPACING.md,
    mb: SPACING.sm,
    borderLeft: `4px solid ${COLORS.primary}`,
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.small,
  },

  tableCard: {
    p: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    border: `1px solid ${COLORS.border}`,
    transition: TRANSITIONS.default,
    cursor: "pointer",
    "&:hover": {
      borderColor: COLORS.primary,
      boxShadow: SHADOWS.card,
      transform: "translateY(-2px)",
    },
  },

  relationshipLine: {
    height: "2px",
    backgroundColor: COLORS.primary,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      right: 0,
      top: "-4px",
      width: 0,
      height: 0,
      borderLeft: "8px solid",
      borderTop: "5px solid transparent",
      borderBottom: "5px solid transparent",
      borderColor: `transparent transparent transparent ${COLORS.primary}`,
    },
  },
};

export const LAYOUT_STYLES = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    py: { xs: 2, md: 4 },
    px: { xs: 2, md: 3 },
  },

  contentWrapper: {
    maxWidth: "1400px",
    mx: "auto",
  },

  gridContainer: {
    spacing: { xs: 2, md: 3 },
  },

  sectionCard: {
    p: { xs: 2.5, md: 3 },
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.base,
    backgroundColor: COLORS.cardBg,
    border: `1px solid ${COLORS.borderLight}`,
    mb: 3,
  },

  stepperCard: {
    p: 3,
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.sm,
    backgroundColor: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    mb: 3,
  },
};
