import React from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Zoom
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Send as SendIcon
} from '@mui/icons-material';

const InputWithRecording = ({
  inputValue,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  recordingTime,
  isTyping
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for seek visualization
  const getRecordingProgress = () => {
    // Show progress out of reasonable max duration (e.g., 5 minutes = 300 seconds)
    const maxDuration = 300;
    return Math.min((recordingTime / maxDuration) * 100, 100);
  };

  // Generate animated waveform bars with recording progress
  const generateWaveformBars = () => {
    const progress = getRecordingProgress();
    return Array.from({ length: 25 }, (_, i) => {
      const barProgress = (i / 25) * 100;
      const isActive = barProgress <= progress;
      
      return (
        <Box
          key={i}
          sx={{
            width: 3,
            height: `${Math.random() * 20 + 8}px`,
            backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            borderRadius: 1,
            animation: isActive ? 'waveAnimation 1.2s ease-in-out infinite' : 'none',
            animationDelay: `${i * 0.05}s`,
            transition: 'all 0.3s ease',
            '@keyframes waveAnimation': {
              '0%, 100%': { transform: 'scaleY(0.6)', opacity: 0.7 },
              '50%': { transform: 'scaleY(1.4)', opacity: 1 }
            }
          }}
        />
      );
    });
  };

  if (isRecording) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 1.5 },
        width: '100%',
        maxWidth: '600px',
        mx: 'auto',
        p: 2,
        backgroundColor: '#f44336',
        borderRadius: '25px',
        color: 'white',
        minHeight: '56px',
        boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)',
        animation: 'recordingPulse 2s ease-in-out infinite',
        '@keyframes recordingPulse': {
          '0%': { transform: 'scale(1)', boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 6px 24px rgba(244, 67, 54, 0.4)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)' },
        },
      }}>
        {/* Animated Microphone */}
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
              animation: 'micPulse 1.5s ease-in-out infinite',
              '@keyframes micPulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            <MicIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </Box>
        </Box>

        {/* Recording Status */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Recording...
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              opacity: 0.9,
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            {formatTime(recordingTime)}
          </Typography>
        </Box>

        {/* Animated Waveform Bars */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mr: 1 }}>
          {generateWaveformBars()}
        </Box>

        {/* Stop Button */}
        <IconButton
          onClick={onStopRecording}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          <StopIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5,
      width: '100%',
      maxWidth: '600px',
      mx: 'auto'
    }}>
      <TextField
        variant="outlined"
        placeholder="Type your message here..."
        value={inputValue}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
        disabled={isTyping}
        multiline
        maxRows={1}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            minHeight: '36px',
            '&:hover': {
              borderColor: '#bdbdbd'
            },
            '&.Mui-focused': {
              borderColor: '#1976d2',
              backgroundColor: '#ffffff'
            },
            '& fieldset': {
              border: 'none'
            }
          },
          '& .MuiInputBase-input': {
            py: 0.5,
            px: 1.5,
            fontSize: '14px',
            lineHeight: 1.4,
            textAlign: 'left',
            '&::placeholder': {
              color: '#9e9e9e',
              opacity: 1
            }
          }
        }}
      />
      
      <IconButton
        onClick={onStartRecording}
        disabled={isTyping}
        sx={{
          backgroundColor: '#e0e0e0',
          color: '#757575',
          width: 36,
          height: 36,
          p: 1,
          mr: 0.5,
          '&:hover': {
            backgroundColor: '#bdbdbd'
          },
          '&.Mui-disabled': {
            backgroundColor: '#f5f5f5',
            color: '#bdbdbd',
          }
        }}
      >
        <MicIcon sx={{ fontSize: 18 }} />
      </IconButton>
      
      <Zoom in={inputValue.trim().length > 0}>
        <IconButton
          onClick={onSendMessage}
          disabled={isTyping || inputValue.trim().length === 0}
          sx={{
            backgroundColor: '#e0e0e0',
            color: '#757575',
            width: 36,
            height: 36,
            p: 1,
            '&:hover': {
              backgroundColor: '#bdbdbd'
            },
            '&.Mui-disabled': {
              backgroundColor: '#f5f5f5',
              color: '#bdbdbd',
            },
            ...(inputValue.trim().length > 0 && {
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            })
          }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Zoom>
    </Box>
  );
};

export default InputWithRecording;
