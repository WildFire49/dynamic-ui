import React from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Paper,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';

const VoiceRecordingPopover = ({ 
  open, 
  anchorEl, 
  onClose, 
  isRecording, 
  onStop,
  recordingTime = 0 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 3,
          overflow: 'visible',
          mt: -1,
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ffffff',
          },
        },
      }}
    >
      <Paper sx={{ p: 3, minWidth: 280, textAlign: 'center' }}>
        <Fade in={isRecording}>
          <Box>
            {/* Recording Animation */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <CircularProgress
                size={80}
                thickness={2}
                sx={{
                  color: '#f44336',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <MicIcon sx={{ fontSize: 32, color: '#f44336' }} />
              </Box>
            </Box>

            {/* Recording Status */}
            <Typography variant="h6" sx={{ mb: 1, color: '#f44336', fontWeight: 600 }}>
              Recording...
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
              Speak now, your voice is being captured
            </Typography>

            {/* Recording Time */}
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                fontFamily: 'monospace', 
                color: '#333',
                fontWeight: 500 
              }}
            >
              {formatTime(recordingTime)}
            </Typography>

            {/* Waveform Animation */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, gap: 0.5 }}>
              {[...Array(12)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 3,
                    backgroundColor: '#f44336',
                    borderRadius: 1.5,
                    animation: `wave 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                    height: Math.random() * 20 + 10,
                    '@keyframes wave': {
                      '0%, 100%': { height: 10 },
                      '50%': { height: Math.random() * 30 + 15 },
                    },
                  }}
                />
              ))}
            </Box>

            {/* Stop Button */}
            <IconButton
              onClick={onStop}
              sx={{
                backgroundColor: '#f44336',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                  backgroundColor: '#d32f2f',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <StopIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        </Fade>
      </Paper>
    </Popover>
  );
};

export default VoiceRecordingPopover;
