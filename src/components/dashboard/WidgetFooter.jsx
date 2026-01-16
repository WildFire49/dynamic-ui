import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { WIDGET_STYLES } from './dashboardStyles';

const WidgetFooter = ({ recordCount, timestamp, formatLastUpdated }) => {
  return (
    <Box sx={WIDGET_STYLES.footer}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ 
          width: 6, 
          height: 6, 
          borderRadius: '50%', 
          bgcolor: recordCount > 0 ? '#22C55E' : '#94A3B8',
        }} />
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
          {recordCount > 0 ? `${recordCount.toLocaleString()} records` : 'No data'}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
        <AccessTimeIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {formatLastUpdated(timestamp)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default WidgetFooter;
