"use client";

import React from 'react';
import { Box, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';

/**
 * PhoneWidget Component
 * Detects phone numbers in text and makes them clickable to initiate calls
 * Works on both iOS and Android devices using tel: protocol
 */
const PhoneWidget = ({ phoneNumber, displayText, variant = 'inline' }) => {
  const handleCall = (e) => {
    e.preventDefault();
    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    // Use tel: protocol which works on both iOS and Android
    window.location.href = `tel:${cleanNumber}`;
  };

  if (variant === 'button') {
    return (
      <Tooltip title={`Call ${phoneNumber}`} arrow>
        <IconButton
          onClick={handleCall}
          size="small"
          sx={{
            bgcolor: alpha('#4caf50', 0.1),
            color: '#4caf50',
            '&:hover': {
              bgcolor: alpha('#4caf50', 0.2),
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
            ml: 0.5,
          }}
        >
          <PhoneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  // Inline variant - clickable phone number with icon
  return (
    <Box
      component="a"
      href={`tel:${phoneNumber.replace(/[\s\-\(\)]/g, '')}`}
      onClick={handleCall}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        textDecoration: 'none',
        color: '#1976d2',
        fontWeight: 600,
        padding: '4px 8px',
        borderRadius: '6px',
        bgcolor: alpha('#1976d2', 0.08),
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha('#1976d2', 0.15),
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }}
    >
      <PhoneIcon sx={{ fontSize: 16 }} />
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: '0.3px',
        }}
      >
        {displayText || phoneNumber}
      </Typography>
    </Box>
  );
};

/**
 * PhoneNumberDetector Component
 * Automatically detects phone numbers in text and converts them to clickable widgets
 */
export const PhoneNumberDetector = ({ text }) => {
  // Indian phone number patterns
  const phonePatterns = [
    /(\+91[\s\-]?)?[6-9]\d{9}/g, // Indian mobile numbers with optional +91
    /(\d{3}[\s\-]?\d{3}[\s\-]?\d{4})/g, // Standard format
  ];

  const detectAndRenderPhoneNumbers = () => {
    let processedText = text;
    const phoneNumbers = new Set();

    // Find all phone numbers
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => phoneNumbers.add(match.trim()));
      }
    });

    if (phoneNumbers.size === 0) {
      return <>{text}</>;
    }

    // Split text and insert phone widgets
    const parts = [];
    let lastIndex = 0;
    const sortedNumbers = Array.from(phoneNumbers).sort((a, b) => 
      text.indexOf(a) - text.indexOf(b)
    );

    sortedNumbers.forEach(phoneNumber => {
      const index = text.indexOf(phoneNumber, lastIndex);
      if (index !== -1) {
        // Add text before phone number
        if (index > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>
              {text.substring(lastIndex, index)}
            </span>
          );
        }
        // Add phone widget
        parts.push(
          <PhoneWidget
            key={`phone-${index}`}
            phoneNumber={phoneNumber}
            variant="inline"
          />
        );
        lastIndex = index + phoneNumber.length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  return <>{detectAndRenderPhoneNumbers()}</>;
};

/**
 * HardcodedPhoneWidget Component
 * Displays a hardcoded phone number with call functionality
 */
export const HardcodedPhoneWidget = ({ 
  phoneNumber = '8511044804',
  label = 'Contact Support',
  variant = 'card' 
}) => {
  const handleCall = () => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  if (variant === 'card') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha('#4caf50', 0.08),
          border: `1px solid ${alpha('#4caf50', 0.2)}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha('#4caf50', 0.15),
            borderColor: alpha('#4caf50', 0.4),
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
        onClick={handleCall}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
          }}
        >
          <PhoneIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: '#4caf50',
              fontSize: '1rem',
              letterSpacing: '0.5px',
            }}
          >
            {phoneNumber}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Simple inline variant
  return (
    <PhoneWidget phoneNumber={phoneNumber} displayText={phoneNumber} variant="inline" />
  );
};

export default PhoneWidget;
