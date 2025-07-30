// DatePicker Component for date input fields
'use client';

import React from 'react';
import { TextField } from '@mui/material';

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "YYYY-MM-DD",
  required = false,
  error = false,
  helperText = "",
  sx,
  onAction,
  ...props 
}) => {
  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) {
      onChange(newValue);
    }
    if (onAction) {
      onAction({
        type: 'input_change',
        value: newValue,
        field: label || 'date'
      });
    }
  };

  return (
    <TextField
      type="date"
      label={label}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      error={error}
      helperText={helperText}
      fullWidth
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      sx={sx}
      {...props}
    />
  );
};

export default DatePicker;
