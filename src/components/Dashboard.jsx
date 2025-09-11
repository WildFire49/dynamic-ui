import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const Dashboard = () => {
  const [savedVisualizations, setSavedVisualizations] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, item: null });
  const [fullscreenView, setFullscreenView] = useState({ open: false, item: null });

  // Load saved visualizations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardVisualizations');
    if (saved) {
      try {
        setSavedVisualizations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved visualizations:', error);
      }
    }
  }, []);

  // Save visualizations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardVisualizations', JSON.stringify(savedVisualizations));
  }, [savedVisualizations]);

  const handleDeleteVisualization = (id) => {
    setSavedVisualizations(prev => prev.filter(item => item.id !== id));
  };

  const handleEditTitle = (id, newTitle) => {
    setSavedVisualizations(prev => 
      prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
    setEditDialog({ open: false, item: null });
  };

  const renderChart = (chartData, type) => {
    if (!chartData || !chartData.data) return null;

    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                outerRadius="70%"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="region" 
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip />
              <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'branch':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.data.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="branch" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                domain={[-1.1, 0]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <ChartTooltip 
                formatter={(value) => [`Score: ${value}`, 'Performance']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.fullName || label} (${data.region}, ${data.state})`;
                  }
                  return label;
                }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.data.slice(0, 15).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const renderVisualizationCard = (item) => (
    <Card key={item.id} sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        {/* Header with title and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {item.title}
          </Typography>
          <Box>
            <Tooltip title="Edit Title">
              <IconButton onClick={() => setEditDialog({ open: true, item })}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton onClick={() => setFullscreenView({ open: true, item })}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDeleteVisualization(item.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Saved on {new Date(item.timestamp).toLocaleString()}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Charts */}
          {item.charts.pieChart && (
            <Card sx={{ p: 3, height: 520, display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                {item.charts.pieChart.title}
              </Typography>
              <Box sx={{ flex: 1, minHeight: 450, width: '100%' }}>
                {renderChart(item.charts.pieChart, 'pie')}
              </Box>
            </Card>
          )}
          
          {item.charts.barChart && (
            <Card sx={{ p: 3, height: 520, display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                {item.charts.barChart.title}
              </Typography>
              <Box sx={{ flex: 1, minHeight: 450, width: '100%' }}>
                {renderChart(item.charts.barChart, 'bar')}
              </Box>
            </Card>
          )}
          
          {item.charts.branchChart && (
            <Card sx={{ p: 3, height: 520, display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                {item.charts.branchChart.title}
              </Typography>
              <Box sx={{ flex: 1, minHeight: 450, width: '100%' }}>
                {renderChart(item.charts.branchChart, 'branch')}
              </Box>
            </Card>
          )}
        </Box>

        {/* Data Table */}
        {item.dataGrid && item.dataGrid.gridRows.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Data Table ({item.dataGrid.gridRows.length} records)
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={item.dataGrid.gridRows}
                columns={item.dataGrid.gridColumns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 25]}
                disableSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.875rem'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fafc'
                  },
                  '& .MuiDataGrid-footerContainer': {
                    minHeight: '40px'
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your saved visualizations and data tables from analysis sessions
        </Typography>
      </Box>

      {/* Visualizations */}
      {savedVisualizations.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No saved visualizations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Use the "Save to Dashboard" button in your analysis to save charts and tables here.
          </Typography>
        </Card>
      ) : (
        savedVisualizations.map(renderVisualizationCard)
      )}

      {/* Edit Title Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, item: null })}>
        <DialogTitle>Edit Visualization Title</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            defaultValue={editDialog.item?.title || ''}
            sx={{ mt: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEditTitle(editDialog.item?.id, e.target.value);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, item: null })}>Cancel</Button>
          <Button 
            onClick={(e) => {
              const input = e.target.closest('.MuiDialog-root').querySelector('input');
              handleEditTitle(editDialog.item?.id, input.value);
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen View Dialog */}
      <Dialog 
        open={fullscreenView.open} 
        onClose={() => setFullscreenView({ open: false, item: null })}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          {fullscreenView.item?.title}
          <IconButton
            onClick={() => setFullscreenView({ open: false, item: null })}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            ×
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {fullscreenView.item && renderVisualizationCard(fullscreenView.item)}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
