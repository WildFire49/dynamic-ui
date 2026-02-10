import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Box, Typography } from '@mui/material';
import { smartFormat } from './utils';

const ComparisonChart = ({ data, theme }) => {
  const chartData = useMemo(() => {
    if (!data?.entity1 || !data?.entity2) return [];
    return [
      { name: data.entity1.name, value: data.entity1.value, formatted: data.entity1.formatted, fill: theme.primary },
      { name: data.entity2.name, value: data.entity2.value, formatted: data.entity2.formatted, fill: theme.secondary },
    ];
  }, [data, theme]);

  if (chartData.length === 0) return null;
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <Box sx={{ width: '100%', flex: 1, minHeight: 120, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap="30%">
          <XAxis type="number" hide domain={[0, maxValue * 1.1]} />
          <YAxis type="category" dataKey="name" hide />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <Box sx={{ bgcolor: 'rgba(15,23,42,0.95)', p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', mb: 0.5, textTransform: 'uppercase' }}>{d.name}</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{d.formatted || smartFormat(d.value)}</Typography>
                </Box>
              );
            }}
            cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }}
          />
          <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={36}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ComparisonChart;
