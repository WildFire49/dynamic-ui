import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Phone,
  Email,
  AccountBalance,
  CurrencyRupee,
  CheckCircle,
  LocationOn,
  TrendingUp,
  BusinessCenter,
  ArrowForward,
  Person,
  AttachMoney,
  Home,
  Work,
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
  CheckCircle,
  ArrowForward,
  TrendingUp,
};

/**
 * DynamicCardRenderer - A reusable card component with avatar and dynamic fields
 * 
 * @param {object} item - The data item to display
 * @param {object} cardConfig - Card configuration (avatarKey, nameKey, fields, etc.)
 * @param {function} onClick - Callback when card is clicked
 * @param {function} onReviewClick - Callback when Review button is clicked (switches to Review Panel tab)
 * @param {object} sx - Additional styles for the card
 */
const DynamicCardRenderer = ({ 
  item, 
  cardConfig = {}, 
  onClick,
  onReviewClick,
  isSelected = false,
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

  // Render a single field with icon and label
  const renderField = (field) => {
    const Icon = iconMap[field.icon];
    let value = item[field.dataKey];
    
    // Conditional logic for product field
    if (field.id === "product") {
      // If customer has no formSchemaId (leads only), show desiredProduct instead
      if (!item.formSchemaId && item.desiredProduct) {
        value = item.desiredProduct;
      }
    }

    // Skip rendering if no value
    if (!value && field.hideIfEmpty) return null;

    return (
      <Box
        key={field.id}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 1.5,
        }}
      >
        {Icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <Icon
              sx={{
                fontSize: 18,
                color: theme.palette.primary.main,
              }}
            />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {field.label && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                color: "text.secondary",
                display: "block",
                mb: 0.375,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {field.label}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "text.primary",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: field.clamp ? "-webkit-box" : "block",
              WebkitLineClamp: field.clamp,
              WebkitBoxOrient: field.clamp ? "vertical" : undefined,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Render metric/data point - compact version
  const renderMetric = (metric, totalMetrics) => {
    const Icon = iconMap[metric.icon];
    const value = item[metric.dataKey];

    if (!value) return null;

    return (
      <Box
        key={metric.id}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          p: 1.25,
          minHeight: totalMetrics <= 2 ? 70 : 60,
          bgcolor: alpha(metric.bgColor || theme.palette.primary.main, 0.06),
          borderRadius: 1.5,
          border: `1px solid ${alpha(metric.bgColor || theme.palette.primary.main, 0.12)}`,
          minWidth: 0,
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: alpha(metric.bgColor || theme.palette.primary.main, 0.1),
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px ${alpha(metric.bgColor || theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        {Icon && (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(metric.color || theme.palette.primary.main, 0.15),
            }}
          >
            <Icon
              sx={{
                fontSize: 16,
                color: metric.color || theme.palette.primary.main,
              }}
            />
          </Box>
        )}
        {metric.showLabel && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.625rem",
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              textAlign: "center",
              lineHeight: 1.2,
              mt: 0.25,
            }}
          >
            {metric.label}
          </Typography>
        )}
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            color: metric.color || theme.palette.primary.main,
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          {value}
        </Typography>
      </Box>
    );
  };

  // Extract config values with defaults
  const {
    avatarKey = "avatarUrl",
    avatarFallbackKey = "name",
    nameKey = "name",
    subtitleKey = "mifixId",
    fields = [],
    metrics = [],
    showAvatar = true,
    cardStyle = "modern",
    actions = {},
    actionButton, // New: actionButton config from JSON
    badge, // New: badge config from JSON
  } = cardConfig;
  
  console.log("🃏 Card config:", { actionButton, badge, actions });

  const name = item[nameKey];
  const subtitle = item[subtitleKey];
  const avatarUrl = item[avatarKey];
  const avatarFallback = item[avatarFallbackKey];
  
  // Use actionButton if available, otherwise fall back to actions
  const buttonConfig = actionButton || actions;
  const showButton = actionButton ? true : actions.showButton;
  const buttonLabel = actionButton?.label || actions.buttonLabel || "Review";
  const buttonVariant = actionButton?.variant || actions.buttonVariant || "contained";
  const buttonColor = actionButton?.color || actions.buttonColor || "primary";
  
  console.log("🔘 Button config:", { showButton, buttonLabel, buttonVariant, buttonConfig });
  
  // Get badge value and color from JSON config
  const badgeValue = badge?.dataKey ? item[badge.dataKey] : item.status || "Pending";
  const badgeColorKey = badge?.colorMap?.[badgeValue] || "default";
  
  // Map MUI color names to theme palette
  const getBadgeColor = () => {
    const colorMap = {
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      primary: theme.palette.primary.main,
      default: theme.palette.grey[600],
    };
    return colorMap[badgeColorKey] || colorMap.default;
  };
  
  console.log("🏷️ Badge config:", { badgeValue, badgeColorKey, badge });
  
  // Check if item is urgent (needs review) - kept for backward compatibility
  const isUrgent = item.approvalStatus === "pending";
  const isRejected = item.approvalStatus === "rejected";
  const isApproved = item.approvalStatus === "approved";

  // Get status color (legacy)
  const getStatusColor = () => {
    if (isUrgent) return theme.palette.warning.main;
    if (isRejected) return theme.palette.error.main;
    if (isApproved) return theme.palette.success.main;
    return theme.palette.text.disabled;
  };

  // Handle button click
  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onClick) {
      onClick(item);
    }
    // If this is a Review button, trigger tab switch via onReviewClick callback
    if (onReviewClick && (buttonLabel === "Review" || buttonLabel?.toLowerCase().includes("review"))) {
      onReviewClick(item);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2.5,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        ...(isSelected && {
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        }),
        ...(isRejected && {
          opacity: 0.75,
        }),
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          border: isSelected
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }}
    >
      {/* Status Indicator - Top Color Bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: getStatusColor(),
          opacity: 0.9,
        }}
      />

      <CardContent 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          p: 0,
          "&:last-child": { pb: 0 },
        }}
      >
        {/* Top Section - Avatar + Name + Review Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 2,
            pb: 1.75,
            bgcolor: alpha(theme.palette.grey[50], 0.4),
          }}
        >
          {/* Avatar */}
          {showAvatar && (
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{
                width: 52,
                height: 52,
                border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
                boxShadow: `0 3px 10px ${alpha(theme.palette.common.black, 0.1)}`,
              }}
            >
              {getInitials(avatarFallback || name)}
            </Avatar>
          )}

          {/* Name, Subtitle & Status */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {isUrgent && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    boxShadow: `0 0 8px ${alpha(theme.palette.error.main, 0.6)}`,
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        opacity: 1,
                        transform: "scale(1)",
                        boxShadow: `0 0 8px ${alpha(theme.palette.error.main, 0.6)}`,
                      },
                      "50%": {
                        opacity: 0.6,
                        transform: "scale(1.3)",
                        boxShadow: `0 0 12px ${alpha(theme.palette.error.main, 0.8)}`,
                      },
                    },
                  }}
                />
              )}
              <Chip
                label={badgeValue}
                size="small"
                color={badgeColorKey !== "default" ? badgeColorKey : undefined}
                sx={{
                  height: 19,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: badgeColorKey !== "default" 
                    ? undefined // Let MUI handle color prop
                    : alpha(getBadgeColor(), 0.12),
                  color: badgeColorKey !== "default"
                    ? undefined // Let MUI handle color prop
                    : getBadgeColor(),
                  border: badgeColorKey === "default" 
                    ? `1px solid ${alpha(getBadgeColor(), 0.25)}`
                    : undefined,
                  "& .MuiChip-label": {
                    px: 0.625,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Button from JSON Config */}
          {showButton && (
            <Button
              variant={buttonVariant}
              size="small"
              color={buttonColor}
              endIcon={buttonConfig.icon ? React.createElement(iconMap[buttonConfig.icon]) : null}
              onClick={handleButtonClick}
              sx={{
                borderRadius: 1.5,
                px: 2,
                py: 0.625,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                boxShadow: `0 2px 8px ${alpha(theme.palette[buttonColor]?.main || theme.palette.primary.main, 0.2)}`,
                flexShrink: 0,
                "&:hover": {
                  boxShadow: `0 4px 12px ${alpha(theme.palette[buttonColor]?.main || theme.palette.primary.main, 0.35)}`,
                  transform: "translateY(-1px)",
                },
              }}
            >
              {buttonLabel}
            </Button>
          )}
        </Box>

        {/* Content Section - Info Fields + Metrics in Responsive Grid */}
        <Box
          sx={{
            display: "flex",
            gap: 0,
            px: 2.5,
            py: 2,
            pt: 1.75,
            minHeight: 145,
          }}
        >
          {/* Left: Info Fields */}
          <Box 
            sx={{ 
              flex: 1, 
              minWidth: 0, 
              pr: 2.5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {fields.map((field) => renderField(field))}
          </Box>

          {/* Vertical Divider */}
          {metrics && metrics.length > 0 && (
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                borderColor: alpha(theme.palette.divider, 0.15),
                mx: 0,
              }} 
            />
          )}

          {/* Right: Metrics in Responsive Grid */}
          {metrics && metrics.length > 0 && (() => {
            const visibleMetrics = metrics.filter(m => item[m.dataKey]);
            const metricCount = visibleMetrics.length;
            
            return (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: metricCount <= 2 ? "1fr" : "repeat(2, 1fr)",
                  gap: 1.25,
                  pl: 2.5,
                  minWidth: 220,
                  maxWidth: 220,
                  alignContent: "center",
                  justifyItems: "stretch",
                }}
              >
                {metrics.map((metric) => renderMetric(metric, metricCount))}
              </Box>
            );
          })()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DynamicCardRenderer;
