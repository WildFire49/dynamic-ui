import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  CircularProgress
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
  CloudOff as CloudOffIcon
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

// Chart colors matching the reference UI
const CHART_COLORS = {
  primary: '#3B82F6',
  primaryLight: '#93C5FD',
  primaryGradient: ['#3B82F6', '#60A5FA'],
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  area: {
    stroke: '#3B82F6',
    fill: 'url(#areaGradient)'
  },
  bar: '#3B82F6'
};

const Dashboard = () => {
  const theme = useTheme();
  
  // Zustand store for multi-dashboard support
  const {
    activeDashboardId,
    visualizationsByDashboard,
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
  } = useDashboardStore();

  const [savedVisualizations, setSavedVisualizations] = useState([]);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [fullscreenView, setFullscreenView] = useState({ open: false, item: null });
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [globalViewMode, setGlobalViewMode] = useState('auto'); // 'auto', 'area', 'bar', 'table'

  // Helper to get title - prioritize question/query over generic titles
  const getTitle = (item) => {
    // Check for natural language query first (most descriptive)
    if (item.question && !item.question.startsWith('Analysis -') && item.question !== 'Unknown Query') {
      return item.question;
    }
    // Check title but skip generic ones
    if (item.title && !item.title.startsWith('Analysis -') && item.title !== 'Unknown Query') {
      return item.title;
    }
    // Fallback to any available question/title
    if (item.question) return item.question;
    if (item.title) return item.title;
    return 'Analysis Result';
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
      return `₹${value.toLocaleString()}`;
    }
    
    // Default formatting for other numbers
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Load dashboards from API on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      const username = localStorage.getItem('username') || localStorage.getItem('userId');
      
      if (username) {
        // Try to load from server first
        const result = await loadFromServer(username);
        
        if (!result.success) {
          console.log('📦 Server load failed, using local data');
          // If server fails, migrate any old localStorage data
          const hasMigrated = localStorage.getItem('dashboardMigrated');
          if (!hasMigrated) {
            migrateFromLocalStorage();
            localStorage.setItem('dashboardMigrated', 'true');
          }
        }
      } else {
        // No user, just migrate local data
        const hasMigrated = localStorage.getItem('dashboardMigrated');
        if (!hasMigrated) {
          migrateFromLocalStorage();
          localStorage.setItem('dashboardMigrated', 'true');
        }
      }
    };

    initializeDashboard();
  }, []);

  // Subscribe to Zustand store changes for real-time updates
  useEffect(() => {
    const unsubscribe = useDashboardStore.subscribe(
      (state) => {
        const storeVisualizations = state.visualizationsByDashboard[activeDashboardId] || [];
        setSavedVisualizations([...storeVisualizations]);
      }
    );
    return () => unsubscribe();
  }, [activeDashboardId]);

  // Load data from Zustand store when active dashboard changes
  useEffect(() => {
    const loadData = () => {
      try {
        // Get visualizations ONLY from Zustand store for active dashboard
        const freshState = useDashboardStore.getState();
        const storeVisualizations = freshState.visualizationsByDashboard[activeDashboardId] || [];
        console.log(`📊 Loading dashboard "${activeDashboardId}":`, storeVisualizations.length, 'items');
        setSavedVisualizations([...storeVisualizations]);
        
        // Analyses are still from localStorage (not dashboard-specific yet)
        const savedAn = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
        setSavedAnalyses(savedAn);
        
        const savedOrder = JSON.parse(localStorage.getItem('dashboardWidgetOrder') || '[]');
        setWidgetOrder(savedOrder);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
      setIsInitialLoad(false);
    };
    loadData();
  }, [activeDashboardId, visualizationsByDashboard]);

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
    // Combine visualizations and analyses
    let items = [...savedVisualizations, ...savedAnalyses];
    
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
  const handleDeleteVisualization = (id) => {
    setSavedVisualizations(prev => prev.filter(item => item.id !== id));
    setSavedAnalyses(prev => prev.filter(item => item.id !== id));
    setWidgetOrder(prev => prev.filter(wId => wId !== id));
    setAnchorEl(null);
  };

  const handleEditTitle = (id, newTitle) => {
    if (!newTitle?.trim()) return;
    setSavedVisualizations(prev => prev.map(item => item.id === id ? { ...item, title: newTitle, question: newTitle } : item));
    setSavedAnalyses(prev => prev.map(item => item.id === id ? { ...item, title: newTitle, question: newTitle } : item));
    setEditingTitleId(null);
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

  // Refresh widget data by calling the chat endpoint with the original prompt
  const handleRefreshWidget = async (item) => {
    // Use originalPrompt first (immutable), fallback to question, never use title (user-editable)
    const question = item.originalPrompt || item.question;
    if (!question || question === 'Unknown Query') {
      console.warn('Cannot refresh: No original prompt found for widget');
      return;
    }

    setRefreshingWidgets(prev => ({ ...prev, [item.id]: true }));

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
      const roleCode = localStorage.getItem('roleCode') || 'RE-20448';
      
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ 
          message: question,
          user_id: userId,
          roleCode: roleCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to refresh data');

      const data = await response.json();
      
      // Extract data from chat response
      const newData = data?.response?.content?.results || 
                      data?.content?.results || 
                      data?.results || 
                      [];
      
      if (newData.length === 0) {
        console.warn('No data returned from refresh');
        return;
      }

      const updatedItem = {
        ...item,
        timestamp: new Date().toISOString(),
        supporting_data: newData,
        supportingData: newData,
        pipelineData: newData,
        dataGrid: {
          ...item.dataGrid,
          gridRows: newData.map((row, idx) => ({ id: idx + 1, ...row })),
        },
      };

      // Update in state
      setSavedVisualizations(prev => 
        prev.map(v => v.id === item.id ? updatedItem : v)
      );
      setSavedAnalyses(prev => 
        prev.map(a => a.id === item.id ? updatedItem : a)
      );

      // Also update localStorage
      const existing = JSON.parse(localStorage.getItem('dashboardVisualizations') || '[]');
      const updated = existing.map(v => v.id === item.id ? updatedItem : v);
      localStorage.setItem('dashboardVisualizations', JSON.stringify(updated));

    } catch (error) {
      console.error('Error refreshing widget:', error);
    } finally {
      setRefreshingWidgets(prev => ({ ...prev, [item.id]: false }));
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
    setDraggedItem(item);
    setDraggedIndex(index);
    setDragOverIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedItem && dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    // Don't reset on leave - keep the current position
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
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
    
    // Update widget order
    setWidgetOrder(newItems.map(item => item.id));
    
    // Reset drag state
    setDraggedItem(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e) => {
    // If dropped on valid target, handleDrop already handled it
    // This handles dropping outside valid targets
    if (draggedItem && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Apply the reorder based on last hover position
      const newItems = [...allItems];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dragOverIndex, 0, removed);
      setWidgetOrder(newItems.map(item => item.id));
    }
    
    setDraggedItem(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  // Optimized resize handlers using refs for smooth performance
  const resizeRef = useRef(null);
  const rafRef = useRef(null);
  const lastHeightRef = useRef(null);

  const handleResizeStart = (e, itemId, currentWidth, currentHeight) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store resize state in ref for immediate access (no re-renders)
    resizeRef.current = {
      id: itemId,
      startY: e.clientY,
      startWidth: currentWidth,
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
      
      const { id, startY, startHeight, startWidth } = resizeRef.current;
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
      
      // Skip if height hasn't changed (optimization)
      if (lastHeightRef.current === newHeight) return;
      lastHeightRef.current = newHeight;
      
      // Direct DOM manipulation for instant visual feedback
      const element = document.getElementById(`widget-${id}`);
      if (element) {
        element.style.height = `${newHeight}px`;
      }
    });
  }, []);

  const handleResizeEnd = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Commit final height to React state
    if (resizeRef.current && lastHeightRef.current) {
      const { id, startWidth } = resizeRef.current;
      const finalHeight = lastHeightRef.current;
      
      setWidgetSizes(prev => ({
        ...prev,
        [id]: { 
          width: prev[id]?.width || startWidth,
          height: finalHeight 
        }
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

  // Get widget size with defaults
  const getWidgetSize = (itemId, isFullWidth) => {
    const saved = widgetSizes[itemId];
    if (saved) return saved;
    return { 
      width: isFullWidth ? '100%' : 'auto',
      height: 400 // Default height
    };
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

  // Extract data from item
  const getItemData = (item) => {
    const rawData = item.supporting_data || item.supportingData || item.pipelineData || 
                    item.data?.response?.analysis_result?.supporting_data || [];
    return rawData.map((row, index) => ({
      id: row.id || row._id || `row-${index}`,
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
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
            </linearGradient>
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
          {valueKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={idx === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary}
              fill={idx === 0 ? 'url(#areaGradient)' : 'transparent'}
              strokeWidth={2}
              dot={{ r: 4, fill: '#fff', stroke: idx === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: idx === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary }}
            />
          ))}
        </AreaChart>
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
          {valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={idx === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render Table - with centered single-column support
  const renderTable = (data) => {
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'id' && !k.startsWith('_'));
    
    // For single-column single-row data, show a nice centered display
    if (data.length === 1 && keys.length === 1) {
      const key = keys[0];
      const value = data[0][key];
      const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value));
      
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          width: '100%',
          background: `linear-gradient(135deg, ${alpha(CHART_COLORS.primary, 0.03)} 0%, ${alpha(CHART_COLORS.secondary, 0.03)} 100%)`,
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            px: 6,
          }}>
            <Typography 
              sx={{ 
                color: '#6B7280', 
                fontWeight: 600,
                letterSpacing: 2,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              {key.replace(/_/g, ' ')}
            </Typography>
            <Typography 
              sx={{ 
                fontWeight: 700, 
                color: CHART_COLORS.primary,
                fontSize: '2.75rem',
                lineHeight: 1,
              }}
            >
              {isNumeric ? formatValue(parseFloat(value), key) : value}
            </Typography>
          </Box>
        </Box>
      );
    }
    
    return (
      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGridComponent
          rows={data}
          columns={[]}
          title={null}
          height="100%"
          autoGenerateColumns={true}
          showSaveButton={false}
          variant="clean"
        />
      </Box>
    );
  };

  // Main visualization renderer
  const renderVisualization = (item, viewMode) => {
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
    if (data.length === 0) {
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
        // For 'Charts' mode - use area chart for time series, bar for others
        return detectedType === 'area' ? renderAreaChart(data) : renderBarChart(data);
      case 'bar':
        return renderBarChart(data);
      case 'table':
        return renderTable(data);
      default:
        return detectedType === 'area' ? renderAreaChart(data) : 
               detectedType === 'bar' ? renderBarChart(data) : renderTable(data);
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
    const widgetSize = getWidgetSize(item.id, isFullWidth);
    
    return (
      <Fade 
        in 
        timeout={200 + (index * 50)} 
        key={item._uniqueKey || `${item.id}-${index}`}
        style={{ 
          gridColumn: isFullWidth ? '1 / -1' : 'auto'
        }}
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
            height: widgetSize.height,
            minHeight: 200,
            maxHeight: 800,
            display: 'flex',
            flexDirection: 'column',
            border: draggedItem?.id === item.id 
              ? '2px solid #3B82F6' 
              : resizing?.id === item.id
                ? '2px solid #10B981'
                : '1px solid #E5E7EB',
            borderRadius: 3,
            bgcolor: '#fff',
            overflow: 'hidden',
            cursor: draggedItem ? 'grabbing' : 'grab',
            boxShadow: draggedItem?.id === item.id 
              ? '0 8px 24px rgba(59, 130, 246, 0.25)' 
              : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
            transform: draggedItem?.id === item.id 
              ? 'scale(1.02)' 
              : 'translateZ(0)', // GPU acceleration
            transition: resizing?.id === item.id ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
            zIndex: draggedItem?.id === item.id ? 10 : 1,
            position: 'relative',
            willChange: resizing?.id === item.id ? 'height' : 'auto',
            contain: 'layout style',
            '&:hover': {
              boxShadow: draggedItem ? undefined : '0 4px 16px rgba(0,0,0,0.08)',
            },
            '&:active': {
              cursor: 'grabbing'
            },
            // Show resize handle on hover (bottom edge)
            '&:hover .resize-handle': {
              opacity: 0.6,
            },
            '&:hover .resize-handle:hover': {
              opacity: 1,
            }
          }}
        >
            {/* Widget Header */}
            <Box sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E5E7EB',
              flexShrink: 0
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
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
                        color: '#111827',
                        fontSize: '0.95rem',
                        lineHeight: 1.4,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: '#F3F4F6',
                        border: '1px solid #3B82F6',
                        '& input': {
                          padding: 0,
                        }
                      }}
                    />
                  </ClickAwayListener>
                ) : (
                  <Typography 
                    variant="subtitle1" 
                    noWrap 
                    draggable={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditTitle(item);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.preventDefault()}
                    sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                      cursor: 'text',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      userSelect: 'none',
                      '&:hover': {
                        bgcolor: '#F3F4F6',
                      }
                    }}
                  >
                    {getTitle(item)}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={0.5} alignItems="center">
                {/* View Mode Toggle - only show when global is 'auto' */}
                {item.type !== 'analysis_widget' && data.length > 0 && globalViewMode === 'auto' && (
                  <ToggleButtonGroup
                    value={currentViewMode}
                    exclusive
                    onChange={(e, val) => handleViewModeChange(item.id, val)}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        color: '#9CA3AF',
                        '&.Mui-selected': {
                          bgcolor: alpha(CHART_COLORS.primary, 0.1),
                          color: CHART_COLORS.primary,
                        },
                        '&:hover': {
                          bgcolor: alpha(CHART_COLORS.primary, 0.05),
                        }
                      }
                    }}
                  >
                    <ToggleButton value="area">
                      <Tooltip title="Area Chart"><ShowChartIcon sx={{ fontSize: 18 }} /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="bar">
                      <Tooltip title="Bar Chart"><BarChartIcon sx={{ fontSize: 18 }} /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="table">
                      <Tooltip title="Table"><TableChartIcon sx={{ fontSize: 18 }} /></Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                {/* Download CSV Button */}
                <Tooltip title="Download as CSV">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDownloadCSV(item)}
                    sx={{ 
                      color: '#9CA3AF', 
                      '&:hover': { color: CHART_COLORS.secondary },
                    }}
                  >
                    <FileDownloadIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                {/* Refresh Button */}
                <Tooltip title={`Refresh • ${formatLastUpdated(item.timestamp)}`}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleRefreshWidget(item)}
                    disabled={refreshingWidgets[item.id]}
                    sx={{ 
                      color: refreshingWidgets[item.id] ? CHART_COLORS.primary : '#9CA3AF', 
                      '&:hover': { color: CHART_COLORS.primary },
                      animation: refreshingWidgets[item.id] ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <IconButton 
                  size="small" 
                  onClick={() => setFullscreenView({ open: true, item })} 
                  sx={{ color: '#9CA3AF', '&:hover': { color: '#6B7280' } }}
                >
                  <FullscreenIcon sx={{ fontSize: 18 }} />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  onClick={(e) => handleMenuOpen(e, item.id)}
                  sx={{ color: '#9CA3AF', '&:hover': { color: '#6B7280' } }}
                >
                  <MoreVertIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>

              {/* Context Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && activeMenuId === item.id}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    mt: 1,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleStartEditTitle(item); handleMenuClose(); }}>
                  <EditIcon sx={{ fontSize: 18, mr: 1.5, color: '#6B7280' }} /> Rename
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleDeleteVisualization(item.id); handleMenuClose(); }} sx={{ color: '#EF4444' }}>
                  <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} /> Delete
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
              '& > *': {
                flex: 1,
                minHeight: 0,
              }
            }}>
              {renderVisualization(item, currentViewMode)}
            </Box>

            {/* Widget Footer - Record Count & Last Updated */}
            {item.type !== 'analysis_widget' && (
              <Box sx={{ 
                px: 2, 
                py: 0.75, 
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#FAFAFA',
                flexShrink: 0,
              }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
                  {recordCount > 0 ? `${recordCount} records` : 'No data'}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                    {formatLastUpdated(item.timestamp)}
                  </Typography>
                </Stack>
              </Box>
            )}
            
            {/* Resize Handle - Bottom edge (vertical resize only) */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => {
                const element = document.getElementById(`widget-${item.id}`);
                if (element) {
                  const rect = element.getBoundingClientRect();
                  handleResizeStart(e, item.id, rect.width, rect.height);
                }
              }}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 8,
                cursor: 'ns-resize', // Vertical resize cursor
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
        </Fade>
    );
  };


  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh' }}>
      {/* Dashboard Selector Tabs */}
      <DashboardSelector />
      
      {/* Toolbar - Single row with all controls */}
      <Box 
        sx={{ 
          bgcolor: '#fff', 
          borderBottom: '1px solid #E5E7EB',
          px: 3,
          py: 1.5,
        }}
      >
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          spacing={3}
        >
          {/* Left - Avatar & Personalized Message */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              component="img"
              src="/ai-chatbot.png"
              alt="MiFiX"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '16px',
                objectFit: 'contain',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            />
            <Typography sx={{ 
              fontWeight: 500, 
              color: '#374151', 
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}>
              {allItems.length > 0 
                ? <>MiFiX.ai has saved <Box component="span" sx={{ fontWeight: 600, color: '#111827' }}>{allItems.length}</Box> visualization{allItems.length !== 1 ? 's' : ''} for you</>
                : `MiFiX.ai is ready to create visualizations for you`}
            </Typography>
            {lastGlobalUpdate && allItems.length > 0 && (
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                • Updated {formatLastUpdated(lastGlobalUpdate)}
              </Typography>
            )}
            {/* Sync Status Indicator */}
            {isSyncing ? (
              <Tooltip title="Syncing to cloud...">
                <Chip
                  icon={<CloudSyncIcon sx={{ fontSize: 14 }} />}
                  label="Syncing"
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#3B82F6', 0.1), 
                    color: '#3B82F6',
                    fontSize: '0.7rem',
                    height: 24,
                    '& .MuiChip-icon': { color: '#3B82F6' }
                  }}
                />
              </Tooltip>
            ) : lastSyncedAt ? (
              <Tooltip title={`Last synced: ${new Date(lastSyncedAt).toLocaleString()}`}>
                <Chip
                  icon={<CloudDoneIcon sx={{ fontSize: 14 }} />}
                  label="Synced"
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#10B981', 0.1), 
                    color: '#10B981',
                    fontSize: '0.7rem',
                    height: 24,
                    '& .MuiChip-icon': { color: '#10B981' }
                  }}
                />
              </Tooltip>
            ) : null}
            {allItems.length > 0 && (
              <Tooltip title="Sync to cloud">
                <IconButton
                  size="small"
                  onClick={async () => {
                    const username = localStorage.getItem('username') || localStorage.getItem('userId');
                    if (username) {
                      await syncToServer(username);
                    }
                  }}
                  disabled={isSyncing}
                  sx={{ color: '#9CA3AF', p: 0.5, '&:hover': { color: '#374151' } }}
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Center - Search */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #E5E7EB',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              width: 280,
              bgcolor: '#F9FAFB',
              transition: 'all 0.2s',
              '&:focus-within': {
                borderColor: CHART_COLORS.primary,
                bgcolor: '#fff',
                boxShadow: `0 0 0 2px ${alpha(CHART_COLORS.primary, 0.1)}`,
              }
            }}
          >
            <SearchIcon sx={{ color: '#9CA3AF', fontSize: 16, mr: 1 }} />
            <InputBase
              placeholder="Search visualizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                flex: 1, 
                fontSize: '0.8rem',
                '& input::placeholder': { color: '#9CA3AF', opacity: 1 }
              }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25 }}>
                <CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
              </IconButton>
            )}
          </Paper>

          {/* Right - View Controls */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={globalViewMode}
              exclusive
              onChange={(e, newMode) => newMode && setGlobalViewMode(newMode)}
              size="small"
              sx={{
                bgcolor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 1.5,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  color: '#6B7280',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: CHART_COLORS.primary,
                    color: '#fff',
                    '&:hover': { bgcolor: CHART_COLORS.primary },
                  },
                  '&:hover': { bgcolor: alpha(CHART_COLORS.primary, 0.08) },
                },
              }}
            >
              <ToggleButton value="auto">
                <GridViewIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Auto
              </ToggleButton>
              <ToggleButton value="area">
                <ShowChartIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Charts
              </ToggleButton>
              <ToggleButton value="table">
                <TableChartIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Tables
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Sort */}
            <Button
              size="small"
              startIcon={<SortIcon sx={{ fontSize: 14 }} />}
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              sx={{ 
                px: 1.5, 
                py: 0.5,
                color: '#6B7280',
                bgcolor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#F3F4F6' }
              }}
            >
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ py: 3 }}>

        {/* Widgets Grid */}
        {isLoading ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 3, 
              border: '1px solid #E5E7EB', 
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <CircularProgress size={48} sx={{ color: '#3B82F6', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Loading Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Fetching your saved visualizations...
            </Typography>
          </Paper>
        ) : allItems.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 3, 
              border: '2px dashed #D1D5DB', 
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <DashboardIcon sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Your Dashboard is Empty
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', maxWidth: 400, mx: 'auto' }}>
              Generate analyses using the chat interface and save them to your dashboard to see beautiful visualizations here.
            </Typography>
          </Paper>
        ) : (
          <Box 
            sx={{ 
              columnCount: { xs: 1, sm: 2, lg: 2 },
              columnGap: 2.5,
              '& > *': {
                breakInside: 'avoid',
                marginBottom: 2.5,
              }
            }}
          >
            {displayItems.map((item, index) => {
              // Ensure unique key by combining id with index
              const uniqueItem = { ...item, _uniqueKey: `${item.id}-${index}` };
              return renderVisualizationCard(uniqueItem, index);
            })}
          </Box>
        )}
      </Container>

      {/* Fullscreen View */}
      <Dialog 
        open={fullscreenView.open} 
        onClose={() => setFullscreenView({ open: false, item: null })}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            height: 'calc(100vh - 64px)',
            m: 4,
            border: '1px solid #E5E7EB'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle 
          component="div"
          sx={{ 
            px: 3,
            py: 2, 
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#fff'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            {fullscreenView.item?.title || fullscreenView.item?.question}
          </Typography>
          <IconButton 
            onClick={() => setFullscreenView({ open: false, item: null })}
            sx={{ color: '#6B7280' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#F9FAFB' }}>
          <Box sx={{ height: '100%' }}>
            {fullscreenView.item && renderVisualization(
              fullscreenView.item, 
              widgetViewModes[fullscreenView.item.id]
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
