import {
  Download,
  FileDownload,
  GetApp,
  TableChart,
  Assessment,
  TrendingUp,
  Insights,
  BarChart as BarChartIcon,
  TableRows as TableRowsIcon,
  ShowChart as ShowChartIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChartComponent,
  DataGridComponent,
  PieChartComponent,
  StackedBarChartComponent,
  WaterfallChartComponent,
} from "../charts";
import RMComparisonChart from "./RMComparisonChart";
import RMPerformanceComparison from "./RMPerformanceComparison";
import RMPerformanceOverview from "./RMPerformanceOverview";
import AnalysisSummaryWidget from "../widgets/AnalysisSummaryWidget";
import SaveToDashboardPopover from "../SaveToDashboardPopover";

// Color definitions for various chart elements
const colors = {
  primary: "#3b82f6",
  secondary: "#6b7280",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  critical: "#dc2626",
  states: {
    "Andhra Pradesh": "#8b5cf6",
    Karnataka: "#06b6d4",
    "Tamil Nadu": "#10b981",
    Telangana: "#f59e0b",
    Kerala: "#ef4444",
    Maharashtra: "#ec4899",
    Gujarat: "#6366f1",
    Rajasthan: "#84cc16",
    Punjab: "#f97316",
    Haryana: "#14b8a6",
  },
};

// Helper function to generate colors for stages
const getStageColor = (index, total) => {
  const stageColors = [
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#84cc16", // Lime
    "#f97316", // Orange
    "#14b8a6", // Teal
  ];
  return stageColors[index % stageColors.length];
};

const DynamicDataVisualization = ({
  analysisResult,
  loading = false,
  isFromDashboard = false,
  isWidget = false,
  savedCharts = null,
  savedDataGrid = null,
  savedRMPerformanceData = null,
  savedRMPerformanceOverview = null,
  savedRMPerformanceComparisonChart = null,
}) => {
  // State for selected RMs
  const [selectedRMs, setSelectedRMs] = useState([]);
  const [showTopPerformers, setShowTopPerformers] = useState(true);
  const [showLowPerformers, setShowLowPerformers] = useState(false);

  // Restore selectedRMs from saved data when loading from dashboard
  useEffect(() => {
    if (isFromDashboard && savedRMPerformanceData?.selectedRMs) {
      console.log(
        "🔄 [DEBUG] Restoring selectedRMs from dashboard:",
        savedRMPerformanceData.selectedRMs
      );
      setSelectedRMs(savedRMPerformanceData.selectedRMs);
    }
  }, [isFromDashboard, savedRMPerformanceData]);

  // Search states
  const [topPerformersSearch, setTopPerformersSearch] = useState("");
  const [lowPerformersSearch, setLowPerformersSearch] = useState("");

  // View mode toggle: 'table' or 'chart'
  const [viewMode, setViewMode] = useState("table");

  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Save to Dashboard popover state
  const [saveDashboardAnchorEl, setSaveDashboardAnchorEl] = useState(null);
  const [pendingVisualizationData, setPendingVisualizationData] = useState(null);
  const saveDashboardOpen = Boolean(saveDashboardAnchorEl);

  // Get all RMs from supporting data for infinite scroll
  const getAllRMsFromData = () => {
    if (!analysisResult?.analysis_result?.supporting_data) return [];

    return analysisResult.analysis_result.supporting_data
      .map((rm) => ({
        id: rm.RM_ID || rm["R M I D"] || rm.id,
        name: rm.RM_Name || rm["R M Name"] || rm.name,
        target: parseFloat(rm.D_B_Target || rm["D B Target"] || rm.target || 0),
        achievement: parseFloat(
          rm.D_B_Achievement || rm["D B Achievement"] || rm.achievement || 0
        ),
        achievementRate: rm.target > 0 ? (rm.achievement / rm.target) * 100 : 0,
      }))
      .filter((rm) => rm.name && rm.id)
      .sort((a, b) => b.achievementRate - a.achievementRate);
  };

  // Filter functions for search with infinite data
  const getFilteredTopPerformers = () => {
    const allRMs = getAllRMsFromData();
    const topPerformers = allRMs.filter((rm) => rm.achievementRate >= 50);

    return topPerformers.filter((rm) =>
      rm.name.toLowerCase().includes(topPerformersSearch.toLowerCase())
    );
  };

  const getFilteredLowPerformers = () => {
    const allRMs = getAllRMsFromData();
    const lowPerformers = allRMs.filter((rm) => rm.achievementRate < 50);

    return lowPerformers.filter((rm) =>
      rm.name.toLowerCase().includes(lowPerformersSearch.toLowerCase())
    );
  };

  console.log("DynamicDataVisualization received:", analysisResult);

  // Debug logging
  React.useEffect(() => {
    if (analysisResult?.analysis_result?.supporting_data) {
      console.log("🔍 [DEBUG] Raw analysisResult:", analysisResult);
      console.log(
        "🔍 [DEBUG] Supporting data length:",
        analysisResult.analysis_result.supporting_data.length
      );
      console.log(
        "🔍 [DEBUG] Sample data (first 3):",
        analysisResult.analysis_result.supporting_data.slice(0, 3)
      );
      console.log(
        "🔍 [DEBUG] All data fields:",
        Object.keys(analysisResult.analysis_result.supporting_data[0] || {})
      );

      // Debug each field in detail
      const firstItem = analysisResult.analysis_result.supporting_data[0] || {};
      Object.keys(firstItem).forEach((field) => {
        const value = firstItem[field];
        const isNumeric =
          typeof value === "number" ||
          (value !== null && !isNaN(parseFloat(value)));
        const isPercentage = typeof value === "string" && value.includes("%");
        console.log(
          `🔍 [DEBUG] Field: ${field}, isPercentage: ${isPercentage}, isNumeric: ${isNumeric}, value: ${value}`
        );
      });
    }
  }, [analysisResult]);

  // Detect data type and main field for visualization
  const dataAnalysis = useMemo(() => {
    console.log("🔍 [DEBUG] Starting dataAnalysis...");

    // Check for reconciliation data first
    if (analysisResult && typeof analysisResult === "object") {
      const keys = Object.keys(analysisResult);
      const hasReconciliationPattern = keys.some(
        (key) =>
          key.includes("_vs_") ||
          key.includes("reconciliation") ||
          analysisResult[key]?.reconciliation_pair ||
          analysisResult[key]?.summary?.full_matches !== undefined
      );

      if (hasReconciliationPattern) {
        console.log("🔍 [DEBUG] Detected as reconciliation data");
        return {
          type: "reconciliation",
          scoreField: null,
          pipelineStages: [],
          isTargetVsAchievement: false,
          reconciliationData: analysisResult,
        };
      }
    }

    if (!analysisResult?.analysis_result?.supporting_data) {
      console.log("🔍 [DEBUG] No supporting data found, returning unknown");
      return {
        type: "unknown",
        scoreField: null,
        pipelineStages: [],
        isTargetVsAchievement: false,
      };
    }

    const data = analysisResult.analysis_result.supporting_data;
    if (data.length === 0) {
      console.log("🔍 [DEBUG] Empty data array, returning unknown");
      return {
        type: "unknown",
        scoreField: null,
        pipelineStages: [],
        isTargetVsAchievement: false,
      };
    }

    const firstItem = data[0];
    const fields = Object.keys(firstItem);
    console.log("🔍 [DEBUG] Data fields for analysis:", fields);

    // Check if this is pipeline data by looking for specific pipeline stage fields
    const pipelineFields = [
      "Field_Verification_Pending",
      "R3_R4_ICPH_Pending",
      "Bank_CPH_Pending",
      "E_sign_Pending",
      "Insurance_Pending",
      "Disbursement_Initiate_Pending",
    ];

    // Also check for Total_ prefixed versions (multi-region data)
    const totalPipelineFields = [
      "Total_Field_Verification_Pending",
      "Total_R3_R4_ICPH_Pending",
      "Total_Bank_CPH_Pending",
      "Total_E_sign_Pending",
      "Total_Insurance_Pending",
      "Total_Disbursement_Initiate_Pending",
    ];

    const foundPipelineFields = pipelineFields.filter((field) =>
      fields.includes(field)
    );
    const foundTotalPipelineFields = totalPipelineFields.filter((field) =>
      fields.includes(field)
    );

    console.log("🔍 [DEBUG] Found pipeline fields:", foundPipelineFields);
    console.log(
      "🔍 [DEBUG] Found total pipeline fields:",
      foundTotalPipelineFields
    );

    if (foundPipelineFields.length > 0) {
      console.log("🔍 [DEBUG] Detected as pipeline data (single region)");
      return {
        type: "pipeline",
        scoreField: null,
        pipelineStages: foundPipelineFields,
        isTargetVsAchievement: false,
      };
    }

    if (foundTotalPipelineFields.length > 0) {
      console.log("🔍 [DEBUG] Detected as pipeline data (multi-region)");
      return {
        type: "pipeline",
        scoreField: null,
        pipelineStages: foundTotalPipelineFields,
        isMultiRegion: true,
        isTargetVsAchievement: false,
      };
    }

    // Check for time-series data (date + numeric fields)
    const dateField = fields.find(
      (field) =>
        field.toLowerCase().includes("date") ||
        field.toLowerCase().includes("time") ||
        field.toLowerCase().includes("created") ||
        field.toLowerCase().includes("updated")
    );

    const hasDateData =
      dateField &&
      data.some((item) => {
        const dateValue = item[dateField];
        return (
          dateValue &&
          (dateValue instanceof Date || !isNaN(Date.parse(dateValue)))
        );
      });

    if (hasDateData) {
      console.log("🔍 [DEBUG] Detected as time-series data");

      // Find the main numeric field
      const numericFields = fields.filter((key) => {
        const value = firstItem[key];
        return (
          key !== dateField &&
          (typeof value === "number" ||
            (value !== null && !isNaN(parseFloat(value))))
        );
      });

      const valueField = numericFields[0]; // Use first numeric field

      return {
        type: "timeseries",
        dateField: dateField,
        valueField: valueField,
        scoreField: valueField,
        pipelineStages: [],
        isTargetVsAchievement: false,
      };
    }

    // Check for Target vs Achievement data (RM performance)
    const hasTargetField = fields.some(
      (field) =>
        field.toLowerCase().includes("tar") ||
        field.toLowerCase().includes("target") ||
        field.toLowerCase().includes("disbursement_target") ||
        field.toLowerCase().includes("collection_target")
    );
    const hasAchievementField = fields.some(
      (field) =>
        field.toLowerCase().includes("ach") ||
        field.toLowerCase().includes("achieved") ||
        field.toLowerCase().includes("disbursement_achieved") ||
        field.toLowerCase().includes("collection_achieved")
    );
    const hasRMField = fields.some(
      (field) =>
        field.toLowerCase().includes("rm") ||
        field.toLowerCase().includes("name")
    );

    console.log("🔍 [DEBUG] All fields:", fields);
    console.log(
      "🔍 [DEBUG] Target field check:",
      hasTargetField,
      fields.filter(
        (f) =>
          f.toLowerCase().includes("tar") ||
          f.toLowerCase().includes("target") ||
          f.toLowerCase().includes("disbursement_target") ||
          f.toLowerCase().includes("collection_target")
      )
    );
    console.log(
      "🔍 [DEBUG] Achievement field check:",
      hasAchievementField,
      fields.filter(
        (f) =>
          f.toLowerCase().includes("ach") ||
          f.toLowerCase().includes("achieved") ||
          f.toLowerCase().includes("disbursement_achieved") ||
          f.toLowerCase().includes("collection_achieved")
      )
    );
    console.log(
      "🔍 [DEBUG] RM field check:",
      hasRMField,
      fields.filter(
        (f) =>
          f.toLowerCase().includes("rm") || f.toLowerCase().includes("name")
      )
    );

    if (hasTargetField && hasAchievementField && hasRMField) {
      console.log("🔍 [DEBUG] ✅ DETECTED AS RM PERFORMANCE DATA!");

      // Find the actual field names dynamically with more flexible matching
      const targetField =
        fields.find(
          (f) =>
            f.toLowerCase().includes("tar") ||
            f.toLowerCase().includes("target") ||
            f.toLowerCase().includes("disbursement_target") ||
            f.toLowerCase().includes("collection_target")
        ) || "Disbursement_Target_Lakhs";
      const achievementField =
        fields.find(
          (f) =>
            f.toLowerCase().includes("ach") ||
            f.toLowerCase().includes("achieved") ||
            f.toLowerCase().includes("disbursement_achieved") ||
            f.toLowerCase().includes("collection_achieved")
        ) || "Disbursement_Achieved_Lakhs";
      const nameField =
        fields.find((f) => f.includes("RM_Name") || f.includes("Name")) ||
        "RM_Name";

      const result = {
        type: "performance",
        scoreField: achievementField, // Achievement field for primary metric
        targetField: targetField, // Target field
        achievementField: achievementField, // Achievement field
        nameField: nameField, // Name field for identification
        isTargetVsAchievement: true,
        pipelineStages: [],
      };
      console.log("🔍 [DEBUG] Returning RM performance config:", result);
      console.log("🔍 [DEBUG] Dynamic fields:", {
        targetField,
        achievementField,
        nameField,
      });
      return result;
    }

    // For other performance data, detect numerical fields
    const numericalFields = fields.filter((key) => {
      const value = firstItem[key];
      return (
        typeof value === "number" ||
        (value !== null && !isNaN(parseFloat(value)))
      );
    });

    console.log("🔍 [DEBUG] Numerical fields found:", numericalFields);

    // Find the main score/percentage field
    const scoreField =
      fields.find(
        (field) =>
          field.toLowerCase().includes("score") ||
          field.toLowerCase().includes("percentage") ||
          field.toLowerCase().includes("rate") ||
          field.toLowerCase().includes("percent")
      ) || numericalFields[0];

    console.log(
      "🔍 [DEBUG] Falling back to generic performance with scoreField:",
      scoreField
    );

    return {
      type: "performance",
      scoreField,
      pipelineStages: [],
      isTargetVsAchievement: false,
    };
  }, [analysisResult]);

  const {
    type: dataType,
    scoreField,
    pipelineStages,
    isMultiRegion,
    isTargetVsAchievement,
    targetField,
    achievementField,
    nameField,
    dateField,
    valueField,
  } = dataAnalysis;

  console.log("🔍 [DEBUG] ✅ Data Analysis Result:", dataAnalysis);
  console.log("🔍 [DEBUG] ✅ Extracted values:", {
    dataType,
    scoreField,
    pipelineStages,
    isMultiRegion,
    isTargetVsAchievement,
    targetField,
    achievementField,
    nameField,
    dateField,
    valueField,
  });

  // Pipeline chart generation function
  const generatePipelineCharts = (
    supportingData,
    stages,
    isMultiRegion = false
  ) => {
    if (!supportingData || supportingData.length === 0) {
      return {
        pieChart: null,
        barChart: null,
        branchChart: null,
        waterfallChart: null,
      };
    }

    if (isMultiRegion) {
      // Multi-region stacked bar chart showing all regions with stage breakdowns
      const regionsWithPipeline = supportingData.filter((item) => {
        const totalPipeline = parseFloat(item.Total_Pipeline) || 0;
        return totalPipeline > 0;
      });

      const stageNames = stages.map((stage) =>
        stage
          .replace(/Total_/g, "")
          .replace(/_Pending/g, "")
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim()
      );

      const stackedData = regionsWithPipeline.map((regionData) => {
        const dataPoint = {
          name: regionData.Region, // Required for BarChartComponent
          region: regionData.Region,
          totalPipeline: parseFloat(regionData.Total_Pipeline) || 0,
          value: parseFloat(regionData.Total_Pipeline) || 0, // Primary field for BarChartComponent
        };

        stages.forEach((stage, index) => {
          const stageName = stage
            .replace(/Total_/g, "")
            .replace(/_Pending/g, "")
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();
          dataPoint[stageName] = parseFloat(regionData[stage]) || 0;
        });

        return dataPoint;
      });

      // Create summary data for all stages across regions
      const summaryData = stages
        .map((stage, index) => {
          const stageName = stage
            .replace(/Total_/g, "")
            .replace(/_Pending/g, "")
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();
          const totalValue = supportingData.reduce(
            (sum, item) => sum + (parseFloat(item[stage]) || 0),
            0
          );

          return {
            name: stageName,
            value: totalValue,
            fill: getStageColor(index, stages.length),
            stage: stageName,
          };
        })
        .filter((item) => item.value > 0);

      return {
        pieChart: null,
        barChart:
          stackedData.length > 0
            ? {
                title: "Pipeline by Region and Stage",
                data: stackedData,
                isStacked: true,
                stageNames: stageNames,
              }
            : null,
        branchChart: null,
        waterfallChart:
          summaryData.length > 0
            ? {
                title: "Total Pipeline Summary by Stage",
                data: summaryData,
                totalPipeline: supportingData.reduce(
                  (sum, item) => sum + (parseFloat(item.Total_Pipeline) || 0),
                  0
                ),
              }
            : null,
      };
    } else {
      // Single region pipeline charts (existing logic)
      const firstItem = supportingData[0];

      // Create waterfall data from pipeline stages
      const waterfallData = stages.map((stage, index) => {
        const value = parseFloat(firstItem[stage]) || 0;
        const stageName = stage
          .replace(/_Pending/g, "")
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim();

        return {
          name: stageName,
          value: value,
          cumulative: stages
            .slice(0, index + 1)
            .reduce((sum, s) => sum + (parseFloat(firstItem[s]) || 0), 0),
          fill: getStageColor(index, stages.length),
          stage: stage,
        };
      });

      return {
        pieChart: null, // Hide pie chart for pipeline data
        barChart: null, // Remove duplicate - Pipeline Flow Analysis shows the same data
        branchChart: null, // Hide branch chart for pipeline data
        waterfallChart:
          waterfallData.length > 0
            ? {
                title: "Pipeline Flow Analysis",
                data: waterfallData,
                totalPipeline:
                  firstItem.Total_Pipeline ||
                  waterfallData.reduce((sum, item) => sum + item.value, 0),
              }
            : null,
      };
    }
  };

  // Target vs Achievement chart generation function
  const generateTargetVsAchievementCharts = (
    supportingData,
    targetField,
    achievementField,
    nameField
  ) => {
    console.log("🎯 [DEBUG] ✅ ENTERING generateTargetVsAchievementCharts");
    console.log("🎯 [DEBUG] RM Performance Data Input:", {
      supportingData: supportingData.slice(0, 3),
      supportingDataLength: supportingData.length,
      targetField,
      achievementField,
      nameField,
    });

    // Filter out RMs with 0 targets and calculate achievement percentages
    const rmsWithTargets = supportingData
      .filter((item) => {
        const target = parseFloat(item[targetField]);
        return target > 0;
      })
      .map((item) => ({
        name: item[nameField] || "Unknown RM",
        rmId: item.RM_ID || "Unknown ID",
        target: parseFloat(item[targetField]) || 0,
        achievement: parseFloat(item[achievementField]) || 0,
        achievementRate:
          ((parseFloat(item[achievementField]) || 0) /
            (parseFloat(item[targetField]) || 1)) *
          100,
      }))
      .sort((a, b) => b.achievement - a.achievement); // Sort by achievement descending

    console.log(
      "🎯 [DEBUG] Processed RM Data (first 5):",
      rmsWithTargets.slice(0, 5)
    );

    // Get top performers by achievement, fallback to highest targets if no achievements
    const performingRMs = rmsWithTargets.filter((rm) => rm.achievement > 0);
    const topPerformers =
      performingRMs.length >= 10
        ? performingRMs.slice(0, 15)
        : [
            ...performingRMs,
            ...rmsWithTargets
              .filter((rm) => rm.achievement === 0)
              .slice(0, 15 - performingRMs.length),
          ];

    console.log(
      "🎯 [DEBUG] Top Performers (first 5):",
      topPerformers.slice(0, 5)
    );

    // Create separate data for target and achievement for better visibility
    const comparisonData = topPerformers.map((rm) => ({
      name: rm.name.length > 12 ? rm.name.substring(0, 10) + ".." : rm.name,
      fullName: rm.name,
      rmId: rm.rmId,
      value: parseFloat(rm.achievementRate.toFixed(1)), // Primary field for BarChartComponent
      Target: parseFloat(rm.target.toFixed(2)),
      Achievement: Math.max(parseFloat(rm.achievement.toFixed(2)), 0.1), // Minimum 0.1 for visibility
      "Achievement %": parseFloat(rm.achievementRate.toFixed(1)),
      achievementRate: parseFloat(rm.achievementRate.toFixed(1)), // Alternative field name
    }));

    console.log(
      "🎯 [DEBUG] Final Comparison Data for Chart (first 3):",
      comparisonData.slice(0, 3)
    );
    console.log("🎯 [DEBUG] Chart data structure check:", {
      hasData: comparisonData.length > 0,
      firstItem: comparisonData[0],
      targetValues: comparisonData.slice(0, 3).map((d) => d.Target),
      achievementValues: comparisonData.slice(0, 3).map((d) => d.Achievement),
    });

    // Summary data for totals
    const totalTarget = rmsWithTargets.reduce((sum, rm) => sum + rm.target, 0);
    const totalAchievement = rmsWithTargets.reduce(
      (sum, rm) => sum + rm.achievement,
      0
    );
    const overallAchievementRate =
      totalTarget > 0 ? (totalAchievement / totalTarget) * 100 : 0;

    const summaryData = [
      {
        name: "Overall Summary",
        Target: parseFloat(totalTarget.toFixed(2)),
        Achievement: parseFloat(totalAchievement.toFixed(2)),
        "Achievement %": parseFloat(overallAchievementRate.toFixed(1)),
      },
    ];

    console.log("Summary Data:", summaryData);

    return {
      pieChart: null, // Not relevant for target vs achievement
      barChart:
        comparisonData.length > 0
          ? {
              title: "Top RM Performance - Target vs Achievement (₹ Lakhs)",
              data: comparisonData,
              isTargetVsAchievement: true,
              summary: {
                totalTarget: parseFloat(totalTarget.toFixed(2)),
                totalAchievement: parseFloat(totalAchievement.toFixed(2)),
                achievementRate: parseFloat(overallAchievementRate.toFixed(1)),
                totalRMs: rmsWithTargets.length,
                performingRMs: rmsWithTargets.filter((rm) => rm.achievement > 0)
                  .length,
              },
            }
          : null,
      branchChart: null, // Not relevant
      waterfallChart:
        summaryData.length > 0
          ? {
              title: "Overall Target vs Achievement Summary",
              data: summaryData,
              isTargetVsAchievement: true,
              totalTarget: parseFloat(totalTarget.toFixed(2)),
              totalAchievement: parseFloat(totalAchievement.toFixed(2)),
            }
          : null,
    };
  };

  // Process RM performance data for interactive selection
  const processRMPerformanceData = (
    supportingData,
    targetField,
    achievementField,
    nameField
  ) => {
    console.log(
      "🎯 [DEBUG] Processing RM Performance Data for Interactive Selection"
    );
    console.log("🎯 [DEBUG] Field names:", {
      targetField,
      achievementField,
      nameField,
    });
    console.log("🎯 [DEBUG] Sample data:", supportingData.slice(0, 3));

    // Process all RMs with targets > 0
    const allRMs = supportingData
      .filter((item) => parseFloat(item[targetField]) > 0)
      .map((item) => ({
        id: item.RM_ID || "Unknown ID",
        name: item[nameField] || "Unknown RM",
        target: parseFloat(item[targetField]) || 0,
        achievement: parseFloat(item[achievementField]) || 0,
        achievementRate:
          ((parseFloat(item[achievementField]) || 0) /
            (parseFloat(item[targetField]) || 1)) *
          100,
      }))
      .sort((a, b) => b.achievement - a.achievement);

    console.log("🎯 [DEBUG] Processed RMs:", allRMs.length);
    console.log(
      "🎯 [DEBUG] RMs with achievement > 0:",
      allRMs.filter((rm) => rm.achievement > 0).length
    );
    console.log(
      "🎯 [DEBUG] Top 5 performers:",
      allRMs.filter((rm) => rm.achievement > 0).slice(0, 5)
    );
    console.log(
      "🎯 [DEBUG] Sample achievement values:",
      allRMs.slice(0, 10).map((rm) => ({
        name: rm.name,
        achievement: rm.achievement,
        target: rm.target,
      }))
    );

    // Categorize RMs
    const rmsWithAchievement = allRMs.filter((rm) => rm.achievement > 0);
    const rmsWithoutAchievement = allRMs.filter((rm) => rm.achievement === 0);

    // Top performers: RMs with any achievement, sorted by achievement rate
    const topPerformers = rmsWithAchievement
      .sort((a, b) => b.achievementRate - a.achievementRate)
      .slice(0, 15); // Show more top performers

    // Low performers: RMs with 0 achievement, sorted by target (show highest targets first)
    const lowPerformers = rmsWithoutAchievement
      .sort((a, b) => b.target - a.target)
      .slice(0, 50); // Show more low performers for selection

    // Calculate summary
    const totalTarget = allRMs.reduce((sum, rm) => sum + rm.target, 0);
    const totalAchievement = allRMs.reduce(
      (sum, rm) => sum + rm.achievement,
      0
    );
    const overallAchievementRate =
      totalTarget > 0 ? (totalAchievement / totalTarget) * 100 : 0;
    const activeRMs = allRMs.filter((rm) => rm.achievement > 0).length;

    return {
      allRMs,
      topPerformers,
      lowPerformers,
      selectedRMs: [], // Initialize empty, will be populated by user selection or restored from saved data
      summary: {
        totalTarget: `₹${totalTarget.toFixed(1)}L`,
        totalAchievement: `₹${totalAchievement.toFixed(1)}L`,
        achievementRate: `${overallAchievementRate.toFixed(1)}%`,
        activeRMs: `${activeRMs}/${allRMs.length}`,
      },
    };
  };

  // Generate chart data based on data type - MODULAR APPROACH
  const chartData = useMemo(() => {
    console.log("📊 [DEBUG] ✅ STARTING chartData generation...");
    console.log("📊 [DEBUG] Props received:", {
      isFromDashboard,
      hasSavedCharts: !!savedCharts,
      hasSavedRMPerformanceData: !!savedRMPerformanceData,
      hasSavedRMPerformanceOverview: !!savedRMPerformanceOverview,
      hasSavedRMPerformanceComparisonChart: !!savedRMPerformanceComparisonChart,
    });

    // DASHBOARD MODE: Load saved data with priority system
    if (isFromDashboard) {
      // Priority 1: RM Performance data (Overview + Comparison Chart)
      if (savedRMPerformanceOverview || savedRMPerformanceComparisonChart) {
        console.log("📊 [DEBUG] Loading RM Performance data from dashboard");
        return {
          rmPerformanceData: {
            summary: savedRMPerformanceOverview || {
              totalTarget: "₹0.0L",
              totalAchievement: "₹0.0L",
              achievementRate: "0.0%",
              activeRMs: "0/0",
            },
          },
          rmPerformanceComparisonChart: savedRMPerformanceComparisonChart,
        };
      }

      // Priority 2: Legacy RM Performance data
      if (savedRMPerformanceData) {
        console.log(
          "📊 [DEBUG] Loading legacy RM Performance data from dashboard"
        );
        return { rmPerformanceData: savedRMPerformanceData };
      }

      // Priority 3: Standard charts (only if they have actual data)
      if (
        savedCharts &&
        Object.values(savedCharts).some(
          (chart) => chart !== null && chart !== undefined
        )
      ) {
        console.log(
          "📊 [DEBUG] Loading standard charts from dashboard:",
          savedCharts
        );
        return savedCharts;
      }

      // If dashboard mode but no saved data, return empty structure
      return {
        pieChart: null,
        barChart: null,
        branchChart: null,
        waterfallChart: null,
      };
    }

    console.log("📊 [DEBUG] Input conditions:", {
      hasAnalysisResult: !!analysisResult?.analysis_result?.supporting_data,
      dataType,
      isTargetVsAchievement,
      targetField,
      achievementField,
      nameField,
    });

    if (!analysisResult?.analysis_result?.supporting_data) {
      console.log("📊 [DEBUG] ❌ No supporting data found");
      return {
        pieChart: null,
        barChart: null,
        branchChart: null,
        waterfallChart: null,
      };
    }

    const supportingData = analysisResult.analysis_result.supporting_data;
    if (supportingData.length === 0) {
      console.log("📊 [DEBUG] ❌ Empty supporting data array");
      return {
        pieChart: null,
        barChart: null,
        branchChart: null,
        waterfallChart: null,
      };
    }

    console.log(
      "📊 [DEBUG] ✅ Supporting data available, length:",
      supportingData.length
    );

    // Handle time-series data
    if (dataType === "timeseries" && dateField && valueField) {
      console.log("📊 [DEBUG] Processing as time-series data");

      const timeSeriesData = supportingData
        .map((item) => ({
          date: item[dateField],
          value: parseFloat(item[valueField]) || 0,
          name: new Date(item[dateField]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: item[dateField],
          fill: "#0078d7",
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const fieldLabel = valueField
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .trim();

      return {
        pieChart: null,
        barChart: {
          title: `${fieldLabel} Over Time`,
          data: timeSeriesData,
          isTimeSeries: true,
        },
        branchChart: null,
        waterfallChart: null,
      };
    }

    // Handle pipeline data differently
    if (dataType === "pipeline") {
      console.log("📊 [DEBUG] Processing as pipeline data");
      return generatePipelineCharts(
        supportingData,
        pipelineStages,
        isMultiRegion
      );
    }

    // Handle Target vs Achievement data (RM Performance)
    if (isTargetVsAchievement && targetField && achievementField && nameField) {
      console.log(
        "📊 [DEBUG] ✅ Processing as RM Performance data (Target vs Achievement)"
      );
      console.log("📊 [DEBUG] Fields:", {
        targetField,
        achievementField,
        nameField,
      });
      const rmData = processRMPerformanceData(
        analysisResult.analysis_result.supporting_data,
        targetField,
        achievementField,
        nameField
      );
      console.log("📊 [DEBUG] ✅ Processed RM Performance data:", rmData);
      return { rmPerformanceData: rmData };
    } else {
      console.log("📊 [DEBUG] ❌ Target vs Achievement conditions not met:", {
        isTargetVsAchievement,
        hasTargetField: !!targetField,
        hasAchievementField: !!achievementField,
        hasNameField: !!nameField,
        dataAnalysis,
      });
    }

    // For non-pipeline data, require scoreField
    if (!scoreField)
      return {
        pieChart: null,
        barChart: null,
        branchChart: null,
        waterfallChart: null,
      };

    const firstItem = supportingData[0];

    console.log("All fields:", Object.keys(firstItem));
    console.log("Selected score field:", scoreField);
    console.log("First item sample:", firstItem);

    // State-wise collection percentage analysis
    let pieChart = null;
    if (firstItem.State !== undefined && scoreField) {
      console.log("Creating pie chart with scoreField:", scoreField);
      const stateData = {};

      supportingData.forEach((item) => {
        const state = item.State || "Unknown";
        const score = item[scoreField];

        if (!stateData[state]) {
          stateData[state] = { totalScore: 0, count: 0, validScores: [] };
        }

        // For percentage fields, only include non-null values
        if (scoreField.toLowerCase().includes("percentage")) {
          if (
            score !== null &&
            score !== undefined &&
            score !== "NULL" &&
            !isNaN(parseFloat(score)) &&
            parseFloat(score) > 0
          ) {
            stateData[state].validScores.push(parseFloat(score));
            stateData[state].totalScore += parseFloat(score);
            stateData[state].count++;
          }
        } else {
          const numericScore = parseFloat(score) || 0;
          stateData[state].validScores.push(numericScore);
          stateData[state].totalScore += numericScore;
          stateData[state].count++;
        }
      });

      const stateChartData = Object.entries(stateData)
        .filter(([state, data]) => data.count > 0)
        .map(([state, data]) => {
          const avgScore = data.totalScore / data.count;
          return {
            name: state,
            value: Number(avgScore.toFixed(2)),
            count: data.count,
            fill: colors.states[state] || colors.secondary,
          };
        })
        .sort((a, b) => b.value - a.value);

      if (stateChartData.length > 0) {
        const fieldLabel = scoreField
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim();
        pieChart = {
          title: `Average ${fieldLabel} by State`,
          data: stateChartData,
        };
      }
    }

    // Region-wise chart showing actual values from the detected score field
    let barChart = null;
    if (firstItem.Region !== undefined && scoreField) {
      console.log("Creating bar chart with scoreField:", scoreField);
      const regionScores = {};
      const regionCounts = {};

      supportingData.forEach((item) => {
        const region = (item.Region || "Unknown").trim();
        const score = item[scoreField];

        // For percentage fields, only include non-null values
        if (scoreField.toLowerCase().includes("percentage")) {
          if (
            score !== null &&
            score !== undefined &&
            score !== "NULL" &&
            !isNaN(parseFloat(score)) &&
            parseFloat(score) > 0
          ) {
            if (!regionScores[region]) {
              regionScores[region] = [];
              regionCounts[region] = 0;
            }
            regionScores[region].push(parseFloat(score));
            regionCounts[region]++;
          }
        } else {
          // For other fields, use 0 as default
          const numericScore = parseFloat(score) || 0;
          if (!regionScores[region]) {
            regionScores[region] = [];
            regionCounts[region] = 0;
          }
          regionScores[region].push(numericScore);
          regionCounts[region]++;
        }
      });

      // Calculate average scores per region (only if we have data)
      const regionData = Object.entries(regionScores)
        .filter(([region, scores]) => scores.length > 0) // Only include regions with data
        .map(([region, scores]) => {
          const avgScore =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          return {
            name: region.length > 8 ? region.substring(0, 8) + "..." : region, // BarChartComponent expects 'name'
            region: region.length > 8 ? region.substring(0, 8) + "..." : region,
            value: Number(avgScore.toFixed(2)), // BarChartComponent expects 'value'
            avgScore: Number(avgScore.toFixed(2)),
            count: regionCounts[region],
            // Dynamic coloring based on field type and value range
            fill: scoreField.toLowerCase().includes("percentage")
              ? // For percentages: red (0-20%), orange (20-40%), yellow (40-60%), light green (60-80%), green (80-100%)
                avgScore >= 80
                ? colors.success
                : avgScore >= 60
                ? "#22c55e"
                : avgScore >= 40
                ? colors.warning
                : avgScore >= 20
                ? colors.error
                : colors.critical
              : // For scores: use original logic
              avgScore === -1.0
              ? colors.critical
              : avgScore >= -0.9 && avgScore < -0.8
              ? colors.error
              : avgScore >= -0.7 && avgScore < -0.5
              ? colors.warning
              : avgScore >= -0.5
              ? colors.success
              : colors.primary,
          };
        })
        .sort((a, b) =>
          scoreField.toLowerCase().includes("percentage")
            ? b.avgScore - a.avgScore
            : a.avgScore - b.avgScore
        ) // Sort by score (best first for percentage, worst first for scores)
        .slice(0, 12); // Show top 12 regions

      // Only create chart if we have data
      if (regionData.length > 0) {
        const fieldLabel = scoreField
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim();
        barChart = {
          title: `Average ${fieldLabel} by Region`,
          data: regionData,
        };

        console.log("Region chart data:", {
          totalRegions: Object.keys(regionScores).length,
          regionData: regionData.map((r) => ({
            ...r,
            avgScore: Number(r.avgScore.toFixed(2)),
          })),
          scoreField: scoreField,
        });
      }
    }

    // Branch-wise performance chart for worst performing branches
    let branchChart = null;

    // Always create branch chart if we have supporting data with branch names and scores
    if (supportingData.length > 0) {
      // Check if data contains branch information
      const branchField = Object.keys(firstItem).find(
        (key) => key.toLowerCase().includes("branch") && firstItem[key]
      );

      console.log(
        "Branch field found:",
        branchField,
        "Score field:",
        scoreField
      );

      const hasValidBranchData = supportingData.some(
        (item) =>
          item &&
          branchField &&
          item[branchField] &&
          scoreField &&
          (typeof item[scoreField] === "number" ||
            !isNaN(parseFloat(item[scoreField])))
      );

      if (hasValidBranchData) {
        // Extract threshold and operation from the question dynamically
        const question = analysisResult?.question || "";
        const fieldLabel = scoreField
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim()
          .toLowerCase();

        // Check for different query patterns (more flexible to handle any field)
        const lessThanMatch =
          question.match(
            new RegExp(`${fieldLabel}\s*less than\s*(-?\d+\.?\d*)`, "i")
          ) ||
          question.match(/less than\s*(-?\d+\.?\d*)/i) ||
          question.match(/[<≤]\s*(-?\d+\.?\d*)/i) ||
          question.match(/(-?\d+\.?\d*)\s*or\s*less/i);

        const moreThanMatch =
          question.match(
            new RegExp(`${fieldLabel}\s*more than\s*(-?\d+\.?\d*)`, "i")
          ) ||
          question.match(/more than\s*(-?\d+\.?\d*)/i) ||
          question.match(/greater than\s*(-?\d+\.?\d*)/i) ||
          question.match(/[>≥]\s*(-?\d+\.?\d*)/i);

        let threshold, operator, titlePrefix;

        if (moreThanMatch) {
          threshold = parseFloat(moreThanMatch[1]);
          operator =
            question.includes("more than") || question.includes(">")
              ? ">"
              : "≥";
          titlePrefix = scoreField.toLowerCase().includes("percentage")
            ? "High Performing Branches"
            : "Better Performing Branches";
        } else if (lessThanMatch) {
          threshold = parseFloat(lessThanMatch[1]);
          operator =
            question.includes("less than") || question.includes("<")
              ? "<"
              : "≤";
          titlePrefix = scoreField.toLowerCase().includes("percentage")
            ? "Low Performing Branches"
            : "Worst Performing Branches";
        } else {
          // Default based on data analysis and field type
          const validScores = supportingData
            .map((item) => parseFloat(item[scoreField]))
            .filter((score) => !isNaN(score));

          if (validScores.length === 0) {
            threshold = 0;
            operator = "≥";
            titlePrefix = "All Branches";
          } else {
            const avgScore =
              validScores.reduce((sum, score) => sum + score, 0) /
              validScores.length;

            if (scoreField.toLowerCase().includes("percentage")) {
              // For percentages, show branches with data (not null)
              threshold = 0;
              operator = "≥";
              titlePrefix = "Branches with Collection Data";
            } else {
              threshold = avgScore > 0 ? 0 : -0.6;
              operator = avgScore > 0 ? ">" : "≤";
              titlePrefix =
                avgScore > 0
                  ? "Better Performing Branches"
                  : "Worst Performing Branches";
            }
          }
        }

        // Process all branches from supporting data (they're already filtered by the API)
        const branchData = supportingData
          .filter((item) => {
            // Filter out null/undefined values for percentage fields
            if (scoreField.toLowerCase().includes("percentage")) {
              return (
                item[branchField] &&
                item[scoreField] !== null &&
                item[scoreField] !== undefined &&
                !isNaN(parseFloat(item[scoreField]))
              );
            }
            return (
              item[branchField] &&
              (typeof item[scoreField] === "number" ||
                !isNaN(parseFloat(item[scoreField])))
            );
          })
          .map((item) => ({
            name:
              item[branchField].length > 12
                ? item[branchField].substring(0, 12) + "..."
                : item[branchField],
            branch:
              item[branchField].length > 12
                ? item[branchField].substring(0, 12) + "..."
                : item[branchField],
            fullName: item[branchField],
            value: Number(parseFloat(item[scoreField]).toFixed(2)), // Primary field for BarChartComponent
            score: Number(parseFloat(item[scoreField]).toFixed(2)),
            region: (item.Region || "Unknown").trim(),
            state: item.State || "Unknown",
            // Dynamic coloring based on field type and value
            fill: scoreField.toLowerCase().includes("percentage")
              ? // For percentages: red (0-20%), orange (20-40%), yellow (40-60%), light green (60-80%), green (80-100%)
                parseFloat(item[scoreField]) >= 80
                ? colors.success
                : parseFloat(item[scoreField]) >= 60
                ? "#22c55e"
                : parseFloat(item[scoreField]) >= 40
                ? colors.warning
                : parseFloat(item[scoreField]) >= 20
                ? colors.error
                : colors.critical
              : // For scores: use original logic
              parseFloat(item[scoreField]) === -1.0
              ? colors.critical
              : parseFloat(item[scoreField]) >= -0.9 &&
                parseFloat(item[scoreField]) < -0.8
              ? colors.error
              : parseFloat(item[scoreField]) >= -0.7 &&
                parseFloat(item[scoreField]) < -0.5
              ? colors.warning
              : parseFloat(item[scoreField]) >= -0.5
              ? colors.success
              : colors.primary,
          }));

        // Sort branches based on query intent and field type
        const sortedBranches =
          moreThanMatch || scoreField.toLowerCase().includes("percentage")
            ? branchData.sort((a, b) => b.score - a.score) // Best first for "more than" or percentages
            : branchData.sort((a, b) => a.score - b.score); // Worst first for "less than" or scores

        const limitedBranches = sortedBranches.slice(0, 25); // Show top 25 branches

        if (limitedBranches.length > 0) {
          console.log("Branch chart data processed:", {
            totalBranches: supportingData.length,
            filteredBranches: limitedBranches.length,
            sampleData: limitedBranches.slice(0, 3),
            threshold,
            titlePrefix,
          });

          const fieldDisplayName = scoreField
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();
          branchChart = {
            title: `${titlePrefix} (${fieldDisplayName} ${operator} ${Math.abs(
              threshold
            )})`,
            data: limitedBranches,
            totalCount: supportingData.length,
          };
        }
      }
    }

    return { pieChart, barChart, branchChart, waterfallChart: null };
  }, [
    analysisResult,
    scoreField,
    dataType,
    pipelineStages,
    isFromDashboard,
    savedCharts,
    savedRMPerformanceData,
    savedRMPerformanceOverview,
    savedRMPerformanceComparisonChart,
  ]);

  // Generate regional summary data for branch performance
  const regionalSummary = useMemo(() => {
    if (!analysisResult?.analysis_result?.supporting_data) return [];

    const supportingData = analysisResult.analysis_result.supporting_data;

    // Handle branch performance data dynamically
    if (supportingData.length > 0) {
      const firstItem = supportingData[0];

      // Find region and score fields dynamically
      const regionField = Object.keys(firstItem).find(
        (key) => key.toLowerCase().includes("region") && firstItem[key]
      );

      const scoreField = Object.keys(firstItem).find(
        (key) =>
          (key.toLowerCase().includes("score") ||
            key.toLowerCase().includes("percentage") ||
            key.toLowerCase().includes("rate")) &&
          (typeof firstItem[key] === "number" ||
            !isNaN(parseFloat(firstItem[key])))
      );

      if (regionField && scoreField) {
        const regionGroups = {};

        supportingData.forEach((item) => {
          const region = item[regionField] || "Unknown";
          const score = item[scoreField];

          // For percentage fields, only include non-null values
          if (scoreField.toLowerCase().includes("percentage")) {
            if (
              score !== null &&
              score !== undefined &&
              !isNaN(parseFloat(score))
            ) {
              if (!regionGroups[region]) {
                regionGroups[region] = {
                  region,
                  branchCount: 0,
                  totalScore: 0,
                };
              }
              regionGroups[region].branchCount++;
              regionGroups[region].totalScore += parseFloat(score);
            }
          } else {
            // For other score fields, include all valid values
            if (!isNaN(parseFloat(score))) {
              if (!regionGroups[region]) {
                regionGroups[region] = {
                  region,
                  branchCount: 0,
                  totalScore: 0,
                };
              }
              regionGroups[region].branchCount++;
              regionGroups[region].totalScore += parseFloat(score);
            }
          }
        });

        return Object.values(regionGroups)
          .filter((region) => region.branchCount > 0)
          .map((region) => ({
            ...region,
            averageScore:
              region.branchCount > 0
                ? Number((region.totalScore / region.branchCount).toFixed(2))
                : 0,
          }));
      }
    }

    return [];
  }, [analysisResult]);

  const { gridColumns, gridRows } = useMemo(() => {
    // If we're in dashboard mode and have saved data grid, use that instead
    if (isFromDashboard && savedDataGrid) {
      console.log(
        "📊 [DEBUG] Using saved data grid from dashboard:",
        savedDataGrid
      );
      return savedDataGrid;
    }

    if (
      !analysisResult ||
      !analysisResult.analysis_result?.supporting_data ||
      analysisResult.analysis_result.supporting_data.length === 0
    ) {
      return { gridColumns: [], gridRows: [] };
    }

    const supportingData = analysisResult.analysis_result.supporting_data;
    const firstItem = supportingData[0];
    const columns = [];

    // Common acronyms that should stay uppercase in headers
    const ACRONYMS = ['MTD', 'LMTD', 'FTD', 'OTR', 'NPA', 'SMA', 'INR', 'ID', 'KYC', 'API', 'URL', 'PCT', 'YTD', 'QTD', 'EMI', 'ROI', 'POS', 'DPD', 'BANK', 'LACS'];
    
    // Helper function to format field names for headers
    const formatHeaderName = (fieldName) => {
      // First replace underscores with spaces
      let result = fieldName.replace(/_/g, " ");
      
      // Only add spaces before uppercase letters if they follow lowercase letters (camelCase)
      // This prevents "INR" from becoming "I N R"
      result = result.replace(/([a-z])([A-Z])/g, "$1 $2");
      
      return result
        .trim()
        .split(" ")
        .filter(word => word.length > 0)
        .map((word) => {
          const upperWord = word.toUpperCase();
          // Keep acronyms uppercase
          if (ACRONYMS.includes(upperWord)) {
            return upperWord;
          }
          // Regular word - capitalize first letter only
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
    };
    
    // Helper to check if a string value is actually a pure number (not mixed like "0.0 DAY")
    const isStrictlyNumeric = (value) => {
      if (typeof value === 'number') return true;
      if (typeof value !== 'string') return false;
      // Trim and check if the entire string is a valid number
      const trimmed = value.trim();
      // Must be purely numeric (with optional decimal point and sign)
      return /^-?\d+(\.\d+)?$/.test(trimmed);
    };

    // Helper function to determine field type and create appropriate column config
    const createColumnConfig = (fieldName, fieldValue) => {
      const headerName = formatHeaderName(fieldName);
      
      // Check for date strings BEFORE numeric detection
      const isDateString = 
        typeof fieldValue === 'string' && 
        /^\d{4}-\d{2}-\d{2}(T|\s)/.test(fieldValue);
      
      // Use strict numeric check to avoid treating "0.0 DAY" as numeric
      const isNumeric = !isDateString && isStrictlyNumeric(fieldValue);
      const isPercentage =
        fieldName.toLowerCase().includes("percentage") ||
        fieldName.toLowerCase().includes("percent") ||
        fieldName === "Collection_Percentage";
      const isScore = fieldName.toLowerCase().includes("score");
      const isState = fieldName.toLowerCase().includes("state");
      const isRegion = fieldName.toLowerCase().includes("region");
      const isBranch = fieldName.toLowerCase().includes("branch");

      console.log(
        `Field: ${fieldName}, isPercentage: ${isPercentage}, isNumeric: ${isNumeric}, value: ${fieldValue}`
      );

      // Base column configuration
      const baseConfig = {
        field: fieldName,
        headerName: headerName,
        minWidth: 100,
        flex: 1,
      };

      // State field - special styling
      if (isState) {
        return {
          ...baseConfig,
          flex: 0.8,
          minWidth: 70,
          renderCell: (params) => (
            <Chip
              label={params.value || "N/A"}
              size="small"
              sx={{
                backgroundColor:
                  params.value === "KA"
                    ? "#e3f2fd"
                    : params.value === "MH"
                    ? "#f3e5f5"
                    : params.value === "TN"
                    ? "#fff3e0"
                    : "#f5f5f5",
                color:
                  params.value === "KA"
                    ? "#1976d2"
                    : params.value === "MH"
                    ? "#7b1fa2"
                    : params.value === "TN"
                    ? "#f57c00"
                    : "#616161",
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            />
          ),
        };
      }

      // Region field - special styling
      if (isRegion) {
        return {
          ...baseConfig,
          flex: 1.2,
          minWidth: 90,
          renderCell: (params) => (
            <Chip
              label={params.value || "Unknown"}
              size="small"
              sx={{
                backgroundColor: "#f0f4f8",
                color: "#2d3748",
                fontWeight: 500,
                fontSize: "0.7rem",
              }}
            />
          ),
        };
      }

      // Branch field - larger width
      if (isBranch) {
        return {
          ...baseConfig,
          flex: 2.5,
          minWidth: 140,
        };
      }

      // Percentage fields - special formatting and colors (Enhanced detection)
      if (isPercentage && isNumeric) {
        return {
          ...baseConfig,
          flex: 1.3,
          minWidth: 120,
          align: "center",
          headerAlign: "center",
          renderCell: (params) => {
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === "N/A"
            ) {
              return (
                <span style={{ color: "#999", fontStyle: "italic" }}>
                  No Data
                </span>
              );
            }

            // Force conversion to number and round to 2 decimal places
            let numericValue;
            if (typeof params.value === "string") {
              numericValue = parseFloat(params.value);
            } else {
              numericValue = Number(params.value);
            }

            // If value is invalid, show No Data
            if (isNaN(numericValue)) {
              return (
                <span style={{ color: "#999", fontStyle: "italic" }}>
                  No Data
                </span>
              );
            }

            // Round to exactly 2 decimal places
            const roundedValue = Math.round(numericValue * 100) / 100;

            const fill = scoreField.toLowerCase().includes("percentage")
              ? // For percentages: green (high) → orange (medium) → red (low)
                numericValue >= 80
                ? "#c8e6c9" // Green (excellent)
                : numericValue >= 60
                ? "#dcedc8" // Light green (good)
                : numericValue >= 40
                ? "#fff3e0" // Warm amber (moderate)
                : numericValue >= 20
                ? "#ffccbc" // Light orange (poor)
                : "#ffcdd2" // Light red (critical)
              : // For Total_Score: same intuitive gradient
              numericValue >= 0.2
              ? "#c8e6c9" // Green (excellent)
              : numericValue >= 0
              ? "#dcedc8" // Light green (good)
              : numericValue >= -0.4
              ? "#fff3e0" // Warm amber (moderate)
              : numericValue >= -0.8
              ? "#ffccbc" // Light orange (poor)
              : "#ffcdd2"; // Light red (critical)

            return (
              <Chip
                label={`${roundedValue.toFixed(2)}%`}
                size="small"
                sx={{
                  backgroundColor: fill,
                  color:
                    roundedValue >= 80
                      ? "#2e7d32" // Dark green text
                      : roundedValue >= 60
                      ? "#558b2f" // Medium green text
                      : roundedValue >= 40
                      ? "#f57c00" // Orange text
                      : roundedValue >= 20
                      ? "#ff5722" // Red-orange text
                      : "#d32f2f", // Red text for critical
                  fontWeight: 600,
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                }}
              />
            );
          },
        };
      }

      // Score fields - special formatting (enhanced for Total_Score)
      if (isScore && isNumeric) {
        return {
          ...baseConfig,
          flex: 1.2,
          minWidth: 110,
          align: "center",
          headerAlign: "center",
          renderCell: (params) => {
            if (params.value === null || params.value === undefined) {
              return (
                <span style={{ color: "#999", fontStyle: "italic" }}>
                  No Data
                </span>
              );
            }
            const value =
              typeof params.value === "number"
                ? params.value
                : parseFloat(params.value);
            const roundedValue = Math.round(value * 100) / 100;

            // Enhanced color coding for Total_Score ranges
            let backgroundColor, textColor;
            if (roundedValue >= 0.2) {
              backgroundColor = "#e8f5e8"; // Green for positive scores
              textColor = "#2e7d32";
            } else if (roundedValue >= 0) {
              backgroundColor = "#fff3cd"; // Yellow for neutral scores
              textColor = "#f57c00";
            } else if (roundedValue >= -0.4) {
              backgroundColor = "#ffeaa7"; // Orange for moderate negative
              textColor = "#ff8f00";
            } else if (roundedValue >= -0.8) {
              backgroundColor = "#ffcdd2"; // Light red for poor scores
              textColor = "#d84315";
            } else {
              backgroundColor = "#ffebee"; // Red for very poor scores
              textColor = "#c62828";
            }

            return (
              <Chip
                label={roundedValue.toFixed(2)}
                size="small"
                sx={{
                  backgroundColor,
                  color: textColor,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                }}
              />
            );
          },
        };
      }

      // Date/Month fields - detect ISO dates and format properly
      const isDateField = 
        fieldName.toLowerCase().includes('month') || 
        fieldName.toLowerCase().includes('date') ||
        fieldName.toLowerCase().includes('time');
      
      if (isDateField || isDateString) {
        return {
          ...baseConfig,
          flex: 1.2,
          minWidth: 120,
          align: "center",
          headerAlign: "center",
          renderCell: (params) => {
            if (params.value === null || params.value === undefined) {
              return (
                <span style={{ color: "#999", fontStyle: "italic" }}>
                  No Data
                </span>
              );
            }
            
            try {
              const value = params.value;
              
              // Check for ISO date format (matches T or space separator)
              const datePattern = /^\d{4}-\d{2}-\d{2}(T|\s)/;
              
              if (typeof value === 'string' && datePattern.test(value)) {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  // For month columns, show "Mon YYYY" format
                  if (fieldName.toLowerCase().includes('month')) {
                    return (
                      <Chip
                        label={date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                        size="small"
                        sx={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    );
                  }
                  // Check if the value contains time (has T and time portion)
                  const hasTime = value.includes('T') && value.split('T')[1]?.length > 0;
                  
                  if (hasTime) {
                    // For datetime values, show date and time
                    return (
                      <span style={{ fontWeight: 500 }}>
                        {date.toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </span>
                    );
                  }
                  
                  // For date-only values, show just the date
                  return (
                    <span style={{ fontWeight: 500 }}>
                      {date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </span>
                  );
                }
              }
            } catch (e) {
              console.error('Date parsing error:', e);
            }
            
            // Fallback to original value
            return <span>{params.value}</span>;
          },
        };
      }

      // Other numeric fields
      if (isNumeric) {
        return {
          ...baseConfig,
          flex: 1.1,
          minWidth: 100,
          align: "right",
          headerAlign: "right",
          renderCell: (params) => {
            if (params.value === null || params.value === undefined) {
              return (
                <span style={{ color: "#999", fontStyle: "italic" }}>
                  No Data
                </span>
              );
            }
            const value =
              typeof params.value === "number"
                ? params.value
                : parseFloat(params.value);
            const formattedValue = Number(value.toFixed(2));

            // Check if this is a percentage field (fallback check)
            if (
              fieldName.toLowerCase().includes("percentage") ||
              fieldName.toLowerCase().includes("percent") ||
              fieldName === "Collection_Percentage"
            ) {
              // Apply the same precise rounding as the main percentage handler
              const roundedValue = Math.round(value * 100) / 100;

              return (
                <Chip
                  label={`${roundedValue.toFixed(2)}%`}
                  size="small"
                  sx={{
                    backgroundColor:
                      roundedValue >= 80
                        ? "#e8f5e8"
                        : roundedValue >= 60
                        ? "#fff3cd"
                        : roundedValue >= 40
                        ? "#ffeaa7"
                        : roundedValue >= 20
                        ? "#ffcdd2"
                        : "#ffebee",
                    color:
                      roundedValue >= 80
                        ? "#2e7d32"
                        : roundedValue >= 60
                        ? "#f57c00"
                        : roundedValue >= 40
                        ? "#ff8f00"
                        : roundedValue >= 20
                        ? "#d84315"
                        : "#c62828",
                    fontWeight: 600,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                />
              );
            }

            return (
              <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
                {formattedValue.toFixed(2)}
              </span>
            );
          },
        };
      }

      // Text fields - default styling
      return {
        ...baseConfig,
        flex: 1.5,
        renderCell: (params) => {
          return (
            params.value || (
              <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
            )
          );
        },
      };
    };

    // Dynamically create columns for all fields in the API response
    Object.keys(firstItem).forEach((fieldName) => {
      const fieldValue = firstItem[fieldName];
      const columnConfig = createColumnConfig(fieldName, fieldValue);
      columns.push(columnConfig);
    });

    // Create rows with proper ID field
    const rows = supportingData.map((item, index) => ({
      id: index,
      ...item,
    }));

    return { gridColumns: columns, gridRows: rows };
  }, [analysisResult]);

  // Export functions
  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleSaveAll = () => {
    try {
      const id = Date.now().toString();
      const supportingData =
        analysisResult?.analysis_result?.supporting_data || [];

      // Extract SQL query for refresh API
      // Response structure: { response: { content: { generated_sql } } } or { content: { generated_sql } }
      const sqlQuery = 
        analysisResult?.response?.content?.generated_sql ||
        analysisResult?.content?.generated_sql ||
        analysisResult?.generated_sql ||
        analysisResult?.sql_query ||
        analysisResult?.sqlQuery ||
        analysisResult?.analysis_result?.sql_query ||
        analysisResult?.analysis_result?.generated_sql ||
        "";
      
      // Get connection ID from localStorage
      const connectionId = localStorage.getItem('connectionId') || 
                          localStorage.getItem('activeConnectionId') || 
                          "";

      console.log("💾 [SAVE DEBUG] Saving visualization data:", {
        question: analysisResult?.question,
        sqlQuery,
        supportingDataLength: supportingData.length,
        chartData: Object.keys(chartData),
        gridRowsLength: gridRows.length,
        hasRMPerformanceData: !!chartData.rmPerformanceData,
        rmPerformanceDataKeys: chartData.rmPerformanceData
          ? Object.keys(chartData.rmPerformanceData)
          : null,
      });

      // Create standardized visualization data structure
      const queryText = analysisResult?.question || "Unknown Query";
      const visualizationData = {
        id,
        title:
          analysisResult?.question ||
          `Analysis - ${new Date().toLocaleDateString()}`,
        originalPrompt: queryText, // Never changes - used for refresh
        timestamp: new Date().toISOString(),
        type: "pipeline",
        question: queryText,
        sqlQuery, // Store SQL query for refresh API
        connectionId, // Store connection for refresh API

        // Store supporting data with multiple property names for compatibility
        supporting_data: supportingData,
        supportingData: supportingData,
        pipelineData: supportingData,

        // Store charts data
        charts: {
          pieChart: chartData.pieChart,
          barChart: chartData.barChart,
          branchChart: chartData.branchChart,
          waterfallChart: chartData.waterfallChart,
        },

        // Store RM Performance data if it exists (including current selectedRMs state)
        rmPerformanceData: chartData.rmPerformanceData
          ? {
              ...chartData.rmPerformanceData,
              selectedRMs: selectedRMs, // Include current selectedRMs state
            }
          : null,

        // Store RM Performance Overview and Comparison Chart if we have RM performance data
        rmPerformanceOverview: chartData.rmPerformanceData
          ? {
              totalTarget:
                chartData.rmPerformanceData.summary?.totalTarget || "₹0.0L",
              totalAchievement:
                chartData.rmPerformanceData.summary?.totalAchievement ||
                "₹0.0L",
              achievementRate:
                chartData.rmPerformanceData.summary?.achievementRate || "0.0%",
              activeRMs:
                chartData.rmPerformanceData.summary?.activeRMs || "0/0",
            }
          : null,

        // Store RM Performance Comparison Chart with actual selected RMs
        rmPerformanceComparisonChart: chartData.rmPerformanceData
          ? (() => {
              // Use the current selectedRMs state, not from chartData
              const selectedRMIds = selectedRMs; // Use current state
              const allRMs =
                analysisResult?.analysis_result?.supporting_data || [];

              // Filter to only include the actually selected RMs
              const selectedRMsData = allRMs
                .filter((rm) => {
                  const rmId = rm.RM_ID || rm["R M I D"] || rm.id;
                  return selectedRMIds.includes(rmId);
                })
                .map((rm) => {
                  // Use the updated field names that support both disbursement and collection
                  const target = parseFloat(
                    rm.Disbursement_Target ||
                      rm.Collection_Target_Lakhs ||
                      rm.DB_Tar ||
                      rm.D_B_Target ||
                      rm["D B Target"] ||
                      rm.target ||
                      0
                  );
                  const achievement = parseFloat(
                    rm.Disbursement_Achieved ||
                      rm.Collection_Achieved_Lakhs ||
                      rm.DB_Ach ||
                      rm.D_B_Achievement ||
                      rm["D B Achievement"] ||
                      rm.achievement ||
                      0
                  );
                  const achievementRate =
                    target > 0 ? (achievement / target) * 100 : 0;

                  return {
                    id: rm.RM_ID || rm["R M I D"] || rm.id,
                    name: rm.RM_Name || rm["R M Name"] || rm.name,
                    target,
                    achievement,
                    achievementRate,
                  };
                });

              console.log("💾 [DEBUG] Saving RM comparison chart:", {
                selectedRMIds,
                selectedRMsDataLength: selectedRMsData.length,
                selectedRMsData: selectedRMsData.map((rm) => ({
                  id: rm.id,
                  name: rm.name,
                })),
              });

              return {
                title: `RM Performance Comparison (${selectedRMsData.length} RMs)`,
                data: selectedRMsData.map((rm) => ({
                  name:
                    rm.name && rm.name.length > 15
                      ? rm.name.substring(0, 12) + "..."
                      : rm.name,
                  fullName: rm.name,
                  value: rm.achievementRate,
                  achievementRate: rm.achievementRate,
                  avgScore: rm.achievementRate,
                  region:
                    rm.name && rm.name.length > 15
                      ? rm.name.substring(0, 12) + "..."
                      : rm.name,
                  target: rm.target,
                  achievement: rm.achievement,
                  fill: rm.achievementRate > 0 ? "#059669" : "#dc2626",
                })),
                summary: {
                  totalTarget: selectedRMsData.reduce(
                    (sum, rm) => sum + rm.target,
                    0
                  ),
                  totalAchievement: selectedRMsData.reduce(
                    (sum, rm) => sum + rm.achievement,
                    0
                  ),
                  avgAchievementRate:
                    selectedRMsData.length > 0
                      ? selectedRMsData.reduce(
                          (sum, rm) => sum + rm.achievementRate,
                          0
                        ) / selectedRMsData.length
                      : 0,
                },
              };
            })()
          : null,

        // Store data grid
        dataGrid: {
          gridColumns,
          gridRows,
        },

        // Store overview data if it exists (for RM performance)
        overview:
          chartData.pieChart?.overview ||
          chartData.rmPerformanceData?.summary ||
          null,
      };

      console.log(
        "💾 [SAVE DEBUG] Final visualization data structure:",
        visualizationData
      );

      const existing = JSON.parse(
        localStorage.getItem("dashboardVisualizations") || "[]"
      );
      const updated = [visualizationData, ...existing];
      localStorage.setItem("dashboardVisualizations", JSON.stringify(updated));

      console.log(
        "💾 [SAVE DEBUG] Saved to localStorage. Total items:",
        updated.length
      );

      setSnackbar({
        open: true,
        message: "All visualizations saved to dashboard successfully!",
        severity: "success",
      });

      setTimeout(() => {
        const dashboardUrl = `${window.location.origin}/dashboard`;
        window.open(dashboardUrl, "_blank");
      }, 1000);
    } catch (error) {
      console.error("Error saving all visualizations:", error);
      setSnackbar({
        open: true,
        message: "Error saving visualizations. Please try again.",
        severity: "error",
      });
    }
  };

  // Open the save to dashboard popover
  const handleSaveToDashboard = (event) => {
    try {
      // Generate a unique ID for this visualization
      const id = Date.now().toString();

      // Get the query/question from various possible sources
      const queryText = 
        analysisResult?.question ||
        analysisResult?.natural_language_query ||
        analysisResult?.content?.natural_language_query ||
        analysisResult?.query ||
        null;
      
      // Extract SQL query from various possible sources
      // Response structure: { response: { content: { generated_sql } } } or { content: { generated_sql } }
      const sqlQuery = 
        analysisResult?.response?.content?.generated_sql ||
        analysisResult?.content?.generated_sql ||
        analysisResult?.generated_sql ||
        analysisResult?.sql_query ||
        analysisResult?.sqlQuery ||
        analysisResult?.analysis_result?.sql_query ||
        analysisResult?.analysis_result?.generated_sql ||
        "";
      
      // Get connection ID from localStorage
      const connectionId = localStorage.getItem('connectionId') || 
                          localStorage.getItem('activeConnectionId') || 
                          "";
      
      // Get document key from analysisResult or metadata
      const documentKey = analysisResult?.document_key ||
                         analysisResult?.documentKey ||
                         analysisResult?.metadata?.document_key ||
                         analysisResult?.analysis_result?.document_key ||
                         null;
      
      // Determine data source mode - Excel if documentKey exists, otherwise database
      const dataSourceMode = documentKey ? 'excel' : 'database';

      console.log("💾 [SAVE] Query text extracted:", queryText, "SQL:", sqlQuery, "documentKey:", documentKey, "dataSourceMode:", dataSourceMode, "from analysisResult:", analysisResult);

      // Create the visualization data object
      // originalPrompt is preserved for refresh - title can be edited by user
      // sqlQuery is stored for backend refresh - actual data cached in Redis
      const visualizationData = {
        id,
        title: queryText || `Analysis - ${new Date().toLocaleDateString()}`,
        originalPrompt: queryText || "Unknown Query", // Never changes - used for refresh
        timestamp: new Date().toISOString(),
        type: "pipeline",
        question: queryText || "Unknown Query",
        sqlQuery, // Store SQL query for refresh API
        connectionId, // Store connection for refresh API
        dataSourceMode, // Track whether this is Excel or database mode
        // Only include documentKey for Excel mode
        ...(dataSourceMode === 'excel' && documentKey && { documentKey }),
        supportingData: analysisResult?.analysis_result?.supporting_data || [],
        pipelineData: analysisResult?.analysis_result?.supporting_data || [],
        charts: {
          pieChart: chartData.pieChart,
          barChart: chartData.barChart,
          branchChart: chartData.branchChart,
          waterfallChart: chartData.waterfallChart,
        },
        dataGrid: {
          gridColumns,
          gridRows,
        },
      };

      // Store the visualization data and open popover
      setPendingVisualizationData(visualizationData);
      setSaveDashboardAnchorEl(event.currentTarget);
    } catch (error) {
      console.error("Error preparing visualization data:", error);
      setSnackbar({
        open: true,
        message: "Failed to prepare visualization. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSaveTable = () => {
    try {
      const id = Date.now().toString();
      const supportingData =
        analysisResult?.analysis_result?.supporting_data || [];

      // Extract SQL query for refresh API
      // Response structure: { response: { content: { generated_sql } } } or { content: { generated_sql } }
      const sqlQuery = 
        analysisResult?.response?.content?.generated_sql ||
        analysisResult?.content?.generated_sql ||
        analysisResult?.generated_sql ||
        analysisResult?.sql_query ||
        analysisResult?.sqlQuery ||
        analysisResult?.analysis_result?.sql_query ||
        analysisResult?.analysis_result?.generated_sql ||
        "";
      
      // Get connection ID from localStorage
      const connectionId = localStorage.getItem('connectionId') || 
                          localStorage.getItem('activeConnectionId') || 
                          "";

      const queryText = analysisResult?.question || "Unknown Query";
      const visualizationData = {
        id,
        title: `Table - ${
          analysisResult?.question || new Date().toLocaleDateString()
        }`,
        originalPrompt: queryText, // Never changes - used for refresh
        timestamp: new Date().toISOString(),
        type: "table",
        question: queryText,
        sqlQuery, // Store SQL query for refresh API
        connectionId, // Store connection for refresh API

        // Store supporting data with multiple property names for compatibility
        supporting_data: supportingData,
        supportingData: supportingData,
        pipelineData: supportingData,

        dataGrid: {
          gridColumns,
          gridRows,
        },
      };

      const existing = JSON.parse(
        localStorage.getItem("dashboardVisualizations") || "[]"
      );
      const updated = [visualizationData, ...existing];
      localStorage.setItem("dashboardVisualizations", JSON.stringify(updated));

      setSnackbar({
        open: true,
        message: "Table saved successfully!",
        severity: "success",
      });

      setTimeout(() => {
        const dashboardUrl = `${window.location.origin}/dashboard`;
        window.open(dashboardUrl, "_blank");
      }, 1000);
    } catch (error) {
      console.error("Error saving table:", error);
      setSnackbar({
        open: true,
        message: "Error saving table. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSaveChart = (chartType, chartTitle) => {
    try {
      const id = Date.now().toString();
      const supportingData =
        analysisResult?.analysis_result?.supporting_data || [];

      // Extract SQL query for refresh API
      // Response structure: { response: { content: { generated_sql } } } or { content: { generated_sql } }
      const sqlQuery = 
        analysisResult?.response?.content?.generated_sql ||
        analysisResult?.content?.generated_sql ||
        analysisResult?.generated_sql ||
        analysisResult?.sql_query ||
        analysisResult?.sqlQuery ||
        analysisResult?.analysis_result?.sql_query ||
        analysisResult?.analysis_result?.generated_sql ||
        "";
      
      // Get connection ID from localStorage
      const connectionId = localStorage.getItem('connectionId') || 
                          localStorage.getItem('activeConnectionId') || 
                          "";

      const charts = {};
      charts[chartType] = chartData[chartType];

      const queryText = analysisResult?.question || "Unknown Query";
      const visualizationData = {
        id,
        title: `${chartTitle} - ${
          analysisResult?.question || new Date().toLocaleDateString()
        }`,
        originalPrompt: queryText, // Never changes - used for refresh
        timestamp: new Date().toISOString(),
        type:
          chartType === "pieChart"
            ? "pie"
            : chartType === "waterfallChart"
            ? "waterfall"
            : "pipeline",
        question: queryText,
        sqlQuery, // Store SQL query for refresh API
        connectionId, // Store connection for refresh API

        // Store supporting data with multiple property names for compatibility
        supporting_data: supportingData,
        supportingData: supportingData,
        pipelineData: supportingData,

        charts,

        // Store overview data if it exists (for RM performance)
        overview:
          chartData.pieChart?.overview ||
          chartData.rmPerformanceData?.summary ||
          null,
      };

      const existing = JSON.parse(
        localStorage.getItem("dashboardVisualizations") || "[]"
      );
      const updated = [visualizationData, ...existing];
      localStorage.setItem("dashboardVisualizations", JSON.stringify(updated));

      setSnackbar({
        open: true,
        message: `${chartTitle} saved successfully!`,
        severity: "success",
      });

      setTimeout(() => {
        const dashboardUrl = `${window.location.origin}/dashboard`;
        window.open(dashboardUrl, "_blank");
      }, 1000);
    } catch (error) {
      console.error("Error saving chart:", error);
      setSnackbar({
        open: true,
        message: "Error saving chart. Please try again.",
        severity: "error",
      });
    }
  };

  const exportToCSV = () => {
    if (gridRows.length === 0) return;

    const headers = gridColumns.map((col) => col.headerName).join(",");
    const csvContent = [
      headers,
      ...gridRows.map((row) =>
        gridColumns.map((col) => row[col.field] || "").join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-analysis.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (gridRows.length === 0) return;

    const jsonContent = JSON.stringify(gridRows, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-analysis.json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (gridRows.length === 0) return;

    const headers = gridColumns.map((col) => col.headerName).join("\t");
    const excelContent = [
      headers,
      ...gridRows.map((row) =>
        gridColumns.map((col) => row[col.field] || "").join("\t")
      ),
    ].join("\n");

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-analysis.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // MODULAR DATA VALIDATION - Check if we have any renderable content
  const hasLiveData =
    analysisResult?.analysis_result?.supporting_data?.length > 0;
  const hasSavedCharts =
    isFromDashboard &&
    savedCharts &&
    Object.values(savedCharts).some(
      (chart) => chart !== null && chart !== undefined
    );
  const hasSavedDataGrid =
    isFromDashboard && savedDataGrid && savedDataGrid.gridRows?.length > 0;
  const hasSavedRMPerformanceData = isFromDashboard && savedRMPerformanceData;
  const hasSavedRMPerformanceOverview =
    isFromDashboard && savedRMPerformanceOverview;
  const hasSavedRMPerformanceComparisonChart =
    isFromDashboard && savedRMPerformanceComparisonChart;

  // Determine if we have ANY renderable content
  const hasAnyRenderableContent =
    hasLiveData ||
    hasSavedCharts ||
    hasSavedDataGrid ||
    hasSavedRMPerformanceData ||
    hasSavedRMPerformanceOverview ||
    hasSavedRMPerformanceComparisonChart;

  if (!hasAnyRenderableContent) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          px: 3,
          py: 2,
          maxWidth: 480,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            color: "#374151",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          Hmm, I couldn't find any matching data for this query. Could you try rephrasing your question? I'm here to help! 🔍
        </Typography>
      </Box>
    );
  }

  // Auto-scroll to visualization section only when new data arrives
  const visualizationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const previousTimestamp = useRef(null);

  useEffect(() => {
    // Only scroll if:
    // 1. Not in dashboard mode
    // 2. We have data
    // 3. The timestamp has changed (new API response)
    const currentTimestamp =
      analysisResult?.metadata?.timestamp ||
      analysisResult?.analysis_result?.summary?.timestamp;

    if (
      visualizationRef.current &&
      !isFromDashboard &&
      !loading &&
      currentTimestamp &&
      currentTimestamp !== previousTimestamp.current &&
      (gridRows.length > 0 || chartData.barChart || chartData.pieChart)
    ) {
      previousTimestamp.current = currentTimestamp;

      // Delay scroll slightly to ensure content is rendered
      setTimeout(() => {
        visualizationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [analysisResult, isFromDashboard, loading, gridRows.length, chartData]);

  return (
    <Box
      ref={visualizationRef}
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "visible",
        boxSizing: "border-box",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* 1. Data Table / Chart View - Matching AnalysisWidget Tabular Results style */}
      {gridRows.length > 0 && (() => {
        // Determine if this is a small result (few columns, few rows)
        const columnCount = gridColumns.filter(c => c.field !== 'id').length;
        const isSmallResult = gridRows.length <= 3 && columnCount <= 2;
        const isSingleValue = gridRows.length === 1 && columnCount === 1;
        
        return (
        <>
        {/* Single value - Matching table layout */}
        {isSingleValue && !isWidget ? (
          <Box sx={{ 
            maxWidth: { xs: '100%', sm: '380px' },
            mb: 2,
          }}>
              {(() => {
                const col = gridColumns.find(c => c.field !== 'id');
                const fieldName = (col?.field || '').toLowerCase();
                const value = gridRows[0]?.[col?.field];
                const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value));
                const displayLabel = col?.headerName || col?.field?.replace(/_/g, ' ');
                
                // Check if field is a percentage, count, or ratio (not currency)
                const isPercentage = fieldName.includes('percent') || fieldName.includes('pct') || fieldName.includes('otr') || fieldName.includes('ratio');
                const isCount = fieldName.includes('count') || fieldName.includes('number') || (fieldName.includes('total') && !fieldName.includes('amount'));
                const isCurrency = fieldName.includes('amount') || fieldName.includes('value') || fieldName.includes('price') || fieldName.includes('cost') || fieldName.includes('revenue') || fieldName.includes('sum(');
                
                // Format value - show actual numbers, no aggressive rounding
                const formatValue = (val) => {
                  // Handle null, undefined, or empty values
                  if (val === null || val === undefined || val === '') {
                    if (isCurrency) return '₹0';
                    if (isPercentage) return '0%';
                    return '0';
                  }
                  
                  const num = parseFloat(val);
                  if (isNaN(num)) return val;
                  
                  if (isPercentage) {
                    return `${num.toFixed(2)}%`;
                  }
                  
                  // For currency - show with ₹ symbol but don't abbreviate small values
                  if (isCurrency) {
                    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
                    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
                    // Show actual value with up to 2 decimal places for smaller amounts
                    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
                  }
                  
                  if (isCount) {
                    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
                    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
                    return num.toLocaleString('en-IN');
                  }
                  
                  // Default - show actual value with up to 2 decimal places
                  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                };

                const formattedValue = (value === null || value === undefined) 
                  ? formatValue(value) 
                  : (isNumeric ? formatValue(value) : value);
                
                return (
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: alpha('#3B82F6', 0.02),
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: alpha('#3B82F6', 0.12),
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header with Save button */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: 2,
                        py: 1.25,
                        borderBottom: '1px solid',
                        borderColor: alpha('#3B82F6', 0.08),
                      }}
                    >
                      {!isFromDashboard && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleSaveToDashboard}
                          startIcon={<BookmarkBorderIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            color: '#64748B',
                            borderColor: '#E2E8F0',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            '&:hover': {
                              borderColor: '#3B82F6',
                              color: '#3B82F6',
                              bgcolor: alpha('#3B82F6', 0.04),
                            },
                          }}
                        >
                          Save To Dashboard
                        </Button>
                      )}
                    </Box>

                    {/* Content - Centered */}
                    <Box sx={{ px: 3, py: 2.5, textAlign: 'center' }}>
                      {/* Label */}
                      <Typography 
                        sx={{ 
                          color: '#64748B',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          mb: 1,
                        }}
                      >
                        {displayLabel}
                      </Typography>
                      
                      {/* Value - Bigger */}
                      <Typography 
                        sx={{ 
                          color: '#1E293B',
                          fontSize: '2rem',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {formattedValue}
                      </Typography>
                    </Box>
                  </Card>
                );
              })()}
          </Box>
        ) : (
        <Card
          elevation={0}
          sx={{
            border: isWidget ? 'none' : `1px solid ${alpha("#10b981", 0.15)}`,
            mb: isWidget ? 0 : { xs: 2, sm: 3 },
            // Dynamic width based on column count
            width: isWidget ? "100%" : (
              columnCount <= 2 ? 'fit-content' : 
              columnCount <= 4 ? { xs: '100%', sm: '75%' } : 
              '100%'
            ),
            maxWidth: "100%",
            minWidth: columnCount <= 2 ? 280 : { xs: '100%', sm: 400 },
            borderRadius: isWidget ? 0 : 2.5,
            boxShadow: isWidget ? 'none' : "0 2px 12px rgba(0, 0, 0, 0.06)",
            overflow: isWidget ? 'visible' : "hidden",
            background: isWidget ? 'transparent' : "#ffffff",
            height: isWidget ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              gap: 1.5,
              p: isWidget ? 1 : { xs: 2, sm: 2.5 },
              borderBottom: isWidget ? 'none' : `1px solid #E5E7EB`,
              background: isWidget ? 'transparent' : '#FFFFFF',
              flexShrink: 0
            }}
          >
            {!isWidget ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip 
                  label={`${gridRows.length} ${gridRows.length === 1 ? 'record' : 'records'}`}
                  size="small"
                  sx={{ bgcolor: alpha("#10b981", 0.1), color: "#059669", fontWeight: 600, height: 24 }}
                />
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip 
                  label={`${gridRows.length} records`}
                  size="small"
                  sx={{ bgcolor: alpha("#10b981", 0.1), color: "#059669", fontWeight: 600, height: 24 }}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                ml: "auto",
              }}
            >
              {/* View Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  bgcolor: "#F3F4F6",
                  borderRadius: 1.5,
                  "& .MuiToggleButton-root": {
                    border: "none",
                    color: "#9CA3AF",
                    px: 1,
                    py: 0.5,
                    "&.Mui-selected": {
                      bgcolor: alpha("#3B82F6", 0.1),
                      color: "#3B82F6",
                    },
                    "&:hover": {
                      bgcolor: alpha("#3B82F6", 0.05),
                    },
                  },
                }}
              >
                <ToggleButton value="area">
                  <Tooltip title="Area Chart">
                    <ShowChartIcon sx={{ fontSize: 16 }} />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="bar">
                  <Tooltip title="Bar Chart">
                    <BarChartIcon sx={{ fontSize: 16 }} />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="table">
                  <Tooltip title="Table">
                    <TableRowsIcon sx={{ fontSize: 16 }} />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Action buttons */}
              <Tooltip title="Download">
                <IconButton 
                  size="small" 
                  onClick={handleExportClick}
                  sx={{ 
                    color: "#6B7280",
                    "&:hover": { bgcolor: "#F3F4F6" }
                  }}
                >
                  <FileDownload sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {!isFromDashboard && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Assessment sx={{ fontSize: 14 }} />}
                  onClick={handleSaveToDashboard}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#10B981",
                    color: "#fff",
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.5,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    minWidth: 'auto',
                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                    "&:hover": {
                      bgcolor: "#059669",
                    },
                  }}
                >
                  Save to Dashboard
                </Button>
              )}
            </Box>
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Table View */}
            {viewMode === "table" && (
              <Box sx={{ width: "100%", overflow: "auto" }}>
                <DataGridComponent
                  rows={gridRows}
                  columns={gridColumns}
                  title=""
                  showSaveButton={false}
                  onExport={handleExportClick}
                  height={{ xs: 350, sm: 400, md: 450 }}
                  variant="clean"
                />
              </Box>
            )}

            {/* Chart View - Area or Bar */}
            {(viewMode === "area" || viewMode === "bar") && (
              <Box sx={{ p: isWidget ? 0 : { xs: 2, sm: 3 } }}>
                {(() => {
                  // Helper to check if value is a date string
                  const isDateString = (val) => {
                    if (typeof val !== 'string') return false;
                    const datePattern = /^\d{4}-\d{2}-\d{2}/;
                    return datePattern.test(val) && !isNaN(Date.parse(val));
                  };

                  // Helper to format date for display
                  const formatDateLabel = (dateStr) => {
                    try {
                      const date = new Date(dateStr);
                      return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    } catch {
                      return dateStr?.toString().substring(0, 10) || '';
                    }
                  };

                  // Helper to format large numbers
                  const formatValue = (val) => {
                    // Handle null, undefined, or empty values
                    if (val === null || val === undefined || val === '') {
                      return '₹0';
                    }
                    const num = parseFloat(val);
                    if (isNaN(num)) return val;
                    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
                    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
                    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
                    return num.toLocaleString('en-IN');
                  };

                  // Find numeric columns (excluding id-like fields)
                  const numericColumns = gridColumns.filter(col => {
                    if (col.field === 'id' || col.field.endsWith('_id')) return false;
                    const sampleValue = gridRows[0]?.[col.field];
                    return typeof sampleValue === 'number' || 
                           (typeof sampleValue === 'string' && !isNaN(parseFloat(sampleValue)) && !isDateString(sampleValue));
                  });
                  
                  // Find label column - prefer date columns, then string columns
                  const dateColumn = gridColumns.find(col => {
                    const sampleValue = gridRows[0]?.[col.field];
                    return isDateString(sampleValue);
                  });

                  const stringColumn = gridColumns.find(col => {
                    const sampleValue = gridRows[0]?.[col.field];
                    return typeof sampleValue === 'string' && !isDateString(sampleValue) && isNaN(parseFloat(sampleValue));
                  });

                  const labelColumn = dateColumn || stringColumn;
                  const isTimeSeries = !!dateColumn;

                  // Chart colors
                  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

                  // Special case: Single row with multiple numeric columns (e.g., count queries)
                  // Transform to bar chart where each column becomes a bar
                  if (numericColumns.length > 1 && gridRows.length === 1 && !labelColumn) {
                    const singleRow = gridRows[0];
                    const chartData = numericColumns.map((col, idx) => ({
                      name: col.headerName || col.field.replace(/_/g, ' '),
                      value: parseFloat(singleRow[col.field]) || 0,
                      fill: CHART_COLORS[idx % CHART_COLORS.length]
                    }));

                    return (
                      <Box>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: '#6B7280' }}
                              axisLine={{ stroke: '#E5E7EB' }}
                              tickLine={false}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#6B7280' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={formatValue}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #E5E7EB',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }}
                              formatter={(value) => [formatValue(value), 'Count']}
                            />
                            <Bar 
                              dataKey="value" 
                              radius={[4, 4, 0, 0]}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    );
                  }

                  if (numericColumns.length > 0 && labelColumn) {
                    // Prepare chart data
                    const chartData = gridRows.map((row, index) => {
                      const dataPoint = {
                        name: isTimeSeries 
                          ? formatDateLabel(row[labelColumn.field])
                          : (row[labelColumn.field]?.toString().substring(0, 15) || `Item ${index + 1}`),
                        fullName: row[labelColumn.field]
                      };
                      // Add all numeric columns
                      numericColumns.forEach(col => {
                        dataPoint[col.field] = parseFloat(row[col.field]) || 0;
                      });
                      return dataPoint;
                    });

                    // Area Chart - when viewMode is 'area'
                    if (viewMode === 'area') {
                      return (
                        <Box>
                          <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                              <defs>
                                {numericColumns.slice(0, 4).map((col, idx) => (
                                  <linearGradient key={col.field} id={`color${col.field}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0}/>
                                  </linearGradient>
                                ))}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                axisLine={{ stroke: '#E5E7EB' }}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis 
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatValue}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #E5E7EB',
                                  borderRadius: 8,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                                formatter={(value, name) => [formatValue(value), name.replace(/_/g, ' ')]}
                                labelFormatter={(label) => label}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: 20 }}
                                formatter={(value) => value.replace(/_/g, ' ')}
                              />
                              {numericColumns.slice(0, 4).map((col, idx) => (
                                <Area
                                  key={col.field}
                                  type="monotone"
                                  dataKey={col.field}
                                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                  strokeWidth={2}
                                  fill={`url(#color${col.field})`}
                                  dot={{ r: 3, fill: CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                              ))}
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      );
                    }

                    // Bar Chart - when viewMode is 'bar' (vertical bars like dashboard)
                    return (
                      <Box>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: '#6B7280' }}
                              axisLine={{ stroke: '#E5E7EB' }}
                              tickLine={false}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#6B7280' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={formatValue}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #E5E7EB',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }}
                              formatter={(value, name) => [formatValue(value), name.replace(/_/g, ' ')]}
                              labelFormatter={(label) => label}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: 20 }}
                              formatter={(value) => value.replace(/_/g, ' ')}
                            />
                            {numericColumns.slice(0, 4).map((col, idx) => (
                              <Bar 
                                key={col.field}
                                dataKey={col.field} 
                                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                radius={[4, 4, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    );
                  }

                  // Fallback message if chart can't be generated
                  return (
                    <Box 
                      sx={{ 
                        textAlign: "center", 
                        py: 6,
                        bgcolor: alpha("#10b981", 0.05),
                        borderRadius: 2,
                      }}
                    >
                      <BarChartIcon sx={{ fontSize: 48, color: "#10b981", mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary">
                        Chart visualization not available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Data structure doesn't support automatic chart generation
                      </Typography>
                    </Box>
                  );
                })()}
              </Box>
            )}
          </CardContent>
        </Card>
        )}
        </>
        );
      })()}

      {/* 2. Graph Metrics */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          mb: { xs: 3, sm: 4 },
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          px: { xs: 0.5, sm: 0 },
        }}
      >
        {/* Interactive RM Performance Selection - Show when we have RM performance data and not showing saved chart */}
        {chartData.rmPerformanceData && !savedRMPerformanceComparisonChart && (
          <Box sx={{ width: "100%" }}>
            <RMPerformanceOverview chartData={chartData} />
            <RMPerformanceComparison
              analysisResult={analysisResult}
              selectedRMs={selectedRMs}
              setSelectedRMs={setSelectedRMs}
            />

            <RMComparisonChart
              selectedRMs={selectedRMs}
              analysisResult={analysisResult}
              onSaveToDashboard={() => {
                // Create chart data for saving
                const allRMs =
                  analysisResult?.analysis_result?.supporting_data?.map(
                    (rm) => {
                      // Use the updated field names that support both disbursement and collection
                      const target = parseFloat(
                        rm.Disbursement_Target ||
                          rm.Collection_Target_Lakhs ||
                          rm.DB_Tar ||
                          rm.D_B_Target ||
                          rm["D B Target"] ||
                          rm.target ||
                          0
                      );
                      const achievement = parseFloat(
                        rm.Disbursement_Achieved ||
                          rm.Collection_Achieved_Lakhs ||
                          rm.DB_Ach ||
                          rm.D_B_Achievement ||
                          rm["D B Achievement"] ||
                          rm.achievement ||
                          0
                      );
                      const achievementRate =
                        target > 0 ? (achievement / target) * 100 : 0;

                      return {
                        id: rm.RM_ID || rm["R M I D"] || rm.id,
                        name: rm.RM_Name || rm["R M Name"] || rm.name,
                        target,
                        achievement,
                        achievementRate,
                      };
                    }
                  ) || [];

                const selectedRMsData = allRMs.filter((rm) =>
                  selectedRMs.includes(rm.id)
                );

                // Calculate overall stats from all RMs
                const overallStats = {
                  totalTarget: allRMs.reduce((sum, rm) => sum + rm.target, 0),
                  totalAchievement: allRMs.reduce(
                    (sum, rm) => sum + rm.achievement,
                    0
                  ),
                  achievementRate:
                    allRMs.length > 0
                      ? (allRMs.reduce((sum, rm) => sum + rm.achievement, 0) /
                          allRMs.reduce((sum, rm) => sum + rm.target, 0)) *
                        100
                      : 0,
                  activeRMs: `${
                    allRMs.filter((rm) => rm.achievement > 0).length
                  }/${allRMs.length}`,
                };

                console.log(
                  "Debug - Selected RM data for chart:",
                  selectedRMsData
                );

                const chartData = {
                  barChart: {
                    title: `RM Performance Comparison (${selectedRMsData.length} RMs)`,
                    data: selectedRMsData.map((rm) => ({
                      name:
                        rm.name.length > 15
                          ? rm.name.substring(0, 12) + "..."
                          : rm.name,
                      fullName: rm.name,
                      // Include all possible field names for maximum compatibility
                      value: rm.achievementRate, // Primary field for BarChartComponent
                      achievementRate: rm.achievementRate,
                      avgScore: rm.achievementRate, // Dashboard looks for this field
                      region:
                        rm.name.length > 15
                          ? rm.name.substring(0, 12) + "..."
                          : rm.name, // Alternative field name
                      target: rm.target,
                      achievement: rm.achievement,
                      fill: rm.achievementRate > 0 ? "#059669" : "#dc2626",
                    })),
                    summary: {
                      totalTarget: selectedRMsData.reduce(
                        (sum, rm) => sum + rm.target,
                        0
                      ),
                      totalAchievement: selectedRMsData.reduce(
                        (sum, rm) => sum + rm.achievement,
                        0
                      ),
                      avgAchievementRate:
                        selectedRMsData.length > 0
                          ? selectedRMsData.reduce(
                              (sum, rm) => sum + rm.achievementRate,
                              0
                            ) / selectedRMsData.length
                          : 0,
                    },
                  },
                };

                const queryText = analysisResult.question || "RM Performance Analysis";
                const saveData = {
                  id: Date.now(),
                  title:
                    analysisResult.question ||
                    `RM Performance Analysis - ${new Date().toLocaleDateString()}`,
                  originalPrompt: queryText, // Never changes - used for refresh
                  timestamp: new Date().toISOString(),
                  type: "rmPerformance",
                  question: queryText,

                  // Include supporting data - this is crucial!
                  supporting_data:
                    analysisResult?.analysis_result?.supporting_data || [],
                  supportingData:
                    analysisResult?.analysis_result?.supporting_data || [],
                  pipelineData:
                    analysisResult?.analysis_result?.supporting_data || [],

                  // Include RM performance data with selected RMs
                  rmPerformanceData: {
                    selectedRMs: selectedRMs,
                    allRMs: allRMs,
                    summary: {
                      totalTarget: `₹${overallStats.totalTarget.toFixed(1)}L`,
                      totalAchievement: `₹${overallStats.totalAchievement.toFixed(
                        1
                      )}L`,
                      achievementRate: `${overallStats.achievementRate.toFixed(
                        1
                      )}%`,
                      activeRMs: overallStats.activeRMs,
                    },
                  },

                  // Include saved comparison chart
                  rmPerformanceComparisonChart: {
                    title: `RM Performance Comparison (${selectedRMsData.length} RMs)`,
                    data: selectedRMsData.map((rm) => ({
                      name:
                        rm.name && rm.name.length > 15
                          ? rm.name.substring(0, 12) + "..."
                          : rm.name,
                      fullName: rm.name,
                      value: rm.achievementRate,
                      achievementRate: rm.achievementRate,
                      avgScore: rm.achievementRate,
                      region:
                        rm.name && rm.name.length > 15
                          ? rm.name.substring(0, 12) + "..."
                          : rm.name,
                      target: rm.target,
                      achievement: rm.achievement,
                      fill: rm.achievementRate > 0 ? "#059669" : "#dc2626",
                    })),
                  },

                  overview: {
                    totalTarget: `₹${overallStats.totalTarget.toFixed(1)}L`,
                    totalAchievement: `₹${overallStats.totalAchievement.toFixed(
                      1
                    )}L`,
                    achievementRate: `${overallStats.achievementRate.toFixed(
                      1
                    )}%`,
                    activeRMs: overallStats.activeRMs,
                  },
                  charts: chartData,
                  dataGrid: {
                    gridRows: selectedRMsData.map((rm, index) => ({
                      id: index,
                      rmName: rm.name,
                      target: `${rm.target.toFixed(1)}L`,
                      achievement: `${rm.achievement.toFixed(1)}L`,
                      achievementRate: `${rm.achievementRate.toFixed(1)}%`,
                    })),
                    gridColumns: [
                      { field: "rmName", headerName: "RM Name", width: 200 },
                      { field: "target", headerName: "Target", width: 120 },
                      {
                        field: "achievement",
                        headerName: "Achievement",
                        width: 120,
                      },
                      {
                        field: "achievementRate",
                        headerName: "Achievement %",
                        width: 120,
                      },
                    ],
                  },
                };

                // Add debug flag to localStorage for debugging
                window.localStorage.debug = true;

                // Log the data before saving for debugging
                console.log("Saving to dashboard:", saveData);
                console.log(
                  "Chart data being saved:",
                  saveData.charts.barChart
                );
                console.log(
                  "Chart data values:",
                  saveData.charts.barChart.data
                );

                const existing = JSON.parse(
                  localStorage.getItem("dashboardVisualizations") || "[]"
                );
                existing.push(saveData);
                localStorage.setItem(
                  "dashboardVisualizations",
                  JSON.stringify(existing)
                );

                // Store a debug copy separately for analysis
                localStorage.setItem(
                  "lastSavedVisualization",
                  JSON.stringify(saveData)
                );

                setSnackbar({
                  open: true,
                  message: "Analysis saved to dashboard successfully!",
                  severity: "success",
                });

                // Open dashboard in new tab
                window.open("/dashboard", "_blank");
              }}
            />
          </Box>
        )}

        {/* Bar Chart - Clean & Compact */}
        {chartData.barChart &&
          !chartData.rmPerformanceData &&
          chartData.barChart.data &&
          chartData.barChart.data.length > 0 && (
            <Box
              sx={{
                width: "100%",
                maxWidth: chartData.pieChart ? { xs: "100%", md: "50%" } : "100%",
              }}
            >
              <Card
                sx={{
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "#fff",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {chartData.barChart.isStacked ? (
                    <StackedBarChartComponent
                      data={chartData.barChart.data}
                      title={chartData.barChart.title}
                      subtitle="Performance by region"
                      stageNames={chartData.barChart.stageNames || []}
                      height={280}
                      xAxisKey="region"
                    />
                  ) : (
                    <BarChartComponent
                      data={chartData.barChart.data}
                      title={chartData.barChart.title}
                      subtitle="Performance metrics"
                      height={280}
                    />
                  )}

                </CardContent>
              </Card>
            </Box>
          )}

        {/* State Distribution - Premium Pie Chart */}
        {chartData.pieChart &&
          chartData.pieChart.data &&
          chartData.pieChart.data.length > 0 && (
            <Box
              sx={{
                flex: {
                  xs: "1 1 100%",
                  md: chartData.barChart ? "0 0 calc(50% - 8px)" : "1 1 100%",
                },
                minWidth: 0,
                maxWidth: {
                  xs: "100%",
                  md: chartData.barChart ? "calc(50% - 8px)" : "100%",
                },
                width: "100%",
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  minHeight: { xs: 400, sm: 460, md: 520 },
                  border: "none",
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <PieChartComponent
                    data={chartData.pieChart.data}
                    title={chartData.pieChart.title}
                    subtitle="Distribution by state"
                    height={{ xs: 300, sm: 350, md: 400 }}
                  />

                  {/* Save Chart Button */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      pt: { xs: 1.5, sm: 2 },
                      borderTop: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {!isFromDashboard && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<TableChart />}
                        onClick={() =>
                          handleSaveChart(
                            "pieChart",
                            chartData.pieChart.title || "Pie Chart"
                          )
                        }
                        sx={{
                          textTransform: "none",
                          backgroundColor: "#1976d2",
                          px: { xs: 3, sm: 4 },
                          py: 1,
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          "&:hover": {
                            backgroundColor: "#1565c0",
                          },
                        }}
                      >
                        Save Chart
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

        {/* Pipeline Waterfall Chart */}
        {chartData.waterfallChart &&
          chartData.waterfallChart.data &&
          chartData.waterfallChart.data.length > 0 && (
            <Box
              sx={{
                flex: "1 1 100%",
                minWidth: 0,
                maxWidth: "100%",
                mb: { xs: 1.5, sm: 2 },
                mx: { xs: 0.5, sm: 0 },
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  minHeight: { xs: 400, sm: 460, md: 520 },
                  border: "none",
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <WaterfallChartComponent
                    data={chartData.waterfallChart.data}
                    title={chartData.waterfallChart.title}
                    totalPipeline={chartData.waterfallChart.totalPipeline}
                    height={{ xs: 280, sm: 320, md: 350 }}
                    showSummaryCards={true}
                  />

                  {/* Save Chart Button for Pipeline Charts */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      pt: { xs: 1.5, sm: 2 },
                      borderTop: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {!isFromDashboard && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<TableChart />}
                        onClick={() =>
                          handleSaveChart(
                            "waterfallChart",
                            chartData.waterfallChart.title || "Pipeline Summary"
                          )
                        }
                        sx={{
                          textTransform: "none",
                          backgroundColor: "#1976d2",
                          px: { xs: 3, sm: 4 },
                          py: 1,
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          "&:hover": {
                            backgroundColor: "#1565c0",
                          },
                        }}
                      >
                        Save Chart
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

        {/* Render saved RM Performance Comparison Chart from Dashboard */}
        {(() => {
          console.log("🔍 [DEBUG] Dashboard chart render check:", {
            isFromDashboard,
            hasSavedChart: !!savedRMPerformanceComparisonChart,
            savedChartData: savedRMPerformanceComparisonChart?.data,
            savedChartDataLength:
              savedRMPerformanceComparisonChart?.data?.length,
            selectedRMsLength: selectedRMs.length,
          });
          return (
            isFromDashboard &&
            savedRMPerformanceComparisonChart &&
            savedRMPerformanceComparisonChart.data &&
            savedRMPerformanceComparisonChart.data.length > 0
          );
        })() && (
          <Card
            sx={{
              border: "1px solid #e0e0e0",
              mb: { xs: 3, sm: 4 },
              width: "100%",
              mx: { xs: 0.5, sm: 0 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: { xs: 2, sm: 3 },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#1f2937",
                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  }}
                >
                  {`RM Performance Comparison (${selectedRMs.length} RMs)`}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: { xs: 400, sm: 500, md: 600 },
                  width: "100%",
                  minHeight: { xs: 350, sm: 450, md: 550 },
                  maxWidth: "100%",
                  overflow: "visible",
                  "& .recharts-wrapper": {
                    width: "100% !important",
                    height: "100% !important",
                  },
                  "& .recharts-cartesian-axis-tick-value": {
                    fontSize: {
                      xs: "9px !important",
                      sm: "10px !important",
                      md: "11px !important",
                    },
                    fill: "#374151 !important",
                  },
                  "& .recharts-cartesian-axis": {
                    "& text": {
                      fontSize: { xs: "9px", sm: "10px", md: "11px" },
                      fill: "#374151",
                    },
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={savedRMPerformanceComparisonChart.data}
                    margin={{
                      top: 20,
                      right: { xs: 15, sm: 20, md: 30 },
                      left: { xs: 25, sm: 35, md: 40 },
                      bottom: { xs: 80, sm: 100, md: 120 },
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f3f4f6"
                      strokeWidth={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: { xs: 8, sm: 9, md: 10 },
                        fill: "#374151",
                        fontWeight: 500,
                      }}
                      height={{ xs: 70, sm: 85, md: 100 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: { xs: 9, sm: 10, md: 11 },
                        fill: "#374151",
                        fontWeight: 500,
                      }}
                      label={{
                        value: "Achievement Rate (%)",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#374151",
                          fontSize: { xs: "10px", sm: "11px", md: "12px" },
                        },
                      }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: { xs: "10px", sm: "11px", md: "12px" },
                      }}
                      formatter={(value, name) => [
                        `${value.toFixed(1)}%`,
                        "Achievement Rate",
                      ]}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload;
                        return data?.fullName
                          ? `RM: ${data.fullName}`
                          : `RM: ${label}`;
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {savedRMPerformanceComparisonChart.data.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill || "#059669"}
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Branch Performance - Worst Performing Branches */}
      {chartData.branchChart &&
        chartData.branchChart.data &&
        chartData.branchChart.data.length > 0 && (
          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: 0,
              maxWidth: "100%",
              mx: { xs: 0.5, sm: 0 },
            }}
          >
            <Card
              sx={{
                height: "100%",
                minHeight: { xs: 450, sm: 520, md: 600 },
                border: "none",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 2.5 },
                    borderBottom: "1px solid #f1f5f9",
                    background:
                      "linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#dc2626",
                      fontSize: { xs: "1rem", sm: "1.1rem", md: "1.125rem" },
                    }}
                  >
                    {chartData.branchChart.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b7280",
                      mt: 0.5,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    }}
                  >
                    {chartData.branchChart.totalCount
                      ? `Showing top 25 of ${chartData.branchChart.totalCount} branches requiring attention`
                      : "Individual branch performance requiring immediate attention"}
                  </Typography>
                </Box>

                {/* Chart */}
                <Box
                  sx={{
                    flex: 1,
                    p: { xs: 0.5, sm: 1 },
                    py: { xs: 1.5, sm: 2 },
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 300, sm: 350, md: 400 },
                      mb: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.branchChart.data}
                        margin={{
                          top: 20,
                          right: { xs: 15, sm: 20, md: 30 },
                          left: { xs: 10, sm: 15, md: 20 },
                          bottom: { xs: 60, sm: 70, md: 80 },
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f3f4f6"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="branch"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: { xs: 8, sm: 9, md: 10 },
                            fill: "#6b7280",
                            fontWeight: 500,
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={{ xs: 60, sm: 70, md: 80 }}
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: { xs: 10, sm: 11, md: 12 },
                            fill: "#6b7280",
                            fontWeight: 500,
                          }}
                          domain={[-1.1, 0]}
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            fontSize: { xs: "12px", sm: "13px", md: "14px" },
                          }}
                          formatter={(value, name) => [
                            `Score: ${value}`,
                            "Performance Score",
                          ]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              const data = payload[0].payload;
                              return `${data.fullName} (${data.region}, ${data.state})`;
                            }
                            return label;
                          }}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {chartData.branchChart.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Custom Legend with Details */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: { xs: 1, sm: 1.5 },
                      px: { xs: 2, sm: 3 },
                      maxHeight: { xs: 150, sm: 180, md: 200 },
                      overflowY: "auto",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        mb: 1,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      }}
                    >
                      Branch Details
                    </Typography>
                    {chartData.branchChart.data
                      .slice(0, 10)
                      .map((entry, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: { xs: 0.75, sm: 1 },
                            borderRadius: 1,
                            backgroundColor: "#fef2f2",
                            borderLeft: `3px solid ${entry.fill}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                fontWeight: 600,
                                color: "#374151",
                              }}
                            >
                              {entry.fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                color: "#6b7280",
                              }}
                            >
                              {entry.region} • {entry.state}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              fontWeight: 700,
                              color: "#dc2626",
                              minWidth: { xs: "35px", sm: "40px" },
                              textAlign: "right",
                            }}
                          >
                            {entry.score}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

      {/* 3. Regional Performance Summary */}
      {regionalSummary.length > 0 && (
        <Card
          sx={{
            border: "1px solid #e0e0e0",
            mb: { xs: 3, sm: 4 },
            mx: { xs: 0.5, sm: 0 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 2, sm: 3 },
                fontWeight: 600,
                color: "#374151",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Regional Performance Summary
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {regionalSummary.map((region, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      border: "1px solid #e5e7eb",
                      backgroundColor:
                        region.averageScore < -0.5 ? "#fef2f2" : "#f8fafc",
                      borderLeft: `4px solid ${
                        region.averageScore < -0.5 ? "#ef4444" : "#0078d7"
                      }`,
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                          fontWeight: 600,
                          color: "#374151",
                          mb: { xs: 0.75, sm: 1 },
                        }}
                      >
                        {region.region}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: { xs: 0.75, sm: 1 },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          Branches:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          {region.branchCount}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          Avg Score:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            color:
                              region.averageScore < -0.5
                                ? "#ef4444"
                                : "#10b981",
                          }}
                        >
                          {region.averageScore}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 5. Analysis Insights */}
      {analysisResult?.analysis_result?.analysis && (
        <Card
          sx={{
            mb: { xs: 2, sm: 3 },
            border: "1px solid #e3f2fd",
            mx: { xs: 0.5, sm: 0 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 3 },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  backgroundColor: "#0078d7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "1.2rem", sm: "1.25rem" },
                  }}
                >
                  💡
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#0078d7",
                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  }}
                >
                  Analysis Insights
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  Key findings from your data
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {analysisResult.analysis_result.analysis.map((insight, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: { xs: 1.5, sm: 2 },
                    p: { xs: 1.5, sm: 2 },
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 20, sm: 24 },
                      height: { xs: 20, sm: 24 },
                      backgroundColor: "#0078d7",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {insight}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={exportMenuOpen}
        onClose={handleExportClose}
      >
        <MenuItem
          onClick={() => {
            exportToCSV();
            handleExportClose();
          }}
        >
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToJSON();
            handleExportClose();
          }}
        >
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToExcel();
            handleExportClose();
          }}
        >
          <ListItemIcon>
            <FileDownload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>

      {/* Analysis Summary Section */}
      {analysisResult?.analysis && analysisResult.analysis.length > 0 && (
        <Card
          sx={{
            border: "1px solid #e0e0e0",
            mb: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: "100%",
            borderRadius: 2,
            background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 32px ${alpha("#6366f1", 0.3)}`,
                }}
              >
                <Assessment sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#1f2937",
                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  }}
                >
                  Analysis Summary
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6b7280",
                  }}
                >
                  Key insights and findings from the data analysis
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {analysisResult.analysis.map((point, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor:
                      index % 2 === 0
                        ? alpha("#6366f1", 0.02)
                        : alpha("#10b981", 0.02),
                    border: `1px solid ${
                      index % 2 === 0
                        ? alpha("#6366f1", 0.1)
                        : alpha("#10b981", 0.1)
                    }`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        index % 2 === 0
                          ? alpha("#6366f1", 0.05)
                          : alpha("#10b981", 0.05),
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 20px ${
                        index % 2 === 0
                          ? alpha("#6366f1", 0.1)
                          : alpha("#10b981", 0.1)
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
                        index % 2 === 0 ? "#6366f1" : "#10b981"
                      }, ${index % 2 === 0 ? "#8b5cf6" : "#06b6d4"})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: 0.5,
                    }}
                  >
                    {index % 2 === 0 ? (
                      <TrendingUp sx={{ color: "white", fontSize: 16 }} />
                    ) : (
                      <Insights sx={{ color: "white", fontSize: 16 }} />
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#374151",
                      lineHeight: 1.6,
                      fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                      flex: 1,
                    }}
                  >
                    {point}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Save to Dashboard Popover */}
      <SaveToDashboardPopover
        anchorEl={saveDashboardAnchorEl}
        open={saveDashboardOpen}
        onClose={() => {
          setSaveDashboardAnchorEl(null);
          setPendingVisualizationData(null);
        }}
        onSave={(dashboardId) => {
          setSnackbar({
            open: true,
            message: `Saved to dashboard successfully!`,
            severity: "success",
          });
          // Open dashboard in new tab with the specific dashboard ID
          setTimeout(() => {
            const dashboardUrl = `${window.location.origin}/dashboard?id=${dashboardId}`;
            window.open(dashboardUrl, "_blank");
          }, 1000);
        }}
        visualizationData={pendingVisualizationData}
      />
    </Box>
  );
};

export default DynamicDataVisualization;
