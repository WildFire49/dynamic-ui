import React from 'react';
import Button from '@mui/material/Button';

const MuiButton = React.forwardRef(({ text, action, onAction, ...props }, ref) => {
  const handleClick = () => {
    if (onAction && action) {
      // The action_id to proceed with is nested in the action object
      const nextActionId = action.next_success_action_id || action.action_id;
      if (nextActionId) {
        onAction(nextActionId);
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
