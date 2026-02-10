import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Box, Typography } from '@mui/material';
import { CARD_THEMES } from './constants';
import { smartFormat } from './utils';

const DistributionDonut = ({ card, theme }) => {
  const { segments } = card;
  if (!Array.isArray(segments) || segments.length === 0) return null;

  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  const chartData = segments.map((seg, i) => ({
    ...seg,
    fill: CARD_THEMES[i % CARD_THEMES.length].primary,
  }));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
      <Box sx={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={2} strokeWidth={0}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <Box sx={{ bgcolor: 'rgba(15,23,42,0.95)', p: 1, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{d.name}: {d.formatted || smartFormat(d.value)}</Typography>
                  </Box>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A' }}>{smartFormat(total)}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {chartData.map((seg, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seg.fill, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{seg.name}</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: seg.fill, fontWeight: 800, ml: 'auto' }}>{seg.formatted || smartFormat(seg.value)}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DistributionDonut;
