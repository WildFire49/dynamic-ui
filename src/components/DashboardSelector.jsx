import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useDashboardStore from '../store/dashboardStore';

// Icon mapping - BM = Bank Manager, RM/XCO = Relationship Manager
const ICON_MAP = {
  Dashboard: DashboardIcon,
  AccountBalance: AccountBalanceIcon, // Bank Manager
  SupportAgent: SupportAgentIcon, // Relationship Manager
  Person: PersonIcon,
};

// Custom SVG avatars for specific dashboards
const DASHBOARD_AVATARS = {
  bm: '/bm-logo.svg', // Bank Manager
  rm: '/employee.svg', // Relationship Manager
};

// Get avatar for dashboard - supports prefix matching for custom dashboards
const getDashboardAvatar = (dashboardId) => {
  // Direct match first
  if (DASHBOARD_AVATARS[dashboardId]) {
    return DASHBOARD_AVATARS[dashboardId];
  }
  // Check for prefix matches (e.g., "cxo-123456" matches "cxo")
  if (dashboardId.startsWith('cxo')) {
    return '/manager-avatar.svg'; // CXO uses manager avatar
  }
  return null;
};

// Color palette for new dashboards (subtle, professional colors)
const DASHBOARD_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Violet
];

const DashboardSelector = () => {
  const { 
    dashboards, 
    activeDashboardId, 
    setActiveDashboard,
    addDashboard,
    renameDashboard,
    deleteDashboard,
    getVisualizationCount,
  } = useDashboardStore();

  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');

  const handleDashboardClick = (dashboardId) => {
    setActiveDashboard(dashboardId);
  };

  const handleCreateDashboard = () => {
    if (newDashboardName.trim()) {
      const id = newDashboardName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const colorIndex = dashboards.length % DASHBOARD_COLORS.length;
      addDashboard({
        id,
        name: newDashboardName.trim(),
        icon: 'Dashboard',
        color: DASHBOARD_COLORS[colorIndex],
      });
      setNewDashboardName('');
      setCreateDialogOpen(false);
      setActiveDashboard(id);
    }
  };

  const handleRenameDashboard = () => {
    if (newDashboardName.trim() && selectedDashboard) {
      renameDashboard(selectedDashboard.id, newDashboardName.trim());
      setNewDashboardName('');
      setRenameDialogOpen(false);
      setSelectedDashboard(null);
    }
  };

  const handleDeleteDashboard = () => {
    if (selectedDashboard) {
      deleteDashboard(selectedDashboard.id);
      setSelectedDashboard(null);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5,
      py: 2,
      px: 3,
      bgcolor: '#fff',
      borderBottom: '1px solid #E5E7EB',
    }}>
      {/* Dashboard Pills with Dividers */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
      }}>
        {dashboards.map((dashboard, index) => {
          const IconComponent = ICON_MAP[dashboard.icon] || DashboardIcon;
          const count = getVisualizationCount(dashboard.id);
          const isActive = activeDashboardId === dashboard.id;
          
          return (
            <React.Fragment key={dashboard.id}>
              {/* Divider between dashboards */}
              {index > 0 && (
                <Divider 
                  orientation="vertical" 
                  flexItem 
                  sx={{ 
                    mx: 1.5, 
                    borderColor: '#E5E7EB',
                    height: 48,
                    alignSelf: 'center',
                  }} 
                />
              )}
              
              <Box
                onClick={() => handleDashboardClick(dashboard.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: isActive ? '#fff' : 'transparent',
                  border: isActive ? `1.5px solid ${alpha(dashboard.color, 0.3)}` : '1.5px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  '&:hover': {
                    bgcolor: isActive ? '#fff' : alpha('#6B7280', 0.04),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(dashboard.color, isActive ? 0.12 : 0.08),
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                  }}
                >
                  {getDashboardAvatar(dashboard.id) ? (
                    <img 
                      src={getDashboardAvatar(dashboard.id)} 
                      alt={dashboard.name}
                      style={{ 
                        width: 28, 
                        height: 28, 
                        objectFit: 'contain',
                      }} 
                    />
                  ) : (
                    <IconComponent sx={{ 
                      fontSize: 24, 
                      color: dashboard.color,
                    }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 100 }}>
                  <Typography
                    sx={{
                      fontSize: '1.05rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1F2937' : '#4B5563',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.3,
                    }}
                  >
                    {dashboard.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#9CA3AF',
                      lineHeight: 1.3,
                    }}
                  >
                    {count} {count === 1 ? 'insight' : 'insights'}
                  </Typography>
                </Box>
                
                {/* Action buttons - only show on active dashboard */}
                {isActive && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <Tooltip title="Rename">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDashboard(dashboard);
                          setNewDashboardName(dashboard.name);
                          setRenameDialogOpen(true);
                        }}
                        sx={{
                          p: 0.75,
                          color: '#9CA3AF',
                          '&:hover': { 
                            color: '#6B7280',
                            bgcolor: '#F3F4F6',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    {dashboards.length > 1 && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDashboard(dashboard);
                            handleDeleteDashboard();
                          }}
                          sx={{
                            p: 0.75,
                            color: '#9CA3AF',
                            '&:hover': { 
                              color: '#EF4444',
                              bgcolor: alpha('#EF4444', 0.08),
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>
            </React.Fragment>
          );
        })}
      </Box>

      {/* Divider before actions */}
      <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: '#E5E7EB', height: 40, alignSelf: 'center' }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Add Dashboard Button */}
        <Tooltip title="Create new dashboard">
          <IconButton
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              color: '#6B7280',
              bgcolor: '#F9FAFB',
              border: '1px dashed #D1D5DB',
              borderRadius: 2.5,
              p: 1.25,
              '&:hover': {
                bgcolor: '#F3F4F6',
                borderColor: '#9CA3AF',
                color: '#374151',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      </Box>


      {/* Create Dashboard Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Create New Dashboard
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            Organize your insights by creating separate dashboards for different purposes.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Dashboard Name"
            placeholder="e.g., Sales Analytics, Team Performance"
            value={newDashboardName}
            onChange={(e) => setNewDashboardName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateDashboard()}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)} 
            sx={{ 
              color: '#6B7280',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateDashboard} 
            variant="contained"
            disabled={!newDashboardName.trim()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            Create Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Dashboard Dialog */}
      <Dialog 
        open={renameDialogOpen} 
        onClose={() => setRenameDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Rename Dashboard
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Dashboard Name"
            value={newDashboardName}
            onChange={(e) => setNewDashboardName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRenameDashboard()}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setRenameDialogOpen(false)} 
            sx={{ 
              color: '#6B7280',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRenameDashboard} 
            variant="contained"
            disabled={!newDashboardName.trim()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardSelector;
