"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Speed,
  CheckCircle,
  Description,
  AttachMoney,
} from "@mui/icons-material";
import queryLearningService from "@/services/queryLearningService";

const MetricsDashboard = ({ connectionId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [dailyMetrics, setDailyMetrics] = useState([]);

  useEffect(() => {
    if (connectionId) {
      loadMetrics();
    }
  }, [connectionId]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get summary metrics
      const summaryData = await queryLearningService.getMetricsSummary(
        connectionId
      );
      setSummary(summaryData);

      // Get last 30 days of daily metrics
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const dailyData = await queryLearningService.getDailyMetrics(
        connectionId,
        startDate,
        endDate
      );
      setDailyMetrics(dailyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(0)}%`;

  const formatCurrency = (value) => `$${value?.toFixed(3) || "0.000"}`;

  const getSuccessRateColor = (rate) => {
    if (rate >= 0.85) return "#48bb78";
    if (rate >= 0.7) return "#f6ad55";
    return "#f56565";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No metrics available for this connection.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <TrendingUp sx={{ color: "white" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Queries This Month
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatNumber(summary.total_queries_month)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${getSuccessRateColor(summary.success_rate)} 0%, ${getSuccessRateColor(summary.success_rate)}dd 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <CheckCircle sx={{ color: "white" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: getSuccessRateColor(summary.success_rate) }}
              >
                {formatPercentage(summary.success_rate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Speed sx={{ color: "white" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Template Match Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatPercentage(summary.template_match_rate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Description sx={{ color: "white" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Learned Examples
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatNumber(summary.learned_examples)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <CheckCircle sx={{ color: "white" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Avg Confidence
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatPercentage(summary.avg_confidence_score)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <AttachMoney sx={{ color: "white" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Cost Per Query
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(summary.cost_per_query_usd)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Success Rate Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" gutterBottom>
              Success Rate Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="metric_date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  stroke="#64748b"
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  stroke="#64748b"
                />
                <Tooltip
                  formatter={(value) => `${(value * 100).toFixed(1)}%`}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successful_queries"
                  stroke="#48bb78"
                  strokeWidth={2}
                  name="Success Count"
                  dot={{ fill: "#48bb78", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Template Match Rate Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" gutterBottom>
              Template Match Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="metric_date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="template_matched_queries"
                  stroke="#667eea"
                  strokeWidth={2}
                  name="Template Matches"
                  dot={{ fill: "#667eea", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Query Volume */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" gutterBottom>
              Daily Query Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="metric_date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="total_queries" fill="#4facfe" name="Total Queries" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Cost Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" gutterBottom>
              Daily Cost
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="metric_date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  stroke="#64748b"
                />
                <YAxis
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  stroke="#64748b"
                />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_cost_usd"
                  stroke="#fa709a"
                  strokeWidth={2}
                  name="Cost (USD)"
                  dot={{ fill: "#fa709a", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Version Info */}
      <Paper sx={{ p: 3, mt: 3, border: "1px solid #e2e8f0" }}>
        <Typography variant="body2" color="text.secondary">
          Current Version: <strong>{summary.current_version}</strong> • Active
          Templates: <strong>{summary.active_templates}</strong>
        </Typography>
      </Paper>
    </Box>
  );
};

export default MetricsDashboard;
