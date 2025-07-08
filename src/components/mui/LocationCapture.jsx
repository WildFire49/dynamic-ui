import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CircularProgress from '@mui/material/CircularProgress';

const LocationCapture = ({ title, onLocationCapture }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const capturedLocation = { latitude, longitude };
        setLocation(capturedLocation);
        if (onLocationCapture) {
          onLocationCapture(capturedLocation);
        }
        setLoading(false);
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`);
        setLoading(false);
      }
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 2,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title || 'Location Capture'}
      </Typography>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocationOnIcon />}
        onClick={handleLocationClick}
        disabled={loading}
      >
        {loading ? 'Getting Location...' : 'Get My Location'}
      </Button>
      {location && (
        <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
          Location captured: Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LocationCapture;
