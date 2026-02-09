
import React, { useState } from 'react';
import { Box, Typography, Collapse, Tooltip, IconButton, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { KeyboardArrowDown, KeyboardArrowRight, Circle, Close } from '@mui/icons-material';
import { AGENT_HIERARCHY } from '../agentData';
import { THEME_DARK, THEME_LIGHT } from '../config/theme';

/* ─── Styled Components ─── */

const AgentItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'customcolors'
})(({ theme, color, customcolors }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.25, 1.5),
  borderRadius: '10px',
  background: customcolors.bgCard,
  border: `1px solid ${customcolors.borderSubtle}`,
  marginBottom: theme.spacing(0.75),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: alpha(color, 0.4),
    background: alpha(color, 0.06),
    transform: 'translateX(3px)',
    '& .icon-glow': {
      boxShadow: `0 0 12px ${alpha(color, 0.3)}`,
    },
  },
}));

const IconBox = styled(Box)(({ color }) => ({
  width: 32,
  height: 32,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
  background: alpha(color, 0.1),
  flexShrink: 0,
  transition: 'all 0.2s ease',
  '& svg, & img': {
    width: 18,
    height: 18,
  },
}));

const CompactAgentCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'customcolors'
})(({ theme, color, customcolors }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.25),
  borderRadius: '10px',
  background: customcolors.bgCard,
  border: `1px solid ${customcolors.borderSubtle}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  textAlign: 'center',
  '&:hover': {
    borderColor: alpha(color, 0.4),
    background: alpha(color, 0.06),
    transform: 'translateY(-2px)',
    '& .icon-glow': {
      boxShadow: `0 0 12px ${alpha(color, 0.3)}`,
    },
  },
}));

/* ─── Group Section ─── */

const GroupSection = ({ groupKey, groupData, themeColors }) => {
  const [expanded, setExpanded] = useState(true);

  const getGroupColor = (key) => {
    switch (key) {
      case 'supervisor': return themeColors.accent;       // Red accent for supervisor
      case 'learning': return themeColors.violet;
      case 'nexus_brain': return themeColors.primary;     // Blue for brain
      case 'nexus_interface': return themeColors.secondary; // Secondary blue for interface
      case 'nexus_infra': return themeColors.mint;
      default: return themeColors.primary;
    }
  };

  const color = getGroupColor(groupKey);
  const isGrid = groupKey.startsWith('nexus_');

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          py: 0.75,
          px: 0.5,
          borderRadius: '8px',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: alpha(color, 0.06),
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{
            fontWeight: 600,
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.8rem',
            color: themeColors.textMain,
          }}>
            {groupData.title}
          </Typography>
          <Chip
            label={groupData.count}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: alpha(color, 0.12),
              color: color,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
        {expanded
          ? <KeyboardArrowDown fontSize="small" sx={{ color: themeColors.textDim, fontSize: 18 }} />
          : <KeyboardArrowRight fontSize="small" sx={{ color: themeColors.textDim, fontSize: 18 }} />
        }
      </Box>

      <Collapse in={expanded}>
        <Box sx={
          isGrid
            ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75, pt: 0.75 }
            : { pt: 0.75, display: 'flex', flexDirection: 'column' }
        }>
          {groupData.agents.map((agent) => {
            const IconComp = agent.icon;
            const agentColor = agent.color && agent.color.startsWith('#') ? agent.color : color;

            if (isGrid) {
              return (
                <Tooltip key={agent.id} title={agent.description} placement="top" arrow>
                  <CompactAgentCard color={agentColor} customcolors={themeColors}>
                    <IconBox className="icon-glow" color={agentColor} sx={{ mb: 0.75, width: 28, height: 28 }}>
                      {IconComp && <IconComp sx={{ fontSize: 16 }} />}
                    </IconBox>
                    <Typography variant="caption" sx={{
                      color: themeColors.textMain,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      fontSize: '0.68rem',
                    }}>
                      {agent.title}
                    </Typography>
                  </CompactAgentCard>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={agent.id} title={agent.description} placement="right" arrow>
                <AgentItem color={agentColor} customcolors={themeColors}>
                  <IconBox className="icon-glow" color={agentColor}>
                    {IconComp && <IconComp sx={{ fontSize: 18 }} />}
                  </IconBox>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{
                      color: themeColors.textMain,
                      fontWeight: 500,
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.82rem',
                    }}>
                      {agent.title}
                    </Typography>
                    {agent.subtitle && (
                      <Typography variant="caption" noWrap sx={{
                        color: themeColors.textDim,
                        fontSize: '0.65rem',
                      }}>
                        {agent.subtitle}
                      </Typography>
                    )}
                  </Box>
                  <Circle sx={{ fontSize: 5, color: alpha(agentColor, 0.5), flexShrink: 0 }} />
                </AgentItem>
              </Tooltip>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};

/* ─── Sidebar ─── */

const Sidebar = ({ mode = 'dark', onClose }) => {
  const themeColors = mode === 'light' ? THEME_LIGHT : THEME_DARK;

  return (
    <Box sx={{
      height: '100%',
      background: mode === 'dark'
        ? `linear-gradient(180deg, ${themeColors.bgDeep} 0%, ${alpha(themeColors.bgGradientEnd, 0.95)} 100%)`
        : themeColors.bgDeep,
      borderRight: `1px solid ${themeColors.borderSubtle}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Sidebar header */}
      <Box sx={{
        p: 2.5,
        pb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: `1px solid ${themeColors.borderSubtle}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/Mifix-ai.png"
            sx={{
              height: 36,
              width: 36,
              borderRadius: '10px',
              objectFit: 'cover',
              filter: themeColors.logoFilter,
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <Box>
            <Typography sx={{
              fontFamily: '"Inter", sans-serif',
              color: themeColors.textBright,
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              MiFiX Studio
            </Typography>
            <Typography variant="caption" sx={{
              color: themeColors.textDim,
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}>
              <Box component="span" sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: themeColors.accent,
                display: 'inline-block',
              }} />
              Active Network
            </Typography>
          </Box>
        </Box>

        {onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: themeColors.textDim,
              '&:hover': { color: themeColors.accent },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Agent list - scrollable */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(themeColors.primary, 0.15),
          borderRadius: '4px',
        },
      }}>
        {Object.entries(AGENT_HIERARCHY).map(([key, data]) => (
          <GroupSection key={key} groupKey={key} groupData={data} themeColors={themeColors} />
        ))}
      </Box>

      {/* Sidebar footer */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${themeColors.borderSubtle}`,
        flexShrink: 0,
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
        }}>
          <Typography variant="caption" sx={{ color: themeColors.textDim, fontSize: '0.65rem' }}>
            21 agents connected
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: themeColors.statusOnline || themeColors.mint,
              boxShadow: `0 0 6px ${alpha(themeColors.statusOnline || themeColors.mint, 0.5)}`,
            }} />
            <Typography variant="caption" sx={{
              color: themeColors.statusOnline || themeColors.mint,
              fontSize: '0.65rem',
              fontWeight: 600,
            }}>
              All systems go
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
