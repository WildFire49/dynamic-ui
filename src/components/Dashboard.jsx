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
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import DynamicDataVisualization from './mui/DynamicDataVisualization';
import DataGridComponent from './charts/DataGridComponent';
import AnalysisWidget from './widgets/AnalysisWidget';

const Dashboard = () => {
  const theme = useTheme();
  const [savedVisualizations, setSavedVisualizations] = useState([]);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, item: null });
  const [fullscreenView, setFullscreenView] = useState({ open: false, item: null });
  const [hoveredCard, setHoveredCard] = useState(null);

  // Load saved visualizations and analyses from localStorage on mount
  useEffect(() => {
    // Load old visualizations
    const saved = localStorage.getItem('dashboardVisualizations');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        console.log('📊 [DASHBOARD] Loaded visualizations:', parsedData.length);
        setSavedVisualizations(parsedData);
      } catch (error) {
        console.error('Error loading saved visualizations:', error);
        setSavedVisualizations([]);
      }
    }
    
    // Load new analyses
    const savedAnalysesData = localStorage.getItem('savedAnalyses');
    if (savedAnalysesData) {
      try {
        const parsedAnalyses = JSON.parse(savedAnalysesData);
        console.log('📊 [DASHBOARD] Loaded analyses:', parsedAnalyses.length);
        setSavedAnalyses(parsedAnalyses);
      } catch (error) {
        console.error('Error loading saved analyses:', error);
        setSavedAnalyses([]);
      }
    }
  }, []);

  // Save visualizations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardVisualizations', JSON.stringify(savedVisualizations));
  }, [savedVisualizations]);
  
  // Save analyses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);

  // Calculate dashboard statistics - sort by latest timestamp (newest first)
  const allItems = [...savedVisualizations, ...savedAnalyses].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA; // Descending order (newest first)
  });
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
          />
        </Box>
      );
    }

    // Get supporting data from any available property
    const supportingData = item.supporting_data || item.supportingData || item.pipelineData || [];
    
    // If we have supporting data, render both visualization and data grid
    if (supportingData && supportingData.length > 0) {
      const analysisResult = {
        question: item.question || item.title,
        analysis_result: {
          supporting_data: supportingData
        }
      };
      
      return (
        <Box key={`viz-${item.id}`} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Original visualization component */}
          <DynamicDataVisualization 
            analysisResult={analysisResult}
            isFromDashboard={true}
            savedCharts={item.charts}
            savedDataGrid={item.dataGrid}
            savedRMPerformanceData={item.rmPerformanceData}
            savedRMPerformanceOverview={item.rmPerformanceOverview}
            savedRMPerformanceComparisonChart={item.rmPerformanceComparisonChart}
          />
          
          {/* Enhanced DataGrid with dynamic columns and CSV export */}
          <DataGridComponent
            data={supportingData}
            title={`${item.question || item.title} - Detailed Data`}
            height={400}
            autoGenerateColumns={true}
            showSaveButton={false}
          />
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
      case 'rmPerformance': return 'linear-gradient(90deg, #3b82f6, #2563eb)';
      case 'pipeline': return 'linear-gradient(90deg, #10b981, #059669)';
      case 'reconciliation': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'bar': return 'linear-gradient(90deg, #f59e0b, #d97706)';
      case 'pie': return 'linear-gradient(90deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(90deg, #6b7280, #4b5563)';
    }
  };

  const getAnalysisTypeColor = (type) => {
    switch (type) {
      case 'rmPerformance': return '#37527e';
      case 'pipeline': return '#f1641f';  
      case 'reconciliation': return '#667eea';
      case 'bar': return '#37527e';
      case 'pie': return '#f1641f';
      default: return '#6b7280';
    }
  };

  const renderVisualizationCard = (item, index) => (
    <Fade in={true} timeout={600 + (index * 200)} key={item.id}>
      <Box sx={{ 
        mb: 8,
        width: '100%',
        position: 'relative'
      }}>
        {/* Clear Divider Line */}
        {index > 0 && (
          <Box sx={{
            width: '100%',
            height: '1px',
            background: '#cbd5e1',
            my: 4
          }} />
        )}

        {/* Simple Analysis Header */}
        <Box sx={{
          background: '#ffffff',
          borderLeft: `4px solid ${getAnalysisTypeColor(item.type)}`,
          py: 3,
          px: 4,
          width: '100%',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3}>
            <Stack direction="row" alignItems="center" spacing={3} flex={1}>
              <Avatar sx={{
                background: getAnalysisTypeColor(item.type),
                width: 40,
                height: 40,
                '& svg': { fontSize: 20, color: '#ffffff' }
              }}>
                {getVisualizationIcon(item.type)}
              </Avatar>
              
              <Box flex={1}>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#1f2937',
                  mb: 0.5
                }}>
                  Analysis {index + 1}
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#4b5563',
                  mb: 1
                }}>
                  {item.question || item.title}
                </Typography>
                
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Chip
                    label={getVisualizationTypeLabel(item.type)}
                    size="small"
                    sx={{
                      background: alpha(getAnalysisTypeColor(item.type), 0.1),
                      color: getAnalysisTypeColor(item.type),
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24,
                      borderRadius: 0
                    }}
                  />
                  
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    fontWeight: 500
                  }}>
                    {new Date(item.timestamp).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • {((item.supporting_data || item.supportingData || item.pipelineData || []).length).toLocaleString()} records
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Simple Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit" placement="top">
                <IconButton 
                  onClick={() => setEditDialog({ open: true, item })}
                  sx={{ 
                    width: 36,
                    height: 36,
                    color: '#6b7280',
                    '&:hover': { 
                      color: '#3b82f6',
                      background: alpha('#3b82f6', 0.1)
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen" placement="top">
                <IconButton 
                  onClick={() => setFullscreenView({ open: true, item })}
                  sx={{ 
                    width: 36,
                    height: 36,
                    color: '#6b7280',
                    '&:hover': { 
                      color: '#10b981',
                      background: alpha('#10b981', 0.1)
                    }
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete" placement="top">
                <IconButton 
                  onClick={() => handleDeleteVisualization(item.id)}
                  sx={{ 
                    width: 36,
                    height: 36,
                    color: '#6b7280',
                    '&:hover': { 
                      color: '#ef4444',
                      background: alpha('#ef4444', 0.1)
                    }
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Full Width Visualization Content */}
        <Box sx={{ 
          width: '100%',
          minHeight: '70vh',
          background: '#ffffff',
          borderBottom: '4px solid #f1f5f9'
        }}>
          {renderVisualization(item)}
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        {/* Elegant Header Section */}
        <Box sx={{ 
          pt: { xs: 6, md: 8 }, 
          pb: { xs: 4, md: 6 }, 
          px: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(55, 82, 126, 0.02) 0%, rgba(55, 82, 126, 0.05) 50%, rgba(55, 82, 126, 0.02) 100%)`,
            zIndex: 1,
            pointerEvents: 'none'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)',
            borderRadius: '2px',
            zIndex: 2
          }
        }}>
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 6, position: 'relative', zIndex: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 4,
                  background: 'linear-gradient(135deg, #37527e 0%, #f1641f 100%)',
                  color: '#ffffff',
                  border: '3px solid #ffffff',
                  boxShadow: '0 8px 32px rgba(55, 82, 126, 0.3), 0 0 0 1px rgba(241, 100, 31, 0.2)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-6px',
                    left: '-6px',
                    right: '-6px',
                    bottom: '-6px',
                    background: 'linear-gradient(135deg, #f1641f, #37527e)',
                    borderRadius: '50%',
                    zIndex: -1,
                    opacity: 0.1
                  }
                }}>
                  <DashboardIcon sx={{ fontSize: 40 }} />
                </Avatar>
                {/* Floating accent elements */}
                <Box sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '12px',
                  height: '12px',
                  background: '#f1641f',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(241, 100, 31, 0.4)'
                }} />
                <Box sx={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '5px',
                  width: '8px',
                  height: '8px',
                  background: '#37527e',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(55, 82, 126, 0.4)'
                }} />
              </Box>
              
              <Typography variant="h1" sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '3.25rem' },
                background: 'linear-gradient(135deg, #37527e 0%, #f1641f 50%, #37527e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                letterSpacing: '-0.03em',
                position: 'relative',
                textShadow: '0 1px 3px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #37527e, #f1641f, #37527e)',
                  borderRadius: '2px',
                  opacity: 0.8
                }
              }}>
                Analytics Dashboard
              </Typography>
              
              <Typography variant="h6" sx={{ 
                color: '#64748b',
                fontWeight: 600,
                fontSize: '1.2rem',
                maxWidth: 520,
                mx: 'auto',
                lineHeight: 1.5,
                mt: 4,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '6px',
                  height: '6px',
                  background: '#f1641f',
                  borderRadius: '50%'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '6px',
                  height: '6px',
                  background: '#37527e',
                  borderRadius: '50%'
                }
              }}>
                Your Personalised Insights Saved
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Full Width Analysis Section */}
      <Box sx={{ 
        background: '#ffffff',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        minHeight: '80vh'
      }}>
        {/* Quick Stats Section */}
        <Box sx={{ 
          px: 4,
          py: 4,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            color: '#0f172a',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AnalyticsIcon sx={{ color: theme.palette.primary.main }} />
            Dashboard Overview
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {dashboardStats.totalVisualizations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Analyses
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {dashboardStats.totalRecords.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Records Analyzed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  {dashboardStats.chartTypes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chart Types
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {dashboardStats.lastUpdated ? new Date(dashboardStats.lastUpdated).toLocaleDateString() : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Visualizations */}
        {allItems.length === 0 ? (
          <Fade in={true} timeout={1200}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              background: '#ffffff',
              border: 'none'
            }}>
              <Avatar sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 4,
                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                color: theme.palette.primary.main
              }}>
                <AnalyticsIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#0f172a',
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Ready for Insights
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.6
              }}>
                Use the main chat to perform analysis, create visualizations, and save them here to build your command center.
              </Typography>
              
              <Button 
                variant="contained" 
                size="large"
                startIcon={<TrendingUpIcon />}
                sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 0,
                  textTransform: 'none',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Analysis
              </Button>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ 
              px: 4,
              py: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <BookmarkIcon sx={{ color: theme.palette.primary.main }} />
                Saved Analysis ({allItems.length})
              </Typography>
              
              <Chip 
                icon={<StarIcon />}
                label={`Last updated ${dashboardStats.lastUpdated ? new Date(dashboardStats.lastUpdated).toLocaleDateString() : 'Never'}`}
                sx={{ 
                  background: `linear-gradient(45deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  color: theme.palette.warning.main,
                  fontWeight: 600,
                  borderRadius: 0
                }}
              />
            </Box>
            
            {allItems.map((item, index) => (
              <React.Fragment key={`analysis-card-${item.id}-${index}`}>
                {renderVisualizationCard(item, index)}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>

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

      {/* Enhanced Fullscreen View Dialog */}
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
