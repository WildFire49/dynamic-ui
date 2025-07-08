"use client";

import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';

/**
 * Image component that renders images from public directory
 * Uses Next.js Image component with fallback
 */
const ImageComponent = (props) => {
  const {
    uri,
    alt = "Image",
    width = '100%',
    height = 'auto',
    margin_bottom,
    align,
    border_radius,
    ...otherProps
  } = props;
  
  // Convert units if needed (e.g., "120dp" to pixels)
  const convertUnit = (value) => {
    if (typeof value !== 'string') return value;
    if (value.endsWith('dp')) {
      return parseInt(value, 10);
    }
    return value;
  };
  
  const widthValue = convertUnit(width);
  const heightValue = convertUnit(height);

  return (
    <Box
      sx={{
        width: '100%',
        mb: margin_bottom ? convertUnit(margin_bottom) : 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <img 
          src={uri}
          alt={alt}
          style={{
            width: widthValue,
            height: heightValue,
            objectFit: 'contain',
            borderRadius: border_radius,
          }}
          onError={(e) => {
            console.error('Image failed to load:', uri);
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'grey.200',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Image not found
        </Box>
      )}
    </Box>
  );
};

export default ImageComponent;
