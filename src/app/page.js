"use client";
import ConfirmationDialog from "@/components/mui/ConfirmationDialog";
import TypingIndicator from "@/components/mui/TypingIndicator";
import {
  Description as DocumentIcon,
  Menu as MenuIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Add as AddIcon,
  UploadFile as UploadFileIcon,
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
import Sidebar from "../components/Sidebar";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatMessage from "../components/mui/ChatMessage";
import ChatSkeleton from "../components/mui/ChatSkeleton";
import InputWithRecording from "../components/mui/InputWithRecording";
import PDFNotificationPopup from "../components/mui/PDFNotificationPopup";
import { generateAudioFileName, uploadAudioFile } from "../lib/audioUpload";
import { API_BASE_URL, CHAT_ENDPOINT } from "../lib/config";
import { dataAnalysisApi } from "../lib/api/dataAnalysisApi";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "../components/auth/UserMenu";
import authService from "../services/authService";
import { keyframes } from "@emotion/react";
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
  const [currentUserId, setCurrentUserId] = useState("");
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
          try {
            // Try to parse as JSON first
            const parsedContent = JSON.parse(msg.content);
            content = parsedContent;
          } catch {
            // If not JSON, treat as plain text
            content = {
              text: msg.content,
            };
          }

          return {
            type: "ai",
            content: content,
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

        // Add roleCode to the request
        const roleCode = authService.getRoleCode();
        if (roleCode) {
          requestBody.roleCode = roleCode;
        }

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
    [conversationId, handleApiResponse, isAccessDenied]
  );

  const handleAction = useCallback(
    async (action, componentId, data = {}) => {
      console.log("UI Action triggered:", { action, componentId, data });

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
    [currentResponseData, callChatApi, conversationId, currentUserId, sessionId]
  );

  // Fetch available documents
  const fetchAvailableDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/data-analysis/documents/${CONNECTION_ID}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      setAvailableDocuments(data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setAvailableDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, [CONNECTION_ID]);

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

  // File upload handler
  const handleFileUpload = useCallback(
    async (file) => {
      try {
        setIsLoading(true);
        const response = await dataAnalysisApi.uploadDocument(
          CONNECTION_ID,
          file,
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
    [CONNECTION_ID]
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

        // Always use chat endpoint for consistency
        const roleCode = authService.getRoleCode();
        const requestPayload = {
          user_id: currentUserId,
          message: question,
          ...(conversationId && { conversation_id: conversationId }),
          ...(selectedDocument && {
            document_key: selectedDocument.document_key,
          }),
          ...(roleCode && { roleCode }),
        };

        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
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
    [selectedDocument, conversationId, currentUserId]
  );

  const handleSendMessage = useCallback(
    async (messageText = null, audioFileUrl = null, audioKey = null) => {
      const finalMessageText = String(messageText || inputValue || "");
      if (finalMessageText.trim() === "" && !audioKey) return;

      // Only add chat bubble if there's text message, not for audio-only
      if (finalMessageText.trim() !== "") {
        const userMessage = {
          type: "user",
          content: { text: finalMessageText },
          timestamp: new Date().toISOString(), // Add timestamp for unique keys
        };
        setChatHistory((prev) => [...prev, userMessage]);

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

      setInputValue("");

      const roleCode = authService.getRoleCode();
      const requestBody = {
        user_id: currentUserId,
        message: finalMessageText,
        ...(conversationId && { conversation_id: conversationId }),
        ...(selectedDocument && {
          document_key: selectedDocument.document_key,
        }),
        ...(roleCode && { roleCode }),
      };

      // Add audio key if provided (instead of audio file)
      if (audioKey) {
        requestBody.key = audioKey;
      }

      await callChatApi(requestBody);
    },
    [
      inputValue,
      callChatApi,
      isAnalysisQuestion,
      handleDataAnalysis,
      conversationId,
      currentUserId,
      selectedDocument,
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
  useEffect(() => {
    const storedUsername = authService.getUsername();
    if (storedUsername) {
      setCurrentUserId(storedUsername);
    }
  }, []);

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
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            py: 2,
            px: 0,
            backgroundColor: "#f8f9fa",
            width: "100%",
            maxWidth: "100%",
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
                  Welcome to MiFiX AI
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
                      Hello! I&apos;m MiFiX AI, your intelligent assistant. How
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
              chatHistory.map((message, index) => {
                // Generate a stable unique key based on content and timestamp
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
                  : `message-stable-${index}`; // Use stable fallback instead of Date.now()

                return (
                  <ChatMessage
                    key={messageKey}
                    message={message}
                    index={index}
                    onAction={handleAction}
                  />
                );
              })
            )}
            {isTyping && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  mb: 2,
                  px: { xs: 1, sm: 2 },
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: { xs: "85%", sm: "70%", md: "60%" },
                    minWidth: "120px",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#f5f5f5",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "10px",
                      left: "-8px",
                      width: 0,
                      height: 0,
                      borderRight: "8px solid #f5f5f5",
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                    },
                  }}
                >
                  <TypingIndicator />
                </Paper>
              </Box>
            )}
          </Box>
          <div ref={chatEndRef} />
        </Box>
        <Box
          sx={{
            p: 2,
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              width: "100%",
              maxWidth: "100%",
              px: { xs: 0.2, sm: 3 },
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
            <Tooltip
              title={
                selectedDocument
                  ? `Selected: ${selectedDocument.filename}`
                  : "Select or Upload Document"
              }
              arrow
            >
              <IconButton
                onClick={handleFilePopoverOpen}
                sx={{
                  color: selectedDocument ? "#10b981" : "#666",
                  backgroundColor: selectedDocument
                    ? "rgba(16, 185, 129, 0.1)"
                    : "#f5f5f5",
                  "&:hover": {
                    backgroundColor: selectedDocument
                      ? "rgba(16, 185, 129, 0.2)"
                      : "#e0e0e0",
                  },
                  borderRadius: "12px",
                  width: 50,
                  height: 50,
                  position: "relative",
                  overflow: "hidden",
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : selectedDocument ? (
                  <Image
                    src="/excel.png"
                    alt="Excel file"
                    width={24}
                    height={24}
                    style={{
                      animation: "bounce 0.6s ease-in-out",
                    }}
                  />
                ) : (
                  <DocumentIcon />
                )}
              </IconButton>
            </Tooltip>

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

                  {/* Available Documents - Only show in_memory documents */}
                  {availableDocuments.filter((doc) => doc.in_memory).length ===
                  0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No documents loaded in memory
                      </Typography>
                    </Box>
                  ) : (
                    availableDocuments
                      .filter((doc) => doc.in_memory)
                      .map((doc) => (
                        <ListItem key={doc.document_key} disablePadding>
                          <ListItemButton
                            onClick={() => handleSelectDocumentFromPopover(doc)}
                            selected={
                              selectedDocument?.document_key ===
                              doc.document_key
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
                              {doc.in_memory ? (
                                <CloudDoneIcon sx={{ color: "#10b981" }} />
                              ) : (
                                <CloudOffIcon color="disabled" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{ flex: 1 }}
                                  >
                                    {doc.filename}
                                  </Typography>
                                  {doc.in_memory && (
                                    <Chip
                                      label="Ready"
                                      size="small"
                                      color="success"
                                      sx={{ height: 20, fontSize: "0.7rem" }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {doc.shape
                                    ? `${doc.shape[0]} rows × ${doc.shape[1]} cols`
                                    : "Not loaded"}
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
                    : "Type your message..."
                }
              />
            </Box>
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
                      MiFiX AI
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
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#1976d2",
                        lineHeight: 1.2,
                      }}
                    >
                      {user?.roles
                        ?.find((role) => role.productCode === "MIFIX-AI")
                        ?.roleName?.replace("Configurator", "User") || "User"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#666",
                        lineHeight: 1,
                        fontWeight: 500,
                      }}
                    >
                      Logged In
                    </Typography>
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
