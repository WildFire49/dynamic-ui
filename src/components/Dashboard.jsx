import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
  Grid,
  Fade,
  Slide,
  Chip,
  Divider,
  Paper,
  Container,
  Stack,
  useTheme,
  alpha,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  InputBase,
  ClickAwayListener,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Badge,
  Zoom,
  Grow
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  FileDownload as FileDownloadIcon,
  CloudDone as CloudDoneIcon,
  CloudSync as CloudSyncIcon,
  CloudOff as CloudOffIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Message as MessageIcon,
  PieChartOutline as PieChartIcon,
  AreaChart as AreaChartIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import DataGridComponent from './charts/DataGridComponent';
import AnalysisWidget from './widgets/AnalysisWidget';
import DashboardSelector from './DashboardSelector';
import useDashboardStore from '../store/dashboardStore';
import { DashboardLoadingSkeleton, WidgetContentSkeleton } from './skeletons/WidgetSkeleton';
import WidgetConfigStudio from './widgets/WidgetConfigStudio';
import dashboardService from '../services/dashboardService';
import { getSummaryCards } from '../services/summaryCardsService';
import SummaryCardsPanel from './dashboard/SummaryCardsPanel';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

// Color palette - distinct colors for multi-series charts
const CHART_COLORS = {
  primary: '#3B82F6',      // Blue
  primaryLight: '#93C5FD',
  primaryGradient: ['#3B82F6', '#2563EB'],
  secondary: '#10B981',    // Emerald Green
  tertiary: '#F59E0B',     // Amber/Orange
  quaternary: '#EF4444',   // Red
  fifth: '#8B5CF6',        // Purple
  sixth: '#EC4899',        // Pink
  cyan: '#06B6D4',         // Cyan
  teal: '#0D9488',         // Teal
  orange: '#F97316',       // Orange
  area: {
    stroke: '#3B82F6',
    fill: 'url(#areaGradient)'
  },
  bar: '#3B82F6'
};

// Distinct bar colors for multi-series
const BAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

// Widget accent colors - using theme primary/secondary blue gradient
const WIDGET_ACCENTS = [
  { gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)', light: '#EBF5FF', border: '#B3D7FF', icon: '#0078d7' },  // Primary Blue
  { gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)', light: '#EBF5FF', border: '#B3D7FF', icon: '#0078d7' },  // Primary Blue
  { gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)', light: '#EBF5FF', border: '#B3D7FF', icon: '#0078d7' },  // Primary Blue
  { gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)', light: '#EBF5FF', border: '#B3D7FF', icon: '#0078d7' },  // Primary Blue
  { gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)', light: '#EBF5FF', border: '#B3D7FF', icon: '#0078d7' },  // Primary Blue
  { gradient: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)', light: '#EBF5FF', border: '#B3D7FF', icon: '#0078d7' },  // Primary Blue
];

const Dashboard = ({ initialDashboardId }) => {
  const theme = useTheme();
  
  // Zustand store for multi-dashboard support
  const {
    activeDashboardId,
    visualizationsByDashboard,
    summaryCardsByDashboard,
    getActiveDashboard,
    addVisualization,
    removeVisualization,
    updateVisualization,
    migrateFromLocalStorage,
    loadFromServer,
    syncToServer,
    isLoading,
    isSyncing,
    lastSyncedAt,
    setActiveDashboard,
    loadWidgetsForDashboard,
    setSummaryCardsForDashboard,
  } = useDashboardStore();

  const [savedVisualizations, setSavedVisualizations] = useState([]);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  
  // Get summary cards from store for the active dashboard
  const summaryCards = summaryCardsByDashboard?.[activeDashboardId] || [];
  const [fullscreenView, setFullscreenView] = useState({ open: false, item: null });
  const [fullscreenViewMode, setFullscreenViewMode] = useState('table'); // table, bar, pie, area
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [widgetOrder, setWidgetOrder] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null); // Original index of dragged item
  const [dragOverIndex, setDragOverIndex] = useState(null); // Current hover position
  const [widgetViewModes, setWidgetViewModes] = useState({}); // Track view mode per widget
  const [widgetSizes, setWidgetSizes] = useState({}); // Track individual widget sizes { id: { width, height } }
  const [resizing, setResizing] = useState(null); // { id, startX, startY, startWidth, startHeight }
  const [editingTitleId, setEditingTitleId] = useState(null); // For inline title editing
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [refreshingWidgets, setRefreshingWidgets] = useState({}); // Track which widgets are refreshing
  const [isRefreshingAll, setIsRefreshingAll] = useState(false); // Track bulk refresh
  const [refreshResults, setRefreshResults] = useState(null); // Store bulk refresh results
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [globalViewMode, setGlobalViewMode] = useState('table'); // 'table', 'auto', 'area', 'bar' - default to table
  const [configStudio, setConfigStudio] = useState({ open: false, widget: null }); // Widget config studio
  const [loadingWidgets, setLoadingWidgets] = useState(new Set()); // Track widgets currently loading data
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false); // Chat drawer state
  const [chatInput, setChatInput] = useState(''); // Chat input value
  const [chatMessages, setChatMessages] = useState([]); // Chat messages
  const [isChatLoading, setIsChatLoading] = useState(false); // Chat loading state
  const [draggedWidgetForChat, setDraggedWidgetForChat] = useState(null); // Widget being dragged to chat
  const [chatDropZoneActive, setChatDropZoneActive] = useState(false); // Drop zone highlight
  const [attachedWidget, setAttachedWidget] = useState(null); // Widget attached to chat input
  const [widgetCreationMode, setWidgetCreationMode] = useState(null); // { mode: 'create' | 'edit', card: cardObject } - for card-based widget creation
  const [outputType, setOutputType] = useState('widget'); // 'widget', 'card', or 'both' - for dashboard edit API
  const [pullToRefreshEnabled, setPullToRefreshEnabled] = useState(true); // Enable pull-to-refresh on mobile
  const [selectedWidgets, setSelectedWidgets] = useState(new Set()); // Selected widget IDs for batch operations
  const [selectedCards, setSelectedCards] = useState(new Set()); // Selected card IDs for batch operations
  const [selectionMode, setSelectionMode] = useState(false); // Enable selection mode
  
  // Refs to prevent duplicate API calls
  const dataFetchInProgress = useRef(false);
  const fetchedWidgetIds = useRef(new Set());
  const initialFetchDone = useRef(false); // Prevent duplicate initial fetch
  const draggedWidgetRef = useRef(null); // Store dragged widget for chat drop
  const mainContainerRef = useRef(null); // Ref for pull-to-refresh container
  const widgetRefs = useRef({}); // Refs to widget elements for scrolling
  
  // Helper to check if a string is a UUID
  const isUUID = (str) => {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Get connection ID from localStorage, env, or Zustand store
  const getConnectionId = () => {
    return localStorage.getItem('connectionId') || 
           localStorage.getItem('activeConnectionId') ||
           process.env.NEXT_PUBLIC_CONNECTION_ID ||
           '';
  };

  // Get document key from localStorage (for Excel/CSV file queries)
  const getDocumentKey = () => {
    return localStorage.getItem('documentKey') || 
           localStorage.getItem('activeDocumentKey') ||
           '';
  };

  // Get username from localStorage
  // Priority: username > user.username > userId (only if not UUID)
  const getUsername = () => {
    // First try direct username
    const username = localStorage.getItem('username');
    if (username && !isUUID(username)) return username;
    
    // Then try user object
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.username && !isUUID(user.username)) return user.username;
    } catch (e) {
      // Ignore parse errors
    }
    
    // Fallback to userId only if it doesn't look like a UUID
    const userId = localStorage.getItem('userId');
    if (userId && !isUUID(userId)) {
      return userId;
    }
    
    return '';
  };
  
  // Cache for widget data per dashboard - persists across tab switches
  const widgetDataCache = useRef(new Map()); // Map<dashboardId, Map<widgetId, data>>

  // Helper to format title to proper Title Case
  const toTitleCase = (str) => {
    if (!str) return str;
    // Words that should remain lowercase (unless first word)
    const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'with', 'vs'];
    
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Always capitalize first word, or if not a minor word
        if (index === 0 || !minorWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  // Helper to get title - prioritize title over prompt/question
  const getTitle = (item) => {
    let title = '';
    // Check title first (most user-friendly)
    if (item.title && !item.title.startsWith('Analysis -') && item.title !== 'Unknown Query') {
      title = item.title;
    }
    // Fallback to question/prompt if no good title
    else if (item.question && !item.question.startsWith('Analysis -') && item.question !== 'Unknown Query') {
      title = item.question;
    }
    // Last resort fallbacks
    else if (item.title) {
      title = item.title;
    } else if (item.question) {
      title = item.question;
    } else {
      title = 'Analysis Result';
    }
    
    // Apply title case formatting
    return toTitleCase(title);
  };

  // Detect best visualization type from data
  const detectVisualizationType = (data) => {
    if (!data || data.length === 0) return 'table';
    
    const firstRow = data[0];
    const keys = Object.keys(firstRow).filter(k => k !== 'id' && !k.startsWith('_'));
    
    // Check for time series (date/month columns)
    const hasTimeColumn = keys.some(k => 
      k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('month') || 
      k.toLowerCase().includes('year') ||
      k.toLowerCase().includes('period')
    );
    
    // Check for numeric columns
    const numericKeys = keys.filter(k => {
      const val = firstRow[k];
      return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val));
    });
    
    // Check for category/label columns
    const labelKeys = keys.filter(k => {
      const val = firstRow[k];
      return typeof val === 'string' && isNaN(parseFloat(val));
    });
    
    // Time series with numeric values → Area Chart
    if (hasTimeColumn && numericKeys.length >= 1) {
      return 'area';
    }
    
    // Multiple rows with label + numeric → Bar Chart
    if (data.length > 1 && labelKeys.length >= 1 && numericKeys.length >= 1) {
      return 'bar';
    }
    
    // Few categories with single numeric → Pie Chart
    if (data.length <= 8 && data.length > 1 && labelKeys.length === 1 && numericKeys.length === 1) {
      return 'pie';
    }
    
    // Default to table for complex data
    return data.length > 10 ? 'table' : 'bar';
  };

  // Format number for display (₹ format for Indian currency)
  const formatValue = (value, key) => {
    if (typeof value !== 'number') return value;
    
    const keyLower = key?.toLowerCase() || '';
    
    // Check for percentages first
    const isPercentage = keyLower.includes('percent') || 
                         keyLower.includes('pct') || 
                         keyLower.includes('otr') || 
                         keyLower.includes('ratio') ||
                         keyLower.includes('rate');
    
    if (isPercentage) {
      return `${value.toFixed(2)}%`;
    }
    
    // Check for counts (not currency)
    const isCount = keyLower.includes('count') || 
                    keyLower.includes('number') ||
                    keyLower.includes('customers');
    
    if (isCount) {
      if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
      if (value >= 100000) return `${(value / 100000).toFixed(2)}L`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    }
    
    // Check for currency amounts
    const isAmount = keyLower.includes('amount') || 
                     keyLower.includes('target') ||
                     keyLower.includes('disbursed') ||
                     keyLower.includes('collected') ||
                     keyLower.includes('outstanding');
    
    if (isAmount) {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
      if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
      return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Default formatting for other numbers
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Pull-to-refresh handler
  const handlePullToRefresh = useCallback(async () => {
    const username = getUsername();
    if (!username || !activeDashboardId) return;

    
    // Reload widgets and summary cards
    await loadWidgetsForDashboard(username, activeDashboardId, true);
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [activeDashboardId, loadWidgetsForDashboard]);

  // Initialize pull-to-refresh
  const { containerRef, isPulling, pullDistance, isRefreshing: isPullRefreshing } = usePullToRefresh(
    handlePullToRefresh,
    {
      threshold: 60,
      maxPullDistance: 120,
      enabled: pullToRefreshEnabled,
    }
  );

  // Cache helper functions
  const getCachedData = (dashboardId, widgetId) => {
    const dashboardCache = widgetDataCache.current.get(dashboardId);
    return dashboardCache?.get(widgetId);
  };

  const setCachedData = (dashboardId, widgetId, data) => {
    if (!widgetDataCache.current.has(dashboardId)) {
      widgetDataCache.current.set(dashboardId, new Map());
    }
    widgetDataCache.current.get(dashboardId).set(widgetId, data);
  };

  const applyCache = (widgets, dashboardId) => {
    return widgets.map(w => {
      const cached = getCachedData(dashboardId, w.id);
      if (cached) {
        return { ...w, ...cached };
      }
      return w;
    });
  };

  // Load dashboards from API on mount and immediately fetch widget data
  useEffect(() => {
    // Reset refs at the start of each mount cycle
    const mountId = Date.now();
    
    // Check if already initialized in this render cycle
    if (initialFetchDone.current) {
      return;
    }
    initialFetchDone.current = true;
    dataFetchInProgress.current = true; // Set early to prevent other effects from fetching
    
    const initializeDashboard = async () => {
      // Use the getUsername helper to avoid UUID being used as username
      const username = getUsername();
      const connectionId = getConnectionId();
      
      
      if (username) {
        // Try to load from server first
        const result = await loadFromServer(username);
        
        if (result.success) {
          // If initialDashboardId is provided (from URL), switch to that dashboard
          let activeId;
          if (initialDashboardId) {
            await setActiveDashboard(initialDashboardId);
            activeId = initialDashboardId;
          } else {
            activeId = useDashboardStore.getState().activeDashboardId;
          }
          
          // Wait a tick for store to update, then get fresh state
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Immediately fetch widget data after loading widgets
          const freshState = useDashboardStore.getState();
          const widgets = freshState.visualizationsByDashboard[activeId] || [];
          
          
          
          // Fetch data even if connectionId is empty - the API will handle it
          if (widgets.length > 0) {
            const widgetIds = widgets.map(w => w.id);
            
            // Mark all widgets as loading (dataFetchInProgress already set at effect start)
            setLoadingWidgets(new Set(widgetIds));
            setSavedVisualizations([...widgets]);
            
            // Fetch data immediately
            try {
              const dataResult = await dashboardService.getWidgetsData(username, connectionId, widgetIds);
              
              if (dataResult.success && dataResult.data?.results) {
                let successCount = 0;
                const updatedWidgets = widgets.map(w => {
                  const widgetResult = dataResult.data.results.find(r => r.widgetId === w.id);
                  
                  if (widgetResult?.success && widgetResult.data) {
                    successCount++;
                    const widgetData = {
                      timestamp: new Date().toISOString(),
                      pipelineData: widgetResult.data.pipelineData || [],
                      supportingData: widgetResult.data.supportingData || widgetResult.data.pipelineData || [],
                      dataGrid: widgetResult.data.dataGrid,
                      executionTimeMs: widgetResult.executionTimeMs,
                      rowCount: widgetResult.rowCount,
                    };
                    // Cache the data for this widget
                    setCachedData(activeId, w.id, widgetData);
                    return { ...w, ...widgetData };
                  }
                  return w;
                });
                
                setSavedVisualizations(updatedWidgets);
                widgetIds.forEach(id => fetchedWidgetIds.current.add(id));
              } else {
              }
            } catch (error) {
              ('❌ Error fetching widget data:', error);
            } finally {
              setLoadingWidgets(new Set());
              dataFetchInProgress.current = false;
            }
          } else {
            setSavedVisualizations([...widgets]);
            dataFetchInProgress.current = false; // No widgets to fetch, reset flag
          }
        } else {
          const hasMigrated = localStorage.getItem('dashboardMigrated');
          if (!hasMigrated) {
            migrateFromLocalStorage();
            localStorage.setItem('dashboardMigrated', 'true');
          }
          dataFetchInProgress.current = false; // Server load failed, reset flag
        }
      } else {
        // No user, just migrate local data
        const hasMigrated = localStorage.getItem('dashboardMigrated');
        if (!hasMigrated) {
          migrateFromLocalStorage();
          localStorage.setItem('dashboardMigrated', 'true');
        }
        dataFetchInProgress.current = false; // No user, reset flag
      }
      setIsInitialLoad(false);
    };

    initializeDashboard();
    
    // Cleanup - reset ref on unmount so next mount will initialize
    return () => {
      initialFetchDone.current = false;
      dataFetchInProgress.current = false;
    };
  }, []);

  // Subscribe to Zustand store changes for real-time updates
  // Only active AFTER initial load is complete to prevent race conditions
  useEffect(() => {
    const unsubscribe = useDashboardStore.subscribe(
      (state, prevState) => {
        // Skip during initial load - initializeDashboard handles everything
        if (!initialFetchDone.current || dataFetchInProgress.current) {
          return;
        }
        
        // Get current active dashboard ID from state (not from closure)
        const currentDashboardId = state.activeDashboardId;
        const storeVisualizations = state.visualizationsByDashboard[currentDashboardId] || [];
        
        // Only update if visualizations changed (new widgets added/removed)
        const prevVisualizations = prevState?.visualizationsByDashboard?.[currentDashboardId] || [];
        if (storeVisualizations.length !== prevVisualizations.length || 
            JSON.stringify(storeVisualizations.map(v => v.id)) !== JSON.stringify(prevVisualizations.map(v => v.id))) {
          
          // Merge store data with any existing fetched data to preserve pipelineData
          setSavedVisualizations(prev => {
            // If we have existing data with pipelineData, preserve it
            if (prev.length > 0 && prev.some(v => v.pipelineData?.length > 0)) {
              // Merge: use store metadata but keep fetched data
              return storeVisualizations.map(storeViz => {
                const existingViz = prev.find(p => p.id === storeViz.id);
                if (existingViz?.pipelineData?.length > 0) {
                  return { ...storeViz, ...existingViz }; // Keep fetched data
                }
                return storeViz;
              });
            }
            return [...storeVisualizations];
          });
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Load data from Zustand store when active dashboard changes - apply cache if available
  // Skip during initial load - initializeDashboard handles that
  useEffect(() => {
    // Skip if initial load hasn't completed yet
    if (!initialFetchDone.current) {
      return;
    }
    
    const loadData = () => {
      // Get visualizations from Zustand store for active dashboard
      const freshState = useDashboardStore.getState();
      const storeVisualizations = freshState.visualizationsByDashboard[activeDashboardId] || [];
      
      // Apply cached data if available
      const visualizationsWithCache = applyCache(storeVisualizations, activeDashboardId);
      
      // Check which widgets have data (either cached or already loaded)
      const widgetsWithData = visualizationsWithCache.filter(v => v.pipelineData?.length > 0 || v.supportingData?.length > 0);
      const widgetsWithoutData = visualizationsWithCache.filter(v => !v.pipelineData?.length && !v.supportingData?.length);
      
      // Only mark widgets WITHOUT data as loading - this ensures skeleton shows for widgets that need data
      if (widgetsWithoutData.length > 0) {
        const loadingIds = widgetsWithoutData.map(v => v.id);
        setLoadingWidgets(new Set(loadingIds));
      } else {
        // All widgets have data - clear loading state
        setLoadingWidgets(new Set());
      }
      
      setSavedVisualizations([...visualizationsWithCache]);
      
      // Load analyses from localStorage
      const savedAn = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
      setSavedAnalyses(savedAn);
      
      const savedOrder = JSON.parse(localStorage.getItem('dashboardWidgetOrder') || '[]');
      setWidgetOrder(savedOrder);
    };
    
    loadData();
  }, [activeDashboardId]);

  // Fetch widget data when switching dashboards (not for initial load - that's handled by initializeDashboard)
  // This effect only runs when activeDashboardId changes AFTER initial load
  const prevDashboardId = useRef(activeDashboardId);
  const fetchingDashboardId = useRef(null); // Track which dashboard is currently fetching
  
  useEffect(() => {
    // Skip if this is the initial load (initializeDashboard handles it)
    if (!initialFetchDone.current) {
      prevDashboardId.current = activeDashboardId;
      return;
    }
    
    // Skip if initial data fetch is still in progress
    if (dataFetchInProgress.current) {
      prevDashboardId.current = activeDashboardId;
      return;
    }
    
    // Only fetch if dashboard actually changed
    if (prevDashboardId.current === activeDashboardId) {
      return;
    }
    
    prevDashboardId.current = activeDashboardId;
    
    const fetchDataForNewDashboard = async () => {
      // Wait a bit for widgets to load from store if needed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Double-check that initial fetch isn't still running
      if (dataFetchInProgress.current) {
        return;
      }
      
      // Get widgets directly from store to avoid stale state
      const freshState = useDashboardStore.getState();
      const storeWidgets = freshState.visualizationsByDashboard[activeDashboardId] || [];
      
      // Skip only if no widgets AND not because they're still loading
      if (storeWidgets.length === 0) {
        return;
      }
      
      // If another dashboard is fetching, that's OK - we can fetch for this one
      if (fetchingDashboardId.current === activeDashboardId) {
        return;
      }

      const connectionId = localStorage.getItem('connectionId') || 
                          localStorage.getItem('activeConnectionId') || 
                          process.env.NEXT_PUBLIC_CONNECTION_ID || '';
      const username = JSON.parse(localStorage.getItem('user') || '{}').username || 
                      localStorage.getItem('username') || 
                      localStorage.getItem('userId') || '';

      if (!username) return;

      // Check if any widgets need data (not in cache)
      const widgetsNeedingData = storeWidgets.filter(v => 
        !getCachedData(activeDashboardId, v.id)
      );
      
      if (widgetsNeedingData.length === 0) {
        return;
      }

      fetchingDashboardId.current = activeDashboardId;
      
      const widgetIds = widgetsNeedingData.map(v => v.id);
      setLoadingWidgets(new Set(widgetIds));
      
      try {
        const result = await dashboardService.getWidgetsData(username, connectionId, widgetIds);
        
        // Only update if we're still on the same dashboard
        if (fetchingDashboardId.current !== activeDashboardId) {
          return;
        }
        
        if (result.success && result.data?.results) {
          // Apply cache to widgets with fetched data
          const updatedWidgets = storeWidgets.map(v => {
            const widgetResult = result.data.results.find(r => r.widgetId === v.id);
            if (widgetResult?.success && widgetResult.data) {
              const widgetData = {
                timestamp: new Date().toISOString(),
                pipelineData: widgetResult.data.pipelineData || [],
                supportingData: widgetResult.data.supportingData || widgetResult.data.pipelineData || [],
                dataGrid: widgetResult.data.dataGrid,
                executionTimeMs: widgetResult.executionTimeMs,
                rowCount: widgetResult.rowCount,
              };
              // Cache the data
              setCachedData(activeDashboardId, v.id, widgetData);
              return { ...v, ...widgetData };
            }
            // Check if already cached
            const cached = getCachedData(activeDashboardId, v.id);
            if (cached) return { ...v, ...cached };
            return v;
          });
          
          // Update visualizations with fetched data
          setSavedVisualizations(updatedWidgets);
          
          // Clear loading state for widgets that now have data
          setLoadingWidgets(prev => {
            const newLoading = new Set(prev);
            updatedWidgets.forEach(w => {
              if (w.pipelineData?.length > 0 || w.supportingData?.length > 0) {
                newLoading.delete(w.id);
              }
            });
            return newLoading;
          });
        }
      } catch (error) {
        ('❌ Error fetching widget data:', error);
      } finally {
        if (fetchingDashboardId.current === activeDashboardId) {
          fetchingDashboardId.current = null;
        }
        // Clear all loading states for this dashboard
        setLoadingWidgets(new Set());
      }
    };

    fetchDataForNewDashboard();
  }, [activeDashboardId]);

  // Note: savedVisualizations are now managed by Zustand store
  // No need to sync to localStorage as Zustand persist handles it

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
    }
  }, [savedAnalyses, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad && widgetOrder.length > 0) {
      localStorage.setItem('dashboardWidgetOrder', JSON.stringify(widgetOrder));
    }
  }, [widgetOrder, isInitialLoad]);

  // Prepare, filter and sort items
  const allItems = useMemo(() => {
    // Combine visualizations and analyses, filtering out any undefined/null items
    let items = [...savedVisualizations, ...savedAnalyses].filter(item => item && item.id);
    
    // Deduplicate by ID (keep first occurrence)
    const seenIds = new Set();
    items = items.filter(item => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    });
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const title = getTitle(item).toLowerCase();
        return title.includes(query);
      });
    }
    
    // If we have a custom widget order from drag and drop, use it
    if (widgetOrder.length > 0 && !searchQuery.trim()) {
      const orderMap = new Map(widgetOrder.map((id, idx) => [id, idx]));
      items.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
        return orderA - orderB;
      });
    } else {
      // Sort by timestamp when no custom order
      items.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
    }
    
    return items;
  }, [savedVisualizations, savedAnalyses, searchQuery, sortOrder, widgetOrder]);

  // Get the last updated time across all widgets
  const lastGlobalUpdate = useMemo(() => {
    if (allItems.length === 0) return null;
    const times = allItems.map(item => new Date(item.timestamp).getTime());
    return new Date(Math.max(...times));
  }, [allItems]);

  // Sync widget order for new items
  useEffect(() => {
    if (allItems.length > 0 && !isInitialLoad) {
      const currentIds = allItems.map(item => item.id);
      const isOrderOutdated = currentIds.length !== widgetOrder.length || !currentIds.every(id => widgetOrder.includes(id));
      
      if (isOrderOutdated) {
        // If we have new items not in order, append them or rebuild order based on current sort
        const newOrder = allItems.map(item => item.id);
        // Only update if it's actually different to prevent loops
        if (JSON.stringify(newOrder) !== JSON.stringify(widgetOrder)) {
            // We won't auto-update state to avoid loops, relies on user interaction for reordering
        }
      }
    }
  }, [allItems.length, isInitialLoad]);

  // Handlers
  const handleDeleteVisualization = async (id) => {
    // Validate widget ID before proceeding
    if (!id) {
      return;
    }
    
    const username = getUsername();
    
    // Optimistically update UI first
    setSavedVisualizations(prev => prev.filter(item => item.id !== id));
    setSavedAnalyses(prev => prev.filter(item => item.id !== id));
    setWidgetOrder(prev => prev.filter(wId => wId !== id));
    setAnchorEl(null);
    
    // Call API to delete from server
    if (username && activeDashboardId) {
      try {
        const result = await dashboardService.deleteWidget(username, activeDashboardId, id);
        if (result.success) {
          // Also remove from store
          removeVisualization(id);
        } else {
          // Could optionally restore the widget here if API fails
        }
      } catch (error) {
      }
    }
  };

  const handleEditTitle = async (id, newTitle) => {
    if (!newTitle?.trim()) return;
    
    const username = getUsername();
    const dashboardId = activeDashboardId;
    
    // Update locally first for immediate feedback
    setSavedVisualizations(prev => prev.map(item => item.id === id ? { ...item, title: newTitle, question: newTitle } : item));
    setSavedAnalyses(prev => prev.map(item => item.id === id ? { ...item, title: newTitle, question: newTitle } : item));
    
    // Call API to persist the change
    try {
      const result = await dashboardService.updateWidget(username, dashboardId, id, { title: newTitle });
      if (result.success) {
      } else {
      }
    } catch (error) {
    }
  };

  // Inline title editing handlers
  const handleStartEditTitle = (item) => {
    setEditingTitleId(item.id);
    setEditingTitleValue(getTitle(item));
  };

  const handleSaveInlineTitle = () => {
    if (editingTitleId && editingTitleValue?.trim()) {
      handleEditTitle(editingTitleId, editingTitleValue.trim());
    }
    setEditingTitleId(null);
  };

  const handleCancelInlineEdit = () => {
    setEditingTitleId(null);
    setEditingTitleValue('');
  };

  // Create summary card from question - opens drawer with empty input
  const handleCreateWidgetFromCard = (card) => {
    
    // Set the mode and open drawer with empty input
    setWidgetCreationMode({ mode: 'create', card });
    setChatInput('');
    setChatDrawerOpen(true);
  };

  // Edit summary card - opens drawer with edit mode
  const handleEditCardInDrawer = (card) => {
    
    // Set the mode and open drawer with empty input
    setWidgetCreationMode({ mode: 'edit', card });
    setChatInput('');
    setChatDrawerOpen(true);
  };

  // Refresh a single widget using the new getWidgetsData API
  const handleRefreshWidget = async (item) => {
    const username = getUsername();
    const connectionId = getConnectionId();
    
    if (!connectionId) {
            return;
    }

    setRefreshingWidgets(prev => ({ ...prev, [item.id]: true }));

    try {
      // Use the new getWidgetsData API with single widget ID
      const result = await dashboardService.getWidgetsData(username, connectionId, [item.id]);

      if (result.success && result.data?.results?.[0]) {
        const widgetResult = result.data.results[0];
        
        if (widgetResult.success && widgetResult.data) {
          const refreshedData = widgetResult.data;
          
          const updatedItem = {
            ...item,
            timestamp: new Date().toISOString(),
            pipelineData: refreshedData.pipelineData || [],
            supportingData: refreshedData.supportingData || refreshedData.pipelineData || [],
            dataGrid: refreshedData.dataGrid || {
              gridRows: (refreshedData.pipelineData || []).map((row, idx) => ({ id: idx + 1, ...row })),
              gridColumns: [],
            },
            executionTimeMs: widgetResult.executionTimeMs,
            rowCount: widgetResult.rowCount,
          };

          // Update in state
          setSavedVisualizations(prev => 
            prev.map(v => v.id === item.id ? updatedItem : v)
          );
          
          // Update in Zustand store
          updateVisualization(activeDashboardId, item.id, {
            pipelineData: updatedItem.pipelineData,
            supportingData: updatedItem.supportingData,
            dataGrid: updatedItem.dataGrid,
            timestamp: updatedItem.timestamp,
          });

        } else {
        }
      } else {
      }
    } catch (error) {
    } finally {
      setRefreshingWidgets(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Handle card click to scroll to corresponding widget
  const handleCardClick = (card) => {
    
    if (!card) {
      return;
    }


    // Since widget_id is null, we need to find the matching widget by prompt/title similarity
    const allWidgetItems = getDisplayItems();

    // Find matching widget based on prompt or title similarity
    let matchingWidget = null;
    
    // Define keyword mappings for better matching
    const keywordMappings = {
      'region': ['region', 'regions'],
      'bank': ['bank', 'federal', 'kvb'],
      'branch': ['branch', 'branches'],
      'area': ['area', 'areas'],
      'fo': ['fo', 'field officer'],
      'rm': ['rm', 'relationship manager', 'rms']
    };

    // Special case mapping for specific card types
    const specialCases = {
      'zero disbursement': 'region', // Zero disbursement cards should go to region widget
      'least performing': 'region', // Performance cards should go to region widget
      'top performing': 'region', // Performance cards should go to region widget
      'total disbursement': 'bank' // Total disbursement cards should go to bank widget
    };

    // Extract keywords from card prompt/title
    const cardText = `${card.prompt || ''} ${card.title || ''}`.toLowerCase();
    
    // Check for special cases first
    let preferredCategory = null;
    Object.entries(specialCases).forEach(([pattern, category]) => {
      if (cardText.includes(pattern)) {
        preferredCategory = category;
      }
    });
    
    // Score each widget based on keyword matches
    const widgetScores = allWidgetItems.map(widget => {
      const widgetText = `${widget.prompt || ''} ${widget.title || ''}`.toLowerCase();
      let score = 0;
      const scoreDetails = {};
      
      // Exact match gets highest score
      if (widget.prompt === card.prompt || widget.title === card.title) {
        score = 100;
        scoreDetails.exact = 100;
      } else {
        // Calculate score based on keyword matches
        Object.entries(keywordMappings).forEach(([category, keywords]) => {
          const cardHasKeywords = keywords.some(keyword => cardText.includes(keyword));
          const widgetHasKeywords = keywords.some(keyword => widgetText.includes(keyword));
          
          if (cardHasKeywords && widgetHasKeywords) {
            const points = preferredCategory === category ? 20 : 10; // Bonus for preferred category
            score += points;
            scoreDetails[category] = points;
          }
        });
        
        // Bonus for partial text matches
        if (widgetText.includes(cardText.substring(0, 20)) || cardText.includes(widgetText.substring(0, 20))) {
          score += 5;
          scoreDetails.partial = 5;
        }
      }
      
      return { widget, score, details: scoreDetails };
    });
    
    // Sort by score and get the best match
    widgetScores.sort((a, b) => b.score - a.score);
    matchingWidget = widgetScores[0]?.widget;
    


    if (!matchingWidget) {
      return;
    }

    const widgetId = matchingWidget.id;
    const widgetElementId = `widget-${widgetId}`;

    const widgetElement = document.getElementById(widgetElementId);

    if (widgetElement) {
      widgetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a brief highlight effect
      widgetElement.style.transition = 'box-shadow 0.3s ease';
      widgetElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
      setTimeout(() => {
        widgetElement.style.boxShadow = '';
      }, 1500);
    } else {
      
      // Debug: List all widget elements that exist
      const allWidgetElements = document.querySelectorAll('[id^="widget-"]');
    }
  };

  // Edit dashboard using natural language prompt
  const handleDashboardEdit = async (prompt, widgetId = null, options = {}) => {
    const username = getUsername();
    const connectionId = getConnectionId();
    const documentKey = getDocumentKey();
    
    if (!activeDashboardId) {
      return { success: false, message: 'No dashboard selected' };
    }
    
    if (!connectionId) {
      return { success: false, message: 'No database connection found. Please select a connection first.' };
    }

    setIsChatLoading(true);
    
    try {
      const payload = {
        dashboardId: activeDashboardId,
        prompt: prompt,
        connectionId: connectionId,
        username: username,
        outputType: options.outputType || outputType, // Use passed option or state
        autoApproveCard: true,
      };

      // Add widgetId if provided (for context-aware edits)
      if (widgetId) {
        payload.widgetId = widgetId;
      }
      
      // Add documentKey if available (for Excel/CSV queries)
      if (documentKey) {
        payload.documentKey = documentKey;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'}/api/v1/dashboard/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      // Handle the nested response structure: { status, data: { message, data: { ... } } }
      const isSuccess = response.ok && (responseData.status === 200 || responseData.data?.success);
      const resultData = responseData.data?.data || responseData.data || responseData;
      
      if (isSuccess && resultData.success) {
        // Build response message based on actions taken
        let actionSummary = [];
        const actions = resultData.actions || [];
        
        // Count actions by type
        const addedActions = actions.filter(a => a.action === 'add' && a.success);
        const removedActions = actions.filter(a => a.action === 'remove' && a.success);
        const updatedActions = actions.filter(a => a.action === 'update' && a.success);
        
        if (addedActions.length > 0) {
          const titles = addedActions.map(a => {
            const addedWidget = resultData.addedWidgets?.find(w => w.id === a.widgetId);
            const title = a.title || addedWidget?.title || 'New Widget';
            return `"${title}"`;
          }).join(', ');
          actionSummary.push(`Added: ${titles}`);
        }
        if (removedActions.length > 0) {
          actionSummary.push(`Removed ${removedActions.length} widget(s)`);
        }
        if (updatedActions.length > 0) {
          const titles = updatedActions.map(a => {
            const updatedWidget = resultData.updatedWidgets?.find(w => w.id === a.widgetId);
            const title = a.title || updatedWidget?.title || 'Widget';
            return `"${title}"`;
          }).join(', ');
          actionSummary.push(`Updated: ${titles}`);
        }

        // Get newly added widget IDs to fetch their data
        const newWidgetIds = resultData.addedWidgets?.map(w => w.id) || addedActions.map(a => a.widgetId);
        
        // Reload dashboard data after edit to get updated widget list
        // Note: loadFromServer expects username as first param
        await loadFromServer(username);
        
        // Switch to the active dashboard to reload its widgets
        await setActiveDashboard(activeDashboardId);
        
        // Wait for store to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get fresh widgets from store after reload
        const freshState = useDashboardStore.getState();
        const storeWidgets = freshState.visualizationsByDashboard[activeDashboardId] || [];
        
        // Fetch data for ALL widgets (new + existing) to ensure data is populated
        const allWidgetIds = storeWidgets.map(w => w.id);
        if (allWidgetIds.length > 0) {
          // Wait for backend to process and generate widget data (1.5s delay)
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const widgetData = await fetchWidgetsData(allWidgetIds);
          
          if (widgetData?.results) {
            // Merge store widgets with fetched data
            const mergedWidgets = storeWidgets.map(w => {
              const fetchedData = widgetData.results.find(r => r.widgetId === w.id);
              if (fetchedData?.success && fetchedData.data) {
                return {
                  ...w,
                  timestamp: new Date().toISOString(),
                  pipelineData: fetchedData.data.pipelineData || [],
                  supportingData: fetchedData.data.supportingData || fetchedData.data.pipelineData || [],
                  dataGrid: fetchedData.data.dataGrid,
                  executionTimeMs: fetchedData.executionTimeMs,
                  rowCount: fetchedData.rowCount,
                };
              }
              return w;
            });
            
            // Update local state with merged widgets
            setSavedVisualizations(mergedWidgets);
          }
        }
        
        // Build success message based on outputType
        let successMessage = actionSummary.length > 0 
          ? actionSummary.join('\n') 
          : resultData.message || 'Dashboard updated successfully!';
        
        // Add outputType context to message if available
        const outputCreatesCard = payload.outputType === 'card' || payload.outputType === 'both';
        if (payload.outputType === 'card') {
          successMessage = `Summary card created successfully! ${successMessage}`;
        } else if (payload.outputType === 'both') {
          successMessage = `Widget and summary card created successfully! ${successMessage}`;
        } else if (payload.outputType === 'widget') {
          successMessage = `Widget created successfully! ${successMessage}`;
        }
        
        if (outputCreatesCard) {
          await refreshSummaryCards({
            forceMetadataRefresh: true,
            regenerateSql: true,
          });
        }
        
        return { 
          success: true, 
          message: successMessage,
          actions: actions,
          addedWidgets: resultData.addedWidgets
        };
      } else {
        // Check for action-level errors
        const failedActions = resultData.actions?.filter(a => !a.success) || [];
        const errorMessage = failedActions.length > 0 
          ? failedActions.map(a => a.error).join(', ')
          : resultData.message || responseData.message || 'Failed to edit dashboard';
        
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to connect to the server. Please try again.' 
      };
    } finally {
      setIsChatLoading(false);
    }
  };

  // Toggle widget selection
  const toggleWidgetSelection = (widgetId) => {
    setSelectedWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  // Toggle card selection
  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedWidgets(new Set());
    setSelectedCards(new Set());
    setSelectionMode(false);
  };

  // Attach selected items to chat for update
  const attachSelectedToChat = () => {
    const selectedWidgetsList = savedVisualizations.filter(w => selectedWidgets.has(w.id));
    const selectedCardsList = summaryCards.filter(c => selectedCards.has(c.id));
    
    if (selectedWidgetsList.length === 1) {
      setAttachedWidget(selectedWidgetsList[0]);
      setChatDrawerOpen(true);
      clearSelections();
    } else if (selectedCardsList.length === 1) {
      setWidgetCreationMode({ mode: 'edit', card: selectedCardsList[0] });
      setChatDrawerOpen(true);
      clearSelections();
    } else if (selectedWidgetsList.length > 1 || selectedCardsList.length > 1) {
      // Batch update mode - will be handled in chat submit
      setChatDrawerOpen(true);
    }
  };

  // Handle chat message submission
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = chatInput.trim();
    const widgetContext = attachedWidget ? { widgetId: attachedWidget.id, widgetTitle: attachedWidget.title } : null;
    const creationMode = widgetCreationMode;
    
    // Check for batch update mode (multiple selections)
    const hasBatchSelection = selectedWidgets.size > 1 || selectedCards.size > 1;
    
    setChatInput('');
    setAttachedWidget(null); // Clear attached widget after sending
    
    // Add user message to chat (with widget reference if attached)
    setChatMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      widgetRef: widgetContext,
      cardRef: creationMode?.card,
    }]);
    
    setIsChatLoading(true);
    
    let result;
    
    // If in widget creation mode from a card
    if (creationMode) {
      const username = getUsername();
      const connectionId = getConnectionId();
      const documentKey = getDocumentKey();
      const selectedOutputType = outputType; // Capture current output type
      
      try {
        if (creationMode.mode === 'create') {
          // Use dashboard edit API with outputType
          result = await dashboardService.editDashboardWithPrompt(
            activeDashboardId,
            username,
            connectionId,
            userMessage,
            { 
              outputType: selectedOutputType,
              autoApproveCard: true,
              sourceCardId: creationMode.card?.id,
              ...(documentKey && { documentKey }),
            }
          );
          
          if (result.success) {
            // Refresh the dashboard to show the new widget/card
            await setActiveDashboard(activeDashboardId);
            const typeLabel = selectedOutputType === 'both' ? 'Widget and Card' : 
                              selectedOutputType === 'card' ? 'Insight Card' : 'Widget';
            result.message = `${typeLabel} created successfully!`;
          }
        } else if (creationMode.mode === 'edit') {
          // Edit existing summary card using PATCH
          result = await dashboardService.editSummaryCard(
            activeDashboardId,
            creationMode.card?.id,
            username,
            { title: userMessage }
          );
          
          if (result.success) {
            // Refresh the dashboard to show the updated card
            await setActiveDashboard(activeDashboardId);
            result.message = 'Insight card updated successfully!';
          }
        }
      } catch (error) {
        result = { success: false, message: error.message || 'Failed to process request' };
      }
      
      // Clear the creation mode after processing
      setWidgetCreationMode(null);
    } else if (hasBatchSelection) {
      // Batch update mode - update multiple widgets/cards
      const username = getUsername();
      const connectionId = getConnectionId();
      
      try {
        const edits = [];
        
        // Add widget updates
        selectedWidgets.forEach(widgetId => {
          edits.push({
            prompt: userMessage,
            widgetId: widgetId,
            outputType: 'widget'
          });
        });
        
        // Add card updates
        selectedCards.forEach(cardId => {
          edits.push({
            prompt: userMessage,
            cardId: cardId,
            outputType: 'card'
          });
        });
        
        // Call batch edit API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'}/api/v1/dashboard/edit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dashboardId: activeDashboardId,
            connectionId: connectionId,
            username: username,
            autoApproveCard: true,
            edits: edits
          }),
        });
        
        const responseData = await response.json();
        
        if (response.ok && responseData.status === 200) {
          await setActiveDashboard(activeDashboardId);
          result = {
            success: true,
            message: `Updated ${edits.length} item(s) successfully!`
          };
        } else {
          result = {
            success: false,
            message: responseData.message || 'Failed to update items'
          };
        }
        
        // Clear selections after batch update
        clearSelections();
      } catch (error) {
        result = { success: false, message: error.message || 'Failed to update items' };
      }
    } else {
      // Use the dashboard edit API with the selected outputType from toggle
      // outputType can be: 'widget', 'card', or 'both'
      // - 'widget': Creates a new widget on the dashboard
      // - 'card': Generates a summary card (fetches widget data, analyzes, generates card)
      // - 'both': Creates both widget and summary card
      result = await handleDashboardEdit(
        userMessage, 
        widgetContext?.widgetId
      );
    }
    
    setIsChatLoading(false);
    
    // Add AI response
    setChatMessages(prev => [...prev, { 
      role: 'assistant', 
      content: result.success 
        ? `✓ ${result.message}` 
        : `Sorry, I couldn't complete that request. ${result.message}`,
      success: result.success
    }]);
  };

  // Fetch data for widgets using the new getWidgetsData API
  const fetchWidgetsData = async (widgetIds) => {
    const username = getUsername();
    const connectionId = getConnectionId();
    
    if (!connectionId) {
      return null;
    }

    if (!widgetIds || widgetIds.length === 0) {
      return null;
    }

    try {
      const result = await dashboardService.getWidgetsData(username, connectionId, widgetIds);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Update widgets with fetched data
  const updateWidgetsWithData = (results) => {
    if (!results || !Array.isArray(results)) return;

    setSavedVisualizations(prev => 
      prev.map(v => {
        const widgetResult = results.find(r => r.widgetId === v.id);
        if (widgetResult?.success && widgetResult.data) {
          const refreshedData = widgetResult.data;
          return {
            ...v,
            timestamp: new Date().toISOString(),
            pipelineData: refreshedData.pipelineData || [],
            supportingData: refreshedData.supportingData || refreshedData.pipelineData || [],
            dataGrid: refreshedData.dataGrid || {
              gridRows: (refreshedData.pipelineData || []).map((row, idx) => ({ id: idx + 1, ...row })),
              gridColumns: [],
            },
            executionTimeMs: widgetResult.executionTimeMs,
            rowCount: widgetResult.rowCount,
          };
        }
        return v;
      })
    );
  };

  // Refresh all widgets - fetch fresh data from API
  const handleRefreshAllWidgets = async () => {
    const username = getUsername();
    const connectionId = getConnectionId();
    
    if (!username) {
      return;
    }

    if (!connectionId) {
            return;
    }

    setIsRefreshingAll(true);
    setRefreshResults(null);

    try {
      const widgetIds = savedVisualizations.map(v => v.id);
      
      if (widgetIds.length === 0) {
        setIsRefreshingAll(false);
        return;
      }

      // Kick off widget data refresh (+ summary cards in parallel)
      const widgetDataPromise = dashboardService.getWidgetsData(username, connectionId, widgetIds);
      const summaryCardsPromise = activeDashboardId
        ? getSummaryCards({
            username,
            dashboardId: activeDashboardId,
            connectionId,
            existingCards: summaryCardsByDashboard?.[activeDashboardId] || [],
          })
        : Promise.resolve(null);

      const [result, summaryCardsResponse] = await Promise.all([
        widgetDataPromise,
        summaryCardsPromise,
      ]);

      if (result.success && result.data) {
        const results = result.data.results || [];
        let successCount = 0;
        let failedCount = 0;
        
        // Update widgets with fresh data
        setSavedVisualizations(prev => prev.map(widget => {
          const widgetResult = results.find(r => r.widgetId === widget.id);
          if (widgetResult?.success && widgetResult.data) {
            successCount++;
            // Update cache
            setCachedData(activeDashboardId, widget.id, widgetResult.data);
            return {
              ...widget,
              pipelineData: widgetResult.data.pipelineData || widgetResult.data.results || [],
              supportingData: widgetResult.data.supportingData || widgetResult.data.pipelineData || [],
              lastRefreshed: new Date().toISOString(),
            };
          }
          failedCount++;
          return widget;
        }));

        setRefreshResults({
          totalWidgets: widgetIds.length,
          refreshedCount: successCount,
          failedCount: failedCount,
          timestamp: new Date().toISOString(),
        });


        if (summaryCardsResponse?.data?.summary_cards && activeDashboardId) {
          setSummaryCardsForDashboard(activeDashboardId, summaryCardsResponse.data.summary_cards);
        }
      } else {
        setRefreshResults({
          totalWidgets: widgetIds.length,
          refreshedCount: 0,
          failedCount: widgetIds.length,
          error: result.message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      setRefreshResults({
        totalWidgets: savedVisualizations.length,
        refreshedCount: 0,
        failedCount: savedVisualizations.length,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  // Format relative time for last updated
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleDragStart = (e, index) => {
    const item = allItems[index];
    if (!item) return;

    const widgetInfo = { 
      id: item.id, 
      title: item.title || item.question || 'Widget' 
    };
    
    
    // Set dashboard drag state
    setDraggedItem(item);
    setDraggedIndex(index);
    setDragOverIndex(index);
    
    // Set chat drag state
    setDraggedWidgetForChat(widgetInfo);
    draggedWidgetRef.current = widgetInfo;
    
    // Set DataTransfer for robust cross-target dragging
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/plain", item.id);
      e.dataTransfer.setData("application/widget", JSON.stringify(widgetInfo));
      
      // Set a custom drag image if needed, or stick to default
    }
    
    // DON'T auto-open chat panel - only open when dragging towards right edge
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedItem && dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedItem || draggedIndex === null) return;
    if (draggedIndex === dropIndex) {
      setDraggedItem(null);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    // Create new order
    const newItems = [...allItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);
    
    // Update widget order in state
    const newOrder = newItems.map(item => item.id);
    setWidgetOrder(newOrder);
    
    // Persist to backend API
    const username = getUsername();
    if (username && activeDashboardId) {
      try {
        const widgetOrderPayload = newOrder.map((widgetId, index) => ({
          widgetId,
          order: index
        }));
        
        const result = await dashboardService.reorderWidgets(
          username,
          activeDashboardId,
          widgetOrderPayload
        );
        
        if (result.success) {
        } else {
        }
      } catch (error) {
              }
    }
    
    // Reset drag state
    setDraggedItem(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = async (e) => {
    // If dropped on valid target, handleDrop already handled it
    // This handles dropping outside valid targets
    if (draggedItem && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Apply the reorder based on last hover position
      const newItems = [...allItems];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dragOverIndex, 0, removed);
      
      const newOrder = newItems.map(item => item.id);
      setWidgetOrder(newOrder);
      
      // Persist to backend API
      const username = getUsername();
      if (username && activeDashboardId) {
        try {
          const widgetOrderPayload = newOrder.map((widgetId, index) => ({
            widgetId,
            order: index
          }));
          
          const result = await dashboardService.reorderWidgets(
            username,
            activeDashboardId,
            widgetOrderPayload
          );
          
          if (result.success) {
          } else {
          }
        } catch (error) {
                  }
      }
    }
    
    // Reset all drag states
    setDraggedItem(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedWidgetForChat(null);
    draggedWidgetRef.current = null;
    setChatDropZoneActive(false);
    
    // Don't open config studio after drag
    // setConfigStudio({ open: false, widget: null });
  };

  // Chat Drag Handlers
  const handleChatDragOver = (e) => {
    e.preventDefault();
    
    // Always allow dropping if we have a widget dragged
    if (draggedWidgetRef.current || e.dataTransfer.types.includes('application/widget')) {
      e.dataTransfer.dropEffect = "copy";
      if (!chatDropZoneActive) {
        setChatDropZoneActive(true);
      }
    }
  };

  const handleChatDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only deactivate if leaving the chat container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if mouse is actually outside the element
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setChatDropZoneActive(false);
    }
  };

  const handleChatDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setChatDropZoneActive(false);
    
    let widgetData = null;
    
    // 1. Try ref (internal drag)
    if (draggedWidgetRef.current) {
      widgetData = draggedWidgetRef.current;
    } 
    // 2. Try DataTransfer (fallback)
    else {
      try {
        const json = e.dataTransfer.getData("application/widget");
        if (json) widgetData = JSON.parse(json);
      } catch (err) {
      }
    }

    if (widgetData) {
      setAttachedWidget(widgetData);
      
      // Reset dashboard drag state since we handled the drop
      setDraggedItem(null);
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDraggedWidgetForChat(null);
      draggedWidgetRef.current = null;
    }
  };
  
  // Get visual order of items during drag (for rendering)
  const getDisplayItems = () => {
    if (draggedItem === null || draggedIndex === null || dragOverIndex === null) {
      return allItems;
    }
    
    // Create a visual reordering
    const items = [...allItems];
    const [removed] = items.splice(draggedIndex, 1);
    items.splice(dragOverIndex, 0, removed);
    return items;
  };
  
  const displayItems = getDisplayItems();
  const totalWidgets = displayItems.length;
  const widgetGridColumns = React.useMemo(() => {
    if (totalWidgets <= 1) {
      return { xs: '1fr', sm: '1fr', lg: '1fr' };
    }
    return {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(2, minmax(0, 1fr))',
    };
  }, [totalWidgets]);

  const refreshSummaryCards = useCallback(
    async ({ forceMetadataRefresh = false, regenerateSql = false } = {}) => {
      if (!activeDashboardId) return null;

      const username = getUsername();
      const connectionId = getConnectionId();
      if (!username || !connectionId) return null;

      try {
        const response = await getSummaryCards({
          username,
          dashboardId: activeDashboardId,
          connectionId,
          regenerateSql,
          existingCards: forceMetadataRefresh
            ? []
            : summaryCardsByDashboard?.[activeDashboardId] || [],
        });

        if (response?.data?.summary_cards) {
          setSummaryCardsForDashboard(
            activeDashboardId,
            response.data.summary_cards
          );
        }

        return response;
      } catch (error) {
        console.warn('Failed to refresh summary cards:', error);
        return null;
      }
    },
    [activeDashboardId, summaryCardsByDashboard, setSummaryCardsForDashboard]
  );

  // Optimized resize handlers using refs for smooth performance
  const resizeRef = useRef(null);
  const rafRef = useRef(null);
  const lastHeightRef = useRef(null);
  // Width resizing removed - using simple 2-column grid layout

  const handleResizeStart = (e, itemId, currentHeight) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store resize state in ref for immediate access (no re-renders)
    resizeRef.current = {
      id: itemId,
      startY: e.clientY,
      startHeight: currentHeight,
    };
    lastHeightRef.current = currentHeight;
    
    // Add cursor style to body for smooth UX
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    
    setResizing({ id: itemId }); // Minimal state for UI feedback
  };

  const handleResizeMove = React.useCallback((e) => {
    if (!resizeRef.current) return;
    
    // Cancel any pending RAF to prevent frame buildup
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use RAF for smooth 60fps updates
    rafRef.current = requestAnimationFrame(() => {
      if (!resizeRef.current) return;
      
      const { id, startY, startHeight } = resizeRef.current;
      const element = document.getElementById(`widget-${id}`);
      if (!element) return;
      
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
      
      if (lastHeightRef.current !== newHeight) {
        lastHeightRef.current = newHeight;
        element.style.height = `${newHeight}px`;
      }
    });
  }, []);

  const handleResizeEnd = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Commit final height to React state
    if (resizeRef.current) {
      const { id, startHeight } = resizeRef.current;
      const finalHeight = lastHeightRef.current || startHeight;
      
      // Clear inline style - React will handle via state
      const element = document.getElementById(`widget-${id}`);
      if (element) {
        element.style.height = '';
      }
      
      setWidgetSizes(prev => ({
        ...prev,
        [id]: { height: finalHeight }
      }));
    }
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    resizeRef.current = null;
    lastHeightRef.current = null;
    setResizing(null);
  }, []);

  // Add/remove resize event listeners with passive option for performance
  React.useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove, { passive: true });
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // Get widget height with defaults
  const getWidgetHeight = (itemId, data) => {
    const saved = widgetSizes[itemId];
    if (saved?.height) return saved.height;
    return 380; // Default height for all widgets - enough for 3 records
  };

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuId(null);
  };

  const handleViewModeChange = (itemId, newMode) => {
    if (newMode) {
      setWidgetViewModes(prev => ({ ...prev, [itemId]: newMode }));
    }
  };

  // Download data as CSV
  const handleDownloadCSV = (item) => {
    const data = getItemData(item);
    if (data.length === 0) return;

    const keys = Object.keys(data[0]).filter(k => k !== 'id' && !k.startsWith('_'));
    const csvHeader = keys.join(',');
    const csvRows = data.map(row => 
      keys.map(key => {
        const val = row[key];
        // Escape commas and quotes in values
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',')
    );
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getTitle(item).replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Extract data from item - handles multiple data formats from API
  const getItemData = (item) => {
    // Helper to check if array has data
    const hasData = (arr) => Array.isArray(arr) && arr.length > 0;

    // Check all possible data locations (API format, store format, legacy format)
    // Prioritize non-empty arrays to avoid empty initializers masking actual data
    let rawData = [];
    
    if (hasData(item.pipelineData)) rawData = item.pipelineData;
    else if (hasData(item.supportingData)) rawData = item.supportingData;
    else if (hasData(item.supporting_data)) rawData = item.supporting_data;
    else if (hasData(item.dataGrid?.gridRows)) rawData = item.dataGrid.gridRows;
    else if (hasData(item.data?.pipelineData)) rawData = item.data.pipelineData;
    else if (hasData(item.data?.supportingData)) rawData = item.data.supportingData;
    else if (hasData(item.data?.dataGrid?.gridRows)) rawData = item.data.dataGrid.gridRows;
    else if (hasData(item.data?.response?.analysis_result?.supporting_data)) rawData = item.data.response.analysis_result.supporting_data;
    else {
      // Fallback to existing if all checks fail (might be empty array)
      rawData = item.pipelineData || item.supportingData || [];
    }
    
    return rawData.map((row, index) => ({
      id: row.id ?? row._id ?? `row-${index}`,
      ...row
    }));
  };

  // Render Area Chart
  const renderAreaChart = (data) => {
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'id' && !k.startsWith('_'));
    const labelKey = keys.find(k => 
      k.toLowerCase().includes('month') || 
      k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('period') ||
      typeof data[0]?.[k] === 'string'
    ) || keys[0];
    let valueKeys = keys.filter(k => k !== labelKey && typeof data[0]?.[k] === 'number');

    // Handle single-value data - use bar chart instead for better visualization
    if (valueKeys.length === 0 && keys.length > 0) {
      return renderBarChart(data);
    }

    if (valueKeys.length === 0) {
      return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography color="text.secondary">No numeric data</Typography></Box>;
    }

    return (
      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {valueKeys.map((key, idx) => (
              <linearGradient key={`gradient-${idx}`} id={`areaGradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BAR_COLORS[idx % BAR_COLORS.length]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={BAR_COLORS[idx % BAR_COLORS.length]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis 
            dataKey={labelKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(val) => formatValue(val, valueKeys[0])}
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #E5E7EB', 
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => [formatValue(value, name), name]}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>{value.replace(/_/g, ' ')}</span>}
          />
          {valueKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={BAR_COLORS[idx % BAR_COLORS.length]}
              fill={`url(#areaGradient-${idx})`}
              strokeWidth={2}
              dot={{ r: 4, fill: '#fff', stroke: BAR_COLORS[idx % BAR_COLORS.length], strokeWidth: 2 }}
              activeDot={{ r: 6, fill: BAR_COLORS[idx % BAR_COLORS.length] }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // Render Line Chart
  const renderLineChart = (data) => {
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'id' && !k.startsWith('_'));
    const labelKey = keys.find(k => 
      k.toLowerCase().includes('month') || 
      k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('period') ||
      k.toLowerCase().includes('bank') ||
      k.toLowerCase().includes('name') ||
      typeof data[0]?.[k] === 'string'
    ) || keys[0];
    let valueKeys = keys.filter(k => k !== labelKey && typeof data[0]?.[k] === 'number');

    if (valueKeys.length === 0) {
      return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography color="text.secondary">No numeric data for line chart</Typography></Box>;
    }

    return (
      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey={labelKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(val) => formatValue(val, valueKeys[0])}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB', 
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => [formatValue(value, name), name.replace(/_/g, ' ')]}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>{value.replace(/_/g, ' ')}</span>}
            />
            {valueKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={BAR_COLORS[idx % BAR_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#fff', stroke: BAR_COLORS[idx % BAR_COLORS.length], strokeWidth: 2 }}
                activeDot={{ r: 6, fill: BAR_COLORS[idx % BAR_COLORS.length] }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // Pie Chart Colors - use same distinct colors as bar charts
  const PIE_COLORS = BAR_COLORS;

  // Render Pie Chart
  const renderPieChart = (data) => {
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'id' && !k.startsWith('_'));
    const labelKey = keys.find(k => typeof data[0]?.[k] === 'string') || keys[0];
    const valueKey = keys.find(k => k !== labelKey && typeof data[0]?.[k] === 'number');

    if (!valueKey) {
      return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography color="text.secondary">No numeric data for pie chart</Typography></Box>;
    }

    const pieData = data.map((row, idx) => ({
      name: row[labelKey] || `Item ${idx + 1}`,
      value: parseFloat(row[valueKey]) || 0
    })).filter(d => d.value > 0);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}
            isAnimationActive={false}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #E5E7EB', 
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            formatter={(value) => [formatValue(value, valueKey), valueKey.replace(/_/g, ' ')]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span style={{ color: '#374151', fontSize: '0.875rem' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render Bar Chart
  const renderBarChart = (data) => {
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'id' && !k.startsWith('_'));
    const labelKey = keys.find(k => typeof data[0]?.[k] === 'string') || keys[0];
    let valueKeys = keys.filter(k => k !== labelKey && typeof data[0]?.[k] === 'number');
    
    // Handle single-value data (no string label, only numeric value)
    let chartData = data;
    if (valueKeys.length === 0 && keys.length > 0) {
      // All keys are numeric - use first key as value and create label
      valueKeys = keys.filter(k => typeof data[0]?.[k] === 'number');
      chartData = data.map((row, idx) => ({
        ...row,
        _label: keys[0].replace(/_/g, ' ').toUpperCase()
      }));
    }

    if (valueKeys.length === 0) {
      return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography color="text.secondary">No numeric data</Typography></Box>;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis 
            dataKey={chartData[0]?._label ? '_label' : labelKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(val) => formatValue(val, valueKeys[0])}
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #E5E7EB', 
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => [formatValue(value, name), name]}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>{value.replace(/_/g, ' ')}</span>}
          />
          {valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={BAR_COLORS[idx % BAR_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Single Record Card Component - beautiful centered display for single row data
  const renderSingleRecordCard = (data) => {
    const record = data[0];
    const keys = Object.keys(record).filter(k => k !== 'id' && !k.startsWith('_'));
    const numFields = keys.length;
    
    // Format label from key
    const formatLabel = (key) => {
      return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim();
    };
    
    // Format value based on type - Indian number format with full numbers
    const formatDisplayValue = (value, key) => {
      if (value === null || value === undefined) return '-';
      
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Percentage values
        if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('achievement')) {
          return `${numValue.toFixed(2)}%`;
        }
        // Format with Indian locale (lakhs, crores) - limit to 2 decimals for cleaner display
        return numValue.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      
      return String(value);
    };
    
    // Single value - show large centered metric
    if (numFields === 1) {
      const key = keys[0];
      const value = record[key];
      const displayValue = formatDisplayValue(value, key);
      
      return (
        <Box sx={{ 
          height: '100%', 
          width: '100%', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ 
              color: '#64748b', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              mb: 1.5,
            }}>
              {formatLabel(key)}
            </Typography>
            <Typography sx={{ 
              color: '#1e293b', 
              fontSize: '3rem', 
              fontWeight: 700,
              lineHeight: 1,
            }}>
              {displayValue}
            </Typography>
          </Box>
        </Box>
      );
    }
    
    // Grid columns based on field count
    const getGridCols = () => {
      if (numFields === 2) return 2;
      if (numFields === 3) return 3;
      if (numFields === 4) return 4;
      if (numFields <= 6) return 3;
      return 4;
    };
    
    // Compact number formatter for large values
    const formatCompactValue = (value, key) => {
      if (value === null || value === undefined) return '-';
      
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Percentage values
        if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('achievement')) {
          return `${numValue.toFixed(2)}%`;
        }
        // For very large numbers, use compact notation (Cr, L)
        if (Math.abs(numValue) >= 10000000) {
          return `${(numValue / 10000000).toFixed(2)} Cr`;
        }
        if (Math.abs(numValue) >= 100000) {
          return `${(numValue / 100000).toFixed(2)} L`;
        }
        // Regular formatting
        return numValue.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      
      return String(value);
    };
    
    // Always use 2 columns for symmetry
    const gridCols = 2;
    
    return (
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: 1.5,
          width: '100%',
          height: '100%',
        }}>
          {keys.map((key, index) => {
            const value = record[key];
            const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value));
            const displayValue = formatCompactValue(value, key);
            const isPercentage = key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('achievement');
            
            return (
              <Box
                key={key}
                sx={{
                  textAlign: 'center',
                  py: 1.5,
                  px: 1,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Tooltip title={formatLabel(key)} arrow placement="top">
                  <Typography
                    component="div"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      mb: 0.5,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {formatLabel(key)}
                  </Typography>
                </Tooltip>
                <Tooltip title={String(value)} arrow placement="bottom">
                  <Typography
                    component="div"
                    sx={{
                      color: isPercentage ? '#059669' : '#1e293b',
                      fontSize: isNumeric ? '1.25rem' : '0.95rem',
                      fontWeight: 700,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {displayValue}
                  </Typography>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Render Table - with beautiful single record card support
  const renderTable = (data, isFullscreen = false) => {
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'id' && !k.startsWith('_'));
    
    // For single-row data, show beautiful metric cards
    if (data.length === 1) {
      return renderSingleRecordCard(data);
    }
    
    return (
      <DataGridComponent
        rows={data}
        columns={[]}
        title={null}
        height="100%"
        autoGenerateColumns={true}
        showSaveButton={false}
        variant="clean"
        useInfiniteScroll={isFullscreen}
      />
    );
  };

  // Main visualization renderer
  const renderVisualization = (item, viewMode, isFullscreen = false) => {
    // Analysis Widget
    if (item.type === 'analysis_widget') {
      const analysisData = item.data || {
        response: { result: item.analysis?.data || {}, question: item.title },
        result: item.analysis?.data || {}
      };
      return (
        <Box sx={{ width: '100%', height: '100%' }}>
          <AnalysisWidget
            data={analysisData}
            title={item.title}
            onSave={() => {}}
            initialExpandedStates={item.expandedStates}
          />
        </Box>
      );
    }

    const data = getItemData(item);
    
    // Show skeleton ONLY if THIS specific widget is loading
    const isThisWidgetLoading = loadingWidgets.has(item.id);
    
    if (data.length === 0) {
      // If THIS widget is loading, show skeleton instead of "no data"
      if (isThisWidgetLoading) {
        return <WidgetContentSkeleton variant="chart" />;
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
          <Typography variant="body2">No data available</Typography>
        </Box>
      );
    }

    // Get the view mode for this widget
    const detectedType = detectVisualizationType(data);
    const currentMode = viewMode || detectedType;

    switch (currentMode) {
      case 'area':
        return renderAreaChart(data);
      case 'line':
        return renderLineChart(data);
      case 'bar':
        return renderBarChart(data);
      case 'pie':
        return renderPieChart(data);
      case 'table':
        return renderTable(data, isFullscreen);
      default:
        return detectedType === 'area' ? renderAreaChart(data) : 
               detectedType === 'bar' ? renderBarChart(data) : renderTable(data, isFullscreen);
    }
  };

  // Widget Card Component
  const renderVisualizationCard = (item, index) => {
    const isFullWidth = item.type === 'analysis_widget';
    const data = getItemData(item);
    const detectedType = detectVisualizationType(data);
    // Use global view mode if set, otherwise use widget-specific or detected type
    const currentViewMode = globalViewMode !== 'auto' 
      ? globalViewMode 
      : (widgetViewModes[item.id] || detectedType);
    const recordCount = data.length;
    const widgetHeight = getWidgetHeight(item.id, data);
    
    // Check if table has many columns (> 6) to span full width
    const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && !k.startsWith('_')) : [];
    const isWideTable = currentViewMode === 'table' && keys.length > 6;
    const allowWideTableFullWidth = isWideTable;
    const shouldForceFullWidth = totalWidgets <= 1;
    const isLastOddCard = totalWidgets > 1 && totalWidgets % 2 === 1 && index === totalWidgets - 1;
    const shouldSpanFull = isFullWidth || allowWideTableFullWidth || shouldForceFullWidth || isLastOddCard;
    
    // Get accent color for this widget
    const accent = WIDGET_ACCENTS[index % WIDGET_ACCENTS.length];
    
    return (
      <Grow 
        in 
        timeout={300 + (index * 100)} 
        key={item._uniqueKey || `${item.id}-${index}`}
        style={{ transformOrigin: '0 0 0' }}
      >
        <Paper
          id={`widget-${item.id}`}
          elevation={0}
          draggable={!resizing}
          onDragStart={(e) => !resizing && handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          sx={{
            gridColumn: shouldSpanFull ? '1 / -1' : 'auto',
            height: widgetHeight,
            minHeight: 280,
            maxHeight: 800,
            display: 'flex',
            flexDirection: 'column',
            border: draggedItem?.id === item.id 
              ? '2px solid #3B82F6' 
              : resizing?.id === item.id
                ? '2px solid #10B981'
                : '1px solid #E2E8F0',
            borderRadius: '12px',
            bgcolor: '#fff',
            overflow: 'hidden',
            cursor: draggedItem ? 'grabbing' : 'grab',
            boxShadow: draggedItem?.id === item.id 
              ? '0 12px 32px rgba(59, 130, 246, 0.25)' 
              : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            transform: draggedItem?.id === item.id 
              ? 'scale(1.02) translateY(-4px)' 
              : 'translateZ(0)',
            transition: resizing?.id === item.id ? 'none' : 'all 0.2s ease',
            zIndex: draggedItem?.id === item.id ? 10 : 1,
            position: 'relative',
            willChange: resizing?.id === item.id ? 'height' : 'auto',
            contain: 'layout style',
            '&:hover': {
              boxShadow: draggedItem ? undefined : '0 4px 12px rgba(0,0,0,0.08)',
              borderColor: '#CBD5E1',
            },
            '&:active': {
              cursor: 'grabbing'
            },
            '&:hover .resize-handle': {
              opacity: 0.6,
            },
            '&:hover .resize-handle:hover': {
              opacity: 1,
            },
            '&:hover .widget-actions': {
              opacity: 1,
            }
          }}
        >
            {/* Widget Header - Blue Gradient */}
            <Box sx={{
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: accent.gradient,
              borderRadius: '12px 12px 0 0',
              flexShrink: 0,
            }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                {editingTitleId === item.id ? (
                  <ClickAwayListener onClickAway={handleSaveInlineTitle}>
                    <InputBase
                      autoFocus
                      fullWidth
                      value={editingTitleValue}
                      onChange={(e) => setEditingTitleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInlineTitle();
                        if (e.key === 'Escape') handleCancelInlineEdit();
                      }}
                      sx={{
                        fontWeight: 600,
                        color: '#fff',
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        width: '100%',
                        '& input': {
                          padding: 0,
                          color: '#fff',
                          '&::placeholder': {
                            color: 'rgba(255,255,255,0.7)',
                          }
                        }
                      }}
                      placeholder="Enter widget title..."
                    />
                  </ClickAwayListener>
                ) : (
                  <Tooltip title="Click to rename" arrow placement="top">
                    <Typography 
                      variant="subtitle1" 
                      draggable={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditTitle(item);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.preventDefault()}
                      sx={{ 
                        fontWeight: 600, 
                        color: '#fff',
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        lineHeight: 1.35,
                        cursor: 'text',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 1,
                        userSelect: 'none',
                        wordBreak: 'break-word',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.15)',
                        }
                      }}
                    >
                      {getTitle(item)}
                    </Typography>
                  </Tooltip>
                )}
              </Box>

              {/* Clean Action Buttons */}
              <Stack 
                direction="row" 
                spacing={0.25} 
                alignItems="center"
                className="widget-actions"
                sx={{ opacity: { xs: 1, md: 0.9 }, transition: 'opacity 0.2s' }}
              >
                {/* Refresh - Primary Action */}
                <Tooltip title="Refresh data" arrow placement="top">
                  <IconButton 
                    size="small" 
                    onClick={() => handleRefreshWidget(item)}
                    disabled={refreshingWidgets[item.id]}
                    sx={{ 
                      color: '#fff', 
                      width: 28,
                      height: 28,
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.2)',
                      },
                      animation: refreshingWidgets[item.id] ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                {/* Fullscreen - Expand View */}
                <Tooltip title="Expand view" arrow placement="top">
                  <IconButton 
                    size="small" 
                    onClick={() => setFullscreenView({ open: true, item })} 
                    sx={{ 
                      color: '#fff',
                      width: 28,
                      height: 28,
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    <FullscreenIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                
                {/* More Options */}
                <Tooltip title="More options" arrow placement="top">
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, item.id)}
                    sx={{ 
                      color: '#fff',
                      width: 28,
                      height: 28,
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Context Menu - Clean & Organized */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && activeMenuId === item.id}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    border: '1px solid #E2E8F0',
                    borderRadius: 3,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    mt: 1,
                    minWidth: 200,
                    py: 1,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  onClick={() => { handleDownloadCSV(item); handleMenuClose(); }}
                  sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F0FDF4' } }}
                >
                  <FileDownloadIcon sx={{ fontSize: 20, mr: 2, color: '#22C55E' }} /> 
                  <Typography variant="body2" fontWeight={500}>Download CSV</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={() => { handleStartEditTitle(item); handleMenuClose(); }}
                  sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#FEF3C7' } }}
                >
                  <EditIcon sx={{ fontSize: 20, mr: 2, color: '#F59E0B' }} /> 
                  <Typography variant="body2" fontWeight={500}>Rename</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={() => { setConfigStudio({ open: true, widget: item }); handleMenuClose(); }}
                  sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#EEF2FF' } }}
                >
                  <TuneIcon sx={{ fontSize: 20, mr: 2, color: '#6366F1' }} /> 
                  <Typography variant="body2" fontWeight={500}>Configure</Typography>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem 
                  onClick={() => { handleDeleteVisualization(item.id); handleMenuClose(); }} 
                  sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#FEF2F2' } }}
                >
                  <DeleteIcon sx={{ fontSize: 20, mr: 2, color: '#EF4444' }} /> 
                  <Typography variant="body2" fontWeight={500} color="#EF4444">Delete</Typography>
                </MenuItem>
              </Menu>
            </Box>

            {/* Widget Content */}
            <Box sx={{ 
              flex: 1, 
              p: currentViewMode === 'table' ? 0 : 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 150,
              contain: 'content',
              willChange: 'contents',
              transform: 'translateZ(0)',
              '& > *': {
                flex: 1,
                minHeight: 0,
              }
            }}>
              {renderVisualization(item, currentViewMode)}
            </Box>

            {/* Widget Footer - Clean Status Bar */}
            {item.type !== 'analysis_widget' && (
              <Box sx={{ 
                px: 2.5, 
                py: 1, 
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                flexShrink: 0,
              }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: recordCount > 0 ? '#22C55E' : '#94A3B8',
                  }} />
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                    {recordCount > 0 ? `${recordCount.toLocaleString()} records` : 'No data'}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {formatLastUpdated(item.timestamp)}
                  </Typography>
                </Stack>
              </Box>
            )}
            
            {/* Resize Handle - Bottom edge (height resize only) */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => {
                const element = document.getElementById(`widget-${item.id}`);
                if (element) {
                  const rect = element.getBoundingClientRect();
                  handleResizeStart(e, item.id, rect.height);
                }
              }}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 8,
                cursor: 'ns-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px 4px 0 0',
                '&:hover': {
                  opacity: 1,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                },
                '&::before': {
                  content: '""',
                  width: 30,
                  height: 3,
                  bgcolor: '#9CA3AF',
                  borderRadius: 2,
                },
              }}
            />
          </Paper>
        </Grow>
    );
  };


  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#F5F7FA',
      position: 'relative',
    }}>
      {/* Main Dashboard Content - Adjusts when chat opens */}
      <Box sx={{ 
        flex: 1,
        transition: 'margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        marginRight: chatDrawerOpen ? '420px' : 0,
        minWidth: 0,
        overflowX: 'hidden',
        overflowY: 'auto',                 
        height: '100vh',
      }}>
        {/* Dashboard Selector Tabs */}
        <DashboardSelector />
      
      {/* Toolbar - Clean Header */}
      <Box 
        sx={{ 
          bgcolor: '#fff',
          borderBottom: '1px solid #E2E8F0',
          px: 3,
          py: 2,
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 1.5, sm: 3 }}
          sx={{ flexWrap: 'wrap' }}
        >
          {/* Left - Search */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: { xs: 'none', sm: 1 }, width: { xs: '100%', sm: 'auto' } }}>
            {/* Search Field - Matching Toolbar Style */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                bgcolor: '#F8FAFC',
                borderRadius: 3,
                p: 0.75,
                border: '1px solid #E2E8F0',
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Search Icon Box */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: searchQuery ? '#0078d7' : '#fff',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease',
                }}
              >
                <SearchIcon sx={{ 
                  fontSize: 16, 
                  color: searchQuery ? '#fff' : '#64748B',
                  transition: 'color 0.2s ease',
                }} />
              </Box>
              
              {/* Search Input */}
              <InputBase
                placeholder={`Search ${allItems.length} widget${allItems.length !== 1 ? 's' : ''}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  flex: 1,
                  minWidth: { xs: 80, sm: 180 },
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#1E293B',
                  '& input::placeholder': { color: '#94A3B8', opacity: 1, fontWeight: 400 }
                }}
              />
              
              {/* Widget Count Badge */}
              {!searchQuery && allItems.length > 0 && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                }}>
                  <GridViewIcon sx={{ fontSize: 14, color: '#0078d7' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0078d7' }}>
                    {allItems.length}
                  </Typography>
                </Box>
              )}
              
              {/* Clear Button */}
              {searchQuery && (
                <Box
                  onClick={() => setSearchQuery('')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: '#FEE2E2',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#FECACA' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14, color: '#EF4444' }} />
                </Box>
              )}
            </Stack>
            
            {/* Sync Status Group - Matching Toolbar Style */}
            {allItems.length > 0 && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 0.5, sm: 1 }}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: 3,
                  p: 0.75,
                  border: '1px solid #E2E8F0',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Sync Status */}
                {isSyncing ? (
                  <Tooltip title="Syncing...">
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: { xs: 0.75, sm: 1.5 },
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: alpha('#0D9488', 0.1),
                    }}>
                      <CloudSyncIcon sx={{ fontSize: 14, color: '#0D9488' }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#0D9488', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
                        Syncing
                      </Typography>
                    </Box>
                  </Tooltip>
                ) : lastSyncedAt ? (
                  <Tooltip title={`Last synced: ${new Date(lastSyncedAt).toLocaleString()}`}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: { xs: 0.75, sm: 1.5 },
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: '#fff',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    }}>
                      <CloudDoneIcon sx={{ fontSize: 14, color: '#10B981' }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#10B981', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
                        Synced
                      </Typography>
                    </Box>
                  </Tooltip>
                ) : null}

                {/* Last Updated - Combined with time - Hidden on mobile */}
                {lastGlobalUpdate && (
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 500, 
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                    px: 1,
                    display: { xs: 'none', md: 'block' },
                  }}>
                    {formatLastUpdated(lastGlobalUpdate)}
                  </Typography>
                )}

                {/* Divider */}
                <Box sx={{ width: 1, height: 24, bgcolor: '#E2E8F0' }} />

                {/* Refresh Button */}
                <Tooltip title={isRefreshingAll ? "Refreshing..." : "Refresh all widgets"} arrow>
                  <Box
                    onClick={!isRefreshingAll ? handleRefreshAllWidgets : undefined}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1,
                      py: 0.75,
                      borderRadius: 2,
                      cursor: isRefreshingAll ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      bgcolor: 'transparent',
                      color: '#0D9488',
                      '&:hover': {
                        bgcolor: isRefreshingAll ? 'transparent' : '#F0FDFA',
                      },
                    }}
                  >
                    <RefreshIcon sx={{ 
                      fontSize: 16,
                      animation: isRefreshingAll ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }} />
                  </Box>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          {/* Center - View Controls */}
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center"
            sx={{
              bgcolor: '#F8FAFC',
              borderRadius: 3,
              p: 0.75,
              border: '1px solid #E2E8F0',
            }}
          >
            {/* View Mode Buttons - Individual Pills */}
            {[
              { value: 'auto', icon: <GridViewIcon sx={{ fontSize: 16 }} />, label: 'Auto' },
              { value: 'table', icon: <TableChartIcon sx={{ fontSize: 16 }} />, label: 'Table' },
              { value: 'bar', icon: <BarChartIcon sx={{ fontSize: 16 }} />, label: 'Bar' },
              { value: 'area', icon: <AreaChartIcon sx={{ fontSize: 16 }} />, label: 'Line' },
              { value: 'pie', icon: <PieChartIcon sx={{ fontSize: 16 }} />, label: 'Pie' },
            ].map((item) => (
              <Box
                key={item.value}
                onClick={() => setGlobalViewMode(item.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: globalViewMode === item.value ? '#fff' : 'transparent',
                  color: globalViewMode === item.value ? '#0078d7' : '#64748B',
                  boxShadow: globalViewMode === item.value ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  border: globalViewMode === item.value ? '1px solid #E2E8F0' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: globalViewMode === item.value ? '#fff' : '#F1F5F9',
                    color: globalViewMode === item.value ? '#0078d7' : '#475569',
                  },
                }}
              >
                {item.icon}
                <Typography sx={{ 
                  fontSize: '0.8rem', 
                  fontWeight: globalViewMode === item.value ? 600 : 500,
                }}>
                  {item.label}
                </Typography>
              </Box>
            ))}

            {/* Divider */}
            <Box sx={{ width: 1, height: 24, bgcolor: '#E2E8F0', mx: 0.5 }} />

            {/* Sort Button */}
            <Box
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: 'transparent',
                color: '#64748B',
                '&:hover': {
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                },
              }}
            >
              <SortIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </Typography>
            </Box>
          </Stack>

          {/* Right - Selection Mode Toggle */}
          <Stack direction="row" spacing={1} alignItems="center">
            {selectionMode && (selectedWidgets.size > 0 || selectedCards.size > 0) && (
              <Chip
                label={`${selectedWidgets.size + selectedCards.size} selected`}
                size="small"
                onDelete={clearSelections}
                sx={{
                  bgcolor: '#EBF5FF',
                  color: '#0078d7',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
            
            {selectionMode && (selectedWidgets.size > 0 || selectedCards.size > 0) && (
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={attachSelectedToChat}
                sx={{
                  bgcolor: '#0078d7',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  '&:hover': { bgcolor: '#005a9e' },
                }}
              >
                Update Selected
              </Button>
            )}
            
            <Button
              size="small"
              variant={selectionMode ? 'contained' : 'outlined'}
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) clearSelections();
              }}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                px: 2,
                py: 0.5,
                bgcolor: selectionMode ? '#0078d7' : 'transparent',
                color: selectionMode ? '#fff' : '#64748B',
                borderColor: '#E2E8F0',
                '&:hover': {
                  bgcolor: selectionMode ? '#005a9e' : '#F1F5F9',
                  borderColor: '#E2E8F0',
                },
              }}
            >
              {selectionMode ? 'Exit Selection' : 'Select'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content Area with Pull-to-Refresh */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* iOS-style Pull-to-Refresh White Space */}
        <Box
          sx={{
            height: isPulling || isPullRefreshing ? `${pullDistance}px` : 0,
            transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            bgcolor: '#f8fafc',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pb: 1,
            overflow: 'hidden',
          }}
        >
          {/* Loader at top */}
          {(isPulling || isPullRefreshing) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isPullRefreshing ? 1 : Math.min(pullDistance / 60, 1),
                transform: isPullRefreshing ? 'none' : `scale(${Math.min(pullDistance / 60, 1)})`,
                transition: isPullRefreshing ? 'none' : 'transform 0.2s ease',
              }}
            >
              <CircularProgress 
                size={20} 
                thickness={3}
                sx={{ 
                  color: '#0078d7',
                  animation: isPullRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }} 
              />
            </Box>
          )}
        </Box>

        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 3,
            position: 'relative',
          }}
        >

        {/* Summary Cards Section */}
        {summaryCards && summaryCards.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <SummaryCardsPanel
              dashboardId={activeDashboardId}
              username={getUsername()}
              connectionId={getConnectionId()}
              widgets={allItems}
              summaryCards={summaryCards}
              onRefresh={async () => {
                // Force reload to fetch new widgets and summary cards after approval
                const username = getUsername();
                if (username && activeDashboardId) {
                  await loadWidgetsForDashboard(username, activeDashboardId, true);
                }
              }}
              onCreateWidget={handleCreateWidgetFromCard}
              onEditCard={handleEditCardInDrawer}
              compact={false}
              selectionMode={selectionMode}
              selectedCards={selectedCards}
              onToggleCardSelection={toggleCardSelection}
              onCardClick={handleCardClick}
            />
          </Box>
        )}

        {/* Widgets Grid */}
        {(isLoading || isInitialLoad || loadingWidgets.size > 0) && allItems.length === 0 ? (
          <DashboardLoadingSkeleton />
        ) : (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: widgetGridColumns,
              gap: { xs: 2, md: 2.5 },
              alignItems: 'start',
              transition: 'grid-template-columns 0.3s ease',
            }}
          >
            {displayItems.filter(item => item && item.id).map((item, index) => {
              // Ensure unique key by combining id with index
              const uniqueItem = { ...item, _uniqueKey: `${item.id}-${index}` };
              return renderVisualizationCard(uniqueItem, index);
            })}
          </Box>
        )}
        </Container>
      </Box>

      {/* Fullscreen View */}
      <Dialog 
        open={fullscreenView.open} 
        onClose={() => { setFullscreenView({ open: false, item: null }); setFullscreenViewMode('table'); }}
        maxWidth={false}
        fullScreen
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 0,
            bgcolor: '#F8FAFC',
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle 
          component="div"
          sx={{ 
            px: { xs: 2, sm: 4 },
            py: { xs: 1.5, sm: 2 }, 
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            color: '#fff',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: { xs: '100%', sm: '40%' } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#fff', 
                mb: 0.25,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: { xs: 2, sm: 1 },
                WebkitBoxOrient: 'vertical',
              }}
            >
              {fullscreenView.item ? getTitle(fullscreenView.item) : ''}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              {fullscreenView.item?.supportingData?.length || fullscreenView.item?.pipelineData?.length || 0} records
            </Typography>
          </Box>
          
          {/* View Mode Toggles */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" sx={{ mr: { xs: 1, sm: 3 } }}>
            <ToggleButtonGroup
              value={fullscreenViewMode}
              exclusive
              onChange={(e, newMode) => newMode && setFullscreenViewMode(newMode)}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.7)',
                  border: 'none',
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  minWidth: { xs: 36, sm: 44 },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: '#fff',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }
              }}
            >
              <ToggleButton value="table">
                <Tooltip title="Table View" arrow>
                  <TableChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="bar">
                <Tooltip title="Bar Chart" arrow>
                  <BarChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="line">
                <Tooltip title="Line Chart" arrow>
                  <ShowChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="area">
                <Tooltip title="Area Chart" arrow>
                  <AreaChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="pie">
                <Tooltip title="Pie Chart" arrow>
                  <PieChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            {/* Download Buttons - Hidden on mobile */}
            <Tooltip title="Download CSV" arrow>
              <IconButton
                onClick={() => fullscreenView.item && handleDownloadCSV(fullscreenView.item)}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                <DownloadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            
            {/* Download Chart as Image */}
            {fullscreenViewMode !== 'table' && (
              <Tooltip title="Download Chart as PNG" arrow>
                <IconButton
                  onClick={() => {
                    const chartElement = document.querySelector('.recharts-wrapper');
                    if (chartElement) {
                      import('html2canvas').then(html2canvas => {
                        html2canvas.default(chartElement).then(canvas => {
                          const link = document.createElement('a');
                          link.download = `${fullscreenView.item?.title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`;
                          link.href = canvas.toDataURL();
                          link.click();
                        });
                      });
                    }
                  }}
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }}
                >
                  <ImageIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          
          <IconButton 
            onClick={() => { setFullscreenView({ open: false, item: null }); setFullscreenViewMode('table'); }}
            sx={{ 
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.15)',
              p: { xs: 0.75, sm: 1 },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#F8FAFC', height: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 80px)' }, overflow: 'auto' }}>
          <Box sx={{ 
            height: '100%', 
            minHeight: 600,
            bgcolor: '#fff', 
            borderRadius: 2, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {fullscreenView.item && renderVisualization(
                fullscreenView.item, 
                fullscreenViewMode,
                true
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Widget Configuration Studio */}
      <WidgetConfigStudio
        widgets={savedVisualizations}
        selectedWidget={configStudio.widget}
        isOpen={configStudio.open}
        onClose={() => setConfigStudio({ open: false, widget: null })}
        onWidgetSelect={(widget) => setConfigStudio({ open: true, widget })}
        onSave={(updatedWidget) => {
          // Update the widget with new configuration
          const { viewMode, chartType, config } = updatedWidget;
          
          // Update view mode for this widget
          if (viewMode) {
            setWidgetViewModes(prev => ({ ...prev, [updatedWidget.id]: viewMode }));
          }
          
          // Update the widget in saved visualizations
          setSavedVisualizations(prev => 
            prev.map(v => v.id === updatedWidget.id 
              ? { ...v, viewMode, chartType, config, title: config?.title || v.title }
              : v
            )
          );
          
          // Also update in Zustand store
          updateVisualization(activeDashboardId, updatedWidget.id, {
            viewMode,
            chartType,
            config,
            title: config?.title || updatedWidget.title,
          });
          
          // Close the studio
          setConfigStudio({ open: false, widget: null });
        }}
      />

      {/* Refresh Results Snackbar */}
      <Snackbar
        open={!!refreshResults}
        autoHideDuration={5000}
        onClose={() => setRefreshResults(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setRefreshResults(null)} 
          severity={refreshResults?.failedCount > 0 ? 'warning' : 'success'}
          variant="filled"
          sx={{ 
            minWidth: 300,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {refreshResults && (
            <>
              <strong>Dashboard Refreshed</strong>
              <br />
              {refreshResults.refreshedCount}/{refreshResults.totalWidgets} widgets updated
              {refreshResults.failedCount > 0 && ` • ${refreshResults.failedCount} failed`}
            </>
          )}
        </Alert>
      </Snackbar>

      {/* Floating Chat Button - AI Chatbot Icon */}
      <Zoom in={!chatDrawerOpen}>
        <Box
          onClick={() => setChatDrawerOpen(true)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedWidgetRef.current) {
              setChatDrawerOpen(true);
            }
          }}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
            transition: 'all 0.3s ease',
            zIndex: 1000,
            border: '2px solid #3B82F6',
            overflow: 'hidden',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 28px rgba(59, 130, 246, 0.45)',
            },
          }}
        >
          <Box
            component="img"
            src="/ai-chatbot.png"
            alt="MiFiX Assistant"
            sx={{ 
              width: 54, 
              height: 54,
              objectFit: 'cover',
            }}
          />
        </Box>
      </Zoom>
      </Box>

      {/* Chat Panel - Fixed position with slide animation */}
      <Box
        onDragOver={handleChatDragOver}
        onDragLeave={handleChatDragLeave}
        onDrop={handleChatDrop}
        sx={{
          width: chatDrawerOpen ? 420 : 0,
          flexShrink: 0,
          height: '100vh',
          maxHeight: '100vh',
          position: 'fixed',
          top: 0,
          right: 0,
          bgcolor: chatDropZoneActive ? '#EFF6FF' : '#fff',
          boxShadow: chatDrawerOpen ? '-4px 0 16px rgba(0,0,0,0.08)' : 'none',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          zIndex: 1200,
          borderLeft: chatDrawerOpen ? '1px solid #E2E8F0' : 'none',
          border: chatDropZoneActive ? '3px dashed #3B82F6' : 'none',
        }}
      >
        {chatDrawerOpen && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            maxHeight: '100vh',
            width: 420,
          }}>
            {/* Chat Header - Blue theme */}
            <Box sx={{
              bgcolor: '#3B82F6',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src="/ai-chatbot.png"
                    alt="MiFiX"
                    sx={{ width: 28, height: 28 }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    MiFiX Assistant
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                    Ask me anything about your data
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setChatDrawerOpen(false)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Chat Content Area - Also accepts widget drops */}
            <Box 
              onDragOver={handleChatDragOver}
              onDragLeave={handleChatDragLeave}
              onDrop={handleChatDrop}
              sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: chatDropZoneActive ? '#EFF6FF' : '#F8FAFC',
                minHeight: 0,
                transition: 'all 0.2s ease',
                position: 'relative',
                border: chatDropZoneActive ? '2px dashed #3B82F6' : '2px solid transparent',
                m: chatDropZoneActive ? 1.5 : 0,
                borderRadius: chatDropZoneActive ? 3 : 0,
              }}>
              
              {/* Drop Zone Visual Feedback */}
              {chatDropZoneActive && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                  pointerEvents: 'none',
                }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    animation: 'bounce 1s infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                    },
                  }}>
                    <GridViewIcon sx={{ fontSize: 32, color: '#3B82F6' }} />
                  </Box>
                  <Typography sx={{ color: '#1E40AF', fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                    Drop widget here
                  </Typography>
                  <Typography sx={{ color: '#3B82F6', fontSize: '0.85rem' }}>
                    to attach context to your question
                  </Typography>
                </Box>
              )}

              {/* Welcome Section - Compact */}
              <Box sx={{ 
                textAlign: 'center', 
                pt: 2, 
                pb: 1.5,
                px: 3,
                background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)',
              }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                  border: '2px solid #BFDBFE',
                }}>
                  <Box
                    component="img"
                    src="/ai-chatbot.png"
                    alt="MiFiX"
                    sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  />
                </Box>
                <Typography sx={{ 
                  color: '#3B82F6', 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  mb: 0.25,
                }}>
                  Welcome to MiFiX.ai
                </Typography>
                <Typography sx={{ 
                  color: '#6B7280', 
                  fontSize: '0.75rem', 
                  lineHeight: 1.4,
                }}>
                  I can help you edit your dashboard. Ask me anything!
                </Typography>
              </Box>

              {/* AI Message Bubble */}
              <Box sx={{ px: 3, pb: 1.5 }}>
                <Box sx={{
                  bgcolor: '#fff',
                  borderRadius: 2,
                  p: 1.25,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                }}>
                  <Box sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Box
                      component="img"
                      src="/ai-chatbot.png"
                      alt="MiFiX"
                      sx={{ width: 16, height: 16 }}
                    />
                  </Box>
                  <Typography sx={{ color: '#374151', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Hello! Ask me to add widgets or create custom insight cards from your data!
                  </Typography>
                </Box>
              </Box>

              {/* Quick Actions */}
              <Box sx={{ px: 3, pb: 2 }}>
                <Typography sx={{ 
                  color: '#9CA3AF', 
                  fontSize: '0.65rem', 
                  fontWeight: 600, 
                  mb: 1, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em' 
                }}>
                  Quick Actions
                </Typography>
                <Stack spacing={0.75}>
                  {[
                    { label: 'Add a new chart widget', icon: <BarChartIcon sx={{ fontSize: 16 }} />, color: '#3B82F6', prompt: 'Add a new widget showing today\'s performance metrics' },
                    { label: 'Show top performers', icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: '#10B981', prompt: 'Add a widget showing top performing regions' },
                    { label: 'Show me MTD disbursement', icon: <InfoIcon sx={{ fontSize: 16 }} />, color: '#F59E0B', prompt: 'Show me total MTD disbursement for Federal Bank' },
                    { label: 'Create alert card', icon: <WarningIcon sx={{ fontSize: 16 }} />, color: '#EF4444', prompt: 'Create an alert for zero performing FOs' },
                  ].map((action, i) => (
                    <Box
                      key={i}
                      onClick={() => setChatInput(action.prompt)}
                      sx={{
                        bgcolor: '#fff',
                        borderRadius: 1.5,
                        py: 1,
                        px: 1.5,
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '&:hover': {
                          borderColor: '#3B82F6',
                          bgcolor: '#EFF6FF',
                        }
                      }}
                    >
                      <Box sx={{ color: action.color }}>
                        {action.icon}
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>
                        {action.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* AI Insights Section */}
              <Box sx={{ px: 3, pb: 2 }}>
                <SummaryCardsPanel
                  dashboardId={activeDashboardId}
                  username={getUsername()}
                  connectionId={getConnectionId()}
                  widgets={allItems}
                  summaryCards={summaryCards}
                  onRefresh={async () => {
                    // Force reload to fetch new widgets and summary cards after approval
                    const username = getUsername();
                    if (username && activeDashboardId) {
                      await loadWidgetsForDashboard(username, activeDashboardId, true);
                    }
                  }}
                  compact
                  onCardClick={handleCardClick}
                />
              </Box>

              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <Box sx={{ px: 3, pb: 2 }}>
                  {chatMessages.map((msg, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      {/* Widget Reference Card for user messages */}
                      {msg.role === 'user' && msg.widgetRef && (
                        <Box sx={{
                          bgcolor: '#EFF6FF',
                          borderRadius: '12px 12px 0 0',
                          p: 1.5,
                          ml: 'auto',
                          maxWidth: '90%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          border: '1px solid #BFDBFE',
                          borderBottom: 'none',
                        }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: '#DBEAFE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <GridViewIcon sx={{ fontSize: 14, color: '#2563EB' }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>
                              Context
                            </Typography>
                            <Typography sx={{ 
                              color: '#1E40AF', 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {msg.widgetRef.widgetTitle}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{
                        bgcolor: msg.role === 'user' ? '#3B82F6' : (msg.success === false ? '#FEF2F2' : '#fff'),
                        color: msg.role === 'user' ? '#fff' : (msg.success === false ? '#991B1B' : '#374151'),
                        borderRadius: msg.role === 'user' && msg.widgetRef ? '0 0 12px 12px' : 2.5,
                        p: 1.5,
                        ml: msg.role === 'user' ? 'auto' : 0,
                        mr: msg.role === 'user' ? 0 : 'auto',
                        maxWidth: '90%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: msg.success === false ? '1px solid #FECACA' : 'none',
                      }}>
                        <Typography sx={{ fontSize: '0.85rem' }}>{msg.content}</Typography>
                      </Box>
                    </Box>
                  ))}
                  
                  {/* Loading indicator */}
                  {isChatLoading && (
                    <Box sx={{
                      bgcolor: '#fff',
                      borderRadius: 2.5,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                      <CircularProgress size={14} sx={{ color: '#3B82F6' }} />
                      <Typography sx={{ fontSize: '0.85rem', color: '#6B7280' }}>
                        Processing your request...
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Chat Input - Fixed at bottom */}
            <Box sx={{
              p: 2,
              borderTop: '1px solid #E5E7EB',
              bgcolor: chatDropZoneActive ? '#DBEAFE' : '#fff',
              flexShrink: 0,
              marginTop: 'auto',
              transition: 'background-color 0.2s',
            }}>
              {/* Drop Zone Indicator */}
              {chatDropZoneActive && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.5,
                  mb: 1.5,
                  borderRadius: 2,
                  border: '2px dashed #3B82F6',
                  bgcolor: '#EFF6FF',
                }}>
                  <GridViewIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                  <Typography sx={{ color: '#1E40AF', fontSize: '0.85rem', fontWeight: 600 }}>
                    Release to attach widget
                  </Typography>
                </Box>
              )}
              
              {/* Card-based Widget Creation Mode Indicator */}
              {widgetCreationMode && !chatDropZoneActive && (
                <Box sx={{
                  mb: 1.5,
                  p: 2,
                  background: widgetCreationMode.mode === 'create' 
                    ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' 
                    : 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: widgetCreationMode.mode === 'create' 
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                    : '0 4px 12px rgba(245, 158, 11, 0.3)',
                  animation: 'slideIn 0.3s ease-out',
                  '@keyframes slideIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
                    '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                  },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {widgetCreationMode.mode === 'create' ? (
                        <BarChartIcon sx={{ fontSize: 22, color: '#fff' }} />
                      ) : (
                        <EditIcon sx={{ fontSize: 22, color: '#fff' }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ 
                        color: 'rgba(255,255,255,0.85)', 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.25,
                      }}>
                        {widgetCreationMode.mode === 'create' ? 'Add New Insight' : 'Edit Insight'}
                      </Typography>
                      {widgetCreationMode.card?.title && (
                        <Typography sx={{ 
                          color: '#fff', 
                          fontSize: '0.9rem', 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {widgetCreationMode.card?.title}
                        </Typography>
                      )}
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setWidgetCreationMode(null);
                        setChatInput('');
                      }}
                      sx={{ 
                        p: 0.75, 
                        color: 'rgba(255,255,255,0.7)', 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.2)' } 
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    mb: widgetCreationMode.mode === 'create' ? 1.5 : 0,
                  }}>
                    {widgetCreationMode.mode === 'create' 
                      ? 'Ask a question about your data to create:'
                      : 'Enter a new title or description for this insight.'}
                  </Typography>
                  
                  {/* Output Type Toggle - Only show for create mode */}
                  {widgetCreationMode.mode === 'create' && (
                    <ToggleButtonGroup
                      value={outputType}
                      exclusive
                      onChange={(e, newValue) => newValue && setOutputType(newValue)}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.15)',
                        borderRadius: 2,
                        '& .MuiToggleButton-root': {
                          color: 'rgba(255,255,255,0.7)',
                          border: 'none',
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,255,255,0.25)',
                            color: '#fff',
                            fontWeight: 600,
                          },
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                          },
                        },
                      }}
                    >
                      <ToggleButton value="widget">
                        <BarChartIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        Widget
                      </ToggleButton>
                      <ToggleButton value="card">
                        <GridViewIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        Card
                      </ToggleButton>
                      <ToggleButton value="both">
                        Both
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}
                </Box>
              )}

              {/* Attached Widget Card - Prominent Success Indicator */}
              {attachedWidget && !chatDropZoneActive && !widgetCreationMode && (
                <Box sx={{
                  mb: 1.5,
                  p: 2,
                  background: 'linear-gradient(135deg, #0078d7 0%, #2f8fef 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 12px rgba(0, 120, 215, 0.3)',
                  animation: 'slideIn 0.3s ease-out',
                  '@keyframes slideIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
                    '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                  },
                }}>
                  {/* Success Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 22, color: '#fff' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ 
                        color: 'rgba(255,255,255,0.85)', 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.25,
                      }}>
                        Widget Context Added
                      </Typography>
                      <Typography sx={{ 
                        color: '#fff', 
                        fontSize: '0.95rem', 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {attachedWidget.title}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => setAttachedWidget(null)}
                      sx={{ 
                        p: 0.75, 
                        color: 'rgba(255,255,255,0.7)', 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.2)' } 
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  
                  {/* Helper Text */}
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '0.8rem',
                    mb: 1.5,
                    lineHeight: 1.4,
                  }}>
                    You can now edit this widget without specifying its title. Just describe what changes you want.
                  </Typography>
                  
                  {/* Quick Action Chips */}
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      icon={<EditIcon sx={{ fontSize: 12 }} />}
                      label="Edit data"
                      onClick={() => setChatInput(`Change this widget to show `)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        height: 28,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#fff' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<TableChartIcon sx={{ fontSize: 12 }} />}
                      label="Change view"
                      onClick={() => setChatInput(`Change this widget to a `)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        height: 28,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#fff' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<RefreshIcon sx={{ fontSize: 12 }} />}
                      label="Refresh"
                      onClick={() => setChatInput(`Refresh this widget's data`)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        height: 28,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#fff' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<DeleteIcon sx={{ fontSize: 12 }} />}
                      label="Delete"
                      onClick={() => setChatInput(`Delete this widget`)}
                      sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.3)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        height: 28,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#fff' },
                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.5)' },
                      }}
                    />
                  </Stack>
                </Box>
              )}
              
              {/* Output Type Toggle - Always visible for regular chat */}
              {!widgetCreationMode && !attachedWidget && (
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>
                    Create:
                  </Typography>
                  <ToggleButtonGroup
                    value={outputType}
                    exclusive
                    onChange={(e, newValue) => newValue && setOutputType(newValue)}
                    size="small"
                    sx={{
                      bgcolor: '#F3F4F6',
                      borderRadius: 1.5,
                      '& .MuiToggleButton-root': {
                        color: '#6B7280',
                        border: 'none',
                        px: 1.25,
                        py: 0.25,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          bgcolor: '#3B82F6',
                          color: '#fff',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: '#2563EB',
                          },
                        },
                        '&:hover': {
                          bgcolor: '#E5E7EB',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="widget">
                      Widget
                    </ToggleButton>
                    <ToggleButton value="card">
                      Card
                    </ToggleButton>
                    <ToggleButton value="both">
                      Both
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}

              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  border: '1px solid #E5E7EB',
                  borderRadius: 2.5,
                  px: 1.5,
                  py: 1,
                  transition: 'all 0.2s',
                  '&:focus-within': {
                    borderColor: '#3B82F6',
                    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
                  }
                }}
              >
                <InputBase
                  placeholder={attachedWidget ? `What would you like to do with "${attachedWidget.title}"?` : "Ask me to edit your dashboard..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                  multiline
                  maxRows={4}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  sx={{ 
                    flex: 1, 
                    fontSize: '0.85rem',
                    '& textarea::placeholder': { color: '#9CA3AF' },
                    '& .MuiInputBase-input': {
                      overflow: 'auto',
                    }
                  }}
                />
                <IconButton 
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isChatLoading}
                  sx={{ 
                    bgcolor: chatInput.trim() && !isChatLoading ? '#3B82F6' : '#E5E7EB',
                    color: chatInput.trim() && !isChatLoading ? '#fff' : '#9CA3AF',
                    ml: 1,
                    width: 36,
                    height: 36,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: chatInput.trim() && !isChatLoading ? '#2563EB' : '#E5E7EB',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#E5E7EB',
                      color: '#9CA3AF',
                    }
                  }}
                >
                  {isChatLoading ? (
                    <CircularProgress size={18} sx={{ color: '#9CA3AF' }} />
                  ) : (
                    <SendIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Paper>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.65rem', mt: 0.75, textAlign: 'center' }}>
                Press Enter to send
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
