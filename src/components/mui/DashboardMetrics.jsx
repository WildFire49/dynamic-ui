import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

const DashboardMetrics = ({ title, metrics, sx }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{
        p: 3,
        width: '100%',
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.15))',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        ...sx
      }}
    >
      {title && (
        <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={2}>
        {(metrics || []).map((metric, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                {metric.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
            </Box>
            {index < metrics.length - 1 && <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default DashboardMetrics;
