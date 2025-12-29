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
  AttachMoney as DollarIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import MoneyIcon from '@mui/icons-material/Money';

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
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    label: 'Critical',
  },
  high: {
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    label: 'High',
  },
  medium: {
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    label: 'Medium',
  },
  low: {
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    label: 'Low',
  },
  info: {
    color: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#A5B4FC',
    label: 'Info',
  },
};

// Uniform card height for consistent layout - taller for better graph visibility
const CARD_TYPE_STYLES = {
  metric: { minHeight: 200 },
  alert: { minHeight: 200 },
  comparison: { minHeight: 240 },
  trend: { minHeight: 200 },
  table_summary: { minHeight: 240 },
  insight: { minHeight: 200 },
  info: { minHeight: 200 },
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
      { name: data.entity1.name, value: data.entity1.value, formatted: data.entity1.formatted, fill: '#1E40AF' },
      { name: data.entity2.name, value: data.entity2.value, formatted: data.entity2.formatted, fill: '#93C5FD' },
    ];
  }, [data]);

  if (chartData.length === 0) return null;

  const maxValue = Math.max(...chartData.map(d => d.value));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)', 
          p: 1.5, 
          border: '1px solid #E2E8F0', 
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)'
        }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
            {data.name}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF' }}>
            {data.formatted || smartFormat(data.value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', flex: 1, minHeight: 100, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="20%">
          <XAxis type="number" hide domain={[0, maxValue * 1.15]} />
          <YAxis type="category" dataKey="name" hide />
          <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28} animationDuration={1000}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? "url(#colorGradientPrimary)" : "url(#colorGradientSecondary)"} />
            ))}
          </Bar>
          <defs>
            <linearGradient id="colorGradientPrimary" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="colorGradientSecondary" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Background decorations for "jazz and oomph"
const CardBackground = ({ type, color }) => {
  const decorations = {
    metric: (
      <>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <svg style={{ position: 'absolute', top: 10, right: 10, width: 40, height: 40, opacity: 0.05, pointerEvents: 'none' }} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </>
    ),
    comparison: (
      <>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: `linear-gradient(135deg, ${alpha(color, 0.04)} 0%, transparent 100%)`, pointerEvents: 'none' }} />
        <svg style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 100, opacity: 0.08, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 30 50 70 50 100 0 L 100 100 Z" fill={color} />
        </svg>
      </>
    ),
    alert: (
      <>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color, opacity: 0.8 }} />
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at top right, ${alpha(color, 0.15)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <svg style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, opacity: 0.05, pointerEvents: 'none' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      </>
    ),
    table_summary: (
      <>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      </>
    ),
  };
  return decorations[type] || decorations.metric;
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

  // Determine if we should show the card type label
  // User requested: "dont show comparison as widget in title... table summary alert is fine"
  const showTypeLabel = ['alert', 'table_summary'].includes(card_type);

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        p: { xs: 2, sm: 3 }, // Increased padding for breathability
        borderRadius: 4,
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: selected ? cardColor : 'rgba(226, 232, 240, 0.8)',
        cursor: selectable || onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selected 
          ? `0 12px 32px ${alpha(cardColor, 0.2)}` 
          : '0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.04)', // Cleaner, softer shadow
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Contain background decorations
        ...cardStyles,
        '&:hover': {
          transform: 'translateY(-6px) scale(1.01)',
          boxShadow: '0 20px 40px -4px rgba(0,0,0,0.08), 0 8px 12px -4px rgba(0,0,0,0.04)',
          borderColor: alpha(cardColor, 0.4),
        },
        animation: 'fadeInUp 0.6s ease-out forwards',
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <CardBackground type={card_type} color={cardColor} />

      {/* Selection indicator */}
      {selectable && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: `2px solid ${selected ? cardColor : '#CBD5E1'}`,
            bgcolor: selected ? cardColor : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 2,
          }}
        >
          {selected && <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />}
        </Box>
      )}

      {/* Header with icon and urgency badge */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
          <Box
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${cardColor} 0%, ${alpha(cardColor, 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 8px 16px ${alpha(cardColor, 0.2)}`,
            }}
          >
            <IconComponent sx={{ fontSize: { xs: 24, sm: 28 }, color: '#FFFFFF' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                {showTypeLabel && (
                  <Typography
                      sx={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: alpha('#64748B', 0.9),
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      }}
                  >
                      {card_type.replace('_', ' ')}
                  </Typography>
                )}
                {urgency === 'critical' && (
                    <Chip
                    label={urgencyConfig.label}
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: '#FEE2E2',
                        color: urgencyConfig.color,
                        border: '1px solid',
                        borderColor: '#FECACA',
                        px: 0.5,
                        '& .MuiChip-label': { px: 0.5 },
                    }}
                    />
                )}
             </Box>
             {/* Title - Bigger and bolder */}
            <Typography
                sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 0.25,
                }}
            >
                {title}
            </Typography>
            {description && (
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: '#94A3B8',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontWeight: 400,
                  mt: 0,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Metrics - Widget Style */}
      {(primary_value || secondary_value || comparison_data || top_entries || bottom_entries || info_data) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5, position: 'relative', zIndex: 1, flex: 1, justifyContent: (card_type === 'metric' || card_type === 'alert') ? 'center' : 'flex-start' }}>
          {/* Table Summary Card - Top Entries with progress bars */}
          {card_type === 'table_summary' && top_entries && top_entries.length > 0 ? (
            <Box sx={{ width: '100%', mt: 0, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'flex-start' }}>
              {top_entries.map((entry, idx) => (
                <Tooltip key={idx} title={`${entry.fullName || entry.name}: ${entry.formatted}`} arrow placement="top" enterDelay={200}>
                  <Box sx={{ cursor: 'default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ 
                          fontSize: '0.7rem', 
                          color: '#64748B', 
                          fontWeight: 700,
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: idx === 0 ? '#1E40AF' : '#F1F5F9',
                          color: idx === 0 ? '#FFFFFF' : '#64748B',
                          borderRadius: '50%',
                          border: idx === 0 ? 'none' : '1px solid #E2E8F0'
                        }}>
                          {entry.rank}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                          {entry.name}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem', color: '#1E40AF', fontWeight: 700 }}>
                        {entry.formatted || smartFormat(entry.value)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 12, 
                      bgcolor: '#F1F5F9', 
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}>
                      <Box sx={{ 
                        width: `${(entry.value / Math.max(...top_entries.map(e => e.value))) * 100}%`, 
                        height: '100%', 
                        background: `linear-gradient(90deg, ${idx === 0 ? '#1E40AF' : '#3B82F6'} 0%, ${idx === 0 ? '#3B82F6' : '#60A5FA'} 100%)`,
                        borderRadius: 6,
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }} />
                    </Box>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          ) : card_type === 'table_summary' && bottom_entries && bottom_entries.length > 0 ? (
            /* Table Summary Card - Bottom Entries (Zero Performers) */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, justifyContent: 'space-between', py: 0.5 }}>
              {bottom_entries.slice(0, 5).map((entry, idx) => (
                <Box 
                  key={idx} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 1.25,
                    px: 2,
                    bgcolor: '#FFF5F5',
                    borderRadius: 3,
                    border: '1px solid #FED7D7',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(4px)', bgcolor: '#FEB2B2' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <Box sx={{ 
                         width: 24, 
                         height: 24, 
                         borderRadius: '50%', 
                         bgcolor: '#FFFFFF', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         fontSize: '0.75rem',
                         fontWeight: 800,
                         color: '#E53E3E',
                         boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                     }}>
                         {entry.rank || idx + 1}
                     </Box>
                     <Typography sx={{ fontSize: '0.85rem', color: '#9B2C2C', fontWeight: 700 }}>
                        {entry.name}
                     </Typography>
                  </Box>
                  <Chip 
                    label={entry.value === 0 ? 'No Activity' : entry.formatted} 
                    size="small"
                    sx={{ 
                      height: 22,
                      bgcolor: '#FFFFFF', 
                      color: '#E53E3E', 
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      borderRadius: 1.5,
                      border: '1px solid #FC8181'
                    }} 
                  />
                </Box>
              ))}
            </Box>
          ) : card_type === 'comparison' && Array.isArray(comparison_data) && comparison_data.length > 0 ? (
            /* Comparison Card - Array Format (MTD vs LMTD style with bar chart) */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, justifyContent: 'flex-start', py: 0 }}>
              {comparison_data.slice(0, 1).map((item, idx) => {
                const mtdValue = item.mtd_lakhs || 0;
                const lmtdValue = item.lmtd_lakhs || 0;
                const maxValue = Math.max(mtdValue, lmtdValue);
                const changePct = item.change_pct || 0;
                const isPositive = changePct >= 0;
                // Green for positive growth, Red for negative
                const trendColor = isPositive ? '#10B981' : '#EF4444';
                const trendBg = isPositive ? '#ECFDF5' : '#FEF2F2';
                
                return (
                  <React.Fragment key={idx}>
                    {/* Values Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', px: 0 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Current (MTD)
                        </Typography>
                        <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: trendColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
                          ₹{mtdValue.toFixed(0)}L
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                         <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Previous (LMTD)
                        </Typography>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#64748B', lineHeight: 1 }}>
                          ₹{lmtdValue.toFixed(0)}L
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Bar Chart - Both Colored (Not Gray) - Flex grow to fill space */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'flex-start', py: 1, mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ flex: 1, height: 32, bgcolor: '#F1F5F9', borderRadius: 16, overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                          <Box sx={{ 
                            width: `${maxValue > 0 ? (mtdValue / maxValue) * 100 : 0}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #1E40AF 0%, #3B82F6 100%)',
                            borderRadius: 16,
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 6px rgba(30, 64, 175, 0.25)'
                          }} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ flex: 1, height: 32, bgcolor: '#F1F5F9', borderRadius: 16, overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                          <Box sx={{ 
                            width: `${maxValue > 0 ? (lmtdValue / maxValue) * 100 : 0}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #94A3B8 0%, #CBD5E1 100%)', 
                            borderRadius: 16,
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                          }} />
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Change Badge */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      mt: 0,
                      px: 0
                    }}>
                       <Box sx={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           gap: 0.5, 
                           bgcolor: trendBg,
                           px: 2,
                           py: 1,
                           borderRadius: 4,
                           border: `1px solid ${alpha(trendColor, 0.1)}`,
                           boxShadow: `0 2px 8px ${alpha(trendColor, 0.15)}`
                       }}>
                            {isPositive ? (
                                <TrendingUpIcon sx={{ fontSize: 22, color: trendColor }} />
                            ) : (
                                <TrendingDownIcon sx={{ fontSize: 22, color: trendColor }} />
                            )}
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: trendColor }}>
                                {Math.abs(changePct).toFixed(1)}%
                            </Typography>
                       </Box>
                       <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                           vs Last Month
                       </Typography>
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          ) : card_type === 'info' && info_data && info_data.length > 0 ? (
            /* Info Card */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, justifyContent: 'space-between', py: 1 }}>
              {info_data.slice(0, 3).map((item, idx) => (
                <Box key={idx} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: idx % 2 === 0 ? '#F8FAFC' : 'transparent'
                }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 700 }}>
                    {item.formatted || smartFormat(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : card_type === 'alert' && info_data && info_data.length > 0 ? (
            /* Alert Card */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, justifyContent: 'space-between', py: 1 }}>
              {info_data.slice(0, 3).map((item, idx) => (
                <Box key={idx} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: '#FEF2F2'
                }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#7F1D1D', fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 700 }}>
                    {item.formatted || smartFormat(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : comparison_data && comparison_data.entity1 && comparison_data.entity2 ? (
            /* Comparison Card - Object Format */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, justifyContent: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#1E40AF',
                      lineHeight: 1,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {comparison_data.entity1?.formatted || smartFormat(comparison_data.entity1?.value)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
                    {comparison_data.entity1?.name || primary_label}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#3B82F6',
                      lineHeight: 1,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {comparison_data.entity2?.formatted || smartFormat(comparison_data.entity2?.value)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
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
                    py: 0.75,
                    px: 1,
                    mt: 0.5,
                    bgcolor: '#EFF6FF',
                    borderRadius: 2,
                    border: '1px dashed #BFDBFE'
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#1E40AF' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF' }}>
                    {comparison_data.winner} leads by {comparison_data.difference_percent > 100 ? `${(comparison_data.difference_percent / 100).toFixed(0)}x` : `${comparison_data.difference_percent.toFixed(0)}%`}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            /* Standard Metric Layout - Highlighted & Centered */
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              flex: 1,
              py: 1
            }}>
              {primary_value && (
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  bgcolor: alpha(cardColor, 0.04),
                  borderRadius: 4,
                  py: 3,
                  px: 2,
                  border: `1px dashed ${alpha(cardColor, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle background decoration for the highlight box */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    background: `radial-gradient(circle, ${alpha(cardColor, 0.1)} 0%, transparent 70%)`, 
                    pointerEvents: 'none' 
                  }} />

                  <Typography
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.25rem' },
                      fontWeight: 800,
                      color: urgency === 'critical' ? '#EF4444' : urgency === 'high' ? '#F59E0B' : '#0F172A',
                      lineHeight: 1,
                      letterSpacing: '-0.04em',
                      background: urgency === 'high' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'none',
                      WebkitBackgroundClip: urgency === 'high' ? 'text' : 'none',
                      WebkitTextFillColor: urgency === 'high' ? 'transparent' : 'initial',
                      mb: 1.5,
                      textAlign: 'center'
                    }}
                  >
                    {displayPrimaryValue}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {primary_label && (
                        <Chip
                          label={primary_label}
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#1E40AF',
                            bgcolor: '#DBEAFE',
                            borderRadius: 6,
                            height: 32,
                            border: '1px solid #93C5FD',
                            px: 0.5,
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                            '& .MuiChip-label': { px: 1.5 }
                          }}
                        />
                    )}
                    {trend && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                          bgcolor: trend === 'up' ? '#ECFDF5' : trend === 'down' ? '#FEF2F2' : '#F1F5F9',
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          height: 32,
                          border: `1px solid ${trend === 'up' ? '#A7F3D0' : trend === 'down' ? '#FECACA' : '#E2E8F0'}`
                        }}
                      >
                        {trend === 'up' ? (
                          <TrendingUpIcon sx={{ 
                            fontSize: 16, 
                            color: '#059669',
                            animation: 'bounceUp 2s infinite ease-in-out',
                            '@keyframes bounceUp': {
                              '0%, 100%': { transform: 'translateY(0)' },
                              '50%': { transform: 'translateY(-3px)' },
                            }
                          }} />
                        ) : trend === 'down' ? (
                          <TrendingDownIcon sx={{ 
                            fontSize: 16, 
                            color: '#DC2626',
                            animation: 'bounceDown 2s infinite ease-in-out',
                            '@keyframes bounceDown': {
                              '0%, 100%': { transform: 'translateY(0)' },
                              '50%': { transform: 'translateY(3px)' },
                            }
                          }} />
                        ) : null}
                        {displayTrendValue && (
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: trend === 'up' ? '#059669' : trend === 'down' ? '#DC2626' : '#475569' }}>
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
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#64748B',
                      lineHeight: 1,
                      mb: 0.25,
                    }}
                  >
                    {displaySecondaryValue}
                  </Typography>
                  {secondary_label && (
                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>
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
            top: 12,
            right: 12,
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transform: 'translateY(-5px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '.MuiBox-root:hover > &': { 
              opacity: 1,
              transform: 'translateY(0)'
            },
            zIndex: 2,
          }}
          className="card-actions"
        >
          {onCreateWidget && (
            <Tooltip title="Create Widget from this insight" arrow placement="top">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onCreateWidget(card); }}
                sx={{ 
                  width: 28,
                  height: 28,
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  '&:hover': { 
                    bgcolor: '#EFF6FF', 
                    color: '#3B82F6',
                    borderColor: '#BFDBFE',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s',
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit" arrow placement="top">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                sx={{ 
                  width: 28,
                  height: 28,
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  '&:hover': { 
                    bgcolor: '#F8FAFC', 
                    color: '#334155',
                    borderColor: '#CBD5E1',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s',
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Remove" arrow placement="top">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                sx={{ 
                  width: 28,
                  height: 28,
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  '&:hover': { 
                    bgcolor: '#FEF2F2', 
                    color: '#EF4444',
                    borderColor: '#FECACA',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s',
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SummaryCard;
