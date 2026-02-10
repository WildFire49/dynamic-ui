import React from 'react';
import { Box, alpha } from '@mui/material';
import { URGENCY_CONFIG } from './constants';

const CardBackground = ({ theme, cardType, urgency }) => {
  const urgencyColor = (urgency === 'critical' || urgency === 'high') ? (URGENCY_CONFIG[urgency]?.color || theme.primary) : theme.primary;
  return (
    <>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: cardType === 'alert' && (urgency === 'critical' || urgency === 'high')
          ? `radial-gradient(circle at 90% 10%, ${alpha(urgencyColor, 0.06)} 0%, transparent 50%)`
          : theme.bgPattern,
        pointerEvents: 'none', zIndex: 0,
      }} />
      {cardType === 'alert' && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: `linear-gradient(180deg, ${urgencyColor}, ${alpha(urgencyColor, 0.6)})`, zIndex: 0 }} />
      )}
      {(cardType === 'metric' || cardType === 'info') && (
        <Box sx={{
          position: 'absolute', top: -30, right: -30, width: 120, height: 120,
          borderRadius: '50%', border: `2px solid ${alpha(theme.primary, 0.06)}`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}
      {cardType === 'progress_tracker' && (
        <Box sx={{
          position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
          borderRadius: '50%', border: `3px solid ${alpha(theme.primary, 0.05)}`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}
      {cardType === 'trend_sparkline' && (
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
          background: `linear-gradient(0deg, ${alpha(theme.primary, 0.03)} 0%, transparent 100%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}
    </>
  );
};

export default CardBackground;
