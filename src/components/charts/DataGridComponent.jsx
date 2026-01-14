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

// Common acronyms that should stay uppercase in headers
const ACRONYMS = ['MTD', 'LMTD', 'FTD', 'OTR', 'NPA', 'SMA', 'INR', 'ID', 'KYC', 'API', 'URL', 'PCT', 'YTD', 'QTD', 'EMI', 'ROI', 'POS', 'DPD', 'BANK', 'LACS'];

// Format column header with proper casing
const formatHeaderName = (key) => {
  // First replace underscores with spaces
  let result = key.replace(/_/g, ' ');
  
  // Only add spaces before uppercase letters if they follow lowercase letters (camelCase)
  // This prevents "INR" from becoming "I N R"
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  return result
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => {
      const upperWord = word.toUpperCase();
      // Keep acronyms uppercase
      if (ACRONYMS.includes(upperWord)) {
        return upperWord;
      }
      // Regular word - capitalize first letter only
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

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
  variant = "card", // 'card' | 'clean'
  useInfiniteScroll = false // New prop for infinite scroll
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
      const generatedColumns = Object.keys(firstItem).map((key, index) => {
        const val = firstItem[key];
        
        // Determine column types based on key name and value
        const lowerKey = key.toLowerCase();
        
        // Identify amount/numeric columns by name
        const isAmountColumn = lowerKey.includes('amount') || 
                               lowerKey.includes('demand') || 
                               lowerKey.includes('collected') || 
                               lowerKey.includes('balance') || 
                               lowerKey.includes('price') || 
                               lowerKey.includes('cost') ||
                               lowerKey.includes('target') ||
                               lowerKey.includes('disbursed') ||
                               lowerKey.includes('outstanding') ||
                               lowerKey.includes('count') ||
                               lowerKey.includes('number');
                               
        // Identify percentage columns
        const isPercentageColumn = lowerKey.includes('percent') || 
                                   lowerKey.includes('achievement') || 
                                   lowerKey.includes('rate') ||
                                   key.includes('%');
                                   
        // Check if value is numeric
        const isValueNumeric = typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !isNaN(parseFloat(val)));
        
        // Final check for numeric column (for alignment)
        const isNumber = isValueNumeric || isAmountColumn || isPercentageColumn;
        
        const headerName = formatHeaderName(key);
        
        return {
          field: key,
          headerName: headerName,
          width: 140,
          flex: 1,
          minWidth: 120,
          align: isNumber ? 'right' : 'left',
          headerAlign: isNumber ? 'right' : 'left',
          renderCell: (params) => {
            const value = params.value;
            
            // Handle null/undefined
            if (value === null || value === undefined) {
              return '—';
            }
            
            // Try to parse string numbers
            let numValue = value;
            let isValidNumber = typeof value === 'number';
            
            if (typeof value === 'string') {
              // Check if it's a valid number string (and not a date string)
              const parsed = Number(value);
              if (!isNaN(parsed) && !isNaN(parseFloat(value)) && value.trim() !== '') {
                // Avoid formatting IDs or codes that might start with 0
                if (!key.toLowerCase().endsWith('id') && !key.toLowerCase().includes('code')) {
                  numValue = parsed;
                  isValidNumber = true;
                }
              }
            }
            
            // Handle numbers with proper formatting
            if (isValidNumber) {
              // Add % symbol for percentage columns
              if (isPercentageColumn) {
                return `${numValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
              }
              // Format numbers: only show up to 2 decimal places if they exist
              return numValue.toLocaleString('en-IN', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 2 
              });
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
      };
    });
      
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
        finalColumns = Object.keys(firstItem).filter(key => key !== 'id').map((key) => {
            const val = firstItem[key];
            
            // Determine column types based on key name and value
            const lowerKey = key.toLowerCase();
            
            // Identify amount/numeric columns by name
            const isAmountColumn = lowerKey.includes('amount') || 
                                   lowerKey.includes('demand') || 
                                   lowerKey.includes('collected') || 
                                   lowerKey.includes('balance') || 
                                   lowerKey.includes('price') || 
                                   lowerKey.includes('cost') ||
                                   lowerKey.includes('target') || 
                                   lowerKey.includes('disbursed') ||
                                   lowerKey.includes('outstanding') ||
                                   lowerKey.includes('count') ||
                                   lowerKey.includes('number');
                                   
            // Identify percentage columns
            const isPercentageColumn = lowerKey.includes('percent') || 
                                       lowerKey.includes('achievement') || 
                                       lowerKey.includes('rate') ||
                                       key.includes('%');
                                       
            // Check if value is numeric
            const isValueNumeric = typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !isNaN(parseFloat(val)));
            
            // Final check for numeric column (for alignment)
            const isNumber = isValueNumeric || isAmountColumn || isPercentageColumn;
            
            const headerName = formatHeaderName(key);
            
            return {
                field: key,
                headerName: headerName,
                flex: 1,
                minWidth: 140,
                width: 180,
                align: isNumber ? 'right' : 'left',
                headerAlign: isNumber ? 'right' : 'left',
                renderCell: (params) => {
                    const value = params.value;
                    
                    // Handle null/undefined
                    if (value === null || value === undefined) {
                        return '—';
                    }
                    
                    // Try to parse string numbers
                    let numValue = value;
                    let isValidNumber = typeof value === 'number';
                    
                    if (typeof value === 'string') {
                        // Check if it's a valid number string (and not a date string)
                        const parsed = Number(value);
                        if (!isNaN(parsed) && !isNaN(parseFloat(value)) && value.trim() !== '') {
                            // Avoid formatting IDs or codes that might start with 0
                            if (!key.toLowerCase().endsWith('id') && !key.toLowerCase().includes('code')) {
                                numValue = parsed;
                                isValidNumber = true;
                            }
                        }
                    }
                    
                    // Handle numbers with proper formatting
                    if (isValidNumber) {
                        // Add % symbol for percentage columns
                        if (isPercentageColumn) {
                            return `${numValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
                        }
                        // Format all numbers to up to 2 decimal places as requested
                        return numValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                    }
                    
                    // Handle dates (ISO format like "2024-10-01T00:00:00+00:00")
                    if (typeof value === 'string') {
                        const isoDatePattern = /^\d{4}-\d{2}-\d{2}T/;
                        const datePattern = /^\d{4}-\d{2}-\d{2}/;
                        
                        if (isoDatePattern.test(value) || datePattern.test(value)) {
                            try {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    if (key.toLowerCase().includes('month')) {
                                        return date.toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            year: 'numeric' 
                                        });
                                    }
                                    return date.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric' 
                                    });
                                }
                            } catch (e) {
                                return value;
                            }
                        }
                    }
                    
                    return value;
                }
            };
        });
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
      <Box sx={{ 
        height: '100%', 
        width: '100%',
        minWidth: 0,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <DataGrid
          rows={rowsWithIds}
          columns={processedColumns}
          getRowId={(row) => row.id}
          autoHeight={rowsWithIds.length <= 10}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: useInfiniteScroll ? 100 : 10 },
            },
          }}
          pageSizeOptions={useInfiniteScroll ? [100, 500, 1000] : [10, 25, 50, 100]}
          disableSelectionOnClick
          density="comfortable"
          hideFooterPagination={useInfiniteScroll}
          scrollbarSize={10}
          sx={{
            border: 'none',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            '& .MuiDataGrid-main': {
              // Remove overflow to prevent double scrollbar
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #E2E8F0',
              borderRight: '1px solid #E2E8F0',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              padding: { xs: '8px 10px', sm: '12px 16px' },
              color: '#1E293B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              minHeight: { xs: '44px', sm: '52px' },
            },
            '& .MuiDataGrid-cell[data-field]': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(even)': {
                backgroundColor: '#FAFBFC',
              },
              '&:hover': {
                backgroundColor: '#EEF2FF',
                transform: 'scale(1.001)',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.08)',
                transition: 'all 0.2s ease',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F8FAFC',
              borderBottom: '2px solid #E2E8F0',
              minHeight: { xs: '44px !important', sm: '52px !important' },
              maxHeight: { xs: '44px !important', sm: '52px !important' },
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: { xs: '8px 10px', sm: '12px 16px' },
              borderRight: '1px solid #E2E8F0',
              '&:last-child': {
                borderRight: 'none',
              },
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-columnHeaderTitleContainer': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: { xs: '0.7rem', sm: '0.85rem' },
              color: '#1E293B',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #E2E8F0',
              minHeight: '44px !important',
              backgroundColor: '#FAFBFC',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.8125rem',
              color: '#64748B',
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
      borderRadius: 3
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
        <Box sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 }, minWidth: 0 }}>
          <Box sx={{ width: '100%', minHeight: 200 }}>
            <DataGrid
              rows={rowsWithIds}
              columns={processedColumns}
              getRowId={(row) => row.id}
              autoHeight={true}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-main': {
                  // Remove overflow to prevent double scrollbar
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #E2E8F0',
                  borderRight: '1px solid #E2E8F0',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  padding: { xs: '10px', sm: '12px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
                '& .MuiDataGrid-row': {
                  '&:nth-of-type(even)': {
                    backgroundColor: '#FAFBFC',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F1F5F9',
                  borderBottom: '2px solid #E2E8F0',
                  fontWeight: 700,
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  minHeight: '52px !important',
                  maxHeight: '52px !important',
                },
                '& .MuiDataGrid-columnHeader': {
                  borderRight: '1px solid #E2E8F0',
                  padding: '12px 14px',
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .MuiDataGrid-columnHeaderTitleContainer': {
                  overflow: 'hidden',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  color: '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-footerContainer': {
                  minHeight: '44px',
                  backgroundColor: '#FAFBFC',
                  borderTop: '1px solid #E2E8F0',
                },
                '& .MuiDataGrid-virtualScroller': {
                  // Subtle scrollbar
                  '&::-webkit-scrollbar': { width: 6, height: 6 },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: 3 },
                  '&::-webkit-scrollbar-thumb:hover': { background: '#CBD5E1' },
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#E2E8F0 transparent',
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
