'use client';

import React, { useMemo } from 'react';
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

/**
 * Format number to Indian currency (Lakhs/Crores)
 */
const formatIndianCurrency = (value) => {
  if (!value) return value;
  
  // If already formatted with ₹ or L/Cr, return as is
  if (typeof value === 'string' && (value.includes('₹') || value.includes('L') || value.includes('Cr'))) {
    return value;
  }
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  
  if (isNaN(num)) return value;
  
  // Convert to Lakhs or Crores
  if (num >= 10000000) { // 1 Crore = 10 Million
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  } else if (num >= 100000) { // 1 Lakh = 100 Thousand
    return `₹${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return `₹${num.toFixed(0)}`;
};

/**
 * Smart format - handles currency, percentages, and plain numbers
 */
const smartFormat = (value) => {
  if (!value) return value;
  
  const str = String(value);
  
  // Already formatted
  if (str.includes('₹') || str.includes('%') || str.includes('L') || str.includes('Cr')) {
    return str;
  }
  
  // Check if it's a percentage
  if (str.includes('%') || (parseFloat(str) > 0 && parseFloat(str) <= 100 && str.length <= 5)) {
    return str.includes('%') ? str : `${str}%`;
  }
  
  // Check if it looks like currency (has M, K, or large number)
  if (str.includes('M') || str.includes('K') || parseFloat(str.replace(/[^0-9.-]/g, '')) > 1000) {
    // Convert M to Indian format
    if (str.includes('M')) {
      const num = parseFloat(str.replace('M', '')) * 1000000;
      return formatIndianCurrency(num);
    }
    return formatIndianCurrency(str);
  }
  
  return value;
};
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
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
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  RemoveRedEye as ViewIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const ICON_MAP = {
  Warning: WarningIcon,
  TrendingUp: TrendingUpIcon,
  TrendingDown: TrendingDownIcon,
  CompareArrows: CompareArrowsIcon,
  Compare: CompareArrowsIcon,
  ShowChart: ShowChartIcon,
  TableChart: TableChartIcon,
  Table: TableChartIcon,
  Lightbulb: LightbulbIcon,
  Info: InfoIcon,
  CheckCircle: CheckCircleIcon,
  Money: MoneyIcon,
  Star: StarIcon,
  Timeline: TimelineIcon,
};

const URGENCY_CONFIG = {
  critical: {
    color: '#EF4444',
    bgColor: '#FFFFFF',
    borderColor: '#FCA5A5',
    label: 'Critical',
  },
  high: {
    color: '#F59E0B',
    bgColor: '#FFFFFF',
    borderColor: '#FCD34D',
    label: 'High',
  },
  medium: {
    color: '#3B82F6',
    bgColor: '#FFFFFF',
    borderColor: '#BFDBFE',
    label: 'Medium',
  },
  low: {
    color: '#3B82F6',
    bgColor: '#FFFFFF',
    borderColor: '#BFDBFE',
    label: 'Low',
  },
  info: {
    color: '#3B82F6',
    bgColor: '#FFFFFF',
    borderColor: '#BFDBFE',
    label: 'Info',
  },
};

// Uniform card height for consistent layout - taller for better graph visibility
const CARD_TYPE_STYLES = {
  metric: { minHeight: 180 },
  alert: { minHeight: 180 },
  comparison: { minHeight: 220 },
  trend: { minHeight: 180 },
  table_summary: { minHeight: 200 },
  insight: { minHeight: 180 },
  info: { minHeight: 180 },
};

// Beautiful gradient colors for charts - Blue theme with red/yellow accents
const CHART_COLORS = {
  primary: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  success: ['#1D4ED8', '#3B82F6', '#60A5FA'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D'],
  danger: ['#EF4444', '#F87171', '#FCA5A5'],
  purple: ['#1E3A8A', '#2563EB', '#3B82F6'],
};

// Comparison Bar Chart Component - Blue theme
const ComparisonChart = ({ data, color }) => {
  const chartData = useMemo(() => {
    if (!data?.entity1 || !data?.entity2) return [];
    return [
      { name: data.entity1.name, value: data.entity1.value, fill: '#1E40AF' },
      { name: data.entity2.name, value: data.entity2.value, fill: '#93C5FD' },
    ];
  }, [data]);

  if (chartData.length === 0) return null;

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <Box sx={{ width: '100%', height: 80, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, maxValue * 1.1]} />
          <YAxis type="category" dataKey="name" hide />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {chartData.map((entry, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.fill }} />
            <Typography sx={{ fontSize: '0.6rem', color: '#6B7280' }}>{entry.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Horizontal Bar Chart for Top Entries
const TopEntriesChart = ({ entries, color }) => {
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return entries.slice(0, 5).map((entry, idx) => ({
      name: entry.name?.length > 15 ? entry.name.substring(0, 15) + '...' : entry.name,
      fullName: entry.name,
      value: entry.value,
      formatted: entry.formatted,
      rank: entry.rank || idx + 1,
    }));
  }, [entries]);

  if (chartData.length === 0) return null;

  const maxValue = Math.max(...chartData.map(d => d.value));
  // Blue gradient colors - darker to lighter
  const colors = ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

  // Ensure rupee symbol is shown
  const formatValue = (val) => {
    if (!val) return val;
    const str = String(val);
    if (str.includes('₹')) return str;
    return str;
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {chartData.map((entry, idx) => (
        <Box key={idx} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#374151', fontWeight: 500 }}>
              {entry.rank}. {entry.name}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: colors[0], fontWeight: 600 }}>
              {formatValue(entry.formatted)}
            </Typography>
          </Box>
          <Box sx={{ 
            width: '100%', 
            height: 6, 
            bgcolor: '#F3F4F6', 
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              width: `${(entry.value / maxValue) * 100}%`, 
              height: '100%', 
              bgcolor: colors[idx] || colors[4],
              borderRadius: 3,
              transition: 'width 0.5s ease-out',
            }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Donut Chart for Comparison
const ComparisonDonut = ({ data, color }) => {
  const chartData = useMemo(() => {
    if (!data?.entity1 || !data?.entity2) return [];
    return [
      { name: data.entity1.name, value: data.entity1.value },
      { name: data.entity2.name, value: data.entity2.value },
    ];
  }, [data]);

  if (chartData.length === 0) return null;

  const COLORS = [color || '#3B82F6', '#E5E7EB'];
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const percentage = total > 0 ? ((chartData[0].value / total) * 100).toFixed(0) : 0;

  return (
    <Box sx={{ width: '100%', height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={45}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ 
        position: 'absolute', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
      }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: color || '#3B82F6', lineHeight: 1 }}>
          {percentage}%
        </Typography>
        <Typography sx={{ fontSize: '0.5rem', color: '#9CA3AF', fontWeight: 500 }}>
          {chartData[0]?.name}
        </Typography>
      </Box>
    </Box>
  );
};

const SummaryCard = ({
  card,
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
}) => {
  const {
    id,
    card_type = 'metric',
    urgency = 'info',
    title,
    description,
    primary_value,
    primary_label,
    secondary_value,
    secondary_label,
    trend,
    trend_value,
    icon = 'Info',
    color,
    action_text,
    comparison_data,
    metric_unit,
    formatted_primary_value,
    formatted_secondary_value,
    top_entries,
    bottom_entries,
    info_data,
    sort_by,
    sort_order,
  } = card;
  
  // Smart formatting for values
  const displayPrimaryValue = formatted_primary_value || smartFormat(primary_value) || primary_value;
  const displaySecondaryValue = formatted_secondary_value || smartFormat(secondary_value) || secondary_value;
  const displayTrendValue = trend_value;

  const IconComponent = ICON_MAP[icon] || InfoIcon;
  const urgencyConfig = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.info;
  const cardColor = color || urgencyConfig.color;
  const cardStyles = CARD_TYPE_STYLES[card_type] || {};

  const sizeStyles = {
    small: { p: 1.5, titleSize: '0.8rem', valueSize: '1.25rem' },
    medium: { p: 2, titleSize: '0.9rem', valueSize: '1.5rem' },
    large: { p: 2.5, titleSize: '1rem', valueSize: '1.75rem' },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const handleClick = (e) => {
    if (selectable && onSelect) {
      onSelect(id, !selected);
    } else if (onClick) {
      onClick(card);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        p: { xs: 2, sm: currentSize.p },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${cardColor}`,
        cursor: selectable || onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selected 
          ? `0 4px 16px ${alpha(cardColor, 0.3)}` 
          : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...cardStyles,
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          borderColor: cardColor,
        },
      }}
    >
      {/* Selection indicator */}
      {selectable && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: `2px solid ${selected ? cardColor : '#D1D5DB'}`,
            bgcolor: selected ? cardColor : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {selected && <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />}
        </Box>
      )}

      {/* Header with icon and urgency badge */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(cardColor, 0.15)} 0%, ${alpha(cardColor, 0.08)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent sx={{ fontSize: { xs: 18, sm: 20 }, color: cardColor }} />
          </Box>
          {(urgency === 'critical' || urgency === 'high') && (
            <Chip
              label={urgencyConfig.label}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: alpha(urgencyConfig.color, 0.12),
                color: urgencyConfig.color,
                border: `1px solid ${alpha(urgencyConfig.color, 0.2)}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>
        <Chip
          label={card_type.replace('_', ' ')}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.55rem',
            fontWeight: 600,
            bgcolor: '#F3F4F6',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      </Box>

      {/* Title - allow 2 lines on mobile */}
      <Typography
        sx={{
          fontSize: { xs: '0.9rem', sm: '0.95rem' },
          fontWeight: 600,
          color: '#111827',
          lineHeight: 1.35,
          mb: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {title}
      </Typography>

      {/* Metrics - Widget Style */}
      {(primary_value || secondary_value || comparison_data || top_entries || bottom_entries || info_data) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
          {/* Table Summary Card - Top Entries with progress bars */}
          {card_type === 'table_summary' && top_entries && top_entries.length > 0 ? (
            <TopEntriesChart entries={top_entries} color="#1E40AF" />
          ) : card_type === 'table_summary' && bottom_entries && bottom_entries.length > 0 ? (
            /* Table Summary Card - Bottom Entries (Zero Performers) - Simple list, no progress bars */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {bottom_entries.slice(0, 5).map((entry, idx) => (
                <Box 
                  key={idx} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 0.5,
                    px: 1,
                    bgcolor: '#FEF2F2',
                    borderRadius: 1,
                    border: '1px solid #FECACA',
                  }}
                >
                  <Typography sx={{ fontSize: '0.7rem', color: '#991B1B', fontWeight: 500 }}>
                    {entry.rank ? `${entry.rank}. ` : ''}{entry.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 600 }}>
                    {entry.value === 0 ? 'No Activity' : entry.formatted}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : card_type === 'comparison' && Array.isArray(comparison_data) && comparison_data.length > 0 ? (
            /* Comparison Card - Array Format (MTD vs LMTD style with bar chart) */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {comparison_data.slice(0, 1).map((item, idx) => {
                const mtdValue = item.mtd_lakhs || 0;
                const lmtdValue = item.lmtd_lakhs || 0;
                const maxValue = Math.max(mtdValue, lmtdValue);
                const changePct = item.change_pct || 0;
                const isPositive = changePct >= 0;
                
                return (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Values Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E40AF', lineHeight: 1 }}>
                          ₹{mtdValue.toFixed(0)}L
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#6B7280', fontWeight: 500, mt: 0.25 }}>
                          MTD
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B', lineHeight: 1 }}>
                          ₹{lmtdValue.toFixed(0)}L
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 500, mt: 0.25 }}>
                          LMTD
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Bar Chart */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.6rem', color: '#6B7280', width: 32 }}>MTD</Typography>
                        <Box sx={{ flex: 1, height: 8, bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ 
                            width: `${maxValue > 0 ? (mtdValue / maxValue) * 100 : 0}%`, 
                            height: '100%', 
                            bgcolor: '#1E40AF',
                            borderRadius: 4,
                            transition: 'width 0.5s ease-out',
                          }} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.6rem', color: '#6B7280', width: 32 }}>LMTD</Typography>
                        <Box sx={{ flex: 1, height: 8, bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ 
                            width: `${maxValue > 0 ? (lmtdValue / maxValue) * 100 : 0}%`, 
                            height: '100%', 
                            bgcolor: '#93C5FD',
                            borderRadius: 4,
                            transition: 'width 0.5s ease-out',
                          }} />
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Change Badge */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 0.5,
                      py: 0.5,
                      px: 1,
                      bgcolor: isPositive ? '#ECFDF5' : '#FEF2F2',
                      borderRadius: 1.5,
                    }}>
                      {isPositive ? (
                        <TrendingUpIcon sx={{ fontSize: 12, color: '#10B981' }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 12, color: '#EF4444' }} />
                      )}
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: isPositive ? '#10B981' : '#EF4444' }}>
                        {isPositive ? '↑' : '↓'} {Math.abs(changePct).toFixed(1)}% vs LMTD
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : card_type === 'info' && info_data && info_data.length > 0 ? (
            /* Info Card - Display info_data list */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {info_data.slice(0, 3).map((item, idx) => (
                <Box key={idx} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 0.5,
                  borderBottom: idx < info_data.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600 }}>
                    {item.formatted || smartFormat(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : card_type === 'alert' && info_data && info_data.length > 0 ? (
            /* Alert Card - Display info_data list with red accent */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {info_data.slice(0, 3).map((item, idx) => (
                <Box key={idx} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 0.5,
                  borderBottom: idx < info_data.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                    {item.formatted || smartFormat(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : comparison_data && comparison_data.entity1 && comparison_data.entity2 ? (
            /* Comparison Card - Object Format (entity1 vs entity2) */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#1E40AF',
                      lineHeight: 1,
                    }}
                  >
                    {comparison_data.entity1?.formatted || smartFormat(comparison_data.entity1?.value)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: '#6B7280', fontWeight: 500, mt: 0.25 }}>
                    {comparison_data.entity1?.name || primary_label}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#3B82F6',
                      lineHeight: 1,
                    }}
                  >
                    {comparison_data.entity2?.formatted || smartFormat(comparison_data.entity2?.value)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 500, mt: 0.25 }}>
                    {comparison_data.entity2?.name || secondary_label}
                  </Typography>
                </Box>
              </Box>
              <ComparisonChart data={comparison_data} color="#1E40AF" />
              {comparison_data.difference_percent && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    py: 0.5,
                    px: 1,
                    bgcolor: '#EFF6FF',
                    borderRadius: 1.5,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 12, color: '#1E40AF' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#1E40AF' }}>
                    {comparison_data.winner} leads by {comparison_data.difference_percent > 100 ? `${(comparison_data.difference_percent / 100).toFixed(0)}x` : `${comparison_data.difference_percent.toFixed(0)}%`}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            /* Standard Metric Layout - Blue theme with red/yellow accents for trends */
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              {primary_value && (
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.25 }}>
                    <Typography
                      sx={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: urgency === 'critical' ? '#EF4444' : urgency === 'high' ? '#F59E0B' : '#1E40AF',
                        lineHeight: 1,
                      }}
                    >
                      {displayPrimaryValue}
                    </Typography>
                    {trend && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                          color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280',
                        }}
                      >
                        {trend === 'up' ? (
                          <TrendingUpIcon sx={{ fontSize: 14 }} />
                        ) : trend === 'down' ? (
                          <TrendingDownIcon sx={{ fontSize: 14 }} />
                        ) : null}
                        {displayTrendValue && (
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                            {displayTrendValue}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  {primary_label && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 500 }}>
                      {primary_label}
                    </Typography>
                  )}
                </Box>
              )}

              {secondary_value && !comparison_data && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#6B7280',
                      lineHeight: 1,
                      mb: 0.25,
                    }}
                  >
                    {displaySecondaryValue}
                  </Typography>
                  {secondary_label && (
                    <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 500 }}>
                      {secondary_label}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Action buttons */}
      {showActions && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '.MuiBox-root:hover > &': { opacity: 1 },
          }}
          className="card-actions"
        >
          {onCreateWidget && (
            <Tooltip title="Create Widget from this insight" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onCreateWidget(card); }}
                sx={{ 
                  bgcolor: '#fff', 
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#EFF6FF', color: '#3B82F6' }
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                sx={{ 
                  bgcolor: '#fff', 
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#F3F4F6' }
                }}
              >
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Remove" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                sx={{ 
                  bgcolor: '#fff', 
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' }
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SummaryCard;
