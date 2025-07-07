import React from 'react';
import Button from '@mui/material/Button';

const MuiButton = ({ label, ...props }) => {
  return (
    <Button fullWidth {...props}>
      {label}
    </Button>
  );
};

export default MuiButton;
