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
import { getFormSchemaById } from "@/components/dynamic-form/sampleFormSchemas";
import ApiConfigDialog from "@/components/configurator/ApiConfigDialog";
import ApiConfigChatDialog from "@/components/configurator/ApiConfigChatDialog";
import FieldManagerDialog from "@/components/configurator/FieldManagerDialog";
import FormPreviewNode from "@/components/configurator/FormPreviewNode";
import AIComponentBuilder from "@/components/configurator/AIComponentBuilder";
import ErrorBoundary from "@/components/ErrorBoundary";
import uiConfiguratorService from "@/services/uiConfiguratorService";
import Image from "next/image";

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
      width: { xs: 320, sm: 350 },
      height: { xs: 680, sm: 720 },
      maxWidth: "100%",
      position: "relative",
      borderRadius: "42px",
      bgcolor: "#000",
      padding: "8px",
      boxShadow: `
        0 0 0 1px ${alpha("#000", 0.1)},
        0 12px 40px ${alpha("#000", 0.2)},
        inset 0 0 0 1px ${alpha("#fff", 0.1)}
      `,
      "&::before": {
        content: '""',
        position: "absolute",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        width: 110,
        height: 28,
        bgcolor: "#000",
        borderRadius: "0 0 18px 18px",
        zIndex: 10,
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 22,
        left: "50%",
        transform: "translateX(-50%)",
        width: 7,
        height: 7,
        bgcolor: alpha("#1a1a1a", 0.9),
        borderRadius: "50%",
        zIndex: 11,
      },
    },

    mobileScreen: {
      width: "100%",
      height: "100%",
      bgcolor: "#fff",
      borderRadius: "36px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },

    mobileHeader: {
      height: 70,
      bgcolor: "#fff",
      borderBottom: `1px solid ${alpha("#000", 0.08)}`,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      px: 2,
      pb: 1.5,
      pt: 3,
    },

    backButton: {
      width: 32,
      height: 32,
      bgcolor: alpha("#000", 0.04),
      "&:hover": {
        bgcolor: alpha("#000", 0.08),
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
      overflowY: "auto",
      overflowX: "hidden",
      px: 2,
      py: 2,
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

    // Dialog
    dialogPaper: {
      maxHeight: "95vh",
      bgcolor: alpha(theme.palette.grey[100], 0.5),
      borderRadius: 3,
      position: "relative",
    },

    dialogContent: {
      p: { xs: 2, sm: 4 },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "90vh",
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
      right: 16,
      top: 16,
      zIndex: 1,
      bgcolor: "white",
      boxShadow: 2,
      "&:hover": {
        bgcolor: alpha("#fff", 0.9),
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
      // Fetch component library from API
      const username = "vaishakhsk"; // Get from auth service if needed
      const libraryData = await uiConfiguratorService.getComponentLibrary(
        username
      );

      console.log("📚 Component Library Data:", libraryData);

      // Transform API data to component format for the drawer
      const components = [];

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
        const username = "vaishakhsk"; // Get from auth service
        const productId = "loan_app"; // Get from context or props

        // Use custom name if provided, otherwise use state
        const nameToUse = customWorkflowName || workflowName;

        // Prepare workflow data matching backend structure
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
              type: edge.type || "default",
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

        // Call API to save workflow
        let response;
        if (workflowId) {
          // Update existing workflow
          response = await uiConfiguratorService.updateWorkflow(
            workflowId,
            workflowData
          );
        } else {
          // Create new workflow
          response = await uiConfiguratorService.saveWorkflow(workflowData);
        }

        console.log("✅ Workflow saved:", response);

        // Store workflow ID for future updates
        if (response.success && response.data && response.data.workflow_id) {
          setCurrentWorkflowId(response.data.workflow_id);
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
        const response = await uiConfiguratorService.getWorkflow(workflowId);

        if (!response.success || !response.data) {
          throw new Error("Invalid workflow response");
        }

        const workflowData = response.data;

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
              onPreview: (comp) => {
                setFullPreviewSchema(comp.schema || node.data.schema);
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
          type: edge.type || "default",
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
   * Load list of workflows for the user
   */
  const loadWorkflowsList = useCallback(async () => {
    try {
      setWorkflowsLoading(true);
      const username = "vaishakhsk"; // Get from auth service
      const productId = "loan_app"; // Get from context or props

      const data = await uiConfiguratorService.getUserWorkflows(
        username,
        productId
      );

      console.log("📋 Workflows list loaded:", data);

      setWorkflowsList(data.workflows || []);
    } catch (error) {
      console.error("❌ Error loading workflows list:", error);
      setSnackbar({
        open: true,
        message: "Failed to load workflows list",
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

      // Update the node's schema with the new configuration
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeForConfig.id) {
            if (isFullSchema) {
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
        message: isFullSchema
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

  const handleConnect = (params) => {
    const newEdge = {
      ...params,
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
  };

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

  const handleTestWorkflow = () => {
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

    // Start workflow test
    setIsTestingWorkflow(true);
    setCurrentTestNodeIndex(0);
    setWorkflowTestData({});
    setFullPreviewSchema(firstNode.data.schema);
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
  const handleWorkflowFormSubmit = (formData) => {
    console.log("📝 Form submitted in workflow test:", formData);
    console.log("🔍 Current test node index:", currentTestNodeIndex);
    console.log("🔍 Total nodes:", nodes.length);
    console.log("🔍 Total edges:", edges.length);

    // Store form data
    const currentNode = nodes[currentTestNodeIndex];
    console.log("🔍 Current node:", currentNode);
    console.log("🔍 Current node ID:", currentNode?.id);
    console.log("🔍 Current node title:", currentNode?.data?.title);

    setWorkflowTestData((prev) => ({
      ...prev,
      [currentNode.id]: formData.formData,
    }));

    // Find next node connected to current node
    const currentNodeId = currentNode.id;
    console.log("🔍 Looking for edge with source:", currentNodeId);
    console.log("🔍 All edges:", edges);

    const nextEdge = edges.find((edge) => edge.source === currentNodeId);
    console.log("🔍 Found next edge:", nextEdge);

    if (nextEdge) {
      // Find the next node
      const nextNodeId = nextEdge.target;
      console.log("🔍 Next node ID:", nextNodeId);

      const nextNodeIndex = nodes.findIndex((n) => n.id === nextNodeId);
      console.log("🔍 Next node index:", nextNodeIndex);

      const nextNode = nodes[nextNodeIndex];
      console.log("🔍 Next node:", nextNode);

      if (nextNode) {
        console.log("➡️ Navigating to next node:", nextNode.data.title);
        console.log("🔍 Next node schema:", nextNode.data.schema);

        // Update current node index
        setCurrentTestNodeIndex(nextNodeIndex);

        // Update preview schema to next form
        setFullPreviewSchema(nextNode.data.schema);

        setSnackbar({
          open: true,
          message: `Moving to: ${nextNode.data.title}`,
          severity: "success",
        });
      } else {
        console.error("❌ Next node not found in nodes array!");
      }
    } else {
      // No more nodes - workflow complete
      console.log("✅ Workflow completed!");
      console.log("📊 Collected data:", workflowTestData);

      setSnackbar({
        open: true,
        message: "Workflow completed successfully! 🎉",
        severity: "success",
      });

      // Close preview after 2 seconds
      setTimeout(() => {
        setFullPreviewOpen(false);
        setIsTestingWorkflow(false);
        setCurrentTestNodeIndex(0);
      }, 2000);
    }
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
      {/* Professional Navbar */}
      <Paper elevation={0} sx={styles.navbarPaper}>
        <Box sx={styles.navbarContent}>
          {/* Back Button - Extreme Left */}
          <Tooltip title="Back to Configurator">
            <IconButton
              onClick={() => router.push("/configurator")}
              size="small"
              sx={{
                color: "primary.main",
                borderRadius: 0,
                px: 2,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ArrowBack fontSize="medium" />
            </IconButton>
          </Tooltip>

          {/* Left Section - MiFiX Studio + Workflow Builder */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Logo & Title */}
            <Box sx={styles.navbarLogo}>
              <img
                src="/mifix-logo.png"
                alt="MiFiX Studio"
                style={styles.navbarLogoImage}
              />
              <Typography variant="h6" sx={styles.navbarTitle}>
                MiFiX Studio
              </Typography>
            </Box>

            {/* Workflow Info */}
            <Box sx={styles.navbarWorkflowInfo}>
              <Box sx={styles.navbarWorkflowIcon}>
                <AccountTree sx={styles.navbarWorkflowIconSvg} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={styles.navbarWorkflowName}>
                  Workflow Builder
                </Typography>
                <Typography
                  variant="caption"
                  sx={styles.navbarWorkflowSubtitle}
                >
                  Visual form composer
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Center Section - Workflow Selector + Actions */}
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "center", mr: 4 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Workflow Selector */}
              <Button
                onClick={(e) => setWorkflowMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDropDown />}
                startIcon={<FolderOpen />}
                sx={{
                  bgcolor: alpha("#000", 0.02),
                  color: "text.primary",
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  border: `1px solid transparent`,
                  "&:hover": {
                    bgcolor: alpha("#000", 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {workflowName}
                  </Typography>
                  {currentWorkflowId && (
                    <Chip
                      label="Saved"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.75rem",
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: "success.main",
                      }}
                    />
                  )}
                </Box>
              </Button>

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
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 3 }}
                  >
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
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, flex: 1 }}
                        >
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

                <Box
                  sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}
                >
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

              {/* Actions */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrow fontSize="small" />}
                onClick={handleTestWorkflow}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  borderColor: alpha("#000", 0.12),
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    color: "primary.main",
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
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>

          {/* Right Section - Template Manager */}
          <Button
            href="/configurator/ui/template-manager"
            startIcon={<Description fontSize="small" />}
            sx={{
              color: "#1976d2",
              textTransform: "none",
              fontWeight: 600,
              gap: 2,
              px: 2,
              py: 1,
              mr: 2,
              borderRadius: 2,
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.15)",
              },
            }}
          >
            Template Manager
          </Button>
        </Box>
      </Paper>

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
              <Tab label="UI Builder" iconPosition="start" />
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
                      Start building your first component using the UI Builder
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
                            {/* <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  handlePreviewComponent(component)
                                }
                              >
                                Preview
                              </Button> */}
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
                  <AIComponentBuilder onAddToCanvas={handleAddNodeToCanvas} />
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
                defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
                minZoom={0.3}
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
                  <DynamicUIRenderer
                    key={JSON.stringify(fullPreviewSchema)}
                    data={fullPreviewSchema}
                    hideMetadata={true}
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
        onConfigUpdate={handleApiConfigUpdate}
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
