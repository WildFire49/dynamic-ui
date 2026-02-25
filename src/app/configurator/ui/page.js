"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Skeleton,
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  PlayArrow,
  Save,
  Settings,
  AccountTree,
  ViewList,
  Add,
  Edit,
  Delete,
  DragIndicator,
  Link as LinkIcon,
  CheckCircle,
  Person,
  Agriculture,
  AccountBalance,
  Fingerprint,
  Description,
  Visibility,
  Close,
  AutoAwesome,
  ArrowDropDown,
  FolderOpen,
  ViewModule as ViewModuleIcon,
  Add as AddIcon,
  ChevronLeft,
  Code,
  ExpandMore,
  ExpandLess,
  ArrowForward,
  Preview,
} from "@mui/icons-material";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import DynamicUIRenderer from "@/components/dynamic-form/DynamicUIRenderer";
import UnifiedFormRenderer from "@/components/dynamic-form/UnifiedFormRenderer";
import { getFormSchemaById } from "@/components/dynamic-form/sampleFormSchemas";
import ApiConfigDialog from "@/components/configurator/ApiConfigDialog";
import ApiConfigChatDialog from "@/components/configurator/ApiConfigChatDialog";
import FieldManagerDialog from "@/components/configurator/FieldManagerDialog";
import FormPreviewNode from "@/components/configurator/FormPreviewNode";
import AIComponentBuilder from "@/components/configurator/AIComponentBuilder";
import ErrorBoundary from "@/components/ErrorBoundary";
import ApiVersionToggle from "@/components/settings/ApiVersionToggle";
import uiConfiguratorService from "@/services/uiConfiguratorService";
import authService from "@/services/authService";
import PageHeader from "@/components/layout/PageHeader";
import Image from "next/image";
import {
  fetchWorkflows,
  getApiVersion,
  isBetaVersion,
  fetchWorkflowSteps,
  fetchStepUI,
  createBetaWorkflow,
  deleteBetaWorkflow,
  getBetaUIComponents,
  attachUIToStep,
} from "@/lib/api/workflowService";

// Helper function to get icon based on category
const getCategoryIcon = (category) => {
  const iconMap = {
    onboarding: "person",
    loan: "agriculture",
    banking: "account_balance",
    verification: "fingerprint",
    completion: "check_circle",
    kyc: "badge",
    general: "description",
  };
  return iconMap[category?.toLowerCase()] || "description";
};

// Helper function to get color based on category
const getCategoryColor = (category) => {
  const colorMap = {
    onboarding: "#1976d2",
    loan: "#2e7d32",
    banking: "#f57c00",
    verification: "#9c27b0",
    completion: "#4caf50",
    kyc: "#e91e63",
    general: "#757575",
  };
  return colorMap[category?.toLowerCase()] || "#757575";
};

const UIConfiguratorPage = () => {
  const router = useRouter();
  const theme = useTheme();

  // ==================== STYLES CONFIGURATION ====================
  const styles = {
    // Layout
    mainContainer: {
      display: "flex",
      height: "100vh",
      bgcolor: alpha(theme.palette.grey[100], 0.5),
      overflow: "hidden",
    },

    // Drawer
    drawer: {
      width: (width) => width,
      flexShrink: 0,
      transition: "width 0.05s linear",
      "& .MuiDrawer-paper": {
        width: (width) => width,
        boxSizing: "border-box",
        borderRight: `1px solid ${alpha("#000", 0.08)}`,
        bgcolor: "#fff",
        transition: "width 0.05s linear",
        overflowX: "hidden",
      },
    },

    resizeHandle: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "8px",
      cursor: "col-resize",
      bgcolor: "transparent",
      transition: "background-color 0.2s ease",
      zIndex: 1000,
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.main, 0.1),
      },
    },

    resizeHandleActive: {
      bgcolor: alpha(theme.palette.primary.main, 0.2),
    },

    // Header
    header: {
      p: 2,
      borderBottom: `1px solid ${alpha("#000", 0.08)}`,
      bgcolor: "#fff",
    },

    headerTitle: {
      fontWeight: 700,
      fontSize: "1.1rem",
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },

    // Tabs
    tabs: {
      borderBottom: `1px solid ${alpha("#000", 0.08)}`,
      bgcolor: "#fff",
      "& .MuiTab-root": {
        minHeight: 48,
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },

    // Component Cards
    componentCard: {
      p: 2,
      cursor: "grab",
      border: `1px solid ${alpha("#000", 0.08)}`,
      borderRadius: 2,
      transition: "all 0.2s ease",
      bgcolor: "#fff",
      "&:hover": {
        boxShadow: `0 4px 12px ${alpha("#000", 0.1)}`,
        transform: "translateY(-2px)",
        borderColor: theme.palette.primary.main,
      },
      "&:active": {
        cursor: "grabbing",
      },
    },

    // Canvas
    canvasContainer: {
      flex: 1,
      position: "relative",
      bgcolor: alpha(theme.palette.grey[100], 0.5),
    },

    // Toolbar
    toolbar: {
      position: "absolute",
      top: 16,
      left: 16,
      zIndex: 10,
      display: "flex",
      gap: 1,
      bgcolor: "white",
      borderRadius: 2,
      p: 1,
      boxShadow: `0 2px 8px ${alpha("#000", 0.1)}`,
    },

    toolbarButton: {
      minWidth: "auto",
      px: 2,
      py: 1,
      borderRadius: 1.5,
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
    },

    // iPhone Mockup
    iphoneMockup: {
      width: { xs: 340, sm: 390 },
      height: { xs: 720, sm: 812 }, // Proportions of iPhone 17 Pro Max
      maxWidth: "100%",
      position: "relative",
      borderRadius: "48px",
      backgroundColor: "#171717", // True thin black bezel
      padding: "8px", // Reduced padding for ultra-thin bezel
      boxShadow: `
        0 0 0 2px #e2e8f0,
        0 20px 60px rgba(0,0,0,0.15),
        inset 0 0 0 1px rgba(255,255,255,0.05)
      `,
      "&::before": { // dynamic island
        content: '""',
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: 100,
        height: 30,
        backgroundColor: "#171717",
        borderRadius: "15px",
        zIndex: 20,
      },
      "&::after": { // camera dot
        content: '""',
        position: "absolute",
        top: 21,
        left: "50%",
        transform: "translateX(24px)",
        width: 10,
        height: 10,
        backgroundColor: "#0a0a0a",
        borderRadius: "50%",
        zIndex: 21,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05)`,
      },
    },

    mobileScreen: {
      width: "100%",
      height: "100%",
      bgcolor: "#f8fafc",
      borderRadius: "40px", // Matched with outer 48px - 8px padding
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },

    mobileHeader: {
      minHeight: "76px",
      backgroundColor: "rgba(248, 250, 252, 0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid rgba(0,0,0,0.05)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 3,
      pt: "34px", // Safe area below dynamic island
      pb: "8px",
      zIndex: 10,
    },

    backButton: {
      width: 36,
      height: 36,
      bgcolor: alpha("#0f172a", 0.04),
      "&:hover": {
        bgcolor: alpha("#0f172a", 0.08),
      },
    },

    mobileLogo: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
    },

    mobileTime: {
      fontWeight: 600,
      fontSize: "0.7rem",
      color: "text.secondary",
    },

    // Workflow Progress
    workflowProgress: {
      px: 2,
      py: 1.5,
      bgcolor: alpha(theme.palette.primary.main, 0.05),
      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    },

    workflowBadge: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      mb: 0.5,
    },

    workflowLabel: {
      fontWeight: 600,
      color: "primary.main",
      fontSize: "0.688rem",
    },

    workflowChip: {
      height: 18,
      fontSize: "0.625rem",
      bgcolor: "primary.main",
      color: "white",
    },

    workflowTitle: {
      color: "text.secondary",
      fontSize: "0.688rem",
    },

    // Form Content
    formContent: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      overflowX: "hidden",
      pt: "16px", // natural spacing below header
      px: 0,
      pb: 4,
      "&::-webkit-scrollbar": {
        width: "0px", // Hide scrollbar for a cleaner mobile feel
      },
    },

    // Dialog
    dialogPaper: {
      maxHeight: "95vh",
      backgroundColor: "transparent",
      boxShadow: "none",
      borderRadius: 0,
      position: "relative",
    },

    dialogContent: {
      p: { xs: 2, sm: 4 },
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start", // Prevents top cutoff when content is taller than viewport
      minHeight: "100vh",
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: alpha("#000", 0.03),
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: alpha(theme.palette.primary.main, 0.4),
        borderRadius: "4px",
        "&:hover": {
          background: alpha(theme.palette.primary.main, 0.6),
        },
      },
    },

    closeButton: {
      position: "absolute",
      right: { xs: 16, sm: -64 },
      top: { xs: 16, sm: 0 },
      zIndex: 100,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      color: "#000",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
      },
    },

    // Loading
    loadingContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
    },

    // Snackbar
    snackbar: {
      anchorOrigin: { vertical: "top", horizontal: "right" },
      autoHideDuration: 4000,
    },

    snackbarAlert: {
      minWidth: 300,
    },

    // ==================== NAVBAR STYLES ====================
    navbarContainer: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      bgcolor: alpha(theme.palette.grey[100], 0.5),
    },

    navbarPaper: {
      borderRadius: 0,
      borderBottom: "1px solid",
      borderColor: "divider",
      bgcolor: "white",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      zIndex: 1100,
    },

    navbarContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      py: 1.5,
      px: 0,
      gap: 0,
    },

    navbarLogo: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
    },

    navbarLogoImage: {
      width: 32,
      height: 32,
      objectFit: "contain",
    },

    navbarTitle: {
      fontWeight: 600,
      color: "text.primary",
      lineHeight: 1,
      fontSize: "1.1rem",
    },

    navbarActions: {
      display: "flex",
      alignItems: "center",
      gap: 2,
    },

    navbarBackButton: {
      color: "text.secondary",
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        color: "primary.main",
      },
    },

    navbarWorkflowInfo: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1,
      borderRadius: 2,
      bgcolor: alpha(theme.palette.primary.main, 0.04),
    },

    navbarWorkflowIcon: {
      width: 32,
      height: 32,
      borderRadius: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: alpha(theme.palette.primary.main, 0.1),
    },

    navbarWorkflowIconSvg: {
      fontSize: 18,
      color: "primary.main",
    },

    navbarWorkflowName: {
      fontWeight: 600,
      color: "text.primary",
      lineHeight: 1.2,
      fontSize: "0.875rem",
    },

    navbarWorkflowSubtitle: {
      color: "text.secondary",
      fontSize: "0.75rem",
      lineHeight: 1,
    },

    navbarWorkflowSelector: {
      maxWidth: 280,
      minWidth: 200,
    },

    navbarWorkflowButton: {
      bgcolor: alpha("#000", 0.02),
      color: "text.primary",
      textTransform: "none",
      fontWeight: 500,
      borderRadius: 2,
      py: 1,
      px: 2,
      justifyContent: "space-between",
      "&:hover": {
        bgcolor: alpha("#000", 0.04),
      },
    },

    navbarWorkflowButtonContent: {
      display: "flex",
      alignItems: "center",
      gap: 1,
    },

    navbarWorkflowButtonText: {
      fontWeight: 500,
    },

    navbarSavedChip: {
      height: 20,
      fontSize: "0.688rem",
      bgcolor: alpha(theme.palette.success.main, 0.1),
      color: "success.main",
    },

    navbarMenuHeader: {
      px: 2,
      py: 1.5,
      borderBottom: 1,
      borderColor: "divider",
    },

    navbarMenuTitle: {
      fontWeight: 600,
    },

    navbarMenuLoading: {
      display: "flex",
      justifyContent: "center",
      py: 3,
    },

    navbarMenuEmpty: {
      px: 2,
      py: 3,
      textAlign: "center",
    },

    navbarMenuItem: {
      py: 1.5,
      px: 2,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 0.5,
    },

    navbarMenuItemHeader: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      width: "100%",
    },

    navbarMenuItemTitle: {
      fontWeight: 500,
      flex: 1,
    },

    navbarMenuItemChip: {
      height: 20,
      fontSize: "0.688rem",
    },

    navbarMenuItemInfo: {
      display: "flex",
      gap: 2,
      width: "100%",
    },

    navbarMenuItemDescription: {
      fontStyle: "italic",
    },

    navbarMenuFooter: {
      px: 2,
      py: 1.5,
      borderTop: 1,
      borderColor: "divider",
    },

    navbarRefreshButton: {
      textTransform: "none",
    },

    navbarActionButton: {
      borderRadius: 1.5,
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
      px: 2,
    },

    // ==================== EMPTY STATE STYLES ====================
    emptyStateContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 8,
      px: 3,
      textAlign: "center",
    },

    emptyStateIconWrapper: {
      width: 120,
      height: 120,
      borderRadius: "50%",
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 3,
    },

    emptyStateIcon: {
      fontSize: 60,
      color: alpha(theme.palette.primary.main, 0.5),
    },

    emptyStateTitle: {
      fontWeight: 600,
      color: theme.palette.text.primary,
      mb: 1,
    },

    emptyStateDescription: {
      color: theme.palette.text.secondary,
      mb: 3,
      maxWidth: 280,
    },

    emptyStateButton: {
      borderRadius: "8px",
      textTransform: "none",
      fontWeight: 500,
    },

    // ==================== COMPONENT LIBRARY CARD STYLES ====================
    libraryCard: (color) => ({
      mb: 2,
      border: `2px solid ${alpha(color, 0.2)}`,
      cursor: "grab",
      "&:active": {
        cursor: "grabbing",
      },
      "&:hover": {
        border: `2px solid ${color}`,
        boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
      },
      transition: "all 0.3s ease",
    }),

    libraryCardContent: {
      p: 2,
    },

    libraryCardHeader: {
      display: "flex",
      alignItems: "center",
      mb: 1.5,
    },

    libraryCardIconWrapper: (color) => ({
      width: 40,
      height: 40,
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: alpha(color, 0.1),
      mr: 1.5,
    }),

    libraryCardIcon: (color) => ({
      fontSize: 24,
      color: color,
    }),

    libraryCardTitleSection: {
      flex: 1,
    },

    libraryCardTitle: {
      fontWeight: 600,
      fontSize: "0.938rem",
      lineHeight: 1.3,
      mb: 0.5,
    },

    libraryCardCategory: (color) => ({
      fontSize: "0.688rem",
      color: color,
      textTransform: "uppercase",
      fontWeight: 600,
      letterSpacing: "0.5px",
    }),

    libraryCardDescription: {
      fontSize: "0.813rem",
      color: "text.secondary",
      lineHeight: 1.5,
      mb: 1.5,
    },

    libraryCardActions: {
      display: "flex",
      gap: 1,
    },

    libraryCardButton: {
      flex: 1,
      textTransform: "none",
      fontSize: "0.813rem",
      fontWeight: 600,
      py: 0.75,
      borderRadius: 1.5,
    },

    // ==================== SKELETON LOADING STYLES ====================
    skeletonCard: {
      mb: 2,
    },

    skeletonCardContent: {
      p: 2,
    },

    skeletonHeader: {
      display: "flex",
      alignItems: "center",
      mb: 1,
    },

    skeletonIconWrapper: {
      mr: 2,
    },

    skeletonTextWrapper: {
      flex: 1,
    },

    skeletonActions: {
      display: "flex",
      gap: 1,
      mt: 1,
    },

    // ==================== COMMON REUSABLE STYLES ====================
    flexCenter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    flexBetween: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    flexColumn: {
      display: "flex",
      flexDirection: "column",
    },

    textEllipsis: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  };
  // ==================== END STYLES ====================

  const [componentLibrary, setComponentLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [fieldManagerOpen, setFieldManagerOpen] = useState(false);
  const [apiConfigDialogOpen, setApiConfigDialogOpen] = useState(false);
  const [apiConfigChatOpen, setApiConfigChatOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [workflowName, setWorkflowName] = useState("Workflow");
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [workflowsList, setWorkflowsList] = useState([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowMenuAnchor, setWorkflowMenuAnchor] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteComponentDialog, setDeleteComponentDialog] = useState({ open: false, componentId: null, componentName: "" });
  const [deleteWorkflowDialog, setDeleteWorkflowDialog] = useState({ open: false, workflowId: null, workflowName: "" });
  const [tempWorkflowName, setTempWorkflowName] = useState("");
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [currentTestNodeIndex, setCurrentTestNodeIndex] = useState(0);
  const [workflowTestData, setWorkflowTestData] = useState({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [fullPreviewSchema, setFullPreviewSchema] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [drawerWidth, setDrawerWidth] = useState(540);
  const [isResizing, setIsResizing] = useState(false);
  const [showResizeHandle, setShowResizeHandle] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Handle tab change and refresh component library
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // Refresh component library when switching to UI Builder tab (tab 0)
    if (newValue === 0) {
      console.log("🔄 Refreshing component library...");
      setSnackbar({
        open: true,
        message: "Refreshing component library...",
        severity: "info",
      });
      loadComponentLibrary();
    }
  };

  // Define custom node types
  const nodeTypes = React.useMemo(
    () => ({
      formPreview: FormPreviewNode,
    }),
    []
  );

  const loadComponentLibrary = useCallback(async () => {
    try {
      const username = authService.getUsername() || authService.getUserId();
      const apiVersion = getApiVersion();
      const components = [];

      if (apiVersion === 'beta') {
        // Beta API: fetch UI components for user
        const response = await getBetaUIComponents(username);
        console.log("📚 Beta UI Components Data:", response);

        const uiConfigs = response.data?.ui_configs || [];
        uiConfigs.forEach((item) => {
          components.push({
            id: item.ui_id,
            name: item.name || item.ui_id,
            description: item.description || "Beta UI component",
            category: "workflow",
            icon: getCategoryIcon("general"),
            color: getCategoryColor("general"),
            schema: item.config_data,
          });
        });
      } else {
        // Alpha API: fetch component library
        const libraryData = await uiConfiguratorService.getComponentLibrary(
          username
        );

        console.log("📚 Component Library Data:", libraryData);

        // Add forms from conversations
        if (libraryData.conversations && libraryData.conversations.length > 0) {
          libraryData.conversations.forEach((conversation) => {
            if (conversation.forms && conversation.forms.length > 0) {
              conversation.forms.forEach((form) => {
                components.push({
                  id: form.form_id,
                  name: form.title,
                  description:
                    form.description || `Part of ${conversation.conversation_id}`,
                  category: form.category || "general",
                  icon: getCategoryIcon(form.category),
                  color: getCategoryColor(form.category),
                  schema: form.schema,
                  conversation_id: conversation.conversation_id,
                });
              });
            }
          });
        }

        // Add orphaned forms
        if (
          libraryData.forms_without_conversation &&
          libraryData.forms_without_conversation.length > 0
        ) {
          libraryData.forms_without_conversation.forEach((form) => {
            components.push({
              id: form.form_id,
              name: form.title,
              description: form.description || "Standalone form",
              category: form.category || "general",
              icon: getCategoryIcon(form.category),
              color: getCategoryColor(form.category),
              schema: form.schema,
            });
          });
        }
      }

      console.log("✅ Transformed components:", components);
      setComponentLibrary(components);
    } catch (error) {
      console.error("Error loading component library:", error);
      setSnackbar({
        open: true,
        message: "Failed to load component library from API",
        severity: "error",
      });
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  // Load component library on mount
  useEffect(() => {
    loadComponentLibrary();
  }, [loadComponentLibrary]);

  // Set mounted state for client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Save current workflow to backend
   * Captures nodes, edges, viewport state, and metadata
   */
  const saveWorkflow = useCallback(
    async (workflowId = null, customWorkflowName = null) => {
      try {
        const username = authService.getUsername() || authService.getUserId();
        const productId = "loan_app"; // Get from context or props
        const apiVersion = getApiVersion();

        // Use custom name if provided, otherwise use state
        const nameToUse = customWorkflowName || workflowName;

        let response;

        if (apiVersion === 'beta') {
          // Beta API: steps must be an array of step ID strings
          // Only include nodes that have a real step_id (from a loaded workflow)
          // Library/AI nodes without form_id are excluded — they need to be
          // attached to existing steps via the connect (edge) flow instead
          const workflowNodes = nodes.filter((node) => node.data.form_id);
          const steps = workflowNodes.map((node) => node.data.form_id);

          response = await createBetaWorkflow({
            userId: username,
            name: nameToUse,
            description: `Workflow with ${nodes.length} components and ${edges.length} connections`,
            steps,
          });

          console.log("✅ Beta workflow created:", response);

          // Store workflow ID from beta response
          const newWorkflowId = response.workflow_id || response.data?.workflow_id;
          if (response.success && newWorkflowId) {
            setCurrentWorkflowId(newWorkflowId);

            // After workflow is created, attach UI configs to steps that have schemas
            try {
              const stepsResponse = await fetchWorkflowSteps(newWorkflowId);
              if (stepsResponse.success && stepsResponse.steps) {
                const createdSteps = stepsResponse.steps;
                // Build a lookup by step_id for reliable matching
                const stepMap = {};
                createdSteps.forEach((s) => { stepMap[s.step_id] = s; });

                const attachPromises = workflowNodes
                  .map((node) => {
                    const schema = node.data.schema || node.data.component?.schema;
                    const uiId = node.data.ui_id || node.data.component?.id || '';
                    const createdStep = stepMap[node.data.form_id];
                    const stepName = node.data.title || node.data.component?.name || createdStep?.name || '';
                    const stepDescription = node.data.description || node.data.component?.description || '';

                    if (schema && createdStep?.step_id) {
                      const uiConfig = {
                        name: stepName,
                        uiId: uiId,
                        forms: schema.forms || schema,
                      };

                      return attachUIToStep({
                        stepId: createdStep.step_id,
                        userId: username,
                        uiId,
                        uiConfig,
                        workflowId: newWorkflowId,
                        stepName,
                        stepDescription,
                      })
                        .then(() => {
                          console.log(`✅ Attached UI to step: ${createdStep.step_id}`);
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === node.id
                                ? { ...n, data: { ...n.data, form_id: createdStep.step_id, ui_id: createdStep.ui_id || uiId } }
                                : n
                            )
                          );
                        })
                        .catch((err) => {
                          console.error(`❌ Failed to attach UI to step ${createdStep.step_id}:`, err);
                        });
                    }
                    return null;
                  })
                  .filter(Boolean);

                await Promise.allSettled(attachPromises);
                console.log("✅ All UI attachments processed");
              }
            } catch (err) {
              console.error("❌ Failed to fetch steps for UI attachment:", err);
            }
          }
        } else {
          // Alpha API: save full canvas state
          const workflowData = {
            workflow_name: nameToUse,
            description: `Workflow with ${nodes.length} components and ${edges.length} connections`,
            user_id: username,
            product_id: productId,
            canvas_state: {
              viewport: {
                x: 0,
                y: 0,
                zoom: 1,
              },
              nodes: nodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                  form_id: node.data.schema?.id || node.data.id,
                  title: node.data.schema?.title || node.data.title,
                  description:
                    node.data.schema?.description || node.data.description,
                  category: node.data.category || "general",
                  schema: node.data.schema,
                },
                width: node.width || 400,
                height: node.height || 200,
              })),
              edges: edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                type: "smoothstep",
                animated: edge.animated !== false,
                style: edge.style || { stroke: "#1976d2", strokeWidth: 2 },
                data: {
                  transition_type: "on_submit",
                  condition: null,
                  data_mapping: {
                    pass_all_fields: true,
                    field_mappings: [],
                  },
                },
              })),
            },
            metadata: {
              total_nodes: nodes.length,
              total_edges: edges.length,
              tags: ["workflow"],
            },
          };

          if (workflowId) {
            response = await uiConfiguratorService.updateWorkflow(
              workflowId,
              workflowData
            );
          } else {
            response = await uiConfiguratorService.saveWorkflow(workflowData);
          }

          console.log("✅ Alpha workflow saved:", response);

          if (response.success && response.data && response.data.workflow_id) {
            setCurrentWorkflowId(response.data.workflow_id);
          }
        }

        setSnackbar({
          open: true,
          message:
            response.message ||
            (workflowId
              ? "Workflow updated successfully!"
              : "Workflow saved successfully!"),
          severity: "success",
        });

        // Reload workflows list to show the new/updated workflow
        loadWorkflowsList();

        return response;
      } catch (error) {
        console.error("❌ Error saving workflow:", error);
        setSnackbar({
          open: true,
          message: "Failed to save workflow",
          severity: "error",
        });
        throw error;
      }
    },
    [nodes, edges, workflowName]
  );

  /**
   * Load workflow from backend and restore canvas state
   */
  const loadWorkflow = useCallback(
    async (workflowId) => {
      try {
        const apiVersion = getApiVersion();
        console.log(`📥 Loading workflow from ${apiVersion.toUpperCase()} API:`, workflowId);

        let workflowData;

        if (apiVersion === 'beta') {
          // Beta API: Fetch workflow steps only (no UI data yet)
          const stepsResponse = await fetchWorkflowSteps(workflowId);
          console.log("📋 Beta API steps response:", stepsResponse);

          if (!stepsResponse.success || !stepsResponse.steps) {
            throw new Error("Invalid steps response from Beta API");
          }

          const steps = stepsResponse.steps;

          // Convert Beta workflow to Alpha-like structure
          // UI schemas will be fetched only when preview/test is clicked
          // Arrange nodes in rows for better layout
          const COLS = Math.min(steps.length, 6); // max 6 per row
          const X_GAP = 340;
          const Y_GAP = 280;

          workflowData = {
            workflow_id: workflowId,
            workflow_name: stepsResponse.workflow_name || workflowId,
            version: "1.0.0",
            status: "active",
            canvas_state: {
              nodes: steps.map((step, index) => ({
                id: `node-${index + 1}`,
                type: "formPreview",
                position: {
                  x: 50 + (index % COLS) * X_GAP,
                  y: 80 + Math.floor(index / COLS) * Y_GAP,
                },
                data: {
                  form_id: step.step_id,
                  ui_id: step.ui_id,
                  title: step.name || `Step ${index + 1}`,
                  description: step.description || "",
                  category: "workflow",
                  has_ui_data: step.has_ui_data,
                  order: step.order,
                  schema: null // Will be fetched on preview/test
                }
              })),
              edges: steps.slice(0, -1).map((_, index) => ({
                id: `edge-${index + 1}`,
                source: `node-${index + 1}`,
                target: `node-${index + 2}`,
                animated: true
              }))
            }
          };
        } else {
          // Alpha API
          const response = await uiConfiguratorService.getWorkflow(workflowId);

          if (!response.success || !response.data) {
            throw new Error("Invalid workflow response");
          }

          workflowData = response.data;
        }

        console.log("📥 Loading workflow:", workflowData.workflow_name);

        // Restore workflow name
        setWorkflowName(workflowData.workflow_name);

        // Restore nodes with proper structure and callbacks
        const restoredNodes = workflowData.canvas_state.nodes.map((node) => {
          // Reconstruct component object from saved data
          const component = {
            id: node.data.form_id,
            name: node.data.title,
            title: node.data.title,
            description: node.data.description,
            category: node.data.category || "general",
            icon: "person", // Default icon
            color: "#1976d2", // Default color
          };

          return {
            id: node.id,
            type: node.type || "formPreview",
            position: node.position,
            data: {
              component: component,
              schema: node.data.schema,
              title: node.data.title,
              description: node.data.description,
              category: node.data.category,
              form_id: node.data.form_id,
              ui_id: node.data.ui_id,
              has_ui_data: node.data.has_ui_data,
              // Define callbacks inline to avoid initialization order issues
              onDelete: () => {
                setNodes((nds) => nds.filter((n) => n.id !== node.id));
                setEdges((eds) =>
                  eds.filter(
                    (edge) => edge.source !== node.id && edge.target !== node.id
                  )
                );
              },
              onConfigure: (comp) => {
                setSelectedComponent(comp);
                setSelectedNodeForConfig(node);
                setApiConfigChatOpen(true);
              },
              onPreview: async (comp) => {
                const apiVersion = getApiVersion();
                let schema = comp.schema || node.data.schema;

                // For Beta API, always re-fetch to pick up edits
                if (apiVersion === 'beta' && (node.data.ui_id || node.data.form_id)) {
                  try {
                    const uiResponse = await fetchStepUI(node.data.form_id);
                    if (uiResponse.success && uiResponse.ui_config) {
                      schema = uiResponse.ui_config;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === node.id
                            ? { ...n, data: { ...n.data, schema } }
                            : n
                        )
                      );
                    } else if (uiResponse.success && uiResponse.data) {
                      schema = uiResponse.data;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === node.id
                            ? { ...n, data: { ...n.data, schema } }
                            : n
                        )
                      );
                    }
                  } catch (err) {
                    console.error(`Failed to fetch UI schema:`, err);
                    setSnackbar({
                      open: true,
                      message: `Failed to load UI schema: ${err.message}`,
                      severity: "error",
                    });
                    return;
                  }
                }

                setFullPreviewSchema(schema);
                setFullPreviewOpen(true);
              },
            },
            width: node.width,
            height: node.height,
          };
        });

        // Restore edges
        const restoredEdges = workflowData.canvas_state.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: "smoothstep",
          animated: edge.animated !== false,
          style: edge.style || { stroke: "#1976d2", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#1976d2",
          },
          data: edge.data,
        }));

        setNodes(restoredNodes);
        setEdges(restoredEdges);
        setCurrentWorkflowId(workflowData.workflow_id);

        console.log("✅ Workflow loaded:", {
          workflow_id: workflowData.workflow_id,
          nodes: restoredNodes.length,
          edges: restoredEdges.length,
          version: workflowData.version,
          status: workflowData.status,
        });

        setSnackbar({
          open: true,
          message: `Workflow '${workflowData.workflow_name}' loaded successfully!`,
          severity: "success",
        });

        return workflowData;
      } catch (error) {
        console.error("❌ Error loading workflow:", error);
        setSnackbar({
          open: true,
          message: "Failed to load workflow",
          severity: "error",
        });
        throw error;
      }
    },
    [setNodes, setEdges]
  );

  /**
   * Handle workflow generated from AI builder - load directly onto canvas
   */
  const handleWorkflowGenerated = useCallback(
    (workflowData) => {
      try {
        // ── Beta API: steps array (no canvas_state) ──
        const isBetaSteps = workflowData.steps && Array.isArray(workflowData.steps) && !workflowData.canvas_state;

        if (isBetaSteps) {
          const steps = workflowData.steps.sort((a, b) => a.order - b.order);
          setWorkflowName(workflowData.workflow_name || "Custom Workflow");

          const NODE_WIDTH = 320;
          const NODE_GAP = 80;
          const START_X = 50;
          const START_Y = 80;
          const NODES_PER_ROW = 4;

          const restoredNodes = steps.map((step, index) => {
            const nodeId = step.step_id || `step_${index}`;
            const row = Math.floor(index / NODES_PER_ROW);
            const col = index % NODES_PER_ROW;
            const actualCol = row % 2 === 0 ? col : NODES_PER_ROW - 1 - col;

            const component = {
              id: step.step_id,
              name: step.name,
              title: step.name,
              description: step.description,
              category: "loan-vehicle",
              icon: "person",
              color: "#1976d2",
            };

            return {
              id: nodeId,
              type: "formPreview",
              position: {
                x: START_X + actualCol * (NODE_WIDTH + NODE_GAP),
                y: START_Y + row * 250,
              },
              data: {
                component,
                schema: null,
                title: step.name,
                description: step.description,
                category: "loan-vehicle",
                form_id: step.step_id,
                ui_id: step.ui_id,
                has_ui_data: step.has_ui_data,
                onDelete: () => {
                  setNodes((nds) => nds.filter((n) => n.id !== nodeId));
                  setEdges((eds) =>
                    eds.filter(
                      (edge) => edge.source !== nodeId && edge.target !== nodeId
                    )
                  );
                },
                onConfigure: (comp) => {
                  setSelectedComponent(comp);
                  setSelectedNodeForConfig({ id: nodeId, data: { ...comp, form_id: step.step_id, ui_id: step.ui_id } });
                  setApiConfigChatOpen(true);
                },
                onPreview: async (comp) => {
                  let schema = comp?.schema;
                  // Always re-fetch in beta mode to pick up edits
                  if (step.ui_id || step.step_id) {
                    try {
                      const uiResponse = await fetchStepUI(step.step_id);
                      if (uiResponse.success && uiResponse.ui_config) {
                        schema = uiResponse.ui_config;
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === nodeId
                              ? { ...n, data: { ...n.data, schema } }
                              : n
                          )
                        );
                      } else if (uiResponse.success && uiResponse.data) {
                        schema = uiResponse.data;
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === nodeId
                              ? { ...n, data: { ...n.data, schema } }
                              : n
                          )
                        );
                      }
                    } catch (err) {
                      console.error(`Failed to fetch UI schema:`, err);
                      setSnackbar({
                        open: true,
                        message: `Failed to load UI schema: ${err.message}`,
                        severity: "error",
                      });
                      return;
                    }
                  }
                  setFullPreviewSchema(schema);
                  setFullPreviewOpen(true);
                },
              },
            };
          });

          // Build edges connecting sequential steps
          const restoredEdges = steps.slice(0, -1).map((step, index) => {
            const sourceId = step.step_id || `step_${index}`;
            const targetId = steps[index + 1].step_id || `step_${index + 1}`;
            return {
              id: `edge_${sourceId}_${targetId}`,
              source: sourceId,
              target: targetId,
              type: "smoothstep",
              animated: true,
              style: { stroke: "#1976d2", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#1976d2",
              },
            };
          });

          setNodes(restoredNodes);
          setEdges(restoredEdges);

          if (workflowData.workflow_id) {
            setCurrentWorkflowId(workflowData.workflow_id);
          }

          loadWorkflowsList();

          setSnackbar({
            open: true,
            message: `Workflow '${workflowData.workflow_name}' loaded with ${steps.length} steps!`,
            severity: "success",
          });
          return;
        }

        // ── Alpha API: canvas_state format ──
        const canvasState = workflowData.canvas_state;
        if (!canvasState?.nodes) return;

        setWorkflowName(workflowData.workflow_name || "Custom Workflow");

        // Layout nodes horizontally with good spacing
        const NODE_WIDTH = 320;
        const NODE_GAP = 80;
        const START_X = 50;
        const START_Y = 80;

        const restoredNodes = canvasState.nodes.map((node, index) => {
          const component = {
            id: node.data.form_id,
            name: node.data.title,
            title: node.data.title,
            description: node.data.description,
            category: node.data.category || "general",
            icon: "person",
            color: "#1976d2",
          };

          return {
            id: node.id,
            type: node.type || "formPreview",
            position: {
              x: START_X + index * (NODE_WIDTH + NODE_GAP),
              y: START_Y,
            },
            data: {
              component,
              schema: node.data.schema,
              title: node.data.title,
              description: node.data.description,
              category: node.data.category,
              onDelete: () => {
                setNodes((nds) => nds.filter((n) => n.id !== node.id));
                setEdges((eds) =>
                  eds.filter(
                    (edge) => edge.source !== node.id && edge.target !== node.id
                  )
                );
              },
              onConfigure: (comp) => {
                setSelectedComponent(comp);
                setSelectedNodeForConfig(node);
                setApiConfigChatOpen(true);
              },
              onPreview: async (comp) => {
                const apiVersion = getApiVersion();
                let schema = comp.schema || node.data.schema;

                // For Beta API, always re-fetch to pick up edits
                if (apiVersion === 'beta' && (node.data.ui_id || node.data.form_id)) {
                  try {
                    const uiResponse = await fetchStepUI(node.data.form_id);
                    if (uiResponse.success && uiResponse.ui_config) {
                      schema = uiResponse.ui_config;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === node.id
                            ? { ...n, data: { ...n.data, schema } }
                            : n
                        )
                      );
                    } else if (uiResponse.success && uiResponse.data) {
                      schema = uiResponse.data;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === node.id
                            ? { ...n, data: { ...n.data, schema } }
                            : n
                        )
                      );
                    }
                  } catch (err) {
                    console.error(`Failed to fetch UI schema:`, err);
                    setSnackbar({
                      open: true,
                      message: `Failed to load UI schema: ${err.message}`,
                      severity: "error",
                    });
                    return;
                  }
                }

                setFullPreviewSchema(schema);
                setFullPreviewOpen(true);
              },
            },
            width: node.width,
            height: node.height,
          };
        });

        const restoredEdges = (canvasState.edges || []).map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: "smoothstep",
          animated: edge.animated !== false,
          style: edge.style || { stroke: "#1976d2", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#1976d2",
          },
          data: edge.data,
        }));

        setNodes(restoredNodes);
        setEdges(restoredEdges);

        if (workflowData.workflow_id) {
          setCurrentWorkflowId(workflowData.workflow_id);
        }

        // Refresh workflows list
        loadWorkflowsList();

        setSnackbar({
          open: true,
          message: `Workflow '${workflowData.workflow_name}' loaded on canvas!`,
          severity: "success",
        });
      } catch (error) {
        console.error("Error loading generated workflow:", error);
        setSnackbar({
          open: true,
          message: "Failed to load workflow onto canvas",
          severity: "error",
        });
      }
    },
    [setNodes, setEdges]
  );

  /**
   * Load list of workflows for the user
   * Supports both Alpha and Beta APIs
   */
  const loadWorkflowsList = useCallback(async () => {
    try {
      setWorkflowsLoading(true);
      const username = authService.getUsername() || authService.getUserId();
      const productId = "loan_app"; // Get from context or props
      const apiVersion = getApiVersion();

      console.log(`📋 Loading workflows from ${apiVersion.toUpperCase()} API...`);

      let data;
      if (apiVersion === 'beta') {
        // Use Beta API
        const response = await fetchWorkflows({ userId: username, productId });
        console.log("📋 Beta API response:", response);

        // Transform Beta response to match Alpha format
        if (response.success && response.workflows) {
          data = {
            workflows: response.workflows.map(w => ({
              workflow_id: w.workflow_id,
              workflow_name: w.name || w.workflow_name,
              description: w.description,
              version: w.version,
              status: w.status,
              total_nodes: w.total_steps || 0,
              total_edges: 0,
              product_id: w.product_id
            }))
          };
        } else {
          data = { workflows: [] };
        }
      } else {
        // Use Alpha API (existing logic)
        data = await uiConfiguratorService.getUserWorkflows(
          username,
          productId
        );
      }

      console.log("📋 Workflows list loaded:", data);
      setWorkflowsList(data.workflows || []);

      setSnackbar({
        open: true,
        message: `Loaded ${data.workflows?.length || 0} workflows from ${apiVersion.toUpperCase()} API`,
        severity: "success",
      });
    } catch (error) {
      console.error("❌ Error loading workflows list:", error);
      setSnackbar({
        open: true,
        message: `Failed to load workflows: ${error.message}`,
        severity: "error",
      });
    } finally {
      setWorkflowsLoading(false);
    }
  }, []);

  // Load workflows list on mount
  useEffect(() => {
    loadWorkflowsList();
  }, [loadWorkflowsList]);

  const getIconComponent = (iconName) => {
    const iconMap = {
      person: Person,
      agriculture: Agriculture,
      account_balance: AccountBalance,
      fingerprint: Fingerprint,
      check_circle: CheckCircle,
      description: Description,
    };
    return iconMap[iconName] || Description;
  };

  const handleAddNodeToCanvas = (component, customPosition = null) => {
    // Check if component already has a schema (AI-generated)
    let schema = component.schema;

    // If not, try to get it from the library
    if (!schema) {
      schema = getFormSchemaById(component.id);
    }

    if (!schema) {
      setSnackbar({
        open: true,
        message: `Schema not found for ${component.id}`,
        severity: "error",
      });
      return;
    }

    const nodeId = `node_${Date.now()}`;

    // Auto-layout: Arrange nodes in a grid pattern to prevent overlapping
    let position = customPosition;
    if (!customPosition) {
      const nodeWidth = 320; // Width of node + spacing
      const nodeHeight = 200; // Height of node + spacing
      const nodesPerRow = 3; // Number of nodes per row

      const row = Math.floor(nodes.length / nodesPerRow);
      const col = nodes.length % nodesPerRow;

      position = {
        x: 100 + col * nodeWidth,
        y: 100 + row * nodeHeight,
      };
    }

    const newNode = {
      id: nodeId,
      type: "formPreview",
      position: position,
      data: {
        component: component,
        schema: schema,
        title: component.name || component.title,
        description: component.description,
        category: component.category || "general",
        // form_id holds a real step_id from the backend workflow.
        // Library / AI-generated components don't have one yet.
        form_id: null,
        ui_id: component.id,
        onDelete: () => handleDeleteNode(nodeId),
        onConfigure: (comp) => handleConfigureNode(comp),
        onPreview: (comp) => handleFullPreview(comp),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    setSnackbar({
      open: true,
      message: `Added ${component.name} to canvas`,
      severity: "success",
      position: "top-right",
    });
  };

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    setSnackbar({
      open: true,
      message: "Component removed from canvas",
      severity: "info",
    });
  }, []);

  const handleDeleteComponent = useCallback(
    (componentId, componentName) => {
      setDeleteComponentDialog({ open: true, componentId, componentName });
    },
    []
  );

  const confirmDeleteComponent = useCallback(async () => {
    const { componentId } = deleteComponentDialog;
    setDeleteComponentDialog({ open: false, componentId: null, componentName: "" });
    try {
      await uiConfiguratorService.deleteComponent(componentId);
      setComponentLibrary((prev) =>
        prev.filter((c) => c.id !== componentId)
      );
      setSnackbar({
        open: true,
        message: "Component deleted successfully",
        severity: "success",
      });
      // Refresh library from server to stay in sync
      loadComponentLibrary();
    } catch (error) {
      console.error("Error deleting component:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete component",
        severity: "error",
      });
    }
  }, [deleteComponentDialog, loadComponentLibrary]);

  const confirmDeleteWorkflow = useCallback(async () => {
    const { workflowId } = deleteWorkflowDialog;
    setDeleteWorkflowDialog({ open: false, workflowId: null, workflowName: "" });
    try {
      const apiVersion = getApiVersion();

      if (apiVersion === 'beta') {
        await deleteBetaWorkflow(workflowId);
      } else {
        const username = authService.getUsername() || authService.getUserId();
        await uiConfiguratorService.deleteWorkflow(workflowId, username);
      }

      // If this was the currently loaded workflow, clear the canvas
      if (currentWorkflowId === workflowId) {
        setNodes([]);
        setEdges([]);
        setCurrentWorkflowId(null);
        setWorkflowName("");
      }
      loadWorkflowsList();
      setSnackbar({
        open: true,
        message: "Workflow deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete workflow",
        severity: "error",
      });
    }
  }, [deleteWorkflowDialog, currentWorkflowId, setNodes, setEdges, loadWorkflowsList]);

  const handleConfigureNode = useCallback(
    (component) => {
      // Find the node that contains this component
      const node = nodes.find((n) => n.data.component?.id === component.id);

      setSelectedComponent(component);
      setSelectedNodeForConfig(node);
      setApiConfigChatOpen(true);
    },
    [nodes]
  );

  const handleFullPreview = useCallback((component) => {
    // Get schema - check if component already has it (AI-generated) or get from library
    let schema = component.schema;
    if (!schema) {
      schema = getFormSchemaById(component.id);
    }

    if (schema) {
      // Wrap schema in proper format for DynamicUIRenderer
      // Use a stable object reference to prevent unnecessary re-renders
      const wrappedSchema = {
        response: {
          type: "form_schema",
          schema: schema,
          form_id: component.id,
          title: schema.title || component.name,
          description: schema.description || component.description,
        },
      };

      setFullPreviewSchema(wrappedSchema);
      setFullPreviewOpen(true);
    } else {
      setSnackbar({
        open: true,
        message: `Schema not found for ${component.name}`,
        severity: "error",
      });
    }
  }, []);

  const handlePreviewComponent = (component) => {
    setSelectedComponent(component);
    setPreviewDialogOpen(true);
  };

  const handleConfigureFieldApi = (field) => {
    setSelectedField(field);
    setApiConfigDialogOpen(true);
  };

  const handleApiConfigUpdate = useCallback(
    (config) => {
      if (!selectedNodeForConfig) return;

      // Check if config is a full form schema (has sections) or just API config
      const isFullSchema = config && config.sections && config.id;
      // Check if config is a beta UI config (has forms.ui structure)
      const isBetaUiConfig = config && config.forms;

      // Update the node's schema with the new configuration
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeForConfig.id) {
            if (isBetaUiConfig) {
              // Beta UI config — store as schema directly
              return {
                ...node,
                data: {
                  ...node.data,
                  schema: config,
                },
              };
            } else if (isFullSchema) {
              // Full schema replacement - update everything
              return {
                ...node,
                data: {
                  ...node.data,
                  component: {
                    ...node.data.component,
                    id: config.id,
                    name: config.title || node.data.component.name,
                    description:
                      config.description || node.data.component.description,
                  },
                  schema: config,
                },
              };
            } else {
              // Just API config update
              return {
                ...node,
                data: {
                  ...node.data,
                  schema: {
                    ...node.data.schema,
                    api_config: config,
                  },
                },
              };
            }
          }
          return node;
        })
      );

      setSnackbar({
        open: true,
        message: (isFullSchema || isBetaUiConfig)
          ? "Component updated successfully!"
          : "API configuration updated successfully!",
        severity: "success",
      });
    },
    [selectedNodeForConfig, setNodes]
  );

  const handleSaveApiConfig = useCallback(
    (apiConfig) => {
      if (!selectedComponent || !selectedField) return;

      // Update the node's schema with the API configuration
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.component?.id === selectedComponent.id) {
            const updatedSchema = { ...node.data.schema };
            updatedSchema.sections = updatedSchema.sections.map((section) => ({
              ...section,
              fields: section.fields.map((field) =>
                field.id === selectedField.id
                  ? { ...field, api: apiConfig }
                  : field
              ),
            }));

            return {
              ...node,
              data: {
                ...node.data,
                schema: updatedSchema,
              },
            };
          }
          return node;
        })
      );

      setSnackbar({
        open: true,
        message: `API configured for ${selectedField.label}`,
        severity: "success",
      });

      setApiConfigDialogOpen(false);
      setSelectedField(null);
    },
    [selectedComponent, selectedField]
  );

  // Drag and Drop handlers
  const handleDragStart = (event, component) => {
    setDraggedComponent(component);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (!draggedComponent) return;

    // Get the ReactFlow bounds
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();

    // Calculate position relative to the ReactFlow canvas
    const position = {
      x: event.clientX - reactFlowBounds.left - 160, // Offset for better placement
      y: event.clientY - reactFlowBounds.top - 100,
    };

    handleAddNodeToCanvas(draggedComponent, position);
    setDraggedComponent(null);
  };

  const handleConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme.palette.primary.main,
        },
        style: {
          strokeWidth: 2,
          stroke: theme.palette.primary.main,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // In beta mode, link the steps via the backend
      const apiVersion = getApiVersion();
      if (apiVersion === 'beta') {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);

        const sourceStepId = sourceNode?.data?.form_id;
        const targetStepId = targetNode?.data?.form_id;
        const sourceUiId = sourceNode?.data?.ui_id || '';
        const targetUiId = targetNode?.data?.ui_id || '';
        const username = authService.getUsername() || authService.getUserId();

        // Case 1: Both nodes are workflow steps — link them together
        if (sourceStepId && targetStepId) {
          attachUIToStep({
            stepId: sourceStepId,
            userId: username,
            uiId: sourceUiId,
            uiConfig: { next_step_id: targetStepId },
            workflowId: currentWorkflowId,
            stepName: sourceNode?.data?.title || sourceNode?.data?.component?.name || sourceStepId,
            stepDescription: sourceNode?.data?.description || '',
          })
            .then(() => {
              console.log(`✅ Linked step ${sourceStepId} → ${targetStepId}`);
              setSnackbar({
                open: true,
                message: `Linked: ${sourceNode?.data?.title || sourceStepId} → ${targetNode?.data?.title || targetStepId}`,
                severity: "success",
              });
            })
            .catch((err) => {
              console.error(`❌ Failed to link steps:`, err);
              setSnackbar({
                open: true,
                message: `Failed to link steps: ${err.message}`,
                severity: "error",
              });
            });

          attachUIToStep({
            stepId: targetStepId,
            userId: username,
            uiId: targetUiId,
            uiConfig: { previous_step_id: sourceStepId },
            workflowId: currentWorkflowId,
            stepName: targetNode?.data?.title || targetNode?.data?.component?.name || targetStepId,
            stepDescription: targetNode?.data?.description || '',
          })
            .then(() => {
              console.log(`✅ Linked step ${targetStepId} ← ${sourceStepId}`);
            })
            .catch((err) => {
              console.error(`❌ Failed to link previous step:`, err);
            });

        // Case 2: One node is a workflow step, the other is a library/AI form — create a new step for the form
        } else if (sourceStepId || targetStepId) {
          const formNode = sourceStepId ? targetNode : sourceNode;
          const formUiId = formNode?.data?.ui_id || formNode?.data?.component?.id || '';
          const formSchema = formNode?.data?.schema || formNode?.data?.component?.schema;
          const formName = formNode?.data?.title || formNode?.data?.component?.name || 'New Step';
          const formDescription = formNode?.data?.description || formNode?.data?.component?.description || '';
          // Generate a new step_id from the form name
          const newStepId = `step_${(formName).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '')}`;

          if (formUiId || formSchema) {
            const uiConfig = {
              name: formName,
              description: formDescription,
              uiId: formUiId,
              forms: formSchema?.forms || formSchema || {},
            };

            attachUIToStep({
              stepId: newStepId,
              userId: username,
              uiId: formUiId,
              uiConfig,
              workflowId: currentWorkflowId,
              stepName: formName,
              stepDescription: formDescription,
            })
              .then(() => {
                console.log(`✅ Attached UI "${formName}" as new step ${newStepId}`);
                // Update the form node with its new step_id
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === formNode.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            form_id: newStepId,
                            ui_id: formUiId,
                            has_ui_data: true,
                          },
                        }
                      : n
                  )
                );
                setSnackbar({
                  open: true,
                  message: `Attached "${formName}" as step "${newStepId}" in workflow`,
                  severity: "success",
                });
              })
              .catch((err) => {
                console.error(`❌ Failed to attach UI as new step:`, err);
                setSnackbar({
                  open: true,
                  message: `Failed to attach UI: ${err.message}`,
                  severity: "error",
                });
              });
          } else {
            console.info('ℹ️ Edge created visually. Cannot attach — form node has no UI data.', {
              newStepId,
              formUiId,
              hasSchema: !!formSchema,
            });
          }
        } else {
          console.info('ℹ️ Edge created visually. Backend linking skipped — neither node has a workflow step_id.');
        }
      }
    },
    [nodes, theme.palette.primary.main, setEdges, setNodes, currentWorkflowId]
  );

  const handleSaveWorkflow = () => {
    // Open dialog to edit workflow name before saving
    setTempWorkflowName(workflowName);
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Update workflow name from dialog
      setWorkflowName(tempWorkflowName);

      // Close dialog
      setSaveDialogOpen(false);

      // Save workflow with updated name
      // Note: We need to pass the temp name directly since state update is async
      await saveWorkflow(currentWorkflowId, tempWorkflowName);
    } catch (error) {
      console.error("Failed to save workflow:", error);
    }
  };

  const handleTestWorkflow = async () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: "Add components to test the workflow",
        severity: "warning",
      });
      return;
    }

    // Find the first node (entry point)
    const firstNode = nodes[0];
    const apiVersion = getApiVersion();
    let schema = firstNode.data.schema;

    // Treat empty objects as no schema
    if (schema && typeof schema === 'object' && Object.keys(schema).length === 0) {
      schema = null;
    }

    // For Beta API, fetch UI schema if not already loaded
    const firstStepId = firstNode.data.form_id || firstNode.data.ui_id || firstNode.data.component?.id;
    if (apiVersion === 'beta' && !schema && firstStepId) {
      try {
        const stepId = firstStepId;
        console.log(`🔍 Fetching UI schema for first step: ${stepId}`);
        const uiResponse = await fetchStepUI(stepId);
        console.log('📦 Received UI response:', uiResponse);
        if (uiResponse.success && uiResponse.ui_config) {
          schema = uiResponse.ui_config;
          console.log('✅ Schema extracted:', schema);
          // Update node with fetched schema
          setNodes((nds) =>
            nds.map((n) =>
              n.id === firstNode.id
                ? { ...n, data: { ...n.data, schema } }
                : n
            )
          );
        } else if (uiResponse.success && uiResponse.data) {
          schema = uiResponse.data;
          console.log('✅ Schema from data:', schema);
          // Update node with fetched schema
          setNodes((nds) =>
            nds.map((n) =>
              n.id === firstNode.id
                ? { ...n, data: { ...n.data, schema } }
                : n
            )
          );
        }
      } catch (err) {
        console.error(`❌ Failed to fetch UI schema:`, err);
        setSnackbar({
          open: true,
          message: `Failed to load UI schema: ${err.message}`,
          severity: "error",
        });
        return;
      }
    }

    // Start workflow test
    setIsTestingWorkflow(true);
    setCurrentTestNodeIndex(0);
    setWorkflowTestData({});
    setFullPreviewSchema(schema);
    setFullPreviewOpen(true);

    setSnackbar({
      open: true,
      message: `Workflow test started: ${nodes.length} components, ${edges.length} connections`,
      severity: "info",
    });
  };

  /**
   * Handle form submission during workflow testing
   * Navigate to next connected node
   */
  /**
   * Check if a schema object has actual renderable content
   * (not null, not undefined, not an empty object)
   */
  const isValidSchema = (schema) => {
    if (!schema) return false;
    if (typeof schema !== 'object') return false;
    return Object.keys(schema).length > 0;
  };

  const handleWorkflowFormSubmit = async (formData) => {
    console.log("📝 Form submitted in workflow test:", formData);
    console.log("🔍 Current test node index:", currentTestNodeIndex);

    // Store form data for current node
    const currentNode = nodes[currentTestNodeIndex];
    if (!currentNode) return;

    setWorkflowTestData((prev) => ({
      ...prev,
      [currentNode.id]: formData.formData,
    }));

    // Walk edges to find the next node with a renderable schema,
    // skipping nodes that have no UI. Use a local variable to track
    // position so we don't depend on stale React state.
    let walkNodeId = currentNode.id;
    const apiVersion = getApiVersion();
    const maxSkips = nodes.length; // safety cap to prevent infinite loop
    let skips = 0;

    while (skips < maxSkips) {
      const nextEdge = edges.find((edge) => edge.source === walkNodeId);

      if (!nextEdge) {
        // No more nodes - workflow complete
        console.log("✅ Workflow completed!");
        setSnackbar({
          open: true,
          message: "Workflow completed successfully!",
          severity: "success",
        });
        setTimeout(() => {
          setFullPreviewOpen(false);
          setIsTestingWorkflow(false);
          setCurrentTestNodeIndex(0);
        }, 2000);
        return;
      }

      const nextNodeId = nextEdge.target;
      const nextNodeIndex = nodes.findIndex((n) => n.id === nextNodeId);
      const nextNode = nodes[nextNodeIndex];

      if (!nextNode) {
        console.error("❌ Next node not found in nodes array!");
        return;
      }

      console.log("➡️ Navigating to next node:", nextNode.data.title);

      let schema = nextNode.data.schema;

      // Treat empty objects as no schema
      if (!isValidSchema(schema)) {
        schema = null;
      }

      // For Beta API, fetch UI schema if not already loaded
      // Try multiple sources for the step ID
      const stepId = nextNode.data.form_id || nextNode.data.ui_id || nextNode.data.component?.id;
      if (apiVersion === 'beta' && !schema && stepId) {
        try {
          console.log(`🔍 Fetching UI schema for next step: ${stepId}`);
          const uiResponse = await fetchStepUI(stepId);
          if (uiResponse.success && uiResponse.ui_config) {
            schema = uiResponse.ui_config;
          } else if (uiResponse.success && uiResponse.data) {
            schema = uiResponse.data;
          }
          if (schema) {
            // Update node with fetched schema
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nextNode.id
                  ? { ...n, data: { ...n.data, schema } }
                  : n
              )
            );
          }
        } catch (err) {
          console.error(`❌ Failed to fetch UI schema for ${stepId}:`, err);
          // Don't return — try to skip this node and continue
        }
      }

      if (isValidSchema(schema)) {
        // Found a node with schema — navigate to it
        setCurrentTestNodeIndex(nextNodeIndex);
        setFullPreviewSchema(schema);
        setTimeout(() => {
          const formTop = document.getElementById('dynamic-form-top');
          if (formTop) formTop.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setSnackbar({
          open: true,
          message: `Step ${nextNodeIndex + 1}: ${nextNode.data.title}`,
          severity: "success",
        });
        return;
      }

      // No schema — skip this node and continue walking
      console.log(`⏭️ Skipping node "${nextNode.data.title}" (no UI schema, stepId: ${stepId})`);
      walkNodeId = nextNode.id;
      skips++;
    }

    // If we exhausted all skips, something is wrong
    console.error("❌ Could not find a node with schema after skipping", maxSkips, "nodes");
    setSnackbar({
      open: true,
      message: "No more steps with UI data found.",
      severity: "warning",
    });
  };

  // Handle drawer resize with useRef to avoid state issues
  const isResizingRef = React.useRef(false);
  const animationFrameRef = React.useRef(null);
  const lastUpdateTimeRef = React.useRef(0);

  const handleMouseDown = useCallback((e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    isResizingRef.current = true;
    setIsResizing(true);
    setShowResizeHandle(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizingRef.current) return;
    if (!e || typeof e.clientX !== "number") return;

    const newWidth = e.clientX;

    // Only proceed if width is valid
    if (newWidth < 320 || newWidth > 800) return;

    // Throttle updates to every 16ms (60fps)
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 16) return;

    lastUpdateTimeRef.current = now;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      try {
        setDrawerWidth(newWidth);
      } catch (error) {
        console.error("Error updating drawer width:", error);
      } finally {
        animationFrameRef.current = null;
      }
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isResizingRef.current = false;
    setIsResizing(false);
    setShowResizeHandle(false);
  }, []);

  // Set up global mouse event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Box sx={styles.navbarContainer}>
      {/* Page Header */}
      <PageHeader
        title="Workflow Builder"
        subtitle="Visual form composer"
        showBackButton={true}
        backPath="/configurator"
        leftContent={
          <>
            {/* Workflow Selector */}
            <Button
              onClick={(e) => setWorkflowMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDown sx={{ color: "#94a3b8" }} />}
              startIcon={<AccountTree sx={{ fontSize: 18, color: theme.palette.primary.main }} />}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: "#334155",
                textTransform: "none",
                px: 2,
                py: 0.8,
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 2,
                border: `1px solid ${alpha("#000", 0.08)}`,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {workflowName || "Select a Workflow"}
                </Typography>
                {currentWorkflowId && (
                  <Chip
                    label="Saved"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      bgcolor: alpha("#10b981", 0.1),
                      color: "#059669",
                    }}
                  />
                )}
              </Box>
            </Button>

            {/* Actions */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrow fontSize="small" />}
              onClick={handleTestWorkflow}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                py: 0.7,
                borderColor: alpha("#000", 0.12),
                color: "#475569",
                borderRadius: 2,
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  color: theme.palette.primary.main,
                },
              }}
            >
              Test
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Save fontSize="small" />}
              onClick={handleSaveWorkflow}
              disableElevation
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                py: 0.7,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              Save
            </Button>
          </>
        }
        rightContent={
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <ApiVersionToggle />
            <Button
              href="/configurator/ui/template-manager"
              startIcon={<Description fontSize="small" />}
              sx={{
                color: theme.palette.primary.main,
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                py: 0.8,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              Template Manager
            </Button>
          </Box>
        }
      />

      {/* Workflows Dropdown Menu */}
      <Menu
        anchorEl={workflowMenuAnchor}
        open={Boolean(workflowMenuAnchor)}
        onClose={() => setWorkflowMenuAnchor(null)}
        PaperProps={{
          sx: {
            width: 500,
            maxHeight: 400,
            mt: 1,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Your Workflows
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {workflowsList.length} workflow
            {workflowsList.length !== 1 ? "s" : ""} available
          </Typography>
        </Box>

        {workflowsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : workflowsList.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No workflows found. Save your first workflow!
            </Typography>
          </Box>
        ) : (
          workflowsList.map((workflow) => (
            <MenuItem
              key={workflow.workflow_id}
              onClick={() => {
                loadWorkflow(workflow.workflow_id);
                setWorkflowMenuAnchor(null);
              }}
              selected={currentWorkflowId === workflow.workflow_id}
              sx={{
                py: 1.5,
                px: 2,
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                  {workflow.workflow_name}
                </Typography>
                <Chip
                  label={workflow.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.688rem",
                    bgcolor:
                      workflow.status === "draft"
                        ? alpha(theme.palette.warning.main, 0.1)
                        : alpha(theme.palette.success.main, 0.1),
                    color:
                      workflow.status === "draft"
                        ? "warning.main"
                        : "success.main",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteWorkflowDialog({
                      open: true,
                      workflowId: workflow.workflow_id,
                      workflowName: workflow.workflow_name,
                    });
                    setWorkflowMenuAnchor(null);
                  }}
                  sx={{
                    color: "error.main",
                    p: 0.5,
                    "&:hover": {
                      bgcolor: alpha("#DC2626", 0.08),
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <Typography variant="caption" color="text.secondary">
                  {workflow.total_nodes} nodes • {workflow.total_edges}{" "}
                  connections
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  v{workflow.version}
                </Typography>
              </Box>
              {workflow.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  {workflow.description}
                </Typography>
              )}
            </MenuItem>
          ))
        )}

        <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => {
              setWorkflowMenuAnchor(null);
              loadWorkflowsList();
            }}
            sx={{ textTransform: "none" }}
          >
            Refresh List
          </Button>
        </Box>
      </Menu>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Component Library Drawer */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              position: "relative",
              borderRight: "none",
              transition: isResizing ? "none" : "width 0.2s ease",
            },
          }}
        >
          {/* Tabs Header */}
          <Box
            sx={{
              bgcolor: "white",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                minHeight: 48,
                "& .MuiTab-root": {
                  minHeight: 48,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                },
              }}
            >
              <Tab label="Component Library" />
              <Tab label="Workflow Builder" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Component Library Tab */}
            {activeTab === 0 && (
              <List sx={{ p: 2, overflowY: "auto" }}>
                {libraryLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{ mr: 2 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={24} />
                            <Skeleton variant="text" width="40%" height={20} />
                          </Box>
                        </Box>
                        <Skeleton variant="text" width="100%" height={16} />
                        <Skeleton variant="text" width="80%" height={16} />
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <Skeleton variant="rounded" width={80} height={32} />
                          <Skeleton variant="rounded" width={80} height={32} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : componentLibrary.length === 0 ? (
                  // Empty state
                  <Box sx={styles.emptyStateContainer}>
                    <Box sx={styles.emptyStateIconWrapper}>
                      <ViewModuleIcon sx={styles.emptyStateIcon} />
                    </Box>
                    <Typography variant="h6" sx={styles.emptyStateTitle}>
                      No Components Available
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={styles.emptyStateDescription}
                    >
                      Start building your first workflow using the Workflow Builder
                      to get started
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setActiveTab(1)}
                      sx={styles.emptyStateButton}
                    >
                      Create Components
                    </Button>
                  </Box>
                ) : (
                  componentLibrary.map((component) => {
                    const IconComp = getIconComponent(component.icon);

                    return (
                      <Card
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        sx={{
                          mb: 2,
                          border: `2px solid ${alpha(component.color, 0.2)}`,
                          cursor: "grab",
                          "&:active": {
                            cursor: "grabbing",
                          },
                          "&:hover": {
                            border: `2px solid ${component.color}`,
                            boxShadow: `0 4px 12px ${alpha(
                              component.color,
                              0.3
                            )}`,
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: alpha(component.color, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 2,
                              }}
                            >
                              <IconComp sx={{ color: component.color }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {component.name}
                              </Typography>
                              <Chip
                                label={component.category}
                                size="small"
                                sx={{
                                  fontSize: "0.65rem",
                                  height: 18,
                                  bgcolor: alpha(component.color, 0.1),
                                  color: component.color,
                                }}
                              />
                            </Box>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mb: 1,
                              color: "text.secondary",
                            }}
                          >
                            {component.description}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 1,
                            }}
                          >
                            <DragIndicator
                              sx={{ fontSize: 14, color: "text.disabled" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: "text.secondary",
                                fontStyle: "italic",
                              }}
                            >
                              Drag to canvas or click Add
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => handleAddNodeToCanvas(component)}
                              sx={{
                                flex: 1,
                                borderColor: component.color,
                                color: component.color,
                              }}
                            >
                              Add
                            </Button>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComponent(component.id, component.name);
                              }}
                              sx={{
                                color: "error.main",
                                border: "1px solid",
                                borderColor: "error.light",
                                borderRadius: 1,
                                "&:hover": {
                                  bgcolor: alpha("#DC2626", 0.08),
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </List>
            )}

            {/* AI Component Builder Tab */}
            {activeTab === 1 && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <ErrorBoundary fallbackMessage="Unable to load AI Component Builder. Please refresh the page.">
                  <AIComponentBuilder onAddToCanvas={handleAddNodeToCanvas} onWorkflowGenerated={handleWorkflowGenerated} />
                </ErrorBoundary>
              </Box>
            )}
          </Box>

          {/* Resize Handle */}
          {drawerOpen && (
            <Box
              onMouseDown={handleMouseDown}
              onMouseEnter={() => {
                if (!isResizing) setShowResizeHandle(true);
              }}
              onMouseLeave={() => {
                if (!isResizing) setShowResizeHandle(false);
              }}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 12,
                cursor: "col-resize",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  showResizeHandle || isResizing
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                borderRight: `2px solid ${
                  showResizeHandle || isResizing
                    ? theme.palette.primary.main
                    : theme.palette.divider
                }`,
                transition: isResizing ? "none" : "all 0.2s ease",
                zIndex: 10,
                userSelect: "none",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              {(showResizeHandle || isResizing) && (
                <Box
                  sx={{
                    width: 4,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.main,
                    boxShadow: 1,
                    pointerEvents: "none",
                  }}
                />
              )}
            </Box>
          )}
        </Drawer>

        {/* Canvas */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              position: "relative",
              minWidth: 0,
              overflow: "hidden",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isMounted ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                defaultEdgeOptions={{ type: "smoothstep", animated: true }}
                minZoom={0.1}
                maxZoom={1.5}
                style={{ width: "100%", height: "100%" }}
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            ) : (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {/* Empty State */}
            {nodes.length === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <AccountTree
                  sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Drag & Drop to Start Building
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Drag components from the library or click Add button
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Preview Dialog (Basic Component Info) */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Component Preview: {selectedComponent?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a preview of the component. Full schema rendering requires
            backend integration.
          </Alert>
          {selectedComponent && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedComponent.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fields:
                  </Typography>
                  <Typography variant="h6">
                    {selectedComponent.fields_count}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    estimated Time:
                  </Typography>
                  <Typography variant="h6">
                    {selectedComponent.estimated_time}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Full Form Preview Dialog - Minimal Mobile Mockup */}
      <Dialog
        open={fullPreviewOpen}
        onClose={() => setFullPreviewOpen(false)}
        maxWidth="sm"
        PaperProps={{ sx: styles.dialogPaper }}
      >
        {/* Close Button - Top Right */}
        <IconButton
          onClick={() => setFullPreviewOpen(false)}
          sx={styles.closeButton}
        >
          <Close />
        </IconButton>

        <DialogContent sx={styles.dialogContent}>
          {/* Mobile Phone Mockup - iPhone Style (Slim & Tall) */}
          <Box sx={styles.iphoneMockup}>
            {/* Mobile Screen Content */}
            <Box sx={styles.mobileScreen}>
              {/* Status Bar with Logo */}
              <Box sx={styles.mobileHeader}>
                {/* Back Button */}
                <IconButton size="small" sx={styles.backButton}>
                  <ArrowBack sx={{ fontSize: 18 }} />
                </IconButton>

                {/* Logo */}
                <Box sx={styles.mobileLogo}>
                  <img
                    src="/mifix-logo.png"
                    alt="Mifix"
                    style={{
                      width: "80px",
                      height: "24px",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                {/* Time */}
                <Typography variant="caption" sx={styles.mobileTime}>
                  9:41
                </Typography>
              </Box>

              {/* Workflow Progress Indicator (only during testing) */}
              {isTestingWorkflow && (
                <Box sx={styles.workflowProgress}>
                  <Box sx={styles.workflowBadge}>
                    <Typography variant="caption" sx={styles.workflowLabel}>
                      WORKFLOW TEST
                    </Typography>
                    <Chip
                      label={`Step ${currentTestNodeIndex + 1} of ${
                        nodes.length
                      }`}
                      size="small"
                      sx={styles.workflowChip}
                    />
                  </Box>
                  <Typography variant="caption" sx={styles.workflowTitle}>
                    {nodes[currentTestNodeIndex]?.data?.title || "Current Form"}
                  </Typography>
                </Box>
              )}

              {/* Form Content - Scrollable with Padding */}
              <Box sx={styles.formContent}>
                {fullPreviewSchema ? (
                  <UnifiedFormRenderer
                    key={JSON.stringify(fullPreviewSchema)}
                    schema={fullPreviewSchema}
                    hideMetadata={true}
                    skipNavigation={isTestingWorkflow}
                    onSubmit={(data) => {
                      console.log("🚀 SUBMIT BUTTON CLICKED!");
                      console.log("🚀 Form Preview Submit:", data);
                      console.log("🚀 isTestingWorkflow:", isTestingWorkflow);

                      // If testing workflow, navigate to next node
                      if (isTestingWorkflow) {
                        console.log("🚀 Calling handleWorkflowFormSubmit...");
                        handleWorkflowFormSubmit(data);
                      } else {
                        // Regular preview mode
                        console.log(
                          "🚀 Regular preview mode - showing demo message"
                        );
                        setSnackbar({
                          open: true,
                          message: "Form preview submitted (demo only)",
                          severity: "info",
                        });
                      }
                    }}
                  />
                ) : (
                  <Box sx={styles.loadingContainer}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Field Manager Dialog */}
      <FieldManagerDialog
        open={fieldManagerOpen}
        onClose={() => {
          setFieldManagerOpen(false);
          setSelectedComponent(null);
          setSelectedSchema(null);
        }}
        component={selectedComponent}
        schema={selectedSchema}
        onConfigureApi={handleConfigureFieldApi}
      />

      {/* API Configuration Dialog */}
      <ApiConfigDialog
        open={apiConfigDialogOpen}
        onClose={() => {
          setApiConfigDialogOpen(false);
          setSelectedField(null);
        }}
        onSave={handleSaveApiConfig}
        initialConfig={selectedField?.api || null}
        buttonLabel={
          selectedField?.label || selectedField?.buttonLabel || "Button"
        }
      />

      {/* API Configuration Chat Dialog */}
      <ApiConfigChatDialog
        open={apiConfigChatOpen}
        onClose={() => {
          setApiConfigChatOpen(false);
          setSelectedComponent(null);
          setSelectedNodeForConfig(null);
        }}
        component={selectedComponent}
        formId={selectedComponent?.id}
        workflowId={currentWorkflowId}
        onConfigUpdate={handleApiConfigUpdate}
        onWorkflowRefresh={loadWorkflowsList}
      />

      {/* Save Workflow Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Save color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Save Workflow
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Workflow Name"
              value={tempWorkflowName}
              onChange={(e) => setTempWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
              autoFocus
              helperText={`${nodes.length} components, ${edges.length} connections`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            startIcon={<Save />}
            disabled={!tempWorkflowName.trim()}
            sx={{ textTransform: "none" }}
          >
            Save Workflow
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Component Confirmation Dialog */}
      <Dialog
        open={deleteComponentDialog.open}
        onClose={() => setDeleteComponentDialog({ open: false, componentId: null, componentName: "" })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Component</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{deleteComponentDialog.componentName}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteComponentDialog({ open: false, componentId: null, componentName: "" })}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteComponent}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Workflow Confirmation Dialog */}
      <Dialog
        open={deleteWorkflowDialog.open}
        onClose={() => setDeleteWorkflowDialog({ open: false, workflowId: null, workflowName: "" })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{deleteWorkflowDialog.workflowName}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteWorkflowDialog({ open: false, workflowId: null, workflowName: "" })}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteWorkflow}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={styles.snackbar.autoHideDuration}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={styles.snackbar.anchorOrigin}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={styles.snackbarAlert}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UIConfiguratorPage;
