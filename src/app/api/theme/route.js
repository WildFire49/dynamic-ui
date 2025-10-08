import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to store theme configuration
const THEME_CONFIG_PATH = path.join(process.cwd(), 'config', 'theme.json');

// Default theme colors
const DEFAULT_THEME = {
  primary: '#0078d7',
  secondary: '#2f8fef',
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  info: '#0078d7',
};

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.join(process.cwd(), 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

// Read theme from file
const readThemeConfig = () => {
  try {
    ensureConfigDir();
    if (fs.existsSync(THEME_CONFIG_PATH)) {
      const data = fs.readFileSync(THEME_CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading theme config:', error);
  }
  return DEFAULT_THEME;
};

// Write theme to file
const writeThemeConfig = (theme) => {
  try {
    ensureConfigDir();
    fs.writeFileSync(THEME_CONFIG_PATH, JSON.stringify(theme, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing theme config:', error);
    return false;
  }
};

// GET - Fetch current theme
export async function GET() {
  try {
    const theme = readThemeConfig();
    
    return NextResponse.json({
      success: true,
      data: theme,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch theme',
        data: DEFAULT_THEME 
      },
      { status: 500 }
    );
  }
}

// POST - Update theme
export async function POST(request) {
  try {
    const body = await request.json();
    const { colors } = body;

    // Validate colors
    if (!colors || typeof colors !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid colors object' },
        { status: 400 }
      );
    }

    // Validate each color is a valid hex
    const colorKeys = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    
    for (const key of colorKeys) {
      if (colors[key] && !hexRegex.test(colors[key])) {
        return NextResponse.json(
          { success: false, error: `Invalid hex color for ${key}` },
          { status: 400 }
        );
      }
    }

    // Merge with existing theme (keep colors not in request)
    const currentTheme = readThemeConfig();
    const updatedTheme = { ...currentTheme, ...colors };

    // Write to file
    const success = writeThemeConfig(updatedTheme);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to save theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Theme updated successfully',
      data: updatedTheme,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

// DELETE - Reset to default theme
export async function DELETE() {
  try {
    const success = writeThemeConfig(DEFAULT_THEME);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Theme reset to defaults',
      data: DEFAULT_THEME,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reset theme' },
      { status: 500 }
    );
  }
}
