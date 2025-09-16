"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  CircularProgress,
  Fab,
  Grow,
  Zoom
} from '@mui/material';
import {
  AccountBalance,
  Timeline,
  Assessment,
  TrendingUp,
  Speed,
  Security,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import PieChartComponent from '../../components/charts/PieChartComponent';

const AnimatedCountUp = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    
    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(counter);
  }, [end, duration]);
  
  return <span>{count}{suffix}</span>;
};

const MetricCard = ({ title, value, icon, color, gradient, percentage, trend, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={1000 + delay}>
      <Card sx={{ 
        height: '100%',
        background: gradient || `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1
              }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ 
                fontWeight: 700,
                color: color,
                mt: 1,
                fontFamily: 'monospace'
              }}>
                <AnimatedCountUp end={value} suffix={percentage ? '%' : ''} />
              </Typography>
              {trend && (
                <Chip 
                  icon={<TrendingUpIcon />}
                  label={`+${trend}% vs last hour`}
                  size="small"
                  sx={{ 
                    mt: 1,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main
                  }}
                />
              )}
            </Box>
            <Box sx={{ 
              backgroundColor: alpha(color, 0.1),
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

const ReconciliationWidget = ({ data, title, delay = 0 }) => {
  const theme = useTheme();
  
  if (!data || !data.summary) return null;
  
  const { summary } = data;
  const successRate = Math.round((summary.full_matches / (summary.total_ktp_records || summary.total_xmm_records)) * 100);
  
  const chartData = [
    { name: 'Matches', value: successRate, count: summary.full_matches, fill: theme.palette.success.main },
    { name: 'Mismatches', value: Math.round((summary.mismatches / (summary.total_ktp_records || summary.total_xmm_records)) * 100), count: summary.mismatches, fill: theme.palette.error.main },
    { name: 'Missing', value: 100 - successRate - Math.round((summary.mismatches / (summary.total_ktp_records || summary.total_xmm_records)) * 100), count: (summary.missing_in_xmm || 0) + (summary.missing_in_ktp || 0) + (summary.missing_in_sam || 0), fill: theme.palette.warning.main }
  ].filter(item => item.value > 0);
  
  return (
    <Grow in timeout={1000 + delay}>
      <Card sx={{ 
        height: '100%',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <BankIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Chip 
              label={`${successRate}%`}
              sx={{ 
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 600
              }}
            />
          </Stack>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <PieChartComponent
                data={chartData}
                height={200}
                innerRadius="60%"
                outerRadius="90%"
                showLegend={false}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Records</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    <AnimatedCountUp end={summary.total_ktp_records || summary.total_xmm_records} />
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={successRate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #4caf50, #66bb6a)'
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {successRate}% Match Rate
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grow>
  );
};

export default function ReconciliationDashboard() {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // For demo purposes, using the provided sample data
      // Replace with actual API call: const response = await fetch('/dashboard-bob');
      const sampleData = {
        "KTP_vs_XMM": {
          "reconciliation_pair": "KTP_vs_XMM",
          "timestamp": "2025-09-15T13:58:27.028995Z",
          "summary": {
            "total_ktp_records": 100,
            "total_xmm_records": 95,
            "full_matches": 85,
            "mismatches": 10,
            "missing_in_xmm": 5,
            "missing_in_ktp": 10
          }
        },
        "XMM_vs_SAM": {
          "reconciliation_pair": "XMM_vs_SAM",
          "timestamp": "2025-09-15T13:58:27.028995Z",
          "summary": {
            "total_xmm_records": 95,
            "total_sam_records": 90,
            "full_matches": 80,
            "mismatches": 5,
            "missing_in_sam": 10,
            "missing_in_xmm": 5
          }
        },
        "KTP_vs_XMM_vs_SAM": {
          "reconciliation_type": "KTP_vs_XMM_vs_SAM",
          "timestamp": "2025-09-15T13:58:27.028995Z",
          "summary": {
            "total_ktp_records": 100,
            "total_xmm_records": 95,
            "total_sam_records": 90,
            "full_matches": 75,
            "mismatches": 15,
            "data_breaks": 5
          }
        }
      };
      
      setDashboardData(sampleData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (loading && !dashboardData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }
  
  const totalRecords = dashboardData?.KTP_vs_XMM?.summary?.total_ktp_records || 0;
  const totalMatches = (dashboardData?.KTP_vs_XMM?.summary?.full_matches || 0) + 
                      (dashboardData?.XMM_vs_SAM?.summary?.full_matches || 0);
  const totalMismatches = (dashboardData?.KTP_vs_XMM?.summary?.mismatches || 0) + 
                         (dashboardData?.XMM_vs_SAM?.summary?.mismatches || 0);
  const overallSuccessRate = Math.round((totalMatches / (totalRecords * 2)) * 100);
  
  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <DashboardIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Reconciliation Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <RefreshIcon sx={{ 
                color: theme.palette.primary.main,
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Records"
            value={totalRecords}
            icon={<AssessmentIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
            color={theme.palette.primary.main}
            trend={5}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Success Rate"
            value={overallSuccessRate}
            percentage={true}
            icon={<SpeedIcon sx={{ fontSize: 28, color: theme.palette.success.main }} />}
            color={theme.palette.success.main}
            trend={2}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Matches"
            value={totalMatches}
            icon={<CheckCircleIcon sx={{ fontSize: 28, color: theme.palette.info.main }} />}
            color={theme.palette.info.main}
            trend={8}
            delay={400}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mismatches"
            value={totalMismatches}
            icon={<ErrorIcon sx={{ fontSize: 28, color: theme.palette.error.main }} />}
            color={theme.palette.error.main}
            delay={600}
          />
        </Grid>
      </Grid>
      
      {/* Reconciliation Widgets */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ReconciliationWidget 
            data={dashboardData?.KTP_vs_XMM} 
            title="KTP vs XMM Reconciliation"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ReconciliationWidget 
            data={dashboardData?.XMM_vs_SAM} 
            title="XMM vs SAM Reconciliation"
            delay={200}
          />
        </Grid>
      </Grid>
      
      {/* Floating Action Button for Quick Actions */}
      <Zoom in timeout={1500}>
        <Fab 
          color="primary" 
          sx={{ 
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          onClick={handleRefresh}
        >
          <TimelineIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}
