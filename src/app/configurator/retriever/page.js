"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Skeleton,
  Fade,
  Grow,
} from "@mui/material";
import {
  Storage as StorageIcon,
  AccountTree as GraphIcon,
  Psychology as AIIcon,
  TableChart as TableIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  PlayArrow as PlayIcon,
  Build as BuildIcon,
  Code as CodeIcon,
  Hub,
} from "@mui/icons-material";
import HubIcon from "@mui/icons-material/Hub";
import Navbar from "@/components/layout/Navbar";
import DatabaseConnection from "@/components/retriever/DatabaseConnection";
import TableSelector from "@/components/retriever/TableSelector";
import KnowledgeGraphBuilder from "@/components/retriever/KnowledgeGraphBuilder";
import KnowledgeGraphManager from "@/components/retriever/KnowledgeGraphManager";
import SQLQueryGenerator from "@/components/retriever/SQLQueryGenerator";
import SQLExecutor from "@/components/retriever/SQLExecutor";
import RetrieverSidebar from "@/components/retriever/RetrieverSidebar";
import dynamic from "next/dynamic";

const SelfLearningPage = dynamic(() => import("./self-learning/page"), {
  ssr: false,
});
const TemplateWorkflowPage = dynamic(() => import("./template-workflow/page"), {
  ssr: false,
});
import fastKgService from "@/services/fastKgService";
import useRetrieverStore from "@/store/retrieverStore";

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`retriever-tabpanel-${index}`}
      aria-labelledby={`retriever-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const RetrieverConfiguratorPage = () => {
  const { currentConnection, setCurrentConnection } = useRetrieverStore();
  const [activeStep, setActiveStep] = useState(0);
  const [kgExists, setKgExists] = useState(false);
  const [kgStatus, setKgStatus] = useState(null);
  const [checkingKgStatus, setCheckingKgStatus] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkKgStatus = useCallback(async () => {
    if (!currentConnection?.id) return;

    try {
      setCheckingKgStatus(true);
      const response = await fastKgService.getKgStatus(currentConnection.id);

      if (response.data.success && response.data.kg_exists) {
        setKgExists(true);
        setKgStatus(response.data.statistics);
        // If KG exists, skip to Query step
        setActiveStep(2);
      } else {
        setKgExists(false);
        setKgStatus(null);
        // If no KG, stay on Build step
        setActiveStep(1);
      }
    } catch (error) {
      console.error("Failed to check KG status:", error);
      setKgExists(false);
      setKgStatus(null);
    } finally {
      setCheckingKgStatus(false);
    }
  }, [currentConnection?.id]);

  // Check KG status when connection changes
  useEffect(() => {
    if (currentConnection?.id) {
      checkKgStatus();
    }
  }, [currentConnection?.id, checkKgStatus]);

  const handleConnectionSuccess = (data) => {
    setCurrentConnection(data);
    checkKgStatus();
  };

  const handleTablesSelected = (tableData) => {
    if (tableData.selectMode === "all") {
      setSelectedTables([]);
    } else {
      setSelectedTables(tableData.selectedTables);
    }
  };

  const handleKGBuilt = (status) => {
    setKgStatus(status);
    setKgExists(true);
    // Move to Query step after successful build
    setActiveStep(2);
  };

  const handleStepClick = (step) => {
    // Step 0: Connection - Always accessible
    if (step === 0) {
      setActiveStep(0);
      return;
    }

    // Step 1: Build/Manage KG - Accessible if connection exists
    if (step === 1) {
      if (!currentConnection) return;
      setActiveStep(1);
      return;
    }

    // Step 2: Query - Only if KG exists
    if (step === 2) {
      if (!kgExists) return;
      setActiveStep(2);
      return;
    }

    // Step 3: Template Workflow - Only if KG exists
    if (step === 3) {
      if (!kgExists) return;
      setActiveStep(3);
      return;
    }

    // Step 4: Self Learning - Only if KG exists
    if (step === 4) {
      if (!kgExists) return;
      setActiveStep(4);
      return;
    }

    // Step 5: SQL Executor - Accessible if connection exists
    if (step === 5) {
      if (!currentConnection) return;
      setActiveStep(5);
      return;
    }
  };

  const steps = [
    {
      id: 0,
      title: "Database Connection",
      description: "Connect to your database",
      icon: StorageIcon,
      color: "#0078d7",
      completed: !!currentConnection,
      active: activeStep === 0,
      disabled: false,
    },
    {
      id: 1,
      title: "Manage Knowledge Base",
      description: kgExists
        ? "Edit tables and sync schema"
        : "Select tables and build knowledge base",
      icon: Hub,
      color: "#48bb78",
      completed: kgExists,
      active: activeStep === 1,
      disabled: !currentConnection,
    },
    {
      id: 2,
      title: "Query & Analyze",
      description: "Ask questions in natural language",
      icon: AIIcon,
      color: "#9c27b0",
      completed: false,
      active: activeStep === 2,
      disabled: !kgExists,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "#f8fafc",
      }}
    >
      {/* Navbar */}
      <Navbar
        title="Retriever Configurator"
        subtitle="Connect, build, and query your database with AI"
        icon={BuildIcon}
      />

      {/* Main Content Area */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            p: 3,
            borderRight: "1px solid #e2e8f0",
          }}
        >
          <RetrieverSidebar
            activeStep={activeStep}
            onStepChange={handleStepClick}
            connectionExists={!!currentConnection}
            kgExists={kgExists}
          />
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Status Bar */}
          {currentConnection && (
            <Box sx={{ p: 3, pb: 0 }}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<StorageIcon />}
                  label={
                    currentConnection.connection_name ||
                    currentConnection.database
                  }
                  sx={{
                    bgcolor: "#0078d7",
                    color: "white",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "white" },
                  }}
                />
                {kgExists && (
                  <Chip
                    icon={<CheckIcon />}
                    label={`Knowledge Graph Active • ${
                      kgStatus?.table_count || 0
                    } Tables`}
                    sx={{
                      bgcolor: "#48bb78",
                      color: "white",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                )}
                {checkingKgStatus && (
                  <Chip
                    icon={
                      <CircularProgress size={16} sx={{ color: "white" }} />
                    }
                    label="Checking Status..."
                    sx={{
                      bgcolor: "#ed8936",
                      color: "white",
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Card
              sx={{
                flex: 1,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Step 0: Connection */}
                {activeStep === 0 && (
                  <Fade in timeout={300}>
                    <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
                      {loading ? (
                        <Box>
                          <Skeleton
                            variant="rectangular"
                            height={200}
                            sx={{ borderRadius: 2, mb: 2 }}
                          />
                          <Skeleton
                            variant="text"
                            height={40}
                            width="60%"
                            sx={{ mb: 1 }}
                          />
                          <Skeleton variant="text" height={30} width="40%" />
                        </Box>
                      ) : (
                        <DatabaseConnection
                          onConnectionSuccess={handleConnectionSuccess}
                        />
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Step 1: Build KG */}
                {activeStep === 1 && (
                  <Fade in timeout={300}>
                    <Box sx={{ p: 4, height: "100%", overflow: "auto" }}>
                      {currentConnection && !kgExists ? (
                        <Box>
                          {loading ? (
                            <Box>
                              <Skeleton
                                variant="rectangular"
                                height={150}
                                sx={{ borderRadius: 2, mb: 2 }}
                              />
                              <Grid container spacing={2}>
                                {[1, 2, 3, 4].map((i) => (
                                  <Grid item xs={6} md={3} key={i}>
                                    <Skeleton
                                      variant="rectangular"
                                      height={80}
                                      sx={{ borderRadius: 1 }}
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          ) : (
                            <>
                              <TableSelector
                                connectionData={currentConnection}
                                onTablesSelected={handleTablesSelected}
                              />
                              <Box sx={{ mt: 3 }}>
                                <KnowledgeGraphBuilder
                                  connectionId={currentConnection.id}
                                  schema={
                                    currentConnection.schema_name ||
                                    currentConnection.schema
                                  }
                                  selectedTables={selectedTables}
                                  onKGBuilt={handleKGBuilt}
                                />
                              </Box>
                            </>
                          )}
                        </Box>
                      ) : kgExists ? (
                        <KnowledgeGraphManager
                          connectionId={currentConnection.id}
                          schema={
                            currentConnection.schema_name ||
                            currentConnection.schema
                          }
                          kgStatus={kgStatus}
                          onUpdate={checkKgStatus}
                        />
                      ) : (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: "#ed893615",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 3,
                            }}
                          >
                            <UncheckedIcon
                              sx={{ fontSize: 40, color: "#ed8936" }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
                          >
                            Connect to Database First
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", maxWidth: 400, mx: "auto" }}
                          >
                            Please establish a database connection before
                            building the knowledge graph.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Step 2: Query */}
                {activeStep === 2 && (
                  <Fade in timeout={300}>
                    <Box sx={{ height: "100%", overflow: "auto" }}>
                      {kgExists ? (
                        <SQLQueryGenerator />
                      ) : (
                        <Box sx={{ textAlign: "center", py: 8, px: 4 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: "#f5656515",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 3,
                            }}
                          >
                            <AIIcon sx={{ fontSize: 40, color: "#f56565" }} />
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
                          >
                            Knowledge Graph Required
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", maxWidth: 400, mx: "auto" }}
                          >
                            Please build the knowledge graph first before you
                            can start querying your data.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Step 3: Template Workflow */}
                {activeStep === 3 && (
                  <Fade in timeout={300}>
                    <Box sx={{ height: "100%", overflow: "hidden" }}>
                      {kgExists ? (
                        <TemplateWorkflowPage />
                      ) : (
                        <Box sx={{ textAlign: "center", py: 8, px: 4 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: "#667eea15",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 3,
                            }}
                          >
                            <UncheckedIcon
                              sx={{ fontSize: 40, color: "#667eea" }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
                          >
                            Knowledge Graph Required
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", maxWidth: 400, mx: "auto" }}
                          >
                            Please build the knowledge graph first before you
                            can access the template workflow.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Step 4: Self Learning */}
                {activeStep === 4 && (
                  <Fade in timeout={300}>
                    <Box sx={{ height: "100%", overflow: "hidden" }}>
                      {kgExists ? (
                        <SelfLearningPage />
                      ) : (
                        <Box sx={{ textAlign: "center", py: 8, px: 4 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: "#f59e0b15",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 3,
                            }}
                          >
                            <UncheckedIcon
                              sx={{ fontSize: 40, color: "#f59e0b" }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
                          >
                            Knowledge Graph Required
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", maxWidth: 400, mx: "auto" }}
                          >
                            Please build the knowledge graph first before you
                            can access the self-learning portal.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Step 5: SQL Executor */}
                {activeStep === 5 && (
                  <Fade in timeout={300}>
                    <Box sx={{ height: "100%", overflow: "hidden", p: 3 }}>
                      {currentConnection ? (
                        <SQLExecutor />
                      ) : (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: "#00bcd415",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 3,
                            }}
                          >
                            <UncheckedIcon
                              sx={{ fontSize: 40, color: "#00bcd4" }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}
                          >
                            Connect to Database First
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", maxWidth: 400, mx: "auto" }}
                          >
                            Please establish a database connection before
                            executing SQL queries.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RetrieverConfiguratorPage;
