// DataTable Component for rendering tabular data from API responses
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';

const DataTable = ({ data, title, sx, ...props }) => {
  // Handle empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center', ...sx }}>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Extract column headers from the first object
  const columns = Object.keys(data[0]);

  // Format cell values for better display
  const formatCellValue = (value, key) => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Format numbers with commas for better readability
    if (typeof value === 'number') {
      // Check if it's a currency/amount field
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('disbursement')) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);
      }
      // Regular number formatting
      return new Intl.NumberFormat('en-IN').format(value);
    }

    // Format dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('day')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (e) {
        // If date parsing fails, return original value
      }
    }

    return String(value);
  };

  // Format column headers for better display
  const formatColumnHeader = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate summary if it's financial data
  const calculateSummary = () => {
    const amountColumns = columns.filter(col => 
      col.toLowerCase().includes('amount') || col.toLowerCase().includes('disbursement')
    );
    
    if (amountColumns.length > 0) {
      const totals = {};
      amountColumns.forEach(col => {
        totals[col] = data.reduce((sum, row) => {
          const value = parseFloat(row[col]) || 0;
          return sum + value;
        }, 0);
      });
      return totals;
    }
    return null;
  };

  const summary = calculateSummary();

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ marginBottom: 2 }}>
          {title}
        </Typography>
      )}
      
      <TableContainer component={Paper} elevation={1}>
        <Table size="small" aria-label="data table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column}
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    color: 'text.primary'
                  }}
                >
                  {formatColumnHeader(column)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {formatCellValue(row[column], column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Summary row for financial data */}
            {summary && (
              <TableRow sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                {columns.map((column, index) => (
                  <TableCell 
                    key={column}
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      borderTop: '2px solid #1976d2'
                    }}
                  >
                    {index === 0 ? (
                      <Chip 
                        label="Total" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    ) : summary[column] ? (
                      formatCellValue(summary[column], column)
                    ) : (
                      '-'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Data count info */}
      <Box sx={{ marginTop: 1, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          {data.length} record{data.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Box>
  );
};

export default DataTable;
