"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  PlayArrow,
  Save,
  Settings,
  AccountTree,
  ViewList,
  Add,
  Edit,
  Delete,
  DragIndicator,
  Link as LinkIcon,
  CheckCircle,
  Person,
  Agriculture,
  AccountBalance,
  Fingerprint,
  Description,
  Visibility,
  Close,
} from "@mui/icons-material";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import DynamicUIRenderer from "@/components/dynamic-form/DynamicUIRenderer";
import { getFormSchemaById } from "@/components/dynamic-form/sampleFormSchemas";
import ApiConfigDialog from "@/components/configurator/ApiConfigDialog";
import FieldManagerDialog from "@/components/configurator/FieldManagerDialog";
import FormPreviewNode from "@/components/configurator/FormPreviewNode";

const UIConfiguratorPage = () => {
  const router = useRouter();
  const theme = useTheme();

  const [componentLibrary, setComponentLibrary] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [fieldManagerOpen, setFieldManagerOpen] = useState(false);
  const [apiConfigDialogOpen, setApiConfigDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [workflowName, setWorkflowName] = useState(
    "UI Workflow Configurator 1"
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [fullPreviewSchema, setFullPreviewSchema] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);

  // Define custom node types
  const nodeTypes = React.useMemo(
    () => ({
      formPreview: FormPreviewNode,
    }),
    []
  );

  // Load component library on mount
  useEffect(() => {
    loadComponentLibrary();
  }, []);

  const loadComponentLibrary = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/configurator/components');
      // const data = await response.json();

      // Mock data for now
      const mockComponents = {
        library: {
          components: [
            {
              id: "l1_customer_info",
              name: "L1 - Customer Information",
              description: "Complete customer details for HDFC onboarding",
              category: "onboarding",
              icon: "person",
              color: "#1976d2",
              estimated_time: "5-7 mins",
              fields_count: 45,
              sections_count: 7,
              is_entry_point: true,
              is_exit_point: false,
              default_next: "instant_kcc",
            },
            {
              id: "instant_kcc",
              name: "L2 - Instant KCC",
              description: "Agriculture loan and land information",
              category: "loan",
              icon: "agriculture",
              color: "#2e7d32",
              estimated_time: "8-10 mins",
              fields_count: 35,
              sections_count: 6,
              default_next: "bank_account_details",
            },
            {
              id: "bank_account_details",
              name: "L3 - Bank Account Details",
              description: "Disbursement account information",
              category: "banking",
              icon: "account_balance",
              color: "#f57c00",
              estimated_time: "3-5 mins",
              fields_count: 15,
              default_next: "esign_documents",
            },
            {
              id: "esign_documents",
              name: "E-Sign Documents",
              description: "Digital signature for loan documents",
              category: "verification",
              icon: "fingerprint",
              color: "#9c27b0",
              estimated_time: "2-3 mins",
              default_next: "loan_disbursement",
            },
            {
              id: "loan_disbursement",
              name: "Loan Disbursement Success",
              description: "Confirmation and completion",
              category: "completion",
              icon: "check_circle",
              color: "#4caf50",
              estimated_time: "1 min",
              is_exit_point: true,
            },
          ],
        },
      };

      setComponentLibrary(mockComponents.library.components);
    } catch (error) {
      console.error("Error loading component library:", error);
      setSnackbar({
        open: true,
        message: "Failed to load component library",
        severity: "error",
      });
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      person: Person,
      agriculture: Agriculture,
      account_balance: AccountBalance,
      fingerprint: Fingerprint,
      check_circle: CheckCircle,
      description: Description,
    };
    return iconMap[iconName] || Description;
  };

  const handleAddNodeToCanvas = (component, customPosition = null) => {
    // Get the full form schema
    const schema = getFormSchemaById(component.id);

    if (!schema) {
      setSnackbar({
        open: true,
        message: `Schema not found for ${component.id}`,
        severity: "error",
      });
      return;
    }

    const nodeId = `node_${Date.now()}`;
    const position = customPosition || {
      x: 250 + nodes.length * 50,
      y: 100 + nodes.length * 50,
    };

    const newNode = {
      id: nodeId,
      type: "formPreview",
      position: position,
      data: {
        component: component,
        schema: schema,
        onDelete: () => handleDeleteNode(nodeId),
        onConfigure: (comp) => handleConfigureNode(comp),
        onPreview: (comp) => handleFullPreview(comp),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    setSnackbar({
      open: true,
      message: `Added ${component.name} to canvas`,
      severity: "success",
    });
  };

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    setSnackbar({
      open: true,
      message: "Component removed from canvas",
      severity: "info",
    });
  }, []);

  const handleConfigureNode = useCallback((component) => {
    const schema = getFormSchemaById(component.id);
    setSelectedComponent(component);
    setSelectedSchema(schema);
    setFieldManagerOpen(true);
  }, []);

  const handleFullPreview = useCallback((component) => {
    const schema = getFormSchemaById(component.id);
    setFullPreviewSchema(schema);
    setFullPreviewOpen(true);
  }, []);

  const handlePreviewComponent = (component) => {
    setSelectedComponent(component);
    setPreviewDialogOpen(true);
  };

  const handleConfigureFieldApi = (field) => {
    setSelectedField(field);
    setApiConfigDialogOpen(true);
  };

  const handleSaveApiConfig = useCallback(
    (apiConfig) => {
      if (!selectedComponent || !selectedField) return;

      // Update the node's schema with the API configuration
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.component?.id === selectedComponent.id) {
            const updatedSchema = { ...node.data.schema };
            updatedSchema.sections = updatedSchema.sections.map((section) => ({
              ...section,
              fields: section.fields.map((field) =>
                field.id === selectedField.id
                  ? { ...field, api: apiConfig }
                  : field
              ),
            }));

            return {
              ...node,
              data: {
                ...node.data,
                schema: updatedSchema,
              },
            };
          }
          return node;
        })
      );

      setSnackbar({
        open: true,
        message: `API configured for ${selectedField.label}`,
        severity: "success",
      });

      setApiConfigDialogOpen(false);
      setSelectedField(null);
    },
    [selectedComponent, selectedField]
  );

  // Drag and Drop handlers
  const handleDragStart = (event, component) => {
    setDraggedComponent(component);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (!draggedComponent) return;

    // Get the ReactFlow bounds
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();

    // Calculate position relative to the ReactFlow canvas
    const position = {
      x: event.clientX - reactFlowBounds.left - 160, // Offset for better placement
      y: event.clientY - reactFlowBounds.top - 100,
    };

    handleAddNodeToCanvas(draggedComponent, position);
    setDraggedComponent(null);
  };

  const handleConnect = (params) => {
    const newEdge = {
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: theme.palette.primary.main,
      },
      style: {
        strokeWidth: 2,
        stroke: theme.palette.primary.main,
      },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  };

  const handleSaveWorkflow = async () => {
    const workflowConfig = {
      workflow: {
        id: `workflow_${Date.now()}`,
        name: workflowName,
        description: "Custom workflow created with UI Configurator",
        version: "1.0.0",
        created_at: new Date().toISOString(),
        nodes: nodes.map((node, index) => ({
          node_id: node.id,
          component_id: node.data.component.id,
          position: node.position,
          label: node.data.component.name,
          is_start_node: index === 0,
          is_end_node: index === nodes.length - 1,
          connections: edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => ({
              target_node_id: edge.target,
              condition: { type: "always" },
              label: "Next",
            })),
        })),
      },
    };

    console.log(
      "Workflow Configuration:",
      JSON.stringify(workflowConfig, null, 2)
    );

    setSnackbar({
      open: true,
      message: "Workflow saved! Check console for JSON",
      severity: "success",
    });
  };

  const handleTestWorkflow = () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: "Add components to test the workflow",
        severity: "warning",
      });
      return;
    }

    setSnackbar({
      open: true,
      message: "Testing workflow... (TODO: Implement)",
      severity: "info",
    });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Professional Navbar */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              gap: 3,
            }}
          >
            {/* Left Section - Logo & Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Back to Configurator">
                <IconButton
                  onClick={() => router.push("/configurator")}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  pl: 1.5,
                  borderLeft: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountTree
                    sx={{
                      fontSize: 20,
                      color: "primary.main",
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Workflow Builder
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      lineHeight: 1,
                    }}
                  >
                    Visual form composer
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Center Section - Workflow Name */}
            <Box sx={{ flex: 1, maxWidth: 400, mx: 4 }}>
              <TextField
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name..."
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha("#000", 0.02),
                    fontSize: "0.875rem",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover": {
                      bgcolor: alpha("#000", 0.04),
                      "& fieldset": {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "primary.main",
                        borderWidth: "1px",
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Right Section - Actions */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrow fontSize="small" />}
                onClick={handleTestWorkflow}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  borderColor: alpha("#000", 0.12),
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    color: "primary.main",
                  },
                }}
              >
                Test
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Save fontSize="small" />}
                onClick={handleSaveWorkflow}
                disableElevation
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Component Library Drawer */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: 320,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 320,
              boxSizing: "border-box",
              position: "relative",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "#f5f5f5",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ViewList /> Component Library
            </Typography>
          </Box>

          <List sx={{ p: 2 }}>
            {componentLibrary.map((component) => {
              const IconComp = getIconComponent(component.icon);

              return (
                <Card
                  key={component.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component)}
                  sx={{
                    mb: 2,
                    border: `2px solid ${alpha(component.color, 0.2)}`,
                    cursor: "grab",
                    "&:active": {
                      cursor: "grabbing",
                    },
                    "&:hover": {
                      border: `2px solid ${component.color}`,
                      boxShadow: `0 4px 12px ${alpha(component.color, 0.3)}`,
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: alpha(component.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                        }}
                      >
                        <IconComp sx={{ color: component.color }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {component.name}
                        </Typography>
                        <Chip
                          label={component.category}
                          size="small"
                          sx={{
                            fontSize: "0.65rem",
                            height: 18,
                            bgcolor: alpha(component.color, 0.1),
                            color: component.color,
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1, color: "text.secondary" }}
                    >
                      {component.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <DragIndicator
                        sx={{ fontSize: 14, color: "text.disabled" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        Drag to canvas or click Add
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => handleAddNodeToCanvas(component)}
                        sx={{
                          flex: 1,
                          borderColor: component.color,
                          color: component.color,
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handlePreviewComponent(component)}
                      >
                        Preview
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </List>
        </Drawer>

        {/* Canvas */}
        <Box
          sx={{ flex: 1, position: "relative" }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>

          {/* Empty State */}
          {nodes.length === 0 && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <AccountTree
                sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Drag & Drop to Start Building
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Drag components from the library or click Add button
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Preview Dialog (Basic Component Info) */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Component Preview: {selectedComponent?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a preview of the component. Full schema rendering requires
            backend integration.
          </Alert>
          {selectedComponent && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedComponent.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fields:
                  </Typography>
                  <Typography variant="h6">
                    {selectedComponent.fields_count}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    estimated Time:
                  </Typography>
                  <Typography variant="h6">
                    {selectedComponent.estimated_time}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Full Form Preview Dialog - Minimal Mobile Mockup */}
      <Dialog
        open={fullPreviewOpen}
        onClose={() => setFullPreviewOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            maxHeight: "95vh",
            bgcolor: alpha(theme.palette.grey[100], 0.5),
            borderRadius: 3,
            position: "relative",
          },
        }}
      >
        {/* Close Button - Top Right */}
        <IconButton
          onClick={() => setFullPreviewOpen(false)}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 1,
            bgcolor: "white",
            boxShadow: 2,
            "&:hover": {
              bgcolor: alpha("#fff", 0.9),
            },
          }}
        >
          <Close />
        </IconButton>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 4 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "90vh",
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: alpha("#000", 0.03),
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.primary.main, 0.4),
              borderRadius: "4px",
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.6),
              },
            },
          }}
        >
          {/* Mobile Phone Mockup - iPhone Style (Slim & Tall) */}
          <Box
            sx={{
              width: { xs: 320, sm: 350 },
              height: { xs: 680, sm: 720 },
              maxWidth: "100%",
              position: "relative",
              borderRadius: "42px",
              bgcolor: "#000",
              padding: "8px",
              boxShadow: `
                0 0 0 1px ${alpha("#000", 0.1)},
                0 12px 40px ${alpha("#000", 0.2)},
                inset 0 0 0 1px ${alpha("#fff", 0.1)}
              `,
              "&::before": {
                content: '""',
                position: "absolute",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                width: 110,
                height: 28,
                bgcolor: "#000",
                borderRadius: "0 0 18px 18px",
                zIndex: 10,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 22,
                left: "50%",
                transform: "translateX(-50%)",
                width: 7,
                height: 7,
                bgcolor: alpha("#1a1a1a", 0.9),
                borderRadius: "50%",
                zIndex: 11,
              },
            }}
          >
            {/* Mobile Screen Content */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "#fff",
                borderRadius: "36px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Status Bar */}
              <Box
                sx={{
                  height: 40,
                  bgcolor: "#f8f9fa",
                  borderBottom: `1px solid ${alpha("#000", 0.08)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  pt: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                >
                  9:41
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 15,
                      height: 9,
                      border: "1.5px solid #000",
                      borderRadius: 0.4,
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -2.5,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 1.5,
                        height: 3,
                        bgcolor: "#000",
                        borderRadius: 0.3,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Form Content - Scrollable */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: alpha("#000", 0.03),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: alpha(theme.palette.primary.main, 0.4),
                    borderRadius: "4px",
                    "&:hover": {
                      background: alpha(theme.palette.primary.main, 0.6),
                    },
                  },
                }}
              >
                {fullPreviewSchema && (
                  <DynamicUIRenderer
                    data={fullPreviewSchema}
                    onSubmit={(data) => {
                      console.log("Form Preview Submit:", data);
                      setSnackbar({
                        open: true,
                        message: "Form preview submitted (demo only)",
                        severity: "info",
                      });
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Field Manager Dialog */}
      <FieldManagerDialog
        open={fieldManagerOpen}
        onClose={() => {
          setFieldManagerOpen(false);
          setSelectedComponent(null);
          setSelectedSchema(null);
        }}
        component={selectedComponent}
        schema={selectedSchema}
        onConfigureApi={handleConfigureFieldApi}
      />

      {/* API Configuration Dialog */}
      <ApiConfigDialog
        open={apiConfigDialogOpen}
        onClose={() => {
          setApiConfigDialogOpen(false);
          setSelectedField(null);
        }}
        onSave={handleSaveApiConfig}
        initialConfig={selectedField?.api || null}
        buttonLabel={
          selectedField?.label || selectedField?.buttonLabel || "Button"
        }
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UIConfiguratorPage;
