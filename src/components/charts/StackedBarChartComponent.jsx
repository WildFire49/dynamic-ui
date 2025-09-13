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
  YAxis
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

const StackedBarChartComponent = ({ 
  data, 
  title, 
  subtitle,
  stageNames = [],
  height = 400,
  xAxisKey = 'region',
  yAxisLabel = 'Pending Cases',
  showLegend = true
}) => {
  if (!data || data.length === 0 || !stageNames || stageNames.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No data available for stacked bar chart
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
            fontSize: '1.25rem',
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

        {/* Stacked Bar Chart */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ width: '100%', height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={xAxisKey} 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 9 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `Region: ${label}`}
                />
                {showLegend && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                )}
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
      </CardContent>
    </Card>
  );
};

export default StackedBarChartComponent;
