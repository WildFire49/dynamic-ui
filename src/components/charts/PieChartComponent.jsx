import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  alpha,
  Fade,
  Grow
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LabelList,
  Label
} from 'recharts';

const PieChartComponent = ({ 
  data, 
  data2, // Optional second dataset for comparison (e.g., Collected Amount)
  title, 
  subtitle,
  showLegend = true,
  height = 500,
  innerRadius = "45%",
  outerRadius = "85%",
  showValues = true,
  showPercentages = true,
  animationDuration = 1000
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Professional color palette based on the theme
  const getSegmentColor = useCallback((index, isHovered = false) => {
    const colors = [
      theme.palette.primary.main,     // #f1641f - Modern coral
      theme.palette.secondary.main,   // #0078d7 - Professional blue
      theme.palette.tertiary.main,    // #37527e - Deep blue
      theme.palette.success.main,     // #48bb78 - Professional green
      theme.palette.warning.main,     // #ed8936 - Professional orange
      theme.palette.info.main,        // #0078d7 - Blue
      theme.palette.error.light,      // #fc8181 - Light red
      theme.palette.secondary.light,  // #4ca6ff - Light blue
    ];
    
    const baseColor = colors[index % colors.length];
    return isHovered ? alpha(baseColor, 0.8) : baseColor;
  }, [theme]);

  // Enhanced data with colors
  const enhancedData = data?.map((item, index) => ({
    ...item,
    fill: getSegmentColor(index),
    originalIndex: index
  })) || [];

  // Enhanced secondary data (if provided)
  const enhancedData2 = data2?.map((item, index) => ({
    ...item,
    fill: getSegmentColor(index), // Use same colors for alignment
    originalIndex: index
  })) || [];

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
    setHoveredSegment(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
    setHoveredSegment(null);
  }, []);

  // Custom label renderer
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't label small segments

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold" style={{ pointerEvents: 'none' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Determine if this is from inner or outer ring based on data structure match
      const isOuter = enhancedData2.some(d => d.name === data.name && d.value === data.value);
      
      return (
        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2,
          p: 1.5,
          boxShadow: theme.shadows[4],
          minWidth: 150
        }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
            fontSize: '0.85rem'
          }}>
            {data.name}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
            {data2 ? (isOuter ? 'Collected' : 'Target') : 'Value'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip 
              label={`${data.value.toLocaleString()}${showPercentages ? '%' : ''}`}
              size="small"
              sx={{ 
                height: 24,
                fontSize: '0.75rem',
                backgroundColor: alpha(data.fill, 0.1),
                color: data.fill,
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
      );
    }
    return null;
  };

  // ... (Rest of the render function)

  return (
    <Grow in={true} timeout={600}>
      <Card sx={{ 
        height: '100%', 
        minHeight: height + 100, // Reduced extra height
        border: 'none',
        boxShadow: theme.shadows[4],
        borderRadius: 3,
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[12],
        }
      }}>
        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Enhanced Header */}
          <Box sx={{ 
            p: 2.5, 
            pb: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            flexShrink: 0,
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: '1.125rem',
              letterSpacing: '-0.01em',
              mb: 0.5
            }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {subtitle} {data2 ? '(Inner: Target, Outer: Collected)' : ''}
              </Typography>
            )}
          </Box>

          {/* Enhanced Pie Chart */}
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Explicit height for chart container to ensure rendering */}
            <Box sx={{ width: '100%', height: height, position: 'relative', mb: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  {/* Inner Ring (Target / Primary Data) */}
                  <Pie
                    data={enhancedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={data2 ? "30%" : innerRadius}
                    outerRadius={data2 ? "55%" : outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={animationDuration}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    labelLine={false}
                    label={!data2 && showValues ? renderCustomizedLabel : false} // Hide labels for dual chart to avoid clutter
                  >
                    {enhancedData.map((entry, index) => (
                      <Cell 
                        key={`cell-inner-${index}`} 
                        fill={getSegmentColor(index, hoveredSegment === index)}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                        style={{ filter: hoveredSegment === index ? 'brightness(1.1)' : 'none' }}
                      />
                    ))}
                  </Pie>

                  {/* Outer Ring (Collected / Secondary Data) - Optional */}
                  {data2 && (
                    <Pie
                      data={enhancedData2}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="85%"
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={animationDuration}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      labelLine={false}
                    >
                      {enhancedData2.map((entry, index) => (
                        <Cell 
                          key={`cell-outer-${index}`} 
                          fill={getSegmentColor(index, hoveredSegment === index)} // Same colors
                          stroke={theme.palette.background.paper}
                          strokeWidth={2}
                          style={{ opacity: 0.8 }} // Slightly transparent to distinguish
                        />
                      ))}
                    </Pie>
                  )}
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Compact Scrollable Legend */}
            {showLegend && (
              <Fade in={true} timeout={800}>
                <Box sx={{ 
                  mt: 1,
                  pt: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  maxHeight: '150px', // Limit height
                  overflowY: 'auto', // Enable scrolling
                }}>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // Smaller items
                    gap: 1.5
                  }}>
                    {enhancedData.map((entry, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1, // Reduced padding
                        borderRadius: 1.5,
                        backgroundColor: alpha(entry.fill, 0.05),
                        border: `1px solid ${alpha(entry.fill, 0.1)}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(entry.fill, 0.1),
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: entry.fill,
                          }} />
                          <Typography variant="body2" noWrap sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: '0.75rem', // Smaller font
                            maxWidth: '80px'
                          }}>
                            {entry.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: entry.fill }}>
                          {/* Show simple value or just percentage if space is tight */}
                          {entry.value > 1000 ? `${(entry.value/1000).toFixed(0)}k` : entry.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

export default PieChartComponent;
