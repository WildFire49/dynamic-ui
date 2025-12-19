import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Zoom,
  Fade,
  Grow,
  alpha
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Send as SendIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Close as CancelIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';

// Animated placeholder texts
const PLACEHOLDER_TEXTS = [
  "Type your message...",
  "Ask about disbursements...",
  "Show me collection otr...",
  "Create a dashboard...",
  "What's the bank-wise performance?",
  "Upload an Excel file to analyze...",
];

const InputWithRecording = React.memo(({
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
  isTyping,
  placeholder
}) => {
  // Animated placeholder state
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const intervalRef = useRef(null);

  // Cycle through placeholder texts when not focused
  useEffect(() => {
    if (!isFocused && !inputValue) {
      intervalRef.current = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isFocused, inputValue]);

  // Get current placeholder text
  const currentPlaceholder = useMemo(() => {
    if (isFocused || inputValue) {
      return "Type your message...";
    }
    return PLACEHOLDER_TEXTS[placeholderIndex];
  }, [isFocused, inputValue, placeholderIndex]);

  // Memoize expensive calculations
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize recording progress calculation
  const recordingProgress = useMemo(() => {
    const maxDuration = 300;
    return Math.min((recordingTime / maxDuration) * 100, 100);
  }, [recordingTime]);

  // Memoize formatted time to prevent recalculation
  const formattedTime = useMemo(() => formatTime(recordingTime), [formatTime, recordingTime]);

  // Memoize waveform bars to prevent regeneration on every render
  const waveformBars = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const barProgress = (i / 25) * 100;
      const isActive = barProgress <= recordingProgress;
      
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
  }, [recordingProgress]);

  // Memoize TextField styles to prevent recalculation
  const textFieldStyles = useMemo(() => ({
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: { xs: '20px', sm: '24px' },
      backgroundColor: '#ffffff',
      border: '2px solid #f0f0f0',
      minHeight: { xs: '44px', sm: '48px' },
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: '#e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transform: 'translateY(-1px)'
      },
      '&.Mui-focused': {
        borderColor: '#1976d2',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 24px rgba(25,118,210,0.15)',
        transform: 'translateY(-1px)'
      },
      '& fieldset': {
        border: 'none'
      }
    },
    '& .MuiInputBase-input': {
      py: { xs: 0.75, sm: 1 },
      pl: { xs: 1.5, sm: 2 },
      pr: { xs: '60px !important', sm: '64px !important' }, // Extra padding for mic icon
      fontSize: { xs: '14px', sm: '15px' },
      lineHeight: 1.5,
      fontWeight: 400,
      '&::placeholder': {
        color: '#9e9e9e',
        opacity: 1,
        fontSize: '15px'
      }
    }
  }), []);

  if (isRecording) {
    const recordingColor = isPaused ? '#ff9800' : '#f44336';
    const recordingColorRgb = isPaused ? '255, 152, 0' : '244, 67, 54';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: { xs: 0.5, sm: 1.5 },
        width: '100%',
        maxWidth: '100%',
        minWidth: 0, // Allow shrinking
        mx: 'auto',
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1.5 },
        background: `linear-gradient(135deg, ${recordingColor} 0%, ${isPaused ? '#f57c00' : '#d32f2f'} 100%)`,
        borderRadius: { xs: '20px', sm: '28px' },
        color: 'white',
        minHeight: { xs: '48px', sm: '64px' },
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
        {/* Left Section: Mic + Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 }, flex: 1, minWidth: 0 }}>
          {/* Animated Microphone */}
          <Box
            sx={{
              width: { xs: 36, sm: 48 },
              height: { xs: 36, sm: 48 },
              flexShrink: 0,
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
            <MicIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </Box>

          {/* Recording Status */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '1.1rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isPaused ? 'Paused' : 'Recording...'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                fontSize: { xs: '0.75rem', sm: '1rem' },
                opacity: 0.95,
                fontWeight: 600,
                letterSpacing: { xs: '0.5px', sm: '1px' },
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {formattedTime}
            </Typography>
          </Box>

          {/* Animated Waveform Bars - Hide on mobile */}
          {!isPaused && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.3 }}>
              {waveformBars}
            </Box>
          )}
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          {/* Cancel Button - Hide on mobile */}
          <IconButton
            onClick={onCancelRecording}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: 44,
              height: 44,
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CancelIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Pause/Resume Button */}
          <IconButton
            onClick={isPaused ? onResumeRecording : onPauseRecording}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 32, sm: 44 },
              height: { xs: 32, sm: 44 },
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isPaused ? <PlayIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /> : <PauseIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
          </IconButton>

          {/* Stop Button */}
          <IconButton
            onClick={onStopRecording}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 36, sm: 48 },
              height: { xs: 36, sm: 48 },
              border: '2px solid rgba(255,255,255,0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <StopIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 1, sm: 2 },
      width: '100%',
      maxWidth: '100%',
      mx: 'auto',
      minWidth: 0, // Allow flex items to shrink below content size
    }}>
      {/* Input Container - Clean centered layout */}
      <Box sx={{ 
        flex: 1, 
        minWidth: 0, // Allow flex item to shrink
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 1 },
        backgroundColor: '#ffffff',
        borderRadius: { xs: '24px', sm: '32px' },
        border: '2px solid #f0f0f0',
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 0.5, sm: 0.75 },
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: '#e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
        '&:focus-within': {
          borderColor: '#1976d2',
          boxShadow: '0 4px 24px rgba(25,118,210,0.15)',
        }
      }}>
        {/* Text Input - No border, clean look */}
        <TextField
          variant="standard"
          placeholder={currentPlaceholder}
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isTyping}
          multiline
          maxRows={4}
          minRows={1}
          sx={{
            flex: 1,
            '& .MuiInput-root': {
              fontSize: { xs: '15px', sm: '15px' },
              lineHeight: 1.5,
              fontWeight: 400,
              '&:before, &:after': {
                display: 'none'
              }
            },
            '& .MuiInputBase-input': {
              padding: { xs: '10px 0', sm: '12px 0' },
              '&::placeholder': {
                color: '#9e9e9e',
                opacity: 1,
                fontSize: { xs: '15px', sm: '15px' }
              }
            }
          }}
        />
        
        {/* Mic Icon - Inside input on the right */}
        <IconButton
          onClick={onStartRecording}
          disabled={isTyping}
          size="small"
          sx={{
            color: '#666666',
            padding: { xs: '8px', sm: '10px' },
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#1976d2',
              backgroundColor: alpha('#1976d2', 0.08),
              transform: 'scale(1.1)'
            },
            '&.Mui-disabled': {
              color: '#bdbdbd',
            }
          }}
        >
          <MicIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
        </IconButton>
      </Box>
      
      {/* Send Button - Only renders when there's text (no invisible placeholder) */}
      {inputValue.trim().length > 0 && (
        <Zoom in={true} timeout={200}>
          <IconButton
            onClick={() => onSendMessage(inputValue)}
            disabled={isTyping}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: '#1565c0',
                transform: 'scale(1.05) rotate(15deg)',
                boxShadow: '0 6px 24px rgba(25,118,210,0.4)'
              },
              '&.Mui-disabled': {
                backgroundColor: '#f5f5f5',
                color: '#bdbdbd',
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <SendIcon sx={{ 
              fontSize: { xs: 22, sm: 24 },
              transition: 'transform 0.2s ease'
            }} />
          </IconButton>
        </Zoom>
      )}
    </Box>
  );
});

export default InputWithRecording;
