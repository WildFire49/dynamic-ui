import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { CARD_THEMES } from './constants';
import { smartFormat } from './utils';

const CXOMultiMetric = ({ data, theme }) => {
  const isFlattenedRows = data.filter(d => d.name === 'Bank Name' || d.name === 'Region' || d.name === 'Name').length > 1;

  if (isFlattenedRows) {
    const entities = [];
    let currentEntity = null;
    data.forEach(item => {
      if (item.name === 'Bank Name' || item.name === 'Region' || item.name === 'Name' || item.name === 'Entity') {
        if (currentEntity) entities.push(currentEntity);
        currentEntity = { name: item.value, metrics: [] };
      } else if (currentEntity) {
        currentEntity.metrics.push(item);
      }
    });
    if (currentEntity) entities.push(currentEntity);

    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: entities.length <= 2 ? 3 : 2, py: 0.5, flex: 1, justifyContent: 'center' }}>
        {entities.map((entity, idx) => {
          const palette = CARD_THEMES.map(t => t.primary);
          const itemColor = palette[idx % palette.length];
          return (
            <Box key={idx} sx={{
              p: { xs: 2, sm: 2.25 }, borderRadius: 4,
              bgcolor: alpha(itemColor, 0.03), border: `1px solid ${alpha(itemColor, 0.1)}`,
              position: 'relative', overflow: 'hidden',
              '&:hover': { bgcolor: alpha(itemColor, 0.05), borderColor: alpha(itemColor, 0.2) },
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: `linear-gradient(180deg, ${itemColor}, ${alpha(itemColor, 0.4)})` }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, ml: 0.5 }}>
                <Typography sx={{
                  fontSize: '0.85rem', fontWeight: 800, color: itemColor,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  bgcolor: alpha(itemColor, 0.08), px: 1.5, py: 0.4, borderRadius: 2,
                }}>
                  {entity.name}
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: alpha(itemColor, 0.08) }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, ml: 0.5 }}>
                {entity.metrics.map((metric, mIdx) => {
                  const isPrimary = metric.name.toLowerCase().includes('mtd');
                  return (
                    <Box key={mIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {metric.name.replace('Disbursed Amount', 'Disbursed')}
                      </Typography>
                      <Typography sx={{
                        fontSize: isPrimary ? { xs: '1.2rem', md: '1.5rem' } : { xs: '1.05rem', md: '1.2rem' },
                        color: isPrimary ? '#0F172A' : '#475569', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em',
                      }}>
                        {metric.formatted}
                      </Typography>
                      <Box sx={{ height: 6, bgcolor: alpha(itemColor, 0.08), borderRadius: 3, overflow: 'hidden', mt: 0.25 }}>
                        <Box sx={{ width: mIdx === 0 ? '100%' : '70%', height: '100%', bgcolor: mIdx === 0 ? itemColor : alpha(itemColor, 0.4), borderRadius: 3 }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Standard list view
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
      {data.map((entry, idx) => {
        const allValues = data.map(e => (typeof e.value === 'number' ? e.value : parseFloat(String(e.value).replace(/[^0-9.-]/g, '')) || 0));
        const maxValue = Math.max(...allValues, 1);
        const numericValue = typeof entry.value === 'number' ? entry.value : parseFloat(String(entry.value).replace(/[^0-9.-]/g, '')) || 0;
        const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
        const itemColor = CARD_THEMES[idx % CARD_THEMES.length].primary;

        return (
          <Box key={idx} sx={{
            p: 2, borderRadius: 3, bgcolor: '#FFFFFF',
            border: `1px solid ${alpha(itemColor, 0.12)}`,
            overflow: 'hidden', position: 'relative',
            '&:hover': { borderColor: alpha(itemColor, 0.3) },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2.5, bgcolor: itemColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                }}>
                  {idx + 1}
                </Box>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  {entry.name || entry.label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: itemColor, letterSpacing: '-0.03em' }}>
                {entry.formatted || smartFormat(entry.value)}
              </Typography>
            </Box>
            <Box sx={{ height: 8, bgcolor: alpha(itemColor, 0.08), borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{
                width: `${percentage}%`, height: '100%',
                background: `linear-gradient(90deg, ${itemColor}, ${alpha(itemColor, 0.6)})`,
                borderRadius: 4,
              }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default CXOMultiMetric;
