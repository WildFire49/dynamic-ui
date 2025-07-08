import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SuccessNotification = ({ title, message, sx }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderTop: '4px solid',
        borderColor: 'success.main',
        ...sx 
      }}
    >
      <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" component="h2" gutterBottom>
        {title || 'Success!'}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message || 'The operation was completed successfully.'}
      </Typography>
    </Paper>
  );
};

export default SuccessNotification;
