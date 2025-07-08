import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = React.lazy(() => import('react-player'));

// Enhanced Video component supporting both native video and ReactPlayer
const Video = (props) => {
  console.log('Video component props:', props); // Debug all props
  
  const {
    uri,           // From schema
    url,           // Alternative prop name
    corner_radius, 
    margin_bottom, 
    aspect_ratio, 
    background_color,
    autoplay = false,  // New schema property
    controls = true,   // New schema property
    ...otherProps      // Capture any other props
  } = props;
  
  // Use either uri or url prop - uri takes precedence
  const videoUrl = uri || url || null;
  console.log('Video URL to be used:', videoUrl);
  
  // Component state
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  
  // Track when video metadata is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // IMPORTANT: Force loading indicator to disappear after timeout
    // This is a fallback in case canplay never fires
    const forceShowVideo = setTimeout(() => {
      console.log('Forcing video to show after timeout');
      setIsLoading(false);
      
      // Try to play the video (this may help trigger events)
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Auto-play successful');
            // Immediately pause to respect controls
            video.pause();
          }).catch(err => {
            console.log('Auto-play prevented:', err);
            // Expected on many browsers
          });
        }
      } catch (e) {
        console.log('Play attempt error:', e);
      }
    }, 2000);
    
    const handleCanPlay = () => {
      console.log('Video can play now');
      setIsLoading(false);
    };
    
    const handleLoadStart = () => {
      console.log('Video load started');
    };
    
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      console.log('Duration:', video.duration);
      console.log('Dimensions:', video.videoWidth, 'x', video.videoHeight);
      // As soon as metadata is loaded, we can remove the loading indicator
      setIsLoading(false);
    };
    
    const handleWaiting = () => {
      console.log('Video waiting for data');
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      console.error('Error code:', video.error ? video.error.code : 'unknown');
      console.error('Error message:', video.error ? video.error.message : 'unknown');
      setHasError(true);
      setIsLoading(false);
    };
    
    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', () => {
      console.log('Video is playing');
      setIsLoading(false);
    });
    
    // Log the video element
    console.log('Video element:', video);
    console.log('Video source:', videoUrl);
    
    // Check if file exists by attempting to fetch
    fetch(videoUrl)
      .then(response => {
        if (!response.ok) {
          console.error(`Video file not accessible: ${response.status} ${response.statusText}`);
          throw new Error(`HTTP error ${response.status}`);
        } else {
          console.log('Video file exists and is accessible!');
          return response.blob();
        }
      })
      .then(blob => {
        console.log('Video file size:', Math.round(blob.size / 1024), 'KB');
        console.log('Video MIME type:', blob.type);
      })
      .catch(error => {
        console.error('Error checking video file:', error);
        setHasError(true);
      });
    
    return () => {
      // Clean up
      clearTimeout(forceShowVideo);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', () => {});
    };
  }, [videoUrl]);
  
  // Create container styles
  const sx = {
    borderRadius: corner_radius ? parseInt(corner_radius) / 16 + 'rem' : '12px',
    overflow: 'hidden',
    aspectRatio: aspect_ratio || '16/9',
    marginBottom: margin_bottom ? parseInt(margin_bottom) / 16 + 'rem' : '20px',
    backgroundColor: background_color || '#000',
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };
  
  // Video styles
  const videoStyle = {
    display: 'block',
    width: '100%', 
    height: '100%',
    objectFit: 'contain'
  };
  
  // Determine which video player to use
  const [useReactPlayer, setUseReactPlayer] = useState(false);
  
  // On mount, check if we should use ReactPlayer based on URL format
  useEffect(() => {
    // ReactPlayer is better for YouTube, Vimeo, etc.
    // Use ReactPlayer for non-local video URLs or if explicitly specified in otherProps
    const isRemoteUrl = videoUrl && (
      videoUrl.includes('http://') || 
      videoUrl.includes('https://') ||
      videoUrl.includes('youtube') ||
      videoUrl.includes('vimeo')
    );
    
    const shouldUseReactPlayer = isRemoteUrl || otherProps.useReactPlayer;
    console.log('Using ReactPlayer:', shouldUseReactPlayer);
    setUseReactPlayer(shouldUseReactPlayer);
  }, [videoUrl]);
  
  // Handle direct click to play
  const handleBoxClick = () => {
    if (isLoading) {
      console.log('Manual click to force play');
      setIsLoading(false);
      
      if (useReactPlayer) {
        // ReactPlayer has its own controls
        console.log('ReactPlayer is handling playback');
      } else if (videoRef.current) {
        // Native video element
        try {
          videoRef.current.play().catch(e => console.log('Play on click failed:', e));
        } catch (e) {
          console.log('Error playing video:', e);
        }
      }
    }
  };
  
  return (
    <Box 
      sx={sx} 
      className="video-container"
      onClick={handleBoxClick}
    >
      {videoUrl ? (
        <>
          {useReactPlayer ? (
            // ReactPlayer for remote URLs or streaming sources
            <React.Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading player...</div>}>
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={autoplay}
                controls={controls}
                onError={(e) => {
                  console.error("ReactPlayer error:", e);
                  setHasError(true);
                }}
                onReady={() => {
                  console.log('ReactPlayer is ready');
                  setIsLoading(false);
                }}
                style={{
                  visibility: 'visible',
                  zIndex: 2,
                  position: 'relative'
                }}
                config={{
                  file: {
                    attributes: {
                      style: { width: '100%', height: '100%' }
                    }
                  }
                }}
              />
            </React.Suspense>
          ) : (
            // Native video for local files and better compatibility
            <video 
              ref={videoRef}
              controls={controls}
              autoPlay={autoplay}
              playsInline
              preload="auto"
              style={{...videoStyle, 
                visibility: 'visible', 
                zIndex: 2, 
                position: 'relative'
              }}
              onError={(e) => {
                console.error("Video error event:", e);
                setHasError(true);
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          )}
          
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1 // Lower z-index than video
            }}>
              <div>
                <div>Loading video...</div>
                <button 
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#0078d7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLoading(false);
                  }}
                >
                  Show Video
                </button>
              </div>
            </div>
          )}
          
          {hasError && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 3 // Higher than video
            }}>
              <div>Error loading video</div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                URL: {videoUrl}
              </div>
              <button 
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#0078d7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setHasError(false);
                  setIsLoading(false);
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
          No video URL provided
        </div>
      )}
    </Box>
  );
};

export default Video;
