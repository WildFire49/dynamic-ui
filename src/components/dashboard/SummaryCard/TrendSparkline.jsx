import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Box, Typography, alpha } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { smartFormat } from './utils';

const TrendSparkline = ({ card, theme }) => {
  const { primary_value, primary_label, sparkline_data, trend } = card;
  const data = sparkline_data || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 1 }}>
      <Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
          {primary_label || 'Value'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {card.formatted_primary_value || smartFormat(primary_value)}
          </Typography>
          {trend && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.25, borderRadius: 1.5,
              bgcolor: trend === 'up' ? alpha('#10B981', 0.08) : alpha('#EF4444', 0.08),
            }}>
              {trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 14, color: '#059669' }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: '#DC2626' }} />}
              {card.trend_value && (
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: trend === 'up' ? '#059669' : '#DC2626' }}>{card.trend_value}</Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
      {data.length > 1 && (
        <Box sx={{ width: '100%', height: 60 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={`spark-${theme.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={theme.primary} strokeWidth={2} fill={`url(#spark-${theme.name})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default TrendSparkline;
