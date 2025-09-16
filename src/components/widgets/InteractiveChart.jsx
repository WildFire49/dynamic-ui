import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  ButtonGroup,
  Button,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Stack
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  BarChart as BarIcon,
  PieChart as PieIcon,
  ShowChart as LineIcon,
  Radar as RadarIcon,
  AreaChart as AreaIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

// Stunning animations
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const InteractiveChart = ({ 
  type = 'bar', 
  title, 
  data = [], 
  index = 0,
  height = 400,
  allowTypeChange = true 
}) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState(type);
  const [animationKey, setAnimationKey] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 300);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [chartType]);

  // CEO-level color palette
  const colors = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#64748b'  // Slate
  ];

  const getGradientColors = (color) => ({
    start: color,
    end: alpha(color, 0.3)
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <Paper sx={{
        p: 2,
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 2,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Stack direction="row" alignItems="center" spacing={1} key={index}>
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: entry.color
            }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </Typography>
          </Stack>
        ))}
      </Paper>
    );
  };

  // Chart type configurations
  const chartTypes = [
    { key: 'bar', label: 'Bar Chart', icon: BarIcon, color: colors[0] },
    { key: 'pie', label: 'Pie Chart', icon: PieIcon, color: colors[1] },
    { key: 'donut', label: 'Donut Chart', icon: PieIcon, color: colors[2] },
    { key: 'line', label: 'Line Chart', icon: LineIcon, color: colors[3] },
    { key: 'area', label: 'Area Chart', icon: AreaIcon, color: colors[4] },
    { key: 'radar', label: 'Radar Chart', icon: RadarIcon, color: colors[5] }
  ];

  const renderChart = () => {
    const chartProps = {
      data
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer key={animationKey} width="100%" height={height}>
            <BarChart {...chartProps} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <defs>
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
              <XAxis 
                dataKey="name" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient0)"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer key={animationKey} width="100%" height={height}>
            <PieChart {...chartProps}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={chartType === 'donut' ? 120 : 100}
                innerRadius={chartType === 'donut' ? 60 : 0}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
                animationBegin={200}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer key={animationKey} width="100%" height={height}>
            <LineChart {...chartProps} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors[3]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={colors[4]} stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
              <XAxis 
                dataKey="name" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: colors[3], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: colors[3], strokeWidth: 2 }}
                animationDuration={1000}
                animationBegin={200}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer key={animationKey} width="100%" height={height}>
            <AreaChart {...chartProps} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[4]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={colors[4]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
              <XAxis 
                dataKey="name" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[4]}
                strokeWidth={2}
                fill="url(#areaGradient)"
                animationDuration={1000}
                animationBegin={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer key={animationKey} width="100%" height={height}>
            <RadarChart {...chartProps} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke={alpha(theme.palette.text.primary, 0.2)} />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <PolarRadiusAxis 
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                tickCount={5}
              />
              <Radar 
                dataKey="value" 
                stroke={colors[5]} 
                fill={colors[5]} 
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={1000}
                animationBegin={200}
              />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return renderChart();
    }
  };

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No data available for visualization
        </Typography>
      </Paper>
    );
  }

  return (
    <Fade in={mounted} timeout={1000}>
      <Paper
        ref={chartRef}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.default, 0.7)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          animation: `${fadeInUp} 1s ease-out`,
          animationDelay: `${index * 0.2}s`,
          animationFillMode: 'both',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
            animation: `${shimmer} 2s ease-in-out infinite`,
            animationDelay: `${index * 0.3}s`
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 3, // Add gap between title and buttons
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {title}
          </Typography>

          {allowTypeChange && (
            <ButtonGroup variant="outlined" size="small" sx={{
              ml: 2, // Add left margin for additional spacing from title
              flexShrink: 0, // Prevent buttons from shrinking
              '& .MuiButton-root': {
                minWidth: 40,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                '&.Mui-selected': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                  }
                }
              }
            }}>
              {chartTypes.map((chart) => {
                const IconComponent = chart.icon;
                return (
                  <Tooltip key={chart.key} title={chart.label} arrow>
                    <Button
                      onClick={() => setChartType(chart.key)}
                      className={chartType === chart.key ? 'Mui-selected' : ''}
                      sx={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(chart.color, 0.3)}`
                        }
                      }}
                    >
                      <IconComponent sx={{ fontSize: 16 }} />
                    </Button>
                  </Tooltip>
                );
              })}
            </ButtonGroup>
          )}
        </Box>

        {/* Chart */}
        <Box sx={{ 
          p: 2,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${scaleIn} 0.6s ease-out`,
          animationDelay: `${index * 0.1 + 0.3}s`,
          animationFillMode: 'both'
        }}>
          {renderChart()}
        </Box>

        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        <Box sx={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />
      </Paper>
    </Fade>
  );
};

export default InteractiveChart;
