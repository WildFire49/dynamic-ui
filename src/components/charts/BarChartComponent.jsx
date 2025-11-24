import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell
} from 'recharts';

// Helper function to generate colors for stages
const getStageColor = (index, total) => {
  const stageColors = [
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan  
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#f97316', // Orange
    '#14b8a6'  // Teal
  ];
  return stageColors[index % stageColors.length];
};

const BarChartComponent = ({ 
  data, 
  title, 
  subtitle,
  height = 400,
  isStacked = false,
  stageNames = [],
  dataType = 'default',
  xAxisKey = 'name',
  yAxisLabel = 'Value',
  showLegend = true,
  isTargetVsAchievement = false
}) => {
  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No data available for bar chart
      </Typography>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: height + 200,
      border: 'none',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: '1px solid #f3f4f6',
          flexShrink: 0
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '1.125rem',
            letterSpacing: '-0.025em'
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              mt: 0.5,
              fontSize: '0.875rem'
            }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Bar Chart */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ width: '100%', height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: isStacked ? 120 : 100 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f3f4f6"
                  strokeWidth={0.5}
                />
                <XAxis 
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="end" 
                          fill="#6b7280" 
                          transform="rotate(-45)"
                          style={{ fontSize: '11px', fontWeight: 500 }}
                        >
                          {payload.value.length > 15 ? `${payload.value.substring(0, 12)}...` : payload.value}
                        </text>
                      </g>
                    );
                  }}
                  height={90} // Increased height for rotated labels
                  interval={0}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 11, 
                    fill: '#6b7280',
                    fontWeight: 500
                  }}
                  label={{ 
                    value: yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [
                    dataType === 'pipeline' ? `${value} cases` : value.toLocaleString(),
                    dataType === 'pipeline' ? (isStacked ? name : 'Pending Cases') : 'Value'
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '0.25rem' }}
                />
                
                {isStacked && dataType === 'pipeline' ? 
                  // Render stacked bars for multi-region pipeline data
                  stageNames.map((stageName, index) => (
                    <Bar 
                      key={stageName}
                      dataKey={stageName}
                      stackId="pipeline"
                      fill={getStageColor(index, stageNames.length)}
                      radius={index === stageNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))
                  :
                  // Single bar for simple data
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || getStageColor(index, data.length)} />
                    ))}
                  </Bar>
                }
                
                {showLegend && isStacked && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Aesthetic Scrollable Legend for non-stacked charts */}
          {!isTargetVsAchievement && !isStacked && (
            <Box sx={{ 
              mt: 4,
              pt: 2,
              borderTop: '1px solid #f3f4f6',
              maxHeight: '120px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '4px' }
            }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 600,
                color: '#9ca3af',
                mb: 1,
                display: 'block',
                textTransform: 'uppercase',
                fontSize: '0.7rem'
              }}>
                {dataType === 'pipeline' ? 'Pipeline Stages' : 'Legend'}
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 1
              }}>
                {data.map((entry, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 0.75,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: '#f9fafb' }
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: entry.fill || getStageColor(index, data.length),
                      flexShrink: 0
                    }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" noWrap sx={{ 
                        color: '#374151',
                        fontWeight: 500,
                        display: 'block',
                        lineHeight: 1.2
                      }}>
                        {entry.name || entry[xAxisKey]}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#6b7280', 
                        fontSize: '0.7rem'
                      }}>
                        {entry.value?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChartComponent;
