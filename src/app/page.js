"use client";
import dynamic from "next/dynamic";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
} from "react";
import {
  Description as DocumentIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  UploadFile as UploadFileIcon,
  AccountTree as WorkflowIcon,
  Chat as ChatIcon,
  Storage as StorageIcon,
  SwapHoriz as SwapIcon,
  TableChart as TableChartIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  Chip,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import Image from "next/image";
import { keyframes } from "@emotion/react";

// Critical components - load immediately
import Sidebar from "../components/Sidebar";
import { StellarThinking } from "../components/mui/ChatMessage";
import ChatSkeleton from "../components/mui/ChatSkeleton";
import InputWithRecording from "../components/mui/InputWithRecording";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "../components/auth/UserMenu";
import authService from "../services/authService";
import { API_BASE_URL, CHAT_ENDPOINT } from "../lib/config";

// Dynamic imports - lazy load heavy components
const ChatMessage = dynamic(
  () => import("../components/mui/ChatMessage").then((mod) => mod.default),
  { ssr: false }
);
const ConfirmationDialog = dynamic(
  () => import("@/components/mui/ConfirmationDialog"),
  { ssr: false }
);
const PDFNotificationPopup = dynamic(
  () => import("../components/mui/PDFNotificationPopup"),
  { ssr: false }
);
const TypingIndicator = dynamic(
  () => import("../components/mui/TypingIndicator"),
  { ssr: false }
);

// Lazy load non-critical utilities
import { generateAudioFileName, uploadAudioFile } from "../lib/audioUpload";
import { dataAnalysisApi } from "../lib/api/dataAnalysisApi";
import workflowService from "../services/workflowService";
import { useWorkflowHandler } from "../hooks/useWorkflowHandler";
import {
  getFormSchemaByKeyword,
  getFormSchemaById,
} from "../components/dynamic-form/sampleFormSchemas";

// Define animations for AI elements
const pulseGlow = keyframes`
  0% {
    filter: drop-shadow(0 0 20px rgba(25, 118, 210, 0.3));
    transform: scale(1);
  }
  100% {
    filter: drop-shadow(0 0 30px rgba(25, 118, 210, 0.5));
    transform: scale(1.02);
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Memoized Chat Message Item - prevents re-render of all messages when one changes
const MemoizedChatMessage = memo(
  ({ message, index, onAction }) => {
    const messageKey = message.timestamp
      ? `message-${message.timestamp}-${index}`
      : message.content?.response?.question
      ? `message-${message.content.response.question.replace(
          /[^a-zA-Z0-9]/g,
          ""
        )}-${index}`
      : message.content?.text
      ? `message-${message.content.text
          .substring(0, 20)
          .replace(/[^a-zA-Z0-9]/g, "")}-${index}`
      : `message-stable-${index}`;

    return (
      <ChatMessage
        key={messageKey}
        message={message}
        index={index}
        onAction={onAction}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if message content actually changed
    return (
      prevProps.message.timestamp === nextProps.message.timestamp &&
      prevProps.index === nextProps.index &&
      prevProps.message.type === nextProps.message.type
    );
  }
);

MemoizedChatMessage.displayName = "MemoizedChatMessage";

/**
 * Get authentication headers with bearer token
 * @returns {Object} Headers object with authorization
 */
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? authService.getAccessToken() : null;
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export default function HomePage() {
  const { user } = useAuth();

  // Get username for chat API - prioritize username over userId (UUID)
  const getUserId = useCallback(() => {
    // Try multiple sources in priority order - username first!
    const sources = [
      user?.username, // Prioritize username for chat API
      authService.getUsername(),
      user?.userId,
      authService.getUserId(),
      "default_user", // Final fallback
    ];

    // Return first non-empty value
    const validId = sources.find((id) => id && id.trim() !== "");
    console.log("🔍 getUserId sources:", sources, "→ selected:", validId);
    return validId || "default_user";
  }, [user]); // Re-compute when user changes

  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentResponseData, setCurrentResponseData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [eventPollingInterval, setEventPollingInterval] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: "", message: "" });
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [pdfUrls, setPdfUrls] = useState([]);
  const [showPdfPopup, setShowPdfPopup] = useState(false);

  // Data Analysis states
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const CONNECTION_ID =
    process.env.NEXT_PUBLIC_CONNECTION_ID ||
    "a949f2cc-37ae-4db2-9702-a28148ec741f";

  // Document Selector states (Popover)
  const [filePopoverAnchor, setFilePopoverAnchor] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Data source mode: 'excel' (uses document_key) or 'retriever' (uses database connection)
  const [dataSourceMode, setDataSourceMode] = useState("retriever"); // Default to retriever (database)

  const [recordingTime, setRecordingTime] = useState(0);
  const [scheduledTasks, setScheduledTasks] = useState(new Map());
  const [activeJobIds, setActiveJobIds] = useState(new Set());
  const chatEndRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const taskPollingRef = useRef(null);
  const [pdfPopupOpen, setPdfPopupOpen] = useState(false);
  const [pdfPopupData, setPdfPopupData] = useState(null);

  // Access control state
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // Sidebar states
  const [selectedTab, setSelectedTab] = useState("chat");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Workflow mode states
  const [workflowMode, setWorkflowMode] = useState(false);
  const [workflowState, setWorkflowState] = useState({
    category: "",
    selected_product: "",
    application_id: "",
    nextAction: "", // Dynamic - comes from API response or user input
  });

  const { handleWorkflowFormSubmit, handleWorkflowMessage, resetWorkflow } =
    useWorkflowHandler({
      workflowState,
      setWorkflowState,
      setChatHistory,
      setIsTyping,
      getUserId,
      currentUserId,
    });

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    // Close mobile drawer when tab changes
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Function to load conversation history
  const loadConversationHistory = (conversationHistory) => {
    setIsLoadingConversation(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      // Convert API format to your internal chat format
      const formattedHistory = conversationHistory.map((msg, index) => {
        if (msg.sender_type === "user") {
          return {
            type: "user",
            content: {
              text: msg.content,
            },
            timestamp: msg.created_at,
            isHistorical: true, // Mark as historical to prevent auto-scroll
          };
        } else {
          // Handle AI responses
          let content;
          let response = null;

          try {
            // Try to parse as JSON first
            const parsedContent = JSON.parse(msg.content);

            // Check if this is a data_query_result or other structured response
            if (parsedContent.type === "data_query_result") {
              // Structure it the way ChatMessage expects
              response = {
                type: "data_query_result",
                content: parsedContent.content,
              };
              content = {
                response: response,
              };
            } else if (parsedContent.type) {
              // Other typed responses
              response = parsedContent;
              content = {
                response: response,
              };
            } else {
              content = parsedContent;
            }
          } catch {
            // If not JSON, treat as plain text
            content = {
              text: msg.content,
            };
          }

          return {
            type: "ai",
            content: content,
            response: response, // Also set at top level for compatibility
            isBot: true,
            timestamp: msg.created_at,
            isHistorical: true, // Mark as historical to prevent auto-scroll
          };
        }
      });

      // Replace current chat history
      setChatHistory(formattedHistory);
      setIsLoadingConversation(false);
      setSelectedTab("chat"); // Switch to chat view
    }, 800); // 800ms delay for smooth skeleton animation
  };

  // New Chat handler - increments user ID and resets conversation
  const handleNewChat = useCallback(() => {
    // Extract current number from user ID and increment
    const currentMatch = currentUserId.match(/(\d+)$/);
    const currentNumber = currentMatch ? parseInt(currentMatch[1], 10) : 3;
    const newUserId = currentUserId.replace(
      /(\d+)$/,
      (currentNumber + 1).toString()
    );

    // Reset conversation state
    setCurrentUserId(newUserId);
    setConversationId(null);
    setChatHistory([]);
    setUploadedDocuments([]);
    setCurrentResponseData(null);
    setSessionId(null);

    console.log(`🔄 New chat started with user_id: ${newUserId}`);
  }, [currentUserId]);

  const handleApiResponse = useCallback(
    (data) => {
      console.log("API Response:", data);
      setIsTyping(false);

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Handle the response data structure for analysis results
      if (data.response && data.response.conversation_id) {
        setConversationId(data.response.conversation_id);
      }

      let botMessage = null;

      // New: Handle audio responses that also contain data (priority check)
      if (data.response?.access_url && data.response?.data) {
        botMessage = {
          type: "audio_translation",
          content: {
            originalText: data.response.original_question || "",
            translatedText:
              data.response.question || data.response.translated_content,
            detectedLanguage: data.response.detected_language,
            audioUrl: data.response.access_url,
            status: data.response.status,
            errorMessage: data.response.error_message,
            data: data.response.data,
            rowCount: data.response.row_count,
            executionTime: data.response.execution_time_ms,
          },
          isBot: true,
        };
      }
      // Handle form schema response (PRIORITY - before other handlers)
      else if (data.response?.type === "form_schema" && data.response?.schema) {
        console.log(
          "✅ Detected form_schema response, creating bot message with full data"
        );
        botMessage = {
          type: "form_schema",
          response: data.response,
          conversation_id: data.conversation_id,
          isBot: true,
          timestamp: new Date().toISOString(),
        };
      }
      // Handle data_query_result response (SQL query results)
      else if (data.response?.type === "data_query_result") {
        console.log(
          "✅ Detected data_query_result response in handleApiResponse",
          data.response
        );

        const rowCount =
          data.response?.content?.row_count ||
          data.response?.content?.results?.length ||
          0;
        const hasMultipleRecords = rowCount > 1;

        botMessage = {
          type: "data_analysis",
          content: {
            response: data.response,
            showGraphOptions: hasMultipleRecords, // Only show graph options if more than 1 record
            // Include document_key from response or from selected document for Excel-based queries
            document_key:
              data.response?.content?.document_key ||
              data.response?.document_key ||
              (dataSourceMode === "excel" && selectedDocument
                ? selectedDocument.document_key
                : null),
          },
          conversation_id: data.conversation_id,
          isBot: true,
          timestamp: new Date().toISOString(),
        };
      }
      // Handle error response (from failed queries)
      else if (data.type === "error" || data.response?.type === "error") {
        console.log("✅ Detected error response in handleApiResponse", data);
        botMessage = {
          type: "query_error",
          content: {
            error:
              data.content || data.response?.content || "An error occurred",
            query: data.query || data.response?.query,
          },
          conversation_id: data.conversation_id,
          isBot: true,
          timestamp: new Date().toISOString(),
        };
      }
      // Handle workflow modification response
      else if (
        data.response &&
        data.response.status === "preview_ready" &&
        data.response.modification_request
      ) {
        botMessage = {
          type: "system",
          content: "Workflow Modification Preview",
          timestamp: new Date().toISOString(),
          workflow_modification: data.response,
        };
      }
      // Handle weather response
      else if (
        data.response &&
        data.response.result &&
        data.response.result.temperature
      ) {
        const weatherData = data.response.result;
        botMessage = {
          type: "system",
          content: "Current Weather Information",
          timestamp: new Date().toISOString(),
          weather: weatherData,
        };
      }
      // Handle workflow response with UI schema
      else if (data.response?.ui_schema) {
        setCurrentResponseData(data.response);

        if (data.response.session_id) {
          setSessionId(data.response.session_id);
        }

        botMessage = {
          type: "system",
          content: data.response.message || "System response",
          timestamp: new Date().toISOString(),
          ui_schema: data.response.ui_schema,
        };
      }
      // Handle credit analysis response
      else if (data.response?.result?.response) {
        const analysisData = data.response.result.response;
        let analysisText = `**Credit Analysis Result**\n\n`;
        analysisText += `**Status:** ${
          analysisData.status?.toUpperCase() || "N/A"
        }\n`;
        analysisText += `**Comments:** ${analysisData.comments || "N/A"}\n`;
        analysisText += `**Credit History Type:** ${
          analysisData.creditHistoryType || "N/A"
        }\n\n`;

        if (analysisData.summary && Array.isArray(analysisData.summary)) {
          analysisText += `**Conditions Summary:**\n`;
          analysisData.summary.forEach((condition, index) => {
            analysisText += `${index + 1}. **${condition.name}**: ${
              condition.status?.toUpperCase() || "N/A"
            }\n`;
            analysisText += `   ${condition.description || ""}\n`;
            if (condition.reason && condition.reason.length > 0) {
              analysisText += `   Reason: ${condition.reason[0]}\n`;
            }
            analysisText += `\n`;
          });
        }
        botMessage = {
          type: "user",
          content: { text: analysisText },
          isBot: true,
        };
      }
      // Handle dynamic data visualization response (supports any data structure)
      else if (
        (data.response?.status === "success" &&
          Array.isArray(data.response.data) &&
          data.response.data.length > 0) ||
        (data?.status === "success" &&
          Array.isArray(data.data) &&
          data.data.length > 0)
      ) {
        botMessage = {
          type: "dynamic_data",
          isBot: true,
          content: {
            data: data.response?.data || data.data,
            question:
              data.response?.question || data.question || "Data Analysis",
            title: "Business Intelligence Dashboard",
          },
        };
      }
      // Handle reconciliation response
      else if (
        data.response?.result &&
        (data.response.result.KTP_vs_XMM ||
          data.response.result.XMM_vs_SAM ||
          data.response.result.KTP_vs_XMM_vs_SAM)
      ) {
        console.log("Detected reconciliation response:", data.response.result);
        botMessage = {
          type: "reconciliation",
          content: data.response.result,
          isBot: true,
        };
      }
      // Handle table data response
      else if (data.response?.result && Array.isArray(data.response.result)) {
        botMessage = {
          type: "table",
          content: { data: data.response.result, title: "Query Results" },
          isBot: true,
        };
      }
      // Handle analysis response
      else if (data.response?.type === "analysis" && data.response?.content) {
        botMessage = {
          type: "analysis",
          content: data.response.content,
          source: data.response.source || "buddi_agent",
          isBot: true,
        };
      }
      // Handle incentive rules response
      else if (
        data.response?.type === "incentive_rules" &&
        data.response?.content
      ) {
        botMessage = {
          type: "incentive_rules",
          content: data.response.content,
          source: data.response.source,
          isBot: true,
        };
      }
      // Handle audio-only responses (no data)
      else if (data.response?.access_url) {
        botMessage = {
          type: "audio_translation",
          content: {
            originalText: data.response.original_question || "",
            translatedText:
              data.response.question ||
              data.response.translated_content ||
              data.response.content,
            detectedLanguage: data.response.detected_language,
            audioUrl: data.response.access_url,
            status:
              data.response.status ||
              (data.response.type === "error" ? "error" : "success"),
            errorMessage:
              data.response.error_message ||
              (data.response.type === "error" ? data.response.content : null),
            data: null, // Explicitly set data to null
          },
          isBot: true,
        };
      }
      // Handle access denied response
      else if (data.response?.type === "access_denied") {
        console.log("✅ Detected access_denied response in handleApiResponse");
        setIsAccessDenied(true); // Block further API calls
        botMessage = {
          type: "access_denied",
          content: data,
          isBot: true,
        };
      }
      // Handle scheduler response
      else if (data.response?.type === "scheduler_response") {
        botMessage = {
          type: "scheduler_response",
          content: data.response,
          isBot: true,
        };

        // Track scheduled tasks for automatic completion display
        if (
          data.response?.data?.job_id &&
          data.response?.data?.schedule_details?.params?.run_date
        ) {
          const jobId = data.response.data.job_id;
          const runDate = new Date(
            data.response.data.schedule_details.params.run_date
          );

          // Store job_id for tracking
          setActiveJobIds((prev) => new Set([...prev, jobId]));

          setScheduledTasks((prev) => {
            const newTasks = new Map(prev);
            newTasks.set(jobId, {
              runDate,
              title: data.response.content || "Scheduled Task",
              conversationId: data.conversation_id,
            });
            return newTasks;
          });

          // Fetch events data 2 minutes after scheduling
          setTimeout(async () => {
            try {
              const response = await fetch(
                "http://15.207.209.61:8400/executor/events"
              );
              if (response.ok) {
                const eventsData = await response.json();

                // Find event that matches any of our active job IDs
                if (eventsData && eventsData.length > 0) {
                  const matchingEvent = eventsData.find(
                    (event) =>
                      activeJobIds.has(event.id) &&
                      event.status === "completed" &&
                      event.metadata?.response_type === "downloadable_report"
                  );

                  if (matchingEvent) {
                    // Add completed message to chat
                    const completedMessage = {
                      type: "scheduler_response",
                      content: matchingEvent,
                      isBot: true,
                      timestamp: new Date().toISOString(),
                    };

                    setChatHistory((prev) => [...prev, completedMessage]);

                    // Show PDF popup if download URL exists
                    if (matchingEvent.download_url) {
                      setPdfPopupData({
                        title: matchingEvent.title || data.response.content,
                        download_url: matchingEvent.download_url,
                        metadata: matchingEvent.metadata,
                      });
                      setPdfPopupOpen(true);
                    }

                    // Remove completed job ID from active tracking
                    setActiveJobIds((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(matchingEvent.id);
                      return newSet;
                    });
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching events data:", error);
            }

            // Remove from scheduled tasks
            setScheduledTasks((prev) => {
              const newTasks = new Map(prev);
              newTasks.delete(jobId);
              return newTasks;
            });
          }, 120000); // 2 minutes delay
        }
      }
      // Handle event API scheduler response
      else if (data.metadata?.response_type === "downloadable_report") {
        botMessage = {
          type: "scheduler_response",
          content: data,
          isBot: true,
        };

        // Show PDF popup for completed downloadable reports
        if (data.status === "completed" && data.download_url) {
          setPdfPopupData({
            title: data.title || "Scheduled Report",
            download_url: data.download_url,
            metadata: data.metadata,
          });
          setPdfPopupOpen(true);
        }
      }
      // Handle analysis responses with supporting_data (from chat API)
      else if (data.response?.analysis_result?.supporting_data) {
        botMessage = {
          type: "data_analysis",
          content: data, // Pass the full response including conversation_id
          isBot: true,
        };
      }
      // Handle simple message response
      else if (data.response?.message) {
        botMessage = {
          type: "user",
          content: { text: data.response.message },
          isBot: true,
        };
      }

      if (botMessage) {
        // Ensure all bot messages have timestamps for unique keys
        if (!botMessage.timestamp) {
          botMessage.timestamp = new Date().toISOString();
        }
        setChatHistory((prev) => [...prev, botMessage]);
      }
    },
    [activeJobIds]
  );

  const callChatApi = useCallback(
    async (body) => {
      // Block API calls if access is denied
      if (isAccessDenied) {
        console.log("🚫 API call blocked - Access denied");
        setIsTyping(false);

        // Show a reminder message
        const reminderMessage = {
          type: "access_denied",
          content: {
            response: {
              type: "access_denied",
              message:
                "Request limit exceeded. Please contact support to continue.",
              current_usage: 0,
              limit: 0,
              remaining: 0,
            },
          },
          isBot: true,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, reminderMessage]);
        return;
      }

      setIsTyping(true);
      try {
        const requestBody = { ...body };
        if (conversationId) {
          requestBody.conversation_id = conversationId;
        }

        // Ensure user_id is always present (use username, not UUID)
        if (!requestBody.user_id) {
          const userId =
            currentUserId ||
            getUserId() ||
            authService.getUsername() || // Prioritize username
            authService.getUserId() ||
            "default_user";
          if (!userId || userId.trim() === "") {
            console.error("❌ callChatApi user_id validation failed:", {
              currentUserId,
              getUserIdResult: getUserId(),
              authUserId: authService.getUserId(),
              authUsername: authService.getUsername(),
              userObject: !!user,
              originalBody: body,
            });
            throw new Error("user_id is required but could not be determined");
          }
          requestBody.user_id = userId;
          console.log("🔧 Added missing user_id to callChatApi:", userId);
        }

        // Add roleCode to the request
        const roleCode = authService.getRoleCode();
        if (roleCode) {
          requestBody.roleCode = roleCode;
        }

        console.log("📤 Final request body:", {
          user_id: requestBody.user_id,
          has_message: !!requestBody.message,
          has_conversation_id: !!requestBody.conversation_id,
          has_roleCode: !!requestBody.roleCode,
        });

        // Check if this is a configurator API call
        const isConfiguratorCall =
          body.message && body.message.includes("configurator");
        if (isConfiguratorCall) {
          setConfiguratorCallTime(Date.now());
        }

        const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINT}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Chat API Response:", data);
        handleApiResponse(data);
      } catch (error) {
        console.error("Error calling chat API:", error);

        // Check if it's a CORS or network error
        const isCorsError =
          error.message.includes("Failed to fetch") ||
          error.message.includes("CORS") ||
          error.message.includes("NetworkError");

        if (isCorsError) {
          // Show access denied card for CORS/network errors
          setIsAccessDenied(true);
          const errorMessage = {
            type: "access_denied",
            content: {
              response: {
                type: "access_denied",
                message:
                  "Unable to connect to server. This could be due to network issues or CORS restrictions. Please contact support for assistance.",
                current_usage: 0,
                limit: 0,
                remaining: 0,
              },
            },
            isBot: true,
            timestamp: new Date().toISOString(),
          };
          setChatHistory((prev) => [...prev, errorMessage]);
        } else {
          // Show regular error message for other errors
          const errorMessage = {
            type: "user",
            content: { text: `Error: ${error.message}` },
            isBot: true,
            isError: true,
            timestamp: new Date().toISOString(),
          };
          setChatHistory((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [
      conversationId,
      handleApiResponse,
      isAccessDenied,
      currentUserId,
      getUserId,
      user,
    ]
  );

  const handleAction = useCallback(
    async (action, componentId, data = {}) => {
      console.log("UI Action triggered:", { action, componentId, data });

      // Handle send_prompt action - send prompt to chat API (from welcome card)
      if (action?.type === "send_prompt" && action.prompt) {
        // Add user message to chat
        const userMessage = {
          type: "user",
          content: { text: action.prompt },
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, userMessage]);

        // Send to chat API
        const roleCode = authService.getRoleCode();
        const requestBody = {
          user_id:
            currentUserId ||
            getUserId() ||
            authService.getUsername() ||
            "default_user",
          message: action.prompt,
          ...(conversationId && { conversation_id: conversationId }),
          ...(dataSourceMode === "excel" &&
            selectedDocument && {
              document_key: selectedDocument.document_key,
            }),
          ...(roleCode && { roleCode }),
        };
        await callChatApi(requestBody);
        return;
      }

      // Handle form_continue action - load next form
      if (action?.type === "form_continue") {
        const nextSchema = getFormSchemaById(action.nextFormId);

        if (nextSchema) {
          const formMessage = {
            type: "dynamic_form",
            formSchema: nextSchema,
            isBot: true,
            timestamp: new Date().toISOString(),
          };
          setChatHistory((prev) => [...prev, formMessage]);
        }
        return;
      }

      // Handle form_submit action
      if (action?.type === "form_submit") {
        console.log("Form data submitted:", action.data);
        // You can send this data to backend here if needed
        return;
      }

      // Handle workflow_submit action
      if (action?.type === "workflow_submit") {
        console.log("Workflow form data submitted:", action.data);
        // Process workflow form submission using the hook
        if (handleWorkflowFormSubmit) {
          await handleWorkflowFormSubmit(action.data, action.formSchema);
        }
        return;
      }

      // Ignore OTP change events - they should not trigger automatic form submission
      if (data.type === "otp_change") {
        console.log("OTP change detected, not triggering form submission");
        return;
      }

      let requestBody;
      if (action.payload) {
        // Case 1: Action has a direct payload
        requestBody = { ...action.payload };
        console.log("Sending custom payload request:", requestBody);
      } else if (action.type === "submit_form") {
        // Case 2: Action is a form submission
        const details = {
          current_action_id: action.action_id,
          session_id: sessionId,
          customer_id: currentResponseData?.session_data?.customer_id,
          form_data: data,
        };
        requestBody = {
          user_id: currentUserId,
          message: `continue ${JSON.stringify(details)}`,
          ...(conversationId && { conversation_id: conversationId }),
        };
        console.log("Sending form submission request:", requestBody);
      } else {
        // Case 3: All other actions (e.g., navigate_to) - use new continue format
        const details = {
          current_action_id: action.action_id,
          session_id: sessionId,
          customer_id: currentResponseData?.session_data?.customer_id,
          form_data: data,
        };
        requestBody = {
          user_id: currentUserId,
          message: `continue ${JSON.stringify(details)}`,
          ...(conversationId && { conversation_id: conversationId }),
        };
        console.log("Sending navigation request:", requestBody);
      }

      await callChatApi(requestBody);
    },
    [
      currentResponseData,
      callChatApi,
      conversationId,
      currentUserId,
      sessionId,
      handleWorkflowFormSubmit,
      dataSourceMode,
      getUserId,
      selectedDocument,
    ]
  );

  // Cache ref for documents - persists across renders
  const documentsCache = useRef({ data: null, timestamp: null });
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Fetch available documents (with optional force refresh)
  const fetchAvailableDocuments = useCallback(
    async (forceRefresh = false) => {
      // Check cache first (unless force refresh)
      const now = Date.now();
      // Only use cache if it has data AND is not expired AND not force refresh
      if (
        !forceRefresh &&
        documentsCache.current.data &&
        documentsCache.current.data.length > 0 && // Don't cache empty results
        documentsCache.current.timestamp &&
        now - documentsCache.current.timestamp < CACHE_DURATION
      ) {
        console.log(
          "📦 Using cached documents:",
          documentsCache.current.data.length
        );
        setAvailableDocuments(documentsCache.current.data);
        return documentsCache.current.data;
      }

      console.log("🔄 Fetching documents from API...");
      const userId = getUserId();
      const apiUrl = `${API_BASE_URL}/api/v1/data-analysis/documents/${CONNECTION_ID}?user_id=${encodeURIComponent(
        userId
      )}`;
      console.log("🔗 API URL:", apiUrl);
      setLoadingDocuments(true);
      try {
        const response = await fetch(apiUrl, {
          headers: getAuthHeaders(),
        });

        console.log("📡 Documents API response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`);
        }

        const data = await response.json();
        console.log("📄 Documents API response data:", data);
        const docs = data.documents || [];

        // Only cache non-empty results
        if (docs.length > 0) {
          documentsCache.current = { data: docs, timestamp: now };
          console.log("🌐 Fetched and cached documents:", docs.length);
        } else {
          console.log("📭 No documents returned from API");
        }

        setAvailableDocuments(docs);
        return docs;
      } catch (err) {
        console.error("Error fetching documents:", err);
        setAvailableDocuments([]);
        return [];
      } finally {
        setLoadingDocuments(false);
      }
    },
    [CONNECTION_ID, getUserId]
  );

  // Handle file popover open
  const handleFilePopoverOpen = useCallback(
    (event) => {
      setFilePopoverAnchor(event.currentTarget);
      fetchAvailableDocuments();
    },
    [fetchAvailableDocuments]
  );

  // Handle file popover close
  const handleFilePopoverClose = useCallback(() => {
    setFilePopoverAnchor(null);
  }, []);

  // Handle document selection from popover
  const handleSelectDocumentFromPopover = useCallback((doc) => {
    setSelectedDocument(doc);
    setFilePopoverAnchor(null);
    console.log("Selected document:", doc);
  }, []);

  // State for tracking data source switch loading
  const [switchingDataSource, setSwitchingDataSource] = useState(false);

  // Handle toggling between Excel and Database modes
  const handleToggleDataSource = useCallback(async () => {
    if (dataSourceMode === "excel") {
      // Switching to Database mode - just clear document
      setDataSourceMode("retriever");
      setSelectedDocument(null);
    } else {
      // Switching to Excel mode - use cached documents if available
      setDataSourceMode("excel");

      // Check if we have cached documents
      if (
        documentsCache.current.data &&
        documentsCache.current.data.length > 0
      ) {
        console.log("📦 Using cached documents for mode switch");
        const docs = documentsCache.current.data;
        setAvailableDocuments(docs);

        // Auto-select first in-memory document
        const inMemoryDoc = docs.find((doc) => doc.in_memory);
        const firstDoc = inMemoryDoc || docs[0];
        if (firstDoc) {
          setSelectedDocument(firstDoc);
          console.log("Auto-selected document:", firstDoc.filename);
        }
      } else {
        // No cache - need to fetch
        setSwitchingDataSource(true);
        try {
          const docs = await fetchAvailableDocuments(true); // Force refresh

          // Auto-select first in-memory document
          const inMemoryDoc = docs.find((doc) => doc.in_memory);
          const firstDoc = inMemoryDoc || docs[0];
          if (firstDoc) {
            setSelectedDocument(firstDoc);
            console.log("Auto-selected document:", firstDoc.filename);
          }
        } catch (error) {
          console.error("Failed to load documents:", error);
        } finally {
          setSwitchingDataSource(false);
        }
      }
    }
  }, [dataSourceMode, fetchAvailableDocuments]);

  // File upload handler
  const handleFileUpload = useCallback(
    async (file) => {
      try {
        setIsLoading(true);
        const userId = getUserId();
        const response = await dataAnalysisApi.uploadDocument(
          CONNECTION_ID,
          file,
          userId,
          "Document uploaded via chat"
        );

        const newDoc = {
          document_key: response.document_key,
          filename:
            response.message.split('" uploaded')[0].split('"')[1] || file.name,
          shape: response.shape,
          columns: response.columns,
          upload_time: new Date().toISOString(),
        };

        setUploadedDocuments((prev) => [...prev, newDoc]);

        // Add professional upload success card and helpful prompt to chat
        const successMessage = {
          type: "upload_success",
          content: {
            filename: newDoc.filename,
            shape: newDoc.shape,
            uploadTime: newDoc.upload_time,
          },
          isBot: true,
        };

        setChatHistory((prev) => [...prev, successMessage]);

        // Refresh the documents list after successful upload
        console.log("📄 Refreshing documents list after upload...");
        const updatedDocs = await fetchAvailableDocuments(true); // Force refresh to get latest documents
        console.log(
          "📄 Documents after refresh:",
          updatedDocs?.length || 0,
          "documents"
        );
        console.log(
          "📄 In-memory documents:",
          updatedDocs?.filter((d) => d.in_memory)?.length || 0
        );

        return response;
      } catch (error) {
        console.error("File upload error:", error);
        const errorMessage = {
          type: "user",
          content: { text: `❌ Upload failed: ${error.message}` },
          isBot: true,
          isError: true,
        };
        setChatHistory((prev) => [...prev, errorMessage]);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [CONNECTION_ID, fetchAvailableDocuments, getUserId]
  );

  const isAnalysisQuestion = useCallback((message) => {
    const analysisKeywords = [
      "analyze",
      "analysis",
      "distribution",
      "show me",
      "visualize",
      "chart",
      "graph",
      "breakdown",
      "summary",
      "statistics",
      "report",
      "dashboard",
      "insights",
      "how many",
      "what percentage",
      "compare",
      "trend",
      "pattern",
      "top issues",
      "success rate",
      "failure rate",
      "performance",
      "metrics",
      "overview",
      "list",
      "give me",
      "find",
      "filter",
      "where",
      "score",
      "branches",
      "less than",
      "greater than",
      "equal to",
      "count",
      "total",
      "sum",
    ];
    return analysisKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  const handleDataAnalysis = useCallback(
    async (question) => {
      try {
        setIsAnalyzing(true);
        setIsTyping(true);

        // Ensure user_id is never empty - use username (not UUID)
        const userId =
          currentUserId ||
          getUserId() ||
          authService.getUsername() || // Prioritize username
          authService.getUserId() ||
          "default_user";

        // Validate userId is not empty string
        if (!userId || userId.trim() === "") {
          console.error("❌ user_id validation failed:", {
            currentUserId,
            getUserIdResult: getUserId(),
            authUserId: authService.getUserId(),
            authUsername: authService.getUsername(),
            userObject: !!user,
          });
          throw new Error(
            "user_id cannot be empty. Please ensure you are logged in."
          );
        }

        console.log("📊 Data Analysis Request:", {
          user_id: userId,
          currentUserId,
          authUserId: authService.getUserId(),
          authUsername: authService.getUsername(),
          userObject: !!user,
          question: question.substring(0, 50) + "...",
          conversationId,
          hasDocument: !!selectedDocument,
        });

        // Always use chat endpoint for consistency
        const roleCode = authService.getRoleCode();
        const requestPayload = {
          user_id: userId,
          message: question,
          ...(conversationId && { conversation_id: conversationId }),
          // Only include document_key when in Excel mode and a document is selected
          ...(dataSourceMode === "excel" &&
            selectedDocument && {
              document_key: selectedDocument.document_key,
            }),
          ...(roleCode && { roleCode }),
        };

        console.log("📤 Sending payload:", requestPayload);

        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API Error Response:", errorText);
          throw new Error(`Chat API error: ${response.status} - ${errorText}`);
        }

        const analysisResult = await response.json();

        // Extract and store conversation_id if present
        if (analysisResult.conversation_id) {
          setConversationId(analysisResult.conversation_id);
        }

        // Add analysis result to chat - pass the full API response
        const analysisMessage = {
          type: "data_analysis",
          content: analysisResult, // Pass the full API response directly
          isBot: true,
          timestamp: new Date().toISOString(), // Add timestamp for unique keys
        };

        setChatHistory((prev) => [...prev, analysisMessage]);
      } catch (error) {
        console.error("Analysis error:", error);
        const errorMessage = {
          type: "user",
          content: { text: `🔍 Analysis failed: ${error.message}` },
          isBot: true,
          isError: true,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsAnalyzing(false);
        setIsTyping(false);
      }
    },
    [selectedDocument, conversationId, currentUserId, user]
  );

  // Toggle workflow mode (only switches API endpoint, doesn't send message)
  const handleToggleWorkflowMode = useCallback(() => {
    const newMode = !workflowMode;
    setWorkflowMode(newMode);

    if (!newMode) {
      // Exiting workflow mode - reset state
      resetWorkflow();
    }
    // No auto-send when entering workflow mode - user types "Hi" manually
  }, [workflowMode, resetWorkflow]);

  // Check if message is a greeting
  const isGreeting = useCallback((message) => {
    const greetings = [
      "hello",
      "hi",
      "hey",
      "hola",
      "namaste",
      "good morning",
      "good afternoon",
      "good evening",
    ];
    const lowerMessage = message.toLowerCase().trim();
    return greetings.some(
      (g) =>
        lowerMessage === g ||
        lowerMessage.startsWith(g + " ") ||
        lowerMessage.startsWith(g + "!")
    );
  }, []);

  // Handle greeting with single welcome card
  const handleGreetingResponse = useCallback(() => {
    setIsTyping(true);

    // Single welcome message with prompts - shows every time user greets
    setTimeout(() => {
      const welcomeMessage = {
        type: "welcome_intro",
        content: {
          prompts: [
            "Show me total target and collected amount by region",
            "Create a dashboard showing bank-wise collections and RM performance this month",
            "What is the bank-wise collection summary?",
            "Build a dashboard showing disbursement vs target",
          ],
        },
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, welcomeMessage]);
      setIsTyping(false);
    }, 600);
  }, []);

  const handleSendMessage = useCallback(
    async (messageText = null, audioFileUrl = null, audioKey = null) => {
      const finalMessageText = String(messageText || inputValue || "");
      if (finalMessageText.trim() === "" && !audioKey) return;

      // Only add chat bubble if there's text message, not for audio-only
      if (finalMessageText.trim() !== "") {
        const userMessage = {
          type: "user",
          content: { text: finalMessageText },
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, userMessage]);

        // Check if this is a greeting - show animated intro instead of API call
        if (isGreeting(finalMessageText)) {
          setInputValue("");
          handleGreetingResponse();
          return;
        }

        // Check if this triggers a dynamic form
        const formSchema = getFormSchemaByKeyword(finalMessageText);
        if (formSchema) {
          setInputValue("");
          // Add form response
          const formMessage = {
            type: "dynamic_form",
            formSchema: formSchema,
            isBot: true,
            timestamp: new Date().toISOString(),
          };
          setChatHistory((prev) => [...prev, formMessage]);
          return;
        }

        // Check if this is an analysis question
        if (isAnalysisQuestion(finalMessageText)) {
          setInputValue("");
          await handleDataAnalysis(finalMessageText);
          return;
        }
      }

      // Clear input
      setInputValue("");

      // Check if workflow mode is active
      if (workflowMode) {
        // Send to workflow API
        await handleWorkflowMessage(finalMessageText);
      } else {
        // Send to regular chat API
        const roleCode = authService.getRoleCode();
        const requestBody = {
          user_id:
            currentUserId ||
            getUserId() ||
            authService.getUsername() || // Prioritize username
            authService.getUserId() ||
            "default_user",
          message: finalMessageText,
          ...(conversationId && { conversation_id: conversationId }),
          // Only include document_key when in Excel mode and a document is selected
          ...(dataSourceMode === "excel" &&
            selectedDocument && {
              document_key: selectedDocument.document_key,
            }),
          ...(roleCode && { roleCode }),
        };

        if (audioKey) {
          requestBody.key = audioKey;
        }

        await callChatApi(requestBody);
      }
    },
    [
      inputValue,
      callChatApi,
      isAnalysisQuestion,
      handleDataAnalysis,
      conversationId,
      currentUserId,
      selectedDocument,
      workflowMode,
      handleWorkflowMessage,
      getUserId,
      dataSourceMode,
      isGreeting,
      handleGreetingResponse,
    ]
  );

  // Optimized input handlers to prevent re-renders on every keystroke
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
        setInputValue("");
      }
    },
    [handleSendMessage]
  );

  const startRecording = useCallback(
    async (event) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        const audioChunks = [];

        setRecordingTime(0);

        // Start recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          // Try different audio formats for better browser compatibility
          const audioBlob = new Blob(audioChunks, {
            type: "audio/webm;codecs=opus",
          });
          const fileName = generateAudioFileName();

          // Use recorded time directly as duration (most reliable approach)
          const calculatedDuration = recordingTime;
          console.log(
            "Using recording duration:",
            calculatedDuration,
            "seconds"
          );

          // Create local blob URL as fallback for immediate playback
          const localBlobUrl = URL.createObjectURL(audioBlob);
          console.log("Created local blob URL:", localBlobUrl);
          console.log("Audio blob size:", audioBlob.size, "bytes");
          console.log("Audio blob type:", audioBlob.type);

          // Add voice message to chat history with local blob URL and duration
          const voiceMessage = {
            type: "user",
            content: {
              text: "",
              audio_file: localBlobUrl,
              fileName: fileName,
              isLocalBlob: true,
              duration: calculatedDuration,
            },
          };
          setChatHistory((prev) => [...prev, voiceMessage]);

          // Upload audio file in background
          try {
            const uploadResult = await uploadAudioFile(audioBlob, fileName);

            if (uploadResult.success && !uploadResult.isLocal) {
              console.log(
                "Audio uploaded successfully, key:",
                uploadResult.key
              );

              // Keep the local blob URL for playback, don't update to server URL
              // The VoiceWaveform component will use the local blob for playback

              // Send message with audio key only (no file URL)
              await handleSendMessage("", null, uploadResult.key);
            } else {
              console.error("Failed to upload audio:", uploadResult.error);
              // Keep the local blob URL if upload fails
            }
          } catch (error) {
            console.error("Error during audio upload:", error);
            // Keep the local blob URL if upload fails
          }
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    },
    [recordingTime, handleSendMessage]
  );

  // PDF Popup handlers
  const handleClosePdfPopup = useCallback(() => {
    setPdfPopupOpen(false);
    setPdfPopupData(null);
  }, []);

  // Add these functions for scheduler task polling
  const startTaskPolling = useCallback(
    async (jobId) => {
      const pollTask = async () => {
        try {
          const response = await fetch(
            `http://15.207.209.61:8400/executor/events/scheduler/status/${jobId}`
          );
          if (response.ok) {
            const taskData = await response.json();

            // Check if task is completed and has results
            if (taskData.status === "completed" && taskData.result) {
              const scheduledTask = scheduledTasks.get(jobId);

              // Create a new message for the completed task
              const completedMessage = {
                type: "scheduler_response",
                content: {
                  type: "scheduler_response",
                  content: `✅ Scheduled task "${
                    scheduledTask?.title || "Task"
                  }" completed successfully!`,
                  data: {
                    job_id: jobId,
                    status: "completed",
                    result: taskData.result,
                    schedule_details: {
                      params: {
                        run_date: scheduledTask?.runDate?.toISOString(),
                      },
                    },
                  },
                },
                isBot: true,
                timestamp: new Date().toISOString(),
              };

              // Add the completed task message to chat
              setMessages((prev) => [...prev, completedMessage]);

              // Show PDF popup if there's a download URL
              if (taskData.result.pdf_url || taskData.result.download_url) {
                setPdfPopupData({
                  title: scheduledTask?.title || "Scheduled Task",
                  download_url:
                    taskData.result.pdf_url || taskData.result.download_url,
                  metadata: {
                    data:
                      taskData.result.data ||
                      taskData.result.tabular_data ||
                      [],
                    message:
                      taskData.result.message || "PDF generated successfully",
                    success: true,
                  },
                });
                setPdfPopupOpen(true);
              }

              // Remove from scheduled tasks and stop polling
              setScheduledTasks((prev) => {
                const newTasks = new Map(prev);
                newTasks.delete(jobId);
                return newTasks;
              });

              clearInterval(taskPollingRef.current);
              taskPollingRef.current = null;
            }
          }
        } catch (error) {
          console.error("Error polling task status:", error);
        }
      };

      // Poll every 10 seconds
      taskPollingRef.current = setInterval(pollTask, 10000);

      // Also check immediately
      pollTask();
    },
    [scheduledTasks]
  );

  const stopTaskPolling = useCallback(() => {
    if (taskPollingRef.current) {
      clearInterval(taskPollingRef.current);
      taskPollingRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && isRecording && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
      // Pause the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  }, [mediaRecorder, isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && isRecording && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
      // Resume the timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  }, [mediaRecorder, isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioChunks([]);
      setMediaRecorder(null);

      // Clear the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Stop all tracks to release microphone
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [mediaRecorder, isRecording]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    setActionToConfirm(null);
  };

  const handleDialogConfirm = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    handleDialogClose();
  };

  const [configuratorCallTime, setConfiguratorCallTime] = useState(null);
  const [schedulerDelayTimeout, setSchedulerDelayTimeout] = useState(null);

  // Disabled event polling as requested
  // useEffect(() => {
  //   const pollEvents = async () => {
  //     try {
  //       const response = await fetch(process.env.NEXT_PUBLIC_EVENT_API_URL);
  //       if (response.ok) {
  //         const events = await response.json();
  //         if (events && events.length > 0) {
  //           // Only show scheduler events if 2 minutes have passed since configurator call
  //           const now = Date.now();
  //           if (configuratorCallTime && (now - configuratorCallTime) >= 120000) { // 2 minutes
  //             // Find events that match our active job IDs
  //             if (events && events.length > 0) {
  //               const matchingEvents = events.filter(event =>
  //                 activeJobIds.has(event.id) &&
  //                 event.status === 'completed' &&
  //                 event.metadata?.response_type === 'downloadable_report'
  //               );
  //
  //               matchingEvents.forEach(event => {
  //                 handleApiResponse(event);
  //                 // Remove completed job ID from active tracking
  //                 setActiveJobIds(prev => {
  //                   const newSet = new Set(prev);
  //                   newSet.delete(event.id);
  //                   return newSet;
  //                 });
  //               });
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Event polling error:', error);
  //     }
  //   };

  //   // Start polling every 20 seconds
  //   const interval = setInterval(pollEvents, 20000);
  //   setEventPollingInterval(interval);

  //   // Cleanup on unmount
  //   return () => {
  //     if (interval) {
  //       clearInterval(interval);
  //     }
  //   };
  // }, [handleApiResponse, configuratorCallTime, activeJobIds]);

  useEffect(() => {
    return () => {
      if (eventPollingInterval) {
        clearInterval(eventPollingInterval);
      }
    };
  }, [eventPollingInterval]);

  // Load username from localStorage on component mount
  // Sync currentUserId with auth user changes and reset state when user changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Use getUserId function to get the best available ID
    const newUserId = getUserId();

    console.log("🔄 User sync effect triggered:", {
      currentUserId,
      newUserId,
      userObject: !!user,
      storedUserId: authService.getUserId(),
      storedUsername: authService.getUsername(),
    });

    // Always update on initial mount if currentUserId is null
    if (!currentUserId && newUserId) {
      console.log("✅ Initial mount - setting currentUserId:", newUserId);
      setCurrentUserId(newUserId);
    }
    // User has changed - reset all chat state and caches
    else if (newUserId && newUserId !== currentUserId) {
      console.log(
        "🔄 User changed - resetting chat state:",
        currentUserId,
        "→",
        newUserId
      );

      // Reset chat state
      setChatHistory([]);
      setConversationId(null);
      setSessionId(null);
      setInputMessage("");
      setInputValue("");
      setCurrentResponseData(null);
      setPendingMessage("");
      setIsTyping(false);
      setIsLoading(false);

      // Reset document state
      setUploadedDocuments([]);
      setSelectedDocument(null);
      setAvailableDocuments([]);
      documentsCache.current = { data: null, timestamp: null };

      // Reset workflow state
      resetWorkflow();
      setWorkflowMode(false);

      // Reset PDF state
      setPdfUrls([]);
      setShowPdfPopup(false);
      setPdfPopupOpen(false);
      setPdfPopupData(null);

      // Update user ID
      setCurrentUserId(newUserId);

      console.log("✅ Chat state reset for new user:", newUserId);
    }
  }, [user, currentUserId, getUserId, resetWorkflow]); // Include all dependencies

  // Fetch documents on page mount and auto-select first document in excel mode
  useEffect(() => {
    const loadInitialDocuments = async () => {
      // Only run on client side and when user is available
      if (typeof window === "undefined" || !currentUserId) return;

      console.log("📄 Loading initial documents for user:", currentUserId);
      try {
        const docs = await fetchAvailableDocuments(true);

        // Auto-select first document if in excel mode and documents exist
        if (docs && docs.length > 0 && dataSourceMode === "excel") {
          const firstDoc = docs[0];
          setSelectedDocument(firstDoc);
          console.log(
            "📄 Auto-selected first document:",
            firstDoc.document_key
          );
        }
      } catch (error) {
        console.error("Failed to load initial documents:", error);
      }
    };

    loadInitialDocuments();
  }, [currentUserId]); // Re-run when user changes

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    // Only auto-scroll for new messages, not when loading conversation history
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];

      // Don't scroll for historical messages or if loading conversation history
      if (lastMessage.isHistorical) {
        return;
      }

      const now = new Date();
      const messageTime = new Date(lastMessage.timestamp);

      // Only scroll if the message is recent (within the last 10 seconds)
      // This prevents scrolling when loading old conversation history
      if (now - messageTime < 10000) {
        // Check if last message is a form
        if (lastMessage.type === "dynamic_form") {
          // For forms, wait longer and scroll to the form container heading
          const timer = setTimeout(() => {
            // Find the form message by data attribute
            const formMessages = document.querySelectorAll(
              '[data-message-type="dynamic_form"]'
            );
            const lastFormEl = formMessages[formMessages.length - 1];

            if (lastFormEl) {
              // Scroll to the top of the form with smooth, slower behavior
              const scrollOptions = {
                behavior: "smooth",
                block: "start", // Align to top of viewport
                inline: "nearest",
              };

              // Add extra offset to show some space above the form
              window.requestAnimationFrame(() => {
                lastFormEl.scrollIntoView(scrollOptions);
                // Slight adjustment to show header
                window.scrollBy({ top: -20, behavior: "smooth" });
              });
            } else {
              // Fallback to normal scroll
              scrollToBottom();
            }
          }, 500); // Give more time for form to fully render

          return () => clearTimeout(timer);
        } else {
          // For regular messages, scroll normally
          const timer = setTimeout(() => {
            scrollToBottom();
          }, 100);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [chatHistory]);

  // Only render chat content when selectedTab is 'chat'
  const renderMainContent = () => {
    if (selectedTab !== "chat") {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
            p: 4,
          }}
        >
          <Typography variant="h4" color="primary">
            {selectedTab.charAt(0).toUpperCase() +
              selectedTab.slice(1).replace(/([A-Z])/g, " $1")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This section is under development
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            py: 2,
            px: 0,
            pb: 0, // Remove bottom padding to prevent gap
            backgroundColor: "#f8f9fa",
            width: "100%",
            maxWidth: "100%",
            minHeight: 0, // Allow flex shrinking
            backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(47, 143, 239, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(47, 143, 239, 0.02) 0%, transparent 50%),
            linear-gradient(135deg, #f8f9fa 0%, #f8fafc 100%)
          `,
          }}
        >
          <Box
            sx={{
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "100%",
              pb: 2, // Add bottom padding so content doesn't hide behind input bar
            }}
          >
            {chatHistory.length === 0 ? (
              // Welcome Screen
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60vh",
                  px: { xs: 2, sm: 3 },
                  textAlign: "center",
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src="/ai-chatbot.png"
                    alt="MiFiX AI"
                    width={80}
                    height={80}
                    style={{ borderRadius: "50%" }}
                  />
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    color: "#1976d2",
                    mb: 2,
                  }}
                >
                  Welcome to MiFiX.ai
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#6c757d",
                    mb: 4,
                    maxWidth: "400px",
                    lineHeight: 1.6,
                  }}
                >
                  I&apos;m here to help you with any questions or queries you
                  might have. Feel free to ask me anything!
                </Typography>

                <Paper
                  sx={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: 3,
                    p: 2,
                    maxWidth: "350px",
                    position: "relative",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src="/ai-chatbot.png"
                        alt="MiFiX AI"
                        width={32}
                        height={32}
                        style={{ borderRadius: "50%" }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: "#495057" }}>
                      Hello! I&apos;m MiFiX.ai, your intelligent assistant. How
                      can I help you today?
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "20px",
                      left: "-8px",
                      width: 0,
                      height: 0,
                      borderRight: "8px solid #f8f9fa",
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                    }}
                  />
                </Paper>
              </Box>
            ) : isLoadingConversation ? (
              <ChatSkeleton />
            ) : (
              chatHistory.map((message, index) => (
                <MemoizedChatMessage
                  key={message.timestamp || `msg-${index}`}
                  message={message}
                  index={index}
                  onAction={handleAction}
                />
              ))
            )}
            {isTyping && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  mb: 2,
                  width: "100%",
                  px: { xs: 0.5, sm: 1, md: 1 }, // Match new native chat padding
                }}
              >
                <StellarThinking />
              </Box>
            )}
          </Box>
          <div ref={chatEndRef} />
        </Box>
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            flexShrink: 0, // Prevent shrinking
            position: "sticky", // Make it sticky
            bottom: 0,
            zIndex: 10, // Ensure it's above other content
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.75, sm: 2.5 },
              width: "100%",
              maxWidth: "100%",
              px: { xs: 0, sm: 3 },
              overflow: "hidden", // Prevent overflow
            }}
          >
            {/* File Upload Button with Popover */}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              id="file-upload-input"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  await handleFileUpload(file);
                  e.target.value = ""; // Reset input
                  handleFilePopoverClose();
                }
              }}
            />
            <Box sx={{ position: "relative" }}>
              <Tooltip
                title={
                  dataSourceMode === "excel"
                    ? selectedDocument
                      ? `Excel: ${
                          selectedDocument.original_filename ||
                          selectedDocument.filename ||
                          selectedDocument.document_key
                        }`
                      : "Excel Mode - Click to select file"
                    : "Database Mode - Connected to retriever"
                }
                arrow
              >
                <IconButton
                  onClick={(e) => {
                    // In Excel mode, single click opens popover
                    if (dataSourceMode === "excel") {
                      handleFilePopoverOpen(e);
                    }
                  }}
                  sx={{
                    color:
                      dataSourceMode === "excel"
                        ? selectedDocument
                          ? "#10b981"
                          : "#217346"
                        : "#1976d2",
                    backgroundColor:
                      dataSourceMode === "excel"
                        ? selectedDocument
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(33, 115, 70, 0.1)"
                        : "rgba(25, 118, 210, 0.1)",
                    "&:hover": {
                      backgroundColor:
                        dataSourceMode === "excel"
                          ? selectedDocument
                            ? "rgba(16, 185, 129, 0.2)"
                            : "rgba(33, 115, 70, 0.2)"
                          : "rgba(25, 118, 210, 0.2)",
                    },
                    borderRadius: "12px",
                    width: 50,
                    height: 50,
                    position: "relative",
                    overflow: "visible",
                    transition: "all 0.3s ease",
                  }}
                  disabled={isLoading || switchingDataSource}
                >
                  {isLoading || switchingDataSource ? (
                    <CircularProgress size={20} />
                  ) : dataSourceMode === "excel" ? (
                    <Image
                      src="/excel.png"
                      alt="Excel mode"
                      width={24}
                      height={24}
                      style={{
                        animation: selectedDocument
                          ? "bounce 0.6s ease-in-out"
                          : "none",
                      }}
                    />
                  ) : (
                    <Image
                      src="/database.svg"
                      alt="Database mode"
                      width={24}
                      height={24}
                    />
                  )}
                </IconButton>
              </Tooltip>

              {/* Switch Mode Badge */}
              <Tooltip
                title={
                  dataSourceMode === "excel"
                    ? "Switch to Database"
                    : "Switch to Excel"
                }
                arrow
                placement="top"
              >
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoading && !switchingDataSource) {
                      handleToggleDataSource();
                    }
                  }}
                  sx={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor:
                      dataSourceMode === "excel" ? "#1976d2" : "#217346",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.15)",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <SwapIcon sx={{ fontSize: 12, color: "#fff" }} />
                </Box>
              </Tooltip>
            </Box>

            {/* File Popover */}
            <Popover
              open={Boolean(filePopoverAnchor)}
              anchorEl={filePopoverAnchor}
              onClose={handleFilePopoverClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              PaperProps={{
                sx: {
                  mt: -1,
                  borderRadius: 2,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  minWidth: 320,
                  maxWidth: 400,
                  maxHeight: 500,
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Documents
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select a document or upload new
                </Typography>
              </Box>

              {loadingDocuments ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List sx={{ p: 0, maxHeight: 350, overflow: "auto" }}>
                  {/* Upload New File Option */}
                  <ListItem disablePadding>
                    <ListItemButton
                      component="label"
                      htmlFor="file-upload-input"
                      sx={{
                        py: 1.5,
                        borderBottom:
                          availableDocuments.filter((doc) => doc.in_memory)
                            .length > 0
                            ? 1
                            : 0,
                        borderColor: "divider",
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                        "&:hover": {
                          bgcolor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <UploadFileIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Upload New File"
                        secondary="Upload .xlsx, .xls, or .csv"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItemButton>
                  </ListItem>

                  {/* Available Documents - Show all documents (is_in_duckdb_cache from API) */}
                  {availableDocuments.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No documents available
                      </Typography>
                    </Box>
                  ) : (
                    availableDocuments.map((doc) => (
                      <ListItem key={doc.document_key} disablePadding>
                        <ListItemButton
                          onClick={() => handleSelectDocumentFromPopover(doc)}
                          selected={
                            selectedDocument?.document_key === doc.document_key
                          }
                          sx={{
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: "divider",
                            "&.Mui-selected": {
                              bgcolor: "rgba(16, 185, 129, 0.08)",
                              "&:hover": {
                                bgcolor: "rgba(16, 185, 129, 0.12)",
                              },
                            },
                          }}
                        >
                          <ListItemIcon>
                            <TableChartIcon sx={{ color: "#217346" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" noWrap>
                                {doc.original_filename || doc.filename}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {doc.shape
                                  ? `${doc.shape[0]} rows × ${doc.shape[1]} cols`
                                  : `${(doc.file_size / 1024).toFixed(1)} KB`}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))
                  )}
                </List>
              )}
            </Popover>

            <Box sx={{ flexGrow: 1 }}>
              <InputWithRecording
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onSendMessage={handleSendMessage}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onPauseRecording={pauseRecording}
                onResumeRecording={resumeRecording}
                onCancelRecording={cancelRecording}
                isRecording={isRecording}
                isPaused={isPaused}
                recordingTime={recordingTime}
                isTyping={isTyping || isAnalyzing}
                disabled={isAccessDenied}
                placeholder={
                  isAccessDenied
                    ? "Access limit exceeded - Contact support to continue"
                    : uploadedDocuments.length > 0
                    ? "Ask about your data..."
                    : workflowMode
                    ? "Type 'Hi' to start workflow..."
                    : "Type your message..."
                }
              />
            </Box>

            {/* Workflow Mode Toggle Button */}
            <Tooltip
              title={
                workflowMode ? "Switch to Chat Mode" : "Switch to Workflow Mode"
              }
              placement="top"
            >
              <IconButton
                onClick={handleToggleWorkflowMode}
                disabled={isTyping || isAnalyzing}
                sx={{
                  color: workflowMode ? "#667eea" : "#6b7280",
                  bgcolor: workflowMode
                    ? "rgba(102, 126, 234, 0.1)"
                    : "transparent",
                  border: `2px solid ${workflowMode ? "#667eea" : "#e5e7eb"}`,
                  width: 44,
                  height: 44,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: workflowMode
                      ? "rgba(102, 126, 234, 0.2)"
                      : "rgba(107, 114, 128, 0.1)",
                    transform: "scale(1.05)",
                    borderColor: workflowMode ? "#667eea" : "#9ca3af",
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                {workflowMode ? <WorkflowIcon /> : <ChatIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </>
    );
  };

  return (
    <ProtectedRoute>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          bgcolor: "background.default",
        }}
      >
        {/* Sidebar */}
        <Sidebar
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          onLoadConversation={loadConversationHistory}
          mobileOpen={mobileOpen}
          onMobileClose={handleDrawerToggle}
        />

        {/* Main Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: { xs: "100%", md: "calc(100% - 320px)" },
            ml: { xs: 0, md: "0px" },
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <AppBar
            position="static"
            sx={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.08)",
              borderBottom: "1px solid rgba(25, 118, 210, 0.1)",
              width: "100%",
              maxWidth: "100%",
              flexShrink: 0,
              backdropFilter: "blur(10px)",
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                minHeight: "64px",
                width: "100%",
                px: { xs: 1, sm: 2 },
              }}
            >
              {/* Left Side - Hamburger Menu and New Chat Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: "0 0 auto",
                }}
              >
                {/* Hamburger Menu for Mobile */}
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    display: { md: "none" },
                    color: "#1976d2",
                  }}
                >
                  <MenuIcon />
                </IconButton>

                {/* New Chat Icon Button */}
                {selectedTab === "chat" && (
                  <>
                    <IconButton
                      onClick={handleNewChat}
                      sx={{
                        color: "#1976d2",
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.15)",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Center Spacer */}
              <Box sx={{ flex: "1 1 auto" }} />

              {/* Right Side - Unified Status & User Panel */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
                  flex: "0 0 auto",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,249,250,0.9))",
                  borderRadius: 4,
                  px: { xs: 1, sm: 2 },
                  py: 1,
                  border: "1px solid rgba(25, 118, 210, 0.08)",
                  boxShadow: "0 4px 20px rgba(25, 118, 210, 0.08)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Bot Status Section */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pr: { xs: 1, md: 2 },
                    borderRight: {
                      xs: "none",
                      md: "1px solid rgba(25, 118, 210, 0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))",
                      border: "2px solid rgba(25, 118, 210, 0.2)",
                    }}
                  >
                    <Image
                      src="/ai-chatbot.png"
                      alt="MiFiX AI"
                      width={32}
                      height={32}
                      style={{
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 10,
                        height: 10,
                        backgroundColor: "#4caf50",
                        borderRadius: "50%",
                        border: "2px solid white",
                        boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
                      }}
                    />
                  </Box>
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#1976d2",
                        lineHeight: 1.2,
                      }}
                    >
                      MiFiX.ai
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#4caf50",
                        lineHeight: 1,
                        fontWeight: 500,
                      }}
                    >
                      Online
                    </Typography>
                  </Box>
                </Box>

                {/* User Section */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: { xs: "none", md: "block" },
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#1976d2",
                        lineHeight: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {user?.roles?.find(
                        (role) =>
                          role.productCode ===
                          authService.getCurrentProductCode()
                      )?.roleName ||
                        user?.roles?.[0]?.roleName ||
                        "User"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.8,
                        mt: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "#22C55E",
                          boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                          animation: "blink 2s infinite",
                          "@keyframes blink": {
                            "0%": {
                              opacity: 1,
                              boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                            },
                            "50%": {
                              opacity: 0.5,
                              boxShadow: "0 0 0 4px rgba(34, 197, 94, 0)",
                            },
                            "100%": {
                              opacity: 1,
                              boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                            },
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "#6B7280",
                          lineHeight: 1,
                          fontWeight: 500,
                        }}
                      >
                        Logged In
                      </Typography>
                    </Box>
                  </Box>
                  <UserMenu />
                </Box>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Render main content based on selected tab */}
          {renderMainContent()}
        </Box>

        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleDialogClose}
          handleConfirm={handleDialogConfirm}
          title={dialogConfig.title}
          message={dialogConfig.message}
        />
        <PDFNotificationPopup
          open={pdfPopupOpen}
          onClose={handleClosePdfPopup}
          data={pdfPopupData}
        />
      </Box>
    </ProtectedRoute>
  );
}
