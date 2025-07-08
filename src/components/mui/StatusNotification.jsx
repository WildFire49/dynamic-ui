import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const StatusNotification = ({ title, message, severity = 'info', sx }) => {
  return (
    <Alert 
      severity={severity} 
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        ...sx
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default StatusNotification;
