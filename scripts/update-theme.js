#!/usr/bin/env node

/**
 * CLI Tool to update theme
 * 
 * Usage:
 *   node scripts/update-theme.js --primary "#7c3aed" --secondary "#a78bfa"
 *   node scripts/update-theme.js --preset purple
 *   node scripts/update-theme.js --reset
 *   node scripts/update-theme.js --from-env
 */

const fs = require('fs');
const path = require('path');

const THEME_CONFIG_PATH = path.join(__dirname, '..', 'config', 'theme.json');

const DEFAULT_THEME = {
  primary: '#0078d7',
  secondary: '#2f8fef',
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  info: '#0078d7',
};

const PRESETS = {
  default: DEFAULT_THEME,
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

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = args[i + 1];
    options[key] = value;
    i++;
  }
}

// Validate hex color
const isValidHex = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);

// Read current theme
const readTheme = () => {
  try {
    if (fs.existsSync(THEME_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(THEME_CONFIG_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading theme:', error.message);
  }
  return DEFAULT_THEME;
};

// Write theme
const writeTheme = (theme) => {
  try {
    const configDir = path.dirname(THEME_CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(THEME_CONFIG_PATH, JSON.stringify(theme, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing theme:', error.message);
    return false;
  }
};

// Main execution
const main = () => {
  console.log('🎨 Theme Updater\n');

  // Show current theme
  if (options.show || Object.keys(options).length === 0) {
    const current = readTheme();
    console.log('Current Theme:');
    console.log(JSON.stringify(current, null, 2));
    return;
  }

  // Reset to default
  if (options.reset) {
    if (writeTheme(DEFAULT_THEME)) {
      console.log('✅ Theme reset to defaults');
      console.log(JSON.stringify(DEFAULT_THEME, null, 2));
    } else {
      console.error('❌ Failed to reset theme');
      process.exit(1);
    }
    return;
  }

  // Apply preset
  if (options.preset) {
    const preset = PRESETS[options.preset];
    if (!preset) {
      console.error(`❌ Unknown preset: ${options.preset}`);
      console.log('\nAvailable presets:', Object.keys(PRESETS).join(', '));
      process.exit(1);
    }
    if (writeTheme(preset)) {
      console.log(`✅ Applied ${options.preset} preset`);
      console.log(JSON.stringify(preset, null, 2));
    } else {
      console.error('❌ Failed to apply preset');
      process.exit(1);
    }
    return;
  }

  // Load from environment
  if (options['from-env']) {
    const theme = {
      primary: process.env.THEME_PRIMARY || DEFAULT_THEME.primary,
      secondary: process.env.THEME_SECONDARY || DEFAULT_THEME.secondary,
      success: process.env.THEME_SUCCESS || DEFAULT_THEME.success,
      warning: process.env.THEME_WARNING || DEFAULT_THEME.warning,
      error: process.env.THEME_ERROR || DEFAULT_THEME.error,
      info: process.env.THEME_INFO || DEFAULT_THEME.info,
    };
    if (writeTheme(theme)) {
      console.log('✅ Theme loaded from environment');
      console.log(JSON.stringify(theme, null, 2));
    } else {
      console.error('❌ Failed to load from environment');
      process.exit(1);
    }
    return;
  }

  // Update specific colors
  const current = readTheme();
  const updates = {};
  let hasUpdates = false;

  const colorKeys = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  
  for (const key of colorKeys) {
    if (options[key]) {
      if (!isValidHex(options[key])) {
        console.error(`❌ Invalid hex color for ${key}: ${options[key]}`);
        console.log('   Expected format: #RRGGBB (e.g., #0078d7)');
        process.exit(1);
      }
      updates[key] = options[key];
      hasUpdates = true;
    }
  }

  if (hasUpdates) {
    const newTheme = { ...current, ...updates };
    if (writeTheme(newTheme)) {
      console.log('✅ Theme updated successfully');
      console.log('\nUpdated colors:');
      Object.entries(updates).forEach(([key, value]) => {
        console.log(`  ${key}: ${current[key]} → ${value}`);
      });
      console.log('\nFull theme:');
      console.log(JSON.stringify(newTheme, null, 2));
    } else {
      console.error('❌ Failed to update theme');
      process.exit(1);
    }
  } else {
    console.log('No updates specified. Use --help for usage.');
  }
};

// Show help
if (options.help || options.h) {
  console.log(`
🎨 Theme Updater - Update application theme colors

Usage:
  node scripts/update-theme.js [options]

Options:
  --show                    Show current theme (default)
  --reset                   Reset to default theme
  --preset <name>           Apply a preset theme
  --from-env                Load theme from environment variables
  
  --primary <color>         Set primary color
  --secondary <color>       Set secondary color
  --success <color>         Set success color
  --warning <color>         Set warning color
  --error <color>           Set error color
  --info <color>            Set info color

  --help, -h                Show this help message

Examples:
  # Show current theme
  node scripts/update-theme.js
  
  # Update specific colors
  node scripts/update-theme.js --primary "#7c3aed" --secondary "#a78bfa"
  
  # Apply preset
  node scripts/update-theme.js --preset purple
  
  # Available presets: ${Object.keys(PRESETS).join(', ')}
  
  # Reset to defaults
  node scripts/update-theme.js --reset
  
  # Load from environment
  THEME_PRIMARY="#7c3aed" node scripts/update-theme.js --from-env

Environment Variables:
  THEME_PRIMARY
  THEME_SECONDARY
  THEME_SUCCESS
  THEME_WARNING
  THEME_ERROR
  THEME_INFO
`);
  process.exit(0);
}

// Run
main();
