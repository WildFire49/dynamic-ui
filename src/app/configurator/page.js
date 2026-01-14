"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  CircularProgress,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import {
  Gavel as RuleIcon,
  CalendarToday as ScheduleIcon,
  SupervisorAccount as SupervisoryIcon,
  Analytics as AnalyticsIcon,
  RecordVoiceOver as VoiceIcon,
  Rocket as RocketIcon,
  CloudUpload as UploadIcon,
  Storage as BrainIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
  AutoAwesome as SparkleIcon,
  Psychology as PsychologyIcon,
  PictureAsPdf as PdfIcon,
  PictureAsPdf,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  AccountTree as WorkflowIcon,
  DynamicForm as FormIcon,
  SatelliteAlt as EventIcon,
  VerifiedUser as VerifiedUserIcon,
  IntegrationInstructions as ApiIcon,
  Devices as UiIcon,
  FindInPage as InspectorIcon,
} from "@mui/icons-material";
import { embeddingsApi } from "@/lib/api/embeddingsApi";
import RouteGuard from "../../components/auth/RouteGuard";
import NavigationLoader from "../../components/common/NavigationLoader";

const CONFIGURATOR_OPTIONS = [
  {
    id: "ui_workflow",
    title: "Workflow Builder",
    description: "Visual drag-and-drop form workflow designer",
    subtitle: "Workflow Builder Agent",
    icon: WorkflowIcon,
    color: "#2196F3",
    gradient: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
    route: "/configurator/ui",
    features: ["Drag & Drop", "Visual Flow", "API Config", "Real-time Preview"],
  },
  {
    id: "retriever_configurator",
    title: "Data Retriever Configurator",
    description: "Data retrieval and SQL query generation",
    subtitle: "Retriever Configurator Agent",
    icon: BrainIcon,
    color: "#9C27B0",
    gradient: "linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)",
    route: "/configurator/retriever",
    features: [
      "Data Retrieval",
      "Natural Language",
      "SQL Generation",
      "Data Schema",
    ],
  },
  // {
  //   id: "knowledge_upload",
  //   title: "Knowledge Upload",
  //   description: "Upload documents to AI agent knowledge base",
  //   subtitle: "Embed Documents",
  //   icon: UploadIcon,
  //   color: "#4CAF50",
  //   gradient: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
  //   route: null, // Opens dialog
  //   features: [
  //     "PDF Upload",
  //     "Auto Embedding",
  //     "Smart Chunking",
  //     "Vector Search",
  //   ],
  // },
];

const AGENT_TYPES = [
  {
    id: "supervisory",
    title: "Supervisory",
    description: "Automated Decision\nMaking",
    subtitle: "Continuous Oversight",
    icon: SupervisoryIcon,
    color: "#ffb74d",
    gradient: "linear-gradient(135deg, #ffa726 0%, #ffb74d 100%)",
    stats: "99.9% Uptime",
  },
  {
    id: "retriever",
    title: "Retriever",
    description: "Data retrieval and SQL query generation",
    subtitle: "Retriever Agent",
    icon: BrainIcon,
    color: "#4CAF50",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
    stats: "Accurate",
  },
  {
    id: "action_agent",
    title: "Action",
    description: "Intelligent\nbusiness logic automation",
    subtitle: "Enforcing and Monitoring",
    icon: RuleIcon,
    color: "#64b5f6",
    gradient: "linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)",
    stats: "50+ Rules",
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Dynamic Workflows\nExecution",
    subtitle: "Process Automation",
    icon: RocketIcon,
    color: "#f06292",
    gradient: "linear-gradient(135deg, #ec407a 0%, #f06292 100%)",
    stats: "Dynamic",
  },
  {
    id: "communication",
    title: "Communication",
    description: "Communication and Notification through all Platforms",
    subtitle: "Smart Communication",
    icon: EventIcon,
    color: "#D9DE35",
    gradient:
      "linear-gradient(135deg,rgb(198, 213, 59) 0%,rgb(118, 186, 58) 100%)",
    stats: "Real-time",
  },
  {
    id: "validation",
    title: "Validation",
    description: "Data Quality Check",
    subtitle: "Ensures Data Accuracy",
    icon: VerifiedUserIcon,
    color: "#fd971f",
    gradient: "linear-gradient(135deg, #f57c00 0%, #fd971f 100%)",
    stats: "Data Quality",
  },
  {
    id: "analysis_agent",
    title: "Analytics",
    description: "Deep insights &\nPredictions",
    subtitle: "Data Intelligence",
    icon: AnalyticsIcon,
    color: "#ba68c8",
    gradient: "linear-gradient(135deg, #ab47bc 0%, #ba68c8 100%)",
    stats: "Insights",
  },
  {
    id: "scheduler",
    title: "Task Scheduler",
    description: "Automated task\norchestration",
    subtitle: "Time Intelligence",
    icon: ScheduleIcon,
    color: "#81c784",
    gradient: "linear-gradient(135deg, #66bb6a 0%, #81c784 100%)",
    stats: "24/7 Active",
  },
  {
    id: "voice_agent",
    title: "Media",
    description: "Processing Media &\nAudio Content",
    subtitle: "Speech Intelligence",
    icon: VoiceIcon,
    color: "#4db6ac",
    gradient: "linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)",
    stats: "NLP",
  },
  {
    id: "api_integrator",
    title: "API Integrator",
    description: "Connect and manage\nIntegrations",
    subtitle: "API Manager",
    icon: ApiIcon,
    color: "#FF5722",
    gradient: "linear-gradient(135deg, #FF5722 0%, #F4511E 100%)",
    stats: "Seamless",
  },
  {
    id: "ui_generator",
    title: "UI Generator",
    description: "Dynamic UI for\nMobile & Web",
    subtitle: "UI Builder",
    icon: UiIcon,
    color: "#00BCD4",
    gradient: "linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%)",
    stats: "Responsive",
  },
  {
    id: "inspector",
    title: "Inspector",
    description: "Monitor health &\nDetect issues",
    subtitle: "System Monitor",
    icon: InspectorIcon,
    color: "#607D8B",
    gradient: "linear-gradient(135deg, #607D8B 0%, #546E7A 100%)",
    stats: "Real-time",
  },
];

const FloatingParticle = ({ delay = 0, size = 4, color = "#2196F3" }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(45deg, ${color}, ${alpha(color, 0.6)})`,
        animation: `floatUp 8s infinite ease-in-out ${delay}s`,
        "@keyframes floatUp": {
          "0%": {
            transform: "translateY(100vh) translateX(0px)",
            opacity: 0,
          },
          "10%": {
            opacity: 1,
          },
          "90%": {
            opacity: 1,
          },
          "100%": {
            transform: "translateY(-100px) translateX(50px)",
            opacity: 0,
          },
        },
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
  const router = useRouter();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [brainDialog, setBrainDialog] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState("select"); // select, preview, processing, success
  const [previewFile, setPreviewFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect pathname changes to reset navigation state
  useEffect(() => {
    // If pathname changed and we're navigating, the navigation completed
    if (pathname !== prevPathnameRef.current && isNavigating) {
      console.log('✅ Navigation completed, resetting loader');
      setIsNavigating(false);
      setNavigationMessage("");
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isNavigating]);

  // Reset navigation state when component unmounts or as a safety timeout
  useEffect(() => {
    // Safety timeout: reset navigation state after 3 seconds
    let timeoutId;
    if (isNavigating) {
      console.log('⏱️ Navigation timeout started (3s safety net)');
      timeoutId = setTimeout(() => {
        console.log('⚠️ Navigation timeout reached, forcing reset');
        setIsNavigating(false);
        setNavigationMessage("");
      }, 3000); // 3 second timeout as safety net
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isNavigating]);

  // Load collections on component mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await embeddingsApi.listCollections();
      setCollections(response.collections || []);

      // Only show info if collections endpoint is not available
      if (
        response.collections &&
        response.collections.length === 0 &&
        response.count === 0
      ) {
        console.info(
          "Collections API endpoint not available or returned empty"
        );
      }
    } catch (error) {
      console.error("Error loading collections:", error);
      // Set empty collections instead of showing error
      setCollections([]);
      // Only show error snackbar for unexpected errors, not API endpoint issues
      if (error.status !== 500 && error.status !== 404) {
        setSnackbar({
          open: true,
          message: `Failed to load collections: ${error.message}`,
          severity: "warning",
        });
      }
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
      setUploadStep("preview");
      if (files[0].type === "application/pdf") {
        setPreviewFile(files[0]);
      }
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(updatedFiles);

    // If no files left, go back to select step
    if (updatedFiles.length === 0) {
      setUploadStep("select");
      setPreviewFile(null);
    } else if (previewFile && indexToRemove === 0 && updatedFiles.length > 0) {
      // If we removed the preview file, set a new one if available
      const nextPdfFile = updatedFiles.find(
        (file) => file.type === "application/pdf"
      );
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
      setUploadStep("preview");
      if (files[0].type === "application/pdf") {
        setPreviewFile(files[0]);
      }
    }
  };

  const resetUpload = () => {
    setUploadStep("select");
    setSelectedFiles([]);
    setPreviewFile(null);
    setUploadProgress(0);
    setDragActive(false);
  };

  const handlePreviewInNewTab = (file) => {
    if (file && file.type === "application/pdf") {
      // Create a blob URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Open in new tab
      const newTab = window.open(fileUrl, "_blank");

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
        message: "Please select files to upload",
        severity: "warning",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadStep("processing");

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
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
        "chromadb",
        1000,
        200
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadStep("success");
        setSnackbar({
          open: true,
          message: `Successfully embedded ${response.files_processed} files into ${response.chunks_created} chunks`,
          severity: "success",
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
      console.error("Error uploading files:", error);
      setUploadStep("preview");
      setSnackbar({
        open: true,
        message: `Upload failed: ${error.message}`,
        severity: "error",
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
        severity: "success",
      });
      await loadCollections();
    } catch (error) {
      console.error("Error deleting collection:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete collection: ${error.message}`,
        severity: "error",
      });
    }
  };

  const getAgentTypeColor = (collectionName) => {
    if (collectionName.includes("rule")) return "#2196F3";
    if (collectionName.includes("scheduler")) return "#FF9800";
    if (collectionName.includes("supervisor")) return "#4CAF50";
    if (
      collectionName.includes("analysis") ||
      collectionName.includes("credit")
    )
      return "#9C27B0";
    return "#757575";
  };

  const formatCollectionName = (name) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <RouteGuard routeId="configurator">
      {isNavigating && <NavigationLoader message={navigationMessage} />}
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, 
          ${alpha("#0d1b2a", 0.55)} 0%, 
          ${alpha("#1b263b", 0.7)} 25%,
          ${alpha("#1e3a5f", 0.75)} 50%,
          ${alpha("#2d4f73", 0.2)} 75%,
          ${alpha("#0d1b2a", 0.15)} 100%
        )`,
        }}
      >
        {/* Video Background */}
        <Box
          component="video"
          autoPlay
          muted
          loop
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
            opacity: 0.4,
            filter: "brightness(0.9) contrast(1.1) blur(1px)",
            transform: "scale(1.1)", // Slight zoom to avoid edge artifacts
          }}
        >
          <source
            src="/vecteezy_data-neural-network-ai-technology-cloud-computing-bits_21723025.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </Box>

        {/* Dark Blue Overlay */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, 
            ${alpha("#0f1419", 0.8)} 0%, 
            ${alpha("#1a2332", 0.75)} 25%,
            ${alpha("#1e3a5f", 0.7)} 50%,
            ${alpha("#2d4f73", 0.75)} 75%,
            ${alpha("#0f1419", 0.8)} 100%
          )`,
            zIndex: -1,
            animation: "breathe 12s ease-in-out infinite",
            "@keyframes breathe": {
              "0%": {
                opacity: 0.7,
              },
              "50%": {
                opacity: 0.85,
              },
              "100%": {
                opacity: 0.7,
              },
            },
          }}
        />
        {/* Floating Background Particles */}
        {mounted &&
          [...Array(12)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 0.5}
              size={3 + (i % 4) + 1}
              color={AGENT_TYPES[i % AGENT_TYPES.length].color}
            />
          ))}

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Back Button */}
          <Fade in={mounted} timeout={800}>
            <Box sx={{ pt: 4, pb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/")}
                sx={{
                  color: "white",
                  background: alpha("#0d1b2a", 0.6),
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha("#64b5f6", 0.3)}`,
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 8px 25px ${alpha("#000", 0.2)}`,
                  "&:hover": {
                    background: alpha("#1b263b", 0.8),
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 35px ${alpha("#64b5f6", 0.3)}`,
                    border: `1px solid ${alpha("#64b5f6", 0.5)}`,
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Back to Chat
              </Button>
            </Box>
          </Fade>

          {/* Hero Section */}
          <Box sx={{ pt: 4, pb: 6, textAlign: "center" }}>
            <Fade in={mounted} timeout={1000}>
              <Box>
                <Box sx={{ mb: 3, position: "relative" }}>
                  <Zoom in={mounted} timeout={1500}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #DA5EB9 0%, #F9F6F9 50%, #D18DDD 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 4,
                        boxShadow: `0 20px 40px ${alpha("#082F4F", 0.3)}`,
                        animation: "pulse 3s infinite ease-in-out",
                        "@keyframes pulse": {
                          "0%": {
                            transform: "scale(1)",
                            boxShadow: `0 20px 40px ${alpha("#AB71B0", 0.3)}`,
                          },
                          "50%": {
                            transform: "scale(1.05)",
                            boxShadow: `0 25px 50px ${alpha("#2196F3", 0.4)}`,
                          },
                          "100%": {
                            transform: "scale(1)",
                            boxShadow: `0 20px 40px ${alpha("#2196F3", 0.3)}`,
                          },
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src="/Mifix-ai.png"
                        alt="MiFiX AI Logo"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  </Zoom>
                </Box>

                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    textTransform: "none",
                    mb: 2,
                    background:
                      "linear-gradient(135deg,rgb(255, 255, 255) 0%,rgba(182, 30, 38, 0.28) 30%,rgb(242, 245, 248) 60%, #ba68c8 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                    letterSpacing: "-0.02em",
                    textShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.1))",
                  }}
                >
                  MiFiX.ai
                </Typography>

                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 300,
                    mb: 3,
                    color: "#e3f2fd",
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    opacity: 0.9,
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  Intelligent Agent Orchestration
                </Typography>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={{ xs: 2, md: 4 }}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mb: 5 }}
                >
                  {[
                    {
                      text: "Self-evolving AI Brain",
                      icon: (
                        <PsychologyIcon
                          sx={{ fontSize: 28, color: "#64b5f6" }}
                        />
                      ),
                    },
                    {
                      text: "Autonomous Orchestration",
                      icon: (
                        <RocketIcon sx={{ fontSize: 28, color: "#ba68c8" }} />
                      ),
                    },
                    {
                      text: "Specialized Agents",
                      icon: (
                        <WorkflowIcon sx={{ fontSize: 28, color: "#4db6ac" }} />
                      ),
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        opacity: 0.9,
                      }}
                    >
                      {item.icon}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#e2e8f0",
                          fontWeight: 500,
                          fontSize: "1.1rem",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#94a3b8",
                    mb: 4,
                    maxWidth: 600,
                    mx: "auto",
                    textAlign: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  Experience true adaptive intelligence where the system learns,
                  adapts, and executes complex business tasks autonomously.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
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
                          background:
                            "linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)",
                          boxShadow: `0 8px 25px ${alpha("#42a5f5", 0.4)}`,
                          backdropFilter: "blur(10px)",
                          border: `1px solid ${alpha("#64b5f6", 0.3)}`,
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: `0 12px 35px ${alpha("#42a5f5", 0.5)}`,
                          },
                          transition: "all 0.3s ease",
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
                          borderColor: "#64b5f6",
                          color: "#64b5f6",
                          backdropFilter: "blur(10px)",
                          background: alpha("#0d1b2a", 0.3),
                          "&:hover": {
                            borderWidth: 2,
                            borderColor: "#42a5f5",
                            background: alpha("#64b5f6", 0.1),
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? "Syncing..." : "Refresh Collections"}
                      </Button>
                    </Tooltip>
                  </Slide>
                </Stack>

                {/* Stats Row */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                  <Grid container spacing={4} sx={{ maxWidth: 800 }}>
                    {[
                      {
                        label: "AI Agents",
                        value: Object.keys(AGENT_TYPES).length.toString(),
                        icon: RocketIcon,
                      },
                      {
                        label: "Data Accuracty",
                        value: "99%",
                        suffix: "%",
                        icon: StorageIcon,
                      },
                      {
                        label: "Uptime",
                        value: "99.9",
                        suffix: "%",
                        icon: SpeedIcon,
                      },
                    ].map((stat, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Grow in={mounted} timeout={1500 + index * 200}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              textAlign: "center",
                              background: alpha("#0d1b2a", 0.6),
                              backdropFilter: "blur(15px)",
                              borderRadius: 3,
                              border: `1px solid ${alpha("#64b5f6", 0.2)}`,
                              boxShadow: `0 8px 32px ${alpha("#000", 0.2)}`,
                            }}
                          >
                            <stat.icon
                              sx={{ fontSize: 32, color: "#64b5f6", mb: 1 }}
                            />
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: "white" }}
                            >
                              <AnimatedCounter value={stat.value} />
                              {stat.suffix || ""}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "white" }}>
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

          {/* Configurator Options Section */}
          <Box sx={{ py: 6 }}>
            <Fade in={mounted} timeout={1200}>
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  textAlign: "center",
                  mb: 6,
                  fontWeight: 700,
                  color: "#e3f2fd",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                Configuration Tools
              </Typography>
            </Fade>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                px: { xs: 2, sm: 4, md: 6 },
                mb: 8,
              }}
            >
              <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 4 }}
                justifyContent="center"
                alignItems="stretch"
                sx={{ maxWidth: 1400, width: "100%" }}
              >
                {CONFIGURATOR_OPTIONS.map((option, index) => {
                  const IconComponent = option.icon;
                  const isHovered = hoveredOption === option.id;

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={option.id}
                      sx={{ display: "flex" }}
                    >
                      <Grow
                        in={mounted}
                        timeout={1000 + index * 200}
                        style={{ width: "100%", display: "flex" }}
                      >
                        <Card
                          onMouseEnter={() => setHoveredOption(option.id)}
                          onMouseLeave={() => setHoveredOption(null)}
                          onClick={() => {
                            if (option.route) {
                              console.log(`🚀 Navigating to: ${option.route}`);
                              setIsNavigating(true);
                              setNavigationMessage(
                                `Loading ${option.title}...`
                              );
                              
                              // Use try-catch for navigation
                              try {
                              router.push(option.route);
                              } catch (error) {
                                console.error('❌ Navigation error:', error);
                                // Reset navigation state on error
                                setIsNavigating(false);
                                setNavigationMessage("");
                                setSnackbar({
                                  open: true,
                                  message: "Navigation failed. Please try again.",
                                  severity: "error",
                                });
                              }
                            } else {
                              // For knowledge upload, show agent selection
                              setUploadDialogOpen(true);
                            }
                          }}
                          sx={{
                            width: "100%",
                            height: 300,
                            minHeight: 300,
                            maxHeight: 300,
                            background: alpha("#0d1b2a", 0.8),
                            backdropFilter: "blur(20px)",
                            borderRadius: 4,
                            border: `2px solid ${alpha(option.color, 0.3)}`,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: `0 8px 32px ${alpha("#000", 0.3)}`,
                            "&:hover": {
                              transform: "translateY(-12px) scale(1.02)",
                              boxShadow: `0 25px 50px ${alpha(
                                option.color,
                                0.4
                              )}`,
                              border: `2px solid ${option.color}`,
                              background: alpha("#1b263b", 0.9),
                            },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: option.gradient,
                              opacity: 0.8,
                            },
                          }}
                        >
                          <CardContent
                            sx={{
                              p: 4,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* Icon */}
                            <Box
                              sx={{
                                mb: 2,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "50%",
                                  background: option.gradient,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.3s ease",
                                  transform: isHovered
                                    ? "scale(1.1) rotate(5deg)"
                                    : "scale(1)",
                                  boxShadow: `0 8px 25px ${alpha(
                                    option.color,
                                    0.3
                                  )}`,
                                }}
                              >
                                <IconComponent
                                  sx={{ fontSize: 40, color: "white" }}
                                />
                              </Box>
                            </Box>

                            {/* Content */}
                            <Box sx={{ textAlign: "center", flexGrow: 1 }}>
                              <Typography
                                variant="h5"
                                sx={{
                                  mb: 1,
                                  fontWeight: 700,
                                  color: "#e3f2fd",
                                }}
                              >
                                {option.title}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color: option.color,
                                  fontWeight: 600,
                                  display: "block",
                                  mb: 2,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                }}
                              >
                                {option.subtitle}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 2,
                                  lineHeight: 1.6,
                                  color: "#b3e5fc",
                                }}
                              >
                                {option.description}
                              </Typography>

                              {/* Features */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                  justifyContent: "center",
                                }}
                              >
                                {option.features.map((feature, idx) => (
                                  <Chip
                                    key={idx}
                                    label={feature}
                                    size="small"
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 22,
                                      background: alpha(option.color, 0.1),
                                      color: option.color,
                                      border: `1px solid ${alpha(
                                        option.color,
                                        0.2
                                      )}`,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>

          {/* Agent Cards Section */}
          <Box sx={{ py: 6 }}>
            <Fade in={mounted} timeout={1200}>
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  textAlign: "center",
                  mb: 6,
                  fontWeight: 700,
                  color: "#e3f2fd",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                Our AI Agents
              </Typography>
            </Fade>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                px: { xs: 2, sm: 4, md: 6 },
              }}
            >
              <Grid
                container
                spacing={{ xs: 3, sm: 4, md: 5 }}
                justifyContent="center"
                alignItems="stretch"
                sx={{
                  maxWidth: {
                    xs: "100%",
                    sm: "800px",
                    md: "1000px",
                    lg: "1200px",
                  },
                  width: "100%",
                }}
              >
                {AGENT_TYPES.map((agent, index) => {
                  const IconComponent = agent.icon;
                  const isHovered = hoveredCard === agent.id;

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      xl={4}
                      key={agent.id}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Grow in={mounted} timeout={1000 + index * 200}>
                        <Card
                          onMouseEnter={() => setHoveredCard(agent.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                          sx={{
                            width: { xs: "280px", sm: "290px", md: "300px" },
                            height: 340,
                            minHeight: 340,
                            maxHeight: 340,
                            background: alpha("#0d1b2a", 0.8),
                            backdropFilter: "blur(20px)",
                            borderRadius: 4,
                            border: `2px solid ${alpha(agent.color, 0.3)}`,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: `0 8px 32px ${alpha("#000", 0.3)}`,
                            "&:hover": {
                              transform: "translateY(-12px) scale(1.02)",
                              boxShadow: `0 25px 50px ${alpha(
                                agent.color,
                                0.4
                              )}`,
                              border: `2px solid ${agent.color}`,
                              background: alpha("#1b263b", 0.9),
                              "&::before": {
                                opacity: 1,
                              },
                            },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: agent.gradient,
                              opacity: 0.8,
                              transition: "opacity 0.3s ease",
                            },
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleAgentSelect(agent)}
                            sx={{ height: "100%", p: 0 }}
                          >
                            <CardContent
                              sx={{
                                p: 3,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {/* Icon Container */}
                              <Box
                                sx={{
                                  mb: 2,
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    background: agent.gradient,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.3s ease",
                                    transform: isHovered
                                      ? "scale(1.1) rotate(5deg)"
                                      : "scale(1)",
                                    boxShadow: `0 8px 25px ${alpha(
                                      agent.color,
                                      0.3
                                    )}`,
                                  }}
                                >
                                  <IconComponent
                                    sx={{
                                      fontSize: 40,
                                      color: "white",
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Content */}
                              <Box sx={{ textAlign: "center", flexGrow: 1 }}>
                                <Typography
                                  variant="h6"
                                  component="h3"
                                  sx={{
                                    mb: 1,
                                    fontWeight: 700,
                                    color: "#e3f2fd",
                                  }}
                                >
                                  {agent.title}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: agent.color,
                                    fontWeight: 600,
                                    display: "block",
                                    mb: 2,
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                  }}
                                >
                                  {agent.subtitle}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 3,
                                    lineHeight: 1.6,
                                    color: "#b3e5fc",
                                    opacity: 0.9,
                                  }}
                                >
                                  {agent.description}
                                </Typography>
                              </Box>

                              {/* Stats Badge */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <Chip
                                  label={agent.stats}
                                  size="small"
                                  sx={{
                                    background: alpha(agent.color, 0.1),
                                    color: agent.color,
                                    fontWeight: 600,
                                    border: `1px solid ${alpha(
                                      agent.color,
                                      0.2
                                    )}`,
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
          </Box>
        </Container>

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            setUploadStep("select");
            setSelectedFiles([]);
            setUploadProgress(0);
            setDragActive(false);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              backdropFilter: "blur(20px)",
              background: alpha("#0d1b2a", 0.95),
              border: `1px solid ${alpha("#64b5f6", 0.2)}`,
              boxShadow: `0 20px 40px ${alpha("#000", 0.3)}`,
              overflow: "visible",
            },
          }}
          sx={{
            "& .MuiDialog-container": {
              overflow: "visible",
            },
            "& .MuiDialog-paper": {
              overflow: "visible",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: selectedAgent?.gradient || "transparent",
              color: "white",
              py: 3,
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {selectedAgent &&
                React.createElement(selectedAgent.icon, {
                  sx: { mr: 2, fontSize: 32, color: "white" },
                })}
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "white" }}
                >
                  {selectedAgent?.title}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: alpha("#ffffff", 0.8),
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Document Upload
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setUploadDialogOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, minHeight: 600, overflow: "visible" }}>
            {uploadStep === "select" && (
              <Fade in timeout={400}>
                <Box
                  sx={{
                    p: 6,
                    background: `linear-gradient(135deg, ${alpha(
                      "#0d1b2a",
                      0.9
                    )} 0%, ${alpha("#1b263b", 0.85)} 100%)`,
                    position: "relative",
                  }}
                >
                  {/* Background Pattern */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(
                        selectedAgent?.color || "#2196F3",
                        0.03
                      )} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(
                        selectedAgent?.color || "#2196F3",
                        0.03
                      )} 0%, transparent 50%), radial-gradient(circle at 40% 80%, ${alpha(
                        selectedAgent?.color || "#2196F3",
                        0.02
                      )} 0%, transparent 50%)`,
                      zIndex: 0,
                    }}
                  />

                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      textAlign: "center",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "#e3f2fd",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    Enhance {selectedAgent?.title} Knowledge Base
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 6,
                      textAlign: "center",
                      fontSize: "0.95rem",
                      position: "relative",
                      zIndex: 1,
                      color: "#b3e5fc",
                      opacity: 0.9,
                    }}
                  >
                    Upload your documents to expand the AI&apos;s understanding
                    and capabilities
                  </Typography>

                  {/* Main Upload Container */}
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "visible",
                      zIndex: 1,
                    }}
                  >
                    {/* Floating Helper Icons */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -30,
                        left: 50,
                        zIndex: 2,
                        opacity: dragActive ? 1 : 0.7,
                        transform: dragActive
                          ? "scale(1.1) rotate(10deg)"
                          : "scale(1) rotate(-5deg)",
                        transition:
                          "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <svg
                        width="78"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill={alpha(selectedAgent?.color || "#2196F3", 0.1)}
                          stroke={selectedAgent?.color || "#2196F3"}
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                        <path
                          d="M16 24l6 6 10-12"
                          stroke={selectedAgent?.color || "#2196F3"}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: -25,
                        right: 60,
                        zIndex: 2,
                        opacity: dragActive ? 1 : 0.6,
                        transform: dragActive
                          ? "scale(1.2) rotate(-15deg)"
                          : "scale(1) rotate(8deg)",
                        transition:
                          "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <rect
                          x="8"
                          y="12"
                          width="24"
                          height="20"
                          rx="3"
                          fill={alpha("#FF9800", 0.15)}
                          stroke="#FF9800"
                          strokeWidth="2"
                        />
                        <path d="M12 8h16v4H12z" fill="#FF9800" opacity="0.8" />
                        <circle cx="16" cy="20" r="2" fill="#FF9800" />
                        <path
                          d="M20 24l4-4 8 8v4H12v-4l4-4z"
                          fill={alpha("#FF9800", 0.3)}
                        />
                      </svg>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -35,
                        left: 40,
                        zIndex: 2,
                        opacity: dragActive ? 1 : 0.5,
                        transform: dragActive
                          ? "scale(1.1) rotate(5deg)"
                          : "scale(1) rotate(-10deg)",
                        transition:
                          "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        fill="none"
                      >
                        <path
                          d="M6 6h24v24H6z"
                          fill={alpha("#9C27B0", 0.1)}
                          stroke="#9C27B0"
                          strokeWidth="2"
                          rx="4"
                        />
                        <path
                          d="M12 16h12M12 20h8M12 24h10"
                          stroke="#9C27B0"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -30,
                        right: 45,
                        zIndex: 2,
                        opacity: dragActive ? 1 : 0.6,
                        transform: dragActive
                          ? "scale(1.15) rotate(-8deg)"
                          : "scale(1) rotate(12deg)",
                        transition:
                          "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <svg
                        width="42"
                        height="42"
                        viewBox="0 0 42 42"
                        fill="none"
                      >
                        <circle
                          cx="21"
                          cy="21"
                          r="18"
                          fill={alpha("#4CAF50", 0.12)}
                          stroke="#4CAF50"
                          strokeWidth="2"
                        />
                        <path
                          d="M14 21l6 6 12-12"
                          stroke="#4CAF50"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>

                    {/* Premium Upload Container */}
                    <Paper
                      elevation={0}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      sx={{
                        p: -10,
                        borderRadius: "34px",
                        textAlign: "center",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        background: dragActive
                          ? `linear-gradient(135deg, ${alpha(
                              "#1b263b",
                              0.95
                            )}, ${alpha("#2d4f73", 0.8)})`
                          : `linear-gradient(135deg, ${alpha(
                              "#1b263b",
                              0.9
                            )}, ${alpha("#0d1b2a", 0.95)})`,
                        border: dragActive
                          ? `2px solid ${selectedAgent?.color}`
                          : `1px solid ${alpha("#64b5f6", 0.2)}`,
                        boxShadow: dragActive
                          ? `0 35px 50px ${alpha(
                              selectedAgent?.color || "#ccc",
                              0.15
                            )}, 0 0 0 1px ${alpha("#1b263b", 0.2)} inset`
                          : `0 8px 32px ${alpha(
                              "#000",
                              0.2
                            )}, 0 0 0 1px ${alpha("#1b263b", 0.1)} inset`,
                        transition:
                          "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        transform: dragActive
                          ? "scale(1.02) translateY(-4px)"
                          : "scale(1)",
                        "&:hover": {
                          transform: "translateY(-8px) scale(1.01)",
                          boxShadow: `0 32px 64px ${alpha(
                            selectedAgent?.color || "#000",
                            0.12
                          )}, 0 0 0 1px ${alpha(
                            selectedAgent?.color || "#64b5f6",
                            0.2
                          )} inset`,
                          border: `2px solid ${selectedAgent?.color}`,
                          "& .upload-icon": {
                            transform: "scale(1.15) rotate(5deg)",
                          },
                          "& .upload-text": {
                            color: selectedAgent?.color,
                          },
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `radial-gradient(circle at center, ${alpha(
                            selectedAgent?.color || "#2196F3",
                            0.03
                          )}, transparent 70%)`,
                          opacity: dragActive ? 1 : 0,
                          transition: "opacity 0.3s ease",
                          borderRadius: "24px",
                        },
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.xlsx,.xls,.docx,.doc,.txt"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />

                      {/* Centered Upload Content */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {/* Premium Upload Icon */}
                        <Box
                          className="upload-icon"
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background:
                              selectedAgent?.gradient ||
                              "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 4,
                            boxShadow: `0 16px 32px ${alpha(
                              selectedAgent?.color || "#2196F3",
                              0.25
                            )}, 0 0 0 4px ${alpha("#64b5f6", 0.3)} inset`,
                            transform: dragActive
                              ? "scale(1.1) rotate(10deg)"
                              : "scale(1)",
                            transition:
                              "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: -4,
                              borderRadius: "50%",
                              background: `conic-gradient(from 0deg, transparent, ${
                                selectedAgent?.color || "#2196F3"
                              }, transparent)`,
                              animation: dragActive
                                ? "spin 2s linear infinite"
                                : "none",
                              zIndex: -1,
                            },
                          }}
                        >
                          <UploadIcon
                            sx={{
                              fontSize: 48,
                              color: "white",
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                            }}
                          />
                        </Box>

                        <Typography
                          className="upload-text"
                          variant="h5"
                          sx={{
                            mb: 2,
                            color: "#e3f2fd",
                            fontWeight: 700,
                            fontSize: "1.5rem",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {dragActive
                            ? "Drop files here!"
                            : "Drop files here or click to browse"}
                        </Typography>

                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            mb: 4,
                            fontSize: "1rem",
                            fontWeight: 500,
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
                            transform: dragActive
                              ? "translateY(-4px)"
                              : "translateY(0)",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          {[
                            { name: "PDF", color: "#FF5722", icon: "📄" },
                            { name: "Excel", color: "#4CAF50", icon: "📊" },
                            { name: "Word", color: "#2196F3", icon: "📝" },
                            { name: "Text", color: "#9C27B0", icon: "📋" },
                          ].map((type, index) => (
                            <Chip
                              key={type.name}
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <span style={{ fontSize: "14px" }}>
                                    {type.icon}
                                  </span>
                                  <span>{type.name}</span>
                                </Box>
                              }
                              size="medium"
                              sx={{
                                background: `linear-gradient(135deg, ${alpha(
                                  type.color,
                                  0.08
                                )}, ${alpha(type.color, 0.12)})`,
                                color: type.color,
                                border: `1px solid ${alpha(type.color, 0.2)}`,
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                borderRadius: "20px",
                                px: 1,
                                py: 0.5,
                                transition: "all 0.3s ease",
                                backdropFilter: "blur(8px)",
                                "&:hover": {
                                  background: `linear-gradient(135deg, ${alpha(
                                    type.color,
                                    0.15
                                  )}, ${alpha(type.color, 0.2)})`,
                                  transform: "translateY(-2px) scale(1.05)",
                                  boxShadow: `0 8px 20px ${alpha(
                                    type.color,
                                    0.25
                                  )}`,
                                },
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

            {uploadStep === "preview" && (
              <Slide in direction="left" timeout={400}>
                <Box
                  sx={{
                    p: 6,
                    background: `linear-gradient(135deg, ${alpha(
                      "#0d1b2a",
                      0.9
                    )} 0%, ${alpha("#1b263b", 0.85)} 100%)`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      color: "#e3f2fd",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Review Selected Files
                  </Typography>

                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#e3f2fd", fontWeight: 600 }}
                    >
                      Selected Files ({selectedFiles.length})
                    </Typography>

                    <Stack spacing={3} sx={{ mb: 4 }}>
                      {selectedFiles.map((file, index) => (
                        <Box key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              borderRadius: 4,
                              overflow: "hidden",
                              border: `2px solid ${alpha(
                                selectedAgent?.color || "#ccc",
                                0.1
                              )}`,
                              background: `linear-gradient(135deg, ${alpha(
                                "#1b263b",
                                0.8
                              )} 0%, ${alpha("#2d4f73", 0.6)} 100%)`,
                              backdropFilter: "blur(10px)",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                transform: "translateY(-4px) scale(1.02)",
                                boxShadow: `0 20px 40px ${alpha(
                                  selectedAgent?.color || "#000",
                                  0.12
                                )}`,
                                border: `2px solid ${alpha(
                                  selectedAgent?.color || "#ccc",
                                  0.3
                                )}`,
                              },
                            }}
                          >
                            {/* File Header */}
                            <Box sx={{ p: 3, pb: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    background:
                                      file.type === "application/pdf"
                                        ? "linear-gradient(135deg,rgb(56, 86, 142) 0%,rgb(80, 176, 255) 100%)"
                                        : selectedAgent?.gradient ||
                                          "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: `0 8px 20px ${alpha(
                                      file.type === "application/pdf"
                                        ? "#2196F3"
                                        : selectedAgent?.color || "#2196F3",
                                      0.3
                                    )}`,
                                  }}
                                >
                                  {file.type === "application/pdf" ? (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="white"
                                    >
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                                    </svg>
                                  ) : (
                                    <DocumentIcon
                                      sx={{ color: "white", fontSize: 24 }}
                                    />
                                  )}
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontWeight: 700,
                                      mb: 0.5,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      color: "#e3f2fd",
                                    }}
                                  >
                                    {file.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 500,
                                      color: "#b3e5fc",
                                      opacity: 0.8,
                                    }}
                                  >
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
                                      color: "#f44336",
                                      background: alpha("#f44336", 0.1),
                                      ml: 1,
                                      "&:hover": {
                                        background: alpha("#f44336", 0.2),
                                        transform: "scale(1.1)",
                                      },
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              {file.type === "application/pdf" && (
                                <Chip
                                  label="📄 PDF Document"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, rgba(82, 128, 226, 0.1), rgba(255, 87, 34, 0.15))",
                                    color: "#2196F3",
                                    fontWeight: 600,
                                    border: "1px solid rgba(34, 82, 255, 0.2)",
                                  }}
                                />
                              )}
                            </Box>

                            {/* File Actions */}
                            {file.type === "application/pdf" && (
                              <Box sx={{ mx: 3, mb: 3 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handlePreviewInNewTab(file)}
                                  fullWidth
                                  sx={{
                                    py: 1.2,
                                    borderColor: "rgba(82, 170, 228, 0.3)",
                                    color: "#2196F3",
                                    background:
                                      "linear-gradient(135deg, rgba(34, 78, 255, 0.05), rgba(255, 87, 34, 0.02))",
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    "&:hover": {
                                      borderColor: "#2196F3",
                                      background:
                                        "linear-gradient(135deg, rgba(48, 76, 133, 0.1), rgba(255, 87, 34, 0.05))",
                                      transform: "translateY(-1px)",
                                      boxShadow:
                                        "0 4px 12px rgba(62, 130, 232, 0.2)",
                                    },
                                    transition: "all 0.2s ease",
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

                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Button
                        variant="outlined"
                        onClick={resetUpload}
                        startIcon={<UploadIcon />}
                        sx={{
                          borderColor: alpha(
                            selectedAgent?.color || "#ccc",
                            0.5
                          ),
                          color: selectedAgent?.color || "#2196F3",
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          textTransform: "none",
                          "&:hover": {
                            borderColor: selectedAgent?.color || "#2196F3",
                            background: alpha(
                              selectedAgent?.color || "#2196F3",
                              0.05
                            ),
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 20px ${alpha(
                              selectedAgent?.color || "#2196F3",
                              0.15
                            )}`,
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        📎 Add More Files
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Slide>
            )}

            {uploadStep === "processing" && (
              <Fade in timeout={300}>
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: selectedAgent?.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      animation: "pulse 2s infinite ease-in-out",
                    }}
                  >
                    <BrainIcon sx={{ fontSize: 48, color: "white" }} />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{ mb: 2, fontWeight: 600, color: "#e3f2fd" }}
                  >
                    Processing Documents
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    AI is analyzing and embedding your documents into the
                    knowledge base...
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{
                        borderRadius: 3,
                        height: 12,
                        background: alpha(selectedAgent?.color || "#ccc", 0.1),
                        "& .MuiLinearProgress-bar": {
                          background: selectedAgent?.gradient,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "#b3e5fc" }}
                    >
                      {Math.round(uploadProgress)}% Complete
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} justifyContent="center">
                    {["Analyzing", "Chunking", "Embedding", "Indexing"].map(
                      (step, index) => (
                        <Chip
                          key={step}
                          label={step}
                          size="small"
                          color={
                            uploadProgress > index * 25 ? "primary" : "default"
                          }
                          sx={{
                            background:
                              uploadProgress > index * 25
                                ? selectedAgent?.color
                                : "transparent",
                            color:
                              uploadProgress > index * 25 ? "white" : "#b3e5fc",
                          }}
                        />
                      )
                    )}
                  </Stack>
                </Box>
              </Fade>
            )}

            {uploadStep === "success" && (
              <Zoom in timeout={500}>
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      animation: "successPulse 1s ease-in-out",
                      "@keyframes successPulse": {
                        "0%": { transform: "scale(0.8)", opacity: 0 },
                        "50%": { transform: "scale(1.1)", opacity: 1 },
                        "100%": { transform: "scale(1)", opacity: 1 },
                      },
                    }}
                  >
                    <SparkleIcon sx={{ fontSize: 48, color: "white" }} />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{ mb: 2, fontWeight: 700, color: "#4CAF50" }}
                  >
                    Success!
                  </Typography>

                  <Typography variant="h6" sx={{ mb: 1, color: "#e3f2fd" }}>
                    Documents Successfully Embedded
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Your documents have been processed and added to the{" "}
                    {selectedAgent?.title} knowledge base.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => {
                      setUploadDialogOpen(false);
                      resetUpload();
                      setSelectedAgent(null);
                    }}
                    sx={{
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
                      px: 4,
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Zoom>
            )}
          </DialogContent>

          {uploadStep === "preview" && (
            <DialogActions
              sx={{
                p: 3,
                pt: 0,
                background: alpha("#0d1b2a", 0.8),
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={() => setUploadDialogOpen(false)}
                size="large"
                variant="contained"
                sx={{
                  px: 4,
                  background:
                    "linear-gradient(135deg, #f44336 0%, #e57373 100%)",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(244, 67, 54, 0.3)",
                  },
                  transition: "all 0.3s ease",
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
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 3,
                  boxShadow: `0 6px 20px ${alpha(
                    selectedAgent?.color || "#2196F3",
                    0.3
                  )}`,
                  "&:hover": {
                    background: selectedAgent?.gradient,
                    filter: "brightness(1.1)",
                    transform: "translateY(-3px)",
                    boxShadow: `0 8px 25px ${alpha(
                      selectedAgent?.color || "#2196F3",
                      0.4
                    )}`,
                  },
                  "&:disabled": {
                    background: alpha("#ccc", 0.6),
                    color: alpha("#fff", 0.7),
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
              background: alpha("#0d1b2a", 0.95),
              backdropFilter: "blur(20px)",
              boxShadow: `0 25px 50px ${alpha("#000", 0.3)}`,
              minHeight: "60vh",
              border: `1px solid ${alpha("#64b5f6", 0.2)}`,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background:
                "linear-gradient(135deg, #42a5f5 0%, #64b5f6 50%, #ba68c8 100%)",
              color: "white",
              py: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <BrainIcon sx={{ mr: 2, fontSize: 32, color: "white" }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "white" }}
                >
                  MiFiX.AI Brain
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: alpha("#ffffff", 0.8),
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Knowledge Collections
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setBrainDialog(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 6,
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "pulse 2s infinite ease-in-out",
                    }}
                  >
                    <BrainIcon sx={{ fontSize: 30, color: "white" }} />
                  </Box>
                </Box>
                <LinearProgress
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    height: 6,
                    background: alpha("#2196F3", 0.1),
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                    },
                  }}
                />
                <Typography variant="body1" sx={{ mt: 2, color: "#b3e5fc" }}>
                  Loading brain collections...
                </Typography>
              </Box>
            ) : collections.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: alpha("#2196F3", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    <BrainIcon sx={{ fontSize: 50, color: "#2196F3" }} />
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  No Knowledge Collections Yet
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Upload documents to create your first AI knowledge collection
                  and start building intelligence.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setBrainDialog(false);
                    // Could trigger agent selection here
                  }}
                  sx={{
                    background:
                      "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                    px: 4,
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
                      if (name.toLowerCase().includes("onboarding"))
                        return "A_Onboarding";
                      if (
                        name.toLowerCase().includes("knowledgebase") &&
                        name.toLowerCase().includes("schema")
                      )
                        return "B_Knowledge Schema";
                      if (
                        name.toLowerCase().includes("knowledgebase") &&
                        name.toLowerCase().includes("documents")
                      )
                        return "C_Knowledge Documents";
                      if (
                        name.toLowerCase().includes("rag") ||
                        name.toLowerCase().includes("credit")
                      )
                        return "D_Analysis";
                      if (name.toLowerCase().includes("budhi"))
                        return "E_Budhi";
                      if (
                        name.toLowerCase().includes("fed") ||
                        name.toLowerCase().includes("workflow")
                      )
                        return "F_Workflow";
                      return "Z_Other";
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
                            border: `2px solid ${alpha(
                              getAgentTypeColor(collection.name),
                              0.2
                            )}`,
                            background: alpha("#0d1b2a", 0.6),
                            backdropFilter: "blur(10px)",
                            position: "relative",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: `0 12px 25px ${alpha(
                                getAgentTypeColor(collection.name),
                                0.15
                              )}`,
                              border: `2px solid ${getAgentTypeColor(
                                collection.name
                              )}`,
                            },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: getAgentTypeColor(collection.name),
                              borderRadius: "12px 12px 0 0",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={formatCollectionName(collection.name)}
                              sx={{
                                backgroundColor: getAgentTypeColor(
                                  collection.name
                                ),
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                              }}
                            />
                            <Tooltip title="Delete Collection">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteCollection(collection.name)
                                }
                                sx={{
                                  color: "#b3e5fc",
                                  "&:hover": {
                                    color: "#d32f2f",
                                    background: alpha("#d32f2f", 0.1),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <DocumentIcon
                              sx={{
                                mr: 1,
                                color: getAgentTypeColor(collection.name),
                              }}
                            />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#e3f2fd" }}
                            >
                              {collection.document_count}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body1"
                            sx={{ mb: 4, color: "#b3e5fc", opacity: 0.9 }}
                          >
                            Documents embedded in knowledge base
                          </Typography>
                        </Paper>
                      </Grow>
                    </Grid>
                  ))}
              </Grid>
            )}
          </DialogContent>

          <DialogActions
            sx={{ p: 3, pt: 0, background: alpha("#0d1b2a", 0.9) }}
          >
            <Button
              onClick={() => setBrainDialog(false)}
              size="large"
              sx={{
                px: 4,
                color: "#64b5f6",
                borderColor: "#64b5f6",
                background: alpha("#0d1b2a", 0.3),
                "&:hover": {
                  background: alpha("#64b5f6", 0.1),
                  borderColor: "#42a5f5",
                },
              }}
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
            sx={{
              width: "100%",
              background: alpha("#0d1b2a", 0.95),
              color: "#e3f2fd",
              border: `1px solid ${alpha("#64b5f6", 0.3)}`,
              backdropFilter: "blur(10px)",
              "& .MuiAlert-icon": {
                color: "#64b5f6",
              },
              "& .MuiAlert-action": {
                color: "#64b5f6",
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RouteGuard>
  );
}
