"use client";

import React, { useState, useEffect, useRef } from "react";
import { toZonedTime, format } from "date-fns-tz";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  useTheme,
  IconButton,
  CircularProgress,
  Button,
  Paper,
  Chip,
  Skeleton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";
import apiClient from "../services/apiClient";
import NavigationLoader from "./common/NavigationLoader";
import GavelIcon from "@mui/icons-material/Gavel";
import {
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Chat as ChatIcon,
  People as CustomersIcon,
  People as PeopleIcon,
  Assessment as IncentiveIcon,
  Close as CloseIcon,
  Build as ConfiguratorIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Security as AccessControlIcon,
  Storage as DataIcon,
  Psychology as AIIcon,
  AccountTree as GraphIcon,
  Category as CategoryIcon,
  ArrowForward as ArrowIcon,
  SmartToy as SmartToyIcon,
} from "@mui/icons-material";
// import NewStreetLogo from '../../public/assets/NewStreetLogo'; // Replaced with MiFiX logo
import MiFixLogoLight from "../../public/assets/MiFixLogoLight";

const drawerWidth = 240; // Reduced width

import { MENU_ITEMS, getAccessibleMenuItems } from "../config/roleConfig";
import useDashboardStore from "../store/dashboardStore";

// Icon mapping for dynamic icon rendering
const ICON_MAP = {
  ChatIcon: ChatIcon,
  DashboardIcon: DashboardIcon,
  PeopleIcon: PeopleIcon,
  ConfiguratorIcon: ConfiguratorIcon,
  AccessControlIcon: AccessControlIcon,
  SettingsIcon: SettingsIcon,
  BuildIcon: BuildIcon,
  CategoryIcon: CategoryIcon,
  DataIcon: DataIcon,
  AIIcon: AIIcon,
  GraphIcon: GraphIcon,
  SmartToyIcon: SmartToyIcon,
};



const Sidebar = ({
  selectedTab,
  onTabChange,
  onLoadConversation,
  mode = "chat",
  onSelectAnalysis,
  mobileOpen,
  onMobileClose,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const { user, getUserRoles, hasRole, isSuperAdmin, isRegularUser } =
    useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // Get visualizations from active dashboard
  const { activeDashboardId, visualizationsByDashboard, getActiveDashboard } = useDashboardStore();
  const activeDashboard = getActiveDashboard();

  // Get filtered menu items based on user roles
  const getFilteredMenuItems = () => {
    if (!user) {
      return [];
    }

    const userRoleCodes = getUserRoles();
    const items = getAccessibleMenuItems(userRoleCodes);
    return items.map((item) => ({
      ...item,
      icon: ICON_MAP[item.icon] || ChatIcon, // Fallback to ChatIcon if not found
    }));
  };

  const menuItems = getFilteredMenuItems();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [conversationContainer, setConversationContainer] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState("");
  
  // Ref to prevent duplicate API calls (React Strict Mode)
  const initialFetchDone = useRef(false);

  // Analyses state (for dashboard mode)
  const [analyses, setAnalyses] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisLoadingMore, setAnalysisLoadingMore] = useState(false);
  const [analysisHasMore, setAnalysisHasMore] = useState(true);
  const [analysisPage, setAnalysisPage] = useState(1);

  // Helper function to convert UTC to IST
  const formatToIST = (dateString) => {
    try {
      // Ensure the date is parsed as UTC
      const utcDate = new Date(
        dateString.endsWith("Z") ? dateString : dateString + "Z"
      );
      const istDate = toZonedTime(utcDate, "Asia/Kolkata");
      return format(istDate, "MMM d, hh:mm a");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Helper function to format time as "X mins/hours ago"
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return formatToIST(dateString);
    } catch (error) {
      return "—";
    }
  };

  // Detect pathname changes to reset navigation state
  useEffect(() => {
    // If pathname changed and we're navigating, the navigation completed
    if (pathname !== prevPathnameRef.current && isNavigating) {
      console.log('✅ [Sidebar] Navigation completed, resetting loader');
      setIsNavigating(false);
      setNavigationMessage("");
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isNavigating]);

  // Safety timeout: reset navigation state after 3 seconds
  useEffect(() => {
    let timeoutId;
    if (isNavigating) {
      console.log('⏱️ [Sidebar] Navigation timeout started (3s safety net)');
      timeoutId = setTimeout(() => {
        console.log('⚠️ [Sidebar] Navigation timeout reached, forcing reset');
        setIsNavigating(false);
        setNavigationMessage("");
      }, 15000); // 15 second timeout as safety net for slow loads/compilation
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isNavigating]);

  // Load analyses from Zustand store for active dashboard
  const PAGE_SIZE = 10;
  const loadAnalyses = (pageNum = 1, append = false) => {
    if (pageNum === 1) setAnalysisLoading(true);
    else setAnalysisLoadingMore(true);
    try {
      // Get visualizations from active dashboard in Zustand store
      const dashboardVisualizations = visualizationsByDashboard[activeDashboardId] || [];
      
      // Sort newest first
      const sorted = [...dashboardVisualizations].sort(
        (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
      );
      const start = (pageNum - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const slice = sorted.slice(start, end);
      if (append) {
        setAnalyses((prev) => [...prev, ...slice]);
      } else {
        setAnalyses(slice);
      }
      setAnalysisHasMore(end < sorted.length);
      setAnalysisPage(pageNum);
    } catch (e) {
      console.error("Error loading saved analyses:", e);
      setAnalyses([]);
      setAnalysisHasMore(false);
    } finally {
      setAnalysisLoading(false);
      setAnalysisLoadingMore(false);
    }
  };

  // Fetch conversation history with pagination
  const fetchConversations = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const username = authService.getUsername();
      if (!username) {
        console.error("No username found in localStorage");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const data = await apiClient.get(
        `/users/${username}/conversations?page=${pageNum}&limit=10`
      );
      if (data) {
        const newConversations = data.conversations || [];

        if (append) {
          setConversations((prev) => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }

        setHasMore(newConversations.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (mode === "dashboard") {
      if (
        scrollHeight - scrollTop === clientHeight &&
        analysisHasMore &&
        !analysisLoadingMore
      ) {
        loadAnalyses(analysisPage + 1, true);
      }
    } else {
      if (
        scrollHeight - scrollTop === clientHeight &&
        hasMore &&
        !loadingMore
      ) {
        fetchConversations(page + 1, true);
      }
    }
  };

  // Fetch conversation details and load chat
  const loadConversation = async (conversationId) => {
    try {
      const data = await apiClient.get(
        `/conversations/${conversationId}/history`
      );
      if (data) {
        // Call the callback to load the conversation in the main app
        if (onLoadConversation) {
          onLoadConversation(data.history);
        }
        // Close mobile drawer after loading conversation
        if (isMobile && onMobileClose) {
          onMobileClose();
        }
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  useEffect(() => {
    // Prevent duplicate calls from React Strict Mode
    if (initialFetchDone.current) {
      console.log('🔄 Sidebar: Skipping duplicate fetch (already done)');
      return;
    }
    initialFetchDone.current = true;
    
    console.log('📡 Sidebar: Initial fetch, mode:', mode);
    
    if (mode === "dashboard") {
      loadAnalyses(1, false);
    } else {
      fetchConversations(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Separate effect for mode changes (after initial load)
  const prevMode = useRef(mode);
  useEffect(() => {
    // Skip initial render
    if (prevMode.current === mode) {
      return;
    }
    prevMode.current = mode;
    
    console.log('🔀 Sidebar: Mode changed to:', mode);
    
    if (mode === "dashboard") {
      loadAnalyses(1, false);
    } else {
      fetchConversations(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleMenuClick = (item) => {
    // Map of item IDs to their routes
    const routeMap = {
      dashboard: "/dashboard",
      chat: "/",
      configurator: "/configurator",
      leads: "/leads",
      productConfigurator: "/product-configurator",
      creConfigurator: "/configurator/cre",
      accessControl: "/access-control",
    };

    const targetRoute = item.path || routeMap[item.id];
    
    // If this item has a route, check if we're already there
    if (targetRoute) {
      // Check if we're already on this route
      if (pathname === targetRoute) {
        console.log(`ℹ️ [Sidebar] Already on ${targetRoute}, skipping navigation`);
        return; // Don't navigate if already on the same page
      }

      // Navigate to the target route
      console.log(`🚀 [Sidebar] Navigating to: ${targetRoute}`);
      setIsNavigating(true);
      setNavigationMessage(`Loading ${item.label}...`);
      
      try {
        router.push(targetRoute);
      } catch (error) {
        console.error('❌ [Sidebar] Navigation error:', error);
        // Reset navigation state on error
        setIsNavigating(false);
        setNavigationMessage("");
      }
    } else {
      // For other items without routes, use the callback
      onTabChange(item.id);
    }
  };

  // Group menu items into categories for visual organization
  const groupedMenuItems = React.useMemo(() => {
    const mainIds = ["chat", "dashboard"];
    const configuratorIds = ["workflow_configurator", "retriever_configurator", "mifix_ai_agents", "productConfigurator", "creConfigurator"];
    const adminIds = ["accessControl"];

    const main = menuItems.filter(item => mainIds.includes(item.id));
    const modules = menuItems.filter(item => !mainIds.includes(item.id) && !configuratorIds.includes(item.id) && !adminIds.includes(item.id));
    const configurators = menuItems.filter(item => configuratorIds.includes(item.id));
    const admin = menuItems.filter(item => adminIds.includes(item.id));

    const groups = [];
    if (main.length) groups.push({ label: null, items: main });
    if (modules.length) groups.push({ label: "Modules", items: modules });
    if (configurators.length) groups.push({ label: "Configurators", items: configurators });
    if (admin.length) groups.push({ label: "Admin", items: admin });
    return groups;
  }, [menuItems]);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* Header / Logo */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(145deg, #f0f4ff 0%, #e8eeff 100%)",
            border: "1px solid rgba(37, 99, 235, 0.12)",
            flexShrink: 0,
          }}
        >
          <Image
            src="/Mifix-ai.png"
            alt="MiFiX AI"
            width={48}
            height={48}
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            MiFiX.ai
          </Typography>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 500,
              color: "#9CA3AF",
              letterSpacing: "0.02em",
            }}
          >
            Intelligent Platform
          </Typography>
        </Box>
      </Box>

      {/* Scrollable content area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 2,
          pb: 2,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
        onScroll={handleScroll}
      >
        {/* Quick Links heading */}
        <Box sx={{ px: 0.5, pt: 1, pb: 1 }}>
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Quick Links
          </Typography>
        </Box>

        {/* Grouped Navigation */}
        {groupedMenuItems.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ mb: 1.5 }}>
            {group.label && (
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#B0B8C9",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  px: 0.5,
                  pt: groupIndex > 0 ? 0.5 : 0,
                  pb: 0.5,
                }}
              >
                {group.label}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {group.items.map((item, index) => {
                const Icon = item.icon;
                const isSelected = selectedTab === item.id || pathname === item.path;

                return (
                  <Box
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 2.5,
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                      background: isSelected
                        ? `linear-gradient(135deg, ${item.color}14 0%, ${item.color}08 100%)`
                        : "transparent",
                      border: isSelected
                        ? `1px solid ${item.color}30`
                        : "1px solid transparent",
                      boxShadow: isSelected
                        ? `0 1px 4px ${item.color}10`
                        : "none",
                      "&:hover": {
                        background: isSelected
                          ? `linear-gradient(135deg, ${item.color}1a 0%, ${item.color}0d 100%)`
                          : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    {/* Active indicator bar */}
                    {isSelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 3,
                          height: "60%",
                          borderRadius: "0 4px 4px 0",
                          background: item.color,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        minWidth: 34,
                        borderRadius: 2,
                        background: isSelected
                          ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}cc 100%)`
                          : `${item.color}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <Icon
                        sx={{
                          color: isSelected ? "#fff" : item.color,
                          fontSize: 17,
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? "#111827" : "#4B5563",
                        flex: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <ArrowIcon
                      sx={{
                        fontSize: 14,
                        color: isSelected ? item.color : "#D1D5DB",
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}

        {/* Divider between nav and history */}
        <Box sx={{ py: 1 }}>
          <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
        </Box>

        {/* Recent Section: Chat or Analyses */}
        <Box sx={{ px: 0.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {mode === "dashboard" ? (
                <>
                  <DashboardIcon sx={{ fontSize: 13 }} />
                  Saved Insights
                </>
              ) : (
                <>
                  <ChatIcon sx={{ fontSize: 13 }} />
                  Chat History
                </>
              )}
            </Typography>
          </Box>
          <Chip
            label={
              mode === "dashboard"
                ? `${analyses.length}`
                : `${conversations.length}`
            }
            size="small"
            sx={{
              height: 18,
              minWidth: 24,
              fontSize: "0.6rem",
              fontWeight: 600,
              backgroundColor: "#EEF2FF",
              color: "#2563EB",
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        </Box>

        {/* History items */}
        {mode === "dashboard" ? (
          analysisLoading && analyses.length === 0 ? (
            <Box sx={{ py: 1 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width="100%"
                  height={52}
                  sx={{ borderRadius: 2.5, mb: 1, opacity: 0.5 }}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {analyses.map((item, index) => (
                  <Box
                    key={item.id || `${item.title}-${index}`}
                    onClick={() => {
                      const widgetElement = document.getElementById(`widget-${item.id}`);
                      if (widgetElement) {
                        widgetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        widgetElement.style.boxShadow = '0 0 0 3px #3B82F6';
                        setTimeout(() => { widgetElement.style.boxShadow = ''; }, 2000);
                      }
                      if (onSelectAnalysis) onSelectAnalysis(item.id);
                      if (isMobile && onMobileClose) onMobileClose();
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1.4,
                      borderRadius: 2.5,
                      cursor: "pointer",
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.06)",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                      "&:hover": {
                        background: "#f8faff",
                        borderColor: "rgba(37, 99, 235, 0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <Tooltip title={item.question || item.title || "Saved Analysis"}>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#1F2937",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.question || item.title || "Saved Analysis"}
                        </Typography>
                      </Tooltip>
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#9CA3AF",
                          mt: 0.2,
                        }}
                      >
                        {item.timestamp ? formatToIST(item.timestamp) : "—"}
                      </Typography>
                    </Box>
                    <Chip
                      label="Saved"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        backgroundColor: "#ECFDF5",
                        color: "#059669",
                        "& .MuiChip-label": { px: 0.8 },
                        flexShrink: 0,
                      }}
                    />
                  </Box>
              ))}

              {analysisLoadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={18} sx={{ color: "#2563EB" }} />
                </Box>
              )}

              {analyses.length === 0 && !analysisLoading && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    px: 2,
                    borderRadius: 3,
                    background: "rgba(0,0,0,0.02)",
                    border: "1px dashed rgba(0,0,0,0.08)",
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
                  <Typography sx={{ color: "#6B7280", fontSize: "0.82rem", fontWeight: 500, mb: 0.5 }}>
                    No insights yet
                  </Typography>
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.72rem" }}>
                    Save visualizations from chat
                  </Typography>
                </Box>
              )}
            </Box>
          )
        ) : loading && conversations.length === 0 ? (
          <Box sx={{ py: 1 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width="100%"
                height={52}
                sx={{ borderRadius: 2.5, mb: 1, opacity: 0.5 }}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {conversations.map((conversation, index) => (
                <Box
                  key={conversation.id}
                  onClick={() => loadConversation(conversation.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.4,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.06)",
                    transition: "background 0.15s ease, border-color 0.15s ease",
                    "&:hover": {
                      background: "#f8faff",
                      borderColor: "rgba(37, 99, 235, 0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#1F2937",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {conversation.title || `Conversation ${index + 1}`}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "#9CA3AF",
                        mt: 0.2,
                      }}
                    >
                      {formatTimeAgo(conversation.updated_at)}
                    </Typography>
                  </Box>
                  <Chip
                    label="Recent"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      backgroundColor: "#ECFDF5",
                      color: "#059669",
                      "& .MuiChip-label": { px: 0.8 },
                      flexShrink: 0,
                    }}
                  />
                </Box>
            ))}

            {loadingMore && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={18} sx={{ color: "#2563EB" }} />
              </Box>
            )}

            {conversations.length === 0 && !loading && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  px: 2,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.02)",
                  border: "1px dashed rgba(0,0,0,0.08)",
                }}
              >
                <ChatIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
                <Typography sx={{ color: "#6B7280", fontSize: "0.82rem", fontWeight: 500, mb: 0.5 }}>
                  No conversations yet
                </Typography>
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.72rem" }}>
                  Start a chat to see history
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Footer branding */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid rgba(0,0,0,0.05)",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22C55E",
            boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
          }}
        />
        <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", fontWeight: 500 }}>
          System Online
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: 300 },
        flexShrink: { md: 0 },
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%)",
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0,0,0,0.08), 1px 0 0 rgba(0,0,0,0.04)",
            height: "100%",
            maxHeight: "100dvh",
            overflow: "hidden",
            WebkitOverflowScrolling: "touch",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%)",
            borderRight: "none",
            boxShadow: "1px 0 0 rgba(0,0,0,0.04), 4px 0 16px rgba(0,0,0,0.03)",
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            overflow: "hidden",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Navigation Loader */}
      {isNavigating && <NavigationLoader message={navigationMessage} />}
    </Box>
  );
};

export default Sidebar;
