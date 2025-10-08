'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Avatar,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Image from 'next/image';

const ImageCaptureUpload = ({ field, value, onChange, error, disabled }) => {
  const theme = useTheme();
  const [imagePreview, setImagePreview] = useState(value || null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `${field.id}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          onChange(reader.result);
          stopCamera();
        };
        reader.readAsDataURL(file);
      }, 'image/jpeg', 0.9);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Retake photo
  const retakePhoto = () => {
    removeImage();
    startCamera();
  };

  if (disabled) {
    return (
      <Box sx={{ opacity: 0.5, pointerEvents: 'none' }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.secondary }}>
          {field.label}{field.required && '*'}
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
            borderRadius: '12px',
            textAlign: 'center',
            backgroundColor: alpha(theme.palette.grey[100], 0.5)
          }}
        >
          <Typography variant="body2" color="text.disabled">
            This field is disabled
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          fontWeight: 600, 
          color: error ? theme.palette.error.main : theme.palette.text.primary 
        }}
      >
        {field.label}{field.required && '*'}
      </Typography>

      {/* Camera View */}
      {isCapturing && !imagePreview && (
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `2px solid ${theme.palette.primary.main}`,
            mb: 2
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              backgroundColor: '#000'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              display: 'flex',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={capturePhoto}
              sx={{
                backgroundColor: '#ffffff',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.9)
                }
              }}
            >
              Capture
            </Button>
            <Button
              variant="outlined"
              onClick={stopCamera}
              sx={{
                borderColor: '#ffffff',
                color: '#ffffff',
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: alpha('#ffffff', 0.1)
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `2px solid ${theme.palette.success.main}`,
            mb: 2
          }}
        >
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '300px',
              objectFit: 'contain',
              display: 'block',
              backgroundColor: '#f5f5f5'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 1
            }}
          >
            <IconButton
              size="small"
              onClick={retakePhoto}
              sx={{
                backgroundColor: alpha('#ffffff', 0.9),
                '&:hover': {
                  backgroundColor: '#ffffff'
                }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={removeImage}
              sx={{
                backgroundColor: alpha('#ffffff', 0.9),
                '&:hover': {
                  backgroundColor: '#ffffff'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: alpha(theme.palette.success.main, 0.9),
              color: '#ffffff',
              px: 1.5,
              py: 0.5,
              borderRadius: '20px'
            }}
          >
            <CheckIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Image Captured
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Upload/Capture Buttons */}
      {!isCapturing && !imagePreview && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: `2px dashed ${error ? theme.palette.error.main : alpha(theme.palette.divider, 0.3)}`,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <CameraIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              {field.placeholder || 'Capture or Upload Image'}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 3 }}>
              Take a photo using your camera or upload from device
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={startCamera}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3
                }}
              >
                Open Camera
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                component="label"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3
                }}
              >
                Upload File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Error message */}
      {error && (
        <Typography sx={{ color: theme.palette.error.main, fontSize: '12px', mt: 0.5, ml: 0 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageCaptureUpload;
