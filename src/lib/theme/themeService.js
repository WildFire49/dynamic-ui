/**
 * Theme Service
 * Utility functions for theme management
 */

/**
 * Fetch theme from API
 */
export const fetchTheme = async () => {
  try {
    const response = await fetch('/api/theme', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch theme:', error);
    return null;
  }
};

/**
 * Update theme colors
 */
export const updateTheme = async (colors) => {
  try {
    const response = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colors }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to update theme:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reset theme to defaults
 */
export const resetTheme = async () => {
  try {
    const response = await fetch('/api/theme', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to reset theme:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Apply a preset theme
 */
export const applyPreset = async (presetName) => {
  const presets = {
    default: {
      primary: '#0078d7',
      secondary: '#2f8fef',
      success: '#48bb78',
      warning: '#ed8936',
      error: '#f56565',
      info: '#0078d7',
    },
    purple: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#8b5cf6',
    },
    green: {
      primary: '#059669',
      secondary: '#10b981',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#14b8a6',
    },
    orange: {
      primary: '#ea580c',
      secondary: '#fb923c',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#dc2626',
      info: '#f97316',
    },
    pink: {
      primary: '#db2777',
      secondary: '#ec4899',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#f472b6',
    },
  };
  
  const colors = presets[presetName];
  if (!colors) {
    return { success: false, error: 'Preset not found' };
  }
  
  return updateTheme(colors);
};

/**
 * Validate color hex format
 */
export const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Get contrast text color (black or white) for a given background
 */
export const getContrastText = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Example: Sync theme with external CMS
 */
export const syncWithCMS = async (cmsEndpoint, apiKey) => {
  try {
    // Fetch theme from your CMS
    const response = await fetch(cmsEndpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const cmsData = await response.json();
    
    // Map CMS data to theme format
    const colors = {
      primary: cmsData.brandColors?.primary || '#0078d7',
      secondary: cmsData.brandColors?.secondary || '#2f8fef',
      success: cmsData.statusColors?.success || '#48bb78',
      warning: cmsData.statusColors?.warning || '#ed8936',
      error: cmsData.statusColors?.error || '#f56565',
      info: cmsData.statusColors?.info || '#0078d7',
    };
    
    // Update local theme
    return updateTheme(colors);
  } catch (error) {
    console.error('Failed to sync with CMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Example: Load theme from environment variables
 */
export const loadFromEnv = () => {
  return {
    primary: process.env.NEXT_PUBLIC_THEME_PRIMARY || '#0078d7',
    secondary: process.env.NEXT_PUBLIC_THEME_SECONDARY || '#2f8fef',
    success: process.env.NEXT_PUBLIC_THEME_SUCCESS || '#48bb78',
    warning: process.env.NEXT_PUBLIC_THEME_WARNING || '#ed8936',
    error: process.env.NEXT_PUBLIC_THEME_ERROR || '#f56565',
    info: process.env.NEXT_PUBLIC_THEME_INFO || '#0078d7',
  };
};

/**
 * Example: Export theme for use in other tools (Figma, etc.)
 */
export const exportTheme = async () => {
  const theme = await fetchTheme();
  
  if (!theme) {
    return null;
  }
  
  // Export in various formats
  return {
    json: theme,
    css: Object.entries(theme)
      .map(([key, value]) => `--color-${key}: ${value};`)
      .join('\n'),
    scss: Object.entries(theme)
      .map(([key, value]) => `$color-${key}: ${value};`)
      .join('\n'),
    tailwind: {
      extend: {
        colors: theme,
      },
    },
  };
};

export default {
  fetchTheme,
  updateTheme,
  resetTheme,
  applyPreset,
  isValidHexColor,
  getContrastText,
  syncWithCMS,
  loadFromEnv,
  exportTheme,
};
