import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { smartFormat } from './utils';

const ProgressRing = ({ card, theme }) => {
  const { primary_value, primary_label, target_value, formatted_target_value, progress_percent } = card;
  const pct = progress_percent ?? (target_value ? Math.min(100, Math.round((parseFloat(primary_value) / parseFloat(target_value)) * 100)) : 0);
  const radius = 54;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flex: 1, py: 1 }}>
      <Box sx={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke={alpha(theme.primary, 0.1)} strokeWidth={stroke} />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={theme.primary} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: theme.primary, lineHeight: 1 }}>{pct}%</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {primary_label || 'Current'}
          </Typography>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            {card.formatted_primary_value || smartFormat(primary_value)}
          </Typography>
        </Box>
        {target_value && (
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target</Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#64748B', lineHeight: 1.1 }}>
              {formatted_target_value || smartFormat(target_value)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgressRing;
