"use client";

import React, { useState, useMemo } from "react";
import DynamicFormRenderer from "./dynamic-form/DynamicFormRenderer";
import DynamicDialogRenderer from "./DynamicDialogRenderer";
import DynamicCardRenderer from "./DynamicCardRenderer";
import { getFormSchemaById } from "./dynamic-form/sampleFormSchemas";
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
  ChevronRight,
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
};

/**
 * DynamicLeadsRenderer - Renders a leads/cards page from unified schema configuration
 *
 * @param {Object} config - Unified schema configuration with sections
 * @param {Function} onCardClick - Callback when card is clicked
 * @param {Function} onSave - Callback when form is saved
 */
const DynamicLeadsRenderer = ({ config, onCardClick, onSave, selectedFilter = "all", onFilterChange }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Debug: Log filter changes
  React.useEffect(() => {
    console.log("DynamicLeadsRenderer - selectedFilter changed:", selectedFilter);
  }, [selectedFilter]);

  // Extract configuration from unified schema sections
  const { title = "Lead Management", sections = [], data = [] } = config;

  // Helper function to get section by componentType
  const getSection = (id) => {
    return sections.find((s) => s.id === id);
  };

  // Get section configurations
  const headerSection = getSection("header_section");
  const searchSection = getSection("search_section");
  const filterSection = getSection("filter_section");
  const cardListSection = getSection("leads_list_section");
  const dialogSection = getSection("lead_details_dialog");

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

  // Render header section - Simple clean title
  const renderHeaderSection = () => {
    if (!headerSection) return null;

    return (
      <Box
        key={headerSection.id}
        sx={{
          textAlign: "center",
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
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
              gridAutoRows: "1fr", // Equal height rows
            }}
          >
            {paginatedData.map((item) => (
              <Box key={item[cardLayout.idKey || "id"]} sx={{ display: "flex", flexDirection: "column" }}>
                <DynamicCardRenderer
                  item={item}
                  cardConfig={{
                    avatarKey: cardLayout.header?.avatarKey || "name",
                    nameKey: cardLayout.header?.titleKey || "name",
                    fields: cardLayout.fields || [],
                    showAvatar: cardLayout.header?.showAvatar !== false,
                    actions: cardLayout.actions || {},
                  }}
                  onClick={handleCardClick}
                />
              </Box>
            ))}
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 3 }}>
      {/* Render sections dynamically based on config */}
      {sections.map((section) => {
        switch (section.componentType) {
          case "header":
            return renderHeaderSection();
          case "search":
            return null; // Search is now integrated into filter section
          case "filter":
            return renderFilterSection();
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
