"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  LinearProgress,
  Container,
  Fab,
  Zoom,
  Slide,
  Fade,
  Grow,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Gavel as RuleIcon,
  CalendarToday as ScheduleIcon,
  SupervisorAccount as SupervisoryIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as UploadIcon,
  Storage as BrainIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
  Rocket as RocketIcon,
  AutoAwesome as SparkleIcon,
  Psychology as PsychologyIcon,
  PictureAsPdf as PdfIcon,
  PictureAsPdf,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { embeddingsApi } from '@/lib/api/embeddingsApi';

const AGENT_TYPES = [
  {
    id: 'rule_agent',
    title: 'Rule Engine',
    description: 'Intelligent business logic automation',
    subtitle: 'Smart Decision Making',
    icon: RuleIcon,
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
    stats: '50+ Rules'
  },
  {
    id: 'scheduler',
    title: 'Smart Scheduler',
    description: 'Automated task orchestration',
    subtitle: 'Time Intelligence',
    icon: ScheduleIcon,
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
    stats: '24/7 Active'
  },
  {
    id: 'supervisory',
    title: 'AI Supervisor',
    description: 'Automated Decision Making',
    subtitle: 'Continuous Oversight',
    icon: SupervisoryIcon,
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
    stats: '99.9% Uptime'
  },
  {
    id: 'analysis_agent',
    title: 'Analytics Engine',
    description: 'Deep insights & Predictions',
    subtitle: 'Data Intelligence',
    icon: AnalyticsIcon,
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    stats: 'Real-time'
  }
];

const FloatingParticle = ({ delay = 0, size = 4, color = '#2196F3' }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(45deg, ${color}, ${alpha(color, 0.6)})`,
        animation: `floatUp 8s infinite ease-in-out ${delay}s`,
        '@keyframes floatUp': {
          '0%': {
            transform: 'translateY(100vh) translateX(0px)',
            opacity: 0
          },
          '10%': {
            opacity: 1
          },
          '90%': {
            opacity: 1
          },
          '100%': {
            transform: 'translateY(-100px) translateX(50px)',
            opacity: 0
          }
        }
      }}
    />
  );
};

const AnimatedCounter = ({ value, duration = 3000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const end = parseInt(value) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    
    const incrementTime = Math.max(duration / end, 50); // Minimum 50ms per step
    let currentCount = 0;
    
    const timer = setInterval(() => {
      currentCount += 1;
      setCount(currentCount);
      if (currentCount >= end) {
        clearInterval(timer);
        setCount(end); // Ensure exact end value
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count}</span>;
};

// CSS-in-JS keyframes for animations
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function ConfiguratorPage() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [brainDialog, setBrainDialog] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState('select'); // select, preview, processing, success
  const [previewFile, setPreviewFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load collections on component mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await embeddingsApi.listCollections();
      setCollections(response.collections || []);
    } catch (error) {
      console.error('Error loading collections:', error);
      setSnackbar({
        open: true,
        message: `Failed to load collections: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    if (files.length > 0) {
      setUploadStep('preview');
      if (files[0].type === 'application/pdf') {
        setPreviewFile(files[0]);
      }
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);
    
    // If no files left, go back to select step
    if (updatedFiles.length === 0) {
      setUploadStep('select');
      setPreviewFile(null);
    } else if (previewFile && indexToRemove === 0 && updatedFiles.length > 0) {
      // If we removed the preview file, set a new one if available
      const nextPdfFile = updatedFiles.find(file => file.type === 'application/pdf');
      if (nextPdfFile) {
        setPreviewFile(nextPdfFile);
      } else {
        setPreviewFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    if (files.length > 0) {
      setUploadStep('preview');
      if (files[0].type === 'application/pdf') {
        setPreviewFile(files[0]);
      }
    }
  };

  const resetUpload = () => {
    setUploadStep('select');
    setSelectedFiles([]);
    setPreviewFile(null);
    setUploadProgress(0);
    setDragActive(false);
  };

  const handlePreviewInNewTab = (file) => {
    if (file && file.type === 'application/pdf') {
      // Create a blob URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      // Open in new tab
      const newTab = window.open(fileUrl, '_blank');
      
      // Clean up the URL after a delay to prevent memory leaks
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);
      
      // Focus the new tab if it opened successfully
      if (newTab) {
        newTab.focus();
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles.length || !selectedAgent) {
      setSnackbar({
        open: true,
        message: 'Please select files to upload',
        severity: 'warning'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadStep('processing');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      
      const response = await embeddingsApi.embedFiles(
        selectedFiles,
        selectedAgent.id,
        'chromadb',
        1000,
        200
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadStep('success');
        setSnackbar({
          open: true,
          message: `Successfully embedded ${response.files_processed} files into ${response.chunks_created} chunks`,
          severity: 'success'
        });
      }, 1000);

      // Refresh collections list
      await loadCollections();
      
      // Auto close after success
      setTimeout(() => {
        setUploadDialogOpen(false);
        resetUpload();
        setSelectedAgent(null);
      }, 3000);

    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStep('preview');
      setSnackbar({
        open: true,
        message: `Upload failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCollection = async (collectionName) => {
    try {
      await embeddingsApi.deleteCollection(collectionName);
      setSnackbar({
        open: true,
        message: `Collection '${collectionName}' deleted successfully`,
        severity: 'success'
      });
      await loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete collection: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const getAgentTypeColor = (collectionName) => {
    if (collectionName.includes('rule')) return '#2196F3';
    if (collectionName.includes('scheduler')) return '#FF9800';
    if (collectionName.includes('supervisor')) return '#4CAF50';
    if (collectionName.includes('analysis') || collectionName.includes('credit')) return '#9C27B0';
    return '#757575';
  };

  const formatCollectionName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha('#2196F3', 0.05)} 0%, 
          ${alpha('#9C27B0', 0.05)} 25%,
          ${alpha('#4CAF50', 0.03)} 50%,
          ${alpha('#FF9800', 0.05)} 75%,
          ${alpha('#2196F3', 0.05)} 100%
        )`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, 
            ${alpha('#2196F3', 0.03)} 0%,
            ${alpha('#9C27B0', 0.02)} 25%,
            ${alpha('#4CAF50', 0.015)} 50%,
            ${alpha('#FF9800', 0.02)} 75%,
            ${alpha('#2196F3', 0.03)} 100%
          )`,
          animation: 'breathe 8s ease-in-out infinite',
          zIndex: 0
        },
        '@keyframes breathe': {
          '0%': {
            transform: 'scale(1)',
            opacity: 0.3
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: 0.6
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 0.3
          }
        }
      }}
    >
      {/* Floating Background Particles */}
      {mounted && [...Array(12)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.5}
          size={3 + (i % 4) + 1}
          color={AGENT_TYPES[i % AGENT_TYPES.length].color}
        />
      ))}
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ pt: 8, pb: 6, textAlign: 'center' }}>
          <Fade in={mounted} timeout={1000}>
            <Box>
              <Box sx={{ mb: 3, position: 'relative' }}>
                <Zoom in={mounted} timeout={1500}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #9C27B0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 4,
                      boxShadow: `0 20px 40px ${alpha('#2196F3', 0.3)}`,
                      animation: 'pulse 3s infinite ease-in-out',
                      '@keyframes pulse': {
                        '0%': {
                          transform: 'scale(1)',
                          boxShadow: `0 20px 40px ${alpha('#2196F3', 0.3)}`
                        },
                        '50%': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 25px 50px ${alpha('#2196F3', 0.4)}`
                        },
                        '100%': {
                          transform: 'scale(1)',
                          boxShadow: `0 20px 40px ${alpha('#2196F3', 0.3)}`
                        }
                      }
                    }}
                  >
                    <PsychologyIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                </Zoom>
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #9C27B0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                MiFiX.AI
              </Typography>
              
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontWeight: 300,
                  mb: 3,
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  opacity: 0.8
                }}
              >
                Intelligent Agent Orchestration
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Transform your business with AI-powered agents that think, learn, and adapt.
                Experience the future of intelligent automation.
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                sx={{ mb: 6 }}
              >
                <Slide in={mounted} direction="up" timeout={800}>
                  <Tooltip title="Explore AI Brain Collections" arrow>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<BrainIcon />}
                      onClick={() => setBrainDialog(true)}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                        boxShadow: `0 8px 25px ${alpha('#2196F3', 0.4)}`,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 35px ${alpha('#2196F3', 0.5)}`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Explore AI Brain
                    </Button>
                  </Tooltip>
                </Slide>
                
                <Slide in={mounted} direction="up" timeout={1000}>
                  <Tooltip title="Refresh Knowledge Collections" arrow>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<SpeedIcon />}
                      onClick={loadCollections}
                      disabled={loading}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        borderWidth: 2,
                        borderColor: '#2196F3',
                        color: '#2196F3',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: '#1976D2',
                          background: alpha('#2196F3', 0.05),
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Syncing...' : 'Refresh Collections'}
                    </Button>
                  </Tooltip>
                </Slide>
              </Stack>
              
              {/* Stats Row */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Grid container spacing={4} sx={{ maxWidth: 800 }}>
                {[
                  { label: 'AI Agents', value: '4', icon: RocketIcon },
                  { label: 'Collections', value: collections.length.toString(), icon: BrainIcon },
                  { label: 'Uptime', value: '99.9', suffix: '%', icon: SpeedIcon }
                ].map((stat, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Grow in={mounted} timeout={1500 + index * 200}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          background: alpha('#ffffff', 0.8),
                          backdropFilter: 'blur(10px)',
                          borderRadius: 3,
                          border: `1px solid ${alpha('#2196F3', 0.1)}`
                        }}
                      >
                        <stat.icon sx={{ fontSize: 32, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
                          <AnimatedCounter value={stat.value} />{stat.suffix || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Paper>
                    </Grow>
                  </Grid>
                ))}
                </Grid>
              </Box>
            </Box>
          </Fade>
        </Box>

        {/* Agent Cards Section */}
        <Box sx={{ py: 6 }}>
          <Fade in={mounted} timeout={1200}>
            <Typography 
              variant="h4" 
              component="h3" 
              sx={{ 
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              Choose Your AI Agent
            </Typography>
          </Fade>
          
          <Grid container spacing={4}>
            {AGENT_TYPES.map((agent, index) => {
              const IconComponent = agent.icon;
              const isHovered = hoveredCard === agent.id;
              
              return (
                <Grid item xs={12} sm={6} lg={3} key={agent.id}>
                  <Grow in={mounted} timeout={1000 + index * 200}>
                    <Card 
                      onMouseEnter={() => setHoveredCard(agent.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      sx={{ 
                        height: 320,
                        background: alpha('#ffffff', 0.9),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        border: `2px solid ${alpha(agent.color, 0.1)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: `0 25px 50px ${alpha(agent.color, 0.25)}`,
                          border: `2px solid ${agent.color}`,
                          '&::before': {
                            opacity: 1
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: agent.gradient,
                          opacity: 0.7,
                          transition: 'opacity 0.3s ease'
                        }
                      }}
                    >
                      <CardActionArea 
                        onClick={() => handleAgentSelect(agent)}
                        sx={{ height: '100%', p: 0 }}
                      >
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          {/* Icon Container */}
                          <Box 
                            sx={{ 
                              mb: 2,
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: agent.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                                boxShadow: `0 8px 25px ${alpha(agent.color, 0.3)}`
                              }}
                            >
                              <IconComponent 
                                sx={{ 
                                  fontSize: 40, 
                                  color: 'white'
                                }} 
                              />
                            </Box>
                          </Box>
                          
                          {/* Content */}
                          <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              sx={{ 
                                mb: 1,
                                fontWeight: 700,
                                color: 'text.primary'
                              }}
                            >
                              {agent.title}
                            </Typography>
                            
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: agent.color,
                                fontWeight: 600,
                                display: 'block',
                                mb: 2,
                                textTransform: 'uppercase',
                                letterSpacing: 1
                              }}
                            >
                              {agent.subtitle}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                mb: 3,
                                lineHeight: 1.6
                              }}
                            >
                              {agent.description}
                            </Typography>
                          </Box>
                          
                          {/* Stats Badge */}
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Chip
                              label={agent.stats}
                              size="small"
                              sx={{
                                background: alpha(agent.color, 0.1),
                                color: agent.color,
                                fontWeight: 600,
                                border: `1px solid ${alpha(agent.color, 0.2)}`
                              }}
                            />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => {
          setUploadDialogOpen(false);
          setUploadStep('select');
          setUploadedFiles([]);
          setUploadProgress(0);
          setDragActive(false);
        }}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'visible'
          }
        }}
        sx={{ 
          '& .MuiDialog-container': { 
            overflow: 'visible' 
          },
          '& .MuiDialog-paper': { 
            overflow: 'visible' 
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: selectedAgent?.gradient || 'transparent',
            color: 'white',
            py: 3,
            borderRadius: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedAgent && React.createElement(selectedAgent.icon, { 
              sx: { mr: 2, fontSize: 32, color: 'white' } 
            })}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                {selectedAgent?.title}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: alpha('#ffffff', 0.8), textTransform: 'uppercase', letterSpacing: 1 }}>
                Document Upload
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setUploadDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, minHeight: 600, overflow: 'visible' }}>
          {uploadStep === 'select' && (
            <Fade in timeout={400}>
              <Box sx={{ p: 6, background: 'linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%)', position: 'relative' }}>
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(selectedAgent?.color || '#2196F3', 0.03)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(selectedAgent?.color || '#2196F3', 0.03)} 0%, transparent 50%), radial-gradient(circle at 40% 80%, ${alpha(selectedAgent?.color || '#2196F3', 0.02)} 0%, transparent 50%)`,
                    zIndex: 0
                  }}
                />
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    textAlign: 'center', 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Enhance {selectedAgent?.title} Knowledge Base
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 6, textAlign: 'center', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}
                >
                  Upload your documents to expand the AI&apos;s understanding and capabilities
                </Typography>
                
                {/* Main Upload Container */}
                <Box sx={{ position: 'relative', overflow: 'visible', zIndex: 1 }}>
                  {/* Floating Helper Icons */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -30,
                      left: 50,
                      zIndex: 2,
                      opacity: dragActive ? 1 : 0.7,
                      transform: dragActive ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(-5deg)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <svg width="78" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" fill={alpha(selectedAgent?.color || '#2196F3', 0.1)} stroke={selectedAgent?.color || '#2196F3'} strokeWidth="2" strokeDasharray="4 4"/>
                      <path d="M16 24l6 6 10-12" stroke={selectedAgent?.color || '#2196F3'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -25,
                      right: 60,
                      zIndex: 2,
                      opacity: dragActive ? 1 : 0.6,
                      transform: dragActive ? 'scale(1.2) rotate(-15deg)' : 'scale(1) rotate(8deg)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="8" y="12" width="24" height="20" rx="3" fill={alpha('#FF9800', 0.15)} stroke="#FF9800" strokeWidth="2"/>
                      <path d="M12 8h16v4H12z" fill="#FF9800" opacity="0.8"/>
                      <circle cx="16" cy="20" r="2" fill="#FF9800"/>
                      <path d="M20 24l4-4 8 8v4H12v-4l4-4z" fill={alpha('#FF9800', 0.3)}/>
                    </svg>
                  </Box>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -35,
                      left: 40,
                      zIndex: 2,
                      opacity: dragActive ? 1 : 0.5,
                      transform: dragActive ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(-10deg)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M6 6h24v24H6z" fill={alpha('#9C27B0', 0.1)} stroke="#9C27B0" strokeWidth="2" rx="4"/>
                      <path d="M12 16h12M12 20h8M12 24h10" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </Box>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      right: 45,
                      zIndex: 2,
                      opacity: dragActive ? 1 : 0.6,
                      transform: dragActive ? 'scale(1.15) rotate(-8deg)' : 'scale(1) rotate(12deg)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <circle cx="21" cy="21" r="18" fill={alpha('#4CAF50', 0.12)} stroke="#4CAF50" strokeWidth="2"/>
                      <path d="M14 21l6 6 12-12" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>

                  {/* Premium Upload Container */}
                  <Paper
                    elevation={0}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                      p: 8,
                      borderRadius: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      background: dragActive 
                        ? `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#ffffff', 0.8)})`
                        : `linear-gradient(135deg, #ffffff, ${alpha('#ffffff', 0.9)})`,
                      border: dragActive 
                        ? `3px solid ${selectedAgent?.color}` 
                        : `2px dashed ${alpha(selectedAgent?.color || '#ccc', 0.3)}`,
                      boxShadow: dragActive 
                        ? `0 25px 50px ${alpha(selectedAgent?.color || '#ccc', 0.15)}, 0 0 0 1px ${alpha('#fff', 0.1)} inset`
                        : `0 8px 32px ${alpha('#000', 0.04)}, 0 0 0 1px ${alpha('#fff', 0.05)} inset`,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: dragActive ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.01)',
                        boxShadow: `0 32px 64px ${alpha(selectedAgent?.color || '#000', 0.12)}, 0 0 0 1px ${alpha(selectedAgent?.color || '#fff', 0.1)} inset`,
                        border: `2px dashed ${selectedAgent?.color}`,
                        '& .upload-icon': {
                          transform: 'scale(1.15) rotate(5deg)'
                        },
                        '& .upload-text': {
                          color: selectedAgent?.color
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at center, ${alpha(selectedAgent?.color || '#2196F3', 0.03)}, transparent 70%)`,
                        opacity: dragActive ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        borderRadius: '24px'
                      }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.xlsx,.xls,.docx,.doc,.txt"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    
                    {/* Centered Upload Content */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      {/* Premium Upload Icon */}
                      <Box
                        className="upload-icon"
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: selectedAgent?.gradient || 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 4,
                          boxShadow: `0 16px 32px ${alpha(selectedAgent?.color || '#2196F3', 0.25)}, 0 0 0 4px ${alpha('#fff', 0.8)} inset`,
                          transform: dragActive ? 'scale(1.1) rotate(10deg)' : 'scale(1)',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: -4,
                            borderRadius: '50%',
                            background: `conic-gradient(from 0deg, transparent, ${selectedAgent?.color || '#2196F3'}, transparent)`,
                            animation: dragActive ? 'spin 2s linear infinite' : 'none',
                            zIndex: -1
                          }
                        }}
                      >
                        <UploadIcon 
                          sx={{ 
                            fontSize: 48, 
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                          }} 
                        />
                      </Box>
                      
                      <Typography 
                        className="upload-text"
                        variant="h5" 
                        sx={{ 
                          mb: 2, 
                          color: 'text.primary', 
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {dragActive ? 'Drop files here!' : 'Drop files here or click to browse'}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 4, 
                          fontSize: '1rem',
                          fontWeight: 500
                        }}
                      >
                        PDF, Excel, Word documents, or text files
                      </Typography>
                      
                      {/* Elegant File Type Chips */}
                      <Stack 
                        direction="row" 
                        spacing={1.5} 
                        justifyContent="center" 
                        sx={{ 
                          mt: 2,
                          transform: dragActive ? 'translateY(-4px)' : 'translateY(0)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        {[
                          { name: 'PDF', color: '#FF5722', icon: '📄' },
                          { name: 'Excel', color: '#4CAF50', icon: '📊' },
                          { name: 'Word', color: '#2196F3', icon: '📝' },
                          { name: 'Text', color: '#9C27B0', icon: '📋' }
                        ].map((type, index) => (
                          <Chip
                            key={type.name}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontSize: '14px' }}>{type.icon}</span>
                                <span>{type.name}</span>
                              </Box>
                            }
                            size="medium"
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(type.color, 0.08)}, ${alpha(type.color, 0.12)})`,
                              color: type.color,
                              border: `1px solid ${alpha(type.color, 0.2)}`,
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              px: 1,
                              py: 0.5,
                              transition: 'all 0.3s ease',
                              backdropFilter: 'blur(8px)',
                              '&:hover': {
                                background: `linear-gradient(135deg, ${alpha(type.color, 0.15)}, ${alpha(type.color, 0.2)})`,
                                transform: 'translateY(-2px) scale(1.05)',
                                boxShadow: `0 8px 20px ${alpha(type.color, 0.25)}`
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Fade>
          )}

          {uploadStep === 'preview' && (
            <Slide in direction="left" timeout={400}>
              <Box sx={{ p: 6, background: 'linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%)' }}>
                <Typography variant="h6" sx={{ mb: 4, color: 'text.primary', fontWeight: 700, textAlign: 'center' }}>
                  Review Selected Files
                </Typography>
                
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
                    Selected Files ({selectedFiles.length})
                  </Typography>
                    
                    <Stack spacing={3} sx={{ mb: 4 }}>
                      {selectedFiles.map((file, index) => (
                        <Box key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              borderRadius: 4,
                              overflow: 'hidden',
                              border: `2px solid ${alpha(selectedAgent?.color || '#ccc', 0.1)}`,
                              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-4px) scale(1.02)',
                                boxShadow: `0 20px 40px ${alpha(selectedAgent?.color || '#000', 0.12)}`,
                                border: `2px solid ${alpha(selectedAgent?.color || '#ccc', 0.3)}`
                              }
                            }}
                          >
                            {/* File Header */}
                            <Box sx={{ p: 3, pb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    background: file.type === 'application/pdf' 
                                      ? 'linear-gradient(135deg,rgb(56, 86, 142) 0%,rgb(80, 176, 255) 100%)'
                                      : selectedAgent?.gradient || 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 20px ${alpha(file.type === 'application/pdf' ? '#2196F3' : selectedAgent?.color || '#2196F3', 0.3)}`
                                  }}
                                >
                                  {file.type === 'application/pdf' ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                    </svg>
                                  ) : (
                                    <DocumentIcon sx={{ color: 'white', fontSize: 24 }} />
                                  )}
                                </Box>
                                
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      mb: 0.5,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {file.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                </Box>
                                
                                {/* Delete Button */}
                                <Tooltip title="Remove file" arrow>
                                  <IconButton 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFile(index);
                                    }}
                                    size="small"
                                    sx={{
                                      color: '#f44336',
                                      background: alpha('#f44336', 0.1),
                                      ml: 1,
                                      '&:hover': {
                                        background: alpha('#f44336', 0.2),
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              
                              {file.type === 'application/pdf' && (
                                <Chip
                                  label="📄 PDF Document"
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, rgba(82, 128, 226, 0.1), rgba(255, 87, 34, 0.15))',
                                    color: '#2196F3',
                                    fontWeight: 600,
                                    border: '1px solid rgba(34, 82, 255, 0.2)'
                                  }}
                                />
                              )}
                            </Box>
                            
                            {/* File Actions */}
                            {file.type === 'application/pdf' && (
                              <Box sx={{ mx: 3, mb: 3 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handlePreviewInNewTab(file)}
                                  fullWidth
                                  sx={{
                                    py: 1.2,
                                    borderColor: 'rgba(82, 170, 228, 0.3)',
                                    color: '#2196F3',
                                    background: 'linear-gradient(135deg, rgba(34, 78, 255, 0.05), rgba(255, 87, 34, 0.02))',
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    '&:hover': {
                                      borderColor: '#2196F3',
                                      background: 'linear-gradient(135deg, rgba(48, 76, 133, 0.1), rgba(255, 87, 34, 0.05))',
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 12px rgba(62, 130, 232, 0.2)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  Preview PDF
                                </Button>
                              </Box>
                            )}
                          </Paper>
                        </Box>
                      ))}
                    </Stack>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={resetUpload}
                        startIcon={<UploadIcon />}
                        sx={{ 
                          borderColor: alpha(selectedAgent?.color || '#ccc', 0.5),
                          color: selectedAgent?.color || '#2196F3',
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: selectedAgent?.color || '#2196F3',
                            background: alpha(selectedAgent?.color || '#2196F3', 0.05),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 20px ${alpha(selectedAgent?.color || '#2196F3', 0.15)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📎 Add More Files
                      </Button>
                    </Box>
                </Box>
              </Box>
            </Slide>
          )}

          {uploadStep === 'processing' && (
            <Fade in timeout={300}>
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: selectedAgent?.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    animation: 'pulse 2s infinite ease-in-out'
                  }}
                >
                  <BrainIcon sx={{ fontSize: 48, color: 'white' }} />
                </Box>
                
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Processing Documents
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  AI is analyzing and embedding your documents into the knowledge base...
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <LinearProgress 
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ 
                      borderRadius: 3,
                      height: 12,
                      background: alpha(selectedAgent?.color || '#ccc', 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: selectedAgent?.gradient,
                        borderRadius: 3
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {Math.round(uploadProgress)}% Complete
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1} justifyContent="center">
                  {['Analyzing', 'Chunking', 'Embedding', 'Indexing'].map((step, index) => (
                    <Chip
                      key={step}
                      label={step}
                      size="small"
                      color={uploadProgress > index * 25 ? 'primary' : 'default'}
                      sx={{
                        background: uploadProgress > index * 25 ? selectedAgent?.color : 'transparent',
                        color: uploadProgress > index * 25 ? 'white' : 'text.secondary'
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Fade>
          )}

          {uploadStep === 'success' && (
            <Zoom in timeout={500}>
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    animation: 'successPulse 1s ease-in-out',
                    '@keyframes successPulse': {
                      '0%': { transform: 'scale(0.8)', opacity: 0 },
                      '50%': { transform: 'scale(1.1)', opacity: 1 },
                      '100%': { transform: 'scale(1)', opacity: 1 }
                    }
                  }}
                >
                  <SparkleIcon sx={{ fontSize: 48, color: 'white' }} />
                </Box>
                
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#4CAF50' }}>
                  Success!
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Documents Successfully Embedded
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Your documents have been processed and added to the {selectedAgent?.title} knowledge base.
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    resetUpload();
                    setSelectedAgent(null);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    px: 4
                  }}
                >
                  Continue
                </Button>
              </Box>
            </Zoom>
          )}
        </DialogContent>
        
        {(uploadStep === 'preview') && (
          <DialogActions sx={{ p: 3, pt: 0, background: alpha('#f5f5f5', 0.5), justifyContent: 'space-between' }}>
            <Button 
              onClick={() => setUploadDialogOpen(false)}
              size="large"
              variant="contained"
              sx={{ 
                px: 4,
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(244, 67, 54, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleFileUpload}
              disabled={uploading || selectedFiles.length === 0}
              startIcon={<RocketIcon />}
              sx={{
                px: 5,
                py: 1.5,
                background: selectedAgent?.gradient,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: `0 6px 20px ${alpha(selectedAgent?.color || '#2196F3', 0.3)}`,
                '&:hover': {
                  background: selectedAgent?.gradient,
                  filter: 'brightness(1.1)',
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 25px ${alpha(selectedAgent?.color || '#2196F3', 0.4)}`
                },
                '&:disabled': {
                  background: alpha('#ccc', 0.6),
                  color: alpha('#fff', 0.7)
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
               Process & Embed Documents
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* MiFiX.AI Brain Dialog */}
      <Dialog 
        open={brainDialog} 
        onClose={() => setBrainDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: alpha('#ffffff', 0.95),
            backdropFilter: 'blur(20px)',
            boxShadow: `0 25px 50px ${alpha('#000', 0.1)}`,
            minHeight: '60vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #9C27B0 100%)',
            color: 'white',
            py: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BrainIcon sx={{ mr: 2, fontSize: 32, color: 'white' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                MiFiX.AI Brain
              </Typography>
              <Typography variant="subtitle2" sx={{ color: alpha('#ffffff', 0.8), textTransform: 'uppercase', letterSpacing: 1 }}>
                Knowledge Collections
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setBrainDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite ease-in-out'
                  }}
                >
                  <BrainIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </Box>
              <LinearProgress 
                sx={{ 
                  width: '100%',
                  borderRadius: 2,
                  height: 6,
                  background: alpha('#2196F3', 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
                  }
                }} 
              />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading brain collections...
              </Typography>
            </Box>
          ) : collections.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: alpha('#2196F3', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <BrainIcon sx={{ fontSize: 50, color: '#2196F3' }} />
                </Box>
              </Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                No Knowledge Collections Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Upload documents to create your first AI knowledge collection and start building intelligence.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  setBrainDialog(false);
                  // Could trigger agent selection here
                }}
                sx={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                  px: 4
                }}
              >
                Get Started
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {collections
                .sort((a, b) => {
                  // First group by category, then alphabetically within each group
                  const getCategory = (name) => {
                    if (name.toLowerCase().includes('onboarding')) return 'A_Onboarding';
                    if (name.toLowerCase().includes('knowledgebase') && name.toLowerCase().includes('schema')) return 'B_Knowledge Schema';
                    if (name.toLowerCase().includes('knowledgebase') && name.toLowerCase().includes('documents')) return 'C_Knowledge Documents';
                    if (name.toLowerCase().includes('rag') || name.toLowerCase().includes('credit')) return 'D_Analysis';
                    if (name.toLowerCase().includes('budhi')) return 'E_Budhi';
                    if (name.toLowerCase().includes('fed') || name.toLowerCase().includes('workflow')) return 'F_Workflow';
                    return 'Z_Other';
                  };
                  
                  const categoryA = getCategory(a.name);
                  const categoryB = getCategory(b.name);
                  
                  if (categoryA !== categoryB) {
                    return categoryA.localeCompare(categoryB);
                  }
                  
                  return a.name.localeCompare(b.name);
                })
                .map((collection, index) => (
                <Grid item xs={12} sm={6} md={4} key={collection.name}>
                  <Grow in timeout={500 + index * 100}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${alpha(getAgentTypeColor(collection.name), 0.2)}`,
                        background: alpha(getAgentTypeColor(collection.name), 0.02),
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 25px ${alpha(getAgentTypeColor(collection.name), 0.15)}`,
                          border: `2px solid ${getAgentTypeColor(collection.name)}`
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: getAgentTypeColor(collection.name),
                          borderRadius: '12px 12px 0 0'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label={formatCollectionName(collection.name)}
                          sx={{ 
                            backgroundColor: getAgentTypeColor(collection.name),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        />
                        <Tooltip title="Delete Collection">
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteCollection(collection.name)}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': {
                                color: '#d32f2f',
                                background: alpha('#d32f2f', 0.1)
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DocumentIcon sx={{ mr: 1, color: getAgentTypeColor(collection.name) }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {collection.document_count}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Documents embedded in knowledge base
                      </Typography>
                    </Paper>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setBrainDialog(false)}
            size="large"
            sx={{ px: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}