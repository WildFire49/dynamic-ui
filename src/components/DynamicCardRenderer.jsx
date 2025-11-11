import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Phone,
  LocationOn,
  Person,
  AttachMoney,
  CurrencyRupee,
  BusinessCenter,
  Email,
  Home,
  Work,
  AccountBalance,
  CreditCard,
  Fingerprint,
  CheckCircle,
  ArrowForward,
} from "@mui/icons-material";

// Icon mapping
const iconMap = {
  Phone,
  LocationOn,
  Person,
  AttachMoney,
  CurrencyRupee,
  BusinessCenter,
  Email,
  Home,
  Work,
  AccountBalance,
  CreditCard,
  Fingerprint,
  CheckCircle,
  ArrowForward,
};

/**
 * DynamicCardRenderer - A reusable card component with avatar and dynamic fields
 * 
 * @param {object} item - The data item to display
 * @param {object} cardConfig - Card configuration (avatarKey, nameKey, fields, etc.)
 * @param {function} onClick - Callback when card is clicked
 * @param {object} sx - Additional styles for the card
 */
const DynamicCardRenderer = ({ 
  item, 
  cardConfig = {}, 
  onClick,
  sx = {}
}) => {
  const theme = useTheme();

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  // Render a single field with icon and text
  const renderField = (field) => {
    const Icon = iconMap[field.icon];
    let value = item[field.dataKey];
    let prefix = field.prefix;
    
    // Conditional logic for mifixId field
    if (field.id === "mifixId") {
      // If customer has no formSchemaId (leads only), don't show mifixId
      if (!item.formSchemaId) {
        return null;
      }
    }
    
    // Conditional logic for product field
    if (field.id === "product") {
      // If customer has no formSchemaId (leads only), show desiredProduct instead
      if (!item.formSchemaId && item.desiredProduct) {
        value = item.desiredProduct;
        prefix = "Desired Product:";
      }
    }

    // Skip rendering if no value
    if (!value && field.hideIfEmpty) return null;

    return (
      <Box
        key={field.id}
        sx={{
          display: "flex",
          alignItems: field.alignItems || "center",
          gap: 1,
          minHeight: field.minHeight || "24px",
        }}
      >
        {Icon && (
          <Icon
            sx={{
              fontSize: field.iconSize || 18,
              color: field.iconColor || theme.palette.text.secondary,
              flexShrink: 0,
            }}
          />
        )}
        <Typography
          variant={field.variant || "body2"}
          color={field.textColor || "text.secondary"}
          sx={{
            fontSize: field.fontSize || "0.85rem",
            fontWeight: field.fontWeight,
            lineHeight: 1.4,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: field.clamp ? "-webkit-box" : "block",
            WebkitLineClamp: field.clamp,
            WebkitBoxOrient: field.clamp ? "vertical" : undefined,
            ...(field.sx || {}),
          }}
        >
          {field.prefix && <span>{field.prefix} </span>}
          {field.bold ? <strong>{value}</strong> : value}
          {field.suffix && <span> {field.suffix}</span>}
        </Typography>
      </Box>
    );
  };

  // Extract config values with defaults
  const {
    avatarKey = "name",
    nameKey = "name",
    fields = [],
    showAvatar = true,
    elevation = 0,
    borderRadius = 2,
    hoverEffect = true,
    actions = {},
  } = cardConfig;

  const name = item[nameKey];
  const avatarName = item[avatarKey];
  
  // Check if item is urgent (needs review)
  const isUrgent = item.approvalStatus === "pending";
  const isRejected = item.approvalStatus === "rejected";
  const urgentColor = "#d32f2f"; // Red color for pending items

  return (
    <Card
      elevation={elevation}
      onClick={() => !actions.showButton && onClick && onClick(item)}
      sx={{
        cursor: !actions.showButton && onClick ? "pointer" : "default",
        borderRadius,
        transition: "all 0.3s ease-in-out",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: isUrgent 
          ? `2px solid ${alpha(urgentColor, 0.6)}`
          : isRejected
          ? `1px solid ${alpha(theme.palette.error.main, 0.3)}`
          : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        ...(isUrgent && {
          bgcolor: alpha(urgentColor, 0.02),
          boxShadow: `0 4px 16px ${alpha(urgentColor, 0.15)}`,
          animation: "urgentAttention 4s ease-in-out infinite",
          "@keyframes urgentAttention": {
            "0%": {
              boxShadow: `0 4px 16px ${alpha(urgentColor, 0.15)}`,
              transform: "translateY(0) scale(1)",
            },
            "10%": {
              transform: "translateY(-2px) scale(1.01)",
              boxShadow: `0 8px 24px ${alpha(urgentColor, 0.3)}`,
            },
            "20%": {
              transform: "translateY(0) scale(1)",
              boxShadow: `0 4px 16px ${alpha(urgentColor, 0.15)}`,
            },
            "30%": {
              transform: "translateY(-2px) scale(1.01)",
              boxShadow: `0 8px 24px ${alpha(urgentColor, 0.3)}`,
            },
            "40%, 100%": {
              transform: "translateY(0) scale(1)",
              boxShadow: `0 6px 20px ${alpha(urgentColor, 0.2)}`,
            },
          },
        }),
        ...(isRejected && {
          opacity: 0.7,
          bgcolor: alpha(theme.palette.error.main, 0.02),
        }),
        ...(hoverEffect && {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isUrgent
              ? `0 8px 32px ${alpha(urgentColor, 0.3)}`
              : `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: isUrgent 
              ? urgentColor
              : theme.palette.primary.main,
          },
        }),
      }}
    >
      {/* Urgent Badge */}
      {isUrgent && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: urgentColor,
            color: "#ffffff",
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            fontSize: "0.65rem",
            fontWeight: 700,
            zIndex: 1,
            boxShadow: `0 2px 8px ${alpha(urgentColor, 0.4)}`,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            animation: "badgePulse 2s ease-in-out infinite",
            "@keyframes badgePulse": {
              "0%, 100%": {
                boxShadow: `0 2px 8px ${alpha(urgentColor, 0.4)}`,
                transform: "scale(1)",
              },
              "50%": {
                boxShadow: `0 4px 16px ${alpha(urgentColor, 0.7)}`,
                transform: "scale(1.05)",
              },
            },
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#ffffff",
              animation: "dotBlink 1s ease-in-out infinite",
              "@keyframes dotBlink": {
                "0%, 100%": { 
                  opacity: 1,
                  boxShadow: `0 0 4px ${alpha("#ffffff", 0.8)}`,
                },
                "50%": { 
                  opacity: 0.2,
                  boxShadow: "none",
                },
              },
            }}
          />
          ACTION NEEDED
        </Box>
      )}
      {isRejected && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: theme.palette.error.main,
            color: "#ffffff",
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            fontSize: "0.65rem",
            fontWeight: 700,
            zIndex: 1,
          }}
        >
          REJECTED
        </Box>
      )}
      <CardContent 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          p: 2.5,
        }}
      >
        {/* Avatar and Name Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2.5,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          {showAvatar && (
            <Avatar
              sx={{
                bgcolor: getAvatarColor(avatarName),
                width: 48,
                height: 48,
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: `0 2px 8px ${alpha(getAvatarColor(avatarName), 0.3)}`,
              }}
            >
              {getInitials(avatarName)}
            </Avatar>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "text.primary",
              }}
            >
              {name}
            </Typography>
          </Box>
        </Box>

        {/* Dynamic Fields Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, mb: actions.showButton ? 2 : 0 }}>
          {fields.map((field) => renderField(field))}
        </Box>

        {/* Action Button */}
        {actions.showButton && (
          <Box sx={{ mt: "auto", pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Button
              variant={actions.buttonVariant || "outlined"}
              size={actions.buttonSize || "small"}
              fullWidth
              endIcon={actions.buttonIcon ? iconMap[actions.buttonIcon] && React.createElement(iconMap[actions.buttonIcon]) : null}
              onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(item);
              }}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 500,
                py: 1,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {actions.buttonText || "View Details"}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicCardRenderer;
