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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDashboardClick = (dashboardId) => {
    setActiveDashboard(dashboardId);
  };

  const handleCreateDashboard = async () => {
    if (newDashboardName.trim() && !isLoading) {
      setIsLoading(true);
      try {
        const id = newDashboardName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const colorIndex = dashboards.length % DASHBOARD_COLORS.length;
        const result = await addDashboard({
          id,
          name: newDashboardName.trim(),
          icon: 'Dashboard',
          color: DASHBOARD_COLORS[colorIndex],
        });
        
        // Use server-generated ID if available
        const dashboardId = result?.data?.id || id;
        
        setNewDashboardName('');
        setCreateDialogOpen(false);
        await setActiveDashboard(dashboardId);
      } catch (error) {
        console.error('Error creating dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRenameDashboard = async () => {
    if (newDashboardName.trim() && selectedDashboard && !isLoading) {
      setIsLoading(true);
      try {
        await renameDashboard(selectedDashboard.id, newDashboardName.trim());
        setNewDashboardName('');
        setRenameDialogOpen(false);
        setSelectedDashboard(null);
      } catch (error) {
        console.error('Error renaming dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteDashboard = async () => {
    if (selectedDashboard && !isLoading) {
      setIsLoading(true);
      try {
        await deleteDashboard(selectedDashboard.id);
        setSelectedDashboard(null);
      } catch (error) {
        console.error('Error deleting dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center', 
      py: 1,
      px: 2,
      bgcolor: '#fff',
      borderBottom: '1px solid #E5E7EB',
      minHeight: 52,
    }}>
      {/* Dashboard Tabs - Compact bubble style */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {dashboards.map((dashboard, index) => {
          const IconComponent = ICON_MAP[dashboard.icon] || DashboardIcon;
          const count = getVisualizationCount(dashboard.id);
          const isActive = activeDashboardId === dashboard.id;
          
          return (
            <Tooltip key={dashboard.id} title={`${dashboard.name} • ${count} insights`} arrow>
              <Box
                onClick={() => handleDashboardClick(dashboard.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: isActive ? alpha(dashboard.color, 0.1) : '#F1F5F9',
                  border: isActive ? `1.5px solid ${dashboard.color}` : '1.5px solid transparent',
                  '&:hover': {
                    bgcolor: isActive ? alpha(dashboard.color, 0.15) : '#E2E8F0',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(dashboard.color, isActive ? 0.2 : 0.1),
                    overflow: 'hidden',
                  }}
                >
                  {getDashboardAvatar(dashboard.id) ? (
                    <img 
                      src={getDashboardAvatar(dashboard.id)} 
                      alt={dashboard.name}
                      style={{ 
                        width: 18, 
                        height: 18, 
                        objectFit: 'contain',
                      }} 
                    />
                  ) : (
                    <IconComponent sx={{ 
                      fontSize: 16, 
                      color: dashboard.color,
                    }} />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? dashboard.color : '#4B5563',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {dashboard.name}
                </Typography>
                
                {/* 3-dot menu - only show on active dashboard */}
                {isActive && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDashboard(dashboard);
                      setMenuAnchorEl(e.currentTarget);
                    }}
                    sx={{
                      p: 0.25,
                      color: dashboard.color,
                      '&:hover': { 
                        bgcolor: alpha(dashboard.color, 0.1),
                      },
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
            </Tooltip>
          );
        })}
        
        {/* Add Dashboard Button */}
        <Tooltip title="Create new dashboard">
          <IconButton
            onClick={() => setCreateDialogOpen(true)}
            size="small"
            sx={{
              color: '#9CA3AF',
              bgcolor: '#F1F5F9',
              borderRadius: 5,
              p: 0.75,
              '&:hover': {
                bgcolor: '#E2E8F0',
                color: '#6B7280',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 3-dot Menu for Edit/Delete */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            minWidth: 140,
            mt: 0.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => {
            setNewDashboardName(selectedDashboard?.name || '');
            setRenameDialogOpen(true);
            setMenuAnchorEl(null);
          }}
          sx={{ py: 1, fontSize: '0.875rem' }}
        >
          <ListItemIcon>
            <EditIcon sx={{ fontSize: 18, color: '#6B7280' }} />
          </ListItemIcon>
          <ListItemText primary="Rename" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
        {dashboards.length > 1 && (
          <MenuItem 
            onClick={async () => {
              await handleDeleteDashboard();
              setMenuAnchorEl(null);
            }}
            disabled={isLoading}
            sx={{ py: 1, fontSize: '0.875rem', color: '#EF4444' }}
          >
            <ListItemIcon>
              {isLoading ? (
                <CircularProgress size={18} sx={{ color: '#EF4444' }} />
              ) : (
                <DeleteIcon sx={{ fontSize: 18, color: '#EF4444' }} />
              )}
            </ListItemIcon>
            <ListItemText primary={isLoading ? "Deleting..." : "Delete"} primaryTypographyProps={{ fontSize: '0.875rem', color: '#EF4444' }} />
          </MenuItem>
        )}
      </Menu>

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
            disabled={isLoading}
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
            disabled={!newDashboardName.trim() || isLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create Dashboard'}
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
            disabled={isLoading}
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
            disabled={!newDashboardName.trim() || isLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardSelector;
