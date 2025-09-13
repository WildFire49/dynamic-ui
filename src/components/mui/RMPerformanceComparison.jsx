import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Search
} from '@mui/icons-material';

const RMPerformanceComparison = ({ 
  analysisResult, 
  selectedRMs, 
  setSelectedRMs 
}) => {
  const [topPerformersSearch, setTopPerformersSearch] = useState('');
  const [lowPerformersSearch, setLowPerformersSearch] = useState('');

  // Get all RMs from supporting data for infinite scroll
  const getAllRMsFromData = () => {
    if (!analysisResult?.analysis_result?.supporting_data) return [];
    
    return analysisResult.analysis_result.supporting_data
      .map(rm => ({
        id: rm.RM_ID || rm['R M I D'] || rm.id,
        name: rm.RM_Name || rm['R M Name'] || rm.name,
        target: parseFloat(rm.DB_Tar || rm.D_B_Target || rm['D B Target'] || rm.target || 0),
        achievement: parseFloat(rm.DB_Ach || rm.D_B_Achievement || rm['D B Achievement'] || rm.achievement || 0),
        get achievementRate() { return this.target > 0 ? (this.achievement / this.target) * 100 : 0; }
      }))
      .filter(rm => rm.name && rm.id)
      .sort((a, b) => b.achievementRate - a.achievementRate);
  };

  // Filter functions for search with infinite data
  const getFilteredTopPerformers = () => {
    const allRMs = getAllRMsFromData();
    const topPerformers = allRMs.filter(rm => rm.achievementRate > 0);
    
    return topPerformers.filter(rm =>
      rm.name.toLowerCase().includes(topPerformersSearch.toLowerCase())
    );
  };

  const getFilteredLowPerformers = () => {
    const allRMs = getAllRMsFromData();
    const lowPerformers = allRMs.filter(rm => rm.achievementRate === 0);
    
    return lowPerformers.filter(rm =>
      rm.name.toLowerCase().includes(lowPerformersSearch.toLowerCase())
    );
  };

  const handleToggleRM = (rmId) => {
    if (selectedRMs.includes(rmId)) {
      setSelectedRMs(selectedRMs.filter(id => id !== rmId));
    } else {
      setSelectedRMs([...selectedRMs, rmId]);
    }
  };

  const RMCard = ({ rm, isSelected, color, onToggle }) => (
    <Box key={rm.id} sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2,
      mb: 1,
      borderRadius: 2,
      backgroundColor: isSelected ? (color === 'success' ? '#f0fdf4' : '#fef2f2') : '#ffffff',
      border: isSelected ? `2px solid ${color === 'success' ? '#059669' : '#dc2626'}` : '1px solid #e5e7eb',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f8fafc',
        borderColor: color === 'success' ? '#059669' : '#dc2626'
      }
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {rm.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
          Target: ₹{rm.target}L
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Achievement: ₹{rm.achievement}L ({rm.achievementRate.toFixed(1)}%)
        </Typography>
      </Box>
      <Button
        variant={isSelected ? "contained" : "outlined"}
        size="small"
        color={isSelected ? (color === 'success' ? 'success' : 'error') : 'primary'}
        onClick={() => onToggle(rm.id)}
        sx={{ minWidth: '80px' }}
      >
        {isSelected ? 'Remove' : 'Add'}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ mt: 3, px: 1 }}>
      <Typography variant="h6" sx={{
        fontWeight: 600,
        mb: 3,
        fontSize: '1.25rem',
        textAlign: 'center'
      }}>
        RM Performance Comparison
      </Typography>
      
      <Grid container spacing={1} justifyContent="center">
        {/* Top Performers Search */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ 
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid #059669',
            borderRadius: 2
          }}>
            <Box sx={{ 
              p: 2,
              backgroundColor: '#f0fdf4',
              borderBottom: '1px solid #059669'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp sx={{ color: '#059669' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669' }}>
                  Top Performers ({getFilteredTopPerformers().length})
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Search RM by name..."
                value={topPerformersSearch}
                onChange={(e) => setTopPerformersSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#6b7280' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box sx={{ 
              flex: 1,
              overflowY: 'auto',
              p: 1
            }}>
              {getFilteredTopPerformers().map((rm) => (
                <RMCard 
                  key={rm.id}
                  rm={rm}
                  isSelected={selectedRMs.includes(rm.id)}
                  color="success"
                  onToggle={handleToggleRM}
                />
              ))}
              {getFilteredTopPerformers().length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No RMs found matching your search
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
        
        {/* Low Performers Search */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ 
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid #dc2626',
            borderRadius: 2
          }}>
            <Box sx={{ 
              p: 2,
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #dc2626'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingDown sx={{ color: '#dc2626' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626' }}>
                  Low Performers ({getFilteredLowPerformers().length})
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Search RM by name..."
                value={lowPerformersSearch}
                onChange={(e) => setLowPerformersSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#6b7280' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box sx={{ 
              flex: 1,
              overflowY: 'auto',
              p: 1
            }}>
              {getFilteredLowPerformers().map((rm) => (
                <RMCard 
                  key={rm.id}
                  rm={rm}
                  isSelected={selectedRMs.includes(rm.id)}
                  color="error"
                  onToggle={handleToggleRM}
                />
              ))}
              {getFilteredLowPerformers().length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No RMs found matching your search
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RMPerformanceComparison;
