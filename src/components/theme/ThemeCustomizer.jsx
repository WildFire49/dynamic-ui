'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  Typography,
  Divider,
  Button,
  alpha,
  Tooltip,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useThemeCustomization } from '../../lib/theme/MuiThemeProvider';

const ColorPicker = ({ label, value, onChange, description }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
        <Chip 
          label={value.toUpperCase()} 
          size="small" 
          sx={{ 
            fontFamily: 'monospace',
            bgcolor: alpha(value, 0.1),
            border: `1px solid ${value}`,
            fontWeight: 600,
          }} 
        />
      </Box>
      {description && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          sx={{
            width: 60,
            height: 40,
            borderRadius: '8px',
            backgroundColor: value,
            border: '2px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 4px 12px ${alpha(value, 0.4)}`,
            },
          }}
          onClick={() => document.getElementById(`color-input-${label}`).click()}
        />
        <input
          id={`color-input-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            height: '40px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        />
      </Box>
    </Box>
  );
};

const PresetTheme = ({ name, colors, onApply }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: colors.primary,
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(colors.primary, 0.2)}`,
        },
      }}
      onClick={onApply}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Object.entries(colors).map(([key, color]) => (
          <Box
            key={key}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              backgroundColor: color,
              border: '2px solid',
              borderColor: 'divider',
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

const ThemeCustomizer = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { colors, updateColor, resetColors } = useThemeCustomization();

  // Only render on client to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const presetThemes = [
    {
      name: 'Default Blue',
      colors: {
        primary: '#0078d7',
        secondary: '#2f8fef',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565',
        info: '#0078d7',
      },
    },
    {
      name: 'Purple Dreams',
      colors: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#8b5cf6',
      },
    },
    {
      name: 'Green Nature',
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#14b8a6',
      },
    },
    {
      name: 'Dark Orange',
      colors: {
        primary: '#ea580c',
        secondary: '#fb923c',
        success: '#22c55e',
        warning: '#fbbf24',
        error: '#dc2626',
        info: '#f97316',
      },
    },
    {
      name: 'Pink Elegance',
      colors: {
        primary: '#db2777',
        secondary: '#ec4899',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#f472b6',
      },
    },
  ];

  const applyPreset = async (preset) => {
    setLoading(true);
    try {
      // Apply all colors at once by calling the API directly
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: preset.colors }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSnackbar(`✨ ${preset.name} theme applied!`, 'success');
        // Force a refresh to get the new theme
        setTimeout(() => window.location.reload(), 500);
      } else {
        showSnackbar('Failed to apply preset', 'error');
      }
    } catch (error) {
      console.error('Error applying preset:', error);
      showSnackbar('Failed to apply preset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = async (key, value) => {
    setLoading(true);
    try {
      await updateColor(key, value);
      showSnackbar(`${key.charAt(0).toUpperCase() + key.slice(1)} color updated!`, 'success');
    } catch (error) {
      console.error('Error updating color:', error);
      showSnackbar('Failed to update color', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetColors();
      showSnackbar('Theme reset to defaults!', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Error resetting theme:', error);
      showSnackbar('Failed to reset theme', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Tooltip title="Customize Theme" placement="left">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: `0 4px 20px ${alpha('#000', 0.3)}`,
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)',
              boxShadow: `0 6px 24px ${alpha('#000', 0.4)}`,
            },
            transition: 'all 0.2s',
            zIndex: 1000,
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      {/* Theme Customizer Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            p: 3,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Theme Customizer
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Preset Themes */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
          Quick Presets
        </Typography>
        <Stack spacing={1} sx={{ mb: 4 }}>
          {presetThemes.map((preset) => (
            <PresetTheme
              key={preset.name}
              name={preset.name}
              colors={preset.colors}
              onApply={() => applyPreset(preset)}
            />
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Custom Colors */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
          Custom Colors
        </Typography>

        <ColorPicker
          label="Primary"
          value={colors.primary}
          onChange={(value) => handleColorChange('primary', value)}
          description="Main brand color for buttons and accents"
        />

        <ColorPicker
          label="Secondary"
          value={colors.secondary}
          onChange={(value) => handleColorChange('secondary', value)}
          description="Secondary actions and highlights"
        />

        <ColorPicker
          label="Success"
          value={colors.success}
          onChange={(value) => handleColorChange('success', value)}
          description="Positive actions and success messages"
        />

        <ColorPicker
          label="Warning"
          value={colors.warning}
          onChange={(value) => handleColorChange('warning', value)}
          description="Warnings and cautions"
        />

        <ColorPicker
          label="Error"
          value={colors.error}
          onChange={(value) => handleColorChange('error', value)}
          description="Error states and destructive actions"
        />

        <ColorPicker
          label="Info"
          value={colors.info}
          onChange={(value) => handleColorChange('info', value)}
          description="Information and help messages"
        />

        <Divider sx={{ my: 3 }} />

        {/* Reset Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleReset}
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {loading ? 'Resetting...' : 'Reset to Default'}
        </Button>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          {loading ? 'Updating theme...' : 'Changes are saved automatically'}
        </Typography>
      </Drawer>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          icon={snackbar.severity === 'success' ? <CheckIcon /> : undefined}
          sx={{ 
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ThemeCustomizer;
