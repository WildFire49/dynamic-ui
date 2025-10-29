import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  alpha,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as EmojiEventsIcon,
  Analytics as AnalyticsIcon,
  Compare as CompareIcon,
  Star as StarIcon,
  LocalFireDepartment as FireDepartmentIcon,
  Flag as FlagIcon,
  Lightbulb as LightbulbIcon,
  QueryStats as QueryStatsIcon,
  Leaderboard as LeaderboardIcon,
  DonutLarge as DonutLargeIcon,
  DataUsage as DataUsageIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";

const AnalysisSummaryWidget = ({
  data,
  loading = false,
  title = "Analysis Summary",
  metadata = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Get insights directly from API response
  const insights = useMemo(() => {
    if (!data) return [];

    // Check if analysis array exists in the data
    if (data.analysis && Array.isArray(data.analysis)) {
      return data.analysis;
    }

    // Fallback to empty array if no analysis provided
    return [];
  }, [data]);

  // Widget configurations for different metric types
  const metricWidgets = useMemo(() => {
    if (!data) return [];

    const widgets = [];
    const supportingData = data.supporting_data || [];
    const summary = data.summary || {};

    // Check if this is productivity/regional data (has region, state, work_date)
    const isProductivityData =
      supportingData.length > 0 &&
      (supportingData[0]?.region !== undefined ||
        supportingData[0]?.state !== undefined ||
        supportingData[0]?.work_date !== undefined ||
        supportingData[0]?.work_day !== undefined);

    // Check for specific productivity fields
    const hasRMData = supportingData[0]?.Number_of_RMs !== undefined;
    const hasCollectionData =
      supportingData[0]?.collection_actions !== undefined;
    const hasProductivityData = supportingData[0]?.Productive_RMs !== undefined;

    if (hasRMData) {
      // Total RMs
      const totalRMs = supportingData.reduce(
        (sum, item) => sum + (item.Number_of_RMs || 0),
        0
      );
      widgets.push({
        title: "Total RMs",
        value: totalRMs.toLocaleString(),
        icon: <AssessmentIcon sx={{ color: "white", fontSize: 20 }} />,
        color: theme.palette.primary.main,
      });

      // Productive RMs
      if (hasProductivityData) {
        const productiveRMs = supportingData.reduce(
          (sum, item) => sum + (item.Productive_RMs || 0),
          0
        );
        const productivityRate =
          totalRMs > 0 ? ((productiveRMs / totalRMs) * 100).toFixed(1) : 0;
        widgets.push({
          title: "Productive RMs",
          value: `${productiveRMs} (${productivityRate}%)`,
          icon: <CheckCircleIcon sx={{ color: "white", fontSize: 20 }} />,
          color: theme.palette.success.main,
        });
      }
    }

    if (hasCollectionData) {
      // Total Collection Actions
      const totalCollections = supportingData.reduce(
        (sum, item) => sum + (item.collection_actions || 0),
        0
      );
      widgets.push({
        title: "Collection Actions",
        value: totalCollections.toLocaleString(),
        icon: <BarChartIcon sx={{ color: "white", fontSize: 20 }} />,
        color: theme.palette.info.main,
      });

      // Average per RM
      if (hasRMData) {
        const totalRMs = supportingData.reduce(
          (sum, item) => sum + (item.Number_of_RMs || 0),
          0
        );
        const avgPerRM =
          totalRMs > 0 ? (totalCollections / totalRMs).toFixed(1) : 0;
        widgets.push({
          title: "Avg Actions/RM",
          value: avgPerRM,
          icon: <SpeedIcon sx={{ color: "white", fontSize: 20 }} />,
          color: theme.palette.warning.main,
        });
      }
    }

    // Regions/Banks count
    const regionField = supportingData[0]?.region !== undefined;
    const bankField = supportingData[0]?.bank !== undefined;

    if (regionField) {
      const uniqueRegions = new Set(supportingData.map((item) => item.region))
        .size;
      widgets.push({
        title: "Regions",
        value: uniqueRegions.toLocaleString(),
        icon: <PieChartIcon sx={{ color: "white", fontSize: 20 }} />,
        color: theme.palette.secondary.main,
      });
    }

    if (bankField) {
      const uniqueBanks = new Set(supportingData.map((item) => item.bank)).size;
      widgets.push({
        title: "Banks",
        value: uniqueBanks.toLocaleString(),
        icon: <DonutLargeIcon sx={{ color: "white", fontSize: 20 }} />,
        color: theme.palette.error.main,
      });
    }

    // Fallback to generic widgets if no specific fields found
    // Skip Total Records for productivity/regional data
    if (widgets.length === 0 && !isProductivityData) {
      // Total Records Widget
      if (summary.total_records || supportingData.length > 0) {
        widgets.push({
          title: "Total Records",
          value: (
            summary.total_records || supportingData.length
          ).toLocaleString(),
          icon: <AssessmentIcon sx={{ color: "white", fontSize: 20 }} />,
          color: theme.palette.primary.main,
        });
      }

      // Sum of first numeric field
      const numericFields = Object.keys(supportingData[0] || {}).filter(
        (key) => {
          return (
            typeof supportingData[0][key] === "number" &&
            !key.toLowerCase().includes("id")
          );
        }
      );

      if (numericFields.length > 0) {
        const total = supportingData.reduce(
          (sum, item) => sum + (item[numericFields[0]] || 0),
          0
        );
        widgets.push({
          title: `Total ${numericFields[0]
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}`,
          value: total.toLocaleString(),
          icon: <BarChartIcon sx={{ color: "white", fontSize: 20 }} />,
          color: theme.palette.success.main,
        });
      }
    }

    return widgets.slice(0, 6); // Max 6 widgets
  }, [data, theme]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Don't render if no data or no analysis insights
  if (!data || insights.length === 0) {
    return null;
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: { xs: 3, sm: 4 },
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <AssessmentIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              Key metrics and analytical insights from the data
            </Typography>
          </Box>
        </Box> */}

        {/* Metric Widgets - Compact for few entries */}
        {/* {metricWidgets.length > 0 && (
          <Grid
            container
            spacing={{ xs: 2, sm: 2.5 }}
            sx={{
              mb: 3,
              maxWidth: metricWidgets.length <= 3 ? "900px" : "100%",
              mx: metricWidgets.length <= 3 ? "auto" : 0,
            }}
          >
            {metricWidgets.map((widget, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={metricWidgets.length <= 3 ? 4 : 3}
                key={index}
              >
                <Card
                  elevation={2}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(
                      widget.color,
                      0.05
                    )}, ${alpha(widget.color, 0.1)})`,
                    border: `1px solid ${alpha(widget.color, 0.2)}`,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 32px ${alpha(widget.color, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${
                            widget.color
                          }, ${alpha(widget.color, 0.7)})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {widget.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: widget.color,
                        mb: 0.5,
                        fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2rem" },
                      }}
                    >
                      {widget.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        fontWeight: 500,
                      }}
                    >
                      {widget.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )} */}

        {/* Analytical Insights */}
        <Paper
          elevation={2}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: { xs: 3, sm: 4 },
              borderBottom: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.info.main,
                0.05
              )}, ${alpha(theme.palette.secondary.main, 0.02)})`,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 32px ${alpha(theme.palette.info.main, 0.3)}`,
              }}
            >
              <InsightsIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                Analytical Insights
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                Data-driven observations and key findings
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            {insights.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No analytical insights available for this data.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {insights.map((insight, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor:
                        index % 5 === 0
                          ? alpha(theme.palette.primary.main, 0.02)
                          : index % 5 === 1
                          ? alpha(theme.palette.success.main, 0.02)
                          : index % 5 === 2
                          ? alpha(theme.palette.info.main, 0.02)
                          : index % 5 === 3
                          ? alpha(theme.palette.warning.main, 0.02)
                          : alpha(theme.palette.error.main, 0.02),
                      border: `1px solid ${
                        index % 5 === 0
                          ? alpha(theme.palette.primary.main, 0.1)
                          : index % 5 === 1
                          ? alpha(theme.palette.success.main, 0.1)
                          : index % 5 === 2
                          ? alpha(theme.palette.info.main, 0.1)
                          : index % 5 === 3
                          ? alpha(theme.palette.warning.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1)
                      }`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor:
                          index % 5 === 0
                            ? alpha(theme.palette.primary.main, 0.05)
                            : index % 5 === 1
                            ? alpha(theme.palette.success.main, 0.05)
                            : index % 5 === 2
                            ? alpha(theme.palette.info.main, 0.05)
                            : index % 5 === 3
                            ? alpha(theme.palette.warning.main, 0.05)
                            : alpha(theme.palette.error.main, 0.05),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 20px ${
                          index % 5 === 0
                            ? alpha(theme.palette.primary.main, 0.1)
                            : index % 5 === 1
                            ? alpha(theme.palette.success.main, 0.1)
                            : index % 5 === 2
                            ? alpha(theme.palette.info.main, 0.1)
                            : index % 5 === 3
                            ? alpha(theme.palette.warning.main, 0.1)
                            : alpha(theme.palette.error.main, 0.1)
                        }`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${
                          index % 5 === 0
                            ? theme.palette.primary.main
                            : index % 5 === 1
                            ? theme.palette.success.main
                            : index % 5 === 2
                            ? theme.palette.info.main
                            : index % 5 === 3
                            ? theme.palette.warning.main
                            : theme.palette.error.main
                        }, ${
                          index % 5 === 0
                            ? theme.palette.primary.dark
                            : index % 5 === 1
                            ? theme.palette.success.dark
                            : index % 5 === 2
                            ? theme.palette.info.dark
                            : index % 5 === 3
                            ? theme.palette.warning.dark
                            : theme.palette.error.dark
                        })`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 0.5,
                      }}
                    >
                      {index % 5 === 0 ? (
                        <TrendingUpIcon sx={{ color: "white", fontSize: 22 }} />
                      ) : index % 5 === 1 ? (
                        <CheckCircleIcon
                          sx={{ color: "white", fontSize: 22 }}
                        />
                      ) : index % 5 === 2 ? (
                        <StarIcon sx={{ color: "white", fontSize: 22 }} />
                      ) : index % 5 === 3 ? (
                        <QueryStatsIcon sx={{ color: "white", fontSize: 22 }} />
                      ) : (
                        <LightbulbIcon sx={{ color: "white", fontSize: 22 }} />
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1.1rem" },
                        flex: 1,
                      }}
                    >
                      {insight}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default AnalysisSummaryWidget;
