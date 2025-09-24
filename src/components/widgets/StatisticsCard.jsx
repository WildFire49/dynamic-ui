import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
  Tooltip,
  Collapse,
  Fade
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StatisticsCard = ({ 
  category, 
  stats, 
  title, 
  icon, 
  color, 
  totalValue, 
  isPrimary = false 
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpansion = () => {
    console.log(`🎯 [${title.toUpperCase()}] Independent expansion: ${!isExpanded}`);
    setIsExpanded(prev => !prev);
  };

  // Don't render if no stats
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={isPrimary ? 4 : 2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.08)} 100%)`,
        border: `2px solid ${color}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: 'fit-content',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(color, 0.2)}`
        }
      }}
    >
      {/* Header */}
      <Box 
        onClick={handleExpansion}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.12)} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.16)} 100%)`
          },
          transition: 'all 0.2s ease',
          minHeight: '80px'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 32px ${alpha(color, 0.3)}`
          }}>
            {React.cloneElement(icon, { 
              sx: { color: 'white', fontSize: 24 } 
            })}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              lineHeight: 1.2
            }}>
              {title}
            </Typography>
          </Box>
        </Box>
        
        <IconButton
          sx={{
            color: color,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Expandable Content - Smooth Animation */}
      <Collapse 
        in={isExpanded} 
        timeout={{
          enter: 500,
          exit: 400
        }}
        easing={{
          enter: 'cubic-bezier(0.4, 0, 0.3, 1)',
          exit: 'cubic-bezier(0.4, 0, 0.6, 1)'
        }}
      >
        <Box sx={{ 
          p: 3,
          background: `linear-gradient(135deg, ${alpha(color, 0.04)} 0%, ${alpha(color, 0.08)} 100%)`,
          borderTop: `1px solid ${alpha(color, 0.2)}`
        }}>
          <Typography variant="h6" sx={{
            color: color,
            fontWeight: 700,
            mb: 2.5,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Detailed Breakdown
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {stats.map((stat, statIndex) => {
              const isLongText = stat.title.length > 20;
              const truncatedTitle = isLongText ? `${stat.title.substring(0, 20)}...` : stat.title;
              
              return (
                <Fade 
                  in={isExpanded} 
                  timeout={{
                    enter: 800 + (statIndex * 100),
                    exit: 200
                  }}
                  key={statIndex}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                      border: `2px solid ${color}`,
                      boxShadow: `0 2px 8px ${alpha(color, 0.1)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transform: 'translateY(0)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 16px ${alpha(color, 0.2)}`
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`
                      }
                    }}
                >
                  <Tooltip title={isLongText ? stat.title : ''} arrow placement="top">
                    <Typography variant="body1" sx={{
                      color: theme.palette.text.primary,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      flex: 1,
                      cursor: isLongText ? 'help' : 'default'
                    }}>
                      {truncatedTitle}
                    </Typography>
                  </Tooltip>
                  <Typography variant="h5" sx={{
                    fontWeight: 800,
                    color: color,
                    fontSize: '1.5rem',
                    lineHeight: 1,
                    minWidth: 'fit-content',
                    ml: 2
                  }}>
                    {stat.value}
                  </Typography>
                  </Box>
                </Fade>
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default StatisticsCard;
