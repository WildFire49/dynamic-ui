import React from 'react';
import { Box, InputBase, Stack, Typography, IconButton } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, GridView as GridViewIcon } from '@mui/icons-material';
import { TOOLBAR_STYLES, COLORS, BORDER_RADIUS, SPACING, SHADOWS } from './dashboardStyles';

const SearchBox = ({ 
  searchQuery, 
  onSearchChange, 
  onClear, 
  placeholder, 
  resultCount 
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={TOOLBAR_STYLES.searchBox}
    >
      {/* Search Icon Box */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          borderRadius: BORDER_RADIUS.medium,
          bgcolor: searchQuery ? COLORS.primary : COLORS.background.paper,
          border: `1px solid ${COLORS.border.light}`,
          boxShadow: SHADOWS.button.default,
          transition: 'all 0.2s ease',
        }}
      >
        <SearchIcon sx={{ 
          fontSize: 16, 
          color: searchQuery ? '#fff' : COLORS.text.secondary,
          transition: 'color 0.2s ease',
        }} />
      </Box>
      
      {/* Search Input */}
      <InputBase
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ 
          flex: 1,
          minWidth: { xs: 80, sm: 180 },
          fontSize: '0.8rem',
          fontWeight: 500,
          color: COLORS.text.primary,
          '& input::placeholder': { color: COLORS.text.muted, opacity: 1, fontWeight: 400 }
        }}
      />
      
      {/* Widget Count Badge */}
      {!searchQuery && resultCount > 0 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          borderRadius: BORDER_RADIUS.medium,
          bgcolor: COLORS.background.paper,
          border: `1px solid ${COLORS.border.light}`,
          boxShadow: SHADOWS.button.default,
        }}>
          <GridViewIcon sx={{ fontSize: 14, color: COLORS.primary }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
            {resultCount}
          </Typography>
        </Box>
      )}
      
      {/* Clear Button */}
      {searchQuery && (
        <Box
          onClick={onClear}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1,
            py: 0.75,
            borderRadius: BORDER_RADIUS.medium,
            bgcolor: '#FEE2E2',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#FECACA' },
          }}
        >
          <CloseIcon sx={{ fontSize: 14, color: COLORS.error }} />
        </Box>
      )}
    </Stack>
  );
};

export default SearchBox;
