import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  Avatar,
  Divider,
  Paper,
  Container,
  Stack,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  DataUsage as DataUsageIcon,
  InsertChart as InsertChartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon
} from '@mui/icons-material';
import DynamicDataVisualization from './mui/DynamicDataVisualization';
import Sidebar from './Sidebar';
import { useRef } from 'react';
import DataGridComponent from './charts/DataGridComponent';
import AnalysisWidget from './widgets/AnalysisWidget';

const Dashboard = () => {
  const theme = useTheme();
  const [savedVisualizations, setSavedVisualizations] = useState([]);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, item: null });
  const [fullscreenView, setFullscreenView] = useState({ open: false, item: null });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expandedWidgets, setExpandedWidgets] = useState(new Set());
  const [widgetOrder, setWidgetOrder] = useState([]);
  const analysisRefs = useRef({});

  const handleSelectAnalysis = (timestamp) => {
    const el = analysisRefs.current[timestamp];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Load saved visualizations and analyses from localStorage on mount
  useEffect(() => {
    // Load old visualizations
    const saved = localStorage.getItem('dashboardVisualizations');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setSavedVisualizations(parsedData);
      } catch (error) {
        setSavedVisualizations([]);
      }
    }
    
    // Load new analyses
    const savedAnalysesData = localStorage.getItem('savedAnalyses');
    if (savedAnalysesData) {
      try {
        const parsedAnalyses = JSON.parse(savedAnalysesData);
        setSavedAnalyses(parsedAnalyses);
      } catch (error) {
        setSavedAnalyses([]);
      }
    }

    // Load widget order
    const savedOrder = localStorage.getItem('dashboardWidgetOrder');
    if (savedOrder) {
      try {
        setWidgetOrder(JSON.parse(savedOrder));
      } catch (e) {
        setWidgetOrder([]);
      }
    }
    
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Save visualizations to localStorage whenever they change
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('dashboardVisualizations', JSON.stringify(savedVisualizations));
    }
  }, [savedVisualizations, isInitialLoad]);
  
  // Save analyses to localStorage whenever they change
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
    }
  }, [savedAnalyses, isInitialLoad]);

  // Save widget order whenever it changes
  useEffect(() => {
    if (!isInitialLoad && widgetOrder.length > 0) {
      localStorage.setItem('dashboardWidgetOrder', JSON.stringify(widgetOrder));
    }
  }, [widgetOrder, isInitialLoad]);

  // Calculate dashboard statistics
  // Sort items based on widgetOrder, new items (not in order) go to top
  const allItems = [...savedVisualizations, ...savedAnalyses].sort((a, b) => {
    const indexA = widgetOrder.indexOf(a.id);
    const indexB = widgetOrder.indexOf(b.id);

    // If both have order, sort by order
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    
    // If one has order, it goes to bottom (new items top)
    // Actually, let's put new items at TOP
    if (indexA === -1 && indexB !== -1) return -1;
    if (indexA !== -1 && indexB === -1) return 1;

    // If neither has order, sort by timestamp (newest first)
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  // Update widget order if new items appear
  useEffect(() => {
    if (allItems.length > 0 && !isInitialLoad) {
      const currentIds = allItems.map(item => item.id);
      const isOrderOutdated = currentIds.some(id => !widgetOrder.includes(id)) || widgetOrder.length !== currentIds.length;
      
      if (isOrderOutdated) {
        // Only update if structure changed, to avoid loop
        // We just want to ensure new items get an index
        // But sorting is already handling un-indexed items by putting them at top.
        // To persist this "top" position, we should update widgetOrder.
        // However, updating state in effect derived from state causes loop.
        // We'll skip auto-update and let user action trigger it, or do it once.
      }
    }
  }, [allItems.length, isInitialLoad]); // Only on length change

  const dashboardStats = {
    totalVisualizations: allItems.length,
    totalRecords: allItems.reduce((sum, item) => {
      const supportingData = item.supporting_data || item.supportingData || item.pipelineData || [];
      if (item.data?.response?.analysis_result?.supporting_data) {
        return sum + item.data.response.analysis_result.supporting_data.length;
      }
      return sum + supportingData.length;
    }, 0),
    chartTypes: new Set(allItems.map(item => item.type)).size,
    lastUpdated: allItems.length > 0 ? 
      Math.max(...allItems.map(item => new Date(item.timestamp).getTime())) : null
  };

  const handleDeleteVisualization = (id) => {
    setSavedVisualizations(prev => prev.filter(item => item.id !== id));
    setSavedAnalyses(prev => prev.filter(item => item.id !== id));
    setWidgetOrder(prev => prev.filter(wId => wId !== id));
  };

  const handleEditTitle = (id, newTitle) => {
    setSavedVisualizations(prev => 
      prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
    setSavedAnalyses(prev => 
      prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
    setEditDialog({ open: false, item: null });
  };

  const handleToggleExpand = (id) => {
    const newExpanded = new Set(expandedWidgets);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedWidgets(newExpanded);
  };

  const handleMoveWidget = (index, direction) => {
    if (direction === 'left' && index > 0) {
      const newOrder = allItems.map(item => item.id); // Get current visual order
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setWidgetOrder(newOrder);
    } else if (direction === 'right' && index < allItems.length - 1) {
      const newOrder = allItems.map(item => item.id);
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setWidgetOrder(newOrder);
    }
  };

  const renderVisualization = (item) => {
    console.log('📊 [DASHBOARD] Rendering item:', {
      id: item.id,
      title: item.title,
      type: item.type,
      hasAnalysis: !!item.analysis,
      hasData: !!item.data,
      hasCharts: !!item.charts,
      hasDataGrid: !!item.dataGrid,
      hasReconciliationData: !!item.reconciliationData,
      supportingDataLength: (item.supporting_data || item.supportingData || item.pipelineData || []).length
    });

    // If this is a new AnalysisWidget item (analysis_widget type)
    if (item.type === 'analysis_widget') {
      console.log('📊 [DASHBOARD] Rendering AnalysisWidget with data:', {
        hasAnalysis: !!item.analysis,
        hasData: !!item.data,
        title: item.title,
        fullItem: item
      });
      
      // Use the saved data or create a compatible data structure
      const analysisData = item.data || {
        response: {
          result: item.analysis?.data || {},
          question: item.title
        },
        result: item.analysis?.data || {}
      };
      
      return (
        <Box key={`analysis-${item.id}`} sx={{ width: '100%' }}>
          <AnalysisWidget
            data={analysisData}
            title={item.title}
            onSave={() => {}} // No save needed in dashboard view
            initialExpandedStates={item.expandedStates} // Restore expanded states
          />
        </Box>
      );
    }

    // Get supporting data from any available property
    const rawSupportingData = item.supporting_data || item.supportingData || item.pipelineData || [];
    
    // Ensure all rows have a unique id for DataGrid
    const supportingData = rawSupportingData.map((row, index) => ({
      id: row.id || row._id || `row-${index}-${Date.now()}`, // Fallback ID
      ...row
    }));
    
    // If we have supporting data, render both visualization and data grid
    if (supportingData && supportingData.length > 0) {
      const analysisResult = {
        question: item.question || item.title,
        analysis_result: {
          supporting_data: supportingData
        }
      };
      
      // If chart type is present, prioritize chart, otherwise show table
      // In a small widget, we might want to toggle, but for now let's show what's saved
      
      return (
        <Box key={`viz-${item.id}`} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Visualization */}
          {item.charts ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <DynamicDataVisualization 
                analysisResult={analysisResult}
                isFromDashboard={true}
                isWidget={true} // Enable clean widget mode
                savedCharts={item.charts}
                savedDataGrid={item.dataGrid}
                savedRMPerformanceData={item.rmPerformanceData}
                savedRMPerformanceOverview={item.rmPerformanceOverview}
                savedRMPerformanceComparisonChart={item.rmPerformanceComparisonChart}
              />
            </Box>
          ) : (
            // If no chart, show the data grid directly
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <DataGridComponent
                rows={supportingData}
                columns={[]} // Auto-generate
                title={null} // Hide title in widget
                height="100%"
                autoGenerateColumns={true}
                showSaveButton={false}
                variant="clean" // Use clean variant for widgets
              />
            </Box>
          )}
        </Box>
      );
    }
    
    // Fallback for items without supporting data
    const analysisResult = {
      question: item.question || item.title,
      analysis_result: {
        supporting_data: supportingData
      }
    };

    return (
      <DynamicDataVisualization 
        key={`viz-${item.id}`}
        analysisResult={analysisResult}
        isFromDashboard={true}
        isWidget={true} // Enable clean widget mode
        savedCharts={item.charts}
        savedDataGrid={item.dataGrid}
        savedRMPerformanceData={item.rmPerformanceData}
        savedRMPerformanceOverview={item.rmPerformanceOverview}
        savedRMPerformanceComparisonChart={item.rmPerformanceComparisonChart}
      />
    );
  };

  const getVisualizationIcon = (type) => {
    switch (type) {
      case 'rmPerformance': return <AssessmentIcon />;
      case 'pipeline': return <TimelineIcon />;
      case 'reconciliation': return <AccountBalanceIcon />;
      case 'bar': return <InsertChartIcon />;
      case 'pie': return <DataUsageIcon />;
      default: return <AnalyticsIcon />;
    }
  };

  const getVisualizationTypeLabel = (type) => {
    switch (type) {
      case 'rmPerformance': return 'RM Performance';
      case 'pipeline': return 'Pipeline Analysis';
      case 'reconciliation': return 'Bank Reconciliation';
      case 'bar': return 'Bar Chart';
      case 'pie': return 'Pie Chart';
      default: return 'Analytics';
    }
  };

  const getAnalysisTypeGradient = (type) => {
    switch (type) {
      case 'rmPerformance': return `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;
      case 'pipeline': return `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`;
      case 'reconciliation': return `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`;
      case 'bar': return `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`;
      case 'pie': return `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`;
      default: return `linear-gradient(90deg, ${theme.palette.text.secondary}, ${theme.palette.text.disabled})`;
    }
  };

  const getAnalysisTypeColor = (type) => {
    switch (type) {
      case 'rmPerformance': return theme.palette.primary.main;
      case 'pipeline': return theme.palette.success.main;  
      case 'reconciliation': return theme.palette.secondary.main;
      case 'bar': return theme.palette.warning.main;
      case 'pie': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getTitle = (item) => {
    // Try to find question in various places
    const candidates = [
      item.question,
      item.data?.response?.question,
      item.data?.question,
      item.analysis?.question,
      item.title
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && 
          candidate !== "Unknown Query" && 
          !candidate.startsWith("Table -") && 
          !candidate.startsWith("Pie Chart -") &&
          !candidate.startsWith("Bar Chart -")) {
        return candidate;
      }
    }
    
    // Fallback to title even if generic if nothing else found
    if (item.title && item.title !== "Unknown Query") return item.title;
    
    return "Data Analysis";
  };

  const renderVisualizationCard = (item, index) => {
    const isExpanded = expandedWidgets.has(item.id);
    
    return (
      <Grid size={{ xs: 12, md: isExpanded ? 12 : 6 }} key={item.id}>
        <Fade in={true} timeout={600 + (index * 100)}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                transform: 'translateY(-4px)',
                borderColor: theme.palette.primary.main,
              },
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'background.paper'
            }}
          >
            {/* Widget Header */}
            <Box sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: alpha(getAnalysisTypeColor(item.type), 0.03)
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ overflow: 'hidden', flex: 1 }}>
                <Avatar sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(getAnalysisTypeColor(item.type), 0.1),
                  color: getAnalysisTypeColor(item.type)
                }}>
                  {React.cloneElement(getVisualizationIcon(item.type), { fontSize: 'small' })}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {getTitle(item)}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {new Date(item.timestamp).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">•</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {new Date(item.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                {/* Move Buttons */}
                <IconButton size="small" onClick={() => handleMoveWidget(index, 'left')} disabled={index === 0}>
                  <ArrowBackIcon fontSize="small" sx={{ fontSize: '1.1rem' }} />
                </IconButton>
                <IconButton size="small" onClick={() => handleMoveWidget(index, 'right')} disabled={index === allItems.length - 1}>
                  <ArrowForwardIcon fontSize="small" sx={{ fontSize: '1.1rem' }} />
                </IconButton>
                
                <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 1, height: 16 }} />

                {/* Expand/Collapse */}
                <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                  <IconButton size="small" onClick={() => handleToggleExpand(item.id)}>
                    {isExpanded ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <IconButton size="small" onClick={() => setFullscreenView({ open: true, item })}>
                  <FullscreenIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setEditDialog({ open: true, item })}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteVisualization(item.id)} sx={{ '&:hover': { color: 'error.main' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            {/* Widget Content */}
            <Box sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              <Box sx={{ 
                flexGrow: 1, 
                position: 'relative',
                '& .recharts-responsive-container': { minHeight: 250 },
                // Scale down content slightly to fit widget only if not expanded
                transform: isExpanded ? 'none' : 'scale(0.95)',
                transformOrigin: 'top center',
                width: '100%',
                height: '100%'
              }}>
                {renderVisualization(item)}
              </Box>
            </Box>
          </Card>
        </Fade>
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Quick Stats Bar - Kept minimal */}
        <Box sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
             <Chip 
              icon={<AnalyticsIcon />} 
              label={`${dashboardStats.totalVisualizations} Analyses`} 
              sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', fontWeight: 600 }} 
            />
            <Chip 
              icon={<DataUsageIcon />} 
              label={`${dashboardStats.totalRecords.toLocaleString()} Records`} 
              sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', fontWeight: 600 }} 
            />
             <Chip 
              icon={<ScheduleIcon />} 
              label={`Updated ${dashboardStats.lastUpdated ? new Date(dashboardStats.lastUpdated).toLocaleDateString() : 'Never'}`} 
              sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', fontWeight: 600 }} 
            />
          </Stack>
        </Box>

        {/* Widgets Grid */}
        {allItems.length === 0 ? (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 4, 
            border: '1px dashed', 
            borderColor: 'divider',
            bgcolor: 'transparent' 
          }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover', color: 'text.secondary', mx: 'auto', mb: 2 }}>
              <DashboardIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Dashboard is Empty
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Generate analysis in the chat and save them to your dashboard to see them appear here as widgets.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {allItems.map((item, index) => renderVisualizationCard(item, index))}
          </Grid>
        )}
      </Container>


      {/* Enhanced Edit Title Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, item: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              width: 40,
              height: 40
            }}>
              <EditIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Edit Visualization Title
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Title"
            defaultValue={editDialog.item?.title || ''}
            variant="outlined"
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEditTitle(editDialog.item?.id, e.target.value);
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setEditDialog({ open: false, item: null })}
            sx={{ 
              borderRadius: 3,
              px: 3,
              color: theme.palette.text.secondary,
              '&:hover': {
                background: alpha(theme.palette.text.secondary, 0.1)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              const input = e.target.closest('.MuiDialog-root').querySelector('input');
              handleEditTitle(editDialog.item?.id, input.value);
            }}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: 3,
              px: 4,
              fontWeight: 600,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={fullscreenView.open} 
        onClose={() => setFullscreenView({ open: false, item: null })}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15)',
            m: 2,
            maxHeight: 'calc(100vh - 32px)'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              width: 48,
              height: 48
            }}>
              <FullscreenIcon sx={{ fontSize: 24 }} />
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: '#0f172a',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {fullscreenView.item?.title || fullscreenView.item?.question}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Full Screen Analysis View
              </Typography>
            </Box>
          </Stack>
          
          <IconButton
            onClick={() => setFullscreenView({ open: false, item: null })}
            sx={{ 
              position: 'absolute', 
              right: 16, 
              top: 16,
              background: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              '&:hover': {
                background: alpha(theme.palette.error.main, 0.2),
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 4 }}>
            {fullscreenView.item && renderVisualization(fullscreenView.item)}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
