import React, { useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Button,
  alpha,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import useDashboardStore from '../store/dashboardStore';

// Icon mapping
const ICON_MAP = {
  Dashboard: DashboardIcon,
  SupervisorAccount: SupervisorAccountIcon,
  Person: PersonIcon,
};

const SaveToDashboardPopover = ({ 
  anchorEl, 
  open, 
  onClose, 
  onSave,
  visualizationData,
}) => {
  const { 
    dashboards, 
    addDashboard,
    addVisualization,
    getVisualizationCount,
  } = useDashboardStore();

  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [savedTo, setSavedTo] = useState(null);

  const handleSaveToDashboard = (dashboardId) => {
    if (visualizationData) {
      addVisualization(dashboardId, {
        ...visualizationData,
        id: visualizationData.id || Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
      setSavedTo(dashboardId);
      
      // Call parent onSave callback
      if (onSave) {
        onSave(dashboardId);
      }

      // Close after brief delay to show confirmation
      setTimeout(() => {
        setSavedTo(null);
        onClose();
      }, 800);
    }
  };

  const handleCreateAndSave = () => {
    if (newDashboardName.trim()) {
      const id = newDashboardName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      addDashboard({
        id,
        name: newDashboardName.trim(),
        icon: 'Dashboard',
        color: '#1976d2',
      });
      
      // Save to the new dashboard
      handleSaveToDashboard(id);
      setNewDashboardName('');
      setShowCreateNew(false);
    }
  };

  const handleClose = () => {
    setShowCreateNew(false);
    setNewDashboardName('');
    setSavedTo(null);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: 280,
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid #E5E7EB',
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2937' }}>
          Save to Dashboard
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mt: 0.25 }}>
          Choose where to save this visualization
        </Typography>
      </Box>

      <Divider />

      <List sx={{ py: 1 }}>
        {dashboards.map((dashboard) => {
          const IconComponent = ICON_MAP[dashboard.icon] || DashboardIcon;
          const count = getVisualizationCount(dashboard.id);
          const isSaved = savedTo === dashboard.id;

          return (
            <ListItemButton
              key={dashboard.id}
              onClick={() => handleSaveToDashboard(dashboard.id)}
              disabled={isSaved}
              sx={{
                py: 1,
                px: 2,
                '&:hover': {
                  bgcolor: alpha(dashboard.color, 0.08),
                },
                ...(isSaved && {
                  bgcolor: alpha('#10B981', 0.1),
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isSaved ? (
                  <CheckIcon sx={{ color: '#10B981', fontSize: 20 }} />
                ) : (
                  <IconComponent sx={{ color: dashboard.color, fontSize: 20 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={dashboard.name}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isSaved ? 600 : 500,
                  color: isSaved ? '#10B981' : '#1F2937',
                }}
              />
              <Chip
                label={count}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: alpha(dashboard.color, 0.1),
                  color: dashboard.color,
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Create New Dashboard Section */}
      <Box sx={{ p: 1.5 }}>
        {showCreateNew ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              autoFocus
              size="small"
              fullWidth
              placeholder="Dashboard name..."
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateAndSave()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  setShowCreateNew(false);
                  setNewDashboardName('');
                }}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleCreateAndSave}
                disabled={!newDashboardName.trim()}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                Create & Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setShowCreateNew(true)}
            sx={{
              textTransform: 'none',
              color: '#6B7280',
              justifyContent: 'flex-start',
              px: 1.5,
              '&:hover': {
                bgcolor: alpha('#1976d2', 0.08),
                color: '#1976d2',
              },
            }}
          >
            Create new dashboard
          </Button>
        )}
      </Box>
    </Popover>
  );
};

export default SaveToDashboardPopover;
