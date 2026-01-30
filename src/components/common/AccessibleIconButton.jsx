import React from 'react';
import { IconButton as MuiIconButton } from '@mui/material';

/**
 * Accessible IconButton wrapper that enforces aria-label
 * This component ensures all icon buttons have proper accessibility labels
 * 
 * @param {Object} props - Component props
 * @param {string} props.ariaLabel - Required accessibility label
 * @param {React.ReactNode} props.children - Icon component
 * @param {Object} props.other - Other MUI IconButton props
 */
const AccessibleIconButton = ({ ariaLabel, children, ...other }) => {
  if (!ariaLabel && process.env.NODE_ENV === 'development') {
    console.warn(
      'AccessibleIconButton: ariaLabel prop is required for accessibility. ' +
      'Please provide a descriptive label for screen readers.'
    );
  }

  return (
    <MuiIconButton
      aria-label={ariaLabel}
      {...other}
    >
      {children}
    </MuiIconButton>
  );
};

export default AccessibleIconButton;
