import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const ReadOnlyText = ({ title, content, sx }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{
        p: 2,
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        ...sx
      }}
    >
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {content && (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
      )}
    </Paper>
  );
};

export default ReadOnlyText;
