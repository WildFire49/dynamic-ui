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
  Send as SendIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Close as CancelIcon
} from '@mui/icons-material';

const InputWithRecording = ({
  inputValue,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onCancelRecording,
  isRecording,
  isPaused,
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
    const recordingColor = isPaused ? '#ff9800' : '#f44336';
    const recordingColorRgb = isPaused ? '255, 152, 0' : '244, 67, 54';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 1.5 },
        width: '100%',
        maxWidth: '600px',
        mx: 'auto',
        p: 2,
        background: `linear-gradient(135deg, ${recordingColor} 0%, ${isPaused ? '#f57c00' : '#d32f2f'} 100%)`,
        borderRadius: '28px',
        color: 'white',
        minHeight: '64px',
        boxShadow: `0 8px 32px rgba(${recordingColorRgb}, 0.4)`,
        animation: isPaused ? 'pausedPulse 3s ease-in-out infinite' : 'recordingPulse 2s ease-in-out infinite',
        '@keyframes recordingPulse': {
          '0%': { transform: 'scale(1)', boxShadow: `0 8px 32px rgba(${recordingColorRgb}, 0.4)` },
          '50%': { transform: 'scale(1.02)', boxShadow: `0 12px 40px rgba(${recordingColorRgb}, 0.5)` },
          '100%': { transform: 'scale(1)', boxShadow: `0 8px 32px rgba(${recordingColorRgb}, 0.4)` },
        },
        '@keyframes pausedPulse': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.01)', opacity: 0.9 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      }}>
        {/* Animated Microphone */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isPaused ? 'none' : 'micPulse 1.5s ease-in-out infinite',
              border: '2px solid rgba(255,255,255,0.2)',
              '@keyframes micPulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            <MicIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </Box>
        </Box>

        {/* Recording Status */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {isPaused ? 'Paused' : 'Recording...'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              opacity: 0.95,
              fontWeight: 600,
              letterSpacing: '1px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {formatTime(recordingTime)}
          </Typography>
        </Box>

        {/* Animated Waveform Bars */}
        {!isPaused && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mr: 2 }}>
            {generateWaveformBars()}
          </Box>
        )}

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Cancel Button */}
          <IconButton
            onClick={onCancelRecording}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CancelIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>

          {/* Pause/Resume Button */}
          <IconButton
            onClick={isPaused ? onResumeRecording : onPauseRecording}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isPaused ? <PlayIcon sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <PauseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          </IconButton>

          {/* Stop Button */}
          <IconButton
            onClick={onStopRecording}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              border: '2px solid rgba(255,255,255,0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <StopIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>
        </Box>
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
        maxRows={4}
        minRows={1}
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
          onClick={() => onSendMessage(inputValue)}
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
