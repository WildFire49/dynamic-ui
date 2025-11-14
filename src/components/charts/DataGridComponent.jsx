import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { TableChart, FileDownload } from '@mui/icons-material';

const DataGridComponent = ({ 
  rows = [], 
  columns = [], 
  title = "Data Table",
  showSaveButton = false,
  onSave,
  onExport,
  height = 400,
  data = null, // New prop for dynamic data
  autoGenerateColumns = true // New prop to auto-generate columns
}) => {
  // Generate columns and rows dynamically if data is provided
  const { processedRows, processedColumns } = useMemo(() => {
    let finalRows = rows;
    let finalColumns = columns;

    // If data is provided and autoGenerateColumns is true, generate everything dynamically
    if (data && autoGenerateColumns && data.length > 0) {
      // Generate columns from the first data item
      const firstItem = data[0];
      const generatedColumns = Object.keys(firstItem).map((key, index) => ({
        field: key,
        headerName: key
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '),
        width: 150,
        flex: 1,
        minWidth: 120,
        renderCell: (params) => {
          const value = params.value;
          
          // Handle null/undefined
          if (value === null || value === undefined) {
            return '—';
          }
          
          // Handle numbers with proper formatting
          if (typeof value === 'number') {
            // Check if it's likely a currency or large number
            if (Math.abs(value) >= 1000) {
              return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
            }
            return value.toLocaleString();
          }
          
          // Handle dates (ISO format like "2024-10-01T00:00:00+00:00")
          if (typeof value === 'string') {
            // Check for ISO date format or date-like strings
            const isoDatePattern = /^\d{4}-\d{2}-\d{2}T/;
            const datePattern = /^\d{4}-\d{2}-\d{2}/;
            
            if (isoDatePattern.test(value) || datePattern.test(value)) {
              try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  // For month columns, show "Mon YYYY" format
                  if (key.toLowerCase().includes('month')) {
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    });
                  }
                  // For other dates, show full date
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  });
                }
              } catch (e) {
                // If date parsing fails, return as is
                return value;
              }
            }
          }
          
          return value;
        }
      }));
      
      // Generate rows with IDs
      const generatedRows = data.map((item, index) => ({
        id: index + 1,
        ...item
      }));
      
      finalColumns = generatedColumns;
      finalRows = generatedRows;
    }

    return {
      processedRows: finalRows,
      processedColumns: finalColumns
    };
  }, [data, rows, columns, autoGenerateColumns]);

  // Export to CSV function
  const handleExportToCSV = () => {
    if (processedRows.length === 0) return;
    
    // Create CSV headers
    const headers = processedColumns.map(col => col.headerName || col.field).join(',');
    
    // Create CSV rows
    const csvRows = processedRows.map(row => 
      processedColumns.map(col => {
        const value = row[col.field];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    // Combine headers and rows
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!processedRows || processedRows.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No data available for table
      </Typography>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: height + 200,
      border: 'none',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: '1px solid #f3f4f6',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: '#1a1a1a',
              fontSize: '1.125rem',
              letterSpacing: '-0.025em'
            }}>
              {title} ({processedRows.length} records)
            </Typography>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {showSaveButton && onSave && (
              <Button
                variant="contained"
                size="small"
                startIcon={<TableChart />}
                onClick={onSave}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Save to Dashboard
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownload />}
              onClick={onExport || handleExportToCSV}
              sx={{ 
                textTransform: 'none',
                borderColor: '#d1d5db',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Data Grid */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ height: height, width: '100%' }}>
            <DataGrid
              rows={processedRows}
              columns={processedColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8fafc',
                  fontWeight: 600
                },
                '& .MuiDataGrid-footerContainer': {
                  minHeight: '52px',
                  backgroundColor: '#fafafa'
                },
                '& .MuiDataGrid-root': {
                  border: 'none'
                }
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataGridComponent;
