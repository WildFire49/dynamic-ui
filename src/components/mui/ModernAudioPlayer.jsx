import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Slider,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp,
  VolumeDown,
  Forward10,
  Replay10,
  Error as ErrorIcon
} from '@mui/icons-material';

const ModernAudioPlayer = ({ audioUrl, autoPlay = true, onError, title = "Audio Response" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  
  const audioRef = useRef(null);
  const progressUpdateRef = useRef(null);

  // Fetch audio as blob to bypass MinIO download behavior
  useEffect(() => {
    if (!audioUrl) return;

    const fetchAudioBlob = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log('🔄 Fetching WAV file from MinIO:', audioUrl);

        const response = await fetch(audioUrl, {
          method: 'GET',
          headers: {
            'Accept': 'audio/wav, audio/*',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('✅ WAV blob fetched, size:', blob.size, 'bytes');
        
        // Create blob URL for audio element
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        
      } catch (error) {
        console.error('❌ Failed to fetch audio blob:', error);
        setLoadError(`Failed to load audio: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchAudioBlob();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio element setup once blob is ready
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !blobUrl) return;

    // This flag is local to the effect's closure, preventing loops
    let didAutoPlay = false;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      console.log('✅ Audio metadata loaded, duration:', audio.duration);
    };

    const handleCanPlay = () => {
      if (autoPlay && !didAutoPlay) {
        didAutoPlay = true; // Prevent re-triggering
        console.log('🎵 Starting auto-play...');
        audio.play().then(() => {
          setIsPlaying(true);
          console.log('✅ Auto-play successful');
        }).catch(error => {
          console.error('❌ Auto-play failed:', error);
        });
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.error('Audio load error:', e.target.error);
      setIsLoading(false);
      setLoadError('Failed to play audio file');
      if (onError) onError(e.target.error);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Configure and load audio with blob URL
    audio.src = blobUrl;
    audio.preload = 'auto';
    audio.volume = volume;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [blobUrl, autoPlay, volume, onError]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Play failed:', error);
      });
    }
  };

  const handleSeek = (event, newValue) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTime = (newValue / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loadError) {
    return (
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: '#ffebee' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ErrorIcon color="error" />
          <Typography variant="body2" color="error">
            {loadError}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 1.5, 
        borderRadius: 8,
        background: 'transparent',
        width: '100%',
        maxWidth: 400,
      }}
    >
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
        <IconButton
          onClick={togglePlayPause}
          disabled={isLoading}
          sx={{
            backgroundColor: '#2196f3',
            color: 'white',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#1976d2' },
            '&:disabled': { backgroundColor: '#ccc' }
          }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : (isPlaying ? <PauseIcon /> : <PlayIcon />)}
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Slider
            size="small"
            value={progressPercentage}
            onChange={handleSeek}
            disabled={isLoading}
            sx={{
              color: '#2196f3',
              height: 6,
              p: '13px 0',
              '& .MuiSlider-thumb': {
                height: 16,
                width: 16,
                backgroundColor: '#fff',
                border: '2px solid currentColor',
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: -1 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ModernAudioPlayer;
