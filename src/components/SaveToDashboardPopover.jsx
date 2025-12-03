import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Skeleton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import useDashboardStore from '../store/dashboardStore';
import dashboardService from '../services/dashboardService';

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
    addDashboard,
    addVisualization,
  } = useDashboardStore();

  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [savedTo, setSavedTo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDashboards, setIsLoadingDashboards] = useState(false);
  const [dashboardList, setDashboardList] = useState([]);

  // Fetch dashboards from API when popover opens
  useEffect(() => {
    if (open) {
      fetchDashboards();
    }
  }, [open]);

  const fetchDashboards = async () => {
    setIsLoadingDashboards(true);
    try {
      const username = localStorage.getItem('username') || localStorage.getItem('userId');
      if (username) {
        const result = await dashboardService.getUserDashboards(username);
        if (result.success && result.data?.dashboards) {
          setDashboardList(result.data.dashboards);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setIsLoadingDashboards(false);
    }
  };

  // Get widget count from the dashboard data
  const getWidgetCount = (dashboard) => {
    return dashboard.widgetCount || 0;
  };

  const handleSaveToDashboard = async (dashboardId) => {
    if (visualizationData && !isSaving) {
      setIsSaving(true);
      
      try {
        // Call the async addVisualization which now syncs to API
        const result = await addVisualization(dashboardId, {
          ...visualizationData,
          id: visualizationData.id || Date.now().toString(),
          timestamp: new Date().toISOString(),
        });
        
        setSavedTo(dashboardId);
        
        // Call parent onSave callback
        if (onSave) {
          onSave(dashboardId, result);
        }

        // Close after brief delay to show confirmation
        setTimeout(() => {
          setSavedTo(null);
          setIsSaving(false);
          onClose();
        }, 800);
      } catch (error) {
        console.error('Error saving to dashboard:', error);
        setIsSaving(false);
      }
    }
  };

  const handleCreateAndSave = async () => {
    if (newDashboardName.trim() && !isSaving) {
      setIsSaving(true);
      
      try {
        const id = newDashboardName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        
        // Create dashboard via API
        const result = await addDashboard({
          id,
          name: newDashboardName.trim(),
          icon: 'Dashboard',
          color: '#1976d2',
        });
        
        // Use the server-generated ID if available
        const dashboardId = result?.data?.id || id;
        
        // Refresh the dashboard list to include the new one
        await fetchDashboards();
        
        // Save to the new dashboard
        await handleSaveToDashboard(dashboardId);
        setNewDashboardName('');
        setShowCreateNew(false);
      } catch (error) {
        console.error('Error creating dashboard:', error);
        setIsSaving(false);
      }
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
        {isLoadingDashboards ? (
          // Loading skeleton
          <>
            {[1, 2].map((i) => (
              <Box key={i} sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={120} height={24} />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={24} height={20} />
              </Box>
            ))}
          </>
        ) : dashboardList.length === 0 ? (
          <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
              No dashboards found. Create one below.
            </Typography>
          </Box>
        ) : (
          dashboardList.map((dashboard) => {
            const IconComponent = ICON_MAP[dashboard.icon] || DashboardIcon;
            const count = getWidgetCount(dashboard);
            const isSaved = savedTo === dashboard.id;
            const dashboardColor = dashboard.color || '#1976d2';

            return (
              <ListItemButton
                key={dashboard.id}
                onClick={() => handleSaveToDashboard(dashboard.id)}
                disabled={isSaved || isSaving}
                sx={{
                  py: 1,
                  px: 2,
                  '&:hover': {
                    bgcolor: alpha(dashboardColor, 0.08),
                  },
                  ...(isSaved && {
                    bgcolor: alpha('#10B981', 0.1),
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isSaved ? (
                    <CheckIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  ) : isSaving ? (
                    <CircularProgress size={18} sx={{ color: dashboardColor }} />
                  ) : (
                    <IconComponent sx={{ color: dashboardColor, fontSize: 20 }} />
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
                    bgcolor: alpha(dashboardColor, 0.1),
                    color: dashboardColor,
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </ListItemButton>
            );
          })
        )}
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
                disabled={!newDashboardName.trim() || isSaving}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                {isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Create & Save'}
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
