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

// Utility function to convert week number to date range
const getWeekDateRange = (weekNumber, year = new Date().getFullYear()) => {
  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Calculate the first Monday of the year (ISO week standard)
  const firstMonday = new Date(firstDayOfYear);
  const dayOfWeek = firstDayOfYear.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday, add 1 day, else add days to get to Monday
  firstMonday.setDate(firstDayOfYear.getDate() + daysToAdd);
  
  // Calculate the start date of the given week
  const weekStartDate = new Date(firstMonday);
  weekStartDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
  
  // Calculate the end date of the week (6 days later)
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  
  // Get month name and determine week position in month
  const monthName = weekStartDate.toLocaleDateString('en-US', { month: 'long' });
  const weekOfMonth = Math.ceil(weekStartDate.getDate() / 7);
  const weekPositions = ['1st', '2nd', '3rd', '4th', '5th'];
  const weekPosition = weekPositions[weekOfMonth - 1] || `${weekOfMonth}th`;
  
  return {
    start: weekStartDate,
    end: weekEndDate,
    displayRange: `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    monthWeek: `${monthName} ${weekPosition} week`,
    shortDisplay: `Week ${weekNumber}`
  };
};

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
    
    // Auto-detect date field for X-axis (any field containing date, day, time, period, weekday)
    const dateField = fields.find(field => 
      field.toLowerCase().includes('date') ||
      field.toLowerCase().includes('day') ||
      field.toLowerCase().includes('time') ||
      field.toLowerCase().includes('period') ||
      field.toLowerCase().includes('week') ||
      field.toLowerCase().includes('month') ||
      field.toLowerCase().includes('year')
    ) || fields[0];

    // Auto-detect numeric field for Y-axis (any numeric field)
    const numericField = fields.find(field => 
      typeof sampleItem[field] === 'number'
    ) || fields[1];
    
    console.log('Dynamic field detection:', { dateField, numericField, fields, sampleItem });

    return {
      xAxis: dateField,
      yAxis: numericField,
      fields: fields
    };
  }, [data]);

  // Process data dynamically
  const processedData = useMemo(() => {
    if (!data || !data.length) return [];

    // Auto-detect field mapping if not provided
    const autoFieldMapping = fieldMapping || (() => {
      const firstItem = data[0];
      const keys = Object.keys(firstItem);
      
      // Find x-axis (categorical field - weekday, week_number, or date should be x-axis)
      const xAxis = keys.find(key => 
        key.toLowerCase().includes('weekday') ||
        key.toLowerCase().includes('week_number') ||
        key.toLowerCase().includes('week') ||
        key.toLowerCase().includes('day') ||
        key.toLowerCase().includes('date')
      ) || keys[0];
      
      // Find y-axis (numeric field - disbursements should be y-axis)
      const yAxis = keys.find(key => 
        key.toLowerCase().includes('disbursement') ||
        key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('total')
      ) || keys.find(key => typeof firstItem[key] === 'number' && key !== xAxis) || keys[1];
      
      return { xAxis, yAxis };
    })();

    return data.map((item, index) => {
      const xValue = item[autoFieldMapping.xAxis];
      const yValue = Number(item[autoFieldMapping.yAxis]) || 0;
      
      // Generate display name for X-axis
      let displayName = xValue;
      
      // Check field type and format accordingly
      if (autoFieldMapping.xAxis.toLowerCase().includes('weekday')) {
        // Format weekday numbers to names
        const weekdayNames = {
          1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
          5: 'Friday', 6: 'Saturday', 7: 'Sunday'
        };
        displayName = weekdayNames[xValue] || `Day ${xValue}`;
      } else if (autoFieldMapping.xAxis.toLowerCase().includes('week_number') || autoFieldMapping.xAxis.toLowerCase().includes('week')) {
        // Format week numbers to date ranges
        const weekInfo = getWeekDateRange(xValue);
        displayName = weekInfo.shortDisplay;
      } else if (autoFieldMapping.xAxis.toLowerCase().includes('date') || autoFieldMapping.xAxis.toLowerCase().includes('day')) {
        try {
          const date = new Date(xValue);
          displayName = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        } catch (e) {
          displayName = String(xValue);
        }
      }

      return {
        displayName,
        amount: yValue,
        [autoFieldMapping.xAxis]: xValue,
        [autoFieldMapping.yAxis]: yValue
      };
    });
  }, [data, fieldMapping]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!processedData.length) return null;
    
    const total = processedData.reduce((sum, item) => sum + item.amount, 0);
    const average = total / processedData.length;
    const highest = processedData.reduce((max, item) => 
      item.amount > max.amount ? item : max
    );
    const lowest = processedData.reduce((min, item) => 
      item.amount < min.amount ? item : min
    );

    return { total, average, highest, lowest, count: processedData.length };
  }, [processedData]);

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
        <Paper sx={{ p: 2, border: '1px solid #ccc', boxShadow: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
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
    <Box sx={{ p: 2, width: '100%', maxWidth: 'none' }}>


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
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" fontSize={12} />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} 
                  fontSize={12}
                  domain={[(dataMin) => Math.max(0, dataMin * 0.85), 'dataMax']}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            ) : (
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" fontSize={12} />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} 
                  fontSize={12}
                  domain={[(dataMin) => Math.max(0, dataMin * 0.85), 'dataMax']}
                />
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

      {/* Professional Table Section */}
      <Box sx={{ 
        backgroundColor: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          px: 3, 
          py: 2,
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <Typography variant="h6" sx={{ 
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#374151'
          }}>
            {isSingleDataPoint ? 'Summary' : 'Results'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Chip 
              label={`${processedData.length} record${processedData.length > 1 ? 's' : ''}`} 
              sx={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
              size="small"
            />
            <Tooltip title="Export Data">
              <IconButton 
                onClick={exportToCSV} 
                sx={{
                  backgroundColor: '#f3f4f6',
                  '&:hover': { backgroundColor: '#e5e7eb' },
                  borderRadius: 1.5,
                  p: 1
                }}
                size="small"
              >
                <Download sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
          
        <TableContainer>
          <Table sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                {Object.keys(data[0] || {}).map((fieldKey) => (
                  <TableCell 
                    key={fieldKey} 
                    sx={{ 
                      py: 2,
                      px: 3,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      borderBottom: '2px solid #e5e7eb',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {fieldKey
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())
                    }
                  </TableCell>
                ))}
                {!isSingleDataPoint && (
                  <TableCell 
                    align="center" 
                    sx={{ 
                      py: 2,
                      px: 3,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      borderBottom: '2px solid #e5e7eb',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Share
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {processedData.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    backgroundColor: insights && item.amount === insights.highest.amount ? '#fef3c7' : '#ffffff',
                    '&:hover': { backgroundColor: '#f9fafb' },
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  {Object.keys(data[0] || {}).map((fieldKey) => (
                    <TableCell 
                      key={fieldKey}
                      sx={{
                        py: 2.5,
                        px: 3,
                        fontSize: '0.875rem',
                        color: '#374151',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      {(() => {
                        // Enhanced currency detection logic - exclude weekday and other text fields
                        const isWeekdayField = fieldKey.toLowerCase().includes('weekday') || 
                                             fieldKey.toLowerCase().includes('day') ||
                                             fieldKey.toLowerCase().includes('date');
                        
                        const isCountField = fieldKey.toLowerCase().includes('customer') ||
                                           fieldKey.toLowerCase().includes('count') ||
                                           fieldKey.toLowerCase().includes('unique');
                        
                        const isCurrencyField = !isWeekdayField && !isCountField && (
                          (fieldMapping && fieldKey === fieldMapping.yAxis) || 
                          fieldKey.toLowerCase().includes('disbursement') ||
                          fieldKey.toLowerCase().includes('amount') ||
                          fieldKey.toLowerCase().includes('total')
                        );
                        
                        const isNumericValue = typeof data[index][fieldKey] === 'number';
                        
                        if (isCurrencyField && isNumericValue) {
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                backgroundColor: '#dcfce7',
                                borderRadius: 1,
                                px: 1.5,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <CurrencyRupee sx={{ fontSize: 16, color: '#16a34a' }} />
                                <Typography sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: '#16a34a',
                                  fontFamily: 'monospace'
                                }}>
                                  {new Intl.NumberFormat('en-IN').format(data[index][fieldKey])}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        } else if (fieldKey.toLowerCase().includes('weekday') || fieldKey.toLowerCase().includes('day')) {
                          // Convert weekday numbers to day names
                          const weekdayNames = {
                            1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
                            5: 'Friday', 6: 'Saturday', 7: 'Sunday'
                          };
                          const dayName = weekdayNames[data[index][fieldKey]] || data[index][fieldKey];
                          
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                                {dayName}
                              </Typography>
                              {insights && processedData[index]?.amount === insights.highest.amount && (
                                <Chip 
                                  label="Peak" 
                                  size="small" 
                                  sx={{
                                    backgroundColor: '#fbbf24',
                                    color: '#92400e',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                              {insights && processedData[index]?.amount === insights.lowest.amount && (
                                <Chip 
                                  label="Low" 
                                  size="small" 
                                  sx={{
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                            </Box>
                          );
                        } else if (fieldKey.toLowerCase().includes('week_number') || fieldKey.toLowerCase().includes('week')) {
                          // Convert week numbers to date ranges
                          const weekInfo = getWeekDateRange(data[index][fieldKey]);
                          const weekDisplay = weekInfo.monthWeek;
                          
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                                {weekDisplay}
                              </Typography>
                              {insights && processedData[index]?.amount === insights.highest.amount && (
                                <Chip 
                                  label="Peak" 
                                  size="small" 
                                  sx={{
                                    backgroundColor: '#fbbf24',
                                    color: '#92400e',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                              {insights && processedData[index]?.amount === insights.lowest.amount && (
                                <Chip 
                                  label="Low" 
                                  size="small" 
                                  sx={{
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                        </Box>
                          );
                        } else {
                          return (
                            <Typography sx={{ fontWeight: 500, color: '#6b7280' }}>
                              {data[index][fieldKey]}
                            </Typography>
                          );
                        }
                      })()}
                    </TableCell>
                  ))}
                  {!isSingleDataPoint && (
                    <TableCell 
                      align="center"
                      sx={{
                        py: 2.5,
                        px: 3,
                        fontSize: '0.875rem',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <Typography sx={{ 
                        fontWeight: 600,
                        color: '#6366f1',
                        backgroundColor: '#e0e7ff',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        fontSize: '0.75rem'
                      }}>
                        {insights ? ((processedData[index]?.amount / insights.total) * 100).toFixed(1) : '0'}%
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {insights && !isSingleDataPoint && (
                <TableRow sx={{ 
                  backgroundColor: '#f1f5f9',
                  borderTop: '2px solid #e2e8f0'
                }}>
                  <TableCell sx={{ 
                    py: 2.5,
                    px: 3,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#1e293b',
                    borderBottom: 'none'
                  }}>
                    TOTAL
                  </TableCell>
                  {Object.keys(data[0] || {}).slice(1).map((fieldKey) => (
                    <TableCell key={fieldKey} sx={{ 
                      py: 2.5,
                      px: 3,
                      borderBottom: 'none'
                    }}>
                      {(() => {
                        // Check if this field should show currency and has valid total
                        const isWeekdayField = fieldKey.toLowerCase().includes('weekday') || 
                                             fieldKey.toLowerCase().includes('day') ||
                                             fieldKey.toLowerCase().includes('date');
                        
                        const isCountField = fieldKey.toLowerCase().includes('customer') ||
                                           fieldKey.toLowerCase().includes('count') ||
                                           fieldKey.toLowerCase().includes('unique');
                        
                        const isCurrencyField = !isWeekdayField && !isCountField && (
                          (fieldMapping && fieldKey === fieldMapping.yAxis) || 
                          fieldKey.toLowerCase().includes('disbursement') ||
                          fieldKey.toLowerCase().includes('amount') ||
                          fieldKey.toLowerCase().includes('total')
                        );
                        
                        // Calculate total for this field if it's numeric
                        const fieldTotal = data.reduce((sum, item) => {
                          const value = item[fieldKey];
                          return typeof value === 'number' ? sum + value : sum;
                        }, 0);
                        
                        const hasValidTotal = fieldTotal > 0;
                        
                        if (isCurrencyField && hasValidTotal) {
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                backgroundColor: '#1e40af',
                                borderRadius: 1,
                                px: 1.5,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <CurrencyRupee sx={{ fontSize: 16, color: '#ffffff' }} />
                                <Typography sx={{ 
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  color: '#ffffff',
                                  fontFamily: 'monospace'
                                }}>
                                  {new Intl.NumberFormat('en-IN').format(fieldTotal)}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        } else if (!isWeekdayField && !hasValidTotal) {
                          // Don't show anything for non-currency fields or fields without valid totals
                          return null;
                        } else {
                          return (
                            <Typography sx={{ fontWeight: 600, color: '#64748b' }}>—</Typography>
                          );
                        }
                      })()}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ 
                    py: 2.5,
                    px: 3,
                    borderBottom: 'none'
                  }}>
                    <Typography sx={{ 
                      fontWeight: 700,
                      color: '#1e40af',
                      backgroundColor: '#dbeafe',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      fontSize: '0.75rem'
                    }}>
                      100%
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default DynamicDataVisualization;
