import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { smartFormat, getSemanticColor } from './utils';

const CXOSingleMetric = ({ data, theme, title, icon: Icon }) => {
  const displayValue = data.formatted || smartFormat(data.value);
  const displayLabel = data.name || data.label || '';

  const semanticTheme = getSemanticColor(data.value, title, displayLabel);
  const effectiveTheme = semanticTheme || theme;

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', width: '100%', p: { xs: 2, sm: 3 },
        background: `linear-gradient(145deg, ${alpha(effectiveTheme.primary, 0.04)} 0%, ${alpha(effectiveTheme.primary, 0.10)} 100%)`,
        borderRadius: 4, border: `1px solid ${alpha(effectiveTheme.primary, 0.12)}`,
        minHeight: { xs: 180, sm: 200, md: 240 }, position: 'relative', overflow: 'hidden',
      }}
    >
      <Box sx={{
        position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(effectiveTheme.primary, 0.08)} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <Box sx={{
        mb: 2, p: 2, borderRadius: 3, background: effectiveTheme.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
      }}>
        <Icon sx={{ fontSize: 32, color: '#FFFFFF' }} />
      </Box>
      <Typography sx={{
        fontSize: { xs: '2.75rem', md: '4rem' }, fontWeight: 900,
        color: effectiveTheme.primary, lineHeight: 1, mb: 2,
        textAlign: 'center', zIndex: 1, letterSpacing: '-0.04em',
      }}>
        {displayValue}
      </Typography>
      {displayLabel && (
        <Box sx={{
          zIndex: 1, px: 2.5, py: 0.75, borderRadius: 3, bgcolor: '#FFFFFF',
          border: `1.5px solid ${alpha(effectiveTheme.primary, 0.2)}`,
        }}>
          <Typography sx={{
            fontWeight: 700, fontSize: '0.85rem', color: effectiveTheme.primary,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {displayLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CXOSingleMetric;
