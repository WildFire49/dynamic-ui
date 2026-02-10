import React from 'react';
import { Box, Typography, Tooltip, alpha } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { smartFormat } from './utils';

const ChangeIndicator = ({ card, theme }) => {
  const {
    current_value, formatted_current, current_label,
    previous_value, formatted_previous, previous_label,
    change_percent, change_direction,
    primary_value, formatted_primary_value, primary_label,
    formatted_secondary_value, secondary_label,
    comparison_data,
  } = card;

  const shortenLabel = (label) => {
    if (!label || label.length <= 12) return label;
    const upper = label.toUpperCase();
    if (upper.includes('LMTD')) return 'LMTD';
    if (upper.includes('PREVIOUS')) return 'Previous';
    if (upper.includes('MTD')) return 'MTD';
    if (upper.includes('CURRENT')) return 'Current';
    if (upper.includes('YTD')) return 'YTD';
    const words = label.split(/\s+/);
    return words.length > 2 ? words.slice(0, 2).join(' ') : label;
  };

  const comp = Array.isArray(comparison_data) && comparison_data.length > 0 ? comparison_data[0] : null;
  const curVal = formatted_current || formatted_primary_value || (comp ? smartFormat(comp.mtd_lakhs) : null) || smartFormat(current_value || primary_value);
  const prevVal = formatted_previous || formatted_secondary_value || (comp ? smartFormat(comp.lmtd_lakhs) : null) || smartFormat(previous_value);
  const curLabelRaw = current_label || primary_label || (comp?.name ? 'MTD' : 'Current');
  const prevLabelRaw = previous_label || secondary_label || 'LMTD';
  const curLabel = shortenLabel(curLabelRaw);
  const prevLabel = shortenLabel(prevLabelRaw);
  const pct = change_percent ?? comp?.change_pct ?? null;
  const dir = change_direction || (pct !== null ? (pct >= 0 ? 'up' : 'down') : null);
  const isUp = dir === 'up';

  const curNum = typeof (current_value || primary_value) === 'number' ? (current_value || primary_value) : (comp?.mtd_lakhs || 0);
  const prevNum = typeof previous_value === 'number' ? previous_value : (comp?.lmtd_lakhs || 0);
  const maxNum = Math.max(curNum, prevNum, 1);
  const curPct = (curNum / maxNum) * 100;
  const prevPct = (prevNum / maxNum) * 100;

  // Winner gets green, loser gets rose
  const curWins = curNum >= prevNum;
  const winColor = '#059669';
  const winGradient = 'linear-gradient(135deg, #059669 0%, #34D399 100%)';
  const winBg = '#ECFDF5';
  const winBorder = '#A7F3D0';
  const loseColor = '#DC2626';
  const loseGradient = 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)';
  const loseBg = '#FEF2F2';
  const loseBorder = '#FECACA';

  const leftColor = curWins ? winColor : loseColor;
  const leftGradient = curWins ? winGradient : loseGradient;
  const leftBg = curWins ? winBg : loseBg;
  const leftBorder = curWins ? winBorder : loseBorder;

  const rightColor = curWins ? loseColor : winColor;
  const rightGradient = curWins ? loseGradient : winGradient;
  const rightBg = curWins ? loseBg : winBg;
  const rightBorder = curWins ? loseBorder : winBorder;

  const trendColor = isUp ? '#059669' : '#DC2626';

  // Build a side component
  const renderSide = (label, labelRaw, value, numPct, color, gradient, bg, border, isWinner) => (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      p: { xs: 1.5, sm: 2 }, position: 'relative', overflow: 'hidden',
      bgcolor: alpha(color, 0.02),
    }}>
      {/* Winner crown */}
      {isWinner && (
        <Box sx={{
          position: 'absolute', top: 6, right: 6,
          width: 24, height: 24, borderRadius: '50%',
          bgcolor: alpha(winColor, 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrophyIcon sx={{ fontSize: 14, color: winColor }} />
        </Box>
      )}

      {/* Label badge */}
      <Tooltip title={labelRaw} arrow placement="top" enterDelay={300}>
        <Box sx={{
          px: 1.5, py: 0.4, borderRadius: 2, mb: 1.5,
          bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.15)}`,
        }}>
          <Typography sx={{
            fontSize: '0.62rem', fontWeight: 800, color,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </Typography>
        </Box>
      </Tooltip>

      {/* Value */}
      <Typography sx={{
        fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)', fontWeight: 900,
        color, lineHeight: 1.1, letterSpacing: '-0.03em',
        whiteSpace: 'nowrap', mb: 1.5, textAlign: 'center',
      }}>
        {value}
      </Typography>

      {/* Colored bar */}
      <Box sx={{ width: '85%' }}>
        <Box sx={{ height: 8, bgcolor: alpha(color, 0.08), borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{
            width: `${numPct}%`, height: '100%',
            background: gradient, borderRadius: 4,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', flex: 1,
      borderRadius: 3, overflow: 'hidden',
      border: `1px solid ${alpha(theme.primary, 0.08)}`,
      background: '#FAFBFC',
    }}>
      {/* Side-by-side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', flex: 1 }}>
        {renderSide(curLabel, curLabelRaw, curVal, curPct, leftColor, leftGradient, leftBg, leftBorder, curWins)}

        {/* VS divider */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', width: 36,
        }}>
          <Box sx={{
            position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1,
            bgcolor: alpha('#94A3B8', 0.15), transform: 'translateX(-50%)',
          }} />
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#475569', letterSpacing: '0.02em' }}>
              VS
            </Typography>
          </Box>
        </Box>

        {renderSide(prevLabel, prevLabelRaw, prevVal || '—', prevPct, rightColor, rightGradient, rightBg, rightBorder, !curWins)}
      </Box>

      {/* Trend footer */}
      {pct !== null && (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
          py: 1, px: 1.5,
          background: isUp
            ? 'linear-gradient(90deg, #ECFDF5, #F0FDF9)'
            : 'linear-gradient(90deg, #FEF2F2, #FFF5F5)',
          borderTop: `1px solid ${isUp ? '#A7F3D0' : '#FECACA'}`,
        }}>
          {isUp
            ? <TrendingUpIcon sx={{ fontSize: 16, color: trendColor }} />
            : <TrendingDownIcon sx={{ fontSize: 16, color: trendColor }} />
          }
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: trendColor }}>
            {Math.abs(pct).toFixed(1)}%
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B' }}>
            {isUp ? 'growth' : 'decline'} vs {prevLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChangeIndicator;
