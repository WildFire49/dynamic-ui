import React from 'react';
import { Box, Typography } from '@mui/material';
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

// Modern color palette
const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  bars: ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#F97316']
};

const getBarColor = (index) => COLORS.bars[index % COLORS.bars.length];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 2,
        p: 1.5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minWidth: 120,
      }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
          {payload[0].value?.toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const BarChartComponent = ({ 
  data, 
  title, 
  subtitle,
  height = 280,
  isStacked = false,
  stageNames = [],
  dataType = 'default',
  xAxisKey = 'name',
  yAxisLabel = 'Value',
}) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 200,
        color: '#94A3B8'
      }}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  // Calculate bar size based on data length
  const barSize = data.length <= 4 ? 40 : data.length <= 8 ? 30 : 20;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Compact Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography sx={{ 
          fontWeight: 600,
          color: '#0F172A',
          fontSize: '0.95rem',
          lineHeight: 1.3
        }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ 
            color: '#64748B',
            fontSize: '0.75rem',
            mt: 0.25
          }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: height, px: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#F1F5F9"
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 11, 
                fill: '#64748B',
                fontWeight: 500
              }}
              dy={8}
              interval={0}
              angle={data.length > 6 ? -45 : 0}
              textAnchor={data.length > 6 ? "end" : "middle"}
              height={data.length > 6 ? 60 : 30}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 11, 
                fill: '#94A3B8'
              }}
              width={45}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
            
            {isStacked && stageNames.length > 0 ? (
              stageNames.map((stageName, index) => (
                <Bar 
                  key={stageName}
                  dataKey={stageName}
                  stackId="stack"
                  fill={getBarColor(index)}
                  radius={index === stageNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))
            ) : (
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                barSize={barSize}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill || getBarColor(index)} 
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default BarChartComponent;
