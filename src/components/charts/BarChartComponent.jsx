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
          <Box sx={{ width: '100%', height: height, mb: -10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: isStacked ? 120 : 40 }}
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
                  tick={{ 
                    fontSize: 11, 
                    fill: '#6b7280',
                    fontWeight: 500
                  }}
                  height={isStacked ? 100 : 40}
                  interval={0}
                  angle={isStacked ? -45 : 0}
                  textAnchor={isStacked ? "end" : "middle"}
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
                    dataType === 'pipeline' ? `${value} cases` : `Score: ${value}`,
                    dataType === 'pipeline' ? (isStacked ? name : 'Pending Cases') : 'Average Score'
                  ]}
                  labelFormatter={(label) => 
                    dataType === 'pipeline' ? (isStacked ? `Region: ${label}` : `Stage: ${label}`) : `Region: ${label}`
                  }
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
          
          {/* Custom Legend for non-stacked charts */}
          {!isTargetVsAchievement && !isStacked && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
              mt: 2,
              pt: 2,
              borderTop: '1px solid #f3f4f6'
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600,
                color: '#374151',
                mb: 1
              }}>
                {dataType === 'pipeline' ? 'Pipeline Stages' : 'Regional Scores'}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 1
              }}>
                {data.map((entry, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    fontSize: '0.75rem'
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: 1, 
                      backgroundColor: entry.fill || getStageColor(index, data.length)
                    }} />
                    <Typography variant="caption" sx={{ 
                      color: '#6b7280',
                      fontSize: '0.75rem'
                    }}>
                      {entry.name || entry[xAxisKey]}: {entry.value}
                    </Typography>
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
