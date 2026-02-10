import React from 'react';
import { Box, Typography } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { smartFormat } from './utils';

const AlertCardContent = ({ data, theme }) => {
  const nameCountMap = {};
  data.forEach(e => { nameCountMap[e.name] = (nameCountMap[e.name] || 0) + 1; });
  const hasRepeatingFields = Object.values(nameCountMap).some(c => c > 1);

  if (hasRepeatingFields) {
    const nameFields = Object.entries(nameCountMap).filter(([, c]) => c > 1).map(([n]) => n);
    const identifierField = nameFields.find(f => f.toLowerCase().includes('name') || f.toLowerCase().includes('branch') || f.toLowerCase().includes('region')) || nameFields[0];

    const groupedEntries = [];
    let currentEntity = null;
    data.forEach(entry => {
      if (entry.name === identifierField) {
        if (currentEntity) groupedEntries.push(currentEntity);
        currentEntity = { name: entry.value || entry.formatted, metrics: [] };
      } else if (currentEntity) {
        currentEntity.metrics.push(entry);
      }
    });
    if (currentEntity) groupedEntries.push(currentEntity);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1, justifyContent: 'center', py: 0.5 }}>
        {groupedEntries.slice(0, 5).map((entity, idx) => {
          const metricValue = entity.metrics[0]
            ? (entity.metrics[0].formatted || (typeof entity.metrics[0].value === 'number' ? smartFormat(entity.metrics[0].value) : String(entity.metrics[0].value)))
            : '0';
          return (
            <Box key={idx} sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              py: 1.25, px: 1.5, borderRadius: 2.5,
              bgcolor: '#FEF2F2', border: '1px solid #FECACA',
              '&:hover': { bgcolor: '#FEE2E2' },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                <WarningIcon sx={{ fontSize: 18, color: '#EF4444', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.88rem', color: '#991B1B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entity.name}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 700, flexShrink: 0, ml: 1 }}>
                {metricValue}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center', py: 0.5 }}>
      {data.slice(0, 5).map((entry, idx) => {
        const displayValue = entry.formatted || (typeof entry.value === 'number' ? smartFormat(entry.value) : '');
        let displayName = entry.name || entry.label;
        if (typeof entry.value === 'string' && (!displayName || displayName === 'FO Name' || displayName === 'Label')) {
          displayName = entry.value;
        }
        return (
          <Box key={idx} sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            py: 1, px: 1.5, borderRadius: 2.5,
            bgcolor: '#FEF2F2', border: '1px solid #FECACA',
            '&:hover': { bgcolor: '#FEE2E2' },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ fontSize: 18, color: '#EF4444' }} />
              <Typography sx={{ fontSize: '0.88rem', color: '#991B1B', fontWeight: 600 }}>{displayName}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.88rem', color: '#EF4444', fontWeight: 700 }}>{displayValue}</Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default AlertCardContent;
