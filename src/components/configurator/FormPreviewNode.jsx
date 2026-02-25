"use client";

import React, { useState, memo, useCallback, useMemo } from "react";
import { Handle, Position, useStore } from "reactflow";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Paper,
  alpha,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Visibility,
  Delete,
  Settings,
  Person,
  Agriculture,
  AccountBalance,
  Fingerprint,
  CheckCircle,
  DataObject,
  PlayArrow,
  FlagRounded,
  GridView,
  InputRounded,
} from "@mui/icons-material";

// ── Constants ──

const BRAND = '#0078d7';
const BRAND_LIGHT = '#e8f4fd';
const BRAND_DARK = '#005a9e';
const START_COLOR = '#059669';
const END_COLOR = '#dc2626';
const CARD_WIDTH = 260;

const ICON_MAP = {
  person: Person,
  agriculture: Agriculture,
  account_balance: AccountBalance,
  fingerprint: Fingerprint,
  check_circle: CheckCircle,
};

// ── Static styles ──

const containerBase = {
  width: CARD_WIDTH,
  background: '#fff',
  borderRadius: '14px',
  overflow: 'visible',
  position: 'relative',
};

const getContainerSx = (selected, isStart, isEnd) => ({
  ...containerBase,
  border: isStart
    ? `2px solid ${START_COLOR}`
    : isEnd
      ? `2px solid ${END_COLOR}`
      : selected
        ? `2px solid ${BRAND}`
        : `1px solid ${alpha('#0f172a', 0.1)}`,
  boxShadow: selected
    ? `0 0 0 4px ${alpha(BRAND, 0.15)}, 0 20px 48px ${alpha(BRAND, 0.2)}`
    : `0 12px 32px ${alpha('#0f172a', 0.05)}, 0 4px 12px ${alpha('#0f172a', 0.02)}`,
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  transform: selected ? 'scale(1.02)' : 'scale(1)',
  '&:hover': {
    boxShadow: `0 24px 56px ${alpha(BRAND, 0.15)}, 0 8px 24px ${alpha(BRAND, 0.05)}`,
    borderColor: selected ? BRAND : alpha(BRAND, 0.4),
    transform: selected ? 'scale(1.02) translateY(-4px)' : 'translateY(-4px)'
  },
});

const getAccentSx = (isStart, isEnd) => ({
  height: 3,
  background: isStart
    ? `linear-gradient(90deg, ${START_COLOR}, ${alpha(START_COLOR, 0.3)})`
    : isEnd
      ? `linear-gradient(90deg, ${END_COLOR}, ${alpha(END_COLOR, 0.3)})`
      : `linear-gradient(90deg, ${BRAND}, ${alpha(BRAND, 0.3)})`,
});

const headerSx = {
  px: 1.75,
  pt: 1.5,
  pb: 1,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1,
};

const iconAvatarSx = {
  width: 44,
  height: 44,
  borderRadius: '14px',
  background: `linear-gradient(135deg, ${BRAND}, #0ea5e9)`,
  color: '#fff',
  boxShadow: `0 8px 20px ${alpha(BRAND, 0.3)}, inset 0 2px 0 ${alpha('#fff', 0.2)}`,
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const titleSx = {
  fontWeight: 800,
  fontSize: '14px',
  color: '#0f172a',
  lineHeight: 1.35,
  mb: 0.5,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  letterSpacing: '-0.01em',
};

const chipRowSx = { display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' };

const categoryChipSx = {
  fontSize: '9px',
  height: 18,
  bgcolor: BRAND_LIGHT,
  color: BRAND,
  fontWeight: 600,
  borderRadius: '5px',
  '& .MuiChip-label': { px: 0.6 },
};

const startBadgeSx = {
  fontSize: '9px', height: 18,
  bgcolor: alpha(START_COLOR, 0.1),
  color: START_COLOR,
  fontWeight: 700,
  borderRadius: '5px',
  '& .MuiChip-label': { px: 0.5 },
};

const endBadgeSx = {
  fontSize: '9px', height: 18,
  bgcolor: alpha(END_COLOR, 0.1),
  color: END_COLOR,
  fontWeight: 700,
  borderRadius: '5px',
  '& .MuiChip-label': { px: 0.5 },
};

const expandBtnSx = {
  width: 26, height: 26,
  color: '#b8c0cc',
  flexShrink: 0,
  mt: 0.25,
  '&:hover': { bgcolor: BRAND_LIGHT, color: BRAND },
};

// Stats
const statsBgSx = {
  display: 'flex',
  mx: 1.75,
  mb: 1.25,
  borderRadius: '8px',
  border: `1px solid ${alpha(BRAND, 0.07)}`,
  bgcolor: alpha(BRAND, 0.02),
};

const statItemFirstSx = {
  flex: 1, py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.15,
  borderRight: `1px solid ${alpha(BRAND, 0.07)}`,
};

const statItemSecondSx = {
  flex: 1, py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.15,
};

const statNumSx = { fontWeight: 800, fontSize: '18px', color: BRAND, lineHeight: 1 };
const statLblSx = { fontSize: '8px', fontWeight: 600, color: '#939dab', textTransform: 'uppercase', letterSpacing: '0.05em' };
const statIcoSx = { fontSize: 12, color: BRAND, opacity: 0.4, mb: -0.15 };

// Expanded
const expandedSx = {
  px: 1.75, py: 1,
  borderTop: `1px solid ${alpha(BRAND, 0.06)}`,
  maxHeight: 160,
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: '2px' },
  '&::-webkit-scrollbar-thumb': { background: alpha(BRAND, 0.12), borderRadius: '2px' },
};

const sectionRowSx = {
  py: 0.5, px: 0.5,
  display: 'flex', alignItems: 'center', gap: 0.5,
  borderRadius: '5px',
  '&:hover': { bgcolor: alpha(BRAND, 0.03) },
  '&:not(:last-child)': { mb: 0.15 },
};

const sectionDotSx = { width: 4, height: 4, borderRadius: '50%', bgcolor: BRAND, opacity: 0.35, flexShrink: 0 };

const fieldTagSx = {
  fontSize: '8px', height: 16,
  bgcolor: alpha(BRAND, 0.05), color: '#6b7280',
  fontWeight: 500, borderRadius: '3px',
  '& .MuiChip-label': { px: 0.4 },
};

// Actions
const actionBarSx = {
  px: 1.25, py: 0.6,
  display: 'flex', alignItems: 'center', gap: 0.25,
  borderTop: `1px solid ${alpha(BRAND, 0.06)}`,
};

const actionBtnSx = {
  width: 28, height: 28, color: '#a8b0bc',
  transition: 'all 0.15s ease',
  '&:hover': { bgcolor: alpha(BRAND, 0.07), color: BRAND },
};

const deleteBtnSx = {
  width: 28, height: 28, color: '#cbd1d9',
  transition: 'all 0.15s ease',
  '&:hover': { bgcolor: alpha('#ef4444', 0.06), color: '#ef4444' },
};

const handleStyle = {
  width: 10, height: 10,
  background: BRAND,
  border: '2.5px solid #fff',
  boxShadow: `0 1px 4px ${alpha(BRAND, 0.3)}`,
};

// ── Edge detection selector ──

const createEdgeSelector = (nodeId) => (store) => {
  const hasIncoming = store.edges.some((e) => e.target === nodeId);
  const hasOutgoing = store.edges.some((e) => e.source === nodeId);
  return { hasIncoming, hasOutgoing };
};

// ── Memo equality ──

const arePropsEqual = (prevProps, nextProps) => (
  prevProps.data.component?.id === nextProps.data.component?.id &&
  prevProps.data.component?.name === nextProps.data.component?.name &&
  prevProps.data.schema?.id === nextProps.data.schema?.id &&
  prevProps.data.schema?.sections?.length === nextProps.data.schema?.sections?.length &&
  prevProps.selected === nextProps.selected &&
  prevProps.isConnectable === nextProps.isConnectable
);

// ── Component ──

const FormPreviewNode = memo(({ id, data, isConnectable, selected }) => {
  const [expanded, setExpanded] = useState(false);
  const { component, schema, onDelete, onConfigure, onPreview } = data;

  const IconComponent = ICON_MAP[component?.icon] || Person;

  // Detect start/end from edges
  const edgeSelector = useMemo(() => createEdgeSelector(id), [id]);
  const { hasIncoming, hasOutgoing } = useStore(edgeSelector);
  const isStart = !hasIncoming;
  const isEnd = !hasOutgoing;

  const totalFields = useMemo(
    () => schema?.sections?.reduce((sum, s) => sum + (s.fields?.length || 0), 0) || 0,
    [schema]
  );
  const totalSections = useMemo(() => schema?.sections?.length || 0, [schema]);

  const containerSx = useMemo(() => getContainerSx(selected, isStart, isEnd), [selected, isStart, isEnd]);
  const accentSx = useMemo(() => getAccentSx(isStart, isEnd), [isStart, isEnd]);

  const handleExpand = useCallback(() => setExpanded(p => !p), []);
  const handleDelete = useCallback(() => onDelete?.(), [onDelete]);
  const handleConfigure = useCallback(() => onConfigure?.(component), [onConfigure, component]);
  const handlePreview = useCallback(() => onPreview?.({ ...component, schema }), [onPreview, component, schema]);

  return (
    <Paper elevation={0} sx={containerSx}>
      {/* Accent stripe */}
      <Box sx={accentSx} />

      {/* Header */}
      <Box sx={headerSx}>
        <Avatar sx={iconAvatarSx} variant="rounded">
          <IconComponent sx={{ fontSize: 18 }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={titleSx}>
            {data.title || component?.name || schema?.title || "Form Component"}
          </Typography>
          <Box sx={chipRowSx}>
            <Chip label={component?.category || "form"} size="small" sx={categoryChipSx} />
            {isStart && (
              <Chip
                icon={<PlayArrow sx={{ fontSize: '10px !important', color: `${START_COLOR} !important` }} />}
                label="Start" size="small" sx={startBadgeSx}
              />
            )}
            {isEnd && (
              <Chip
                icon={<FlagRounded sx={{ fontSize: '10px !important', color: `${END_COLOR} !important` }} />}
                label="End" size="small" sx={endBadgeSx}
              />
            )}
          </Box>
        </Box>

        <IconButton size="small" onClick={handleExpand} sx={expandBtnSx}>
          {expanded ? <ExpandLess sx={{ fontSize: 15 }} /> : <ExpandMore sx={{ fontSize: 15 }} />}
        </IconButton>
      </Box>

      {/* Stats */}
      {schema ? (
        <Box sx={statsBgSx}>
          <Box sx={statItemFirstSx}>
            <GridView sx={statIcoSx} />
            <Typography sx={statNumSx}>{totalSections}</Typography>
            <Typography sx={statLblSx}>Sections</Typography>
          </Box>
          <Box sx={statItemSecondSx}>
            <InputRounded sx={statIcoSx} />
            <Typography sx={statNumSx}>{totalFields}</Typography>
            <Typography sx={statLblSx}>Fields</Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mx: 1.75, mb: 1.25, py: 0.75, px: 1, borderRadius: '8px', bgcolor: alpha(BRAND, 0.03), border: `1px dashed ${alpha(BRAND, 0.15)}` }}>
          <Typography sx={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', fontWeight: 500 }}>
            {data.order != null ? `Step ${data.order}` : 'Click preview to load schema'}
          </Typography>
        </Box>
      )}

      {/* Expanded */}
      <Collapse in={expanded}>
        <Box sx={expandedSx}>
          {schema?.sections?.map((section) => (
            <Box key={section.id} sx={sectionRowSx}>
              <Box sx={sectionDotSx} />
              <Typography sx={{ fontWeight: 600, fontSize: '10px', color: '#374151', flex: 1 }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {section.fields?.slice(0, 2).map((f) => (
                  <Chip key={f.id} label={f.label} size="small" sx={fieldTagSx} />
                ))}
                {section.fields?.length > 2 && (
                  <Typography sx={{ fontSize: '8px', color: '#9ca3af', alignSelf: 'center', ml: 0.25 }}>
                    +{section.fields.length - 2}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Actions */}
      <Box sx={actionBarSx}>
        <Tooltip title="Preview" arrow placement="top">
          <IconButton size="small" onClick={handlePreview} sx={actionBtnSx}>
            <Visibility sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Configure" arrow placement="top">
          <IconButton size="small" onClick={handleConfigure} sx={actionBtnSx}>
            <Settings sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Schema" arrow placement="top">
          <IconButton size="small" onClick={handleExpand} sx={actionBtnSx}>
            <DataObject sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Remove" arrow placement="top">
          <IconButton size="small" onClick={handleDelete} sx={deleteBtnSx}>
            <Delete sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Handles */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={handleStyle} />
    </Paper>
  );
}, arePropsEqual);

FormPreviewNode.displayName = "FormPreviewNode";

export default FormPreviewNode;
