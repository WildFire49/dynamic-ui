"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { ArrowBack, Search } from "@mui/icons-material";

/**
 * StageQueuePanel - Reusable component for showing a list of items in different stages
 * Can be used for verification queue, product configuration stages, etc.
 * 
 * @param {Object} config - Configuration from JSON
 * @param {Array} items - List of items to display
 * @param {Object} selectedItem - Currently selected item
 * @param {Function} onItemSelect - Callback when item is selected
 * @param {Function} onBack - Callback when back button is clicked
 * @param {String} searchQuery - Search query string
 * @param {Function} onSearchChange - Callback when search changes
 */
const StageQueuePanel = ({
  config = {},
  items = [],
  selectedItem,
  onItemSelect,
  onBack,
  searchQuery = "",
  onSearchChange,
}) => {
  const theme = useTheme();

  const {
    title = "Queue",
    subtitle = "items pending",
    searchPlaceholder = "Search...",
    itemDisplayFields = {
      primary: "name",
      secondary: "id",
      avatar: "name",
    },
    statusField = "status",
    statusChipLabel = "Review",
    statusChipColor = "warning",
  } = config;

  const getInitial = (text) => {
    if (!text) return "?";
    return text.charAt(0).toUpperCase();
  };

  return (
    <Box
      sx={{
        width: 320,
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <IconButton
            onClick={onBack}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
            }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {title}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2 }}
        >
          {items.length} {subtitle}
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              borderRadius: 2,
              fontSize: "0.875rem",
            },
          }}
        />
      </Box>

      {/* Item List */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 1.5,
          py: 1,
          bgcolor: alpha(theme.palette.grey[50], 0.3),
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        {items
          .filter((item) => {
            if (!searchQuery) return true;
            const primary = item[itemDisplayFields.primary]?.toLowerCase() || "";
            const secondary = item[itemDisplayFields.secondary]?.toLowerCase() || "";
            return (
              primary.includes(searchQuery.toLowerCase()) ||
              secondary.includes(searchQuery.toLowerCase())
            );
          })
          .map((item) => (
            <Box
              key={item.id}
              onClick={() => onItemSelect && onItemSelect(item)}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor:
                  selectedItem?.id === item.id
                    ? "white"
                    : alpha(theme.palette.grey[50], 0.3),
                border:
                  selectedItem?.id === item.id
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                boxShadow:
                  selectedItem?.id === item.id
                    ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                    : "none",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "white",
                  boxShadow: `0 2px 6px ${alpha(theme.palette.grey[500], 0.1)}`,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor:
                      selectedItem?.id === item.id
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.12),
                    color:
                      selectedItem?.id === item.id
                        ? "white"
                        : theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1rem",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  {getInitial(item[itemDisplayFields.avatar])}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color:
                        selectedItem?.id === item.id
                          ? theme.palette.primary.main
                          : "inherit",
                      mb: 0.25,
                    }}
                  >
                    {item[itemDisplayFields.primary]}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    {item[itemDisplayFields.secondary]}
                  </Typography>
                </Box>
                <Chip
                  label={statusChipLabel}
                  size="small"
                  color={statusChipColor}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                    px: 0.5,
                  }}
                />
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default StageQueuePanel;
