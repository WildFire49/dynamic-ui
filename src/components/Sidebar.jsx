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
  Fade,
  Skeleton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
};

// Additional menu items for configurator modules
const CONFIGURATOR_ITEMS = [
  {
    id: "ui-configurator",
    label: "UI Configurator",
    path: "/configurator/ui",
    icon: ConfiguratorIcon,
    color: "#1976d2",
  },
  {
    id: "data-configurator",
    label: "Data Configurator",
    path: "/configurator/retriever",
    icon: BuildIcon,
    color: "#48bb78",
  },
];

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
    // Handle navigation for specific items
    if (item.id === "dashboard") {
      // Navigate to dashboard page
      setIsNavigating(true);
      setNavigationMessage("Loading Dashboard...");
      router.push("/dashboard");
    } else if (item.id === "chat") {
      // Navigate to chat page (base route)
      setIsNavigating(true);
      setNavigationMessage("Loading Chat...");
      router.push("/");
    } else if (item.id === "chat" && mode === "dashboard") {
      // Navigate to chat page from dashboard
      setIsNavigating(true);
      setNavigationMessage("Loading Chat...");
      router.push("/");
    } else if (item.id === "configurator") {
      // Show loader and navigate to configurator
      setIsNavigating(true);
      setNavigationMessage("Loading Configurator...");
      router.push("/configurator");
    } else if (item.id === "leads") {
      // Navigate to Internal CPH (leads) page
      setIsNavigating(true);
      setNavigationMessage("Loading Internal CPH...");
      router.push("/leads");
    } else if (item.id === "productConfigurator") {
      // Navigate to Product Configurator page
      setIsNavigating(true);
      setNavigationMessage("Loading Product Configurator...");
      router.push("/product-configurator");
    } else if (item.id === "creConfigurator") {
      // Navigate to CRE Configurator page
      setIsNavigating(true);
      setNavigationMessage("Loading CRE Configurator...");
      router.push("/configurator/cre");
    } else if (item.id === "accessControl") {
      // Navigate to Access Control page
      setIsNavigating(true);
      setNavigationMessage("Loading Access Control...");
      router.push("/access-control");
    } else {
      // For other items, use the callback
      onTabChange(item.id);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        pb: 4,
        overflow: "auto",
        backgroundColor: "#fafbfc",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: "center", position: "relative" }}>
        <Box
          sx={{
            animation: "fadeInScale 0.5s ease-out",
            "@keyframes fadeInScale": {
              "0%": {
                opacity: 0,
                transform: "scale(0.8)",
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          <Box
            sx={{
              width: 86,
              height: 86,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, rgba(47, 143, 239, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)",
              border: "1px solid rgba(47, 143, 239, 0.1)",
              boxShadow: "0 4px 16px rgba(47, 143, 239, 0.1)",
            }}
          >
            <Image
              src="/Mifix-ai.png"
              alt="MiFiX AI"
              width={89}
              height={89}
              style={{ objectFit: "cover" }}
            />
          </Box>
          {/* <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: "center",
              marginBottom: 0.5,
              color: "#1a1a1a",
            }}
          >
            MiFiX AI
          </Typography> */}
          <Typography
            variant="caption"
            sx={{
              color: "#000000FF",
              fontSize: "0.95rem",
              fontWeight:"700"
            }}
          >
            MiFiX.ai
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ mt: 4, px: 3 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.9rem" }}
          >
            Quick Links
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            Navigate to different sections
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = selectedTab === item.id;

            return (
              <Paper
                key={item.id}
                elevation={isSelected ? 2 : 0}
                onClick={() => handleMenuClick(item)}
                sx={{
                  width: "100%",
                  p: 1.5,
                  border: `1px solid ${isSelected ? item.color : "#e2e8f0"}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  backgroundColor: isSelected ? `${item.color}08` : "#ffffff",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                  "@keyframes slideInLeft": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-20px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: isSelected ? `${item.color}15` : "#f8fafc",
                    borderColor: item.color,
                    transform: "translateX(2px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: `${item.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ color: item.color, fontSize: 16 }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: "text.primary",
                      fontSize: "0.85rem",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
                <ArrowIcon
                  sx={{
                    fontSize: 16,
                    color: isSelected ? item.color : "#64748b",
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mb: 2 }} />

      <Divider />

      {/* Recent Section: Chat or Analyses */}
      <Box
        sx={{ flex: 3, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e1e5e9" }}>
          <Typography
            variant="h6"
            sx={{
              color: "#2c3e50",
              fontWeight: 700,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {mode === "dashboard" ? (
              <>
                <DashboardIcon sx={{ fontSize: 20, color: "#3498db" }} />
                Saved Insights
              </>
            ) : (
              <>
                <ChatIcon sx={{ fontSize: 20, color: "#3498db" }} />
                Chat History
              </>
            )}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#7f8c8d",
              fontSize: "0.75rem",
            }}
          >
            {mode === "dashboard"
              ? `${analyses.length} in ${activeDashboard?.name || 'Dashboard'}`
              : `${conversations.length} conversation${
                  conversations.length !== 1 ? "s" : ""
                }`}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "3px",
              "&:hover": {
                background: "#a8a8a8",
              },
            },
          }}
          onScroll={handleScroll}
        >
          {mode === "dashboard" ? (
            analysisLoading && analyses.length === 0 ? (
              <Box sx={{ p: 2 }}>
                {[...Array(3)].map((_, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={60}
                      sx={{ borderRadius: 2, mb: 1 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  py: 1,
                }}
              >
                {analyses.map((item, index) => (
                  <Fade
                    in={true}
                    timeout={300 + index * 100}
                    key={item.id || `${item.title}-${index}`}
                  >
                    <Paper
                      elevation={0}
                      onClick={() => {
                        // Scroll to the widget in the dashboard
                        const widgetElement = document.getElementById(`widget-${item.id}`);
                        if (widgetElement) {
                          widgetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          // Add a highlight effect
                          widgetElement.style.boxShadow = '0 0 0 3px #3B82F6';
                          setTimeout(() => {
                            widgetElement.style.boxShadow = '';
                          }, 2000);
                        }
                        if (onSelectAnalysis) {
                          onSelectAnalysis(item.id);
                        }
                        // Close mobile drawer after selecting analysis
                        if (isMobile && onMobileClose) {
                          onMobileClose();
                        }
                      }}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: "1px solid #e8ecf0",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                          borderColor: "#3498db",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(52, 152, 219, 0.15)",
                        },
                        "&:active": {
                          transform: "translateY(0px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              minWidth: 32,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #3498db, #2980b9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
                              marginTop: "2px",
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Box
                            sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}
                          >
                            <Tooltip title={item.question || item.title || "Saved Analysis"}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  color: "#2c3e50",
                                  lineHeight: 1.3,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {item.question || item.title || "Saved Analysis"}
                              </Typography>
                            </Tooltip>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.75rem",
                                color: "#7f8c8d",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {item.timestamp
                                ? formatToIST(item.timestamp)
                                : "—"}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Saved"
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 50,
                            fontSize: "0.65rem",
                            fontWeight: 500,
                            backgroundColor: "#e8f5e8",
                            color: "#27ae60",
                            border: "none",
                            ml: 1,
                            flexShrink: 0,
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      </Box>
                    </Paper>
                  </Fade>
                ))}

                {analysisLoadingMore && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 2 }}
                  >
                    <CircularProgress size={20} sx={{ color: "#3498db" }} />
                  </Box>
                )}

                {analyses.length === 0 && !analysisLoading && (
                  <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                    <DashboardIcon
                      sx={{ fontSize: 48, color: "#bdc3c7", mb: 2 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#7f8c8d",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        mb: 1,
                      }}
                    >
                      No insights in {activeDashboard?.name || 'this dashboard'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#95a5a6", fontSize: "0.75rem" }}
                    >
                      Save visualizations from chat to see them here
                    </Typography>
                  </Box>
                )}
              </Box>
            )
          ) : // Chat mode content (original)
          loading && conversations.length === 0 ? (
            <Box sx={{ p: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={60}
                    sx={{ borderRadius: 2, mb: 1 }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 1 }}
            >
              {conversations.map((conversation, index) => (
                <Fade
                  in={true}
                  timeout={300 + index * 100}
                  key={conversation.id}
                >
                  <Paper
                    elevation={0}
                    onClick={() => loadConversation(conversation.id)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "1px solid #e8ecf0",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                        borderColor: "#3498db",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(52, 152, 219, 0.15)",
                      },
                      "&:active": {
                        transform: "translateY(0px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #3498db, #2980b9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
                            marginTop: "2px",
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              color: "#2c3e50",
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {conversation.title || `Conversation ${index + 1}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.75rem",
                              color: "#7f8c8d",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {formatTimeAgo(conversation.updated_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label="Recent"
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 50,
                          fontSize: "0.65rem",
                          fontWeight: 500,
                          backgroundColor: "#e8f5e8",
                          color: "#27ae60",
                          border: "none",
                          ml: 1,
                          flexShrink: 0,
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Fade>
              ))}

              {loadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={20} sx={{ color: "#3498db" }} />
                </Box>
              )}

              {conversations.length === 0 && !loading && (
                <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                  <ChatIcon sx={{ fontSize: 48, color: "#bdc3c7", mb: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#7f8c8d",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    No conversations yet
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#95a5a6", fontSize: "0.75rem" }}
                  >
                    Start a new chat to see your history here
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Footer */}
      {/* <Box sx={{ p: 2, textAlign: 'center' }}>
       <NewStreetLogo />
      </Box> */}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: 320 },
        flexShrink: { md: 0 },
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 320,
            boxSizing: "border-box",
            backgroundColor: "#fafbfc",
            borderRight: "1px solid #e1e5e9",
            boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
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
            width: 320,
            boxSizing: "border-box",
            backgroundColor: "#fafbfc",
            borderRight: "1px solid #e1e5e9",
            boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
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
