import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Divider,
  Tooltip,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
  TextField,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  TableChart, 
  FileDownload,
  FormatColorFill as FormatColorFillIcon,
  BorderColor as BorderColorIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

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

// Color palette for highlighting
const HIGHLIGHT_COLORS = [
  { name: 'Red', value: '#FEE2E2', text: '#991B1B' },
  { name: 'Orange', value: '#FED7AA', text: '#9A3412' },
  { name: 'Yellow', value: '#FEF3C7', text: '#854D0E' },
  { name: 'Green', value: '#D1FAE5', text: '#065F46' },
  { name: 'Blue', value: '#DBEAFE', text: '#1E40AF' },
  { name: 'Purple', value: '#E9D5FF', text: '#6B21A8' },
  { name: 'Pink', value: '#FCE7F3', text: '#9F1239' },
  { name: 'Gray', value: '#F3F4F6', text: '#374151' },
];

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
  useInfiniteScroll = false, // New prop for infinite scroll
  // Formatting props from parent
  isFormattingActive = false,
  columnFormats: propColumnFormats = null,
  rowFormats: propRowFormats = null,
  onFormatColumn = null,
  onFormatRow = null,
  onClearColumnFormat = null,
  onClearRowFormat = null,
  onClearAllFormats = null,
  // Error props
  error = null,
  isLockError = false
}) => {
  // State for column/row formatting - use props if provided, otherwise use local state
  const [localColumnFormats, setLocalColumnFormats] = useState({}); // { columnField: { bgColor, textColor } }
  const [localRowFormats, setLocalRowFormats] = useState({}); // { rowId: { bgColor, textColor } }
  const [activeTab, setActiveTab] = useState('column'); // 'column' | 'row'
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Use props if provided, otherwise use local state
  const columnFormats = propColumnFormats !== null ? propColumnFormats : localColumnFormats;
  const rowFormats = propRowFormats !== null ? propRowFormats : localRowFormats;
  
  // Use prop handlers if provided, otherwise use local handlers
  const handleFormatColumn = onFormatColumn || ((columnField, color) => {
    setLocalColumnFormats(prev => ({
      ...prev,
      [columnField]: {
        bgColor: color.value,
        textColor: color.text
      }
    }));
  });
  
  const handleFormatRow = onFormatRow || ((rowId, color) => {
    setLocalRowFormats(prev => ({
      ...prev,
      [rowId]: {
        bgColor: color.value,
        textColor: color.text
      }
    }));
  });
  
  const handleClearColumnFormat = onClearColumnFormat || ((columnField) => {
    setLocalColumnFormats(prev => {
      const { [columnField]: _, ...rest } = prev;
      return rest;
    });
  });
  
  const handleClearRowFormat = onClearRowFormat || ((rowId) => {
    setLocalRowFormats(prev => {
      const { [rowId]: _, ...rest } = prev;
      return rest;
    });
  });
  
  const handleClearAllFormats = onClearAllFormats || (() => {
    setLocalColumnFormats({});
    setLocalRowFormats({});
  });
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
          width: 150,
          minWidth: 150,
          maxWidth: 800,
          flex: 1,
          resizable: true,
          align: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
          headerAlign: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
          renderCell: (params) => {
            const value = params.value;
            const rowId = params.id;
            const columnField = params.field;
            
            // Get formatting for this cell (column format takes precedence over row format)
            const columnFormat = columnFormats[columnField];
            const rowFormat = rowFormats[rowId];
            const cellBgColor = columnFormat?.bgColor || rowFormat?.bgColor;
            const cellTextColor = columnFormat?.textColor || rowFormat?.textColor;
            
            // Handle null/undefined
            if (value === null || value === undefined) {
              return (
                <Box sx={{ 
                  width: '100%', 
                  minHeight: '100%',
                  bgcolor: cellBgColor,
                  color: cellTextColor || '#94A3B8',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  py: 0.5,
                  px: 0,
                  overflow: 'visible !important',
                  lineHeight: 1.5,
                }}>
                  —
                </Box>
              );
            }
            
            // Handle Productivity column with icons
            if (typeof value === 'string' && key.toLowerCase() === 'productivity') {
              const upperValue = value.toUpperCase().trim();
              const isNonProductive = upperValue === 'ZERO PRODUCTIVITY' || upperValue === 'NONE';
              const isProductive = upperValue === 'WORK DONE' || upperValue === 'COLL';
              
              if (isNonProductive || isProductive) {
                return (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'center', 
                    minHeight: '100%', 
                    width: '100%',
                    bgcolor: cellBgColor,
                    py: 0.5,
                    px: 0,
                    overflow: 'visible !important',
                  }}>
                    <img
                      src={isNonProductive ? '/non-productive.png' : '/productive.svg'}
                      alt={value}
                      style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block' }}
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
            
            // Helper to wrap value in formatted Box
            const renderFormattedValue = (displayValue) => {
              if (cellBgColor || cellTextColor) {
                return (
                  <Box sx={{ 
                    width: '100%', 
                    minHeight: '100%',
                    bgcolor: cellBgColor,
                    color: cellTextColor,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    py: 0.5,
                    px: 0,
                    wordBreak: 'break-word',
                    overflow: 'visible !important',
                    whiteSpace: 'normal',
                    lineHeight: 1.5,
                  }}>
                    {displayValue}
                  </Box>
                );
              }
              return (
                <Box sx={{
                  width: '100%',
                  py: 0.5,
                  px: 0,
                  wordBreak: 'break-word',
                  overflow: 'visible !important',
                  whiteSpace: 'normal',
                  lineHeight: 1.5,
                }}>
                  {displayValue}
                </Box>
              );
            };
            
            // Handle numbers with proper formatting
            if (isValidNumber) {
              // If column has any decimals, format all values with 2 decimal places
              const formatOptions = hasDecimalsInColumn 
                ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                : { minimumFractionDigits: 0, maximumFractionDigits: 2 };
              
              // Add % symbol for percentage columns
              if (isPercentageColumn) {
                return renderFormattedValue(`${numValue.toLocaleString('en-IN', formatOptions)}%`);
              }
              // Format numbers
              return renderFormattedValue(numValue.toLocaleString('en-IN', formatOptions));
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
                    return renderFormattedValue(date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }));
                  }
                  // For other dates, show full date
                  return renderFormattedValue(date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  }));
                }
              } catch (e) {
                // If date parsing fails, return as is
                return renderFormattedValue(value);
              }
            }
          }
          
          return renderFormattedValue(value);
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
                width: 150,
                minWidth: 150,
                maxWidth: 800,
                flex: 1,
                resizable: true,
                align: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
                headerAlign: isProductivity ? 'center' : (isNumber ? 'right' : 'left'),
                renderCell: (params) => {
                    const value = params.value;
                    const rowId = params.id;
                    const columnField = params.field;
                    
                    // Get formatting for this cell (column format takes precedence over row format)
                    const columnFormat = columnFormats[columnField];
                    const rowFormat = rowFormats[rowId];
                    const cellBgColor = columnFormat?.bgColor || rowFormat?.bgColor;
                    const cellTextColor = columnFormat?.textColor || rowFormat?.textColor;
                    
                    // Handle null/undefined
                    if (value === null || value === undefined) {
                        return (
                            <Box sx={{ 
                                width: '100%', 
                                minHeight: '100%',
                                bgcolor: cellBgColor,
                                color: cellTextColor || '#94A3B8',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                py: 0.5,
                                px: 0,
                                overflow: 'visible !important',
                                lineHeight: 1.5,
                            }}>
                                —
                            </Box>
                        );
                    }
                    
                    // Handle Productivity column with icons
                    if (typeof value === 'string' && key.toLowerCase() === 'productivity') {
                        const upperValue = value.toUpperCase().trim();
                        const isNonProductive = upperValue === 'ZERO PRODUCTIVITY' || upperValue === 'NONE';
                        const isProductive = upperValue === 'WORK DONE' || upperValue === 'COLL';
                        
                        if (isNonProductive || isProductive) {
                            return (
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    justifyContent: 'center', 
                                    minHeight: '100%', 
                                    width: '100%',
                                    bgcolor: cellBgColor,
                                    py: 0.5,
                                    px: 0,
                                    overflow: 'visible !important',
                                }}>
                                    <img
                                        src={isNonProductive ? '/non-productive.png' : '/productive.svg'}
                                        alt={value}
                                        style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block' }}
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
                    
                    // Helper to wrap value in formatted Box
                    const renderFormattedValue = (displayValue) => {
                        if (cellBgColor || cellTextColor) {
                            return (
                                <Box sx={{ 
                                    width: '100%', 
                                    minHeight: '100%',
                                    bgcolor: cellBgColor,
                                    color: cellTextColor,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    py: 0.5,
                                    px: 0,
                                    wordBreak: 'break-word',
                                    overflow: 'visible !important',
                                    whiteSpace: 'normal',
                                    lineHeight: 1.5,
                                }}>
                                    {displayValue}
                                </Box>
                            );
                        }
                        return (
                            <Box sx={{
                                width: '100%',
                                py: 0.5,
                                px: 0,
                                wordBreak: 'break-word',
                                overflow: 'visible !important',
                                whiteSpace: 'normal',
                                lineHeight: 1.5,
                            }}>
                                {displayValue}
                            </Box>
                        );
                    };
                    
                    // Handle numbers with proper formatting
                    if (isValidNumber) {
                        // If column has any decimals, format all values with 2 decimal places
                        const formatOptions = hasDecimalsInColumn 
                          ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          : { minimumFractionDigits: 0, maximumFractionDigits: 2 };
                        
                        // Add % symbol for percentage columns
                        if (isPercentageColumn) {
                            return renderFormattedValue(`${numValue.toLocaleString('en-IN', formatOptions)}%`);
                        }
                        // Format numbers
                        return renderFormattedValue(numValue.toLocaleString('en-IN', formatOptions));
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
                                        return renderFormattedValue(date.toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            year: 'numeric' 
                                        }));
                                    }
                                    return renderFormattedValue(date.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric' 
                                    }));
                                }
                            } catch (e) {
                                return renderFormattedValue(value);
                            }
                        }
                    }
                    
                    return renderFormattedValue(value);
                }
            };
        });
    }

    return {
      processedRows: finalRows,
      processedColumns: finalColumns
    };
  }, [data, rows, columns, autoGenerateColumns, columnFormats, rowFormats]);

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

  // Error state component - show when there's a lock error or other error
  const ErrorState = () => {
    if (!error) return null;
    
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          py: 6,
          px: 3,
          bgcolor: '#FAFBFC',
          borderRadius: 2,
        }}
      >
        {/* Animated Database Icon */}
        <Box
          sx={{
            position: 'relative',
            mb: 3,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.8,
              },
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Rotating circles around database */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                animation: 'rotate 3s linear infinite',
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#b5c8de',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translateY(-60px) rotate(${i * 120}deg)`,
                    transformOrigin: '0 60px',
                    opacity: 0.6,
                    animation: `fadeInOut 2s ease-in-out infinite ${i * 0.3}s`,
                    '@keyframes fadeInOut': {
                      '0%, 100%': { opacity: 0.3 },
                      '50%': { opacity: 1 },
                    },
                  }}
                />
              ))}
            </Box>
            
            {/* Database icon with pulsing effect */}
            <StorageIcon
              sx={{
                fontSize: 80,
                color: '#b5c8de',
                animation: 'glow 2s ease-in-out infinite',
                '@keyframes glow': {
                  '0%, 100%': {
                    filter: 'drop-shadow(0 0 8px rgba(181, 200, 222, 0.5))',
                  },
                  '50%': {
                    filter: 'drop-shadow(0 0 16px rgba(181, 200, 222, 0.8))',
                  },
                },
              }}
            />
            
            {/* Spinner overlay */}
            <CircularProgress
              size={100}
              thickness={2}
              sx={{
                position: 'absolute',
                color: '#b5c8de',
                animation: 'spin 1.5s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Box>
        </Box>
        
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1E293B',
            mb: 1,
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
          }}
        >
          Data Sync in Progress
        </Typography>
        
        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            textAlign: 'center',
            maxWidth: 400,
            mb: 3,
            lineHeight: 1.6,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          }}
        >
          {isLockError
            ? 'The database is currently processing another request. Please wait a moment and try refreshing again in 2 minutes.'
            : 'We\'re syncing your data. This may take a few moments.'}
        </Typography>
        
        {/* Refresh button with animation */}
        <Button
          variant="outlined"
          startIcon={
            <RefreshIcon
              sx={{
                animation: 'spin 2s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          }
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            px: 3,
            py: 1.5,
            borderColor: '#b5c8de',
            color: '#1E293B',
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.9375rem',
            '&:hover': {
              borderColor: '#8FA8C7',
              bgcolor: 'rgba(181, 200, 222, 0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(181, 200, 222, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Try Refreshing Again
        </Button>
        
        {/* Countdown timer */}
        {isLockError && (
          <Typography
            variant="caption"
            sx={{
              color: '#94A3B8',
              mt: 3,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Recommended wait time: ~2 minutes
          </Typography>
        )}
      </Box>
    );
  };

  // Show error state if there's an error
  if (error) {
    return <ErrorState />;
  }

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

  // Compact formatting toolbar - only shows when formatting is active
  const FormatToolbar = () => {
    if (!isFormattingActive) return null;
    
    const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
    const [rowMenuAnchor, setRowMenuAnchor] = useState(null);
    
    return (
      <Box
        sx={{
          bgcolor: '#F8F9FA',
          borderBottom: '1px solid #E9ECEF',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 48,
        }}
      >
        {/* Tab buttons for Column/Row selection */}
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(e, newTab) => {
            if (newTab !== null) {
              setActiveTab(newTab);
              setSelectedColumn(null);
              setSelectedRow(null);
            }
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              border: '1px solid #DEE2E6',
              bgcolor: '#fff',
              color: '#495057',
              '&.Mui-selected': {
                bgcolor: '#fff',
                color: '#0078d7',
                borderColor: '#0078d7',
                borderWidth: '2px',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#F0F7FF',
                  borderColor: '#0078d7',
                }
              },
              '&:hover': {
                bgcolor: '#F8F9FA',
              }
            }
          }}
        >
          <ToggleButton value="column" aria-label="format column">
            <FormatColorFillIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Column
          </ToggleButton>
          <ToggleButton value="row" aria-label="format row">
            <BorderColorIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Row
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        {/* Column/Row selector */}
        {activeTab === 'column' ? (
          <Autocomplete
            size="small"
            options={processedColumns}
            getOptionLabel={(option) => option.headerName || option.field}
            value={selectedColumn ? processedColumns.find(c => c.field === selectedColumn) : null}
            onChange={(e, newValue) => {
              setSelectedColumn(newValue?.field || null);
            }}
            sx={{ minWidth: 200, flexGrow: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select column..."
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    fontSize: '0.8125rem',
                  }
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              const hasFormat = columnFormats[option.field];
              return (
                <Box
                  component="li"
                  key={key}
                  {...otherProps}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: hasFormat ? alpha(hasFormat.bgColor || '#3B82F6', 0.1) : 'transparent',
                  }}
                >
                  <Typography variant="body2">{option.headerName || option.field}</Typography>
                  {hasFormat && (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: hasFormat.bgColor,
                        border: '1px solid #E9ECEF',
                      }}
                    />
                  )}
                </Box>
              );
            }}
          />
        ) : (
          <Autocomplete
            size="small"
            options={rowsWithIds.slice(0, 100)}
            getOptionLabel={(option) => {
              const values = Object.values(option).slice(0, 2).filter(v => v !== option.id);
              return values.join(' - ') || `Row ${option.id}`;
            }}
            value={selectedRow ? rowsWithIds.find(r => r.id === selectedRow) : null}
            onChange={(e, newValue) => {
              setSelectedRow(newValue?.id || null);
            }}
            sx={{ minWidth: 200, flexGrow: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select row..."
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    fontSize: '0.8125rem',
                  }
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              const hasFormat = rowFormats[option.id];
              const label = Object.values(option).slice(0, 2).filter(v => v !== option.id).join(' - ') || `Row ${option.id}`;
              return (
                <Box
                  component="li"
                  key={key}
                  {...otherProps}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: hasFormat ? alpha(hasFormat.bgColor || '#3B82F6', 0.1) : 'transparent',
                  }}
                >
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {label}
                  </Typography>
                  {hasFormat && (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: hasFormat.bgColor,
                        border: '1px solid #E9ECEF',
                      }}
                    />
                  )}
                </Box>
              );
            }}
          />
        )}
        
        {/* Color swatches - shown inline when column/row is selected */}
        {(selectedColumn || selectedRow) && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Stack direction="row" spacing={0.5} alignItems="center">
              {HIGHLIGHT_COLORS.map((color) => {
                const target = selectedColumn || selectedRow;
                const hasFormat = selectedColumn 
                  ? columnFormats[selectedColumn]?.bgColor === color.value
                  : rowFormats[selectedRow]?.bgColor === color.value;
                
                return (
                  <Tooltip key={color.name} title={color.name} arrow>
                    <Box
                      onClick={() => {
                        if (selectedColumn) {
                          handleFormatColumn(selectedColumn, color);
                        } else if (selectedRow) {
                          handleFormatRow(selectedRow, color);
                        }
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: color.value,
                        border: hasFormat ? `2px solid ${color.text}` : '2px solid #E9ECEF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          borderColor: color.text,
                          boxShadow: `0 2px 8px ${alpha(color.value, 0.5)}`,
                        }
                      }}
                    >
                      {hasFormat && (
                        <CheckCircleIcon sx={{ fontSize: 18, color: color.text }} />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Stack>
          </>
        )}
        
        {/* Clear button */}
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title="Clear all formatting" arrow>
            <IconButton
              size="small"
              onClick={handleClearAllFormats}
              disabled={Object.keys(columnFormats).length === 0 && Object.keys(rowFormats).length === 0}
              sx={{
                color: '#495057',
                '&:hover': { bgcolor: '#E9ECEF' },
                '&.Mui-disabled': { color: '#ADB5BD' }
              }}
            >
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

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
        <FormatToolbar />
        <DataGrid
          rows={rowsWithIds}
          columns={processedColumns}
          getRowId={(row) => row.id}
          getRowClassName={(params) => {
            const rowFormat = rowFormats[params.id];
            return rowFormat ? 'formatted-row' : '';
          }}
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
              overflow: 'visible !important',
              textOverflow: 'clip',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              fontWeight: 400,
              minHeight: { xs: '48px', sm: '56px' },
              maxHeight: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              verticalAlign: 'top',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              flexDirection: 'column',
              '& > div': {
                width: '100%',
                overflow: 'visible !important',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              },
              '&:focus': {
                outline: '1px solid #b5c8de',
                outlineOffset: '-1px',
              },
            },
            '& .MuiDataGrid-cell[data-field]': {
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            },
            // Right-align numeric cells
            '& .MuiDataGrid-cell--textRight': {
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              textAlign: 'right',
            },
            // Center-align cells (for icons)
            '& .MuiDataGrid-cell--textCenter': {
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
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
              backgroundColor: '#FFFFFF !important',
              borderBottom: '2px solid #b5c8de',
              minHeight: { xs: '48px !important', sm: '56px !important' },
              maxHeight: { xs: '48px !important', sm: '56px !important' },
              boxShadow: '0 1px 0 0 rgba(181, 200, 222, 0.2)',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: { xs: '12px 14px', sm: '14px 18px' },
              borderRight: '1px solid #E9ECEF',
              backgroundColor: '#FFFFFF !important',
              '&:last-child': {
                borderRight: 'none',
              },
              '&:focus': {
                outline: 'none',
                backgroundColor: '#F0F7FF !important',
              },
              '&:focus-within': {
                backgroundColor: '#F0F7FF !important',
              },
              '&:hover': {
                backgroundColor: '#F0F7FF !important',
                borderBottom: '2px solid #b5c8de',
              },
              '&.Mui-selected': {
                backgroundColor: '#F0F7FF !important',
              },
            },
            '& .MuiDataGrid-iconButtonContainer': {
              '& .MuiIconButton-root': {
                color: '#6C757D !important',
                '&:hover': {
                  backgroundColor: 'rgba(181, 200, 222, 0.1)',
                  color: '#b5c8de !important',
                },
              },
            },
            '& .MuiDataGrid-sortIcon': {
              color: '#6C757D !important',
            },
            '& .MuiDataGrid-columnHeaderTitleContainer': {
              overflow: 'visible',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              color: '#212529',
              letterSpacing: '0.01em',
              textTransform: 'none',
              overflow: 'visible',
              textOverflow: 'clip',
              whiteSpace: 'normal',
              lineHeight: 1.3,
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
        <Box sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 }, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <FormatToolbar />
          <Box sx={{ width: '100%', minHeight: 200, flex: 1 }}>
            <DataGrid
              rows={rowsWithIds}
              columns={processedColumns}
              getRowId={(row) => row.id}
              getRowClassName={(params) => {
                const rowFormat = rowFormats[params.id];
                return rowFormat ? 'formatted-row' : '';
              }}
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
                  overflow: 'visible !important',
                  textOverflow: 'clip',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  color: '#212529',
                  fontWeight: 400,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  minHeight: { xs: '48px', sm: '56px' },
                  maxHeight: 'none',
                  verticalAlign: 'top',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  flexDirection: 'column',
                  '& > div': {
                    width: '100%',
                    overflow: 'visible !important',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  },
                  '&:focus': {
                    outline: '1px solid #b5c8de',
                    outlineOffset: '-1px',
                  },
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
                  backgroundColor: '#FFFFFF !important',
                  borderBottom: '2px solid #b5c8de',
                  minHeight: { xs: '48px !important', sm: '56px !important' },
                  maxHeight: { xs: '48px !important', sm: '56px !important' },
                  boxShadow: '0 1px 0 0 rgba(181, 200, 222, 0.2)',
                },
                '& .MuiDataGrid-columnHeader': {
                  borderRight: '1px solid #E9ECEF',
                  padding: { xs: '12px 14px', sm: '14px 18px' },
                  backgroundColor: '#FFFFFF !important',
                  '&:last-child': {
                    borderRight: 'none',
                  },
                  '&:focus': {
                    outline: 'none',
                    backgroundColor: '#F0F7FF !important',
                    borderBottom: '2px solid #b5c8de',
                  },
                  '&:focus-within': {
                    backgroundColor: '#F0F7FF !important',
                    borderBottom: '2px solid #b5c8de',
                  },
                  '&:hover': {
                    backgroundColor: '#F0F7FF !important',
                    borderBottom: '2px solid #b5c8de',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#F0F7FF !important',
                  },
                },
                '& .MuiDataGrid-iconButtonContainer': {
                  '& .MuiIconButton-root': {
                    color: '#6C757D !important',
                    '&:hover': {
                      backgroundColor: 'rgba(181, 200, 222, 0.1)',
                      color: '#b5c8de !important',
                    },
                  },
                },
                '& .MuiDataGrid-sortIcon': {
                  color: '#6C757D !important',
                },
                '& .MuiDataGrid-columnHeaderTitleContainer': {
                  overflow: 'hidden',
                },
                '& .MuiDataGrid-columnHeaderTitleContainer': {
                  overflow: 'visible',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  color: '#212529',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  whiteSpace: 'normal',
                  lineHeight: 1.3,
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
