
import {
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import {
  UiGeneratorImage,
  WorkflowImage,
  ValidationImage,
  ApiIntegratorImage,
  DbArchitectImage,
  RetrieverImage,
  SchedulerImage,
  ActionImage,
  CommunicationImage,
  MoreAgentsImage,
  OcrImage,
  BiometricsImage,
  NlpImage,
  SupervisoryImage
} from "./components/AgentIcons";

export const AGENT_HIERARCHY = {
  supervisor: {
    id: "supervisor_group",
    title: "Supervisor Agent",
    count: 1,
    description: "Acts as a project manager, decomposing prompts into dependency graphs.",
    agents: [
      {
        id: "supervisory",
        title: "Supervisor Agent",
        subtitle: "Orchestrator",
        description: "Manages the entire agentic workflow.",
        icon: SupervisoryImage,
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
  nexus_brain: {
    id: "nexus_brain_group",
    title: "Nexus - Brain",
    count: 7,
    description: "Core logic, orchestration, and validation engines.",
    agents: [
      { id: "scheduler", title: "Scheduler Agent", description: "Manages Time", icon: SchedulerImage, color: "#29B6F6" },
      { id: "action", title: "Action Agent", description: "Executes Tasks", icon: ActionImage, color: "#29B6F6" },
      { id: "workflow", title: "Workflow Agent", description: "Orchestrates Flows", icon: WorkflowImage, color: "#29B6F6" },
      { id: "validation", title: "Validation Agent", description: "Checks Logic", icon: ValidationImage, color: "#29B6F6" },
      { id: "template", title: "Template Agent", description: "Manages Patterns", icon: WorkflowImage, color: "#29B6F6" },
      { id: "qa", title: "QA Agent", description: "Quality Assurance", icon: ValidationImage, color: "#29B6F6" },
      { id: "nlp", title: "NLP Agent", description: "Processes Language", icon: NlpImage, color: "#29B6F6" },
    ],
  },
  nexus_interface: {
    id: "nexus_interface_group",
    title: "Nexus - Interface",
    count: 3,
    description: "Frontend generation, communication, and document processing.",
    agents: [
      { id: "ui_agent", title: "UI Agent", description: "Builds Interfaces", icon: UiGeneratorImage, color: "#AB47BC" },
      { id: "communication", title: "Communication Agent", description: "Handles Messaging", icon: CommunicationImage, color: "#AB47BC" },
      { id: "document", title: "Document Agent", description: "Parses Files", icon: OcrImage, color: "#AB47BC" },
    ],
  },
  nexus_infra: {
    id: "nexus_infra_group",
    title: "Nexus - Infrastructure",
    count: 9,
    description: "Backend services, data management, security, and integration.",
    agents: [
      { id: "retriever", title: "Retriever Agent", description: "Fetches Context", icon: RetrieverImage, color: "#66BB6A" },
      { id: "database", title: "Database Agent", description: "Data Modeling", icon: DbArchitectImage, color: "#66BB6A" },
      { id: "persistence", title: "Persistence Agent", description: "Manages State", icon: DbArchitectImage, color: "#66BB6A" },
      { id: "api_integrator", title: "API Integrator", description: "Connects Services", icon: ApiIntegratorImage, color: "#66BB6A" },
      { id: "integrator", title: "Integrator", description: "System Merging", icon: ApiIntegratorImage, color: "#66BB6A" },
      { id: "security", title: "Security Agent", description: "Ensures Safety", icon: BiometricsImage, color: "#66BB6A" },
      { id: "audit", title: "Audit Agent", description: "Tracks Compliance", icon: ValidationImage, color: "#66BB6A" },
      { id: "monitoring", title: "Monitoring Agent", description: "Observes Health", icon: BiometricsImage, color: "#66BB6A" },
      { id: "report", title: "Report Agent", description: "Generates Insights", icon: CommunicationImage, color: "#66BB6A" },
     ]
  },
};
