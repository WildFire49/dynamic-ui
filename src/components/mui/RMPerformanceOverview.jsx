import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';

const RMPerformanceOverview = ({ chartData }) => {
  if (!chartData?.rmPerformanceData?.summary) {
    return null;
  }

  const { summary } = chartData.rmPerformanceData;

  return (
    <Card sx={{ 
      border: 'none',
      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 3,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      mb: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{
          fontWeight: 600,
          mb: 3,
          fontSize: '1.25rem',
          textAlign: 'center'
        }}>
          RM Performance Overview
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.875rem',
                mb: 0.5
              }}>
                {summary.totalTarget}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Total Target
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: '#059669',
                fontWeight: 700,
                fontSize: '1.875rem',
                mb: 0.5
              }}>
                {summary.totalAchievement}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Total Achievement
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: '#d97706',
                fontWeight: 700,
                fontSize: '1.875rem',
                mb: 0.5
              }}>
                {summary.achievementRate}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Achievement Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.875rem',
                mb: 0.5
              }}>
                {summary.activeRMs}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Active RMs
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RMPerformanceOverview;
