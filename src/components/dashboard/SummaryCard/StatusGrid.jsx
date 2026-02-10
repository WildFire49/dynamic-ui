import React from 'react';
import { Box, Typography } from '@mui/material';
import { STATUS_COLORS } from './constants';
import { smartFormat } from './utils';

const StatusGrid = ({ card, theme }) => {
  const { statuses } = card;
  if (!Array.isArray(statuses) || statuses.length === 0) return null;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, flex: 1, alignContent: 'center', py: 1 }}>
      {statuses.slice(0, 4).map((item, idx) => {
        const sc = STATUS_COLORS[item.status] || STATUS_COLORS.neutral;
        return (
          <Box key={idx} sx={{
            p: 1.5, borderRadius: 3, bgcolor: sc.bg,
            border: `1px solid ${sc.border}`, textAlign: 'center',
          }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: sc.color, lineHeight: 1, mb: 0.5 }}>
              {item.formatted || smartFormat(item.value)}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.03em', opacity: 0.8 }}>
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default StatusGrid;
