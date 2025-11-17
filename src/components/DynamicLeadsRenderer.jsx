"use client";

import React, { useState, useMemo } from "react";
import DynamicFormRenderer from "./dynamic-form/DynamicFormRenderer";
import DynamicDialogRenderer from "./DynamicDialogRenderer";
import DynamicCardRenderer from "./DynamicCardRenderer";
import RightSidebar from "./RightSidebar";
import { getFormSchemaById } from "./dynamic-form/sampleFormSchemas";
import CustomerVerificationView from "./CustomerVerificationView";
import verificationConfig from "./verificationConfig";
import l1VerificationConfig from "./l1VerificationConfig";
import l2VerificationConfig from "./l2VerificationConfig";
import combinedVerificationConfig from "./combinedVerificationConfig";
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
  Select,
  MenuItem,
  Divider,
  Fab,
  Backdrop,
  Chip,
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
  Fingerprint,
  CheckCircle,
  ArrowForward,
  ChevronLeft,
  FilterList,
  ChevronRight,
  ArrowBack,
  Add,
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
  Fingerprint,
  CheckCircle,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  Add,
};

/**
 * DynamicLeadsRenderer - Renders a leads/cards page from unified schema configuration
 *
 * @param {Object} config - Unified schema configuration with sections
 * @param {Function} onCardClick - Callback when card is clicked
 * @param {Function} onSave - Callback when form is saved
 */
const DynamicLeadsRenderer = ({ config, onCardClick, onSave, selectedFilter = "all", onFilterChange, onCreateNew }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarActiveTab, setSidebarActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Debug: Log filter changes
  React.useEffect(() => {
    console.log("DynamicLeadsRenderer - selectedFilter changed:", selectedFilter);
  }, [selectedFilter]);

  // Extract configuration from unified schema sections
  const { title = "Lead Management", sections = [], data = [] } = config;
  
  console.log("🚀 DynamicLeadsRenderer initialized");
  console.log("📊 Config:", { title, sectionsCount: sections.length, dataCount: data.length });
  console.log("📋 All sections:", sections.map(s => ({ id: s.id, type: s.type, componentType: s.componentType })));

  // Helper function to get section by componentType
  const getSection = (id) => {
    const section = sections.find((s) => s.id === id);
    console.log(`🔍 getSection("${id}"):`, section ? "Found" : "Not found", section);
    return section;
  };

  // Get section configurations
  const headerSection = getSection("header_section");
  const searchSection = getSection("search_section");
  const filterSection = getSection("filter_section");
  const cardListSection = getSection("leads_list_section");
  const dialogSection = getSection("lead_details_dialog");
  
  console.log("📦 Sections loaded:", {
    headerSection: !!headerSection,
    searchSection: !!searchSection,
    filterSection: !!filterSection,
    cardListSection: !!cardListSection,
    dialogSection: !!dialogSection,
  });

  // Extract search config
  const search = searchSection?.config || {};
  const filterConfig = filterSection?.config || {};

  // Get count for each filter
  const getFilterCount = (filterValue) => {
    if (filterValue === "all") return data.length;
    
    const filter = filterConfig.filters.find(f => f.value === filterValue);
    if (!filter || !filter.filterKey) return 0;
    
    if (filterValue === "leads_only") {
      return data.filter(item => !item[filter.filterKey]).length;
    } else {
      return data.filter(item => item[filter.filterKey] === filter.filterValue).length;
    }
  };

  // Filter data based on search query, selected filter, and status filter
  const filteredData = useMemo(() => {
    let result = data;

    // Apply stage filter first
    if (selectedFilter && selectedFilter !== "all" && filterConfig.filters) {
      const activeFilter = filterConfig.filters.find(f => f.value === selectedFilter);
      if (activeFilter && activeFilter.filterKey) {
        if (selectedFilter === "leads_only") {
          // Show only leads without form schema
          result = result.filter(item => !item[activeFilter.filterKey]);
        } else {
          // Show items with specific form schema
          result = result.filter(item => item[activeFilter.filterKey] === activeFilter.filterValue);
        }
      }
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(item => item.approvalStatus === statusFilter);
    }

    // Then apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchFields = search.searchableFields || [];
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(query);
        })
      );
    }

    // Sort: Priority items first (pending status), then others
    result.sort((a, b) => {
      // Pending items come first
      const aIsUrgent = a.approvalStatus === "pending";
      const bIsUrgent = b.approvalStatus === "pending";
      
      if (aIsUrgent && !bIsUrgent) return -1;
      if (!aIsUrgent && bIsUrgent) return 1;
      
      // Then sort rejected items last
      const aIsRejected = a.approvalStatus === "rejected";
      const bIsRejected = b.approvalStatus === "rejected";
      
      if (aIsRejected && !bIsRejected) return 1;
      if (!aIsRejected && bIsRejected) return -1;
      
      return 0;
    });

    return result;
  }, [data, selectedFilter, statusFilter, searchQuery, filterConfig.filters, search.searchableFields]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleCardClick = (item) => {
    console.log("Card clicked:", item);
    setSelectedItem(item);
    setSidebarOpen(true); // Ensure sidebar is open
    
    // If customer has verification data and is pending, enable review mode
    if (item.approvalStatus === "pending" && (
      combinedVerificationConfig.customers[item.mifixId] ||
      l2VerificationConfig.customers[item.mifixId] ||
      l1VerificationConfig.customers[item.mifixId] || 
      verificationConfig.customers[item.mifixId]
    )) {
      setReviewMode(true);
    }
    
    if (onCardClick) {
      onCardClick(item);
    }
  };

  // Move to next customer in the filtered list
  const handleMoveToNext = () => {
    if (!selectedItem || !filteredData || filteredData.length === 0) return;
    
    const currentIndex = filteredData.findIndex(item => item.id === selectedItem.id);
    if (currentIndex === -1) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < filteredData.length) {
      handleCardClick(filteredData[nextIndex]);
    } else {
      // If at the end, optionally close or go to first
      console.log("Reached end of list");
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

  // Render header section - Simple clean title
  const renderHeaderSection = () => {
    console.log("🔍 renderHeaderSection called");
    console.log("📋 headerSection:", headerSection);
    
    if (!headerSection) {
      console.warn("⚠️ No headerSection found!");
      return null;
    }
    
    const headerProps = headerSection.props || {};
    console.log("📦 headerProps:", headerProps);
    
    const showCreateButton = headerProps.showCreateButton;
    console.log("🔘 showCreateButton:", showCreateButton);
    
    const createButtonLabel = headerProps.createButtonLabel || "Create New";
    const createButtonPosition = headerProps.createButtonPosition || "top-right";
    
    console.log("🎯 Button config:", {
      showCreateButton,
      createButtonLabel,
      createButtonPosition
    });

    return (
      <Box
        key={headerSection.id}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: createButtonPosition === "top-right" ? "space-between" : "center",
          mb: 3,
          px: 3,
          pt: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
            letterSpacing: 0.5,
          }}
        >
          {headerSection.title || title}
        </Typography>
        
        {showCreateButton && createButtonPosition === "top-right" && (() => {
          console.log("✅ Rendering Create button");
          return (
            <Button
              variant="contained"
              startIcon={renderIcon("Add")}
              onClick={() => {
                console.log("🎉 Create button clicked!");
                if (onCreateNew) {
                  onCreateNew();
                } else {
                  console.warn("⚠️ No onCreateNew callback provided");
                }
              }}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textTransform: "none",
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a4293 100%)",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.35)",
                },
              }}
            >
              {createButtonLabel}
            </Button>
          );
        })()}
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
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
              },
            }}
          />
          {/* {search.showCount && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              {filteredData.length} {search.countLabel || "item"}(s) found
            </Typography>
          )} */}
        </Box>
      </Box>
    );
  };

  // Get counts for status filters
  const getStatusCount = (status) => {
    if (status === "all") return data.length;
    return data.filter(item => item.approvalStatus === status).length;
  };

  // Render filter section
  const renderFilterSection = () => {
    if (!filterSection) return null;

    const filters = filterConfig.filters || [];
    const statusFilters = [
      { id: "all", label: "All", value: "all", color: theme.palette.primary.main },
      { id: "pending", label: "Pending", value: "pending", color: "#ed6c02" }, // Orange/Yellow
      { id: "approved", label: "Approved", value: "approved", color: "#2e7d32" }, // Green
      { id: "rejected", label: "Rejected", value: "rejected", color: "#d32f2f" }, // Red
    ];

    return (
      <Box
        key={filterSection.id}
        sx={{
          mb: 3,
          px: 3,
        }}
      >
        {/* Floating Filter Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 3,
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
          }}
        >
          {/* Left: Search */}
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.5,
                display: "block",
              }}
            >
              Search
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={search.placeholder || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {renderIcon(search.startIcon || "Search", {
                      sx: { color: theme.palette.text.secondary, fontSize: 20 },
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
                "& .MuiOutlinedInput-root": {
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& fieldset": {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  },
                },
              }}
            />
          </Box>

          {/* Divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Middle: Stage Filters */}
          <Box sx={{ flex: 1.5, minWidth: 300 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.5,
                display: "block",
              }}
            >
              Stage
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {filters.map((filter) => {
                const count = getFilterCount(filter.value);
                const isActive = selectedFilter === filter.value;
                
                return (
                  <Box
                    key={filter.id}
                    onClick={() => onFilterChange && onFilterChange(filter.value)}
                    sx={{
                      cursor: "pointer",
                      px: 2.5,
                      py: 1,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      transition: "all 0.15s ease",
                      bgcolor: isActive 
                        ? theme.palette.primary.main
                        : alpha(theme.palette.divider, 0.04),
                      "&:hover": {
                        bgcolor: isActive
                          ? theme.palette.primary.dark
                          : alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isActive ? 600 : 500,
                        color: isActive 
                          ? "#ffffff"
                          : theme.palette.text.primary,
                        fontSize: "0.813rem",
                      }}
                    >
                      {filter.label}
                    </Typography>
                    <Box
                      sx={{
                        minWidth: 22,
                        height: 20,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isActive
                          ? alpha("#ffffff", 0.25)
                          : alpha(theme.palette.text.secondary, 0.08),
                        px: 0.75,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: isActive 
                            ? "#ffffff"
                            : theme.palette.text.secondary,
                          fontSize: "0.7rem",
                        }}
                      >
                        {count}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Right: Approval Status Filters */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.5,
                display: "block",
              }}
            >
              Approval Status
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {statusFilters.map((filter) => {
                const count = getStatusCount(filter.value);
                const isActive = statusFilter === filter.value;
                
                return (
                  <Box
                    key={filter.id}
                    onClick={() => {
                      setStatusFilter(filter.value);
                      setPage(1); // Reset to first page when filter changes
                    }}
                    sx={{
                      cursor: "pointer",
                      px: 2.5,
                      py: 1,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      transition: "all 0.15s ease",
                      bgcolor: isActive 
                        ? filter.color
                        : alpha(filter.color, 0.08),
                      border: `1.5px solid ${isActive ? filter.color : alpha(filter.color, 0.3)}`,
                      "&:hover": {
                        bgcolor: isActive
                          ? alpha(filter.color, 0.9)
                          : alpha(filter.color, 0.15),
                        borderColor: filter.color,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isActive ? 600 : 600,
                        color: isActive 
                          ? "#ffffff"
                          : filter.color,
                        fontSize: "0.813rem",
                      }}
                    >
                      {filter.label}
                    </Typography>
                    <Box
                      sx={{
                        minWidth: 22,
                        height: 20,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isActive
                          ? alpha("#ffffff", 0.25)
                          : alpha(filter.color, 0.15),
                        px: 0.75,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: isActive 
                            ? "#ffffff"
                            : filter.color,
                          fontSize: "0.7rem",
                        }}
                      >
                        {count}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render card list section
  const renderCardListSection = () => {
    if (!cardListSection) return null;

    const cardLayout = cardListSection.config || {};
    const search = searchSection?.config || {};
    
    console.log("🎨 Rendering card list section");

    return (
      <Box
        key={cardListSection.id}
        sx={{
          width: "100%",
          mx: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Render Header Section with Create Button */}
        {renderHeaderSection()}
        
        {filteredData.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
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
          <Box
            sx={{
              display: "grid",
              // Use auto-fit with minmax for responsive columns that adapt to container width
              gridTemplateColumns: {
                xs: "1fr", // Single column on mobile
                sm: `repeat(auto-fit, minmax(min(${config.layout?.cardGrid?.minCardWidth || 340}px, 100%), 1fr))`, // Auto-fit on tablet and up with min() for better responsiveness
              },
              gap: config.layout?.cardGrid?.gap || 2,
              gridAutoRows: config.layout?.cardGrid?.autoRows || "1fr",
              // Ensure proper card sizing
              "& > *": {
                width: "100%",
                maxWidth: "100%",
              },
            }}
          >
            {paginatedData.map((item, index) => {
              if (index === 0) {
                console.log("🃏 First card config:", {
                  cardLayout,
                  actionButton: cardLayout.actionButton,
                  badge: cardLayout.badge,
                });
              }
              
              return (
                <Box key={item[cardLayout.idKey || "id"]} sx={{ display: "flex", flexDirection: "column" }}>
                  <DynamicCardRenderer
                    item={item}
                    selectedItem={selectedItem}
                    cardConfig={{
                      avatarKey: cardLayout.header?.avatarKey || "avatarUrl",
                      avatarFallbackKey: cardLayout.header?.avatarFallbackKey || "name",
                      nameKey: cardLayout.header?.titleKey || "name",
                      subtitleKey: cardLayout.header?.subtitleKey || "mifixId",
                      fields: cardLayout.fields || [],
                      metrics: cardLayout.metrics || [],
                      showAvatar: cardLayout.header?.showAvatar !== false,
                      cardStyle: cardLayout.cardStyle || "modern",
                      actions: cardLayout.actions || {},
                      actionButton: cardLayout.actionButton, // Pass actionButton config
                      badge: cardLayout.badge, // Pass badge config
                    }}
                    onClick={handleCardClick}
                    isSelected={selectedItem?.id === item.id}
                  />
                </Box>
              );
            })}
          </Box>
        )}

        {/* Pagination - Extreme Bottom */}
        {filteredData.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 5,
              mb: 2,
              px: 2,
            }}
          >
            {/* Items per page selector */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Show:
              </Typography>
              <Select
                size="small"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(e.target.value);
                  setPage(1);
                }}
                sx={{
                  minWidth: 70,
                  bgcolor: alpha("#fafafa", 0.8),
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(theme.palette.divider, 0.15),
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <MenuItem value={8}>8</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
              <Typography variant="body2" color="text.secondary">
                per page
              </Typography>
            </Box>

            {/* Page navigation */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  sx={{
                    bgcolor: alpha("#fafafa", 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "&:disabled": {
                      bgcolor: alpha("#fafafa", 0.5),
                    },
                  }}
                >
                  {renderIcon("ChevronLeft")}
                </IconButton>
            
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <IconButton
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      sx={{
                        minWidth: 36,
                        height: 36,
                        bgcolor: page === pageNum 
                          ? theme.palette.primary.main 
                          : alpha("#fafafa", 0.8),
                        color: page === pageNum 
                          ? "#ffffff" 
                          : theme.palette.text.primary,
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        fontWeight: page === pageNum ? 600 : 400,
                        fontSize: "0.875rem",
                        "&:hover": {
                          bgcolor: page === pageNum
                            ? theme.palette.primary.dark
                            : alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {pageNum}
                    </IconButton>
                  );
                } else if (
                  pageNum === page - 2 ||
                  pageNum === page + 2
                ) {
                  return <Typography key={pageNum} sx={{ px: 1, color: "text.disabled" }}>...</Typography>;
                }
                return null;
              })}
            </Box>

                <IconButton
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  sx={{
                    bgcolor: alpha("#fafafa", 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "&:disabled": {
                      bgcolor: alpha("#fafafa", 0.5),
                    },
                  }}
                >
                  {renderIcon("ChevronRight")}
                </IconButton>
              </Box>
            )}

            {/* Results summary on right */}
            <Typography variant="body2" color="text.secondary">
              Showing {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, filteredData.length)} of {filteredData.length}
            </Typography>
          </Box>
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
    
    // Check if customer has form schemas (array of all previous forms)
    const customerFormSchemas = selectedItem?.formSchemas || [];
    const customerFormSchemaId = selectedItem?.formSchemaId;
    
    // Get all form schemas to display
    const allFormSchemas = customerFormSchemas.length > 0
      ? customerFormSchemas.map(schemaId => getFormSchemaById(schemaId)).filter(Boolean)
      : [];
    
    // Determine which schema to use
    let schemaToUse = null;
    let schemasToRender = [];
    
    if (allFormSchemas.length > 0) {
      // Use all the form schemas from the array
      schemasToRender = allFormSchemas;
    } else if (selectedItem && dialog.sections) {
      // No form schema, show lead details
      schemaToUse = convertToFormSchema(dialog.sections, selectedItem);
    }
    
    // Filter and show only enabled actions based on customer data
    const modifiedActions = dialog.actions
      ? {
          actions: dialog.actions
            .map((action) => {
              // Determine if action should be hidden
              let shouldHide = false;
              
              if (customerFormSchemaId) {
                // Customer has a form schema (L1, L2, KCC, Bank, eSign)
                // Show Accept/Reject, hide Assign to RM
                if (action.action === "accept" || action.action === "reject") {
                  shouldHide = false;
                } else if (action.action === "assign_to_rm") {
                  shouldHide = true;
                }
              } else {
                // Customer is leads only (no form schema)
                // Show Assign to RM, hide Accept/Reject
                if (action.action === "assign_to_rm") {
                  shouldHide = false;
                } else if (action.action === "accept" || action.action === "reject") {
                  shouldHide = true;
                }
              }
              
              return {
                ...action,
                shouldHide,
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
        formSchema={schemaToUse}
        formSchemas={schemasToRender}
        onSubmit={(formData) => {
          if (onSave) {
            onSave({ ...selectedItem, ...formData });
          }
          setIsEditing(false);
        }}
      />
    );
  };

  const sidebarWidth = config.sidebar?.width || { xs: "100%", sm: 440, md: 485, lg: 550, xl: 645 };
  
  // Calculate responsive margin for content area
  const contentMargin = typeof sidebarWidth === 'object' 
    ? {
        xs: 0,
        sm: 0, 
        md: 0,
        lg: `${sidebarWidth.lg}px`,
        xl: `${sidebarWidth.xl}px`,
      }
    : { xs: 0, lg: sidebarWidth };
  
  return (
    <Box sx={{ 
      position: "fixed",
      top: 64, // Below navbar
      left: { xs: 0, md: 240 }, // Account for left sidebar (240px standard drawer width)
      right: 0,
      bottom: 0,
      bgcolor: "#fafafa", // Off-white subtle background
      display: "flex",
      overflow: "hidden", // Prevent any scroll
    }}>
      {/* Main Content Area - Fixed Container */}
      <Box sx={{ 
        flex: 1, 
        minWidth: 0,
        marginRight: contentMargin,
        pl: { xs: 0, md: 3 }, // Left gap from sidebar (24px)
        pr: { xs: 0, lg: 3 }, // Right gap from Control Panel (24px)
        height: "100%",
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden", // Container doesn't scroll
        // Ensure proper width calculation
        width: { 
          xs: "100%", 
          lg: `calc(100% - ${typeof sidebarWidth === 'object' ? sidebarWidth.lg : sidebarWidth}px)` 
        },
      }}>
        {/* Search Bar - Centered and Compact (Hidden in review mode) */}
        {!reviewMode && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            p: { xs: 2, sm: 2, md: 3, lg: 3 },
            pb: 2,
          }}
        >
        <Box
          sx={{
            width: "100%",
            maxWidth: "600px", // Limit width for better UX
            p: 1,
            bgcolor: "#fafafa", // Off-white subtle background
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, address, requirement, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: "0.875rem",
                bgcolor: "transparent",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none", // Remove border, parent has border
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {renderIcon("Search", {
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
          />
        </Box>
        </Box>
        )}

        {/* Main Content - Scrollable Area */}
        <Box sx={{ 
          flex: 1, 
          overflowY: "auto", 
          px: selectedItem ? 0 : { xs: 2, sm: 2, md: 3, lg: 3 },
          py: selectedItem ? 0 : 2,
        }}>
          {reviewMode ? (
            <Box sx={{ display: "flex", height: "100%", gap: { xs: 2, lg: 2.5, xl: 3 }, p: { xs: 2, lg: 2.5, xl: 3 }, overflow: "hidden" }}>
              {/* Customer List Sidebar */}
              <Box
                sx={{
                  width: { lg: 340, xl: 380 },
                  minWidth: { lg: 340, xl: 380 },
                  maxWidth: 380,
                  bgcolor: "white",
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`,
                  flexShrink: 0,
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  p: 2.5, 
                  bgcolor: "white", 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <IconButton 
                      onClick={() => setReviewMode(false)} 
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                      }}
                    >
                      <ArrowBack fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      Verification Queue
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    {filteredData.filter(item => item.approvalStatus === "pending").length} customers pending review
                  </Typography>
                  
                  {/* Search inside queue */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Customer List */}
                <Box sx={{ 
                  flex: 1, 
                  overflow: "auto", 
                  px: 1.5, 
                  py: 1,
                  bgcolor: alpha(theme.palette.grey[50], 0.3),
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}>
                  {filteredData
                    .filter(item => item.approvalStatus === "pending")
                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.mifixId.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <Box
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          cursor: "pointer",
                          bgcolor: selectedItem?.id === item.id ? "white" : alpha(theme.palette.grey[50], 0.3),
                          border: selectedItem?.id === item.id 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          boxShadow: selectedItem?.id === item.id 
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
                              bgcolor: selectedItem?.id === item.id 
                                ? theme.palette.primary.main 
                                : alpha(theme.palette.primary.main, 0.12),
                              color: selectedItem?.id === item.id ? "white" : theme.palette.primary.main,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "1rem",
                              flexShrink: 0,
                              transition: "all 0.2s",
                            }}
                          >
                            {item.name.charAt(0)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: "0.95rem",
                                color: selectedItem?.id === item.id ? theme.palette.primary.main : "inherit",
                                mb: 0.25,
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                              {item.mifixId}
                            </Typography>
                          </Box>
                          <Chip
                            label="Review"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main,
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

              {/* Main Verification View */}
              <Box sx={{ 
                flex: 1, 
                minWidth: 0,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
                {selectedItem ? (
                  <CustomerVerificationView
                    verificationData={
                      combinedVerificationConfig.customers[selectedItem.mifixId] ||
                      l2VerificationConfig.customers[selectedItem.mifixId] ||
                      l1VerificationConfig.customers[selectedItem.mifixId] || 
                      verificationConfig.customers[selectedItem.mifixId]
                    }
                    activeSectionId={activeSectionId}
                    setActiveSectionId={setActiveSectionId}
                    onFieldVerify={(fieldId, status) => {
                      console.log("Field verified:", fieldId, status);
                    }}
                    onBack={(action) => {
                      if (action?.action === 'openComments') {
                        setSidebarOpen(true);
                        setSidebarActiveTab(1); // Switch to Customer View tab (index 1)
                      }
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="h6">Select a customer to start verification</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            renderCardListSection()
          )}
        </Box>
      </Box>

      {/* Right: Control Panel - Fixed Sidebar (Always Visible on Desktop) */}
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          height: config.sidebar?.maxHeight || "calc(100vh - 64px)",
          position: config.sidebar?.position || "fixed",
          top: config.sidebar?.top || 64,
          right: config.sidebar?.right || 0,
          zIndex: { xs: sidebarOpen ? 1200 : -1, lg: 100 },
          display: { xs: sidebarOpen ? "block" : "none", lg: "block" },
          boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
          overflow: "hidden", // Prevent sidebar from scrolling
        }}
      >
          <RightSidebar
            config={config.sidebar || {}}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            selectedFilter={selectedFilter}
            onFilterChange={onFilterChange}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            dialogConfig={dialogSection}
            onSave={onSave}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            activeTab={sidebarActiveTab}
            onTabChange={setSidebarActiveTab}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            onMoveToNext={handleMoveToNext}
          />
      </Box>

      {/* Backdrop for Mobile Sidebar */}
      <Backdrop
        open={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        sx={{
          zIndex: 1199,
          display: { xs: "block", lg: "none" },
          bgcolor: alpha("#000", 0.5),
        }}
      />

      {/* Floating Action Button - Mobile Control Panel Toggle */}
      <Fab
        color="primary"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          display: { xs: "flex", lg: "none" }, // Show only on mobile/tablet
          zIndex: 1100,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          "&:hover": {
            transform: "scale(1.1)",
            boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
          transition: "all 0.3s",
        }}
      >
        <FilterList />
      </Fab>

      {/* Dialog is now rendered inside Control Panel as Customer View tab */}
    </Box>
  );
};

export default DynamicLeadsRenderer;
