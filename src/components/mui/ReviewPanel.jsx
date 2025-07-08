import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

const ReviewPanel = ({ title, reviewItems, sx }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{
        p: 3,
        width: '100%',
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...sx
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        {title || 'Please Review Your Details'}
      </Typography>
      <Grid container spacing={2}>
        {reviewItems && reviewItems.map((item, index) => (
          <React.Fragment key={index}>
            <Grid item xs={5}>
              <Typography variant="body1" color="text.secondary">{item.label}</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{item.value}</Typography>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Paper>
  );
};

export default ReviewPanel;
