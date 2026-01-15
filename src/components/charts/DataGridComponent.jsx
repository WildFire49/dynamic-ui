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

// Helper function to check if a value has decimal places
const hasDecimals = (val) => {
  if (typeof val === 'number') {
    return val % 1 !== 0;
  }
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return !isNaN(num) && num % 1 !== 0;
  }
  return false;
};

// Helper function to check if any value in a column has decimals
const columnHasDecimals = (key, dataArray) => {
  return dataArray.some(item => {
    const val = item[key];
    return val !== null && val !== undefined && hasDecimals(val);
  });
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
        
        // Check if this is a Productivity column (for icon rendering)
        const isProductivity = key.toLowerCase() === 'productivity';
        
        // Check if any value in this column has decimals
        const hasDecimalsInColumn = isNumber && columnHasDecimals(key, data);
        
        const headerName = formatHeaderName(key);
        
        return {
          field: key,
          headerName: headerName,
          width: 140,
          flex: 1,
          minWidth: 120,
          align: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
          headerAlign: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
          renderCell: (params) => {
            const value = params.value;
            
            // Handle null/undefined
            if (value === null || value === undefined) {
              return '—';
            }
            
            // Handle Productivity column with icons
            if (typeof value === 'string' && key.toLowerCase() === 'productivity') {
              const upperValue = value.toUpperCase().trim();
              const isNonProductive = upperValue === 'ZERO PRODUCTIVITY' || upperValue === 'NONE';
              const isProductive = upperValue === 'WORK DONE' || upperValue === 'COLL';
              
              if (isNonProductive || isProductive) {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <img
                      src={isNonProductive ? '/non-productive.png' : '/productive.svg'}
                      alt={value}
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                  </Box>
                );
              }
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
              // If column has any decimals, format all values with 2 decimal places
              const formatOptions = hasDecimalsInColumn 
                ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                : { minimumFractionDigits: 0, maximumFractionDigits: 2 };
              
              // Add % symbol for percentage columns
              if (isPercentageColumn) {
                return `${numValue.toLocaleString('en-IN', formatOptions)}%`;
              }
              // Format numbers
              return numValue.toLocaleString('en-IN', formatOptions);
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
            
            // Check if this is a Productivity column (for icon rendering)
            const isProductivity = key.toLowerCase() === 'productivity';
            
            // Check if any value in this column has decimals
            const hasDecimalsInColumn = isNumber && columnHasDecimals(key, rows);
            
            const headerName = formatHeaderName(key);
            
            return {
                field: key,
                headerName: headerName,
                flex: 1,
                minWidth: 140,
                width: 180,
                align: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
                headerAlign: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
                renderCell: (params) => {
                    const value = params.value;
                    
                    // Handle null/undefined
                    if (value === null || value === undefined) {
                        return '—';
                    }
                    
                    // Handle Productivity column with icons
                    if (typeof value === 'string' && key.toLowerCase() === 'productivity') {
                        const upperValue = value.toUpperCase().trim();
                        const isNonProductive = upperValue === 'ZERO PRODUCTIVITY' || upperValue === 'NONE';
                        const isProductive = upperValue === 'WORK DONE' || upperValue === 'COLL';
                        
                        if (isNonProductive || isProductive) {
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                    <img
                                        src={isNonProductive ? '/non-productive.png' : '/productive.svg'}
                                        alt={value}
                                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                    />
                                </Box>
                            );
                        }
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
                        // If column has any decimals, format all values with 2 decimal places
                        const formatOptions = hasDecimalsInColumn 
                          ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          : { minimumFractionDigits: 0, maximumFractionDigits: 2 };
                        
                        // Add % symbol for percentage columns
                        if (isPercentageColumn) {
                            return `${numValue.toLocaleString('en-IN', formatOptions)}%`;
                        }
                        // Format numbers
                        return numValue.toLocaleString('en-IN', formatOptions);
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
            bgcolor: '#FFFFFF',
            // Remove all blue colors from DataGrid
            '& .MuiDataGrid-root': {
              '--DataGrid-containerBackground': '#FFFFFF',
              '--DataGrid-rowSelectedBackground': '#F8F9FA',
              '--DataGrid-rowSelectedHoverBackground': '#F1F3F5',
            },
            '& .MuiDataGrid-main': {
              // Remove overflow to prevent double scrollbar
            },
            // Override any blue selection colors
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: '#F8F9FA !important',
              '&:hover': {
                backgroundColor: '#F1F3F5 !important',
              },
            },
            '& .MuiCheckbox-root': {
              color: '#6C757D !important',
              '&.Mui-checked': {
                color: '#495057 !important',
              },
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #F1F3F5',
              borderRight: '1px solid #F1F3F5',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              padding: { xs: '12px 14px', sm: '14px 18px' },
              color: '#212529',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 400,
              minHeight: { xs: '48px', sm: '56px' },
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            },
            '& .MuiDataGrid-cell[data-field]': {
              display: 'flex',
              alignItems: 'center',
            },
            // Right-align numeric cells
            '& .MuiDataGrid-cell--textRight': {
              justifyContent: 'flex-end',
            },
            // Center-align cells (for icons)
            '& .MuiDataGrid-cell--textCenter': {
              justifyContent: 'center',
            },
            '& .MuiDataGrid-row': {
              bgcolor: '#FFFFFF',
              '&:nth-of-type(even)': {
                backgroundColor: '#FAFBFC',
              },
              '&:hover': {
                backgroundColor: '#F8F9FA',
                '& .MuiDataGrid-cell': {
                  color: '#0D1117',
                  fontWeight: 500,
                },
              },
              transition: 'background-color 0.15s ease',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F8F9FA !important',
              borderBottom: '2px solid #E9ECEF',
              minHeight: { xs: '48px !important', sm: '56px !important' },
              maxHeight: { xs: '48px !important', sm: '56px !important' },
              boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.05)',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: { xs: '12px 14px', sm: '14px 18px' },
              borderRight: '1px solid #E9ECEF',
              backgroundColor: '#F8F9FA !important',
              '&:last-child': {
                borderRight: 'none',
              },
              '&:focus': {
                outline: 'none',
                backgroundColor: '#F8F9FA !important',
              },
              '&:focus-within': {
                backgroundColor: '#F8F9FA !important',
              },
              '&:hover': {
                backgroundColor: '#F1F3F5 !important',
              },
              '&.Mui-selected': {
                backgroundColor: '#F8F9FA !important',
              },
            },
            '& .MuiDataGrid-iconButtonContainer': {
              '& .MuiIconButton-root': {
                color: '#6C757D !important',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: '#495057 !important',
                },
              },
            },
            '& .MuiDataGrid-sortIcon': {
              color: '#6C757D !important',
            },
            '& .MuiDataGrid-columnHeaderTitleContainer': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              color: '#495057',
              letterSpacing: '0.01em',
              textTransform: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #E9ECEF',
              minHeight: '52px !important',
              backgroundColor: '#FFFFFF',
              borderTopWidth: '2px',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.8125rem',
              color: '#6C757D',
              fontWeight: 400,
              '& .MuiIconButton-root': {
                color: '#6C757D !important',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: '#495057 !important',
                },
                '&.Mui-disabled': {
                  color: '#DEE2E6 !important',
                },
              },
            },
            '& .MuiDataGrid-virtualScroller': {
              minHeight: 180,
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              bgcolor: '#FFFFFF',
            },
            // Modern scrollbar styling
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
              background: '#F8F9FA',
              borderRadius: '4px',
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
              background: '#DEE2E6',
              borderRadius: '4px',
              '&:hover': {
                background: '#CED4DA',
              },
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
      border: '1px solid #E9ECEF',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      borderRadius: 2,
      bgcolor: '#FFFFFF',
      overflow: 'hidden',
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header - Only show when title is provided */}
        {title && (
          <Box sx={{ 
            p: { xs: 2, sm: 2.5 }, 
            pb: { xs: 1.5, sm: 2 },
            borderBottom: '1px solid #E9ECEF',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            bgcolor: '#F8F9FA',
          }}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#212529',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                mb: 0.5,
              }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{
                color: '#6C757D',
                fontSize: '0.75rem',
                fontWeight: 400,
              }}>
                {processedRows.length} {processedRows.length === 1 ? 'record' : 'records'}
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
                    backgroundColor: '#212529',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 500,
                    width: { xs: '100%', sm: 'auto' },
                    borderRadius: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#0D1117'
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
                  borderColor: '#DEE2E6',
                  color: '#495057',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 500,
                  width: { xs: '100%', sm: 'auto' },
                  borderRadius: 1.5,
                  px: 2,
                  bgcolor: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#ADB5BD',
                    backgroundColor: '#F8F9FA',
                    color: '#212529',
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
                bgcolor: '#FFFFFF',
                // Remove all blue colors from DataGrid
                '& .MuiDataGrid-root': {
                  '--DataGrid-containerBackground': '#FFFFFF',
                  '--DataGrid-rowSelectedBackground': '#F8F9FA',
                  '--DataGrid-rowSelectedHoverBackground': '#F1F3F5',
                },
                '& .MuiDataGrid-main': {
                  // Remove overflow to prevent double scrollbar
                },
                // Override any blue selection colors
                '& .MuiDataGrid-row.Mui-selected': {
                  backgroundColor: '#F8F9FA !important',
                  '&:hover': {
                    backgroundColor: '#F1F3F5 !important',
                  },
                },
                '& .MuiCheckbox-root': {
                  color: '#6C757D !important',
                  '&.Mui-checked': {
                    color: '#495057 !important',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #F1F3F5',
                  borderRight: '1px solid #F1F3F5',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  padding: { xs: '12px 14px', sm: '14px 18px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#212529',
                  fontWeight: 400,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                },
                // Right-align numeric cells
                '& .MuiDataGrid-cell--textRight': {
                  justifyContent: 'flex-end',
                },
                // Center-align cells (for icons)
                '& .MuiDataGrid-cell--textCenter': {
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-row': {
                  bgcolor: '#FFFFFF',
                  '&:nth-of-type(even)': {
                    backgroundColor: '#FAFBFC',
                  },
                  '&:hover': {
                    backgroundColor: '#F8F9FA',
                    '& .MuiDataGrid-cell': {
                      color: '#0D1117',
                      fontWeight: 500,
                    },
                  },
                  transition: 'background-color 0.15s ease',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F8F9FA !important',
                  borderBottom: '2px solid #E9ECEF',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  minHeight: '56px !important',
                  maxHeight: '56px !important',
                  boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.05)',
                },
                '& .MuiDataGrid-columnHeader': {
                  borderRight: '1px solid #E9ECEF',
                  padding: { xs: '12px 14px', sm: '14px 18px' },
                  backgroundColor: '#F8F9FA !important',
                  '&:last-child': {
                    borderRight: 'none',
                  },
                  '&:focus': {
                    outline: 'none',
                    backgroundColor: '#F8F9FA !important',
                  },
                  '&:focus-within': {
                    backgroundColor: '#F8F9FA !important',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F3F5 !important',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#F8F9FA !important',
                  },
                },
                '& .MuiDataGrid-iconButtonContainer': {
                  '& .MuiIconButton-root': {
                    color: '#6C757D !important',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      color: '#495057 !important',
                    },
                  },
                },
                '& .MuiDataGrid-sortIcon': {
                  color: '#6C757D !important',
                },
                '& .MuiDataGrid-columnHeaderTitleContainer': {
                  overflow: 'hidden',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  color: '#495057',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                },
                '& .MuiDataGrid-footerContainer': {
                  minHeight: '52px',
                  backgroundColor: '#FFFFFF',
                  borderTop: '2px solid #E9ECEF',
                },
                '& .MuiTablePagination-root': {
                  fontSize: '0.8125rem',
                  color: '#6C757D',
                  fontWeight: 400,
                  '& .MuiIconButton-root': {
                    color: '#6C757D !important',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      color: '#495057 !important',
                    },
                    '&.Mui-disabled': {
                      color: '#DEE2E6 !important',
                    },
                  },
                },
                '& .MuiDataGrid-virtualScroller': {
                  // Modern scrollbar
                  '&::-webkit-scrollbar': { width: '8px', height: '8px' },
                  '&::-webkit-scrollbar-track': { background: '#F8F9FA', borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb': { background: '#DEE2E6', borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb:hover': { background: '#CED4DA' },
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#DEE2E6 #F8F9FA',
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
