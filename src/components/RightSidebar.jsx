import React, { useState } from "react";
import {
  Box,
  Drawer,
  Typography,
  Tabs,
  Tab,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  alpha,
  useTheme,
  Button,
} from "@mui/material";
import DynamicFormRenderer from "./dynamic-form/DynamicFormRenderer";
import { getFormSchemaById } from "./dynamic-form/sampleFormSchemas";
import CustomerVerificationPanel from "./CustomerVerificationPanel";
import { verificationConfig } from "./verificationConfig";
import {
  Dashboard,
  Message,
  Chat,
  Notifications,
  FilterList,
  Close,
  Circle,
  CheckCircle,
  Error,
  Warning,
} from "@mui/icons-material";

/**
 * Right Sidebar Component with Tabbed Navigation
 * @param {Object} config - Sidebar configuration from JSON
 * @param {Boolean} open - Sidebar open state
 * @param {Function} onClose - Close sidebar callback
 */
const RightSidebar = ({ 
  config = {}, 
  open = false, 
  onClose,
  selectedFilter = "all",
  onFilterChange,
  statusFilter = "all",
  setStatusFilter,
  selectedItem,
  setSelectedItem,
  dialogConfig,
  onSave,
  isEditing,
  setIsEditing,
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const theme = useTheme();
  // Use external activeTab if provided, otherwise use internal state
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // Switch to Customer View when item is selected
  React.useEffect(() => {
    if (selectedItem) {
      setActiveTab(1); // Switch to Customer View tab
    }
  }, [selectedItem]);

  const {
    width = 360,
    tabs = [],
  } = config;

  const iconMap = {
    Dashboard,
    Message,
    Chat,
    Notifications,
    FilterList,
    Circle,
    CheckCircle,
    Error,
    Warning,
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = (tab) => {
    switch (tab.type) {
      case "control_panel":
        return renderControlPanel(tab);
      case "messages":
        return renderMessages(tab);
      case "chat":
        return renderChat(tab);
      case "alerts":
        return renderAlerts(tab);
      case "filters":
        return renderFilters(tab);
      default:
        return null;
    }
  };

  const renderControlPanel = (tab) => {
    // Stage filters with counts
    const stageFilters = [
      { label: "All Customers", value: "all", count: 16, color: theme.palette.primary.main },
      { label: "Leads Only", value: "leads_only", count: 2, color: theme.palette.info.main },
      { label: "L1 Submitted", value: "l1_submitted", count: 3, color: theme.palette.success.light },
      { label: "L2 Submitted", value: "l2_submitted", count: 4, color: theme.palette.warning.main },
      { label: "Bank Details", value: "bank_details", count: 2, color: theme.palette.secondary.main },
      { label: "eSign Pending", value: "esign_pending", count: 5, color: theme.palette.error.light },
    ];

    const approvalFilters = [
      { label: "All", value: "all", count: 16, color: theme.palette.grey[600] },
      { label: "Pending", value: "pending", count: 7, color: "#ed6c02" },
      { label: "Approved", value: "approved", count: 4, color: "#2e7d32" },
      { label: "Rejected", value: "rejected", count: 5, color: "#d32f2f" },
    ];

    // Data-driven alerts with customer references
    const alerts = [
      { 
        title: "L2 Pending - Urgent", 
        message: "3 applications pending for more than 2 hours", 
        severity: "error", 
        icon: "Warning",
        stage: "L2 Submitted",
        count: 3,
        customerIds: ["JL_HD_CH_810", "IL_HD_AH_305", "JL_HD_JP_507"]
      },
      { 
        title: "eSign Pending", 
        message: "5 customers waiting for eSign completion", 
        severity: "warning", 
        icon: "Warning",
        stage: "eSign Pending",
        count: 5,
        customerIds: ["AG_HD_DA_6969", "AG_HD_TV_1215"]
      },
      { 
        title: "Document Expired", 
        message: "KYC documents for 2 customers need renewal", 
        severity: "error", 
        icon: "Error",
        stage: "Bank Details",
        count: 2,
        customerIds: ["IL_HD_NG_1013", "JL_HD_CH_912"]
      },
      { 
        title: "Target Achieved", 
        message: "Monthly disbursement target of ₹2Cr reached!", 
        severity: "success", 
        icon: "CheckCircle"
      },
    ];

    // Activity History - Recent actions
    const activityHistory = [
      { user: "You", action: "approved", customer: "Rajesh Kumar", time: "5 mins ago", id: "JL_HD_CH_912" },
      { user: "You", action: "rejected", customer: "Priya Deshmukh", time: "15 mins ago", id: "IL_HD_NG_1013" },
      { user: "You", action: "approved", customer: "Devanshi Mehta", time: "1 hour ago", id: "JL_HD_JP_507" },
      { user: "System", action: "moved to L2", customer: "Arjun Patel", time: "2 hours ago", id: "IL_HD_AH_305" },
    ];

    const controlPanelConfig = config.controlPanel || {};
    const filterColumns = controlPanelConfig.filterColumns || { xs: 1, sm: 2, md: 2 };
    const isCompact = controlPanelConfig.compactMode || { xs: true, sm: true, md: false };
    
    return (
      <Box sx={{ 
        px: 1.5, 
        py: 1.5,
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Filters Section - Responsive Grid */}
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: {
            xs: `repeat(${filterColumns.xs || 1}, 1fr)`,
            sm: `repeat(${filterColumns.sm || 2}, 1fr)`,
            md: `repeat(${filterColumns.md || 2}, 1fr)`,
          },
          gap: 1.5, 
          mb: 2,
          flexShrink: 0,
        }}>
          {/* Stage Filters - Left Column */}
          <Box sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 1.5,
          }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1,
                display: "block",
                fontSize: "0.7rem",
              }}
            >
              Filter by Stage
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {stageFilters.map((filter) => {
                const isActive = selectedFilter === filter.value;
                return (
                  <Box
                    key={filter.value}
                    onClick={() => onFilterChange && onFilterChange(filter.value)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      p: 0.75,
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor: isActive ? alpha(filter.color, 0.12) : "transparent",
                      border: `1px solid ${isActive ? filter.color : "transparent"}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(filter.color, 0.1),
                        transform: "translateX(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: filter.color,
                        flexShrink: 0,
                        boxShadow: isActive ? `0 0 0 3px ${alpha(filter.color, 0.2)}` : "none",
                      }}
                    />
                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: "0.813rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? filter.color : "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      {filter.label}
                    </Typography>
                    <Box
                      sx={{
                        minWidth: 24,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isActive ? filter.color : alpha(theme.palette.text.secondary, 0.08),
                        color: isActive ? "#ffffff" : "text.secondary",
                        borderRadius: 0.75,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        px: 0.75,
                      }}
                    >
                      {filter.count}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Approval Status Filters - Right Column */}
          <Box sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 1.5,
          }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1,
                display: "block",
                fontSize: "0.7rem",
              }}
            >
              Approval Status
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {approvalFilters.map((filter) => {
                const isActive = statusFilter === filter.value;
                return (
                  <Box
                    key={filter.value}
                    onClick={() => setStatusFilter && setStatusFilter(filter.value)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      p: 0.75,
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor: isActive ? alpha(filter.color, 0.12) : "transparent",
                      border: `1px solid ${isActive ? filter.color : "transparent"}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(filter.color, 0.1),
                        transform: "translateX(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: filter.color,
                        flexShrink: 0,
                        boxShadow: isActive ? `0 0 0 3px ${alpha(filter.color, 0.2)}` : "none",
                      }}
                    />
                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: "0.813rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? filter.color : "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      {filter.label}
                    </Typography>
                    <Box
                      sx={{
                        minWidth: 24,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isActive ? filter.color : alpha(theme.palette.text.secondary, 0.08),
                        color: isActive ? "#ffffff" : "text.secondary",
                        borderRadius: 0.75,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        px: 0.75,
                      }}
                    >
                      {filter.count}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Divider before Alerts */}
        <Divider sx={{ my: 2 }} />

        {/* Alerts Section */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 1.5,
            display: "block",
            fontSize: "0.7rem",
          }}
        >
          Alerts & Notifications
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {alerts.map((alert, index) => {
            const alertColor = 
              alert.severity === "error" ? theme.palette.error.main
              : alert.severity === "warning" ? theme.palette.warning.main
              : alert.severity === "success" ? theme.palette.success.main
              : theme.palette.info.main;
            
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(alertColor, 0.08),
                  border: `1px solid ${alpha(alertColor, 0.15)}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: alpha(alertColor, 0.12),
                    transform: "translateX(-2px)",
                  },
                }}
              >
                {/* Alert Icon/Indicator */}
                <Box
                  sx={{
                    width: 6,
                    minWidth: 6,
                    borderRadius: 1,
                    bgcolor: alertColor,
                    flexShrink: 0,
                  }}
                />
                
                {/* Alert Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.813rem",
                      fontWeight: 600,
                      color: alertColor,
                      mb: 0.25,
                      lineHeight: 1.3,
                    }}
                  >
                    {alert.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      lineHeight: 1.4,
                    }}
                  >
                    {alert.message}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Divider before Activity History */}
        <Divider sx={{ my: 2 }} />

        {/* Activity History Section */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 1.5,
            display: "block",
            fontSize: "0.7rem",
          }}
        >
          Activity History
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {activityHistory.map((activity, index) => {
            const actionColor = 
              activity.action === "approved" ? theme.palette.success.main
              : activity.action === "rejected" ? theme.palette.error.main
              : theme.palette.info.main;
            
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 0.75,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.divider, 0.03),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                {/* Action Indicator */}
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: actionColor,
                    flexShrink: 0,
                  }}
                />
                
                {/* Activity Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.primary",
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>{activity.user}</strong> {activity.action}{" "}
                    <span style={{ color: actionColor, fontWeight: 600 }}>
                      {activity.customer}
                    </span>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: "text.secondary",
                      lineHeight: 1.2,
                    }}
                  >
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderCustomerView = () => {
    if (!selectedItem) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            Select a customer to view verification details
          </Typography>
        </Box>
      );
    }

    // Get verification data for this customer
    const verificationData = verificationConfig.customers[selectedItem.mifixId];

    if (!verificationData) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No verification data available for this customer
          </Typography>
        </Box>
      );
    }

    return (
      <CustomerVerificationPanel
        verificationData={verificationData}
        onAction={(action, data) => {
          console.log("Verification action:", action, data);
          if (onSave) {
            onSave({ ...selectedItem, verificationAction: action, ...data });
          }
        }}
      />
    );
  };

  const renderMessages = (tab) => {
    const messages = tab.messages || [];
    return (
      <List sx={{ px: 2, py: 1 }}>
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              sx={{
                borderRadius: 2,
                mb: 1,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {msg.sender}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {msg.time}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {msg.message}
                    </Box>
                    {!msg.read && (
                      <Chip
                        label="New"
                        size="small"
                        color="error"
                        sx={{ height: 18, fontSize: "0.65rem", mt: 0.5 }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < messages.length - 1 && <Divider sx={{ my: 0.5 }} />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderChat = (tab) => {
    const chats = tab.chats || [];
    return (
      <List sx={{ px: 2, py: 1 }}>
        {chats.map((chat, index) => (
          <ListItem
            key={index}
            sx={{
              borderRadius: 2,
              mb: 1,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" fontWeight={600}>
                    {chat.name}
                  </Typography>
                  {chat.unread > 0 && (
                    <Badge badgeContent={chat.unread} color="error" />
                  )}
                </Box>
              }
              secondary={chat.lastMessage}
              secondaryTypographyProps={{
                sx: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderAlerts = (tab) => {
    const alerts = tab.alerts || [];
    return (
      <List sx={{ px: 2, py: 1 }}>
        {alerts.map((alert, index) => (
          <ListItem
            key={index}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: alpha(
                alert.severity === "error"
                  ? theme.palette.error.main
                  : alert.severity === "warning"
                  ? theme.palette.warning.main
                  : alert.severity === "success"
                  ? theme.palette.success.main
                  : theme.palette.info.main,
                0.08
              ),
              border: `1px solid ${alpha(
                alert.severity === "error"
                  ? theme.palette.error.main
                  : alert.severity === "warning"
                  ? theme.palette.warning.main
                  : alert.severity === "success"
                  ? theme.palette.success.main
                  : theme.palette.info.main,
                0.2
              )}`,
            }}
          >
            {alert.icon && (
              <ListItemIcon sx={{ minWidth: 40 }}>
                {iconMap[alert.icon] && React.createElement(iconMap[alert.icon], {
                  sx: {
                    color:
                      alert.severity === "error"
                        ? theme.palette.error.main
                        : alert.severity === "warning"
                        ? theme.palette.warning.main
                        : alert.severity === "success"
                        ? theme.palette.success.main
                        : theme.palette.info.main,
                  },
                })}
              </ListItemIcon>
            )}
            <ListItemText
              primary={alert.title}
              secondary={alert.message}
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
              secondaryTypographyProps={{
                fontSize: "0.75rem",
              }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderFilters = (tab) => {
    const filterGroups = tab.filterGroups || [];
    return (
      <Box sx={{ px: 2, py: 1 }}>
        {filterGroups.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ mb: 3 }}>
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
              {group.label}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {group.filters.map((filter, filterIndex) => (
                <Chip
                  key={filterIndex}
                  label={`${filter.label} (${filter.count})`}
                  size="small"
                  variant={filter.active ? "filled" : "outlined"}
                  color={filter.active ? "primary" : "default"}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        bgcolor: "#ffffff",
        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Sticky Header - Always Visible */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "#ffffff",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {/* Compact Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
            Control Panel
          </Typography>
          <IconButton 
            size="small" 
            onClick={onClose}
            sx={{ display: { xs: "flex", lg: "none" } }} // Only show on mobile
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Compact Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            minHeight: 44,
            "& .MuiTab-root": {
              minHeight: 44,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              px: 2,
              py: 1,
            },
          }}
        >
          <Tab label="Control Panel" />
          <Tab 
            label="Customer View" 
            disabled={!selectedItem}
            icon={selectedItem && <Badge color="primary" variant="dot" />}
            iconPosition="end"
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === 0 && (
          <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
            {renderControlPanel(tabs[0])}
          </Box>
        )}
        {activeTab === 1 && selectedItem && renderCustomerView()}
      </Box>
    </Box>
  );
};

export default RightSidebar;
