import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ConfirmationDialog = ({ open, handleClose, handleConfirm, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={() => handleClose('cancel')}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{title || 'Confirm Action'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message || 'Are you sure you want to proceed?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('cancel')} color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleConfirm()} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
