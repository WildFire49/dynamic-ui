import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const PieChartComponent = ({ 
  data, 
  title, 
  subtitle,
  showLegend = true,
  height = 400,
  innerRadius = "40%",
  outerRadius = "80%"
}) => {
  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No data available for pie chart
      </Typography>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: height + 120,
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

        {/* Pie Chart */}
        <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ width: '100%', height: height, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
                {showLegend && (
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '12px'
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Custom Legend */}
          {showLegend && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 1,
              px: 2
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
                    borderRadius: '50%', 
                    backgroundColor: entry.fill 
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280',
                    fontSize: '0.75rem'
                  }}>
                    {entry.name}: {entry.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChartComponent;
