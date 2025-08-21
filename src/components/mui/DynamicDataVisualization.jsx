import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Download,
  BarChart as BarChartIcon,
  ShowChart,
  CurrencyRupee
} from '@mui/icons-material';

const DynamicDataVisualization = ({ 
  data = [],
  question = "Data Analysis",
  title = "Dynamic Dashboard"
}) => {
  const [chartType, setChartType] = useState('bar');

  // Dynamic field detection and mapping
  const fieldMapping = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sampleItem = data[0];
    const fields = Object.keys(sampleItem);
    
    // Auto-detect identifier field (day, weekday, date, id, etc.)
    const identifierField = fields.find(field => 
      field.toLowerCase().includes('day') ||
      field.toLowerCase().includes('week') ||
      field.toLowerCase().includes('date') ||
      field.toLowerCase().includes('id') ||
      field.toLowerCase().includes('period')
    ) || fields[0];

    // Auto-detect amount/value field (disbursed, amount, total, value, etc.)
    const amountField = fields.find(field => 
      field.toLowerCase().includes('disburs') ||
      field.toLowerCase().includes('amount') ||
      field.toLowerCase().includes('total') ||
      field.toLowerCase().includes('value') ||
      field.toLowerCase().includes('sum')
    ) || fields.find(field => typeof sampleItem[field] === 'number') || fields[1];
    
    console.log('Field detection:', { identifierField, amountField, fields, sampleItem });

    // Generate display names for fields
    const getDisplayName = (fieldName) => {
      return fieldName
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
    };

    // Check if identifier is a date field
    const isDateField = identifierField && (
      identifierField.toLowerCase().includes('date') ||
      identifierField.toLowerCase().includes('time') ||
      /^\d{4}-\d{2}-\d{2}/.test(String(sampleItem[identifierField]))
    );

    return {
      identifier: {
        field: identifierField,
        display: getDisplayName(identifierField),
        isDate: isDateField
      },
      amount: {
        field: amountField,
        display: getDisplayName(amountField)
      },
      allFields: fields.map(field => ({
        field,
        display: getDisplayName(field),
        type: typeof sampleItem[field]
      }))
    };
  }, [data]);

  // Process data dynamically
  const processedData = useMemo(() => {
    if (!fieldMapping || !data) return [];

    return data.map((item, index) => {
      const identifierValue = item[fieldMapping.identifier.field];
      const amountValue = Number(item[fieldMapping.amount.field]) || 0;
      
      // Generate display name for identifier
      let displayName = identifierValue;
      
      if (fieldMapping.identifier.isDate) {
        // Format date display
        try {
          const date = new Date(identifierValue);
          displayName = date.toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric' 
          });
        } catch (e) {
          displayName = String(identifierValue);
        }
      } else if (fieldMapping.identifier.field.toLowerCase().includes('day') || 
                 fieldMapping.identifier.field.toLowerCase().includes('week')) {
        const weekdayNames = {
          1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
          5: 'Friday', 6: 'Saturday', 7: 'Sunday'
        };
        displayName = weekdayNames[identifierValue] || `Day ${identifierValue}`;
      }

      return {
        ...item,
        id: identifierValue,
        displayName,
        amount: amountValue,
        formattedAmount: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
        }).format(amountValue)
      };
    });
  }, [data, fieldMapping]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!processedData.length || !fieldMapping) return null;

    // Only calculate if we have amount field
    const amounts = processedData.map(item => item.amount).filter(amount => !isNaN(amount) && amount !== null);
    if (amounts.length === 0) return null;

    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / amounts.length;
    const highest = processedData.reduce((max, item) => 
      item.amount > max.amount ? item : max
    );
    const lowest = processedData.reduce((min, item) => 
      item.amount < min.amount ? item : min
    );

    return { total, average, highest, lowest, count: processedData.length };
  }, [processedData, fieldMapping]);

  // CSV Export function
  const exportToCSV = () => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]).map(key => 
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const csvContent = [
      headers,
      ...data.map(item => 
        Object.keys(data[0]).map(key => item[key])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" color="primary">
            ₹{new Intl.NumberFormat('en-IN').format(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (!fieldMapping || !processedData.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No data available to display
        </Typography>
      </Box>
    );
  }

  // For single data point, show only table
  const isSingleDataPoint = processedData.length === 1;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {question}
          </Typography>
        </Box>
        
        <Tooltip title="Export to CSV">
          <IconButton onClick={exportToCSV} color="primary" size="large">
            <Download />
          </IconButton>
        </Tooltip>
      </Box>


      {/* Chart Section - Always show for multiple data points */}
      {!isSingleDataPoint && fieldMapping && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Data Visualization</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={chartType === 'line'}
                  onChange={(e) => setChartType(e.target.checked ? 'line' : 'bar')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {chartType === 'line' ? <ShowChart fontSize="small" /> : <BarChartIcon fontSize="small" />}
                  <Typography variant="body2">{chartType === 'line' ? 'Line' : 'Bar'}</Typography>
                </Box>
              }
            />
          </Box>
          
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'bar' ? (
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" fontSize={12} />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} fontSize={12} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" fontSize={12} />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} fontSize={12} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#1976d2" 
                  strokeWidth={3}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table Section */}
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              {isSingleDataPoint ? 'Data Summary' : 'Detailed Data'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={`${processedData.length} record${processedData.length > 1 ? 's' : ''}`} 
                color="primary" 
                variant="outlined" 
                size="small"
              />
              <Tooltip title="Export to CSV">
                <IconButton onClick={exportToCSV} color="primary" size="small">
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(data[0] || {}).map((fieldKey) => (
                    <TableCell key={fieldKey} sx={{ py: 1 }}>
                      <strong>
                        {fieldKey
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())
                        }
                      </strong>
                    </TableCell>
                  ))}
                  {!isSingleDataPoint && (
                    <TableCell align="center" sx={{ py: 1 }}>
                      <strong>% of Total</strong>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {processedData.map((item, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      backgroundColor: insights && item.amount === insights.highest.amount ? 'rgba(255, 152, 0, 0.1)' : 'inherit',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    {Object.keys(data[0] || {}).map((fieldKey) => (
                      <TableCell key={fieldKey}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {fieldMapping && fieldKey === fieldMapping.amount.field ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CurrencyRupee sx={{ fontSize: 16 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {new Intl.NumberFormat('en-IN').format(item[fieldKey])}
                              </Typography>
                            </Box>
                          ) : fieldMapping && fieldKey === fieldMapping.identifier.field ? (
                            <>
                              {item.displayName}
                              {insights && item.amount === insights.highest.amount && (
                                <Chip label="Highest" size="small" color="warning" />
                              )}
                            </>
                          ) : (
                            item[fieldKey]
                          )}
                        </Box>
                      </TableCell>
                    ))}
                    {!isSingleDataPoint && (
                      <TableCell align="center">
                        {insights ? ((item.amount / insights.total) * 100).toFixed(1) : '0'}%
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {insights && !isSingleDataPoint && (
                  <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                    <TableCell sx={{ py: 1 }}><strong>Total</strong></TableCell>
                    {Object.keys(data[0] || {}).slice(1).map((fieldKey) => (
                      <TableCell key={fieldKey} sx={{ py: 1 }}>
                        {fieldMapping && fieldKey === fieldMapping.amount.field ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CurrencyRupee sx={{ fontSize: 16 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {new Intl.NumberFormat('en-IN').format(insights.total)}
                            </Typography>
                          </Box>
                        ) : (
                          <strong>—</strong>
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ py: 1 }}><strong>100%</strong></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DynamicDataVisualization;
