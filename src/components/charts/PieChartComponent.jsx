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

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
    setHoveredSegment(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
    setHoveredSegment(null);
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2,
          p: 2,
          boxShadow: theme.shadows[8],
          minWidth: 180
        }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1
          }}>
            {data.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Value:
            </Typography>
            <Chip 
              label={`${data.value}${showPercentages ? '%' : ''}`}
              size="small"
              sx={{ 
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

  // Custom label rendering function for better positioning
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    // Only show label if the slice is large enough (>= 3% of total)
    if (percent < 0.03) return null;
    
    const RADIAN = Math.PI / 180;
    // Position label outside the pie chart
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Determine text anchor based on position
    const textAnchor = x > cx ? 'start' : 'end';
    
    return (
      <g>
        {/* Connection line */}
        <line
          x1={cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN)}
          y1={cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN)}
          x2={x - (textAnchor === 'start' ? 5 : -5)}
          y2={y}
          stroke={theme.palette.text.secondary}
          strokeWidth={1}
          strokeOpacity={0.6}
        />
        {/* Label text */}
        <text
          x={x}
          y={y - 4}
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            fill: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          {name.length > 15 ? `${name.substring(0, 12)}...` : name}
        </text>
        {/* Value text */}
        <text
          x={x}
          y={y + 12}
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            fill: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          {`${value}${showPercentages ? '%' : ''}`}
        </text>
      </g>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: height + 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No data available for pie chart
        </Typography>
      </Card>
    );
  }

  return (
    <Grow in={true} timeout={600}>
      <Card sx={{ 
        height: '100%', 
        minHeight: height + 160,
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
            p: 3, 
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            flexShrink: 0,
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: '1.375rem',
              letterSpacing: '-0.025em',
              mb: 0.5
            }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Enhanced Pie Chart */}
          <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ width: '100%', height: height, flex: 1, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 60, right: 80, bottom: 60, left: 80 }}>
                  <Pie
                    data={enhancedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={animationDuration}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    labelLine={false}
                    label={showValues ? renderCustomizedLabel : false}
                  >
                    {enhancedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getSegmentColor(index, hoveredSegment === index)}
                        stroke={hoveredSegment === index ? theme.palette.background.paper : 'none'}
                        strokeWidth={hoveredSegment === index ? 3 : 0}
                        style={{
                          filter: hoveredSegment === index ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))' : 'none',
                          transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Information Display - only show for donut charts */}
              {innerRadius !== "0%" && innerRadius !== 0 && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <Typography variant="h4" sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 0.5
                  }}>
                    {enhancedData.reduce((sum, item) => sum + item.value, 0)}{showPercentages ? '%' : ''}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Total
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Enhanced Legend with Stats */}
            {showLegend && (
              <Fade in={true} timeout={800}>
                <Box sx={{ 
                  mt: 3,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 2
                  }}>
                    {enhancedData.map((entry, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(entry.fill, 0.05),
                        border: `1px solid ${alpha(entry.fill, 0.1)}`,
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(entry.fill, 0.1),
                          transform: 'translateY(-1px)',
                          boxShadow: theme.shadows[2]
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: entry.fill,
                            boxShadow: `0 0 0 2px ${alpha(entry.fill, 0.2)}`
                          }} />
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            {entry.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${entry.value}${showPercentages ? '%' : ''}`}
                          size="small"
                          sx={{ 
                            backgroundColor: entry.fill,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            '& .MuiChip-label': {
                              px: 1.5
                            }
                          }}
                        />
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
