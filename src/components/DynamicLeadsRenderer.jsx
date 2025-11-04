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
  CurrencyRupee,
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
  CurrencyRupee,
  BusinessCenter,
  Edit,
  Email,
  Home,
  Work,
  AccountBalance,
  CreditCard,
};

/**
 * DynamicLeadsRenderer - Renders a leads/cards page from unified schema configuration
 *
 * @param {Object} config - Unified schema configuration with sections
 * @param {Function} onCardClick - Callback when card is clicked
 * @param {Function} onSave - Callback when form is saved
 */
const DynamicLeadsRenderer = ({ config, onCardClick, onSave }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Extract configuration from unified schema sections
  const { title = "Lead Management", sections = [], data = [] } = config;

  // Helper function to get section by componentType
  const getSection = (id) => {
    return sections.find((s) => s.id === id);
  };

  // Get section configurations
  const headerSection = getSection("header_section");
  const searchSection = getSection("search_section");
  const cardListSection = getSection("leads_list_section");
  const dialogSection = getSection("lead_details_dialog");

  // Extract search config
  const search = searchSection?.config || {};

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

    // Filter only form-type sections (in new unified schema format)
    const formSections = sections.filter((s) => s.type === "form" || s.fields);

    // Build mockData from itemData using dataKey mappings
    const mockData = {};
    formSections.forEach((section) => {
      section.fields?.forEach((field) => {
        const fieldId = field.dataKey || field.id;
        if (itemData && itemData[fieldId] !== undefined) {
          mockData[fieldId] = itemData[fieldId];
        }
      });
    });

    // Get disabled state from customer data
    const isCustomerDisabled = itemData?.disabled === true;

    return {
      id: "dialog-form",
      description: "",
      mockData: mockData, // Include the item's data as mockData
      sections: formSections.map((section) => ({
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
          // Disable all fields if customer has disabled: true
          // Otherwise enable/disable based on isEditing state
          disabled: isCustomerDisabled ? true : !isEditing,
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

  // Render header section
  const renderHeaderSection = () => {
    if (!headerSection) return null;

    return (
      <Box
        key={headerSection.id}
        sx={{
          textAlign: "center",
          mb: 3,
          pt: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 1,
          }}
        >
          {headerSection.title || title}
        </Typography>
        {headerSection.subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {headerSection.subtitle}
          </Typography>
        )}
      </Box>
    );
  };

  // Render search section
  const renderSearchSection = () => {
    if (!searchSection) return null;

    const search = searchSection.config || {};

    return (
      <Box
        key={searchSection.id}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: search.maxWidth || 600 }}>
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
              {filteredData.length} {search.countLabel || "item"}(s) found
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Render card list section
  const renderCardListSection = () => {
    if (!cardListSection) return null;

    const cardLayout = cardListSection.config || {};
    const search = searchSection?.config || {};

    return (
      <Box
        key={cardListSection.id}
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
    );
  };

  // Render dialog section
  const renderDialogSection = () => {
    if (!dialogSection) return null;

    const dialog = dialogSection.config || {};
    
    // Get disabled state from customer data
    const isCustomerDisabled = selectedItem?.disabled === true;
    
    // Filter and show only enabled actions based on customer data
    const modifiedActions = dialog.actions
      ? {
          actions: dialog.actions
            .map((action) => {
              // Determine if action should be disabled
              let shouldDisable = false;
              
              if (action.action === "close") {
                // Close is always enabled
                shouldDisable = false;
              } else if (action.action === "assign_to_rm") {
                // assign_to_rm enabled only if customer has assign_to_rm: true
                shouldDisable = !selectedItem?.assign_to_rm;
              } else {
                // Other actions follow customer's general disabled state
                shouldDisable = isCustomerDisabled;
              }
              
              return {
                ...action,
                shouldHide: shouldDisable, // Mark for hiding
              };
            })
            .filter((action) => !action.shouldHide), // Hide disabled actions
        }
      : {};

    return (
      <DynamicDialogRenderer
        key={dialogSection.id}
        open={isDialogOpen}
        onClose={handleCloseDialog}
        dialogConfig={dialog}
        dialogActions={modifiedActions}
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
      />
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 3 }}>
      {/* Render sections dynamically based on config */}
      {sections.map((section) => {
        switch (section.componentType) {
          case "header":
            return renderHeaderSection();
          case "search":
            return renderSearchSection();
          case "cardList":
            return renderCardListSection();
          case "dialog":
            return null; // Dialog is rendered separately
          default:
            return null;
        }
      })}

      {/* Render dialog separately (always present, controlled by state) */}
      {renderDialogSection()}
    </Box>
  );
};

export default DynamicLeadsRenderer;
