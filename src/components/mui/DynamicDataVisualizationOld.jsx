import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Skeleton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  FileDownload, 
  GetApp, 
  TableChart,
  CurrencyRupee,
  Download
} from '@mui/icons-material';

const DynamicDataVisualization = ({ 
  data = [],
  question = "Data Analysis",
  title = "Dynamic Dashboard",
  analysisResult = null,
  showPieChart = true,
  loading = false,
  uploadSuccess = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Export menu state
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Process data for visualizations
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => ({
      ...item,
      id: index
    }));
  }, [data]);

  // Generate pie chart data based on API response structure
  const pieChartData = useMemo(() => {
    if (!analysisResult?.analysis_result?.supporting_data) return [];
    
    const supportingData = analysisResult.analysis_result.supporting_data;
    if (supportingData.length === 0) return [];
    
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#8dd1e1', '#d084d0'];
    
    // Check what fields are available and create appropriate pie charts
    const firstItem = supportingData[0];
    const charts = [];
    
    // State-wise distribution
    if (firstItem.State !== undefined) {
      const stateCounts = {};
      supportingData.forEach(item => {
        const state = item.State || 'Unknown';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      });
      
      charts.push({
        title: 'State-wise Distribution',
        data: Object.entries(stateCounts).map(([state, count], index) => ({
          name: state,
          value: count,
          color: colors[index % colors.length]
        }))
      });
    }
    
    // Region-wise distribution
    if (firstItem.Region !== undefined) {
      const regionCounts = {};
      supportingData.forEach(item => {
        const region = item.Region || 'Unknown';
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      });
      
      charts.push({
        title: 'Region-wise Distribution',
        data: Object.entries(regionCounts).map(([region, count], index) => ({
          name: region,
          value: count,
          color: colors[index % colors.length]
        }))
      });
    }
    
    // Score range distribution
    if (firstItem.Total_Score !== undefined) {
      const scoreRanges = {
        'Critical (-1.0)': 0,
        'Poor (-0.9 to -0.8)': 0,
        'Below Average (-0.7 to -0.79)': 0
      };
      
      supportingData.forEach(item => {
        const score = item.Total_Score || 0;
        if (score === -1) {
          scoreRanges['Critical (-1.0)']++;
        } else if (score >= -0.9 && score < -0.8) {
          scoreRanges['Poor (-0.9 to -0.8)']++;
        } else if (score >= -0.7 && score < -0.8) {
          scoreRanges['Below Average (-0.7 to -0.79)']++;
        }
      });
      
      charts.push({
        title: 'Performance Score Distribution',
        data: Object.entries(scoreRanges)
          .filter(([_, count]) => count > 0)
          .map(([range, count], index) => ({
            name: range,
            value: count,
            color: ['#f44336', '#ff9800', '#ffc107'][index]
          }))
      });
    }
    
    // Pipeline pending data (legacy support)
    if (firstItem.pending !== undefined) {
      const regionTotals = {};
      supportingData.forEach(item => {
        const region = item.region || 'Unknown';
        regionTotals[region] = (regionTotals[region] || 0) + (item.pending || 0);
      });
      
      charts.push({
        title: 'Pipeline Pending by Region',
        data: Object.entries(regionTotals)
          .filter(([_, value]) => value > 0)
          .map(([region, total], index) => ({
            name: region,
            value: total,
            color: colors[index % colors.length]
          }))
      });
    }
    
    return charts;
  }, [analysisResult]);

  // Generate regional summary data for branch performance
  const regionalSummary = useMemo(() => {
    if (!analysisResult?.analysis_result?.supporting_data) return [];
    
    const supportingData = analysisResult.analysis_result.supporting_data;
    
    // Handle pipeline pending data structure (keep existing logic)
    if (supportingData.length > 0 && supportingData[0].pending !== undefined) {
      const regionTotals = {};
      
      supportingData.forEach(item => {
        const region = item.region || 'Unknown';
        if (!regionTotals[region]) {
          regionTotals[region] = 0;
        }
        regionTotals[region] += item.pending || 0;
      });
      
      return Object.entries(regionTotals)
        .filter(([_, value]) => value > 0)
        .map(([region, total]) => ({
          region,
          totalAmount: total,
          branchCount: supportingData.filter(item => (item.region || 'Unknown') === region).length
        }));
    }
    
    // Handle branch performance data - use region from API if available
    if (supportingData.length > 0 && supportingData[0].Total_Score !== undefined) {
      const regionStats = {};
      
      // Group by region from API data or extract from branch name
      supportingData.forEach(item => {
        let region = item.Region || item.region || 'Unknown';
        
        // If no region in API, try to extract from branch name
        if (region === 'Unknown' && item.Branch_Name_Cost_Centre) {
          const branchName = item.Branch_Name_Cost_Centre.toLowerCase();
          // Simple region detection based on common patterns
          if (branchName.includes('karnataka') || branchName.includes('bangalore') || branchName.includes('mysore')) {
            region = 'Karnataka';
          } else if (branchName.includes('maharashtra') || branchName.includes('mumbai') || branchName.includes('pune')) {
            region = 'Maharashtra';
          } else if (branchName.includes('gujarat') || branchName.includes('ahmedabad')) {
            region = 'Gujarat';
          } else if (branchName.includes('tamil') || branchName.includes('chennai')) {
            region = 'Tamil Nadu';
          } else if (branchName.includes('andhra') || branchName.includes('hyderabad')) {
            region = 'Andhra Pradesh';
          }
        }
        
        if (!regionStats[region]) {
          regionStats[region] = {
            region,
            branches: [],
            totalScore: 0,
            branchCount: 0,
            averageScore: 0
          };
        }
        
        regionStats[region].branches.push(item);
        regionStats[region].totalScore += item.Total_Score || 0;
        regionStats[region].branchCount++;
      });
      
      // Calculate averages and return all regions with data
      return Object.values(regionStats)
        .filter(region => region.branchCount > 0)
        .map(region => ({
          ...region,
          averageScore: region.branchCount > 0 ? (region.totalScore / region.branchCount).toFixed(2) : 0
        }));
    }
    
    return [];
  }, [analysisResult]);

  // Generate DataGrid columns and rows based on API response
  const { gridColumns, gridRows } = useMemo(() => {
    if (!analysisResult?.analysis_result?.supporting_data) {
      return { gridColumns: [], gridRows: [] };
    }

    const supportingData = analysisResult.analysis_result.supporting_data;
    if (supportingData.length === 0) return { gridColumns: [], gridRows: [] };

    const firstItem = supportingData[0];
    const columns = [];

    // Add State column if available
    if (firstItem.State !== undefined) {
      columns.push({
        field: 'State',
        headerName: 'State',
        width: 80,
        renderCell: (params) => (
          <Chip 
            label={params.value} 
            size="small"
            sx={{
              backgroundColor: params.value === 'KA' ? '#e3f2fd' : 
                              params.value === 'MH' ? '#f3e5f5' :
                              params.value === 'TN' ? '#fff3e0' : '#f5f5f5',
              color: params.value === 'KA' ? '#1976d2' : 
                     params.value === 'MH' ? '#7b1fa2' :
                     params.value === 'TN' ? '#f57c00' : '#616161',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        )
      });
    }

    // Add Region column if available
    if (firstItem.Region !== undefined) {
      columns.push({
        field: 'Region',
        headerName: 'Region',
        width: 100,
        renderCell: (params) => (
          <Chip 
            label={params.value} 
            size="small"
            sx={{
              backgroundColor: '#f0f4f8',
              color: '#2d3748',
              fontWeight: 500,
              fontSize: '0.7rem'
            }}
          />
        )
      });
    }

    // Add Branch Name column
    if (firstItem.Branch_Name_Cost_Centre !== undefined) {
      columns.push({
        field: 'Branch_Name_Cost_Centre',
        headerName: 'Branch Name',
        width: 180,
        flex: 1
      });
    }

    // Add Total Score column if available
    if (firstItem.Total_Score !== undefined) {
      columns.push({
        field: 'Total_Score',
        headerName: 'Total Score',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip 
            label={params.value}
            size="small"
            sx={{
              backgroundColor: params.value === -1 ? '#ffebee' : 
                              params.value >= -0.8 ? '#fff3e0' : '#f5f5f5',
              color: params.value === -1 ? '#d32f2f' : 
                     params.value >= -0.8 ? '#f57c00' : '#616161',
              fontWeight: 600,
              fontFamily: 'monospace'
            }}
          />
        )
      });
    }

    // Add any other numeric columns
    Object.keys(firstItem).forEach(key => {
      if (!['State', 'Region', 'Branch_Name_Cost_Centre', 'Total_Score'].includes(key) && 
          typeof firstItem[key] === 'number') {
        columns.push({
          field: key,
          headerName: key.replace(/_/g, ' '),
          width: 120,
          align: 'right',
          headerAlign: 'right'
        });
      }
    });

    const rows = supportingData.map((item, index) => ({
      id: index,
      ...item
    }));

    return { gridColumns: columns, gridRows: rows };
  }, [analysisResult]);

  // Export functions
  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportToCSV = () => {
    if (!gridRows.length) return;
    
    const headers = gridColumns.map(col => col.headerName).join(',');
    const csvContent = [
      headers,
      ...gridRows.map(row => 
        gridColumns.map(col => row[col.field] || '').join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!gridRows.length) return;
    
    const jsonContent = JSON.stringify(gridRows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-results.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // For now, export as CSV (can be enhanced with actual Excel export library)
    exportToCSV();
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Skeleton variant="text" width={200} height={32} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" height={400} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Upload success card
  if (uploadSuccess && !analysisResult) {
    return (
      <Box sx={{ width: '100%' }}>
        <Card sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)',
          border: '1px solid #4caf50',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
            animation: 'shimmer 2s ease-in-out infinite'
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          },
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(-10px)' },
            '60%': { transform: 'translateY(-5px)' }
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Excel Icon with Animation */}
              <Box 
                sx={{ 
                  position: 'relative',
                  animation: 'bounce 1s ease-in-out'
                }}
              >
                <Box
                  component="img"
                  src="/excel.png"
                  alt="Excel File"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                {/* Success Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 24,
                    height: 24,
                    backgroundColor: '#4caf50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>
                    ✓
                  </Typography>
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#2e7d32', 
                    mb: 1,
                    background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  File Uploaded Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Your Excel file has been processed and is ready for analysis.
                </Typography>
                
                {/* File Details */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label="Excel Format"
                    size="small"
                    sx={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      fontWeight: 500
                    }}
                  />
                  <Chip
                    label="Ready for Analysis"
                    size="small"
                    sx={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // No data state
  if (!analysisResult?.analysis_result?.supporting_data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No analysis data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Analysis Insights Card */}
      {analysisResult?.analysis_result?.analysis && (
        <Card sx={{ mb: 3, border: '1px solid #e3f2fd' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 48,
                height: 48,
                backgroundColor: '#2196f3',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h6">💡</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1565c0' }}>
                  Analysis Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Key findings from your data
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analysisResult.analysis_result.analysis.map((insight, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Box sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#2196f3',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.5
                  }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      {index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {insight}
                  </Typography>
                </Box>
              ))}

        {/* Pie Charts Section */}
        {pieChartData.length > 0 && pieChartData.map((chart, chartIndex) => (
          <Grid item xs={12} md={6} key={chartIndex}>
            <Card sx={{ height: '100%', minHeight: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {chart.title}
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ChartContainer
                    config={{
                      ...chart.data.reduce((acc, item, index) => ({
                        ...acc,
                        [item.name]: {
                          label: item.name,
                          color: item.color,
                        },
                      }), {})
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={chart.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chart.data.map((entry, index) => (
                          <Cell key={`cell-${chartIndex}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Regional Summary Cards */}
        {regionalSummary.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Regional Performance Summary
                </Typography>
                <Grid container spacing={2}>
                  {regionalSummary.map((region, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ 
                        border: '1px solid #e5e7eb',
                        backgroundColor: region.averageScore < -0.5 ? '#fef2f2' : '#f8fafc',
                        borderLeft: `4px solid ${region.averageScore < -0.5 ? '#ef4444' : '#3b82f6'}`
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ 
                            fontSize: '1rem', 
                            fontWeight: 600, 
                            color: '#374151',
                            mb: 1
                          }}>
                            {region.region}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Branches:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {region.branchCount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Avg Score:
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600,
                              color: region.averageScore < -0.5 ? '#ef4444' : '#059669'
                            }}>
                              {region.averageScore}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

      {/* DataGrid */}
      {gridRows.length > 0 && (
        <Card sx={{ mb: 1, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              px: 2, 
              py: 1.5,
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>
                Analysis Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={`${gridRows.length} records`} 
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 24
                  }}
                  size="small"
                />
                <Tooltip title="Export Data">
                  <IconButton onClick={handleExportClick} size="small" sx={{ p: 0.5 }}>
                    <FileDownload sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: 450, width: '100%' }}>
              <DataGrid
                rows={gridRows}
                columns={gridColumns}
                pageSize={15}
                rowsPerPageOptions={[10, 15, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
                density="compact"
                components={{
                  Toolbar: GridToolbar,
                }}
                componentsProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    minHeight: '40px !important',
                    maxHeight: '40px !important'
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.8rem',
                    padding: '4px 8px'
                  },
                  '& .MuiDataGrid-row': {
                    minHeight: '35px !important',
                    maxHeight: '35px !important'
                  },
                  '& .MuiDataGrid-toolbarContainer': {
                    padding: '8px',
                    minHeight: '48px'
                  },
                  '& .MuiDataGrid-footerContainer': {
                    minHeight: '40px'
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Menu
          anchorEl={exportAnchorEl}
          open={exportMenuOpen}
          onClose={handleExportClose}
        >
          <MenuItem onClick={() => { exportToCSV(); handleExportClose(); }}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { exportToJSON(); handleExportClose(); }}>
            <ListItemIcon>
              <GetApp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as JSON</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { exportToExcel(); handleExportClose(); }}>
            <ListItemIcon>
              <FileDownload fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
        </Menu>
      </Grid>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { exportToJSON(); handleExportClose(); }}>
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { exportToExcel(); handleExportClose(); }}>
          <ListItemIcon>
            <FileDownload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DynamicDataVisualization;
