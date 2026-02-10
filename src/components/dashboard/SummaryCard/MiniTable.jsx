import React from 'react';
import { Box, Typography, Tooltip, alpha } from '@mui/material';
import { smartFormat, getSafeDisplayValue } from './utils';

const MiniTable = ({ card, theme }) => {
  const columns = card.columns || card.mini_columns;
  const rows = card.rows || card.mini_rows;
  if (!Array.isArray(columns) || !Array.isArray(rows) || rows.length === 0) return null;

  const resolveRowKey = (col, cIdx, sampleRow) => {
    const key = col.key || col;
    if (key in sampleRow) return key;
    const rowKeys = Object.keys(sampleRow).filter(k => k !== 'highlight' && k !== 'id');
    if (cIdx < rowKeys.length) return rowKeys[cIdx];
    return key;
  };

  const sampleRow = rows[0] || {};
  const resolvedKeys = columns.map((col, cIdx) => resolveRowKey(col, cIdx, sampleRow));

  const gridCols = columns.length <= 2
    ? '1.5fr 1fr'
    : `1.5fr ${columns.slice(1).map(() => '1fr').join(' ')}`;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 0.5, overflow: 'hidden' }}>
      <Box sx={{
        display: 'grid', gridTemplateColumns: gridCols, gap: 1.5,
        pb: 1.25, mb: 1, borderBottom: `2px solid ${alpha(theme.primary, 0.12)}`,
      }}>
        {columns.map((col, i) => (
          <Typography key={i} sx={{
            fontSize: '0.65rem', fontWeight: 800, color: theme.primary,
            textTransform: 'uppercase', letterSpacing: '0.03em',
            textAlign: i === 0 ? 'left' : 'right', lineHeight: 1.3,
          }}>
            {col.label || col}
          </Typography>
        ))}
      </Box>
      {rows.slice(0, 5).map((row, rIdx) => (
        <Box key={rIdx} sx={{
          display: 'grid', gridTemplateColumns: gridCols, gap: 1.5,
          py: 0.85, px: 0.5, borderRadius: 2,
          bgcolor: row.highlight ? alpha(theme.primary, 0.04) : 'transparent',
          '&:hover': { bgcolor: alpha(theme.primary, 0.04) },
          borderBottom: rIdx < rows.slice(0, 5).length - 1 ? `1px solid ${alpha(theme.primary, 0.05)}` : 'none',
        }}>
          {columns.map((col, cIdx) => {
            const key = resolvedKeys[cIdx];
            const cellValue = row[key];
            const unit = col.unit || card.metric_unit;
            const displayValue = cellValue === null || cellValue === undefined
              ? '—'
              : typeof cellValue === 'number'
                ? getSafeDisplayValue(cellValue, null, unit)
                : cellValue;
            return (
              <Tooltip key={cIdx} title={String(displayValue)} arrow placement="top" enterDelay={500}>
                <Typography sx={{
                  fontSize: '0.82rem', fontWeight: cIdx === 0 ? 700 : 600,
                  color: cIdx === 0 ? '#0F172A' : '#475569',
                  textAlign: cIdx === 0 ? 'left' : 'right',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {displayValue}
                </Typography>
              </Tooltip>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default MiniTable;
