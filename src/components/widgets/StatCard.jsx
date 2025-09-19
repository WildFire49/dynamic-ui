import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  Grow,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

// Stunning animations for CEO-level presentation
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const countUp = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;


const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  index = 0,
  animated = true 
}) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 200);
    return () => clearTimeout(timer);
  }, [index]);

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    
    const trendValue = parseFloat(trend.replace(/[^\d.-]/g, ''));
    if (trendValue > 0) return TrendingUpIcon;
    if (trendValue < 0) return TrendingDownIcon;
    return TrendingFlatIcon;
  };

  const getTrendColor = (trend) => {
    if (!trend) return theme.palette.text.secondary;
    
    const trendValue = parseFloat(trend.replace(/[^\d.-]/g, ''));
    if (trendValue > 0) return theme.palette.success.main;
    if (trendValue < 0) return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  const TrendIcon = getTrendIcon(trend);
  const trendColor = getTrendColor(trend);

  return (
    <Grow in={mounted} timeout={800} style={{ transformOrigin: 'center bottom' }}>
      <Tooltip 
        title={subtitle || `${title}: ${value}`} 
        arrow
        placement="top"
      >
        <Card
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            height: 180,
            width: '100%',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)} 0%, 
              ${alpha(color || theme.palette.primary.main, 0.05)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: animated ? `${float} 4s ease-in-out infinite` : 'none',
            animationDelay: `${index * 0.5}s`,
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(color || theme.palette.primary.main, 0.3)}`,
              border: `1px solid ${alpha(color || theme.palette.primary.main, 0.4)}`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: hovered ? '-100%' : '-200%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha(color || theme.palette.primary.main, 0.1)}, transparent)`,
              transition: 'left 0.6s ease',
              animation: hovered ? `${shimmer} 1.5s ease-in-out` : 'none'
            }
          }}
        >
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            p: 2.5, // Slightly reduced padding
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden' // Ensure content doesn't overflow
          }}>
            {/* Header with Icon */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              mb: 2
            }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${color || theme.palette.primary.main}, ${alpha(color || theme.palette.primary.main, 0.8)})`,
                boxShadow: `0 8px 16px ${alpha(color || theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                transform: hovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)'
              }}>
                {Icon && (
                  <Icon sx={{ 
                    fontSize: 24, 
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }} />
                )}
              </Box>

              {/* Trend Indicator */}
              {trend && TrendIcon && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  background: alpha(trendColor, 0.1),
                  border: `1px solid ${alpha(trendColor, 0.3)}`
                }}>
                  <TrendIcon sx={{ 
                    fontSize: 16, 
                    color: trendColor
                  }} />
                  <Typography variant="caption" sx={{
                    fontWeight: 600,
                    color: trendColor,
                    fontSize: '0.75rem'
                  }}>
                    {trend}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Main Value */}
            <Box sx={{ 
              mb: 'auto', 
              overflow: 'hidden',
              minHeight: '60px', // Fixed height for value area
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography 
                variant="h3" 
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${color || theme.palette.primary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: mounted ? `${countUp} 0.8s ease-out` : 'none',
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: 'both',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  fontSize: { xs: '1.2rem', sm: '1.6rem', md: '2rem' }, // Smaller responsive font size
                  wordBreak: 'break-word', // Allow breaking long numbers
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2, // Allow up to 2 lines
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {value}
              </Typography>

              <Typography 
                variant="body2" 
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: { xs: '0.65rem', sm: '0.7rem' }, // Smaller responsive font
                  opacity: 0.8,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', // Prevent title wrapping
                  maxWidth: '100%'
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* Subtitle */}
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  mt: 1,
                  opacity: 0.7,
                  fontSize: '0.7rem'
                }}
              >
                {subtitle}
              </Typography>
            )}

            {/* Decorative Elements */}
            <Box sx={{
              position: 'absolute',
              bottom: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              opacity: hovered ? 1 : 0.5,
              transition: 'all 0.3s ease',
              transform: hovered ? 'scale(1.2)' : 'scale(1)'
            }} />

            <Box sx={{
              position: 'absolute',
              top: -10,
              left: -10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color || theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
              opacity: hovered ? 0.8 : 0.3,
              transition: 'all 0.4s ease',
              transform: hovered ? 'scale(1.5)' : 'scale(1)'
            }} />
          </CardContent>
        </Card>
      </Tooltip>
    </Grow>
  );
};

export default StatCard;
