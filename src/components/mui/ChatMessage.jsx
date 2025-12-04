"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  keyframes,
  Paper,
  Typography,
} from "@mui/material";
import {
  SmartToy,
  Lightbulb,
} from "@mui/icons-material";
import Image from "next/image";
import DynamicRenderer from "../../lib/dynamic-ui/DynamicRenderer";

import DataGridComponent from "../charts/DataGridComponent";
import AnalysisResponse from "./AnalysisResponse";
import AudioTranslationResponse from "./AudioTranslationResponse";
import DataTable from "./DataTable";
import DynamicDataVisualization from "./DynamicDataVisualization";
import IncentiveRulesResponse from "./IncentiveRulesResponse";
import SchedulerResponse from "./SchedulerResponse";
import VoiceWaveform from "./VoiceWaveform";
import AnalysisWidget from "../widgets/AnalysisWidget";
import AccessDeniedResponse from "./AccessDeniedResponse";
import AccessDeniedResponseSimple from "./AccessDeniedResponseSimple";
import EmailSentResponse from "./EmailSentResponse";
import DynamicFormRenderer from "../dynamic-form/DynamicFormRenderer";
import DynamicUIRenderer from "../dynamic-form/DynamicUIRenderer";
import { getFormSchemaByKeyword } from "../dynamic-form/sampleFormSchemas";
import { PhoneNumberDetector, HardcodedPhoneWidget } from "./PhoneWidget";

// Define keyframe animations
const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const popIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// Common styles object
const styles = {
  messageContainer: {
    display: "flex",
    mb: { xs: 1.5, sm: 2 },
    px: { xs: 0.5, sm: 1, md: 1 }, // Reduced padding for native chat look
    maxWidth: "100%",
    width: "100%",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessage: {
    maxWidth: { xs: "85%", sm: "70%", md: "50%", lg: "25%" },
    minWidth: { xs: "60px", sm: "120px" },
    p: { xs: 1.25, sm: 2 },
    borderRadius: { xs: "18px 18px 4px 18px", sm: "20px 20px 4px 20px" },
    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
    color: "#ffffff",
    position: "relative",
    wordWrap: "break-word",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    boxShadow: {
      xs: "0 1px 2px rgba(0, 0, 0, 0.1)",
      sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    animation: `${slideInRight} 0.3s ease-out`,
    transition: "all 0.2s ease",
    fontSize: { xs: "0.9375rem", sm: "0.95rem" },
    "&::before": {
      display: "none",
    },
  },
  botMessage: {
    maxWidth: { xs: "85%", sm: "75%", md: "70%", lg: "66%" },
    minWidth: { xs: "60px", sm: "130px" },
    p: { xs: 1.5, sm: 2 },
    borderRadius: { xs: "0 16px 16px 16px", sm: "0 20px 20px 20px" }, // More distinct AI shape
    backgroundColor: "#ffffff", // White background as requested
    color: "#1f2937", // Dark grey text for contrast
    position: "relative",
    wordWrap: "break-word",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", // Subtle shadow for depth
    border: "1px solid rgba(0,0,0,0.03)",
    animation: `${popIn} 0.3s ease-out`,
    transition: "all 0.2s ease",
    fontSize: { xs: "0.9375rem", sm: "0.95rem" },
    lineHeight: 1.6,
    "&::before": {
      display: "none",
    },
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    border: "1px solid #f44336",
    "&::before": {
      display: "none",
    },
  },
  typography: {
    fontWeight: 400,
    fontSize: { xs: "0.9375rem", sm: "0.95rem" },
    lineHeight: { xs: 1.5, sm: 1.5 },
    wordBreak: "break-word",
    overflowWrap: "break-word",
  },
  uploadSuccessCard: {
    background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
    border: "1px solid #4caf50",
    borderRadius: { xs: 2, sm: 3 },
    overflow: "hidden",
    position: "relative",
    mx: { xs: 0.5, sm: 0 },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: { xs: "3px", sm: "4px" },
      background: "linear-gradient(90deg, #4caf50, #66bb6a, #4caf50)",
      animation: "shimmer 2s ease-in-out infinite",
    },
  },
  iconContainer: {
    width: { xs: 48, sm: 56, md: 64 },
    height: { xs: 48, sm: 56, md: 64 },
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4caf50, #66bb6a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "pulse 2s ease-in-out infinite",
    boxShadow: {
      xs: "0 4px 16px rgba(76, 175, 80, 0.2)",
      sm: "0 8px 32px rgba(76, 175, 80, 0.3)",
    },
  },
  weatherContainer: {
    border: "1px solid #e0e0e0",
    borderRadius: { xs: 1.5, sm: 2 },
    p: { xs: 1.5, sm: 2 },
    bgcolor: "#f5f5f5",
    maxWidth: "100%",
  },
  dynamicDataContainer: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    px: { xs: 0, sm: 0 },
  },
};

// Stellar Thinking Animation Component
export const StellarThinking = () => (
  <Box 
    sx={{ 
      display: "flex", 
      gap: 1.5, 
      alignItems: "center", 
      px: { xs: 1, sm: 2 },
      py: 1,
    }}
  >
    {/* Avatar - Simple circular */}
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <img 
        src="/ai-chatbot.png" 
        alt="AI" 
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "cover",
        }} 
      />
    </Box>

    {/* Thinking Bubble - Simple pill shape */}
    <Box
      sx={{
        px: 2,
        py: 1.25,
        backgroundColor: "#fff",
        borderRadius: "18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        border: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        gap: 0.75,
      }}
    >
      {/* Animated dots */}
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
            animation: "dotBounce 1.4s infinite ease-in-out both",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes dotBounce {
            0%, 80%, 100% { 
              transform: scale(0.7); 
              opacity: 0.4; 
            }
            40% { 
              transform: scale(1); 
              opacity: 1; 
            }
          }
        `}
      </style>
    </Box>
  </Box>
);

const ChatMessage = ({ message, index, onAction }) => {
  // Handle saving analysis to dashboard
  const handleSaveAnalysis = (analysisData) => {
    try {
      const savedData = JSON.parse(
        localStorage.getItem("savedAnalyses") || "[]"
      );

      // Add unique ID if not present
      if (!analysisData.id) {
        analysisData.id = Date.now().toString();
      }

      savedData.push(analysisData);
      localStorage.setItem("savedAnalyses", JSON.stringify(savedData));
    } catch (error) {
      // Silent error handling
    }
  };
  const isUser = message.type === "user" && !message.isBot;
  const isBot =
    message.isBot || message.type === "schema" || message.type === "table";
  const isError = message.isError;

  // Use a stable key based on message content and index to prevent bouncing
  const generateMessageKey = () => {
    if (message.type === "schema") {
      return `schema-${message.content.id}-${index}`;
    }
    if (message.type === "table") {
      return `table-${index}-${message.content.data?.length || 0}`;
    }

    // For API responses with supporting_data, include question/data hash for uniqueness
    const apiResponse = message.content?.response || message.content;
    const analysisResult = apiResponse?.analysis_result || apiResponse;

    if (
      analysisResult?.supporting_data &&
      Array.isArray(analysisResult.supporting_data)
    ) {
      const question = apiResponse?.question || "";
      const dataLength = analysisResult.supporting_data.length;
      const firstRecordHash = analysisResult.supporting_data[0]
        ? Object.keys(analysisResult.supporting_data[0]).join("")
        : "";
      return `analysis-${index}-${question.replace(
        /[^a-zA-Z0-9]/g,
        ""
      )}-${dataLength}-${firstRecordHash}`;
    }

    return `message-${index}`;
  };

  const messageKey = generateMessageKey();

  const renderMessageContent = () => {
    console.log("🎨 renderMessageContent called for message:", message);

    // Check for query_error type - Failed queries
    if (message.type === "query_error") {
      const errorContent = message.content?.error || "An error occurred";
      return (
        <Box sx={styles.dynamicDataContainer}>
          <Card
            sx={{
              border: "1px solid #fee",
              backgroundColor: "#fef5f5",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Robot Avatar with Error Icon */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <SmartToy sx={{ fontSize: { xs: 28, sm: 32 }, color: "#dc2626" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#991b1b",
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      mb: 0.5,
                    }}
                  >
                    Oops! My circuits got tangled
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#7f1d1d",
                      fontSize: { xs: "0.875rem", sm: "0.95rem" },
                      fontStyle: "italic",
                    }}
                  >
                    Let me explain what happened...
                  </Typography>
                </Box>
              </Box>

              {/* AI Message */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  backgroundColor: "white",
                  borderRadius: 2,
                  border: "1px solid #fecaca",
                  mb: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#374151",
                    lineHeight: 1.6,
                    fontSize: { xs: "0.875rem", sm: "0.95rem" },
                    mb: 1.5,
                  }}
                >
                  Hi there! 🤖 I encountered a small glitch while processing your query. 
                  Here's what went wrong:
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#fef2f2",
                    borderRadius: 1.5,
                    borderLeft: "4px solid #dc2626",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "#991b1b",
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {errorContent}
                  </Typography>
                </Box>
              </Box>

              {/* Helpful Message */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  backgroundColor: "#eff6ff",
                  borderRadius: 2,
                  border: "1px solid #dbeafe",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Lightbulb sx={{ fontSize: 20, color: "#2563eb" }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "#1e40af",
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    }}
                  >
                    What you can do:
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1e3a8a",
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    lineHeight: 1.5,
                  }}
                >
                  • Try rephrasing your question
                  <br />
                  • Check if the data source is available
                  <br />• Ask me something else, and I'll do my best to help!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    // Check for data_query_result type - SQL query results
    // Handle multiple possible structures:
    // 1. message.response.type === "data_query_result"
    // 2. message.content.response.type === "data_query_result"
    const isDataQueryResult = 
      message.response?.type === "data_query_result" || 
      message.content?.response?.type === "data_query_result";
    
    if (isDataQueryResult) {
      const queryResult = message.response?.content || message.content?.response?.content;
      const showGraphOptions = message.content?.showGraphOptions !== false; // Default to true unless explicitly false
      
      console.log("✅ MATCH: Rendering data_query_result", queryResult);
      console.log("📊 Message structure:", {
        hasResponse: !!message.response,
        responseType: message.response?.type,
        hasContentResponse: !!message.content?.response,
        contentResponseType: message.content?.response?.type,
        queryResult: queryResult,
        showGraphOptions: showGraphOptions
      });
      
      if (queryResult?.results && Array.isArray(queryResult.results) && queryResult.results.length > 0) {
        console.log("✅ Rendering DynamicDataVisualization with results:", queryResult.results);
        return (
          <Box sx={styles.dynamicDataContainer}>
            <DynamicDataVisualization
              analysisResult={{
                analysis_result: {
                  supporting_data: queryResult.results,
                  // Include SQL query for dashboard widget refresh
                  generated_sql: queryResult.generated_sql || message.content?.generated_sql || '',
                },
                question: queryResult.natural_language_query || message.content?.natural_language_query || '',
                natural_language_query: queryResult.natural_language_query || message.content?.natural_language_query || '',
                // Include SQL at top level too for easier access
                generated_sql: queryResult.generated_sql || message.content?.generated_sql || '',
                content: {
                  generated_sql: queryResult.generated_sql || message.content?.generated_sql || '',
                },
              }}
              loading={false}
              isFromDashboard={false}
              showGraphOptions={showGraphOptions}
              onGraphRequest={(graphType) => {
                // User clicked a graph button - just log it, don't send to API
                console.log(`User selected ${graphType} chart`);
              }}
            />
          </Box>
        );
      } else {
        console.warn("⚠️ data_query_result matched but no valid results found:", {
          hasResults: !!queryResult?.results,
          isArray: Array.isArray(queryResult?.results),
          length: queryResult?.results?.length
        });
      }
    }

    // Check for form_schema type message (from page.js handler)
    if (message.type === "form_schema" && message.response?.schema) {
      console.log("✅ MATCH: Rendering form_schema type message");
      return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <DynamicUIRenderer
            data={message}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
              if (onAction) {
                onAction({ type: "form_submit", data });
              }
            }}
            onContinue={(nextFormId, formData) => {
              console.log("Continue to next form:", nextFormId, formData);
              if (onAction) {
                onAction({ type: "form_continue", nextFormId, formData });
              }
            }}
          />
        </Box>
      );
    }

    // Check for API response with form schema (new format) - PRIORITY CHECK
    if (message.response?.type === "form_schema" && message.response?.schema) {
      console.log("✅ MATCH: Rendering form schema from message.response");
      return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <DynamicUIRenderer
            data={message}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
              if (onAction) {
                onAction({ type: "form_submit", data });
              }
            }}
            onContinue={(nextFormId, formData) => {
              console.log("Continue to next form:", nextFormId, formData);
              if (onAction) {
                onAction({ type: "form_continue", nextFormId, formData });
              }
            }}
          />
        </Box>
      );
    }

    // Also check if message.content has the response structure
    if (
      message.content?.response?.type === "form_schema" &&
      message.content?.response?.schema
    ) {
      console.log("🎨 Rendering form schema from message.content.response");
      return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <DynamicUIRenderer
            data={message.content}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
              if (onAction) {
                onAction({ type: "form_submit", data });
              }
            }}
            onContinue={(nextFormId, formData) => {
              console.log("Continue to next form:", nextFormId, formData);
              if (onAction) {
                onAction({ type: "form_continue", nextFormId, formData });
              }
            }}
          />
        </Box>
      );
    }

    // Check for dynamic form schema (old format - backward compatibility)
    if (message.type === "dynamic_form" && message.formSchema) {
      return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <DynamicFormRenderer
            formSchema={message.formSchema}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
              if (onAction) {
                onAction({ type: "form_submit", data });
              }
            }}
            onContinue={(nextFormId) => {
              console.log("Continue to next form:", nextFormId);
              if (onAction) {
                onAction({ type: "form_continue", nextFormId });
              }
            }}
          />
        </Box>
      );
    }

    // Check for workflow form schema (workflow mode)
    if (message.type === "workflow_form" && message.formSchema) {
      return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <DynamicFormRenderer
            formSchema={message.formSchema}
            onSubmit={(data) => {
              console.log("Workflow form submitted:", data);
              if (onAction) {
                onAction({ 
                  type: "workflow_submit", 
                  data,
                  formSchema: message.formSchema,
                  workflowData: message.workflowData 
                });
              }
            }}
            onContinue={(nextFormId) => {
              console.log("Continue to next workflow form:", nextFormId);
              if (onAction) {
                onAction({ type: "workflow_continue", nextFormId });
              }
            }}
          />
        </Box>
      );
    }

    if (message.type === "schema") {
      return <DynamicRenderer schema={message.content} onAction={onAction} />;
    }

    if (message.type === "system" && message.ui_schema) {
      return (
        <DynamicRenderer
          key={`dynamic-${index}`}
          schema={message.ui_schema}
          onAction={onAction}
        />
      );
    }

    if (message.type === "system" && message.weather) {
      return (
        <Box sx={styles.weatherContainer}>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              color: "primary.main",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Weather Information - {message.weather.location}
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Temperature:</strong> {message.weather.temperature}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Feels Like:</strong> {message.weather.feels_like}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Description:</strong> {message.weather.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Humidity:</strong> {message.weather.humidity}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Wind Speed:</strong> {message.weather.wind_speed}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Pressure:</strong> {message.weather.pressure}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Visibility:</strong> {message.weather.visibility}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <strong>Cloudiness:</strong> {message.weather.cloudiness}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      );
    }

    if (message.type === "dynamic_data") {
      return (
        <Box sx={styles.dynamicDataContainer}>
          <DynamicDataVisualization
            analysisResult={{
              analysis_result: {
                supporting_data: message.content.data || [],
                generated_sql: message.content.generated_sql || message.content.sql_query || '',
              },
              question: message.content.question || message.content.natural_language_query || '',
              natural_language_query: message.content.natural_language_query || message.content.question || '',
              generated_sql: message.content.generated_sql || message.content.sql_query || '',
              content: {
                generated_sql: message.content.generated_sql || message.content.sql_query || '',
              },
            }}
            loading={false}
            isFromDashboard={false}
          />
        </Box>
      );
    }

    if (message.type === "upload_success") {
      return (
        <Box
          sx={{
            width: "100%",
            maxWidth: "none",
            animation: "slideInUp 0.5s ease-out",
          }}
        >
          <Card sx={styles.uploadSuccessCard}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  flexDirection: { xs: "column", sm: "row" },
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                <Box sx={styles.iconContainer}>
                  <Image
                    src="/excel.png"
                    alt="Excel file"
                    width={24}
                    height={24}
                    style={{
                      animation: "bounce 1s ease-in-out",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#2e7d32",
                      mb: 0.5,
                      fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                    }}
                  >
                    ✅ File Uploaded Successfully!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#388e3c",
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "0.9rem", md: "1rem" },
                    }}
                  >
                    {message.content.filename}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4caf50",
                      mt: 1,
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
                    }}
                  >
                    {message.content.shape} • Ready for analysis
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    if (message.type === "table") {
      return (
        <DataTable data={message.content.data} title={message.content.title} />
      );
    }

    if (message.type === "analysis") {
      return (
        <AnalysisResponse content={message.content} source={message.source} />
      );
    }

    if (message.type === "incentive_rules") {
      return (
        <IncentiveRulesResponse
          content={message.content}
          source={message.source}
        />
      );
    }

    // Handle status info_needed messages
    if (
      message.status === "info_needed" ||
      message.content?.status === "info_needed"
    ) {
      const messageText =
        message.message ||
        message.content?.message ||
        "Please provide more information.";
      return (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: "#e3f2fd",
            borderLeft: "4px solid #1976d2",
            borderRadius: "8px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}
              >
                ℹ️
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#1976d2",
                  mb: 0.5,
                  fontSize: "14px",
                }}
              >
                Information Needed
              </Typography>
              <Typography
                sx={{ color: "#424242", fontSize: "14px", lineHeight: 1.6 }}
              >
                {messageText}
              </Typography>
            </Box>
          </Box>
        </Paper>
      );
    }

    // Handle error messages with detailed content
    if (
      message.type === "error" ||
      message.content?.action === "none" ||
      (message.content?.message && message.content?.message.includes("Error"))
    ) {
      const errorMessage =
        message.content?.message || message.message || "An error occurred";
      const errorContent = message.content?.content || message.content?.result;

      return (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: "#ffebee",
            borderLeft: "4px solid #d32f2f",
            borderRadius: "8px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#d32f2f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}
              >
                ⚠️
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#d32f2f",
                  mb: 0.5,
                  fontSize: "14px",
                }}
              >
                Error
              </Typography>
              <Typography
                sx={{
                  color: "#424242",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  mb: 1,
                }}
              >
                {errorMessage}
              </Typography>
              {errorContent && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#666",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                >
                  {typeof errorContent === "string"
                    ? errorContent
                    : JSON.stringify(errorContent, null, 2)}
                </Paper>
              )}
            </Box>
          </Box>
        </Paper>
      );
    }

    if (message.type === "audio_translation") {
      return <AudioTranslationResponse content={message.content} />;
    }

    if (
      message.type === "scheduler_response" ||
      message.content?.type === "scheduler_response" ||
      message.content?.response?.type === "scheduler_response"
    ) {
      return <SchedulerResponse content={message.content} />;
    }

    // Handle access denied response - Use simplified version for better iOS compatibility
    if (message.type === "access_denied") {
      console.log(
        "✅ Rendering AccessDeniedResponseSimple for iOS compatibility",
        message
      );
      return (
        <AccessDeniedResponseSimple content={message.content || message} />
      );
    }

    // Handle email responses (both success and error)
    if (
      message.content?.type === "email_sent" ||
      message.content?.response?.type === "email_sent"
    ) {
      return <EmailSentResponse response={message.content} />;
    }

    // Handle email error responses
    if (
      message.content?.type === "error" &&
      message.content?.content?.includes?.("email")
    ) {
      return <EmailSentResponse response={message.content} />;
    }

    if (message.type === "data_analysis") {
      // Check if we have supporting_data structure
      const apiResponse = message.content.response || message.content;
      const analysisResult = apiResponse.analysis_result || apiResponse;

      if (
        analysisResult &&
        analysisResult.supporting_data &&
        Array.isArray(analysisResult.supporting_data)
      ) {
        return (
          <Box sx={{ width: "100%", maxWidth: "none" }}>
            <AnalysisWidget
              data={message.content}
              title={apiResponse.question || "Data Analysis"}
              onSave={handleSaveAnalysis}
            />
          </Box>
        );
      }

      // Fall back to old component for legacy data
      return (
        <DynamicDataVisualization
          analysisResult={message.content.analysisResult}
          loading={false}
          isFromDashboard={false}
        />
      );
    }

    // Handle API responses with new dynamic AnalysisWidget
    if (message.content && typeof message.content === "object") {
      // console.log('🔍 [DEBUG] ChatMessage full content:', JSON.stringify(message.content, null, 2));

      // Check for reconciliation data structure - either nested in result or direct properties
      const result = message.content.result || message.content.response?.result;
      const contentKeys = Object.keys(message.content);
      const isDirectReconciliation = contentKeys.some(
        (key) =>
          key.includes("_vs_") ||
          message.content[key]?.reconciliation_pair ||
          message.content[key]?.reconciliation_type
      );

      if ((result && typeof result === "object") || isDirectReconciliation) {
        // This is reconciliation data - use AnalysisWidget
        const reconciliationData = isDirectReconciliation
          ? { response: { result: message.content } }
          : message.content;

        return (
          <Box sx={{ width: "100%", maxWidth: "none" }}>
            <AnalysisWidget
              data={reconciliationData}
              title="Reconciliation Analysis"
              onSave={handleSaveAnalysis}
            />
          </Box>
        );
      }

      // Check for supporting_data structure - handle API response
      const apiResponse = message.content.response || message.content;
      const analysisResult = apiResponse.analysis_result || apiResponse;

      // console.log('🔍 [DEBUG] API response:', JSON.stringify(apiResponse, null, 2));
      // console.log('🔍 [DEBUG] Analysis result:', analysisResult);
      // console.log('🔍 [DEBUG] Has supporting_data:', !!analysisResult?.supporting_data);
      // console.log('🔍 [DEBUG] Supporting data length:', analysisResult?.supporting_data?.length);

      if (
        analysisResult &&
        analysisResult.supporting_data &&
        Array.isArray(analysisResult.supporting_data)
      ) {
        // console.log('🔍 [DEBUG] Using AnalysisWidget for supporting_data');
        return (
          <Box sx={{ width: "100%", maxWidth: "none" }}>
            <AnalysisWidget
              data={message.content}
              title={apiResponse.question || "Data Analysis"}
              onSave={handleSaveAnalysis}
            />
          </Box>
        );
      }

      // console.log('🔍 [DEBUG] No matching condition, falling through to old component');
    }

    // Handle voice messages
    if (message.content.audio_file) {
      return (
        <VoiceWaveform
          audioUrl={message.content.audio_file}
          duration={message.content.duration}
        />
      );
    }

    // Default text message
    // But first check one more time for form schema in content
    if (
      message.content &&
      typeof message.content === "object" &&
      message.content.response?.type === "form_schema"
    ) {
      console.log("🎨 Catching form schema in default handler");
      return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <DynamicUIRenderer
            data={message.content}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
              if (onAction) {
                onAction({ type: "form_submit", data });
              }
            }}
            onContinue={(nextFormId, formData) => {
              console.log("Continue to next form:", nextFormId, formData);
              if (onAction) {
                onAction({ type: "form_continue", nextFormId, formData });
              }
            }}
          />
        </Box>
      );
    }

    let textContent;
    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (message.content.text) {
      textContent = message.content.text;
    } else {
      // Format JSON with proper wrapping
      textContent = JSON.stringify(message.content, null, 2);
    }

    // Check if message contains trigger keywords for phone widget
    const triggerKeywords = [
      "contact",
      "call",
      "phone",
      "help",
      "support",
      "vaishakh",
      "reach",
      "talk",
      "speak",
    ];
    const shouldShowPhoneWidget =
      isBot &&
      triggerKeywords.some((keyword) =>
        textContent.toLowerCase().includes(keyword)
      );

    return (
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <Typography
          component="div"
          sx={{
            ...styles.typography,
            "& pre": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              margin: 0,
              fontFamily: "monospace",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
            },
          }}
        >
          <PhoneNumberDetector text={textContent} />
        </Typography>

        {/* Show phone widget only when trigger keywords are detected */}
        {shouldShowPhoneWidget && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <HardcodedPhoneWidget
              phoneNumber="8511044804"
              label="Need Help? Call Us"
              variant="card"
            />
          </Box>
        )}
      </Box>
    );
  };

  // Check if this is a data query result or dynamic data visualization
  const isDataQueryResult = 
    message.response?.type === "data_query_result" || 
    message.content?.response?.type === "data_query_result" ||
    message.type === "dynamic_data";

  // Determine message styling
  const getMessageStyle = () => {
    if (isUser) {
      return styles.userMessage;
    }

    // For data query results, remove the bubble styling completely
    // This allows the internal components (Table, AI Prompt) to render as separate elements
    if (isDataQueryResult) {
      return {
        maxWidth: "100%",
        width: "100%",
        p: 0,
        backgroundColor: "transparent",
        boxShadow: "none",
        "&::before": {
          display: "none",
        },
      };
    }

    // Full width for dynamic forms, workflow forms, and form schemas
    if (
      message.type === "dynamic_form" ||
      message.type === "workflow_form" ||
      message.type === "form_schema" ||
      message.response?.type === "form_schema" ||
      message.content?.response?.type === "form_schema"
    ) {
      return {
        ...styles.botMessage,
        maxWidth: "100%",
        width: "100%",
        p: { xs: 2, sm: 3 },
        "&::before": {
          display: "none", // Remove the chat bubble tail
        },
      };
    }

    if (isError) {
      return { ...styles.botMessage, ...styles.errorMessage };
    }
    return styles.botMessage;
  };

  return (
    <Box
      key={messageKey}
      data-message-type={message.type}
      data-message-index={index}
      sx={{
        ...styles.messageContainer,
        ...(isUser ? styles.userMessageContainer : styles.botMessageContainer),
        alignItems: "flex-start",
        gap: 2,
        animation: !isUser ? "messageSlideIn 0.3s ease-out" : "none",
        "@keyframes messageSlideIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* AI Avatar - Circular, outside bubble */}
      {!isUser && !isDataQueryResult && (
        <Box
          sx={{
            width: { xs: 38, sm: 42 },
            height: { xs: 38, sm: 42 },
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 3px 10px rgba(59, 130, 246, 0.2)",
            overflow: "hidden",
          }}
        >
          <img 
            src="/ai-chatbot.png" 
            alt="AI" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
            }} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SmartToyIcon" style="color: white; font-size: 20px;"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM8 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 5H8v-2h6v2zm.5-5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"></path></svg>';
            }}
          />
        </Box>
      )}

      <Paper elevation={!isUser && !isDataQueryResult ? 0 : 1} sx={getMessageStyle()}>
        {renderMessageContent()}
      </Paper>
    </Box>
  );
};

// Simple memoization to prevent re-renders during typing
const areEqual = (prevProps, nextProps) => {
  // Only re-render if message content actually changed or index changed
  return (
    prevProps.index === nextProps.index &&
    JSON.stringify(prevProps.message) === JSON.stringify(nextProps.message) &&
    prevProps.onAction === nextProps.onAction
  );
};

export default React.memo(ChatMessage, areEqual);
