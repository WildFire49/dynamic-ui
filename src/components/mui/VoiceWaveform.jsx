import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const VoiceWaveform = ({ audioUrl, fileName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handleLoadError = (e) => {
      console.error('Audio load error:', e);
      setIsPlaying(false);
    };

    // Reset state
    setIsPlaying(false);

    // Add event listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleLoadError);

    // Set crossOrigin to handle CORS
    audio.crossOrigin = 'anonymous';
    
    // Set the audio source and load
    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleLoadError);
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  // Generate static waveform bars for visual appeal
  const generateWaveform = () => {
    const bars = [];
    const numBars = 30;
    
    for (let i = 0; i < numBars; i++) {
      const height = Math.random() * 20 + 8;
      const isActive = isPlaying && Math.random() > 0.3; // Random animation when playing
      
      bars.push(
        <Box
          key={i}
          sx={{
            width: 2,
            height: height,
            backgroundColor: isActive ? '#1976d2' : '#e0e0e0',
            borderRadius: 1,
            transition: 'all 0.3s ease',
            animation: isActive ? 'waveAnimation 1.5s ease-in-out infinite' : 'none',
            animationDelay: `${i * 0.05}s`,
            '@keyframes waveAnimation': {
              '0%, 100%': { transform: 'scaleY(0.6)', opacity: 0.7 },
              '50%': { transform: 'scaleY(1.2)', opacity: 1 }
            }
          }}
        />
      );
    }
    return bars;
  };


  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        maxWidth: 300,
        minWidth: 250,
      }}
    >
      <audio ref={audioRef} preload="metadata" />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Play/Pause Button */}
        <IconButton
          onClick={togglePlayPause}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </IconButton>

        {/* Waveform Visualization */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              height: 32,
              mb: 0.5
            }}
          >
            {generateWaveform()}
          </Box>
          <Typography variant="caption" sx={{ color: '#666', textAlign: 'center', display: 'block' }}>
            Voice Message
          </Typography>
        </Box>
      </Box>

      
    </Paper>
  );
};

export default VoiceWaveform;
