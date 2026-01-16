import React from 'react';
import { Box, Typography, Stack, Tooltip, IconButton, ToggleButtonGroup, ToggleButton, InputBase, ClickAwayListener } from '@mui/material';
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  MoreVert as MoreVertIcon,
  FormatColorFill as FormatColorFillIcon,
  BarChart as BarChartIcon,
  AreaChart as AreaChartIcon,
  PieChartOutline as PieChartIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { WIDGET_STYLES, TITLE_STYLES, EDIT_BADGE_STYLES, ICON_BADGE_STYLES, BUTTON_STYLES, GRADIENTS } from './dashboardStyles';

const WidgetHeader = ({
  item,
  currentViewMode,
  editingTitleId,
  editingTitleValue,
  onStartEditTitle,
  onSaveTitle,
  onCancelEdit,
  onTitleChange,
  refreshingWidgets,
  formattingActive,
  onRefresh,
  onFormatToggle,
  onFullscreen,
  onMenuOpen,
  onDownload,
}) => {
  const getViewModeIcon = () => {
    switch (currentViewMode) {
      case 'table':
        return (
          <Box sx={{ ...ICON_BADGE_STYLES.default, overflow: 'hidden' }}>
            <img
              src="/cells.png"
              alt="Table"
              style={{ width: '34px', height: '34px', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        );
      case 'bar':
        return (
          <Box sx={{ ...ICON_BADGE_STYLES.default, ...ICON_BADGE_STYLES.gradient }}>
            <BarChartIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        );
      case 'area':
        return (
          <Box sx={{ ...ICON_BADGE_STYLES.default, ...ICON_BADGE_STYLES.gradient }}>
            <AreaChartIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        );
      case 'pie':
        return (
          <Box sx={{ ...ICON_BADGE_STYLES.default, ...ICON_BADGE_STYLES.gradient }}>
            <PieChartIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        );
      default:
        return (
          <Box sx={{ ...ICON_BADGE_STYLES.default, ...ICON_BADGE_STYLES.gradient }}>
            <DashboardIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        );
    }
  };

  const getTitle = () => {
    if (item.title && !item.title.startsWith('Analysis -') && item.title !== 'Unknown Query') {
      return item.title;
    }
    if (item.question && !item.question.startsWith('Analysis -') && item.question !== 'Unknown Query') {
      return item.question;
    }
    return item.title || item.question || 'Analysis Result';
  };

  return (
    <Box sx={{
      ...WIDGET_STYLES.header,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(181, 200, 222, 0.3) 50%, transparent 100%)',
        animation: 'shimmer 3s infinite',
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    }}>
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
        {/* Icon Badge */}
        {getViewModeIcon()}

        {/* Title Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {editingTitleId === item.id ? (
            <ClickAwayListener onClickAway={onSaveTitle}>
              <InputBase
                autoFocus
                value={editingTitleValue}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveTitle();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                sx={{
                  ...TITLE_STYLES.input,
                  border: '2px solid rgb(231, 233, 236)',
                  '& input': {
                    padding: 0,
                    color: '#1E293B',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    '&::placeholder': {
                      color: '#94A3B8',
                      opacity: 0.7,
                    }
                  }
                }}
                placeholder="Enter widget title..."
              />
            </ClickAwayListener>
          ) : (
            <Box sx={TITLE_STYLES.container}>
              <Typography
                component="span"
                variant="subtitle1"
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEditTitle(item);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.preventDefault()}
                sx={{
                  ...TITLE_STYLES.typography,
                  background: currentViewMode === 'table' 
                    ? GRADIENTS.titleBackground.table
                    : GRADIENTS.titleBackground.default,
                  border: currentViewMode === 'table' ? `1.5px solid rgba(181, 200, 222, 0.3)` : 'none',
                  boxShadow: currentViewMode === 'table' 
                    ? '0 2px 8px rgba(156, 192, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                    : 'none',
                  '&:hover': {
                    bgcolor: currentViewMode === 'table' 
                      ? 'rgba(181, 200, 222, 0.25)'
                      : 'rgba(152, 190, 235, 0.15)',
                    transform: currentViewMode === 'table' ? 'translateY(-1px)' : 'translateX(2px)',
                    boxShadow: currentViewMode === 'table' 
                      ? '0 4px 12px rgba(181, 200, 222, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                      : 'none',
                    borderColor: currentViewMode === 'table' ? 'rgba(181, 200, 222, 0.5)' : 'transparent',
                  },
                }}
                title={getTitle()}
              >
                {getTitle()}
              </Typography>
              
              {/* Edit Icon Badge */}
              <Tooltip title="Click to edit title" arrow placement="top">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditTitle(item);
                  }}
                  sx={EDIT_BADGE_STYLES}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack
        direction="row" 
        spacing={0.5} 
        alignItems="center"
        className="widget-actions"
        sx={{ opacity: { xs: 1, md: 0.9 }, transition: 'opacity 0.2s' }}
      >
        <ToggleButtonGroup
          value={null}
          exclusive
          size="small"
          sx={BUTTON_STYLES.actionGroup}
        >
          {/* Download CSV */}
          <Tooltip title="Download report" arrow placement="top">
            <ToggleButton value="download" onClick={onDownload}>
              <img
                src="/excel.png"
                alt="Download"
                style={{ width: '20px', height: '20px', objectFit: 'contain', display: 'block' }}
              />
            </ToggleButton>
          </Tooltip>

          {/* Refresh */}
          <Tooltip title="Refresh data" arrow placement="top">
            <ToggleButton
              value="refresh"
              onClick={onRefresh}
              disabled={refreshingWidgets[item.id]}
              sx={{
                '&.Mui-disabled': { color: '#ADB5BD' },
                animation: refreshingWidgets[item.id] ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </ToggleButton>
          </Tooltip>

          {/* Format Table */}
          {currentViewMode === 'table' && (
            <Tooltip title="Format table" arrow placement="top">
              <ToggleButton
                value="format"
                selected={formattingActive[item.id]}
                onClick={onFormatToggle}
              >
                <FormatColorFillIcon sx={{ fontSize: 20 }} />
              </ToggleButton>
            </Tooltip>
          )}

          {/* Fullscreen */}
          <Tooltip title="Expand view" arrow placement="top">
            <ToggleButton value="fullscreen" onClick={onFullscreen}>
              <FullscreenIcon sx={{ fontSize: 20 }} />
            </ToggleButton>
          </Tooltip>
          
          {/* More Options */}
          <Tooltip title="More options" arrow placement="top">
            <ToggleButton value="more" onClick={(e) => onMenuOpen(e, item.id)}>
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
};

export default WidgetHeader;
