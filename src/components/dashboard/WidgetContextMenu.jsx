import React from 'react';
import { Menu, MenuItem, Typography, Divider } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { MENU_STYLES } from './dashboardStyles';

const WidgetContextMenu = ({
  anchorEl,
  open,
  menuId,
  onClose,
  onEditTitle,
  onDelete,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open && Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: MENU_STYLES.paper,
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem 
        onClick={() => { onEditTitle(); onClose(); }}
        sx={{ ...MENU_STYLES.item, ...MENU_STYLES.itemHover }}
      >
        <EditIcon sx={{ fontSize: 20, mr: 2, color: '#F59E0B' }} /> 
        <Typography variant="body2" fontWeight={500}>Rename</Typography>
      </MenuItem>
      <Divider sx={{ my: 1 }} />
      <MenuItem 
        onClick={() => { onDelete(); onClose(); }} 
        sx={{ ...MENU_STYLES.item, ...MENU_STYLES.itemDanger }}
      >
        <DeleteIcon sx={{ fontSize: 20, mr: 2, color: '#EF4444' }} /> 
        <Typography variant="body2" fontWeight={500} color="#EF4444">Delete</Typography>
      </MenuItem>
    </Menu>
  );
};

export default WidgetContextMenu;
