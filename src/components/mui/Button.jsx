import React from 'react';
import Button from '@mui/material/Button';

const MuiButton = React.forwardRef(({ text, action, onAction, ...props }, ref) => {
  const handleClick = () => {
    if (onAction && action) {
      // The action_id to proceed with is nested in the action object
      if (action) {
        onAction(action, { text });
      }
    }
  };

  return (
    <Button
      ref={ref}
      variant="contained"
      color="primary"
      onClick={handleClick}
      {...props}
    >
      {text} 
    </Button>
  );
});

MuiButton.displayName = 'MuiButton'; // Add display name for better debugging

export default MuiButton;
