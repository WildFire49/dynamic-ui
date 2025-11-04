"use client";

import React, { useState, useMemo } from "react";
import DynamicFormRenderer from "./dynamic-form/DynamicFormRenderer";
import DynamicDialogRenderer from "./DynamicDialogRenderer";
import DynamicCardRenderer from "./DynamicCardRenderer";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Search,
  Close,
  Phone,
  LocationOn,
  Person,
  AttachMoney,
  BusinessCenter,
  Edit,
  Email,
  Home,
  Work,
  AccountBalance,
  CreditCard,
} from "@mui/icons-material";

// Icon mapping
const iconMap = {
  Search,
  Close,
  Phone,
  LocationOn,
  Person,
  AttachMoney,
  BusinessCenter,
  Edit,
  Email,
  Home,
  Work,
  AccountBalance,
  CreditCard,
};

/**
 * DynamicLeadsRenderer - Renders a leads/cards page from JSON configuration
 *
 * @param {Object} config - Page configuration
 * @param {Array} data - Data array for cards
 * @param {Function} onCardClick - Callback when card is clicked
 * @param {Function} onSave - Callback when form is saved
 */
const DynamicLeadsRenderer = ({ config, onCardClick, onSave }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const data = config.data;
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Extract configuration
  const {
    title = "Lead Management",
    search = {},
    cardLayout = {},
    dialog = {},
    dialogActions = {},
  } = config;

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const searchFields = search.searchableFields || [];

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(query);
      })
    );
  }, [searchQuery, data, search.searchableFields]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
    setIsEditing(false);
    if (onCardClick) {
      onCardClick(item);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setIsEditing(false);
  };

  const renderIcon = (iconName, props = {}) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent {...props} /> : null;
  };

  // Convert dialog sections to DynamicFormRenderer schema format
  const convertToFormSchema = (sections, itemData) => {
    if (!sections || !Array.isArray(sections)) return null;

    // Build mockData from itemData using dataKey mappings
    const mockData = {};
    sections.forEach((section) => {
      section.fields?.forEach((field) => {
        const fieldId = field.dataKey || field.id;
        if (itemData && itemData[fieldId] !== undefined) {
          mockData[fieldId] = itemData[fieldId];
        }
      });
    });

    return {
      id: "dialog-form",
      description: "",
      mockData: mockData, // Include the item's data as mockData
      expandAll: true, // Expand all sections in dialog view
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        subtitle: section.subtitle || "",
        icon: section.icon || "person",
        fields: section.fields.map((field) => ({
          id: field.dataKey || field.id, // Use dataKey as field id for form data mapping
          type: field.type || "text", // Default to text if not specified
          label: field.label,
          placeholder: field.placeholder || "",
          required: field.required || false,
          // If field has disabled: true in config, keep it always disabled
          // Otherwise, enable/disable based on isEditing state
          disabled: field.disabled === true ? true : !isEditing,
          multiline: field.multiline || false,
          rows: field.rows || 1,
          options: field.options || [],
          validation: field.validation || {},
          icon: field.icon,
          // Pass through any additional field properties
          ...field,
        })),
      })),
    };
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 3 }}>
      {/* Search Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
          pt: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: search.maxWidth || 600 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 3,
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            {title}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={search.placeholder || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {renderIcon(search.startIcon || "Search", {
                    sx: { color: theme.palette.text.secondary },
                  })}
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    {renderIcon("Close", { fontSize: "small" })}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          {search.showCount && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              {filteredData.length} {search.countLabel || "item"}
              {filteredData.length !== 1 ? "s" : ""} found
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1600,
          mx: "auto",
          px: 2,
        }}
      >
        {filteredData.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            {renderIcon("Search", {
              sx: { fontSize: 64, color: theme.palette.text.disabled, mb: 2 },
            })}
            <Typography variant="h6" color="text.secondary">
              {search.emptyMessage || "No items found"}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {search.emptyHint || "Try adjusting your search criteria"}
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: `repeat(${1}, 1fr)`,
                sm: `repeat(${2}, 1fr)`,
                md: `repeat(${3}, 1fr)`,
                lg: `repeat(${4}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {filteredData.map((item) => (
              <Grid item key={item[cardLayout.idKey || "id"]}>
                <DynamicCardRenderer
                  item={item}
                  cardConfig={{
                    avatarKey: cardLayout.header?.avatarKey || "name",
                    nameKey: cardLayout.header?.titleKey || "name",
                    fields: cardLayout.fields || [],
                    showAvatar: cardLayout.header?.showAvatar !== false,
                  }}
                  onClick={handleCardClick}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <DynamicDialogRenderer
        open={isDialogOpen}
        onClose={handleCloseDialog}
        dialogConfig={dialog}
        dialogActions={dialogActions}
        selectedItem={selectedItem}
        formSchema={
          selectedItem && dialog.sections
            ? convertToFormSchema(dialog.sections, selectedItem)
            : null
        }
        onSubmit={(formData) => {
          if (onSave) {
            onSave({ ...selectedItem, ...formData });
          }
          setIsEditing(false);
        }}
        // onActionClick={handleDialogAction}
      />
    </Box>
  );
};

export default DynamicLeadsRenderer;
