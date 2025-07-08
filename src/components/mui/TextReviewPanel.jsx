import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const TextReviewPanel = ({ title, content, sx }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{
        p: 3,
        width: '100%',
        boxSizing: 'border-box',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(5px)',
        ...sx
      }}
    >
      {title && (
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
          {title}
        </Typography>
      )}
      {content && (
        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {content}
        </Typography>
      )}
    </Paper>
  );
};

export default TextReviewPanel;
