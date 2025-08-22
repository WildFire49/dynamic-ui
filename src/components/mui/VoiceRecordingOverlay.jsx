import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Fade
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon
} from '@mui/icons-material';

const VoiceRecordingOverlay = ({ 
  open, 
  isRecording, 
  onStop,
  recordingTime = 0 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  return (
    <Fade in={open}>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          backgroundColor: '#f44336',
          color: 'white',
          minWidth: { xs: 200, sm: 240 },
          maxWidth: { xs: '90vw', sm: 300 },
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Recording Animation */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            <MicIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </Box>
        </Box>

        {/* Recording Info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
            Recording...
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.75rem',
              opacity: 0.9
            }}
          >
            {formatTime(recordingTime)}
          </Typography>
        </Box>

        {/* Stop Button */}
        <IconButton
          onClick={onStop}
          size="small"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          <StopIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Paper>
    </Fade>
  );
};

export default VoiceRecordingOverlay;
