// OTP Input Component for 4-digit OTP verification
'use client';

import React, { useState, useRef } from 'react';
import { Box, TextField, Typography } from '@mui/material';

const OTPInput = ({ 
  length = 4, 
  value = '', 
  onChange, 
  label = "Enter OTP",
  onAction,
  sx,
  ...props 
}) => {
  const [otp, setOtp] = useState(value.split('').slice(0, length));
  const inputRefs = useRef([]);

  const handleChange = (index, newValue) => {
    // Only allow digits
    if (!/^\d*$/.test(newValue)) return;

    const newOtp = [...otp];
    
    // If user types multiple digits, distribute them across fields
    if (newValue.length > 1) {
      const digits = newValue.replace(/\D/g, '').slice(0, length - index);
      for (let i = 0; i < digits.length && (index + i) < length; i++) {
        newOtp[index + i] = digits[i];
      }
      // Focus the next empty field or the last filled field
      const nextFocusIndex = Math.min(index + digits.length, length - 1);
      setTimeout(() => {
        inputRefs.current[nextFocusIndex]?.focus();
      }, 0);
    } else {
      // Single digit entry
      newOtp[index] = newValue.slice(-1); // Take only the last digit
      // Auto-focus next input
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    setOtp(newOtp);

    const otpString = newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }
    if (onAction) {
      onAction({
        type: 'otp_change',
        value: otpString,
        isComplete: otpString.length === length
      });
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = pastedData.split('').concat(Array(length).fill('')).slice(0, length);
    setOtp(newOtp);
    
    const otpString = newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }
    if (onAction) {
      onAction({
        type: 'otp_change',
        value: otpString,
        isComplete: otpString.length === length
      });
    }
  };

  return (
    <Box sx={{ ...sx }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        {Array.from({ length }, (_, index) => (
          <TextField
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            variant="outlined"
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }
            }}
            sx={{
              width: 56,
              '& .MuiOutlinedInput-root': {
                height: 56,
                '&.Mui-focused': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2
                  }
                }
              }
            }}
            {...props}
          />
        ))}
      </Box>
    </Box>
  );
};

export default OTPInput;
