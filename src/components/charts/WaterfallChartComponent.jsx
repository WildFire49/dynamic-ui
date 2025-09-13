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
  CartesianGrid,
  XAxis,
  YAxis,
  Cell
} from 'recharts';

const WaterfallChartComponent = ({ 
  data, 
  title, 
  subtitle,
  totalPipeline,
  height = 350,
  showSummaryCards = true
}) => {
  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No data available for waterfall chart
      </Typography>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: showSummaryCards ? 520 : height + 120,
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
          <Typography variant="body2" sx={{ 
            color: '#6b7280',
            mt: 0.5,
            fontSize: '0.875rem'
          }}>
            {subtitle || `Total Pipeline: ${totalPipeline} cases across ${data.length} stages`}
          </Typography>
        </Box>

        {/* Waterfall Chart */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ width: '100%', height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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
                <Tooltip 
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
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Stage Summary Cards */}
          {showSummaryCards && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2,
              mt: 3,
              pt: 3,
              borderTop: '1px solid #f3f4f6'
            }}>
              {data.map((stage, index) => (
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
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WaterfallChartComponent;
