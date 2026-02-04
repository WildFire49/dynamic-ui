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
import { styled } from "@mui/material/styles";
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
  AccountBalance as BankIcon,
  Dashboard as DashboardIcon,
  TrendingUp as ChartIcon,
  ShoppingBag as ShopIcon,
  LocationOn as MapIcon,
  Timer as TimerIcon,
  Bolt as ActionIcon,
  Chat as CommunicationIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  SettingsSuggest as GearIcon,
} from "@mui/icons-material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BuildIcon from "@mui/icons-material/Build";
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

// --- Data Definitions ---

const SUCCESS_STORIES = [
  {
    title: "Swift Reconciliation",
    client: "PESU 1",
    icon: BankIcon,
    desc: "Automated reconciliation handling millions of transactions daily with near-zero latency.",
    impact: "10x",
    impactLabel: "Time Reduction",
    stat: "10M+ Txns",
    color: "#00E5FF", // Cyan
    tags: ["FinTech", "Automation"],
  },
  {
    title: "Business Dashboard",
    client: "Enterprise",
    icon: DashboardIcon,
    desc: "Consolidated real-time business metrics into a single source of truth for C-suite.",
    impact: "10x",
    impactLabel: "Fast Insights",
    stat: "Real-time",
    color: "#66BB6A", // Green
    tags: ["BI", "Analytics"],
  },
  {
    title: "Portfolio Strategy",
    client: "Finance Sector",
    icon: ChartIcon,
    desc: "AI-driven portfolio generation optimizing asset allocation based on risk profiles.",
    impact: "+24%",
    impactLabel: "Yield Increase",
    stat: "500Cr AUM",
    color: "#FFA726", // Orange
    tags: ["AI", "Investment"],
  },
  {
    title: "SheFirst Platform",
    client: "SheCommerz",
    icon: ShopIcon,
    desc: "E-commerce ecosystem empowering women entrepreneurs with digital tools.",
    impact: "Faster",
    impactLabel: "Loan Repayments",
    stat: "Global",
    color: "#EC407A", // Pink
    tags: ["E-com", "Social"],
  },
  {
    title: "Field RM Tracker",
    client: "Sales Mgmt",
    icon: MapIcon,
    desc: "Geo-fenced live tracking for field relationship managers improving visit efficiency.",
    impact: "35%",
    impactLabel: "Productivity",
    stat: "Live Tracking",
    color: "#AB47BC", // Purple
    tags: ["Geo", "Sales"],
  },
  {
    title: "Productivity AI",
    client: "HR Tech",
    icon: TimerIcon,
    desc: "Employee analytics system identifying bottlenecks and optimizing workflow.",
    impact: "15hr",
    impactLabel: "Saved / Week",
    stat: "Efficiency",
    color: "#FF7043", // Deep Orange
    tags: ["HR", "AI"],
  },
];

const DETERMINISTIC_ENGINES = [
  { id: "ui_engine", title: "UI Rendering Engine", icon: UiIcon, desc: "Compiles dynamic Web and Mobile components from AI specs.", color: "#29B6F6" },
  { id: "validation_engine", title: "Validation Engine", icon: VerifiedUserIcon, desc: "Ensures code compliance and security standards.", color: "#66BB6A" },
  { id: "workflow_engine", title: "Workflow Engine", icon: WorkflowIcon, desc: "Orchestrates complex multi-step agent processes.", color: "#FFA726" },
  { id: "scheduler_engine", title: "Scheduler Engine", icon: ScheduleIcon, desc: "Manages scheduled jobs and timed task execution.", color: "#AB47BC" },
  { id: "api_engine", title: "API Orchestrator", icon: ApiIcon, featured: true, desc: "Routes requests across microservice mesh.", color: "#EF5350" },
  { id: "audit_engine", title: "Audit Engine", icon: InspectorIcon, desc: "Immutable logging of all system actions.", color: "#78909C" },
  { id: "auth_engine", title: "Auth Engine", icon: RuleIcon, desc: "Manages identity, RBAC, and session security.", color: "#8D6E63" },
  { id: "notification_engine", title: "Notification Engine", icon: EventIcon, desc: "Delivers real-time alerts via multiple channels.", color: "#FFCA28" },
  { id: "analytics_engine", title: "Analytics Engine", icon: AnalyticsIcon, desc: "Tracks usage, latency, and performance metrics.", color: "#26C6DA" },
  { id: "report_engine", title: "Reporting Engine", icon: DocumentIcon, desc: "Generates comprehensive PDF/CSV insights.", color: "#9CCC65" },
  { id: "integration_engine", title: "Integration Engine", icon: UploadIcon, desc: "Connects seamlessly with 3rd-party APIs.", color: "#5C6BC0" },
  { id: "rule_engine", title: "Rule Engine", icon: RuleIcon, desc: "Executes deterministic business logic matrices.", color: "#EC407A" },
];

// Custom Image Components for Agents - Sized to 75% to prevent cutoff (contained like chat bubble)
const RetrieverImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/seo.png"
    alt="Retriever"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const CommunicationImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/chat-bubbles.png"
    alt="Communication"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const ActionImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/critical-thinking.png"
    alt="Action"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const DbArchitectImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/knowledge.png"
    alt="DB Architect"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const SchedulerImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/schedule.png"
    alt="Scheduler"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const OcrImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/ocr.png"
    alt="OCR"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const UiGeneratorImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/generative-image.png"
    alt="UI Generator"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const BiometricsImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/face-recognition.png"
    alt="Biometrics"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const NlpImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/comment.png"
    alt="NLP"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const ApiIntegratorImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/api.png"
    alt="API Integrator"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const WorkflowImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/flowchart.png"
    alt="Workflow"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const ValidationImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/validation.png"
    alt="Validation"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const MoreAgentsImage = ({ sx, ...props }) => (
  <Box
    component="img"
    src="/more-agents.png"
    alt="More Agents"
    sx={{ width: "75%", height: "75%", objectFit: "contain", ...sx }}
    {...props}
  />
);
const AGENT_HIERARCHY = {
  supervisor: {
    id: "supervisor_group",
    title: "Supervisor Agent",
    count: 1,
    description:
      "Acts as a project manager, decomposing prompts into dependency graphs.",
    agents: [
      {
        id: "supervisory",
        title: "Supervisor Agent",
        subtitle: "Orchestrator",
        description: "Manages the entire agentic workflow.",
        icon: SupervisoryIcon,
        color: "#FFA726",
        gradient: "linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)",
      },
    ],
  },
  learning: {
    id: "learning_group",
    title: "Learning Agent",
    count: 1,
    description: "Continuously improves the system via the MiFiX Brain.",
    agents: [
      {
        id: "learning",
        title: "Learning Agent",
        subtitle: "System Improver",
        description: "Learns from execution patterns.",
        icon: PsychologyIcon,
        color: "#EC407A",
        gradient: "linear-gradient(135deg, #EC407A 0%, #F48FB1 100%)",
      },
    ],
  },
  configuration: {
    id: "config_group",
    title: "Configuration Agents",
    count: 19,
    description: "Specialists working in parallel to create system components.",
    agents: [
      {
        id: "ui_gen",
        title: "UI Generator",
        description: "Builds interfaces",
        icon: UiGeneratorImage,
        color: "#29B6F6",
      },
      {
        id: "workflow_conf",
        title: "Workflow Configurator",
        description: "Designs flows",
        icon: WorkflowImage,
        color: "#29B6F6",
      },
      {
        id: "validation_agent",
        title: "Validation Agent",
        description: "Checks logic",
        icon: ValidationImage,
        color: "#29B6F6",
      },
      {
        id: "api_integrator",
        title: "API Integrator",
        description: "Connects services",
        icon: ApiIntegratorImage,
        color: "#29B6F6",
      },
      {
        id: "db_architect",
        title: "DB Configurator",
        description: "Models data",
        icon: DbArchitectImage,
        color: "#29B6F6",
      },
      {
        id: "retriever_agent",
        title: "Retriever Agent",
        description: "Fetches Context",
        icon: RetrieverImage,
        color: "#29B6F6",
      },
      {
        id: "scheduler_agent",
        title: "Scheduler Agent",
        description: "Manages Time",
        icon: SchedulerImage,
        color: "#29B6F6",
      },
      {
        id: "action_agent",
        title: "Action Agent",
        description: "Executes Tasks",
        icon: ActionImage,
        color: "#29B6F6",
      },
      {
        id: "comm_agent",
        title: "Communication Agent",
        description: "Handles Messaging",
        icon: CommunicationImage,
        color: "#29B6F6",
      },
      // EXTRA NODE FOR VISUAL COUNT
      {
         id: "more_agents",
         title: "19+ Others",
         description: "Specialized Agents",
         icon: MoreAgentsImage,
         color: "#90CAF9", // Lighter blue to differentiate
      }
      // ... visually represented as "19 Agents"
    ],
  },
  execution: {
    id: "exec_group",
    title: "Execution Agents",
    count: 11,
    description: "Provide real-time AI capabilities as runtime services.",
    agents: [
      {
        id: "ocr",
        title: "OCR Agent",
        description: "Extracts text",
        icon: OcrImage,
        color: "#66BB6A",
      },
      {
        id: "biometrics",
        title: "Biometrics",
        description: "Verifies identity",
        icon: BiometricsImage,
        color: "#66BB6A",
      },
      {
        id: "nlp",
        title: "NLP Agent",
        description: "Processes language",
        icon: NlpImage,
        color: "#66BB6A",
      },
      // ... visually represented as "11 Agents"
    ],
  },
};

// Flattened list for backward compatibility with upload dialog
const AGENT_TYPES = [
  ...AGENT_HIERARCHY.supervisor.agents,
  ...AGENT_HIERARCHY.learning.agents,
  ...AGENT_HIERARCHY.configuration.agents,
  ...AGENT_HIERARCHY.execution.agents,
].map((a) => ({
  ...a,
  gradient:
    a.gradient ||
    `linear-gradient(135deg, ${a.color} 0%, ${alpha(a.color, 0.6)} 100%)`,
  stats: "Active",
}));

// --- Styled Components & Animations ---

const BrainContainer = styled(Box)({
  position: "relative",
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "60px",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "150%",
    height: "150%",
    background:
      "radial-gradient(circle, rgba(0, 229, 255, 0.2) 0%, rgba(0,0,0,0) 70%)",
    zIndex: -1,
    animation: "breathe 4s infinite ease-in-out",
  },
  "@keyframes breathe": {
    "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: 0.5 },
    "50%": { transform: "translate(-50%, -50%) scale(1.1)", opacity: 0.8 },
  },
});

const PulseLine = styled(Box, {
  shouldForwardProp: (prop) =>
    !["vertical", "height", "width", "top", "left", "right", "bottom"].includes(
      prop,
    ),
})(({ vertical, height, width, top, left, right, bottom }) => ({
  position: "absolute",
  background: vertical
    ? "linear-gradient(180deg, rgba(0,229,255,0.1) 0%, #00E5FF 50%, rgba(0,229,255,0.1) 100%)"
    : "linear-gradient(90deg, rgba(0,229,255,0.1) 0%, #00E5FF 50%, rgba(0,229,255,0.1) 100%)",
  backgroundSize: vertical ? "100% 200%" : "200% 100%",
  animation: "pulseFlow 3s linear infinite",
  opacity: 0.6,
  zIndex: 0,
  ...(vertical
    ? {
        width: "2px",
        height: height || "100%",
        top: top,
        left: left || "50%",
        transform: "translateX(-50%)",
      }
    : {
        height: "2px",
        width: width || "100%",
        top: top,
        left: left,
        right: right,
      }),
  "@keyframes pulseFlow": {
    "0%": { backgroundPosition: "0% 0%" },
    "100%": { backgroundPosition: "100% 100%" },
  },
  boxShadow: "0 0 8px rgba(0, 229, 255, 0.4)",
}));

const ConnectionLine = PulseLine; // Alias for backward compatibility if needed locally

const GlowingCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "color",
})(({ theme, color = "#2196F3" }) => ({
  background: "rgba(10, 25, 41, 0.7)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${alpha(color, 0.3)}`,
  borderRadius: "16px",
  padding: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  cursor: "pointer",
  zIndex: 1,
  boxShadow: `0 4px 30px rgba(0, 0, 0, 0.1)`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 20px 40px ${alpha(color, 0.2)}`,
    border: `1px solid ${alpha(color, 0.8)}`,
    "& .glow-effect": {
      opacity: 1,
    },
  },
}));

const EngineBlock = styled(Box)(({ theme }) => ({
  background:
    "linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
  borderRadius: "12px",
  padding: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    background: "linear-gradient(180deg, #2979FF, #00E5FF)",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(41, 121, 255, 0.5)",
    "&::before": { opacity: 1 },
    "& .icon-box": {
      color: "#00E5FF",
      background: "rgba(0, 229, 255, 0.1)",
      transform: "scale(1.1)",
    },
  },
}));

const NeuralNode = styled(Box, {
  shouldForwardProp: (prop) => !["size", "x", "y", "delay"].includes(prop),
})(({ size = 10, x, y, delay = 0 }) => ({
  position: "absolute",
  width: size,
  height: size,
  borderRadius: "50%",
  background: "#00E5FF",
  boxShadow: "0 0 15px #00E5FF",
  top: y,
  left: x,
  opacity: 0.8,
  zIndex: 10,
  animation: `float 3s infinite ease-in-out ${delay}s`,
  "@keyframes float": {
    "0%, 100%": { transform: "translate(0, 0)" },
    "50%": { transform: "translate(0, -5px)" },
  },
}));

const PulseRing = styled(Box, {
  shouldForwardProp: (prop) => !["delay", "color"].includes(prop),
})(({ delay = 0, color = "#2196F3" }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "50%",
  border: `1px solid ${alpha(color, 0.5)}`,
  animation: `pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite ${delay}s`,
  opacity: 0,
  zIndex: 0,
  "@keyframes pulse-ring": {
    "0%": { width: "80%", height: "80%", opacity: 0.5, borderWidth: "2px" },
    "100%": { width: "200%", height: "200%", opacity: 0, borderWidth: "0px" },
  },
}));

// Floating Satellite for Network view
const Satellite = styled(Box)(
  ({ angle, distance = 80, size = 8, color = "#2196F3", speed = 10 }) => ({
    position: "absolute",
    top: "50%",
    left: "50%",
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 ${size * 2}px ${color}`,
    animation: `orbit-${angle} ${speed}s linear infinite`,
    [`@keyframes orbit-${angle}`]: {
      "0%": {
        transform: `rotate(${angle}deg) translateX(${distance}px) rotate(-${angle}deg)`,
      },
      "100%": {
        transform: `rotate(${angle + 360}deg) translateX(${distance}px) rotate(-${angle + 360}deg)`,
      },
    },
  }),
);

// Brain Visualization Component
const MiFiXBrain = () => (
  <BrainContainer>
    <PulseRing delay={0} />
    <PulseRing delay={1} />
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        animation: "float 6s infinite ease-in-out",
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
      }}
    >
      <Box
        component="img"
        src="/Mifix-ai.png"
        alt="MiFiX Brain"
        sx={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          boxShadow: "0 0 50px rgba(33,150,243,0.5)",
          background: "linear-gradient(135deg, #0d1b2a, #1b263b)",
          p: 1,
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      />
      {/* Neural Nodes overlay */}
      <NeuralNode x="10%" y="20%" size={6} delay={0} />
      <NeuralNode x="85%" y="15%" size={8} delay={1} />
      <NeuralNode x="90%" y="80%" size={5} delay={2} />
      <NeuralNode x="15%" y="75%" size={7} delay={0.5} />
    </Box>
  </BrainContainer>
);

const AnimatedCounter = ({ value, duration = 3000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(value) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const incrementTime = Math.max(duration / end, 50);
    let currentCount = 0;
    const timer = setInterval(() => {
      currentCount += 1;
      setCount(currentCount);
      if (currentCount >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

const PistonJoint = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "vertical" && prop !== "color" && prop !== "delay",
})(({ vertical, color }) => ({
  position: "absolute",
  zIndex: 0,
  background: alpha(color, 0.2), // Increased visibility
  overflow: "hidden",
  border: `1px solid ${alpha(color, 0.4)}`, // Brighter border
  // Glass effect for the tube
  backdropFilter: "blur(4px)",
  boxShadow: `inset 0 0 10px ${alpha(color, 0.3)}, 0 0 10px ${alpha(
    color,
    0.2,
  )}`, // Outer glow
  ...(vertical
    ? {
        bottom: "-26px", // Span the gap
        left: "50%",
        width: "16px",
        height: "26px",
        transform: "translateX(-50%)",
        borderTop: "none",
        borderBottom: "none",
      }
    : {
        left: "-26px", // Span the gap
        top: "50%",
        width: "26px",
        height: "16px",
        transform: "translateY(-50%)",
        borderLeft: "none",
        borderRight: "none",
      }),
  "&::after": {
    content: '""',
    position: "absolute",
    // Brighter gradient center
    background: `linear-gradient(${
      vertical ? 180 : 90
    }deg, ${color}, #ffffff, ${color})`,
    // Intensified Glow
    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
    borderRadius: "2px",
    opacity: 1, // Full opacity
    ...(vertical
      ? {
          left: "2px",
          right: "2px",
          height: "40%",
          top: "30%",
          // FASTER ANIMATION (0.9s)
          animation: `pumpV 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate`,
        }
      : {
          top: "2px",
          bottom: "2px",
          width: "40%",
          left: "30%",
          // FASTER ANIMATION (0.9s)
          animation: `pumpH 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate`,
        }),
  },
  "@keyframes pumpH": {
    "0%": { transform: "translateX(-120%) scaleX(0.8)" },
    "100%": { transform: "translateX(120%) scaleX(0.8)" },
  },
  "@keyframes pumpV": {
    "0%": { transform: "translateY(-120%) scaleY(0.8)" },
    "100%": { transform: "translateY(120%) scaleY(0.8)" },
  },
}));

const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pistonPump {
    0% { height: 10%; bottom: 0; opacity: 0.3; filter: blur(2px); }
    50% { height: 90%; bottom: 0; opacity: 1; filter: blur(0px); box-shadow: 0 0 20px currentColor; }
    100% { height: 10%; bottom: 0; opacity: 0.3; filter: blur(2px); }
  }
  @keyframes streamFlow {
    0% { background-position: 0% 50%; opacity: 0.3; }
    50% { opacity: 1; }
    100% { background-position: 100% 50%; opacity: 0.3; }
  }
  @keyframes pulseBlue {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(41, 182, 246, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(41, 182, 246, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(41, 182, 246, 0); }
  }
  @keyframes pulseGreen {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 187, 106, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(102, 187, 106, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 187, 106, 0); }
  }
  @keyframes dropStream {
    0% { top: -50%; opacity: 0; }
    50% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes particleInject {
    0% { transform: rotate(0deg) translateX(150px) scale(0); opacity: 0; }
    20% { opacity: 1; transform: rotate(120deg) translateX(100px) scale(1); }
    100% { transform: rotate(360deg) translateX(0px) scale(0); opacity: 0; }
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
  const [highlightIndex, setHighlightIndex] = useState(0); // For auto-cycling labels
  const theme = useTheme();
  const [knowledgeNodes, setKnowledgeNodes] = useState(0);
  const [collectionCategories, setCollectionCategories] = useState({});

  const [displayCount, setDisplayCount] = useState(0); // Animated counter
  const [ringProgress, setRingProgress] = useState(0); // 0 to 75%
  const [ringHue, setRingHue] = useState(180); // Cyan start
  const [brainPulse, setBrainPulse] = useState(1); // Scale factor

  // Animation Effect for Knowledge Counter and Ring
  useEffect(() => {
    if (knowledgeNodes > 0) {
      let startTimestamp = null;
      const duration = 3500; // Slower, more majestic
      const targetCheck = 76; // Ring fills to ~75%
      
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const rawProgress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Use a high-precision smooth ease for the main ring
        // easeOutQuartic: 1 - pow(1 - t, 4)
        const smooth = 1 - Math.pow(1 - rawProgress, 4);
        
        setDisplayCount(Math.floor(smooth * knowledgeNodes));
        setRingProgress(smooth * targetCheck);
        
        // Strict Blue Palette: Cyan (180) -> Deep Blue (210)
        // No purple.
        setRingHue(180 + (smooth * 30));

        // Gentle "breath" pulse - cleaner logic
        // Scale 1.0 -> 1.08 -> 1.0
        const pulse = rawProgress < 0.5 
            ? 1 + (smooth * 0.16) // Up to ~1.08
            : 1.08 - ((rawProgress - 0.5) * 2 * 0.08); // Down to 1.0
            
        setBrainPulse(pulse);
        
        if (rawProgress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [knowledgeNodes]);

  useEffect(() => {
    setMounted(true);
    // Cycle highlights every 3 seconds
    const interval = setInterval(() => {
      setHighlightIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Detect pathname changes to reset navigation state
  useEffect(() => {
    // If pathname changed and we're navigating, the navigation completed
    if (pathname !== prevPathnameRef.current && isNavigating) {
      console.log("✅ Navigation completed, resetting loader");
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
      console.log("⏱️ Navigation timeout started (3s safety net)");
      timeoutId = setTimeout(() => {
        console.log("⚠️ Navigation timeout reached, forcing reset");
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
      // Fetch from Chroma Explorer Proxy
      const res = await fetch('https://chroma-db-explorer.vercel.app/api/chroma/api/v2/tenants/default_tenant/databases/default_database/collections?host=3.6.132.24&port=8000', {
         headers: {
            'accept': 'application/json, text/plain, */*'
         }
      });
      
      if (!res.ok) {
          console.warn("Chroma API failed");
          setCollections([]);
          setKnowledgeNodes(0);
          return;
      }

      const data = await res.json();
      setCollections(data); 
      setKnowledgeNodes(data.length); 

      // Calculate categories for display
      const categories = {};
      data.forEach(c => {
         let kind = "General";
         if (c.name.includes("query_learning")) kind = "Learning";
         else if (c.name.includes("knowledgerag")) kind = "RAG";
         else if (c.name.includes("onboarding")) kind = "Flows";
         else if (c.name.includes("budhi")) kind = "Agents";
         else if (c.name.includes("rules")) kind = "Rules";
         else if (c.name.includes("communication")) kind = "Comms";
         
         categories[kind] = (categories[kind] || 0) + 1;
      });
      setCollectionCategories(categories);

    } catch (error) {
      console.error("Error loading collections:", error);
      setCollections([]);
      setKnowledgeNodes(0);
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
      (_, index) => index !== indexToRemove,
    );
    setSelectedFiles(updatedFiles);

    // If no files left, go back to select step
    if (updatedFiles.length === 0) {
      setUploadStep("select");
      setPreviewFile(null);
    } else if (previewFile && indexToRemove === 0 && updatedFiles.length > 0) {
      // If we removed the preview file, set a new one if available
      const nextPdfFile = updatedFiles.find(
        (file) => file.type === "application/pdf",
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
        200,
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
          background: "#020617", // Deep Navy Base
        }}
      >
        {/* Cinematic Background Wrapper */}
        <Box sx={{ position: "fixed", inset: 0, zIndex: 0 }}>
          {/* Tech Grid Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
              backgroundSize: "50px 50px",
              opacity: 0.3,
              zIndex: 1,
            }}
          />

          {/* Ambient Blue Glows */}
          <Box
            sx={{
              position: "absolute",
              top: "-10%",
              right: "-10%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle, rgba(41, 121, 255, 0.15) 0%, transparent 70%)",
              filter: "blur(60px)",
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "-10%",
              left: "-10%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 70%)",
              filter: "blur(60px)",
              zIndex: 1,
            }}
          />

          {/* Main Gradient Overlay for Readability */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(2,6,23,0.95) 0%, rgba(10, 25, 41, 0.85) 50%, rgba(2,6,23,0.98) 100%)",
              zIndex: 2,
            }}
          />

          <Box
            component="video"
            autoPlay
            muted
            loop
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4, // Subtle visibility
              filter: "hue-rotate(190deg) saturate(1.2) contrast(1.1)", // Shift to Blue/Cyan
              zIndex: 0,
            }}
          >
            <source
              src="/vecteezy_data-neural-network-ai-technology-cloud-computing-bits_21723025.mp4"
              type="video/mp4"
            />
          </Box>
        </Box>

        <Container
          maxWidth="xl"
          sx={{ position: "relative", zIndex: 10, pb: 12 }}
        >
          {/* Back Button */}
          <Fade in={mounted} timeout={800}>
            <Box sx={{ pt: 4, pb: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/")}
                sx={{
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "30px",
                  px: 3,
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                Back to Command Center
              </Button>
            </Box>
          </Fade>

          {/* SECTION 1: HERO HEADER */}
          <Fade in={mounted} timeout={1000}>

            <Box sx={{ textAlign: "center", mt: 6, mb: 8 }}>
              {/* Header Title Removed */}

              <Box
                sx={{
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 6,
                  background: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 229, 255, 0.2)",
                  boxShadow: "0 0 20px rgba(0, 229, 255, 0.1)",
                  overflow: "hidden",
                }}
              >
                {/* Design Section */}
                <Box
                  sx={{
                    px: 4,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background:
                      "linear-gradient(90deg, rgba(41, 182, 246, 0.1), transparent)",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "54%",
                      background: "rgba(41, 182, 246, 0.2)",
                      color: "#29B6F6",
                    }}
                  >
                    <BuildIcon fontSize="small" />
                  </Box>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      CONFIGURE
                    </Typography>
                    <Typography
                      sx={{
                        color: "#29B6F6",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      WITH 32 INTELLIGENT AGENTS
                    </Typography>
                  </Box>
                </Box>

                {/* Arrow Indicator */}
                <Box sx={{ px: 1, color: "rgba(255,255,255,0.3)" }}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Box>

                {/* Deliver Section */}
                <Box
                  sx={{
                    px: 4,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background:
                      "linear-gradient(270deg, rgba(102, 187, 106, 0.1), transparent)",
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      background: "rgba(102, 187, 106, 0.2)",
                      color: "#66BB6A",
                    }}
                  >
                    <RocketIcon fontSize="small" />
                  </Box>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      DELIVER
                    </Typography>
                    <Typography
                      sx={{
                        color: "#66BB6A",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      VIA 12 ROBUST ENGINES
                    </Typography>
                  </Box>
                </Box>

                {/* Bottom Connection Socket */}
                <Box sx={{
                    position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                    width: "40px", height: "4px",
                    background: "#00E5FF",
                    boxShadow: "0 0 10px #00E5FF"
                }} />
              </Box>
            </Box>
          </Fade>

          {/* SECTION 3: THE STUDIO (Architects) */}
          <Fade in={mounted} timeout={1500}>
            <Box sx={{ mb: 16, position: "relative" }}>
              {/* Top Connector (Toggle -> Brain) */}
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: "-48px", // Connects to the socket above
                  height: "48px",
                  width: "2px",
                  background: "rgba(255, 255, 255, 0.1)",
                  overflow: "hidden"
                }}
              >
                  <Box sx={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                      background: "linear-gradient(180deg, #00E5FF, transparent)",
                      animation: "dropStream 1.5s infinite linear"
                  }} />
              </Box>

                  {/* THE INTELLIGENCE CORE: BRAIN (TOP) */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 0,
                    mt: -10, // Pull up to reduce gap
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#00E5FF",
                      letterSpacing: "0.4em",
                      fontWeight: 700,
                      mb: 5, // Reduced margin
                      textTransform: "uppercase",
                      fontSize: "0.8rem",
                      textShadow: "0 0 20px rgba(0, 229, 255, 0.5)",
                    }}
                  >
                    The Intelligence Core
                  </Typography>

                  {/* NEURAL REACTOR CORE */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "260px",
                      height: "260px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Rotating Tech Rings (CSS) */}
                    {/* Rotating Tech Rings (CSS) */}
                    <Box sx={{
                        position: "absolute", inset: -20, border: "1px dashed rgba(0, 229, 255, 0.3)", borderRadius: "50%",
                        animation: "spin 20s linear infinite"
                    }} />
                    
                    {/* Knowledge Replenishment Ring (Fills up) */}
                    {/* Knowledge Replenishment Ring (Animated Fill) */}
                    {/* Knowledge Replenishment Ring (Animated Fill + Hue Shift) */}
                    <Box sx={{
                        position: "absolute", inset: -14, 
                        borderRadius: "50%",
                        // Strictly Blue Gradient: Cyan to Blue
                        background: `conic-gradient(from 0deg, hsl(${ringHue}, 100%, 50%) ${ringProgress}%, transparent ${ringProgress}%)`,
                        mask: "radial-gradient(transparent 64%, black 65%)",
                        WebkitMask: "radial-gradient(transparent 64%, black 65%)",
                        boxShadow: `0 0 ${ringProgress}px hsl(${ringHue}, 100%, 50%)`, // Glow grows with progress
                        transition: "all 0.05s linear",
                    }} />

                    {/* Leading Edge Spark */}
                    <Box sx={{
                        position: "absolute",
                        top: 0, left: "50%", bottom: 0, width: "2px",
                        transform: `rotate(${ringProgress * 3.6}deg)`,
                        transformOrigin: "bottom center",
                        height: "50%",
                        zIndex: 5,
                        opacity: ringProgress > 0 ? 1 : 0,
                    }}>
                        <Box sx={{
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: "#fff",
                            boxShadow: `0 0 15px #fff, 0 0 30px hsl(${ringHue}, 100%, 50%)`,
                            position: "absolute", top: -4, left: -3
                        }} />
                    </Box>

                    {/* Incoming Knowledge Particles */}
                    {[...Array(6)].map((_, i) => (
                        <Box key={i} sx={{
                            position: "absolute",
                            width: "4px", height: "4px", background: "#fff",
                            borderRadius: "50%",
                            boxShadow: "0 0 8px white",
                            top: "50%", left: "50%",
                            animation: `particleInject 2s infinite ease-in`,
                            animationDelay: `${i * 0.3}s`,
                            transformOrigin: `${140 + Math.random() * 40}px 0` // Orbit radius
                        }} />
                    ))}

                    <Box sx={{
                        position: "absolute", inset: -10, border: "1px solid rgba(0, 229, 255, 0.1)", borderRadius: "50%",
                        borderLeftColor: "#00E5FF", borderRightColor: "#00E5FF",
                        animation: "spin 15s linear infinite reverse"
                    }} />

                    {/* LIVE KNOWLEDGE COUNTER (Floating UI) */}
                    <Box sx={{
                        position: "absolute",
                        top: "20%", right: -240,
                        display: "flex", alignItems: "center",
                        "@media (max-width: 900px)": { display: "none" } // Hide on small screens
                    }}>
                        {/* Connecting Line to Brain */}
                        <Box sx={{ 
                            width: "80px", height: "1px", 
                            background: "linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5))", 
                            mr: 2 
                        }} />
                        
                        <Box sx={{ textAlign: "left" }}>
                             <Typography variant="caption" sx={{ 
                                 color: "#94a3b8", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", 
                                 display: "flex", alignItems: "center", mb: 0.5
                             }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5FF", mr: 1, boxShadow: "0 0 5px #00E5FF" }} />
                                Active Knowledge Bases
                             </Typography>
                             <Typography sx={{ 
                                 fontFamily: "monospace", 
                                 fontSize: "2rem", 
                                 fontWeight: 700, 
                                 color: "#fff",
                                 textShadow: "0 0 15px rgba(0, 229, 255, 0.4)",
                                 lineHeight: 1
                             }}>
                                 {displayCount.toLocaleString()}
                             </Typography>
                             <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap", maxWidth: "200px" }}>
                                {Object.entries(collectionCategories).slice(0, 4).map(([name, count]) => (
                                    <Box key={name} sx={{ 
                                        px: 0.8, py: 0.2, borderRadius: "4px", 
                                        background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.2)",
                                        fontSize: "0.55rem", color: "#00E5FF"
                                    }}>
                                        {name}: {count}
                                    </Box>
                                ))}
                             </Box>
                         </Box>
                    </Box>

                    {/* Main Video Container */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        boxShadow: "0 0 50px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0,0,0,0.8)",
                        border: "1px solid rgba(0, 229, 255, 0.5)",
                        background: "#000",
                        position: "relative",
                        zIndex: 2
                      }}
                    >
                      <Box
                        component="video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        src="/MiFix-Brain.mp4"
                        onTimeUpdate={(e) => {
                          if (e.target.currentTime >= 4) {
                            e.target.currentTime = 0;
                          }
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scale(1.2)",
                          opacity: 0.9
                        }}
                      />
                      {/* Scanline Overlay */}
                      <Box sx={{
                          position: "absolute", inset: 0, 
                          background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0, 229, 255, 0.1) 50%)",
                          backgroundSize: "100% 4px",
                          pointerEvents: "none"
                      }} />
                    </Box>

                    {/* Connecting Nodes (Decorative) */}
                    <Box sx={{ position: "absolute", bottom: -10, width: "2px", height: "20px", background: "#00E5FF" }} />
                  </Box>

                  {/* JIGSAW CONNECTION SPINE */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 11 }}>
                      
                      {/* 1. Upper Spine (Brain to Text) */}
                      <Box sx={{ width: "2px", height: "60px", background: "rgba(255, 255, 255, 0.1)", position: "relative", overflow: "hidden" }}>
                           <Box sx={{
                              position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                              background: "linear-gradient(180deg, transparent, #00E5FF, transparent)",
                              animation: "dropStream 1.5s infinite linear"
                          }} />
                      </Box>

                      {/* 2. Integrated Text Node */}
                      <Box sx={{ 
                          textAlign: "center", 
                          backdropFilter: "blur(12px)",
                          background: "rgba(10, 15, 30, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          px: 4, py: 1.5,
                          boxShadow: "0 0 30px rgba(0,0,0,0.5)",
                          display: "flex", flexDirection: "column", alignItems: "center",
                          position: "relative"
                      }}>
                          {/* Node Connectors */}
                          <Box sx={{ position: "absolute", top: -4, width: 8, height: 8, borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 10px #00E5FF" }} />
                          
                          <Typography
                            variant="h4"
                            sx={{
                              color: "white",
                              fontWeight: 800,
                              fontSize: "1.8rem",
                              letterSpacing: "-0.01em",
                              textShadow: "0 0 20px rgba(0, 229, 255, 0.5)",
                              lineHeight: 1
                            }}
                          >
                            MiFiX.ai Brain
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#94a3b8",
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                              fontSize: "0.65rem",
                              mt: 0.5,
                              fontWeight: 600
                            }}
                          >
                            Self-Evolving Knowledge Base
                          </Typography>

                          <Box sx={{ position: "absolute", bottom: -4, width: 8, height: 8, borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 10px #00E5FF" }} />
                      </Box>

                      {/* 3. Lower Spine (Text to Supervisor) */}
                      <Box sx={{ width: "2px", height: "50px", background: "rgba(255, 255, 255, 0.1)", position: "relative", overflow: "hidden" }}>
                           <Box sx={{
                              position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                              background: "linear-gradient(180deg, transparent, #00E5FF, transparent)",
                              animation: "dropStream 1.5s infinite linear",
                              animationDelay: "0.5s" 
                          }} />
                      </Box>

                  </Box>
                </Box>

              {/* LEVEL 1: SUPERVISOR */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 8,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  
                  {/* SUPERVISOR CARD - PREMIUM GLASS */}
                  <Box
                    onClick={() =>
                      handleAgentSelect(AGENT_HIERARCHY.supervisor.agents[0])
                    }
                    sx={{
                      width: "340px",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { transform: "translateY(-5px)", boxShadow: "0 20px 40px -10px rgba(255, 167, 38, 0.2)" },
                    }}
                  >
                     {/* Top Signal Receiver Port */}
                     <Box sx={{
                         width: "40px", height: "4px", background: "#FFA726",
                         mx: "auto", mb: "2px",
                         boxShadow: "0 0 10px #FFA726"
                     }} />

                     {/* Glass Body */}
                     <Paper
                       elevation={0}
                       sx={{
                           p: 3,
                           background: "rgba(10, 25, 41, 0.7)",
                           backdropFilter: "blur(16px)",
                           border: "1px solid rgba(255, 255, 255, 0.08)",
                           borderRadius: "16px",
                           display: "flex",
                           alignItems: "center",
                           boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                           position: "relative",
                           overflow: "hidden"
                       }}
                     >
                        {/* Glow Accent */}
                        <Box sx={{
                            position: "absolute", top: 0, left: 0, width: "4px", height: "100%",
                            background: "#FFA726",
                            boxShadow: "0 0 15px #FFA726"
                        }} />

                        {/* Avatar */}
                        <Box
                          sx={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, rgba(255, 167, 38, 0.1), rgba(255, 167, 38, 0.05))",
                            border: "1px solid rgba(255, 167, 38, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2.5
                          }}
                        >
                          <Box component="img" src="/supervisory.png" alt="Supervisor" sx={{ width: "80%", height: "80%", objectFit: "contain" }} />
                        </Box>

                        {/* Text Info */}
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                                Supervisory Agent
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                                SYSTEM ORCHESTRATOR
                            </Typography>
                            
                            {/* Live Badge */}
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", mr: 1, boxShadow: "0 0 6px #10B981" }} />
                                <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em" }}>
                                    ONLINE
                                </Typography>
                            </Box>
                        </Box>
                     </Paper>
                  </Box>

                  {/* Connection Point DOT (Bottom) */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "-4px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "6px",
                      height: "6px",
                      background: "#FFA726",
                      borderRadius: "50%",
                      boxShadow: "0 0 10px #FFA726",
                      zIndex: 3,
                    }}
                  />
                  {/* SVG CONNECTIONS & FEEDBACK LOOPS */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 4px)", // Starts exactly at the bottom dot
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "100vw",
                      maxWidth: "1600px",
                      height: "400px",
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 1600 400"
                      preserveAspectRatio="xMidYMin slice"
                      style={{ overflow: "visible" }}
                      shapeRendering="geometricPrecision"
                    >
                      <defs>
                        <linearGradient
                          id="downstreamGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#FFA726" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#29B6F6" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient
                          id="upstreamGrad"
                          x1="0"
                          y1="1"
                          x2="0"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#F06292" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>

                      {/* 1. Downstream Flows (Supervisor -> Agents) */}
                      {/* Left Path */}
                      <path
                        d="M 800 0 C 800 60, 400 60, 400 120"
                        stroke="url(#downstreamGrad)"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.8"
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* Right Path */}
                      <path
                        d="M 800 0 C 800 60, 1200 60, 1200 120"
                        stroke="url(#downstreamGrad)"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.8"
                        vectorEffect="non-scaling-stroke"
                      />

                      {/* 2. Downstream Particles */}
                      <circle r="3" fill="#FFA726">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path="M 800 0 C 800 60, 400 60, 400 120"
                          keyPoints="0;1"
                          keyTimes="0;1"
                          calcMode="linear"
                        />
                      </circle>
                      <circle r="3" fill="#FFA726">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path="M 800 0 C 800 60, 1200 60, 1200 120"
                          keyPoints="0;1"
                          keyTimes="0;1"
                          calcMode="linear"
                        />
                      </circle>

                      {/* 3. FEEDBACK LOOPS (Agents -> Brain) */}
                      {/* Left Return Loop */}
                      <path
                        d="M 400 120 C 300 200, 100 0, 800 -120"
                        stroke="url(#upstreamGrad)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        fill="none"
                        opacity="0.3"
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* Right Return Loop */}
                      <path
                        d="M 1200 120 C 1300 200, 1500 0, 800 -120"
                        stroke="url(#upstreamGrad)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        fill="none"
                        opacity="0.3"
                        vectorEffect="non-scaling-stroke"
                      />

                      {/* 4. Feedback Particles */}
                      <circle r="2" fill="#F06292">
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          path="M 400 120 C 300 200, 100 0, 800 -120"
                        />
                      </circle>
                      <circle r="2" fill="#F06292">
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          path="M 1200 120 C 1300 200, 1500 0, 800 -120"
                        />
                      </circle>
                    </svg>
                  </Box>
                </Box>
              </Box>

              {/* LEVEL 2: NETWORK CLUSTERS */}
              {/* LEVEL 2: NETWORK CLUSTERS */}
              {/* LEVEL 2: NETWORK CLUSTERS */}
              {/* LEVEL 2: NETWORK CLUSTERS */}
              {/* LEVEL 2: NETWORK CLUSTERS */}
              <Box
                sx={{
                  position: "relative",
                  pt: 10,
                  pb: 10,
                  "@keyframes popIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translate(-50%, -50%) scale(0)",
                    },
                    "80%": { transform: "translate(-50%, -50%) scale(1.1)" },
                    "100%": {
                      opacity: 1,
                      transform: "translate(-50%, -50%) scale(1)",
                    },
                  },
                }}
              >
                <Grid
                  container
                  spacing={4}
                  alignItems="flex-start"
                  justifyContent="center"
                >
                  {/* CONFIGURATION CLOUD (Left Side) - ROW LAYOUT for Header */}
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        height: "600px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        position: "relative",
                        pr: 2,
                      }}
                    >
                      {/* HEADER MOVED TO BOTTOM LEFT TO AVOID OVERLAP */}
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#29B6F6",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          position: "absolute",
                          bottom: "40px",
                          left: "20px",
                          width: "200px",
                          textAlign: "left",
                          zIndex: 10,
                          mb:-9,
                        }}
                      >
                        Configuration Agents
                      </Typography>

                      <Box
                        sx={{
                          position: "relative",
                          width: "500px",
                          height: "600px",
                        }}
                      >
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 500 600"
                          style={{
                            position: "absolute",
                            inset: 0,
                            overflow: "visible",
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="configGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#FFA726"
                                stopOpacity="0.8"
                              />
                              <stop
                                offset="100%"
                                stopColor="#29B6F6"
                                stopOpacity="0.4"
                              />
                            </linearGradient>
                          </defs>

                          {/* HUB - Shifted Right to 320 to reduce middle gap */}
                          {/* MASTER TRUNK: Matches new Hub at 320 */}
                          <path
                            d="M 600 -380 C 500 -100, 320 50, 320 250"
                            stroke="url(#configGrad)"
                            strokeWidth="4"
                            fill="none"
                            opacity="0.7"
                            strokeLinecap="round"
                          />
                          <circle r="6" fill="#FFA726" cx="600" cy="-380">
                            <animate
                              attributeName="r"
                              values="6;8;6"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle r="4" fill="#29B6F6">
                            <animateMotion
                              dur="3s"
                              repeatCount="indefinite"
                              path="M 600 -380 C 500 -100, 420 50, 420 250"
                            />
                          </circle>

                          {/* HUB at 320, 250 */}
                          <circle
                            cx="320"
                            cy="250"
                            r="8"
                            fill="#29B6F6"
                            opacity="0.5"
                          >
                            <animate
                              attributeName="r"
                              values="8;12;8"
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* BRANCHES */}
                          {AGENT_HIERARCHY.configuration.agents.map(
                            (agent, i) => {
                              // Spread spread LEFT (100 to 260 degrees) - STAGGERED
                              const total =
                                AGENT_HIERARCHY.configuration.agents.length;
                              const spread = 150 * (Math.PI / 180);
                              const start = 105 * (Math.PI / 180);
                              const step = total > 1 ? spread / (total - 1) : 0;
                              const angle = start + step * i;
                              // SYNCED WITH NODES
                              const radius = 180 + 90 * (i % 2); 
                              const cx = 320; 
                              const cy = 250;
                              const x = cx + Math.cos(angle) * radius * 1.6; // Wider spread matched
                              const y = cy + Math.sin(angle) * radius * 1.0;

                              return (
                                <g key={i}>
                                  <path
                                    d={`M 320 250 Q ${(320 + x) / 2} ${(250 + y) / 2 + 20}, ${x} ${y}`}
                                    stroke="url(#configGrad)"
                                    strokeWidth="1.5"
                                    fill="none"
                                    opacity="0.5"
                                  />
                                  <circle r="2" fill="#29B6F6">
                                    <animateMotion
                                      dur={`${2 + (i % 3)}s`}
                                      repeatCount="indefinite"
                                      path={`M 320 250 Q ${(320 + x) / 2} ${(250 + y) / 2 + 20}, ${x} ${y}`}
                                    />
                                  </circle>
                                </g>
                              );
                            },
                          )}
                        </svg>

                        {AGENT_HIERARCHY.configuration.agents.map(
                          (agent, i) => {
                            // Spread spread LEFT (100 to 260 degrees) - STAGGERED
                            const total =
                              AGENT_HIERARCHY.configuration.agents.length;
                            // Select random-ish non-adjacent agents to avoid label overlap
                            const activeIdx = highlightIndex % total;
                            const isActive = [
                              activeIdx,
                              (activeIdx + Math.floor(total / 3)) % total,
                              (activeIdx + Math.floor((2 * total) / 3)) % total,
                            ].includes(i);

                            const spread = 150 * (Math.PI / 180);
                            const start = 105 * (Math.PI / 180);
                            const step = total > 1 ? spread / (total - 1) : 0;
                            const angle = start + step * i;
                            // Increased spacing radius to separate agents further
                            const radius = 180 + 90 * (i % 2); // Ring 1: 180, Ring 2: 270
                            const cx = 320; // New Hub X
                            const cy = 250;
                            const x = cx + Math.cos(angle) * radius * 1.6; // Wider spread
                            const y = cy + Math.sin(angle) * radius * 1.0;

                            const xP = (x / 500) * 100;
                            const yP = (y / 600) * 100;

                            return (
                              <Box
                                key={agent.id}
                                onClick={() => handleAgentSelect(agent)}
                                sx={{
                                  position: "absolute",
                                  left: `${xP}%`,
                                  top: `${yP}%`,
                                  transform: "translate(-50%, -50%)",
                                  display: "flex",
                                  flexDirection: "column", // STACK VERTICALLY
                                  alignItems: "center",
                                  zIndex: isActive ? 50 : 20, // High Z for active
                                  cursor: "pointer",
                                  animation: `popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards`,
                                  animationDelay: `${i * 0.1}s`,
                                  "&:hover .bubble": {
                                    transform: "scale(1.2)",
                                    bgcolor: "#29B6F6",
                                    color: "black",
                                    boxShadow: "0 0 20px #29B6F6",
                                  },
                                  "&:hover .label": {
                                    opacity: 1,
                                    transform: "translate(-50%, 0)",
                                    color: "white",
                                    textShadow: "0 0 10px #29B6F6",
                                    borderColor: "#29B6F6",
                                  },

                                  // ACTIVE STATE
                                  "& .bubble": isActive
                                    ? {
                                        animation: "pulseBlue 2s infinite",
                                      }
                                    : {},
                                  "& .label": {
                                    opacity: isActive ? 1 : 0,
                                    transform: isActive
                                      ? "translate(-50%, 0)"
                                      : "translate(-50%, -10px)",
                                    transition: "all 0.5s ease",
                                    pointerEvents: "none", // Prevent tooltip hovering issues
                                  },
                                }}
                              >
                                <Box
                                  className="bubble"
                                  sx={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    overflow: "hidden", // CLIP IMAGES
                                    background: "rgba(10, 25, 41, 0.95)",
                                    border: "1px solid #29B6F6",
                                    boxShadow:
                                      "0 0 15px rgba(41, 182, 246, 0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#29B6F6",
                                    transition: "all 0.3s ease",
                                    position: "relative",
                                    zIndex: 2,
                                  }}
                                >
                                  <agent.icon sx={{ fontSize: 28 }} />
                                </Box>
                                <Typography
                                  className="label"
                                  variant="caption"
                                  sx={{
                                    position: "absolute",
                                    top: "65px", // FLOAT BELOW
                                    left: "50%",
                                    transform: "translate(-50%, -10px)", // Start offset
                                    width: "max-content", // ADAPT TO TEXT
                                    maxWidth: "140px",
                                    color: "#e2e8f0",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    textAlign: "center",
                                    lineHeight: 1.2,
                                    background: "rgba(15, 23, 42, 0.9)",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    border: "1px solid rgba(41, 182, 246, 0.3)",
                                    backdropFilter: "blur(4px)",
                                    zIndex: 1,
                                  }}
                                >
                                  {agent.title.replace(" Agent", "")}
                                </Typography>
                              </Box>
                            );
                          },
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* EXECUTION GRID (Right Side) - ROW LAYOUT for Header */}
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        height: "600px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        position: "relative",
                        pl: 2,
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "500px",
                          height: "600px",
                        }}
                      >
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 500 600"
                          style={{
                            position: "absolute",
                            inset: 0,
                            overflow: "visible",
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="execGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#FFA726"
                                stopOpacity="0.8"
                              />
                              <stop
                                offset="100%"
                                stopColor="#66BB6A"
                                stopOpacity="0.4"
                              />
                            </linearGradient>
                          </defs>

                          {/* HUB - Shifted Left to 180 to reduce middle gap */}
                          {/* MASTER TRUNK: Matches new Hub at 180 */}
                          <path
                            d="M -100 -380 C 0 -100, 180 50, 180 250"
                            stroke="url(#execGrad)"
                            strokeWidth="4"
                            fill="none"
                            opacity="0.7"
                            strokeLinecap="round"
                          />
                          <circle r="6" fill="#FFA726" cx="-100" cy="-380">
                            <animate
                              attributeName="r"
                              values="6;8;6"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle r="4" fill="#66BB6A">
                            <animateMotion
                              dur="3s"
                              delay="1s"
                              repeatCount="indefinite"
                              path="M -100 -380 C 0 -100, 180 50, 180 250"
                            />
                          </circle>

                          {/* HUB at 180, 250 */}
                          <circle
                            cx="180"
                            cy="250"
                            r="8"
                            fill="#66BB6A"
                            opacity="0.5"
                          >
                            <animate
                              attributeName="r"
                              values="8;12;8"
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* BRANCHES */}
                          {AGENT_HIERARCHY.execution.agents.map((agent, i) => {
                            // Spread spread RIGHT (-80 to 80 degrees) - STAGGERED
                            const total =
                              AGENT_HIERARCHY.execution.agents.length;
                            const spread = 150 * (Math.PI / 180);
                            const start = -75 * (Math.PI / 180);
                            const step = total > 1 ? spread / (total - 1) : 0;
                            const angle = start + step * i;
                            // SYNCED WITH NODES
                            const radius = 180 + 90 * (i % 2); 
                            const cx = 180; 
                            const cy = 250;
                            const x = cx + Math.cos(angle) * radius * 1.6; // Wider spread matched
                            const y = cy + Math.sin(angle) * radius * 1.0;

                            return (
                              <g key={i}>
                                <path
                                  d={`M 180 250 Q ${(180 + x) / 2} ${(250 + y) / 2 + 20}, ${x} ${y}`}
                                  stroke="url(#execGrad)"
                                  strokeWidth="1.5"
                                  fill="none"
                                  opacity="0.5"
                                />
                                <circle r="2" fill="#66BB6A">
                                  <animateMotion
                                    dur={`${2.5 + (i % 3)}s`}
                                    repeatCount="indefinite"
                                    path={`M 180 250 Q ${(180 + x) / 2} ${(250 + y) / 2 + 20}, ${x} ${y}`}
                                  />
                                </circle>
                              </g>
                            );
                          })}
                        </svg>

                        {AGENT_HIERARCHY.execution.agents.map((agent, i) => {
                          // Spread spread RIGHT (-80 to 80 degrees) - STAGGERED
                          const total = AGENT_HIERARCHY.execution.agents.length;
                          // Non-adjacent active selection
                          const activeIdx = highlightIndex % total;
                          const isActive = [
                            activeIdx,
                            (activeIdx + Math.floor(total / 3)) % total,
                            (activeIdx + Math.floor((2 * total) / 3)) % total,
                          ].includes(i);

                          const spread = 150 * (Math.PI / 180);
                          const start = -75 * (Math.PI / 180);
                          const step = total > 1 ? spread / (total - 1) : 0;
                          const angle = start + step * i;
                          // Increased spacing
                          const radius = 180 + 90 * (i % 2); 
                          const cx = 180; // New Hub X
                          const cy = 250;
                          const x = cx + Math.cos(angle) * radius * 1.6; // Wider spread
                          const y = cy + Math.sin(angle) * radius * 1.0;

                          const xP = (x / 500) * 100;
                          const yP = (y / 600) * 100;

                          return (
                            <Box
                              key={agent.id}
                              onClick={() => handleAgentSelect(agent)}
                              sx={{
                                position: "absolute",
                                left: `${xP}%`,
                                top: `${yP}%`,
                                transform: "translate(-50%, -50%)",
                                display: "flex",
                                flexDirection: "column", // STACK VERTICALLY
                                alignItems: "center",
                                zIndex: isActive ? 50 : 20, // High Z
                                cursor: "pointer",
                                animation: `popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards`,
                                animationDelay: `${i * 0.1 + 0.5}s`,
                                "&:hover .box": {
                                  transform: "scale(1.2)",
                                  bgcolor: "#66BB6A",
                                  color: "black",
                                  boxShadow: "0 0 20px #66BB6A",
                                },
                                "&:hover .label": {
                                  opacity: 1,
                                  transform: "translate(-50%, 0)",
                                  color: "white",
                                },

                                // ACTIVE STATE
                                "& .box": isActive
                                  ? {
                                      animation: "pulseGreen 2s infinite",
                                    }
                                  : {},
                                "& .label": {
                                  opacity: isActive ? 1 : 0,
                                  transform: isActive
                                    ? "translate(-50%, 0)"
                                    : "translate(-50%, -10px)",
                                  transition: "all 0.5s ease",
                                  pointerEvents: "none",
                                },
                              }}
                            >
                              <Box
                                className="box"
                                sx={{
                                  width: "56px",
                                  height: "56px",
                                  borderRadius: "50%",
                                  overflow: "hidden", // CLIP IMAGES
                                  background: "rgba(10, 25, 41, 0.95)",
                                  border: "1px solid #66BB6A",
                                  boxShadow:
                                    "0 0 15px rgba(102, 187, 106, 0.3)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#66BB6A",
                                  transition: "all 0.2s ease",
                                  position: "relative",
                                  zIndex: 2,
                                }}
                              >
                                <agent.icon sx={{ fontSize: 28 }} />
                              </Box>
                              <Typography
                                className="label"
                                variant="caption"
                                sx={{
                                  position: "absolute",
                                  top: "65px", // FLOAT BELOW
                                  left: "50%",
                                  transform: "translate(-50%, -10px)", // Start offset
                                  width: "max-content", // ADAPT TO TEXT
                                  maxWidth: "140px",
                                  color: "#e2e8f0",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                  background: "rgba(15, 23, 42, 0.9)",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  border: "1px solid rgba(102, 187, 106, 0.3)",
                                  zIndex: 1,
                                }}
                              >
                                {agent.title.replace(" Engine", "")}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* HEADER MOVED TO BOTTOM RIGHT TO AVOID OVERLAP */}
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#66BB6A",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          position: "absolute",
                          bottom: "40px",
                          right: "40px",
                          width: "180px",
                          textAlign: "right",
                          zIndex: 10,
                          mb:-9,
                        }}
                      >
                        Execution Agents
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* <Box
                sx={{
                  position: "absolute",
                  bottom: "-100px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <ConnectionLine vertical height="100px" />
              </Box> */}
            </Box>
          </Fade>

          {/* CONNECTING DATA STREAMS: AGENTS -> ENGINES */}
          <Fade in={mounted} timeout={1700}>
            <Box
              sx={{
                position: "relative",
                height: "180px",
                width: "100%",
                overflow: "hidden",
                mt: -10, // Pull up to overlap with agents
                mb: -2, // Pull down to overlap with engines title
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 180"
                preserveAspectRatio="none"
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="streamGradLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#29B6F6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#29B6F6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#29B6F6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="streamGradRight"
                    x1="1"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#66BB6A" stopOpacity="0" />
                    <stop offset="50%" stopColor="#66BB6A" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#66BB6A" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Left Stream (from Config Agents) */}
                <path
                  d="M 360 0 C 360 80, 680 80, 720 180"
                  stroke="url(#streamGradLeft)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.8"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    from="0, 1000"
                    to="1000, 0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;0.8;0.4"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Secondary Left Stream */}
                <path
                  d="M 420 10 C 420 90, 700 90, 720 180"
                  stroke="url(#streamGradLeft)"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.4"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    from="0, 800"
                    to="800, 0"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Right Stream (from Execution Agents) */}
                <path
                  d="M 1080 0 C 1080 80, 760 80, 720 180"
                  stroke="url(#streamGradRight)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.8"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    from="0, 1000"
                    to="1000, 0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;0.8;0.4"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Secondary Right Stream */}
                <path
                  d="M 1020 10 C 1020 90, 740 90, 720 180"
                  stroke="url(#streamGradRight)"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.4"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    from="0, 800"
                    to="800, 0"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Central Gathering Point (Pulse) */}
                <circle cx="720" cy="180" r="0">
                  <animate
                    attributeName="r"
                    values="0;40;0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill"
                    values="#29B6F6;#66BB6A"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Data Packets flowing down */}
                <circle r="4" fill="#fff">
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path="M 360 0 C 360 80, 680 80, 720 180"
                  />
                </circle>
                <circle r="4" fill="#fff">
                  <animateMotion
                    dur="1.5s"
                    begin="0.75s"
                    repeatCount="indefinite"
                    path="M 1080 0 C 1080 80, 760 80, 720 180"
                  />
                </circle>
              </svg>
            </Box>
          </Fade>

          {/* SECTION 4: THE BUILDERS (Engines) */}
          <Fade in={mounted} timeout={1800}>
            <Box sx={{ mb: 16, position: "relative" }}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                Execution Engines
              </Typography>
              <Typography
                variant="h6"
                sx={{ textAlign: "center", color: "#64748b", mb: 8 }}
              >
                12 Deterministic Engines Powering the Solution
              </Typography>

              {/* UNIFIED ENGINE CORE LAYOUT */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  maxWidth: "1400px",
                  mx: "auto",
                  gap: 3,
                  position: "relative",
                  p: 4,
                  // GLOBAL PERSPECTIVE
                  perspective: "1000px"
                }}
              >
                 {/* 1. GLOBAL BACKGROUND MACHINE (The "Wow" Factor) */}
                 <Box sx={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.1 }}>
                     {/* Massive Central Gear */}
                     <SettingsIcon sx={{
                         position: "absolute", top: "50%", left: "50%", 
                         fontSize: "800px", color: "#64748b",
                         transform: "translate(-50%, -50%)",
                         animation: "spin 60s linear infinite"
                     }} />
                     {/* Secondary Interlocking Gears */}
                     <GearIcon sx={{
                         position: "absolute", top: "10%", right: "10%", 
                         fontSize: "400px", color: "#475569",
                         animation: "spin 40s linear infinite reverse"
                     }} />
                     <SettingsIcon sx={{
                         position: "absolute", bottom: "10%", left: "10%", 
                         fontSize: "500px", color: "#475569",
                         animation: "spin 50s linear infinite reverse"
                     }} />
                 </Box>

                 {/* Connection cables layer */}
                 <Box sx={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                      {/* Main Power Rail */}
                      <Box sx={{
                          position: "absolute", top: "50%", left: "2%", right: "2%", height: "4px",
                          background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
                          boxShadow: "0 0 20px rgba(0,229,255,0.1)",
                          borderRadius: "4px"
                      }} />
                 </Box>

                {DETERMINISTIC_ENGINES.map((engine, index) => (
                  <Grow
                    in={mounted}
                    timeout={1500 + index * 100}
                    key={engine.id}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        width: "300px",
                        height: "160px",
                        position: "relative",
                        overflow: "visible", // For glow effects
                        borderRadius: "16px",
                        // SLEEK GLASSMORPHISM
                        background: `linear-gradient(145deg, ${alpha(
                          engine.color,
                          0.1,
                        )} 0%, rgba(15, 23, 42, 0.8) 100%)`,
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        zIndex: 1,

                        "&:hover": {
                          transform: "translateY(-8px) scale(1.02)",
                          border: `1px solid ${alpha(engine.color, 0.6)}`,
                          boxShadow: `0 20px 40px -10px ${alpha(
                            engine.color,
                            0.3,
                          )}`,
                          zIndex: 10,
                          "& .maglev-piston": {
                            boxShadow: `0 0 20px ${engine.color}`,
                          },
                        },
                      }}
                    >
                      {/* CONNECTING PISTONS (Horizontal) */}
                      {index % 4 !== 0 && (
                        <PistonJoint
                          color={engine.color}
                          delay={index * 0.2}
                        />
                      )}

                      {/* CONNECTING PISTONS (Vertical) - Linking rows */}
                      {index < 8 && (
                        <PistonJoint
                          vertical
                          color={engine.color}
                          delay={index * 0.3}
                        />
                      )}

                      {/* Connection Nodes (Visual Anchors) */}
                      {index % 4 !== 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: -4,
                            top: "calc(50% - 4px)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#1e293b",
                            border: `2px solid ${engine.color}`,
                            boxShadow: `0 0 10px ${engine.color}`,
                            zIndex: 2,
                          }}
                        />
                      )}
                      {index < 8 && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -4,
                            left: "calc(50% - 4px)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#1e293b",
                            border: `2px solid ${engine.color}`,
                            boxShadow: `0 0 10px ${engine.color}`,
                            zIndex: 2,
                          }}
                        />
                      )}

                      {/* LEFT: INFO & STATUS */}
                      <Box
                        sx={{
                          flex: 1,
                          p: 3,
                          display: "flex",
                          flexDirection: "column",
                          zIndex: 2,
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <engine.icon
                            sx={{
                              color: engine.color,
                              fontSize: 32,
                              filter: `drop-shadow(0 0 10px ${engine.color})`,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "white",
                            fontSize: "1.1rem",
                            mb: 1,
                            letterSpacing: 0.5,
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            textTransform: "uppercase",
                          }}
                        >
                          {engine.title
                            .replace(" Engine", "")
                            .replace(" Orchestrator", "")}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "#cbd5e1",
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            opacity: 0.9,
                          }}
                        >
                          {engine.desc}
                        </Typography>
                      </Box>

                      {/* RIGHT: MAGLEV PISTON CHAMBER */}
                      <Box
                        sx={{
                          width: "48px",
                          background: "rgba(0,0,0,0.2)",
                          borderLeft: "1px solid rgba(255,255,255,0.05)",
                          position: "relative",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {/* The Glass Tube */}
                        <Box
                          sx={{
                            width: "8px",
                            height: "80%",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.05)",
                            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                            position: "relative",
                          }}
                        >
                          {/* Floating Maglev Piston */}
                          <Box
                            className="maglev-piston"
                            sx={{
                              position: "absolute",
                              left: -2,
                              right: -2,
                              height: "12px",
                              borderRadius: "4px",
                              background: engine.color,
                              boxShadow: `0 0 15px ${engine.color}`,
                              animation: `pistonPump ${
                                2 + Math.random()
                              }s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate`,
                            }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grow>
                ))}
              </Box>
            </Box>
          </Fade>

          {/* CONNECTING STREAM: ENGINES -> OUTCOMES */}
          <Fade in={mounted} timeout={2000}>
            <Box
              sx={{
                position: "relative",
                height: "120px",
                width: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 0,
                mt: -4,
                mb: -4, // Overlap
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                style={{ position: "absolute", inset: 0 }}
              >
                <defs>
                  <linearGradient
                    id="outcomeFlow"
                    x1="0.5"
                    y1="0"
                    x2="0.5"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#29B6F6" stopOpacity="0" />
                    <stop
                      offset="50%"
                      stopColor="#00E5FF"
                      stopOpacity="0.8"
                    />{" "}
                    {/* Increased opacity */}
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow-stream">
                    <feGaussianBlur
                      stdDeviation="2"
                      result="coloredBlur"
                    />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Multiple Flow Lines converging - THICKER & VISIBLE */}
                {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
                  <path
                    key={i}
                    d={`M ${pos * 1440} 0 C ${
                      pos * 1440
                    } 60, 720 40, 720 120`}
                    stroke="url(#outcomeFlow)"
                    strokeWidth="4" /* Thicker strokes */
                    fill="none"
                    opacity="0.8" /* Higher opacity */
                    filter="url(#glow-stream)" /* Added Glow */
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      from="0, 500"
                      to="500, 0"
                      dur={`${3 + i}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                ))}

                {/* Central Funnel Pulse */}
                <circle
                  cx="720"
                  cy="120"
                  r="20"
                  fill="url(#outcomeFlow)"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="20;60;20"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </Box>
          </Fade>

          {/* SECTION 5: OUTCOMES (Success Stories) - Premium Design */}
          <Fade in={mounted} timeout={2200}>
            <Box
              sx={{
                mb: 12,
                position: "relative",
                py: 10,
                overflow: "hidden",
                // Animated gradient background
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0, 229, 255, 0.08) 0%, transparent 70%)",
                  animation: "breatheGlow 8s ease-in-out infinite",
                },
                "@keyframes breatheGlow": {
                  "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
                  "50%": { opacity: 1, transform: "scale(1.1)" },
                },
                // Floating particles
                "@keyframes floatParticle": {
                  "0%, 100%": {
                    transform: "translateY(0) translateX(0)",
                    opacity: 0.3,
                  },
                  "25%": {
                    transform: "translateY(-20px) translateX(10px)",
                    opacity: 0.8,
                  },
                  "50%": {
                    transform: "translateY(-10px) translateX(-5px)",
                    opacity: 0.5,
                  },
                  "75%": {
                    transform: "translateY(-30px) translateX(5px)",
                    opacity: 0.7,
                  },
                },
                "@keyframes shimmer": {
                  "0%": { backgroundPosition: "-200% 0" },
                  "100%": { backgroundPosition: "200% 0" },
                },
                "@keyframes cardFloat": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-8px)" },
                },
                "@keyframes iconPulse": {
                  "0%, 100%": { boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)" },
                  "50%": { boxShadow: "0 0 40px rgba(0, 229, 255, 0.8)" },
                },
                "@keyframes borderGlow": {
                  "0%, 100%": { borderColor: "rgba(0, 229, 255, 0.2)" },
                  "50%": { borderColor: "rgba(0, 229, 255, 0.5)" },
                },
              }}
            >
              {/* Floating Particles Background */}
              {[...Array(12)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    width: 4 + (i % 3) * 2,
                    height: 4 + (i % 3) * 2,
                    borderRadius: "50%",
                    background: i % 2 === 0 ? "#00E5FF" : "#66BB6A",
                    left: `${8 + i * 8}%`,
                    top: `${20 + (i % 4) * 20}%`,
                    animation: `floatParticle ${4 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    filter: "blur(1px)",
                    zIndex: 0,
                  }}
                />
              ))}


              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 8, position: "relative", zIndex: 2 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: -1,
                      mb: 2,
                      textShadow: "0 0 40px rgba(0, 229, 255, 0.3)",
                    }}
                  >
                    Products Built with MiFiX Studio
                  </Typography>
                  <Box
                    sx={{
                      width: "80px",
                      height: "6px",
                      background: "linear-gradient(90deg, #00E5FF, #00B8D4)",
                      mx: "auto",
                      borderRadius: "3px",
                      boxShadow: "0 0 15px rgba(0, 229, 255, 0.5)",
                    }}
                  />
              </Box>

              {/* PERFECTLY ALIGNED GRID */}
              {/* PERFECTLY ALIGNED FLEX LAYOUT */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 4, // 32px gap
                  maxWidth: "1400px",
                  mx: "auto",
                  px: 2,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {SUCCESS_STORIES.map((story, index) => (
                   <Grow in={mounted} timeout={1000 + index * 200} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          width: "380px", // FIXED WIDTH
                          height: "420px", // Taller for better layout
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "32px", // Softer corners
                          background: "#0F172A", // Deep Slate
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          cursor: "pointer",
                          m: 0,
                          flexShrink: 0,
                          
                          "&:hover": {
                              transform: "translateY(-12px) scale(1.02)",
                              boxShadow: `0 20px 50px -10px ${story.color}40`, // Colored Shadow
                              border: `1px solid ${story.color}60`,
                              "& .icon-bg": { transform: "scale(15) rotate(15deg)", opacity: 0.1 },
                              "& .floating-icon": { transform: "scale(1.2) rotate(-10deg) translateY(-5px)" }
                          }
                        }}
                      >
                          {/* 1. Creative Dynamic Header */}
                          <Box sx={{
                              height: "140px",
                              position: "relative",
                              overflow: "hidden",
                              background: `linear-gradient(135deg, ${story.color}15 0%, transparent 100%)`,
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              p: 3,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start"
                          }}>
                              {/* Giant Expanding Background Icon (Decorative) */}
                              <story.icon className="icon-bg" sx={{
                                  position: "absolute",
                                  right: "-20px", top: "-20px",
                                  fontSize: "140px",
                                  color: story.color,
                                  opacity: 0.05,
                                  transition: "all 0.6s ease",
                                  zIndex: 0
                              }} />

                              {/* Stat Chip */}
                              <Box sx={{
                                  backdropFilter: "blur(10px)",
                                  background: "rgba(0,0,0,0.4)",
                                  border: `1px solid ${story.color}40`,
                                  borderRadius: "12px",
                                  px: 1.5, py: 0.5,
                                  zIndex: 1,
                                  display: "flex", alignItems: "center", gap: 1
                              }}>
                                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: story.color }} />
                                  <Typography variant="caption" sx={{ color: "white", fontWeight: 700, letterSpacing: 0.5 }}>
                                      {story.stat}
                                  </Typography>
                              </Box>

                              {/* Floating 3D Icon Badge */}
                              <Box className="floating-icon" sx={{
                                  width: "64px", height: "64px",
                                  borderRadius: "20px",
                                  background: `linear-gradient(135deg, ${story.color} 0%, #1e293b 100%)`, // Solid gradient
                                  boxShadow: `0 10px 20px -5px ${story.color}60`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "white",
                                  zIndex: 2,
                                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                              }}>
                                  <story.icon sx={{ fontSize: 32 }} />
                              </Box>
                          </Box>

                          {/* 2. Content Body */}
                          <Box sx={{ p: 3, pt: 2, flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
                              
                              {/* Client Label */}
                              <Typography variant="caption" sx={{ color: story.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mb: 1 }}>
                                  {story.client}
                              </Typography>

                              {/* Title */}
                              <Typography variant="h5" sx={{ 
                                  color: "white", fontWeight: 700, mb: 2, lineHeight: 1.2,
                                  fontSize: "1.35rem"
                              }}>
                                  {story.title}
                              </Typography>

                              {/* Description */}
                              <Typography variant="body2" sx={{ 
                                  color: "#94a3b8", mb: 3, lineHeight: 1.6, flex: 1
                              }}>
                                  {story.desc}
                              </Typography>

                              {/* 3. Impact Footer */}
                             <Box sx={{
                                  mt: "auto",
                                  pt: 2,
                                  borderTop: "1px dashed rgba(255,255,255,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between"
                             }}>
                                  <Box>
                                      <Typography variant="h3" sx={{ 
                                          fontWeight: 800, color: "white", 
                                          fontSize: "2rem", letterSpacing: -1,
                                          background: `linear-gradient(90deg, white, ${story.color})`,
                                          WebkitBackgroundClip: "text",
                                          WebkitTextFillColor: "transparent"
                                      }}>
                                          {story.impact}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                                          {story.impactLabel}
                                      </Typography>
                                  </Box>
                                  
                                  {/* Arrow Button */}
                                  <Box sx={{
                                      width: 40, height: 40, borderRadius: "50%",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      color: story.color,
                                      transition: "all 0.2s"
                                  }}>
                                      <ArrowBackIcon sx={{ transform: "rotate(180deg)" }} />
                                  </Box>
                             </Box>
                          </Box>
                      </Paper>
                   </Grow>
                ))}
              </Box>
            </Box>
          </Fade>
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
                      0.9,
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
                        0.03,
                      )} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(
                        selectedAgent?.color || "#2196F3",
                        0.03,
                      )} 0%, transparent 50%), radial-gradient(circle at 40% 80%, ${alpha(
                        selectedAgent?.color || "#2196F3",
                        0.02,
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
                              0.95,
                            )}, ${alpha("#2d4f73", 0.8)})`
                          : `linear-gradient(135deg, ${alpha(
                              "#1b263b",
                              0.9,
                            )}, ${alpha("#0d1b2a", 0.95)})`,
                        border: dragActive
                          ? `2px solid ${selectedAgent?.color}`
                          : `1px solid ${alpha("#64b5f6", 0.2)}`,
                        boxShadow: dragActive
                          ? `0 35px 50px ${alpha(
                              selectedAgent?.color || "#ccc",
                              0.15,
                            )}, 0 0 0 1px ${alpha("#1b263b", 0.2)} inset`
                          : `0 8px 32px ${alpha(
                              "#000",
                              0.2,
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
                            0.12,
                          )}, 0 0 0 1px ${alpha(
                            selectedAgent?.color || "#64b5f6",
                            0.2,
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
                            0.03,
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
                              0.25,
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
                                  0.08,
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
                                    0.15,
                                  )}, ${alpha(type.color, 0.2)})`,
                                  transform: "translateY(-2px) scale(1.05)",
                                  boxShadow: `0 8px 20px ${alpha(
                                    type.color,
                                    0.25,
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
                      0.9,
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
                                0.1,
                              )}`,
                              background: `linear-gradient(135deg, ${alpha(
                                "#1b263b",
                                0.8,
                              )} 0%, ${alpha("#2d4f73", 0.6)} 100%)`,
                              backdropFilter: "blur(10px)",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                transform: "translateY(-4px) scale(1.02)",
                                boxShadow: `0 20px 40px ${alpha(
                                  selectedAgent?.color || "#000",
                                  0.12,
                                )}`,
                                border: `2px solid ${alpha(
                                  selectedAgent?.color || "#ccc",
                                  0.3,
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
                                      0.3,
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
                            0.5,
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
                              0.05,
                            ),
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 20px ${alpha(
                              selectedAgent?.color || "#2196F3",
                              0.15,
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
                      ),
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
                    0.3,
                  )}`,
                  "&:hover": {
                    background: selectedAgent?.gradient,
                    filter: "brightness(1.1)",
                    transform: "translateY(-3px)",
                    boxShadow: `0 8px 25px ${alpha(
                      selectedAgent?.color || "#2196F3",
                      0.4,
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
                              0.2,
                            )}`,
                            background: alpha("#0d1b2a", 0.6),
                            backdropFilter: "blur(10px)",
                            position: "relative",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: `0 12px 25px ${alpha(
                                getAgentTypeColor(collection.name),
                                0.15,
                              )}`,
                              border: `2px solid ${getAgentTypeColor(
                                collection.name,
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
                                  collection.name,
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
