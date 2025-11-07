import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
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
    const value = item[field.dataKey];

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
  } = cardConfig;

  const name = item[nameKey];
  const avatarName = item[avatarKey];

  return (
    <Card
      elevation={elevation}
      onClick={() => onClick && onClick(item)}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: borderRadius,
        transition: "all 0.3s ease",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...(hoverEffect && onClick && {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
        }),
        ...sx,
      }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Avatar and Name Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {showAvatar && (
            <Avatar
              sx={{
                bgcolor: getAvatarColor(avatarName),
                width: 48,
                height: 48,
                fontSize: "1.1rem",
                fontWeight: 600,
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
              }}
            >
              {name}
            </Typography>
          </Box>
        </Box>

        {/* Dynamic Fields Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
          {fields.map((field) => renderField(field))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DynamicCardRenderer;
