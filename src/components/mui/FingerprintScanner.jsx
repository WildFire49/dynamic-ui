// Fingerprint Scanner Component for Aadhar verification
'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

const FingerprintScanner = ({ 
  onScan, 
  onAction,
  label = "Tap to scan with fingerprint",
  sx,
  ...props 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate fingerprint scanning
    setTimeout(() => {
      const mockResult = {
        success: true,
        message: "Fingerprint verified successfully",
        timestamp: new Date().toISOString()
      };
      
      setScanResult(mockResult);
      setIsScanning(false);
      
      if (onScan) {
        onScan(mockResult);
      }
      if (onAction) {
        onAction({
          type: 'fingerprint_scan',
          result: mockResult
        });
      }
    }, 2000);
  };

  return (
    <Box sx={{ textAlign: 'center', ...sx }}>
      <Button
        variant="outlined"
        onClick={handleScan}
        disabled={isScanning}
        startIcon={
          isScanning ? (
            <CircularProgress size={24} />
          ) : (
            <FingerprintIcon sx={{ fontSize: 32 }} />
          )
        }
        sx={{
          minHeight: 80,
          minWidth: 200,
          flexDirection: 'column',
          gap: 1,
          borderStyle: 'dashed',
          borderWidth: 2,
          '&:hover': {
            borderStyle: 'solid',
            backgroundColor: 'primary.light',
            color: 'white'
          }
        }}
        {...props}
      >
        <Typography variant="body2">
          {isScanning ? 'Scanning...' : label}
        </Typography>
      </Button>
      
      {scanResult && (
        <Typography 
          variant="body2" 
          color={scanResult.success ? 'success.main' : 'error.main'}
          sx={{ mt: 1 }}
        >
          {scanResult.message}
        </Typography>
      )}
    </Box>
  );
};

export default FingerprintScanner;
