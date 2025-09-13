import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { TableChart } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Color generation function for pipeline stages
const getStageColor = (index, total) => {
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
    '#00ff00', '#ff0000', '#8dd1e1', '#d084d0',
    '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
  ];
  return colors[index % colors.length];
};

// Reusable Pipeline Bar Chart Component
export const PipelineBarChart = ({ chartData, showSaveButton = false, onSave }) => {
  if (!chartData?.barChart?.data) return null;

  const barChartData = chartData.barChart.data;
  const stageNames = chartData.barChart.stageNames || [];

  return (
    <Box sx={{ 
      flex: '1 1 100%',
      minWidth: 0,
      maxWidth: '100%',
      mb: 2
    }}>
      <Card sx={{ 
        height: '100%', 
        minHeight: 520,
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
              fontSize: '1.25rem',
              letterSpacing: '-0.025em'
            }}>
              {chartData.barChart.title}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              mt: 0.5,
              fontSize: '0.875rem'
            }}>
              Pending cases by pipeline stage
            </Typography>
          </Box>

          {/* Bar Chart */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="region" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Pending Cases', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Region: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  {stageNames.map((stageName, index) => (
                    <Bar 
                      key={stageName}
                      dataKey={stageName} 
                      stackId="pipeline"
                      fill={getStageColor(index, stageNames.length)}
                      name={stageName}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {showSaveButton && onSave && (
            <Box sx={{ 
              p: 3, 
              pt: 2,
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Button
                variant="contained"
                size="medium"
                startIcon={<TableChart />}
                onClick={onSave}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: '#1976d2',
                  px: 4,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Save to Dashboard
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// Reusable Pipeline Waterfall Chart Component
export const PipelineWaterfallChart = ({ chartData }) => {
  if (!chartData?.waterfallChart?.data) return null;

  return (
    <Box sx={{ 
      flex: '1 1 100%',
      minWidth: 0,
      maxWidth: '100%',
      mb: 2
    }}>
      <Card sx={{ 
        height: '100%', 
        minHeight: 520,
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
              fontSize: '1.25rem',
              letterSpacing: '-0.025em'
            }}>
              {chartData.waterfallChart.title}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              mt: 0.5,
              fontSize: '0.875rem'
            }}>
              Total Pipeline: {chartData.waterfallChart.totalPipeline} cases across {chartData.waterfallChart.data.length} stages
            </Typography>
          </Box>

          {/* Waterfall Chart */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.waterfallChart.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb"
                    strokeWidth={0.5}
                  />
                  <XAxis 
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fontSize: 11, 
                      fill: '#6b7280',
                      fontWeight: 500
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                      value: 'Cases', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px' }
                    }}
                  />
                  <ChartTooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [
                      `${value} cases`, 
                      name
                    ]}
                    labelFormatter={(label) => `Stage: ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  >
                    {chartData.waterfallChart.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Stage Summary Cards */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2,
              mt: 3,
              pt: 3,
              borderTop: '1px solid #f3f4f6'
            }}>
              {chartData.waterfallChart.data.map((stage, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  borderLeft: `4px solid ${stage.fill}`,
                  minWidth: 160
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {stage.name}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#111827'
                    }}>
                      {stage.value}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      cases pending
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Combined Pipeline Charts Component
export const PipelineCharts = ({ chartData, showSaveButton = false, onSave }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Stacked Bar Chart */}
      <PipelineBarChart 
        chartData={chartData} 
        showSaveButton={showSaveButton} 
        onSave={onSave} 
      />
      
      {/* Waterfall Summary */}
      <PipelineWaterfallChart chartData={chartData} />
    </Box>
  );
};

export default PipelineCharts;
