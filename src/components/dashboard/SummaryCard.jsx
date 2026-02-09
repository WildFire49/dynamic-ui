'use client';

import React, { useMemo, memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Checkbox,
  alpha,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CompareArrows as CompareArrowsIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableChartIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  InfoOutlined as InfoOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  RemoveRedEye as ViewIcon,
  AttachMoney as DollarIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Error as ErrorIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import MoneyIcon from '@mui/icons-material/Money';

// ─── Helpers ──────────────────────────────────────────

const formatIndianCurrency = (value) => {
  if (!value) return value;
  if (typeof value === 'string' && (value.includes('₹') || value.includes('L') || value.includes('Cr'))) return value;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return value;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(2)}K`;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const smartFormat = (value) => {
  if (value === null || value === undefined) return value;
  const str = String(value);
  if (str.includes('₹') || str.includes('L') || str.includes('Cr') || str.includes('%')) return str;
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return value;
  if (str.includes('M')) return formatIndianCurrency(parseFloat(str.replace('M', '')) * 1000000);
  if (str.includes('K') || num > 1000) return formatIndianCurrency(num);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// ─── Visual Theme System ──────────────────────────────
// 6 unique card themes that cycle per card index

const CARD_THEMES = [
  {
    name: 'ocean',
    primary: '#0078d7',
    secondary: '#00a6ff',
    accent: '#e6f3ff',
    gradient: 'linear-gradient(135deg, #0078d7 0%, #00a6ff 100%)',
    bgPattern: 'radial-gradient(circle at 90% 10%, rgba(0,120,215,0.06) 0%, transparent 50%)',
    barColors: ['#0078d7', '#00a6ff', '#4dc3ff'],
  },
  {
    name: 'emerald',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#ecfdf5',
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
    bgPattern: 'radial-gradient(circle at 10% 90%, rgba(5,150,105,0.06) 0%, transparent 50%)',
    barColors: ['#059669', '#10B981', '#34D399'],
  },
  {
    name: 'amber',
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#fffbeb',
    gradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
    bgPattern: 'radial-gradient(circle at 85% 85%, rgba(217,119,6,0.06) 0%, transparent 50%)',
    barColors: ['#D97706', '#F59E0B', '#FBBF24'],
  },
  {
    name: 'rose',
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#fef2f2',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
    bgPattern: 'radial-gradient(circle at 15% 15%, rgba(220,38,38,0.06) 0%, transparent 50%)',
    barColors: ['#DC2626', '#EF4444', '#F87171'],
  },
  {
    name: 'indigo',
    primary: '#4338CA',
    secondary: '#6366F1',
    accent: '#eef2ff',
    gradient: 'linear-gradient(135deg, #4338CA 0%, #818CF8 100%)',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(67,56,202,0.06) 0%, transparent 50%)',
    barColors: ['#4338CA', '#6366F1', '#818CF8'],
  },
  {
    name: 'teal',
    primary: '#0D9488',
    secondary: '#14B8A6',
    accent: '#f0fdfa',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #5EEAD4 100%)',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(13,148,136,0.06) 0%, transparent 50%)',
    barColors: ['#0D9488', '#14B8A6', '#5EEAD4'],
  },
];

// ─── Icon Map ──────────────────────────────────────────

const ICON_MAP = {
  Warning: WarningIcon, TrendingUp: TrendingUpIcon, TrendingDown: TrendingDownIcon,
  CompareArrows: CompareArrowsIcon, Compare: CompareArrowsIcon, ShowChart: ShowChartIcon,
  TableChart: TableChartIcon, Table: TableChartIcon, Lightbulb: LightbulbIcon,
  Info: InfoIcon, CheckCircle: CheckCircleIcon, Money: MoneyIcon,
  Star: StarIcon, Timeline: TimelineIcon, AlertIcon: ErrorIcon, ChartBar: BarChartIcon,
};

const URGENCY_CONFIG = {
  critical: { color: '#EF4444', bgColor: '#FEF2F2', borderColor: '#FCA5A5', label: 'Critical' },
  high: { color: '#F59E0B', bgColor: '#FFFBEB', borderColor: '#FCD34D', label: 'High' },
  medium: { color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE', label: 'Medium' },
  low: { color: '#0D9488', bgColor: '#F0FDFA', borderColor: '#5EEAD4', label: 'Low' },
  info: { color: '#6366F1', bgColor: '#EEF2FF', borderColor: '#A5B4FC', label: 'Info' },
};

// ─── CXO Single Metric (Clean) ────────────────────────

const CXOSingleMetric = ({ data, theme, title, icon: Icon }) => {
  const displayValue = data.formatted || smartFormat(data.value);
  const displayLabel = data.name || data.label || '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        p: { xs: 2, sm: 3 },
        background: `linear-gradient(145deg, ${alpha(theme.primary, 0.04)} 0%, ${alpha(theme.primary, 0.10)} 100%)`,
        borderRadius: 4,
        border: `1px solid ${alpha(theme.primary, 0.12)}`,
        minHeight: { xs: 180, sm: 200, md: 240 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle accent circle */}
      <Box sx={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.primary, 0.08)} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <Box
        sx={{
          mb: 2, p: 2, borderRadius: 3,
          background: theme.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Icon sx={{ fontSize: 32, color: '#FFFFFF' }} />
      </Box>

      {/* Value */}
      <Typography
        sx={{
          fontSize: { xs: '2.75rem', md: '4rem' },
          fontWeight: 900,
          color: theme.primary,
          lineHeight: 1, mb: 2,
          textAlign: 'center', zIndex: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {displayValue}
      </Typography>

      {/* Label */}
      {displayLabel && (
        <Box sx={{
          zIndex: 1, px: 2.5, py: 0.75,
          borderRadius: 3, bgcolor: '#FFFFFF',
          border: `1.5px solid ${alpha(theme.primary, 0.2)}`,
        }}>
          <Typography sx={{
            fontWeight: 700, fontSize: '0.85rem',
            color: theme.primary,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {displayLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── CXO Multi Metric (Clean) ─────────────────────────

const CXOMultiMetric = ({ data, theme }) => {
  const isFlattenedRows = data.filter(d => d.name === 'Bank Name' || d.name === 'Region' || d.name === 'Name').length > 1;

  if (isFlattenedRows) {
    const entities = [];
    let currentEntity = null;
    data.forEach(item => {
      if (item.name === 'Bank Name' || item.name === 'Region' || item.name === 'Name' || item.name === 'Entity') {
        if (currentEntity) entities.push(currentEntity);
        currentEntity = { name: item.value, metrics: [] };
      } else if (currentEntity) {
        currentEntity.metrics.push(item);
      }
    });
    if (currentEntity) entities.push(currentEntity);

    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: entities.length <= 2 ? 3 : 2, py: 0.5, flex: 1, justifyContent: 'center' }}>
        {entities.map((entity, idx) => {
          const palette = CARD_THEMES.map(t => t.primary);
          const itemColor = palette[idx % palette.length];
          return (
            <Box key={idx} sx={{
              p: { xs: 2, sm: 2.25 }, borderRadius: 4,
              bgcolor: alpha(itemColor, 0.03),
              border: `1px solid ${alpha(itemColor, 0.1)}`,
              position: 'relative', overflow: 'hidden',
              '&:hover': { bgcolor: alpha(itemColor, 0.05), borderColor: alpha(itemColor, 0.2) },
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: theme.gradient }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, ml: 0.5 }}>
                <Typography sx={{
                  fontSize: '0.85rem', fontWeight: 800, color: itemColor,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  bgcolor: alpha(itemColor, 0.08), px: 1.5, py: 0.4, borderRadius: 2,
                }}>
                  {entity.name}
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: alpha(itemColor, 0.08) }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, ml: 0.5 }}>
                {entity.metrics.map((metric, mIdx) => {
                  const isPrimary = metric.name.toLowerCase().includes('mtd');
                  return (
                    <Box key={mIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {metric.name.replace('Disbursed Amount', 'Disbursed')}
                      </Typography>
                      <Typography sx={{
                        fontSize: isPrimary ? { xs: '1.2rem', md: '1.5rem' } : { xs: '1.05rem', md: '1.2rem' },
                        color: isPrimary ? '#0F172A' : '#475569', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em',
                      }}>
                        {metric.formatted}
                      </Typography>
                      <Box sx={{ height: 6, bgcolor: alpha(itemColor, 0.08), borderRadius: 3, overflow: 'hidden', mt: 0.25 }}>
                        <Box sx={{ width: mIdx === 0 ? '100%' : '70%', height: '100%', bgcolor: mIdx === 0 ? itemColor : alpha(itemColor, 0.4), borderRadius: 3 }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Standard list view
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
      {data.map((entry, idx) => {
        const allValues = data.map(e => (typeof e.value === 'number' ? e.value : parseFloat(String(e.value).replace(/[^0-9.-]/g, '')) || 0));
        const maxValue = Math.max(...allValues, 1);
        const numericValue = typeof entry.value === 'number' ? entry.value : parseFloat(String(entry.value).replace(/[^0-9.-]/g, '')) || 0;
        const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
        const itemColor = CARD_THEMES[idx % CARD_THEMES.length].primary;

        return (
          <Box key={idx} sx={{
            p: 2, borderRadius: 3, bgcolor: '#FFFFFF',
            border: `1px solid ${alpha(itemColor, 0.12)}`,
            overflow: 'hidden', position: 'relative',
            '&:hover': { borderColor: alpha(itemColor, 0.3) },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2.5, bgcolor: itemColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                }}>
                  {idx + 1}
                </Box>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  {entry.name || entry.label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: itemColor, letterSpacing: '-0.03em' }}>
                {entry.formatted || smartFormat(entry.value)}
              </Typography>
            </Box>
            <Box sx={{ height: 8, bgcolor: alpha(itemColor, 0.08), borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{
                width: `${percentage}%`, height: '100%',
                background: `linear-gradient(90deg, ${itemColor}, ${alpha(itemColor, 0.6)})`,
                borderRadius: 4,
              }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Comparison Chart ──────────────────────────────────

const ComparisonChart = ({ data, theme }) => {
  const chartData = useMemo(() => {
    if (!data?.entity1 || !data?.entity2) return [];
    return [
      { name: data.entity1.name, value: data.entity1.value, formatted: data.entity1.formatted, fill: theme.primary },
      { name: data.entity2.name, value: data.entity2.value, formatted: data.entity2.formatted, fill: theme.secondary },
    ];
  }, [data, theme]);

  if (chartData.length === 0) return null;
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <Box sx={{ width: '100%', flex: 1, minHeight: 120, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap="30%">
          <XAxis type="number" hide domain={[0, maxValue * 1.1]} />
          <YAxis type="category" dataKey="name" hide />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <Box sx={{ bgcolor: 'rgba(15,23,42,0.95)', p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', mb: 0.5, textTransform: 'uppercase' }}>{d.name}</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{d.formatted || smartFormat(d.value)}</Typography>
                </Box>
              );
            }}
            cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }}
          />
          <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={36}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// ─── Card Background Patterns (per theme) ─────────────

const CardBackground = ({ theme, cardType }) => (
  <>
    <Box sx={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: theme.bgPattern, pointerEvents: 'none', zIndex: 0,
    }} />
    {/* Accent stripe for alerts */}
    {cardType === 'alert' && (
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: theme.gradient, zIndex: 0 }} />
    )}
    {/* Corner accent for metrics */}
    {(cardType === 'metric' || cardType === 'info') && (
      <Box sx={{
        position: 'absolute', top: -30, right: -30, width: 120, height: 120,
        borderRadius: '50%', border: `2px solid ${alpha(theme.primary, 0.06)}`,
        pointerEvents: 'none', zIndex: 0,
      }} />
    )}
  </>
);

// ─── Main Component ───────────────────────────────────

const SummaryCard = memo(({
  card,
  cardIndex = 0,
  variant = 'default',
  size = 'medium',
  selectable = false,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onClick,
  onCreateWidget,
  showActions = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelection = () => {},
}) => {
  const {
    id, card_type = 'metric', urgency = 'info', title, description,
    primary_value, primary_label, secondary_value, secondary_label,
    trend, trend_value, icon = 'Info', color,
    action_text, comparison_data, metric_unit,
    formatted_primary_value, formatted_secondary_value,
    top_entries, bottom_entries, info_data, query_results,
    _pipelineData, _dataGrid, sort_by, sort_order,
  } = card;

  // Pick theme based on card index for unique visuals
  const theme = CARD_THEMES[cardIndex % CARD_THEMES.length];

  const toNumeric = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const prettifyLabel = (label = '') =>
    label.toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getSafeDisplayValue = (val, formattedVal, unit) => {
    const numericVal = toNumeric(val);
    if (unit === 'count' && numericVal !== null) return numericVal.toLocaleString('en-IN');
    if (unit === 'currency' && numericVal !== null && !formattedVal) return formatIndianCurrency(numericVal);
    if (formattedVal) return formattedVal;
    if (numericVal !== null) return smartFormat(numericVal);
    return smartFormat(val) || val;
  };

  // Recalculate primary_value for comparison cards
  let correctedPrimaryValue = primary_value;
  let correctedFormattedPrimaryValue = formatted_primary_value;
  if (card_type === 'comparison' && Array.isArray(query_results) && query_results.length > 0) {
    const totalMtd = query_results.reduce((sum, result) => {
      const mtdAmount = result.mtd_disbursed_amount || 0;
      const mtdLakhs = mtdAmount > 10000 ? mtdAmount / 100000 : mtdAmount;
      return sum + mtdLakhs;
    }, 0);
    if (totalMtd > 0) {
      correctedPrimaryValue = totalMtd.toFixed(2);
      correctedFormattedPrimaryValue = `₹${totalMtd.toFixed(2)}L`;
    }
  }

  const displayPrimaryValue = getSafeDisplayValue(correctedPrimaryValue, correctedFormattedPrimaryValue, metric_unit);
  const displaySecondaryValue = getSafeDisplayValue(secondary_value, formatted_secondary_value, metric_unit);
  const displayTrendValue = trend_value;

  const rawInfoSource = useMemo(() => {
    if (Array.isArray(info_data) && info_data.length > 0) return info_data;
    if (Array.isArray(query_results) && query_results.length > 0) return query_results;
    if (Array.isArray(_pipelineData) && _pipelineData.length > 0) return _pipelineData;
    if (Array.isArray(_dataGrid?.gridRows) && _dataGrid.gridRows.length > 0) return _dataGrid.gridRows;
    return [];
  }, [info_data, query_results, _pipelineData, _dataGrid]);

  const resolvedInfoData = useMemo(() => {
    if (!Array.isArray(rawInfoSource) || rawInfoSource.length === 0) return [];
    if (rawInfoSource.every(e => e && typeof e === 'object' && ('name' in e || 'label' in e || 'title' in e))) {
      return rawInfoSource.map((e) => ({
        name: e.name || e.label || e.title || prettifyLabel(e.field || e.key || ''),
        value: e.value ?? e.count ?? e.total ?? e.formatted ?? null,
        formatted: e.formatted || (e.value !== undefined ? smartFormat(e.value) : e.value) || e.count || e.total || '—',
      }));
    }
    return rawInfoSource.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      return Object.entries(row)
        .filter(([key]) => key !== 'id' && !key.startsWith('_'))
        .map(([key, value]) => ({
          name: prettifyLabel(key),
          value,
          formatted: value === null || value === undefined ? 'No data' : smartFormat(value),
        }));
    });
  }, [rawInfoSource]);

  const hasInfoData = resolvedInfoData.length > 0;
  const IconComponent = ICON_MAP[icon] || InfoIcon;
  const urgencyConfig = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.info;
  const isCXOView = (card_type === 'info' || card_type === 'metric') && hasInfoData;
  const showTypeLabel = ['alert', 'table_summary'].includes(card_type);

  const sizeStyles = {
    small: { p: 1.5, titleSize: '0.8rem', valueSize: '1.25rem' },
    medium: { p: 2, titleSize: '0.9rem', valueSize: '1.5rem' },
    large: { p: 2.5, titleSize: '1rem', valueSize: '1.75rem' },
  };
  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const handleClick = (e) => {
    e.stopPropagation();
    if (selectable && onSelect) onSelect(id, !selected);
    else if (onClick) onClick(card);
  };

  // ─── Render ───────────────────────────────────────

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 5,
        bgcolor: '#FFFFFF',
        background: isCXOView
          ? `linear-gradient(145deg, #FFFFFF 0%, ${theme.accent} 100%)`
          : 'linear-gradient(145deg, #FFFFFF 0%, #FAFBFC 100%)',
        border: '1px solid',
        borderColor: selected ? theme.primary : 'rgba(226, 232, 240, 0.8)',
        cursor: selectable || onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: selected
          ? `0 8px 24px -6px ${alpha(theme.primary, 0.2)}`
          : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: { xs: 140, sm: 160, md: 180 },
        '&:hover': {
          boxShadow: `0 8px 28px -4px ${alpha(theme.primary, 0.12)}, 0 4px 12px rgba(0,0,0,0.04)`,
          borderColor: alpha(theme.primary, 0.3),
          '& .card-actions': { opacity: 1 },
        },
      }}
    >
      <CardBackground theme={theme} cardType={card_type} />

      {/* Selection checkbox */}
      {selectionMode && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onToggleSelection(id); }}
            sx={{ color: alpha(theme.primary, 0.5), '&.Mui-checked': { color: theme.primary } }}
          />
        </Box>
      )}

      {/* Legacy selection indicator */}
      {selectable && !selectionMode && (
        <Box sx={{
          position: 'absolute', top: 14, right: 14, width: 22, height: 22,
          borderRadius: '50%', border: `2px solid ${selected ? theme.primary : '#CBD5E1'}`,
          bgcolor: selected ? theme.primary : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>
          {selected && <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />}
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          {!isCXOView && (
            <Box sx={{
              width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 },
              borderRadius: 3, background: theme.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconComponent sx={{ fontSize: { xs: 24, sm: 26 }, color: '#FFFFFF' }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{
                fontSize: { xs: '1.15rem', sm: '1.3rem' }, fontWeight: 800,
                color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1,
              }}>
                {title}
              </Typography>
              {description && (
                <Tooltip title={description} arrow placement="top">
                  <IconButton size="small" sx={{
                    width: 22, height: 22, color: alpha(theme.primary, 0.6),
                    '&:hover': { bgcolor: alpha(theme.primary, 0.08), color: theme.primary },
                  }}>
                    <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {urgency === 'critical' && (
              <Chip label={urgencyConfig.label} size="small" sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: '#FEE2E2', color: '#EF4444',
                border: '1px solid #FECACA',
              }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      {(primary_value || secondary_value || comparison_data || top_entries || bottom_entries || hasInfoData) && (
        <Box sx={{
          display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5,
          position: 'relative', zIndex: 1, flex: 1,
          justifyContent: (card_type === 'metric' || card_type === 'alert' || card_type === 'info') ? 'center' : 'flex-start',
        }}>
          {/* CXO View */}
          {isCXOView ? (
            resolvedInfoData.length === 1 ? (
              <CXOSingleMetric data={resolvedInfoData[0]} theme={theme} title={title} icon={IconComponent} />
            ) : (
              <CXOMultiMetric data={resolvedInfoData} theme={theme} />
            )

          /* Table Summary - Top Entries */
          ) : card_type === 'table_summary' && top_entries && top_entries.length > 0 ? (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: top_entries.length <= 3 ? 3 : 2, flex: 1, justifyContent: 'center', py: 0.5 }}>
              {top_entries.map((entry, idx) => {
                const maxValue = Math.max(...top_entries.map(e => e.value), 1);
                const percentage = (entry.value / maxValue) * 100;
                const rankTheme = CARD_THEMES[idx % CARD_THEMES.length];

                return (
                  <Tooltip key={idx} title={`${entry.fullName || entry.name}: ${entry.formatted}`} arrow placement="top" enterDelay={300}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                          <Box sx={{
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: rankTheme.primary, color: '#fff', borderRadius: 2.5,
                            fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                          }}>
                            {entry.rank}
                          </Box>
                          <Typography sx={{
                            fontSize: '0.95rem', color: '#0F172A', fontWeight: 700,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                          }}>
                            {entry.name}
                          </Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: '1.15rem', color: rankTheme.primary,
                          fontWeight: 900, letterSpacing: '-0.02em', flexShrink: 0,
                        }}>
                          {entry.formatted || smartFormat(entry.value)}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 10, bgcolor: alpha(rankTheme.primary, 0.08), borderRadius: 5, overflow: 'hidden' }}>
                        <Box sx={{
                          width: `${percentage}%`, height: '100%',
                          background: `linear-gradient(90deg, ${rankTheme.primary}, ${rankTheme.secondary})`,
                          borderRadius: 5,
                        }} />
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>

          /* Table Summary - Bottom Entries */
          ) : card_type === 'table_summary' && bottom_entries && bottom_entries.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center', py: 0.5 }}>
              {bottom_entries.slice(0, 5).map((entry, idx) => (
                <Box key={idx} sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  py: 1.5, px: 2, bgcolor: alpha(theme.primary, 0.04),
                  borderRadius: 3, border: `1px solid ${alpha(theme.primary, 0.08)}`,
                  '&:hover': { bgcolor: alpha(theme.primary, 0.07) },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%', bgcolor: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 800, color: theme.primary,
                      border: `1px solid ${alpha(theme.primary, 0.15)}`,
                    }}>
                      {entry.rank || idx + 1}
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 700 }}>
                      {entry.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={entry.value === 0 ? 'No Activity' : entry.formatted}
                    size="small"
                    sx={{
                      height: 24, bgcolor: theme.primary, color: '#fff',
                      fontWeight: 800, fontSize: '0.72rem', borderRadius: 2,
                    }}
                  />
                </Box>
              ))}
            </Box>

          /* Comparison - Array Format */
          ) : card_type === 'comparison' && Array.isArray(comparison_data) && comparison_data.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: comparison_data.length <= 2 ? 3 : 2, flex: 1, justifyContent: 'center', py: 0.5 }}>
              {comparison_data.map((entry, idx) => {
                const maxValue = Math.max(...comparison_data.map(e => e.mtd_lakhs || e.value || 0), 1);
                const value = entry.mtd_lakhs || entry.value || 0;
                const percentage = (value / maxValue) * 100;
                const changePct = entry.change_pct || 0;
                const barTheme = CARD_THEMES[idx % CARD_THEMES.length];
                const isPositive = changePct >= 0;

                return (
                  <Box key={idx} sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-end', gap: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: { xs: '0.85rem', sm: '0.95rem' }, color: '#0F172A',
                          fontWeight: 800, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {entry.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: barTheme.primary, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {entry.formatted?.split(' ')[0] || smartFormat(value)}
                          </Typography>
                          {entry.formatted?.includes('(') && (
                            <Box sx={{
                              display: 'flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.25, borderRadius: 1.5,
                              bgcolor: isPositive ? alpha('#10B981', 0.08) : alpha('#EF4444', 0.08),
                            }}>
                              {isPositive ? <TrendingUpIcon sx={{ fontSize: 12, color: '#059669' }} /> : <TrendingDownIcon sx={{ fontSize: 12, color: '#DC2626' }} />}
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: isPositive ? '#059669' : '#DC2626' }}>
                                {Math.abs(changePct)}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                        #{idx + 1}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 12, bgcolor: alpha(barTheme.primary, 0.06), borderRadius: 6, overflow: 'hidden' }}>
                      <Box sx={{
                        width: `${Math.min(percentage, 100)}%`, height: '100%',
                        background: `linear-gradient(90deg, ${barTheme.primary}, ${barTheme.secondary})`,
                        borderRadius: 6,
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>

          /* Info Card with data */
          ) : card_type === 'info' && hasInfoData ? (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center' }}>
              {primary_value !== undefined && primary_value !== null && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {primary_label || 'Total'}
                  </Typography>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: theme.primary, lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {displayPrimaryValue}
                  </Typography>
                </Box>
              )}
              {resolvedInfoData.slice(0, 5).map((entry, idx) => {
                const allValues = resolvedInfoData.map(e => (typeof e.value === 'number' ? e.value : toNumeric(e.value) || 0));
                const maxValue = Math.max(...allValues, 1);
                const numericValue = typeof entry.value === 'number' ? entry.value : toNumeric(entry.value) || 0;
                const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
                const entryTheme = CARD_THEMES[idx % CARD_THEMES.length];

                return (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entryTheme.primary }} />
                        <Typography sx={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                          {entry.name || entry.label || `Item ${idx + 1}`}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.88rem', color: entryTheme.primary, fontWeight: 700 }}>
                        {entry.formatted || (typeof entry.value === 'number' ? smartFormat(entry.value) : entry.value)}
                      </Typography>
                    </Box>
                    {typeof entry.value === 'number' && (
                      <Box sx={{ width: '100%', height: 7, bgcolor: alpha(entryTheme.primary, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: entryTheme.primary, borderRadius: 4 }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

          /* Alert Card with data */
          ) : card_type === 'alert' && hasInfoData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center', py: 0.5 }}>
              {resolvedInfoData.slice(0, 5).map((entry, idx) => {
                const displayValue = entry.formatted || (typeof entry.value === 'number' ? smartFormat(entry.value) : '');
                let displayName = entry.name || entry.label;
                if (typeof entry.value === 'string' && (!displayName || displayName === 'FO Name' || displayName === 'Label')) {
                  displayName = entry.value;
                }
                return (
                  <Box key={idx} sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    py: 1, px: 1.5, borderRadius: 2.5,
                    bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                    '&:hover': { bgcolor: '#FEE2E2' },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ fontSize: 18, color: '#EF4444' }} />
                      <Typography sx={{ fontSize: '0.88rem', color: '#991B1B', fontWeight: 600 }}>{displayName}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.88rem', color: '#EF4444', fontWeight: 700 }}>{displayValue}</Typography>
                  </Box>
                );
              })}
            </Box>

          /* Comparison - Object Format */
          ) : comparison_data && comparison_data.entity1 && comparison_data.entity2 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'space-evenly' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.primary, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {comparison_data.entity1?.formatted || smartFormat(comparison_data.entity1?.value)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
                    {comparison_data.entity1?.name || primary_label}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: theme.secondary, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {comparison_data.entity2?.formatted || smartFormat(comparison_data.entity2?.value)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
                    {comparison_data.entity2?.name || secondary_label}
                  </Typography>
                </Box>
              </Box>
              <ComparisonChart data={comparison_data} theme={theme} />
              {comparison_data.difference_percent && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                  py: 0.75, px: 1, bgcolor: theme.accent, borderRadius: 2, border: `1px dashed ${alpha(theme.primary, 0.2)}`,
                }}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: theme.primary }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: theme.primary }}>
                    {comparison_data.winner} leads by {comparison_data.difference_percent > 100 ? `${(comparison_data.difference_percent / 100).toFixed(0)}x` : `${comparison_data.difference_percent.toFixed(0)}%`}
                  </Typography>
                </Box>
              )}
            </Box>

          /* Standard Metric */
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flex: 1, py: 2 }}>
              {primary_value && (
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: '100%', bgcolor: alpha(theme.primary, 0.04), borderRadius: 4,
                  py: 3, px: 3, border: `1px dashed ${alpha(theme.primary, 0.15)}`,
                }}>
                  <Typography sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem' }, fontWeight: 800,
                    color: urgency === 'critical' ? '#EF4444' : urgency === 'high' ? '#F59E0B' : '#0F172A',
                    lineHeight: 1, letterSpacing: '-0.04em', mb: 1.5, textAlign: 'center',
                  }}>
                    {displayPrimaryValue}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {primary_label && (
                      <Chip label={primary_label} sx={{
                        fontSize: '0.8rem', fontWeight: 700, color: theme.primary,
                        bgcolor: theme.accent, borderRadius: 2, height: 30,
                        border: `1px solid ${alpha(theme.primary, 0.15)}`,
                      }} />
                    )}
                    {trend && (
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.25,
                        bgcolor: trend === 'up' ? '#ECFDF5' : trend === 'down' ? '#FEF2F2' : '#F1F5F9',
                        px: 1, py: 0.5, borderRadius: 2, height: 30,
                        border: `1px solid ${trend === 'up' ? '#A7F3D0' : trend === 'down' ? '#FECACA' : '#E2E8F0'}`,
                      }}>
                        {trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 14, color: '#059669' }} /> : trend === 'down' ? <TrendingDownIcon sx={{ fontSize: 14, color: '#DC2626' }} /> : null}
                        {displayTrendValue && (
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: trend === 'up' ? '#059669' : trend === 'down' ? '#DC2626' : '#475569' }}>
                            {displayTrendValue}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
              {secondary_value && !comparison_data && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#64748B', lineHeight: 1, mb: 0.25 }}>
                    {displaySecondaryValue}
                  </Typography>
                  {secondary_label && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>{secondary_label}</Typography>}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Action buttons */}
      {showActions && (
        <Box
          className="card-actions"
          sx={{
            position: 'absolute', top: 10, right: 10,
            display: 'flex', gap: 0.5,
            opacity: 0, transition: 'opacity 0.15s ease', zIndex: 2,
          }}
        >
          {onCreateWidget && (
            <Tooltip title="Create Widget" arrow placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCreateWidget(card); }}
                sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#EFF6FF', color: '#3B82F6', borderColor: '#BFDBFE' } }}>
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit" arrow placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', color: '#334155', borderColor: '#CBD5E1' } }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Remove" arrow placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444', borderColor: '#FECACA' } }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.card === nextProps.card &&
    prevProps.cardIndex === nextProps.cardIndex &&
    prevProps.selected === nextProps.selected &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.selectionMode === nextProps.selectionMode
  );
});

export default SummaryCard;
