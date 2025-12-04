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
  autoGenerateColumns = true, // New prop to auto-generate columns
  variant = "card" // 'card' | 'clean'
}) => {
  // Generate columns and rows dynamically if data is provided
  const { processedRows, processedColumns } = useMemo(() => {
    let finalRows = rows;
    let finalColumns = columns;

    // If data is provided and autoGenerateColumns is true, generate everything dynamically
    if (data && autoGenerateColumns && data.length > 0) {
      // Generate columns from the first data item
      // ... (existing column generation logic) ...
      const firstItem = data[0];
      const generatedColumns = Object.keys(firstItem).map((key, index) => ({
        field: key,
        headerName: key
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '),
        width: 140,
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
    } else if (rows.length > 0 && autoGenerateColumns && columns.length === 0) {
        // Auto-generate columns from rows if columns prop is empty but rows are provided
        const firstItem = rows[0];
        finalColumns = Object.keys(firstItem).filter(key => key !== 'id').map((key) => ({
            field: key,
            headerName: key.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
            flex: 1,
            minWidth: 140,
            width: 180,
        }));
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

  // Ensure all rows have an id
  const rowsWithIds = useMemo(() => {
    return processedRows.map((row, index) => ({
      id: row.id ?? `row-${index}`,
      ...row,
    }));
  }, [processedRows]);

  if (variant === 'clean') {
    return (
      <Box sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
        <DataGrid
          rows={rowsWithIds}
          columns={processedColumns}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableSelectionOnClick
          density="standard" // Use standard density for better readability
          sx={{
            border: 'none',
            fontSize: '0.875rem',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #E5E7EB',
              fontSize: '0.875rem',
              padding: '10px 12px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#F9FAFB',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F8FAFC',
              borderBottom: '2px solid #E5E7EB',
              minHeight: '44px !important',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '10px 12px',
            },
            '& .MuiDataGrid-columnHeaderTitleContainer': {
              justifyContent: 'center',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #E5E7EB',
              minHeight: '44px !important',
              backgroundColor: '#FAFAFA',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.8125rem',
              color: '#6B7280',
            },
            '& .MuiDataGrid-virtualScroller': {
              minHeight: 180,
            },
          }}
        />
      </Box>
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
        {/* Header - Only show when title is provided */}
        {title && (
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            pb: { xs: 1.5, sm: 2 },
            borderBottom: '1px solid #f3f4f6',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#1a1a1a',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                letterSpacing: '-0.025em'
              }}>
                {title} ({processedRows.length} {processedRows.length === 1 ? 'record' : 'records'})
              </Typography>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 1.5 },
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              {showSaveButton && onSave && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<TableChart />}
                  onClick={onSave}
                  sx={{ 
                    textTransform: 'none',
                    backgroundColor: '#0078d7',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 500,
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      backgroundColor: '#005a9e'
                    }
                  }}
                >
                  Save
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
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 500,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                Download Report
              </Button>
            </Box>
          </Box>
        )}

        {/* Data Grid */}
        <Box sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ height: height, width: '100%' }}>
            <DataGrid
              rows={rowsWithIds}
              columns={processedColumns}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  padding: { xs: '8px', sm: '12px' }
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8fafc',
                  fontWeight: 600,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  overflow: 'visible',
                  lineHeight: '1.2',
                  whiteSpace: 'normal'
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
