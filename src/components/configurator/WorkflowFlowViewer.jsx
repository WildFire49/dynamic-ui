"use client";

import React, { useMemo, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Box,
  Typography,
  Chip,
  alpha,
  Avatar,
} from "@mui/material";
import {
  Person,
  AccountBalance,
  DirectionsCar,
  Description,
  Assignment,
  CreditCard,
  PlayArrow,
  FlagRounded,
  GridView,
  InputRounded,
  ArrowForward,
} from "@mui/icons-material";

// ── Constants ──
const BRAND = "#0078d7";
const BRAND_LIGHT = "#e8f4fd";
const START_COLOR = "#059669";
const END_COLOR = "#dc2626";

const ICON_MAP = {
  person: Person,
  identity: Person,
  bank: AccountBalance,
  account_balance: AccountBalance,
  car: DirectionsCar,
  vehicle: DirectionsCar,
  credit: CreditCard,
  loan: Description,
  form: Assignment,
  default: Description,
};

const getIconForTitle = (title = "") => {
  const lower = title.toLowerCase();
  if (lower.includes("identity") || lower.includes("verification")) return Person;
  if (lower.includes("vehicle") && lower.includes("info")) return DirectionsCar;
  if (lower.includes("credit") || lower.includes("guarantor")) return CreditCard;
  if (lower.includes("loan") || lower.includes("bank")) return AccountBalance;
  if (lower.includes("family") || lower.includes("social")) return Person;
  if (lower.includes("income") || lower.includes("employ")) return Assignment;
  return Description;
};

// ── Mini Flow Node ──
const MiniFlowNode = ({ data, id }) => {
  const isStart = data._isStart;
  const isEnd = data._isEnd;
  const totalSections = data.schema?.sections?.length || 0;
  const totalFields = data.schema?.sections?.reduce(
    (sum, s) => sum + (s.fields?.length || 0),
    0
  ) || 0;
  const IconComp = getIconForTitle(data.title);

  const borderColor = isStart
    ? START_COLOR
    : isEnd
    ? END_COLOR
    : "#e2e6ec";

  const accentGradient = isStart
    ? `linear-gradient(90deg, ${START_COLOR}, ${alpha(START_COLOR, 0.3)})`
    : isEnd
    ? `linear-gradient(90deg, ${END_COLOR}, ${alpha(END_COLOR, 0.3)})`
    : `linear-gradient(90deg, ${BRAND}, ${alpha(BRAND, 0.3)})`;

  return (
    <Box
      sx={{
        width: 220,
        background: "#fff",
        borderRadius: "12px",
        border: `2px solid ${borderColor}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: `0 4px 20px ${alpha(BRAND, 0.15)}`,
        },
      }}
    >
      {/* Accent stripe */}
      <Box sx={{ height: 3, background: accentGradient }} />

      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1.25, pb: 0.75, display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: isStart
              ? `linear-gradient(145deg, ${START_COLOR}, ${alpha(START_COLOR, 0.7)})`
              : isEnd
              ? `linear-gradient(145deg, ${END_COLOR}, ${alpha(END_COLOR, 0.7)})`
              : `linear-gradient(145deg, ${BRAND}, #005a9e)`,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <IconComp sx={{ fontSize: 16 }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              color: "#0f1b2d",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {data.title || "Form Component"}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
            {data.category && (
              <Chip
                label={data.category}
                size="small"
                sx={{
                  fontSize: "8px",
                  height: 16,
                  bgcolor: BRAND_LIGHT,
                  color: BRAND,
                  fontWeight: 600,
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            )}
            {isStart && (
              <Chip
                icon={<PlayArrow sx={{ fontSize: "9px !important", color: `${START_COLOR} !important` }} />}
                label="Start"
                size="small"
                sx={{
                  fontSize: "8px",
                  height: 16,
                  bgcolor: alpha(START_COLOR, 0.1),
                  color: START_COLOR,
                  fontWeight: 700,
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: 0.4 },
                }}
              />
            )}
            {isEnd && (
              <Chip
                icon={<FlagRounded sx={{ fontSize: "9px !important", color: `${END_COLOR} !important` }} />}
                label="End"
                size="small"
                sx={{
                  fontSize: "8px",
                  height: 16,
                  bgcolor: alpha(END_COLOR, 0.1),
                  color: END_COLOR,
                  fontWeight: 700,
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: 0.4 },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "flex",
          mx: 1.5,
          mb: 1,
          borderRadius: "6px",
          border: `1px solid ${alpha(BRAND, 0.08)}`,
          bgcolor: alpha(BRAND, 0.02),
        }}
      >
        <Box
          sx={{
            flex: 1,
            py: 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.1,
            borderRight: `1px solid ${alpha(BRAND, 0.08)}`,
          }}
        >
          <GridView sx={{ fontSize: 10, color: BRAND, opacity: 0.4 }} />
          <Typography sx={{ fontWeight: 800, fontSize: "14px", color: BRAND, lineHeight: 1 }}>
            {totalSections}
          </Typography>
          <Typography
            sx={{
              fontSize: "7px",
              fontWeight: 600,
              color: "#939dab",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sections
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            py: 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.1,
          }}
        >
          <InputRounded sx={{ fontSize: 10, color: BRAND, opacity: 0.4 }} />
          <Typography sx={{ fontWeight: 800, fontSize: "14px", color: BRAND, lineHeight: 1 }}>
            {totalFields}
          </Typography>
          <Typography
            sx={{
              fontSize: "7px",
              fontWeight: 600,
              color: "#939dab",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Fields
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ── Node Types ──
const nodeTypes = {
  formPreview: MiniFlowNode,
};

// ── Edge options ──
const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: {
    stroke: BRAND,
    strokeWidth: 2,
  },
};

// ── Inner Flow (needs to be inside ReactFlowProvider) ──
const InnerFlow = ({ nodes: initialNodes, edges: initialEdges, height }) => {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const onInit = useCallback((reactFlowInstance) => {
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.3 });
    }, 100);
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={onInit}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={true}
      zoomOnPinch={true}
      panOnScroll={true}
      panOnDrag={true}
      minZoom={0.1}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background color={alpha(BRAND, 0.08)} gap={20} size={1} />
    </ReactFlow>
  );
};

// ── Beta Steps Pipeline View (compact for 27+ steps) ──
const VISIBLE_STEPS = 8;
const BetaStepsPipeline = ({ steps, workflowName, height }) => {
  const [expanded, setExpanded] = React.useState(false);
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const totalSteps = sorted.length;
  const needsCollapse = totalSteps > VISIBLE_STEPS;
  const showFirst = needsCollapse && !expanded ? 5 : totalSteps;
  const showLast = needsCollapse && !expanded ? 2 : 0;
  const hiddenCount = needsCollapse && !expanded ? totalSteps - showFirst - showLast : 0;

  const visibleSteps = needsCollapse && !expanded
    ? [...sorted.slice(0, showFirst), null, ...sorted.slice(-showLast)]
    : sorted;

  return (
    <Box sx={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${alpha(BRAND, 0.15)}`, bgcolor: "#fafbfc" }}>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        background: `linear-gradient(135deg, ${alpha(BRAND, 0.05)}, ${alpha(BRAND, 0.02)})`,
        borderBottom: `1px solid ${alpha(BRAND, 0.1)}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: START_COLOR, boxShadow: `0 0 6px ${alpha(START_COLOR, 0.4)}` }} />
          <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#0f1b2d" }}>
            {workflowName || "Workflow"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75 }}>
          <Chip label={`${totalSteps} steps`} size="small" sx={{ fontSize: "10px", height: 22, bgcolor: alpha(BRAND, 0.1), color: BRAND, fontWeight: 600, "& .MuiChip-label": { px: 1 } }} />
          <Chip label="BETA" size="small" sx={{ fontSize: "10px", height: 22, bgcolor: alpha("#f59e0b", 0.15), color: "#d97706", fontWeight: 700, "& .MuiChip-label": { px: 1 } }} />
        </Box>
      </Box>

      {/* Steps timeline */}
      <Box sx={{ maxHeight: height - 52, overflowY: "auto", p: 1.5, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { background: alpha(BRAND, 0.15), borderRadius: 2 } }}>
        {visibleSteps.map((step, idx) => {
          // Collapsed placeholder
          if (step === null) {
            return (
              <Box key="collapsed" sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 1.25, py: 0.5 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: "50%", border: `2px dashed ${alpha(BRAND, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography sx={{ fontSize: "8px", fontWeight: 700, color: BRAND }}>...</Typography>
                </Box>
                <Box
                  onClick={() => setExpanded(true)}
                  sx={{
                    flex: 1, py: 0.75, px: 1.5, borderRadius: "8px",
                    border: `1px dashed ${alpha(BRAND, 0.2)}`, bgcolor: alpha(BRAND, 0.02),
                    cursor: "pointer", transition: "all 0.15s ease",
                    "&:hover": { bgcolor: alpha(BRAND, 0.06), borderColor: BRAND },
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: BRAND }}>
                    +{hiddenCount} more steps
                  </Typography>
                  <ArrowForward sx={{ fontSize: 12, color: BRAND, transform: "rotate(90deg)" }} />
                </Box>
              </Box>
            );
          }

          const isFirst = step.order === 1;
          const isLast = step.order === totalSteps;
          const isComplete = step.name?.toLowerCase().includes("complete");
          const IconComp = getIconForTitle(step.name || "");

          return (
            <Box key={step.step_id} sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
              {/* Timeline line + dot */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                {idx > 0 && <Box sx={{ width: 2, flex: 1, bgcolor: alpha(BRAND, 0.15), minHeight: 4 }} />}
                <Box sx={{
                  width: isFirst || isLast ? 24 : 20, height: isFirst || isLast ? 24 : 20,
                  borderRadius: "50%", flexShrink: 0,
                  bgcolor: isFirst ? START_COLOR : isLast ? END_COLOR : isComplete ? alpha("#059669", 0.15) : alpha(BRAND, 0.1),
                  color: isFirst || isLast ? "#fff" : isComplete ? "#059669" : BRAND,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: isFirst || isLast ? "none" : `1.5px solid ${isComplete ? alpha("#059669", 0.3) : alpha(BRAND, 0.2)}`,
                }}>
                  {isFirst ? <PlayArrow sx={{ fontSize: 12 }} /> : isLast ? <FlagRounded sx={{ fontSize: 12 }} /> : (
                    <Typography sx={{ fontSize: "9px", fontWeight: 700 }}>{step.order}</Typography>
                  )}
                </Box>
                {idx < visibleSteps.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: alpha(BRAND, 0.15), minHeight: 4 }} />}
              </Box>

              {/* Step card */}
              <Box sx={{
                flex: 1, py: 0.75, display: "flex", alignItems: "center", gap: 1,
                my: 0.25, px: 1.25, borderRadius: "8px",
                bgcolor: isFirst || isLast ? alpha(isFirst ? START_COLOR : END_COLOR, 0.04) : "transparent",
                border: isFirst || isLast ? `1px solid ${alpha(isFirst ? START_COLOR : END_COLOR, 0.12)}` : "1px solid transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: alpha(BRAND, 0.04) },
              }}>
                <Avatar variant="rounded" sx={{
                  width: 28, height: 28, borderRadius: "7px",
                  bgcolor: isComplete ? alpha("#059669", 0.1) : alpha(BRAND, 0.08),
                  color: isComplete ? "#059669" : BRAND,
                }}>
                  <IconComp sx={{ fontSize: 14 }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{
                    fontWeight: 600, fontSize: "11px", color: "#0f1b2d", lineHeight: 1.3,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {step.name}
                  </Typography>
                  {step.description && step.description !== step.name && (
                    <Typography sx={{ fontSize: "9px", color: "#9ca3af", lineHeight: 1.2, mt: 0.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {step.description}
                    </Typography>
                  )}
                </Box>
                {step.has_ui_data && (
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#059669", flexShrink: 0, opacity: 0.6 }} />
                )}
              </Box>
            </Box>
          );
        })}

        {/* Collapse button if expanded */}
        {expanded && needsCollapse && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Chip
              label="Show less"
              size="small"
              onClick={() => setExpanded(false)}
              sx={{
                fontSize: "10px", height: 24, cursor: "pointer",
                bgcolor: alpha(BRAND, 0.08), color: BRAND, fontWeight: 600,
                "&:hover": { bgcolor: alpha(BRAND, 0.15) },
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ── Main Component ──
const WorkflowFlowViewer = ({ workflowData, height = 400 }) => {
  // ── Beta mode: steps array ──
  const betaSteps = workflowData?.steps;
  if (betaSteps && Array.isArray(betaSteps) && betaSteps.length > 0) {
    return (
      <BetaStepsPipeline
        steps={betaSteps}
        workflowName={workflowData.workflow_name}
        height={height}
      />
    );
  }

  // ── Alpha mode: canvas_state ──
  const canvasState = workflowData?.canvas_state;

  const { processedNodes, processedEdges, flowSequence } = useMemo(() => {
    if (!canvasState?.nodes || !canvasState?.edges) {
      return { processedNodes: [], processedEdges: [], flowSequence: [] };
    }

    const rawNodes = canvasState.nodes;
    const rawEdges = canvasState.edges;

    // Determine start/end nodes
    const targetIds = new Set(rawEdges.map((e) => e.target));
    const sourceIds = new Set(rawEdges.map((e) => e.source));

    // Build flow sequence for the step indicator
    const sequence = [];
    const visited = new Set();
    let startNodeId = rawNodes.find((n) => !targetIds.has(n.id))?.id;
    if (startNodeId) {
      let current = startNodeId;
      while (current && !visited.has(current)) {
        visited.add(current);
        const node = rawNodes.find((n) => n.id === current);
        if (node) {
          sequence.push({
            id: node.id,
            title: node.data?.title || "Step",
          });
        }
        const nextEdge = rawEdges.find((e) => e.source === current);
        current = nextEdge?.target;
      }
    }

    const nodeSpacingX = 300;
    const nodesPerRow = 4;

    const orderedNodes = sequence.length > 0
      ? sequence.map((s) => rawNodes.find((n) => n.id === s.id)).filter(Boolean)
      : rawNodes;

    const pNodes = orderedNodes.map((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      const actualCol = row % 2 === 0 ? col : nodesPerRow - 1 - col;

      return {
        id: node.id,
        type: "formPreview",
        position: {
          x: actualCol * nodeSpacingX,
          y: row * 250,
        },
        data: {
          ...node.data,
          _isStart: !targetIds.has(node.id),
          _isEnd: !sourceIds.has(node.id),
        },
        draggable: false,
      };
    });

    const pEdges = rawEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: BRAND,
        strokeWidth: 2,
      },
    }));

    return { processedNodes: pNodes, processedEdges: pEdges, flowSequence: sequence };
  }, [canvasState]);

  if (!canvasState?.nodes?.length) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">No workflow data available</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${alpha(BRAND, 0.15)}`,
        bgcolor: "#fafbfc",
      }}
    >
      {/* Workflow header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          background: `linear-gradient(135deg, ${alpha(BRAND, 0.05)}, ${alpha(BRAND, 0.02)})`,
          borderBottom: `1px solid ${alpha(BRAND, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: START_COLOR,
              boxShadow: `0 0 6px ${alpha(START_COLOR, 0.4)}`,
            }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "13px",
              color: "#0f1b2d",
            }}
          >
            {workflowData.workflow_name || "Workflow"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75 }}>
          <Chip
            label={`${processedNodes.length} steps`}
            size="small"
            sx={{
              fontSize: "10px",
              height: 22,
              bgcolor: alpha(BRAND, 0.1),
              color: BRAND,
              fontWeight: 600,
              "& .MuiChip-label": { px: 1 },
            }}
          />
          <Chip
            label={`${processedEdges.length} connections`}
            size="small"
            sx={{
              fontSize: "10px",
              height: 22,
              bgcolor: alpha("#6b7280", 0.1),
              color: "#6b7280",
              fontWeight: 600,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </Box>
      </Box>

      {/* Flow sequence indicator */}
      {flowSequence.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            overflowX: "auto",
            borderBottom: `1px solid ${alpha(BRAND, 0.08)}`,
            bgcolor: "white",
            "&::-webkit-scrollbar": { height: 3 },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(BRAND, 0.2),
              borderRadius: 2,
            },
          }}
        >
          {flowSequence.map((step, idx) => (
            <React.Fragment key={step.id}>
              <Chip
                label={step.title}
                size="small"
                sx={{
                  fontSize: "9px",
                  height: 20,
                  bgcolor: idx === 0
                    ? alpha(START_COLOR, 0.1)
                    : idx === flowSequence.length - 1
                    ? alpha(END_COLOR, 0.1)
                    : alpha(BRAND, 0.06),
                  color: idx === 0
                    ? START_COLOR
                    : idx === flowSequence.length - 1
                    ? END_COLOR
                    : "#4b5563",
                  fontWeight: 600,
                  flexShrink: 0,
                  maxWidth: 140,
                  "& .MuiChip-label": {
                    px: 0.75,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
              {idx < flowSequence.length - 1 && (
                <ArrowForward
                  sx={{
                    fontSize: 12,
                    color: alpha(BRAND, 0.3),
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>
      )}

      {/* ReactFlow Canvas */}
      <Box sx={{ height, position: "relative" }}>
        <ReactFlowProvider>
          <InnerFlow
            nodes={processedNodes}
            edges={processedEdges}
            height={height}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
};

export default WorkflowFlowViewer;
