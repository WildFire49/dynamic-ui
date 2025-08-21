import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  FormControlLabel
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
  TableChart,
  CurrencyRupee
} from '@mui/icons-material';
import FinancialCard from './FinancialCard';

const WeeklyDisbursementDashboard = ({ 
  data = [],
  question = "Weekly Disbursement Analysis",
  showCards = true 
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'chart', 'table'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line'

  // Weekday mapping
  const weekdayNames = {
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };

  // Process data for charts and calculations
  const processedData = useMemo(() => {
    return data.map(item => {
      // Handle both 'weekday' and 'day_of_week' field names for backward compatibility
      const dayNumber = item.weekday || item.day_of_week;
      return {
        ...item,
        weekday: dayNumber, // Normalize to weekday for consistency
        weekdayName: weekdayNames[dayNumber] || `Day ${dayNumber}`,
        formattedAmount: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
        }).format(item.total_disbursements)
      };
    });
  }, [data]);

  // Calculate totals and insights
  const totalDisbursement = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total_disbursements, 0);
  }, [data]);

  const averageDisbursement = useMemo(() => {
    return data.length > 0 ? totalDisbursement / data.length : 0;
  }, [totalDisbursement, data.length]);

  const highestDay = useMemo(() => {
    if (data.length === 0) return null;
    const highest = data.reduce((max, item) => 
      item.total_disbursements > max.total_disbursements ? item : max
    );
    const dayNumber = highest.weekday || highest.day_of_week;
    return {
      ...highest,
      weekday: dayNumber,
      weekdayName: weekdayNames[dayNumber]
    };
  }, [data]);

  // CSV Export function
  const exportToCSV = () => {
    const csvContent = [
      ['Weekday', 'Day Name', 'Total Disbursements (₹)'],
      ...processedData.map(item => [
        item.weekday,
        item.weekdayName,
        item.total_disbursements
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `weekly_disbursements_${new Date().toISOString().split('T')[0]}.csv`);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Weekly Disbursement Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {question}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tooltip title="Export to CSV">
            <IconButton onClick={exportToCSV} color="primary">
              <Download />
            </IconButton>
          </Tooltip>
          
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('cards')}
            startIcon={<CurrencyRupee />}
          >
            Cards
          </Button>
          
          <Button
            variant={viewMode === 'chart' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('chart')}
            startIcon={<BarChartIcon />}
          >
            Chart
          </Button>
          
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('table')}
            startIcon={<TableChart />}
          >
            Table
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                TOTAL DISBURSEMENTS
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CurrencyRupee sx={{ mr: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {new Intl.NumberFormat('en-IN').format(totalDisbursement)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                DAILY AVERAGE
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CurrencyRupee sx={{ mr: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {new Intl.NumberFormat('en-IN').format(averageDisbursement)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                HIGHEST DAY
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {highestDay?.weekdayName || 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CurrencyRupee sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2">
                  {highestDay ? new Intl.NumberFormat('en-IN').format(highestDay.total_disbursements) : '0'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                ACTIVE DAYS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {data.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Days with disbursements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      {viewMode === 'cards' && (
        <Grid container spacing={3}>
          {processedData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.weekday}>
              <FinancialCard
                title={`${item.weekdayName.toUpperCase()} DISBURSEMENTS`}
                amount={item.total_disbursements}
                subtitle={`Day ${item.weekday} of the week`}
                chipLabel={item.weekday === highestDay?.weekday ? 'Highest' : 'Active'}
                showCard={showCards}
                sx={{
                  background: item.weekday === highestDay?.weekday 
                    ? 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)'
                    : `linear-gradient(135deg, hsl(${200 + index * 30}, 70%, 50%) 0%, hsl(${200 + index * 30}, 70%, 70%) 100%)`
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {viewMode === 'chart' && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Weekly Disbursement Trends</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={chartType === 'line'}
                  onChange={(e) => setChartType(e.target.checked ? 'line' : 'bar')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {chartType === 'line' ? <ShowChart /> : <BarChartIcon />}
                  {chartType === 'line' ? 'Line Chart' : 'Bar Chart'}
                </Box>
              }
            />
          </Box>
          
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'bar' ? (
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekdayName" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="total_disbursements" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekdayName" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total_disbursements" 
                  stroke="#1976d2" 
                  strokeWidth={3}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>
      )}

      {viewMode === 'table' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Detailed Disbursement Data</Typography>
              <Chip 
                label={`${data.length} records`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Weekday</strong></TableCell>
                    <TableCell><strong>Day Name</strong></TableCell>
                    <TableCell align="right"><strong>Total Disbursements</strong></TableCell>
                    <TableCell align="center"><strong>% of Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedData.map((item) => (
                    <TableRow 
                      key={item.weekday}
                      sx={{ 
                        backgroundColor: item.weekday === highestDay?.weekday ? 'rgba(255, 152, 0, 0.1)' : 'inherit',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <TableCell>{item.weekday}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.weekdayName}
                          {item.weekday === highestDay?.weekday && (
                            <Chip label="Highest" size="small" color="warning" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <CurrencyRupee sx={{ fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Intl.NumberFormat('en-IN').format(item.total_disbursements)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {((item.total_disbursements / totalDisbursement) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <CurrencyRupee sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {new Intl.NumberFormat('en-IN').format(totalDisbursement)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center"><strong>100%</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WeeklyDisbursementDashboard;
