import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Fade,
  keyframes,
  alpha,
  useTheme,
  useMediaQuery,
  IconButton,
  Button,
  Collapse,
  Tooltip,
  CircularProgress,
  Tab,
  Tabs,
  Badge,
  Chip,
} from "@mui/material";
import StatisticsCard from "./StatisticsCard";
import AnalysisWidgetSkeleton from "./AnalysisWidgetSkeleton";
import AnalysisSummaryWidget from "./AnalysisSummaryWidget";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  Analytics as AnalyticsIcon,
  DataObject as DataObjectIcon,
  DoneAll as DoneAllIcon,
  GetApp as GetAppIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  GridView as GridViewIcon,
  TableChart as TableChartIcon,
  TableView as TableViewIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Insights as InsightsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  DonutLarge as DonutLargeIcon,
  AreaChart as AreaChartIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  VisibilityOff as VisibilityOffIcon,
  Sort as SortIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import InteractiveChart from "./InteractiveChart";
import StatCard from "./StatCard";
import EnhancedDataGrid from "./EnhancedDataGrid";
import ReviewPopover from "./ReviewPopover";
import ChartErrorBoundary from "./ChartErrorBoundary";
import useReviewStore from "../../lib/stores/reviewStore";
import { generateAuditReport } from "../../utils/csvExport";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const AnalysisWidget = ({
  data,
  title = "Analysis Results",
  onSave,
  initialExpandedStates,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Loading state for complex data processing
  const [isProcessing, setIsProcessing] = useState(true);

  // Log for debugging
  console.log("AnalysisWidget received data:", data);

  const [hasAnimated, setHasAnimated] = useState(false);
  const [reviewPopover, setReviewPopover] = useState({
    open: false,
    anchorEl: null,
    recordData: null,
    tableName: "",
  });
  const { getTableReviews } = useReviewStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedChartTab, setSelectedChartTab] = useState(
    initialExpandedStates?.selectedChartTab ?? 0
  );
  const [chartTypes, setChartTypes] = useState({});
  const [visualAnalyticsExpanded, setVisualAnalyticsExpanded] = useState(
    initialExpandedStates?.visualAnalytics ?? true
  );
  const [expandedCharts, setExpandedCharts] = useState(
    initialExpandedStates?.expandedCharts ?? {}
  );
  const [tabularResultsExpanded, setTabularResultsExpanded] = useState(
    initialExpandedStates?.tabularResults ?? true
  );
  const [selectedTableTab, setSelectedTableTab] = useState(
    initialExpandedStates?.selectedTableTab ?? 0
  );
  const [expandedTables, setExpandedTables] = useState(
    initialExpandedStates?.expandedTables ?? {}
  );
  const [lastExpandedChartKeyByTab, setLastExpandedChartKeyByTab] = useState(
    initialExpandedStates?.lastExpandedChartKeyByTab ?? {}
  );
  const [hasUserExpandedCharts, setHasUserExpandedCharts] = useState(false);
  // Note: Statistics cards now use independent state management in StatisticsCard component

  // Refs for scrolling to tables
  const tableRefs = useRef({});
  const chartRefs = useRef({});

  // Scroll to table function
  const scrollToTable = (searchTitle) => {
    console.log("Searching for table:", searchTitle);
    console.log("Available tables:", Object.keys(tableRefs.current));

    // Try exact match first
    let tableRef = tableRefs.current[searchTitle];

    // If not found, try partial match with better precision
    if (!tableRef) {
      const matchingKey = Object.keys(tableRefs.current).find((key) => {
        // First try exact substring match - but only if it starts with the search title
        if (key.startsWith(searchTitle)) return true;

        // Check if the key contains the exact search title
        if (key.includes(searchTitle)) return true;

        return false;
      });

      if (matchingKey) {
        tableRef = tableRefs.current[matchingKey];
        console.log("Found partial match:", matchingKey);
      }
    }

    if (tableRef) {
      console.log("Scrolling to table");
      tableRef.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } else {
      console.log("Table not found for:", searchTitle);
    }
  };

  // Review handlers
  const handleOpenReview = (event, recordData, tableName) => {
    setReviewPopover({
      open: true,
      anchorEl: event.currentTarget,
      recordData,
      tableName,
    });
  };

  const handleCloseReview = () => {
    setReviewPopover({
      open: false,
      anchorEl: null,
      recordData: null,
      tableName: "",
    });
  };

  const handleGenerateAuditReport = (tableName, tableData) => {
    const reviews = getTableReviews(tableName);
    const filename = generateAuditReport(tableName, tableData, reviews);
    // You could show a success message here
    console.log(`Audit report generated: ${filename}`);
  };

  // Chart download functionality
  const handleDownloadChart = async (chartTitle, chartIndex) => {
    try {
      const chartElement = chartRefs.current[chartIndex];
      if (chartElement) {
        // Find the SVG or canvas element within the chart
        const svgElement = chartElement.querySelector("svg");
        const canvasElement = chartElement.querySelector("canvas");

        if (svgElement) {
          // Convert SVG to image and download
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();

          canvas.width = svgElement.clientWidth || 800;
          canvas.height = svgElement.clientHeight || 600;

          const svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          const url = URL.createObjectURL(svgBlob);

          img.onload = () => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
              const link = document.createElement("a");
              link.download = `${chartTitle.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}_chart.png`;
              link.href = URL.createObjectURL(blob);
              link.click();
              URL.revokeObjectURL(link.href);
            });

            URL.revokeObjectURL(url);
          };

          img.src = url;
        } else if (canvasElement) {
          // Download canvas directly
          canvasElement.toBlob((blob) => {
            const link = document.createElement("a");
            link.download = `${chartTitle.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}_chart.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          });
        }
      }
    } catch (error) {
      console.error("Error downloading chart:", error);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (chartIndex, newType) => {
    setChartTypes((prev) => ({
      ...prev,
      [chartIndex]: newType,
    }));
  };

  // Get current chart type for a chart
  const getCurrentChartType = (chartIndex, defaultType) => {
    return chartTypes[chartIndex] || defaultType || "donut";
  };

  // Handle chart expansion
  const handleChartExpansion = (chartKey) => {
    console.log(
      "Chart expansion clicked:",
      chartKey,
      "Current state:",
      expandedCharts[chartKey]
    );
    setExpandedCharts((prev) => {
      const newState = {
        ...prev,
        [chartKey]: !prev[chartKey],
      };
      console.log("New chart state:", newState[chartKey]);
      // Persist the last opened chart for the current tab category when expanded
      if (newState[chartKey]) {
        const tabCategories = ["reconciliation", "mismatch", "messageTypes"];
        const currentCategory =
          tabCategories[selectedChartTab] || "reconciliation";
        setLastExpandedChartKeyByTab((prevMap) => ({
          ...prevMap,
          [currentCategory]: chartKey,
        }));
      }
      return newState;
    });
  };

  // Handle table expansion
  const handleTableExpansion = (tableKey) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableKey]: !prev[tableKey],
    }));
  };

  // Note: Statistics card handlers moved to individual StatisticsCard components

  // Initialize expanded state for charts
  const initializeExpandedCharts = (charts) => {
    const initialState = {};
    charts.forEach((chart, index) => {
      const chartKey = `${chart.title}-${index}`;
      initialState[chartKey] = false; // Default to collapsed
    });
    return initialState;
  };

  // Categorize tables into tabs
  const categorizeTables = (tables) => {
    console.log(
      "Categorizing tables:",
      tables.map((t) => t.title)
    );

    const categories = {
      referenceMatches: [],
      fullyMatched: [],
      mismatches: {
        messageType: [],
        amount: [],
        bic: [],
      },
      extraRecords: [],
    };

    tables.forEach((table, index) => {
      const title = table.title.toLowerCase();
      const tableWithIndex = { ...table, originalIndex: index };

      if (
        title.includes("reference") &&
        (title.includes("match") || title.includes("id"))
      ) {
        categories.referenceMatches.push(tableWithIndex);
      } else if (title.includes("fully") && title.includes("match")) {
        categories.fullyMatched.push(tableWithIndex);
      } else if (title.includes("mismatch")) {
        if (title.includes("message") || title.includes("type")) {
          categories.mismatches.messageType.push(tableWithIndex);
        } else if (title.includes("amount")) {
          categories.mismatches.amount.push(tableWithIndex);
        } else if (title.includes("bic")) {
          categories.mismatches.bic.push(tableWithIndex);
        } else {
          // Default mismatch category
          categories.mismatches.messageType.push(tableWithIndex);
        }
      } else if (title.includes("extra") || title.includes("additional")) {
        categories.extraRecords.push(tableWithIndex);
      } else {
        // Default to reference matches if unclear
        categories.referenceMatches.push(tableWithIndex);
      }
    });

    console.log("Final categories:", {
      referenceMatches: categories.referenceMatches.length,
      fullyMatched: categories.fullyMatched.length,
      mismatches: {
        messageType: categories.mismatches.messageType.length,
        amount: categories.mismatches.amount.length,
        bic: categories.mismatches.bic.length,
      },
      extraRecords: categories.extraRecords.length,
    });

    return categories;
  };

  // Handle category-wise download
  const handleCategoryDownload = (categoryName, tables) => {
    console.log("handleCategoryDownload called with:", {
      categoryName,
      tablesCount: tables?.length,
      tables,
    });

    if (!tables || tables.length === 0) {
      console.log("No tables to download");
      return;
    }

    try {
      // Combine all tables in the category
      let combinedData = [];
      let combinedHeaders = new Set();

      // First pass: collect all unique headers
      tables.forEach((table, index) => {
        console.log(
          `Processing table ${index + 1}:`,
          table.title,
          "Data rows:",
          table.data?.length
        );
        if (table.data && table.data.length > 0) {
          Object.keys(table.data[0]).forEach((header) => {
            combinedHeaders.add(header);
          });
        }
      });

      const headersArray = Array.from(combinedHeaders);
      console.log("Combined headers:", headersArray);

      // Second pass: combine data with consistent headers
      tables.forEach((table, tableIndex) => {
        if (table.data && table.data.length > 0) {
          // Add table data directly without separator rows
          table.data.forEach((row) => {
            const normalizedRow = {};
            headersArray.forEach((header) => {
              normalizedRow[header] = row[header] || "";
            });
            // Add a source table identifier as a new column
            normalizedRow["Source_Table"] = table.title;
            combinedData.push(normalizedRow);
          });
        }
      });

      // Add Source_Table to headers if we have multiple tables
      if (tables.length > 1) {
        headersArray.push("Source_Table");
      }

      console.log("Combined data rows:", combinedData.length);

      // Create CSV content
      const csvContent = [
        headersArray.join(","),
        ...combinedData.map((row) =>
          headersArray
            .map((header) => {
              const value = row[header];
              // Escape quotes and wrap in quotes if contains comma or quote
              if (
                typeof value === "string" &&
                (value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n"))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      // Download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${categoryName}_combined_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading category:", error);
    }
  };

  // Organize statistics into categories
  const organizeStatistics = (stats) => {
    if (!stats || stats.length === 0) return null;

    const categories = {
      matches: {
        title: "Successful Matches",
        icon: <CheckCircleIcon />,
        color: theme.palette.success.main,
        priority: "medium",
        stats: [],
        totalValue: 0,
      },
      critical: {
        title: "Attention Points",
        icon: <ErrorIcon />,
        color: theme.palette.error.main,
        priority: "high",
        stats: [],
        totalValue: 0,
      },

      records: {
        title: "Total Records",
        icon: <DataObjectIcon />,
        color: theme.palette.info.main,
        priority: "medium",
        stats: [],
        totalValue: 0,
      },
      extras: {
        title: "Extra Records",
        icon: <WarningIcon />,
        color: theme.palette.warning.main,
        priority: "low",
        stats: [],
        totalValue: 0,
      },
    };

    stats.forEach((stat) => {
      const title = stat.title.toLowerCase();
      // Remove commas and parse the numeric value properly
      const value = parseInt(stat.value.toString().replace(/,/g, "")) || 0;

      console.log(
        `📝 [CATEGORIZE] Processing: "${stat.title}" (value: ${value})`
      );

      if (title.includes("mismatch")) {
        console.log(`  → 🔴 Assigning to CRITICAL (mismatch)`);
        categories.critical.stats.push(stat);
        categories.critical.totalValue += value;
      } else if (title.includes("match") || title.includes("reference")) {
        console.log(`  → 🟢 Assigning to MATCHES (match/reference)`);
        categories.matches.stats.push(stat);
        categories.matches.totalValue += value;
      } else if (
        title.includes("total") &&
        (title.includes("ktp") ||
          title.includes("xmm") ||
          title.includes("sam"))
      ) {
        console.log(`  → 🔵 Assigning to RECORDS (total ktp/xmm/sam)`);
        categories.records.stats.push(stat);
        categories.records.totalValue += value;
      } else if (title.includes("extra") || title.includes("additional")) {
        console.log(`  → 🟠 Assigning to EXTRAS (extra/additional)`);
        categories.extras.stats.push(stat);
        categories.extras.totalValue += value;
      } else {
        // Default categorization based on keywords
        if (title.includes("error") || title.includes("fail")) {
          console.log(`  → 🔴 Assigning to CRITICAL (error/fail default)`);
          categories.critical.stats.push(stat);
          categories.critical.totalValue += value;
        } else {
          console.log(`  → 🔵 Assigning to RECORDS (default)`);
          categories.records.stats.push(stat);
          categories.records.totalValue += value;
        }
      }
    });

    return categories;
  };

  // Categorize charts into tabs
  const categorizeCharts = (charts) => {
    // Check if charts have category metadata (new productivity data)
    const hasCategories = charts.some((chart) => chart.category);

    if (hasCategories) {
      // Group by metric category (Actions, Counts, Collections, etc.)
      const categoryGroups = {};
      charts.forEach((chart, index) => {
        const category = chart.category || "Other";
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push({ ...chart, originalIndex: index });
      });
      return categoryGroups;
    }

    // Fallback to old categorization for reconciliation data
    const categories = {
      reconciliation: [],
      mismatch: [],
      messageTypes: [],
    };

    charts.forEach((chart, index) => {
      const title = chart.title.toLowerCase();

      if (title.includes("reconciliation") || title.includes("overview")) {
        categories.reconciliation.push({ ...chart, originalIndex: index });
      } else if (title.includes("mismatch") || title.includes("breakdown")) {
        categories.mismatch.push({ ...chart, originalIndex: index });
      } else if (
        title.includes("message") ||
        title.includes("types") ||
        title.includes("distribution")
      ) {
        categories.messageTypes.push({ ...chart, originalIndex: index });
      } else {
        // Default to reconciliation if unclear
        categories.reconciliation.push({ ...chart, originalIndex: index });
      }
    });

    return categories;
  };

  const handleDownloadTable = (tableName, tableData) => {
    if (!tableData || tableData.length === 0) return;

    // Get column headers from the first row
    const headers = Object.keys(tableData[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...tableData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : String(value || "");
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${tableName?.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAuditReport = (tableName, tableData) => {
    if (!tableData || tableData.length === 0) return;

    // Get reviews for this specific table using the store's getState method
    const tableReviews = useReviewStore.getState().getTableReviews(tableName);

    // Generate and download the audit report
    const filename = generateAuditReport(tableName, tableData, tableReviews);

    // Show success message or notification if needed
    console.log(`Audit report generated: ${filename}`);
  };

  useEffect(() => {
    // Staggered section animations
    const timer = setInterval(() => {
      setCurrentSection((prev) => prev + 1);
    }, 500);

    setTimeout(() => clearInterval(timer), 2000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions - defined before useMemo to avoid hoisting issues
  // Helper function to format reconciliation pair names properly
  const formatPairName = (key) => {
    // Handle specific patterns: KTP_vs_XMM -> KTP vs XMM, XMM_vs_SAM -> XMM vs SAM, etc.
    return key.replace(/_vs_/g, " vs ").replace(/_/g, " ");
  };

  const generateChartsFromData = (supportingData) => {
    if (
      !supportingData ||
      !Array.isArray(supportingData) ||
      supportingData.length === 0
    )
      return [];

    const charts = [];
    const firstItem = supportingData[0];
    const allKeys = Object.keys(firstItem);

    // Check if this is pipeline data
    const pipelineFields = allKeys.filter((key) => key.includes("_Pending"));
    const hasTotalPipeline = allKeys.includes("Total_Pipeline");

    if (pipelineFields.length > 3 && hasTotalPipeline) {
      console.log(
        "🔍 [ANALYSIS] Detected pipeline data, generating pipeline charts"
      );

      // 1. Total Pipeline by Region (Bar Chart)
      const regionData = supportingData.map((item, index) => {
        const colors = [
          "#1f77b4",
          "#ff7f0e",
          "#2ca02c",
          "#d62728",
          "#9467bd",
          "#8c564b",
          "#e377c2",
          "#7f7f7f",
          "#bcbd22",
          "#17becf",
        ];
        return {
          name: item.Region_Name || `Region ${index + 1}`,
          value: item.Total_Pipeline || 0,
          color: colors[index % colors.length],
        };
      });

      charts.push({
        type: "bar",
        title: "Total Pipeline by Region",
        data: regionData,
      });

      // 2. Pipeline Stages Distribution (Pie Chart)
      let stageData = [];
      pipelineFields.forEach((stage, index) => {
        const stageTotal = supportingData.reduce(
          (sum, item) => sum + (item[stage] || 0),
          0
        );
        const colors = [
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#f97316",
          "#ec4899",
        ];
        if (stageTotal > 0) {
          stageData.push({
            name: stage.replace(/_Pending/g, "").replace(/_/g, " "),
            value: stageTotal,
            color: colors[index % colors.length],
          });
        }
      });

      if (stageData.length > 0) {
        charts.push({
          type: "pie",
          title: "Pipeline Stages Distribution",
          data: stageData,
        });
      }

      return charts;
    }

    // Check if this is branch collection data
    const hasBranches =
      allKeys.includes("Branches_afer_merger") ||
      allKeys.includes("Branches_after_merger");
    const hasRegion = allKeys.includes("Region");
    const hasState = allKeys.includes("State");
    const hasCollectionPercentage = allKeys.includes("Collection_Percentage");

    if (hasBranches && hasRegion && hasState && hasCollectionPercentage) {
      console.log(
        "🔍 [ANALYSIS] Detected branch collection data, generating collection charts"
      );

      // 1. State Distribution (Pie Chart)
      const stateData = {};
      supportingData.forEach((item) => {
        const state = item.State;
        if (state && state !== "NULL") {
          stateData[state] = (stateData[state] || 0) + 1;
        }
      });

      const stateChartData = Object.entries(stateData).map(
        ([state, count], index) => {
          const colors = [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
          ];
          return {
            name: state,
            value: count,
            color: colors[index % colors.length],
          };
        }
      );

      charts.push({
        type: "pie",
        title: "STATE Distribution",
        data: stateChartData,
      });

      // 2. Region Distribution (Donut Chart)
      const regionData = {};
      supportingData.forEach((item) => {
        const region = item.Region?.trim();
        if (region && region !== "NULL") {
          regionData[region] = (regionData[region] || 0) + 1;
        }
      });

      const regionChartData = Object.entries(regionData).map(
        ([region, count], index) => {
          const colors = [
            "#6366f1",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#06b6d4",
            "#f97316",
            "#ec4899",
            "#84cc16",
            "#64748b",
          ];
          return {
            name: region,
            value: count,
            color: colors[index % colors.length],
          };
        }
      );

      charts.push({
        type: "donut",
        title: "REGION Distribution",
        data: regionChartData,
      });

      // 3. Top Performing Branches (Bar Chart)
      const validBranches = supportingData
        .filter(
          (item) =>
            item.Collection_Percentage !== null &&
            item.Collection_Percentage !== "NULL" &&
            !isNaN(item.Collection_Percentage)
        )
        .sort(
          (a, b) =>
            (b.Collection_Percentage || 0) - (a.Collection_Percentage || 0)
        )
        .slice(0, 10); // Top 10 branches

      const branchChartData = validBranches.map((item, index) => {
        const colors = [
          "#10b981",
          "#06b6d4",
          "#6366f1",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#f97316",
          "#ec4899",
        ];
        return {
          name:
            item.Branches_afer_merger ||
            item.Branches_after_merger ||
            "Unknown",
          value: Math.round((item.Collection_Percentage || 0) * 100) / 100,
          color: colors[index % colors.length],
        };
      });

      if (branchChartData.length > 0) {
        charts.push({
          type: "bar",
          title: "TOP Performing Branches (Collection %)",
          data: branchChartData,
        });
      }

      // 4. Collection Performance by State (Area Chart)
      const statePerformance = {};
      supportingData.forEach((item) => {
        const state = item.State;
        const collectionPct = item.Collection_Percentage;
        if (
          state &&
          state !== "NULL" &&
          collectionPct !== null &&
          collectionPct !== "NULL" &&
          !isNaN(collectionPct)
        ) {
          if (!statePerformance[state]) {
            statePerformance[state] = [];
          }
          statePerformance[state].push(collectionPct);
        }
      });

      const stateAvgData = Object.entries(statePerformance).map(
        ([state, percentages], index) => {
          const avgPercentage =
            percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;
          const colors = [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
          ];
          return {
            name: state,
            value: Math.round(avgPercentage * 100) / 100,
            color: colors[index % colors.length],
          };
        }
      );

      if (stateAvgData.length > 0) {
        charts.push({
          type: "area",
          title: "AVERAGE Collection % by State",
          data: stateAvgData,
        });
      }

      return charts;
    }

    // Check if this is RM performance data
    const hasRMName = allKeys.some(
      (key) =>
        key.includes("RM_Name") ||
        key.includes("RM Name") ||
        key.toLowerCase().includes("rm_name")
    );
    const hasBranch = allKeys.some(
      (key) =>
        key.includes("Branch") ||
        key.includes("branch") ||
        key.includes("Branches_afer_merger")
    );
    const hasDemand = allKeys.some(
      (key) =>
        key.includes("Dem") || key.includes("demand") || key.includes("MTD_Dem")
    );
    const hasCollection = allKeys.some(
      (key) =>
        key.includes("Coll") ||
        key.includes("collection") ||
        key.includes("MTD_Coll")
    );
    const hasOTR = allKeys.some(
      (key) => key.includes("OTR") || key.includes("otr")
    );

    if (hasRMName && hasBranch && (hasDemand || hasCollection || hasOTR)) {
      console.log(
        "🔍 [ANALYSIS] Detected RM performance data, generating RM performance charts"
      );
      console.log("🔍 [ANALYSIS] Sample RM data:", supportingData[0]);
      console.log("🔍 [ANALYSIS] Detection flags:", {
        hasRMName,
        hasBranch,
        hasDemand,
        hasCollection,
        hasOTR,
      });

      // 1. Collection Efficiency Bar Chart
      const rmData = supportingData
        .map((rm) => {
          const demand = rm.MTD_Dem_incl_adv || 0;
          const collection = rm.MTD_Coll_incl_adv || 0;
          const efficiency = demand > 0 ? (collection / demand) * 100 : 0;

          return {
            name:
              rm.RM_Name && rm.RM_Name.length > 12
                ? rm.RM_Name.substring(0, 10) + ".."
                : rm.RM_Name,
            value: Math.round(efficiency * 100) / 100,
            efficiency,
            demand,
            collection,
            otr: Math.round((rm.OTR || 0) * 100),
            color:
              efficiency >= 90
                ? "#10b981"
                : efficiency >= 80
                ? "#f59e0b"
                : "#ef4444",
          };
        })
        .sort((a, b) => b.efficiency - a.efficiency);

      charts.push({
        type: "bar",
        title: "Collection Efficiency by RM (%)",
        data: rmData,
        yAxisLabel: "Collection Efficiency (%)",
        formatValue: (value) => `${value}%`,
      });

      console.log(
        "🔍 [ANALYSIS] Collection Efficiency chart data:",
        rmData.slice(0, 3)
      );

      // 2. OTR Performance Distribution (Pie Chart)
      const otrCategories = { excellent: 0, good: 0, average: 0, poor: 0 };
      supportingData.forEach((rm) => {
        const otr = (rm.OTR || 0) * 100;
        if (otr >= 95) otrCategories.excellent++;
        else if (otr >= 85) otrCategories.good++;
        else if (otr >= 70) otrCategories.average++;
        else otrCategories.poor++;
      });

      const otrPieData = [
        {
          name: "Excellent (95%+)",
          value: otrCategories.excellent,
          color: "#10b981",
        },
        { name: "Good (85-94%)", value: otrCategories.good, color: "#f59e0b" },
        {
          name: "Average (70-84%)",
          value: otrCategories.average,
          color: "#f97316",
        },
        { name: "Poor (<70%)", value: otrCategories.poor, color: "#ef4444" },
      ].filter((item) => item.value > 0);

      if (otrPieData.length > 0) {
        charts.push({
          type: "donut",
          title: "OTR Performance Distribution",
          data: otrPieData,
        });

        console.log("🔍 [ANALYSIS] OTR Distribution chart data:", otrPieData);
      }

      // 3. Top Performing RMs by Collection Amount (Bar Chart)
      const topRMsData = supportingData
        .filter((rm) => (rm.MTD_Coll_incl_adv || 0) > 0)
        .sort((a, b) => (b.MTD_Coll_incl_adv || 0) - (a.MTD_Coll_incl_adv || 0))
        .slice(0, 10)
        .map((rm, index) => ({
          name:
            rm.RM_Name && rm.RM_Name.length > 12
              ? rm.RM_Name.substring(0, 10) + ".."
              : rm.RM_Name,
          value: rm.MTD_Coll_incl_adv || 0,
          demand: rm.MTD_Dem_incl_adv || 0,
          collection: rm.MTD_Coll_incl_adv || 0,
          efficiency:
            rm.MTD_Dem_incl_adv > 0
              ? (rm.MTD_Coll_incl_adv / rm.MTD_Dem_incl_adv) * 100
              : 0,
          color: index < 3 ? "#10b981" : index < 6 ? "#3b82f6" : "#6366f1",
        }));

      if (topRMsData.length > 0) {
        charts.push({
          type: "bar",
          title: "TOP 10 RMs by Collection Amount",
          data: topRMsData,
          yAxisLabel: "Collection Amount",
          formatValue: (value) => `₹${value.toLocaleString()}`,
        });

        console.log(
          "🔍 [ANALYSIS] Top RMs chart data:",
          topRMsData.slice(0, 3)
        );
      }

      console.log(
        "🔍 [ANALYSIS] Final RM charts generated:",
        charts.length,
        "charts"
      );

      return charts.slice(0, 2); // Limit to 2 charts for clean layout
    }

    // Check if this is productivity data - look for numeric fields and grouping fields
    const hasWorkDate =
      allKeys.includes("work_date") || allKeys.includes("work_day");
    const hasRegionField = allKeys.includes("region");
    const hasStateField = allKeys.includes("state");
    const workDateField = allKeys.includes("work_date")
      ? "work_date"
      : "work_day";

    // Find all numeric fields that could be charted
    const numericFields = allKeys.filter((key) => {
      const sampleValue = supportingData[0]?.[key];
      return (
        typeof sampleValue === "number" &&
        !key.toLowerCase().includes("id") &&
        !key.toLowerCase().includes("percentage") &&
        key !== "work_date" &&
        key !== "work_day" &&
        key !== "region" &&
        key !== "state"
      );
    });

    // Check if this looks like productivity/action data
    const isProductivityData =
      numericFields.length > 0 &&
      (hasWorkDate || hasRegionField || hasStateField);

    if (isProductivityData) {
      console.log(
        "🔍 [ANALYSIS] Detected productivity data with numeric fields:",
        numericFields
      );

      // Dynamic chart generation for all numeric fields
      const colorPalettes = [
        [
          "#10b981",
          "#3b82f6",
          "#6366f1",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#f97316",
        ],
        [
          "#8b5cf6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#3b82f6",
          "#f97316",
          "#ec4899",
        ],
        [
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#3b82f6",
          "#f97316",
        ],
        [
          "#f59e0b",
          "#10b981",
          "#3b82f6",
          "#8b5cf6",
          "#ef4444",
          "#06b6d4",
          "#6366f1",
          "#f97316",
        ],
      ];

      // Helper function to format field names for display
      const formatFieldName = (fieldName) => {
        return fieldName
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
      };

      // Helper function to categorize fields by metric type
      const categorizeField = (fieldName) => {
        const lowerField = fieldName.toLowerCase();
        if (lowerField.includes("action")) return "Actions";
        if (lowerField.includes("count")) return "Counts";
        if (lowerField.includes("rm") || lowerField.includes("productive"))
          return "Resources";
        if (lowerField.includes("collection")) return "Collections";
        if (lowerField.includes("onboarding")) return "Onboarding";
        return "Other Metrics";
      };

      // Group charts by category and dimension
      const chartsByCategory = {};

      // Generate charts by region for each numeric field
      if (hasRegionField) {
        numericFields.forEach((field, fieldIndex) => {
          const category = categorizeField(field);
          if (!chartsByCategory[category]) {
            chartsByCategory[category] = { byRegion: [], byDate: [] };
          }

          const regionData = {};
          supportingData.forEach((item) => {
            const region = item.region?.trim();
            if (region && item[field] != null) {
              regionData[region] =
                (regionData[region] || 0) + (item[field] || 0);
            }
          });

          const chartData = Object.entries(regionData).map(
            ([region, total], index) => {
              const colors = colorPalettes[fieldIndex % colorPalettes.length];
              return {
                name: region,
                value: total,
                color: colors[index % colors.length],
              };
            }
          );

          if (chartData.length > 0) {
            chartsByCategory[category].byRegion.push({
              type: "bar",
              title: `${formatFieldName(field)} by Region`,
              data: chartData,
              yAxisLabel: formatFieldName(field),
              fieldName: field,
            });
          }
        });
      }

      // Generate charts by date for each numeric field
      if (hasWorkDate) {
        numericFields.forEach((field, fieldIndex) => {
          const category = categorizeField(field);
          if (!chartsByCategory[category]) {
            chartsByCategory[category] = { byRegion: [], byDate: [] };
          }

          const dateData = {};
          supportingData.forEach((item) => {
            const date = item[workDateField]
              ? new Date(item[workDateField]).toLocaleDateString()
              : null;
            if (date && item[field] != null) {
              dateData[date] = (dateData[date] || 0) + (item[field] || 0);
            }
          });

          const chartData = Object.entries(dateData)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, total], index) => {
              const colors = colorPalettes[fieldIndex % colorPalettes.length];
              return {
                name: date,
                value: total,
                color: colors[index % colors.length],
              };
            });

          if (chartData.length > 0) {
            chartsByCategory[category].byDate.push({
              type: "line",
              title: `${formatFieldName(field)} by Date`,
              data: chartData,
              yAxisLabel: formatFieldName(field),
              fieldName: field,
            });
          }
        });
      }

      // Flatten charts with category metadata for rendering
      Object.entries(chartsByCategory).forEach(([category, dimensions]) => {
        dimensions.byRegion.forEach((chart) => {
          charts.push({ ...chart, category, dimension: "byRegion" });
        });
        dimensions.byDate.forEach((chart) => {
          charts.push({ ...chart, category, dimension: "byDate" });
        });
      });

      console.log(
        "🔍 [ANALYSIS] Productivity charts generated:",
        charts.length,
        "charts"
      );

      return charts;
    }

    // Original logic for other data types
    Object.keys(firstItem).forEach((key) => {
      const values = supportingData
        .map((item) => item[key])
        .filter((v) => v !== null && v !== undefined);
      const uniqueValues = [...new Set(values)];

      // Create charts for categorical data with reasonable number of categories
      if (
        uniqueValues.length > 1 &&
        uniqueValues.length <= 10 &&
        typeof firstItem[key] !== "number"
      ) {
        const chartData = uniqueValues.map((value, index) => {
          const count = values.filter((v) => v === value).length;
          const colors = [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
            "#8c564b",
            "#e377c2",
            "#7f7f7f",
            "#bcbd22",
            "#17becf",
          ];
          return {
            name: String(value),
            value: count,
            color: colors[index % colors.length],
          };
        });

        charts.push({
          type: "pie",
          title: `${formatPairName(key).toUpperCase()} Distribution`,
          data: chartData,
        });
      }
    });

    return charts.slice(0, 2); // Limit to 2 charts for clean layout
  };

  const generateStatsFromData = (supportingData) => {
    if (
      !supportingData ||
      !Array.isArray(supportingData) ||
      supportingData.length === 0
    )
      return [];

    const firstItem = supportingData[0];
    const allKeys = Object.keys(firstItem);

    // Check if this is pipeline data
    const pipelineFields = allKeys.filter((key) => key.includes("_Pending"));
    const hasTotalPipeline = allKeys.includes("Total_Pipeline");

    if (pipelineFields.length > 3 && hasTotalPipeline) {
      // Pipeline-specific statistics
      const totalPipeline = supportingData.reduce(
        (sum, item) => sum + (item.Total_Pipeline || 0),
        0
      );
      const avgPipelinePerRegion = totalPipeline / supportingData.length;
      const maxPipeline = Math.max(
        ...supportingData.map((item) => item.Total_Pipeline || 0)
      );

      // Find biggest bottleneck stage
      let maxStageTotal = 0;
      let bottleneckStage = "";
      pipelineFields.forEach((stage) => {
        const stageTotal = supportingData.reduce(
          (sum, item) => sum + (item[stage] || 0),
          0
        );
        if (stageTotal > maxStageTotal) {
          maxStageTotal = stageTotal;
          bottleneckStage = stage.replace(/_Pending/g, "").replace(/_/g, " ");
        }
      });

      return [
        {
          title: "Total Pipeline",
          value: totalPipeline.toLocaleString(),
          icon: AssessmentIcon,
          color: theme.palette.primary.main,
          trend: "+8%",
        },
        {
          title: "Active Regions",
          value: supportingData.length.toLocaleString(),
          icon: AnalyticsIcon,
          color: theme.palette.info.main,
          trend: "100%",
        },
        {
          title: "Avg Pipeline/Region",
          value: Math.round(avgPipelinePerRegion).toLocaleString(),
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          trend: "+5%",
        },
        {
          title: `Top Bottleneck`,
          value: `${bottleneckStage} (${maxStageTotal})`,
          icon: WarningIcon,
          color: theme.palette.warning.main,
          trend: "-3%",
        },
      ];
    }

    // Check if this is branch collection data
    const hasBranches =
      allKeys.includes("Branches_afer_merger") ||
      allKeys.includes("Branches_after_merger");
    const hasRegion = allKeys.includes("Region");
    const hasState = allKeys.includes("State");
    const hasCollectionPercentage = allKeys.includes("Collection_Percentage");

    if (hasBranches && hasRegion && hasState && hasCollectionPercentage) {
      // Branch collection-specific statistics
      const validCollections = supportingData.filter(
        (item) =>
          item.Collection_Percentage !== null &&
          item.Collection_Percentage !== "NULL" &&
          !isNaN(item.Collection_Percentage)
      );

      const totalBranches = supportingData.length;
      const avgCollectionPct =
        validCollections.length > 0
          ? validCollections.reduce(
              (sum, item) => sum + item.Collection_Percentage,
              0
            ) / validCollections.length
          : 0;

      const maxCollection =
        validCollections.length > 0
          ? Math.max(
              ...validCollections.map((item) => item.Collection_Percentage)
            )
          : 0;
      const minCollection =
        validCollections.length > 0
          ? Math.min(
              ...validCollections.map((item) => item.Collection_Percentage)
            )
          : 0;

      // Count unique states and regions
      const uniqueStates = [
        ...new Set(
          supportingData
            .map((item) => item.State)
            .filter((s) => s && s !== "NULL")
        ),
      ];
      const uniqueRegions = [
        ...new Set(
          supportingData
            .map((item) => item.Region?.trim())
            .filter((r) => r && r !== "NULL")
        ),
      ];

      // Find top performing branch
      const topBranch = validCollections.reduce(
        (max, item) =>
          item.Collection_Percentage > (max.Collection_Percentage || 0)
            ? item
            : max,
        { Collection_Percentage: 0 }
      );

      return [
        {
          title: "Total Records",
          value: totalBranches.toLocaleString(),
          icon: AssessmentIcon,
          color: theme.palette.primary.main,
          trend: "+0%",
        },
        {
          title: "States",
          value: uniqueStates.length.toLocaleString(),
          icon: AnalyticsIcon,
          color: theme.palette.info.main,
          trend: "100%",
        },
        {
          title: "Avg Collection Percentage",
          value: `${Math.round(avgCollectionPct * 100) / 100}%`,
          icon: TrendingUpIcon,
          color:
            avgCollectionPct > 20
              ? theme.palette.success.main
              : theme.palette.warning.main,
          trend: avgCollectionPct > 15 ? "+5%" : "-2%",
        },
        {
          title: "Collection Percentage Range",
          value: `${Math.round(minCollection * 100) / 100} - ${
            Math.round(maxCollection * 100) / 100
          }%`,
          icon: WarningIcon,
          color: theme.palette.error.main,
          trend: maxCollection > 40 ? "+15%" : "-5%",
        },
      ];
    }

    // Check if this is RM performance data
    const hasRMName = allKeys.some(
      (key) =>
        key.includes("RM_Name") ||
        key.includes("RM Name") ||
        key.toLowerCase().includes("rm_name")
    );
    const hasBranch = allKeys.some(
      (key) =>
        key.includes("Branch") ||
        key.includes("branch") ||
        key.includes("Branches_afer_merger")
    );
    const hasDemand = allKeys.some(
      (key) =>
        key.includes("Dem") || key.includes("demand") || key.includes("MTD_Dem")
    );
    const hasCollection = allKeys.some(
      (key) =>
        key.includes("Coll") ||
        key.includes("collection") ||
        key.includes("MTD_Coll")
    );
    const hasOTR = allKeys.some(
      (key) => key.includes("OTR") || key.includes("otr")
    );

    if (hasRMName && hasBranch && (hasDemand || hasCollection || hasOTR)) {
      console.log("🔍 [STATS] Generating RM performance stats");
      // RM performance-specific statistics
      const totalDemand = supportingData.reduce(
        (sum, rm) => sum + (rm.MTD_Dem_incl_adv || 0),
        0
      );
      const totalCollection = supportingData.reduce(
        (sum, rm) => sum + (rm.MTD_Coll_incl_adv || 0),
        0
      );
      const overallEfficiency =
        totalDemand > 0 ? (totalCollection / totalDemand) * 100 : 0;
      const avgOTR =
        supportingData.reduce((sum, rm) => sum + (rm.OTR || 0) * 100, 0) /
        supportingData.length;
      const topPerformers = supportingData.filter((rm) => {
        const efficiency =
          rm.MTD_Dem_incl_adv > 0
            ? (rm.MTD_Coll_incl_adv / rm.MTD_Dem_incl_adv) * 100
            : 0;
        return efficiency >= 90;
      }).length;

      return [
        {
          title: "Total Collection",
          value: Math.round(totalCollection).toLocaleString(),
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          trend: "+5%",
        },
        {
          title: "Total Demand",
          value: Math.round(totalDemand).toLocaleString(),
          icon: AssessmentIcon,
          color: theme.palette.warning.main,
          trend: "+3%",
        },
        {
          title: "Collection Efficiency",
          value: `${Math.round(overallEfficiency)}%`,
          icon: CheckCircleIcon,
          color:
            overallEfficiency >= 90
              ? theme.palette.success.main
              : overallEfficiency >= 80
              ? theme.palette.warning.main
              : theme.palette.error.main,
          trend: overallEfficiency >= 85 ? "+2%" : "-1%",
        },
        {
          title: "Average OTR",
          value: `${Math.round(avgOTR)}%`,
          icon: AnalyticsIcon,
          color:
            avgOTR >= 90
              ? theme.palette.success.main
              : avgOTR >= 80
              ? theme.palette.info.main
              : theme.palette.error.main,
          trend: avgOTR >= 85 ? "+4%" : "-2%",
        },
      ];
    }

    // Default statistics for non-pipeline data
    const stats = [
      {
        title: "Total Records",
        value: supportingData.length.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: "+0%",
      },
    ];

    // Find numeric fields for additional statistics
    Object.keys(firstItem).forEach((key) => {
      const values = supportingData
        .map((item) => item[key])
        .filter((v) => typeof v === "number");
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        // Format large numbers appropriately
        const formatLargeNumber = (num) => {
          if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + "B";
          } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
          } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
          } else {
            return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }
        };

        // Add average statistic
        stats.push({
          title: `Avg ${key.replace(/_/g, " ").toUpperCase()}`,
          value: formatLargeNumber(avg),
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          trend: "+5%",
        });

        // Add range information if space allows
        if (stats.length < 4) {
          stats.push({
            title: `${key.replace(/_/g, " ").toUpperCase()} Range`,
            value: `${formatLargeNumber(min)} - ${formatLargeNumber(max)}`,
            icon: AnalyticsIcon,
            color: theme.palette.info.main,
            trend: "±12%",
          });
        }
      }
    });

    return stats.slice(0, 4); // Limit to 4 stats for grid layout
  };

  const generateReconciliationCharts = (result) => {
    const charts = [];

    Object.keys(result).forEach((key) => {
      const item = result[key];
      if (item.summary) {
        const summary = item.summary;

        // 1. Create Matches Overview Chart (using detailed_field_matches and reference_matches only)
        const matchesData = [];
        if (summary.reference_matches)
          matchesData.push({
            name: "Reference Matches",
            value: summary.reference_matches,
            color: "#22c55e",
          });
        if (summary.detailed_field_matches)
          matchesData.push({
            name: "Field Matches",
            value: summary.detailed_field_matches,
            color: "#2563eb",
          }); // Changed to blue as requested
        if (summary.total_mismatches)
          matchesData.push({
            name: "Total Mismatches",
            value: summary.total_mismatches,
            color: "#ef4444",
          }); // Changed to red for problems

        if (matchesData.length > 0) {
          charts.push({
            type: "donut",
            title: `${formatPairName(key)} - Reconciliation Overview`,
            data: matchesData,
          });
        }

        // 1.5. Create Mismatch Breakdown Chart (detailed breakdown of mismatch types)
        if (summary.total_mismatches > 0) {
          const mismatchBreakdownData = [];
          if (summary.message_type_mismatches) {
            mismatchBreakdownData.push({
              name: "Message Type Mismatches",
              value: summary.message_type_mismatches,
              color: "#f59e0b", // Bright orange for message type issues
            });
          }
          if (summary.amount_mismatches) {
            mismatchBreakdownData.push({
              name: "Amount Mismatches",
              value: summary.amount_mismatches,
              color: "#8b5cf6", // Purple for amount issues
            });
          }
          if (summary.bic_mismatches) {
            mismatchBreakdownData.push({
              name: "BIC Mismatches",
              value: summary.bic_mismatches,
              color: "#06b6d4", // Teal for BIC issues
            });
          }

          if (mismatchBreakdownData.length > 0) {
            charts.push({
              type: "donut",
              title: `${formatPairName(key)} - Mismatch Breakdown (${
                summary.total_mismatches
              } total)`,
              data: mismatchBreakdownData,
              height: 300, // Same height as other charts for uniformity
            });
          }
        }

        // 2. Create Amount Comparison Chart (KTP vs XMM vs SAM)
        if (
          summary.total_amount_in_KTP &&
          summary.total_amount_in_XMM &&
          summary.total_amount_in_SAM
        ) {
          const amountData = [
            {
              name: "KTP Amount",
              value: summary.total_amount_in_KTP / 1000000, // Convert to millions for readability
              color: "#2563eb", // Brighter blue
              fullValue: summary.total_amount_in_KTP,
              fill: "#2563eb",
            },
            {
              name: "XMM Amount",
              value: summary.total_amount_in_XMM / 1000000,
              color: "#059669", // Brighter green
              fullValue: summary.total_amount_in_XMM,
              fill: "#059669",
            },
            {
              name: "SAM Amount",
              value: summary.total_amount_in_SAM / 1000000,
              color: "#dc2626", // Brighter red
              fullValue: summary.total_amount_in_SAM,
              fill: "#dc2626",
            },
          ];

          charts.push({
            type: "bar",
            title: "Amount Comparison (KTP vs XMM vs SAM)",
            data: amountData,
            yAxisLabel: "Amount (Millions)",
            formatValue: (value) => `$${value.toFixed(2)}M`,
            barSize: 35, // Thinner bars as requested
            maxBarSize: 35, // Uniform bar width
            margin: { top: 20, right: 30, left: 60, bottom: 80 }, // More space to prevent cutoff
            height: 300, // Contained height
            layout: { padding: 20 }, // Extra padding to prevent cutoff
          });
        }
      }

      // 3. Create Individual Message Type Charts
      if (item.message_type_count_in_KTP) {
        const ktpMessageData = item.message_type_count_in_KTP.map((msg) => ({
          name: msg.msg_type,
          value: msg.msg_type_count,
          color:
            msg.msg_type === "MT300NDFBK"
              ? "#3b82f6"
              : msg.msg_type === "MT202"
              ? "#10b981"
              : msg.msg_type === "MT320"
              ? "#f59e0b"
              : "#8b5cf6",
        }));

        charts.push({
          type: "donut",
          title: "KTP Message Types Distribution",
          data: ktpMessageData,
        });
      }

      if (item.message_type_count_in_XMM) {
        const xmmMessageData = item.message_type_count_in_XMM.map((msg) => ({
          name: `MT${msg.omh_msg_type}`,
          value: parseInt(msg.msg_type_count || msg.type_count),
          color:
            msg.omh_msg_type === "300"
              ? "#3b82f6"
              : msg.omh_msg_type === "202"
              ? "#10b981"
              : msg.omh_msg_type === "320"
              ? "#f59e0b"
              : "#8b5cf6",
        }));

        charts.push({
          type: "donut",
          title: "XMM Message Types Distribution",
          data: xmmMessageData,
        });
      }

      if (item.message_type_count_in_SAM) {
        const samMessageData = item.message_type_count_in_SAM
          .map((msg) => ({
            name: msg.Identifier,
            value: msg.Identifier_Count || msg.identifier_count, // Handle both field name variations
            color:
              msg.Identifier === "fin.300"
                ? "#2563eb"
                : msg.Identifier === "fin.202"
                ? "#059669"
                : msg.Identifier === "fin.320"
                ? "#dc2626"
                : msg.Identifier === "fin.301"
                ? "#ef4444"
                : "#8b5cf6",
          }))
          .filter((item) => item.value > 0); // Filter out zero values

        if (samMessageData.length > 0) {
          charts.push({
            type: "donut",
            title: "SAM Message Types Distribution",
            data: samMessageData,
          });
        }
      }
    });

    return charts;
  };

  const generateReconciliationStats = (result) => {
    let totalMismatches = 0;
    let totalMissingRecords = 0;
    let totalDataBreaks = 0;
    let individualRecordCounts = { ktp: 0, xmm: 0, sam: 0 };
    let referenceMatches = 0;
    let detailedFieldMatches = 0;
    let messageTypeMismatches = 0;
    let amountMismatches = 0;
    let bicMismatches = 0;
    let ktpOnlyReferences = 0;
    let xmmOnlyReferences = 0;
    let samOnlyReferences = 0;
    let totalKtpRecords = 0;
    let totalXmmRecords = 0;
    let totalSamRecords = 0;

    Object.keys(result).forEach((key) => {
      const item = result[key];
      console.log(`🔍 Processing result key: ${key}`, item.summary);

      if (item.summary) {
        // Handle new API format - only use detailed_field_matches and reference_matches
        if (
          item.summary.reference_matches !== undefined ||
          item.summary.detailed_field_matches !== undefined
        ) {
          totalMismatches += item.summary.total_mismatches || 0;

          // Capture specific match types (as requested by user)
          referenceMatches += item.summary.reference_matches || 0;
          detailedFieldMatches += item.summary.detailed_field_matches || 0;
          messageTypeMismatches += item.summary.message_type_mismatches || 0;
          amountMismatches += item.summary.amount_mismatches || 0;
          bicMismatches += item.summary.bic_mismatches || 0;

          // Extra records statistics
          ktpOnlyReferences += item.summary.ktp_only_references || 0;
          xmmOnlyReferences += item.summary.xmm_only_references || 0;
          samOnlyReferences += item.summary.sam_only_references || 0;

          console.log(`🔍 After processing ${key}:`, {
            ktpOnlyReferences,
            xmmOnlyReferences,
            samOnlyReferences,
            totalSamRecords:
              totalSamRecords + (item.summary.total_sam_records || 0),
          });

          // Total record counts
          totalKtpRecords += item.summary.total_ktp_records || 0;
          totalXmmRecords += item.summary.total_xmm_records || 0;
          totalSamRecords += item.summary.total_sam_records || 0;

          // Individual record counts - accumulate rather than overwrite
          individualRecordCounts = {
            ktp: totalKtpRecords,
            xmm: totalXmmRecords,
            sam: totalSamRecords,
          };
        }
        // Handle legacy API format
        else {
          // Check for individual record counts first
          if (
            item.summary.total_ktp_records ||
            item.summary.total_xmm_records ||
            item.summary.total_sam_records
          ) {
            individualRecordCounts = {
              ktp: item.summary.total_ktp_records || 0,
              xmm: item.summary.total_xmm_records || 0,
              sam: item.summary.total_sam_records || 0,
            };
          }

          // For legacy format, use reference_matches and detailed_field_matches if available
          referenceMatches +=
            item.summary.reference_matches || item.summary.full_matches || 0;
          detailedFieldMatches += item.summary.detailed_field_matches || 0;
          totalMismatches += item.summary.mismatches || 0;
          totalMissingRecords +=
            (item.summary.missing_in_xmm || 0) +
            (item.summary.missing_in_ktp || 0) +
            (item.summary.missing_in_sam || 0);
          totalDataBreaks += item.summary.data_breaks || 0;
        }
      }
    });

    // Calculate total using only reference_matches and detailed_field_matches as requested
    const totalMatches = referenceMatches + detailedFieldMatches;
    const totalRecords = totalMatches + totalMismatches + totalMissingRecords;
    const matchRate =
      totalRecords > 0 ? (totalMatches / totalRecords) * 100 : 0;

    // Debug final values
    console.log("🔍 FINAL VALUES:", {
      totalKtpRecords,
      totalXmmRecords,
      totalSamRecords,
      ktpOnlyReferences,
      xmmOnlyReferences,
      samOnlyReferences,
    });

    return [
      {
        title: "Total KTP Records",
        value: totalKtpRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: "+0%",
      },
      {
        title: "Total XMM Records",
        value: totalXmmRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: "+0%",
      },
      {
        title: "Total SAM Records",
        value: totalSamRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: "+0%",
      },
      {
        title: "Reference ID Matches",
        value: referenceMatches.toLocaleString(),
        icon: CheckCircleIcon,
        color: theme.palette.success.main,
        trend: referenceMatches > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("Fully Matched References"),
      },
      {
        title: "Full Matches",
        value: detailedFieldMatches.toLocaleString(),
        icon: DoneAllIcon,
        color: theme.palette.success.main,
        trend: detailedFieldMatches > 0 ? "+2%" : "0%",
        onClick: () => scrollToTable("Fully Matched Records Details"),
      },
      {
        title: "Total Mismatches",
        value: totalMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: totalMismatches > 0 ? "+3%" : "0%",
        onClick: () => scrollToTable("Message Type Mismatches"),
      },
      // {
      //   title: 'Total Matches',
      //   value: totalMatches.toLocaleString(),
      //   icon: DoneAllIcon,
      //   color: theme.palette.success.main,
      //   trend: totalMatches > 0 ? '+1%' : '0%'
      // },

      // {
      //   title: 'Match Rate',
      //   value: `${matchRate.toFixed(1)}%`,
      //   icon: CheckCircleIcon,
      //   color: matchRate > 80 ? theme.palette.success.main : matchRate > 60 ? theme.palette.warning.main : theme.palette.error.main,
      //   trend: matchRate > 80 ? '+2%' : '-5%'
      // },

      {
        title: "Message Type Mismatches",
        value: messageTypeMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: messageTypeMismatches > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("Message Type Mismatches"),
      },
      {
        title: "Amount Mismatches",
        value: amountMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: amountMismatches > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("Amount Mismatches"),
      },
      {
        title: "BIC Mismatches",
        value: bicMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: bicMismatches > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("BIC Mismatches"),
      },
      {
        title: "KTP Extra Records",
        value: ktpOnlyReferences.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.info.main,
        trend: ktpOnlyReferences > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("Extra Records in KTP vs XMM"),
      },
      {
        title: "XMM Extra Records",
        value: xmmOnlyReferences.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.info.main,
        trend: xmmOnlyReferences > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("Extra Records in XMM vs KTP"),
      },
      {
        title: "SAM Extra Records",
        value: samOnlyReferences.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.info.main,
        trend: samOnlyReferences > 0 ? "+1%" : "0%",
        onClick: () => scrollToTable("Extra Records in SAM vs XMM"),
      },
    ];
  };

  const generateReconciliationTables = (result) => {
    const tables = [];

    Object.keys(result).forEach((key) => {
      const item = result[key];
      const formattedName = formatPairName(key);

      // Add fully matched references table FIRST
      if (
        item.fully_matched_references &&
        Array.isArray(item.fully_matched_references) &&
        item.fully_matched_references.length > 0
      ) {
        tables.push({
          title: `${formattedName} - Fully Matched References (${item.fully_matched_references.length} total)`,
          data: item.fully_matched_references.map((record) => {
            // Create a flat record with all fields from the API response
            const flatRecord = {};

            // Copy all fields dynamically from the record
            Object.keys(record).forEach((fieldKey) => {
              const fieldValue = record[fieldKey];

              // Handle arrays by joining them
              if (Array.isArray(fieldValue)) {
                flatRecord[fieldKey] = fieldValue.join(", ");
              }
              // Handle objects by stringifying them
              else if (typeof fieldValue === "object" && fieldValue !== null) {
                flatRecord[fieldKey] = JSON.stringify(fieldValue);
              }
              // Handle primitive values
              else {
                flatRecord[fieldKey] =
                  fieldValue !== undefined && fieldValue !== null
                    ? fieldValue
                    : "N/A";
              }
            });

            return flatRecord;
          }),
        });
      }

      // Add fully matched records (detailed) table SECOND
      if (
        item.fully_matched_records &&
        Array.isArray(item.fully_matched_records) &&
        item.fully_matched_records.length > 0
      ) {
        tables.push({
          title: `${formattedName} - Fully Matched Records Details (${item.fully_matched_records.length} records)`,
          data: item.fully_matched_records.map((record) => {
            // Create a flat record with all fields from the API response (same processing as fully_matched_references)
            const flatRecord = {};

            // Copy all fields dynamically from the record
            Object.keys(record).forEach((fieldKey) => {
              const fieldValue = record[fieldKey];

              // Handle arrays by joining them
              if (Array.isArray(fieldValue)) {
                flatRecord[fieldKey] = fieldValue.join(", ");
              }
              // Handle objects by stringifying them
              else if (typeof fieldValue === "object" && fieldValue !== null) {
                flatRecord[fieldKey] = JSON.stringify(fieldValue);
              }
              // Handle primitive values
              else {
                flatRecord[fieldKey] =
                  fieldValue !== undefined && fieldValue !== null
                    ? fieldValue
                    : "N/A";
              }
            });

            return flatRecord;
          }),
        });
      }

      // Add mismatched records table (legacy format)
      if (
        item.mismatched_records &&
        Array.isArray(item.mismatched_records) &&
        item.mismatched_records.length > 0
      ) {
        const mismatchedTableData = [];

        item.mismatched_records.forEach((record) => {
          if (
            record.discrepancies &&
            Array.isArray(record.discrepancies) &&
            record.discrepancies.length > 0
          ) {
            // Handle records with detailed discrepancies
            record.discrepancies.forEach((discrepancy) => {
              mismatchedTableData.push({
                key_ref: record.key_ref,
                mismatch_type:
                  discrepancy.mismatch_type ||
                  record.mismatch_summary ||
                  "Mismatch",
                xmm_value:
                  discrepancy.xmm_value || discrepancy.ktp_value || "N/A",
                sam_value:
                  discrepancy.sam_value || discrepancy.xmm_value || "N/A",
              });
            });
          } else {
            // Handle records without detailed discrepancies or empty discrepancies
            mismatchedTableData.push({
              key_ref: record.key_ref,
              mismatch_type: record.mismatch_summary || "Mismatch detected",
              mismatch_details:
                record.mismatch_summary ||
                "No detailed discrepancies available",
              status: "Requires Review",
            });
          }
        });

        if (mismatchedTableData.length > 0) {
          tables.push({
            title: `${formattedName} - Mismatched Records`,
            data: mismatchedTableData,
            type: "mismatched_records", // Add type for special handling
          });
        }
      }

      // Add new format mismatched records tables
      // Message Type Mismatches
      if (
        item.mismatched_message_type_but_same_ref &&
        Array.isArray(item.mismatched_message_type_but_same_ref) &&
        item.mismatched_message_type_but_same_ref.length > 0
      ) {
        const messageTypeMismatches =
          item.mismatched_message_type_but_same_ref.map((record) => ({
            ...record,
            key_ref:
              record.Reference || record.sender_ref || record.ref || "Unknown",
            mismatch_type: "Message Type Mismatch",
            ktp_value: record.KTP_msg_type
              ? `${record.KTP_msg_type} (${
                  record.KTP_normalized_msg_code || "N/A"
                })`
              : "N/A",
            xmm_value: record.XMM_msg_type
              ? `${record.XMM_msg_type} (${
                  record.XMM_normalized_msg_code || "N/A"
                })`
              : "N/A",
            sam_value: record.SAM_Identifier
              ? `${record.SAM_Identifier} (${
                  record.SAM_normalized_msg_code || "N/A"
                })`
              : "N/A",
            discrepancy: `KTP: ${
              record.KTP_normalized_msg_code || "N/A"
            } vs XMM: ${record.XMM_normalized_msg_code || "N/A"} vs SAM: ${
              record.SAM_normalized_msg_code || "N/A"
            }`,
          }));

        tables.push({
          title: `${formattedName} - Message Type Mismatches (${messageTypeMismatches.length} records)`,
          data: messageTypeMismatches,
          type: "mismatched_records",
        });
      }

      // Amount Mismatches
      if (
        item.mismatched_amount_but_same_ref &&
        Array.isArray(item.mismatched_amount_but_same_ref) &&
        item.mismatched_amount_but_same_ref.length > 0
      ) {
        const amountMismatches = item.mismatched_amount_but_same_ref.map(
          (record) => ({
            ...record,
            key_ref:
              record.Reference || record.sender_ref || record.ref || "Unknown",
            mismatch_type: "Amount Mismatch",
            ktp_value:
              record.KTP_amount?.toLocaleString() ||
              record.KTP_normalized_amount?.toLocaleString() ||
              "N/A",
            xmm_value:
              record.XMM_amount?.toLocaleString() ||
              record.XMM_normalized_amount?.toLocaleString() ||
              "N/A",
            sam_value:
              record.SAM_Cur_Amt ||
              record.SAM_normalized_amount?.toLocaleString() ||
              "N/A",
            // Add normalized comparison for clarity
            normalized_diff:
              record.SAM_normalized_amount && record.XMM_normalized_amount
                ? `${(
                    record.SAM_normalized_amount - record.XMM_normalized_amount
                  ).toLocaleString()}`
                : "N/A",
          })
        );

        tables.push({
          title: `${formattedName} - Amount Mismatches (${amountMismatches.length} records)`,
          data: amountMismatches,
          type: "mismatched_records",
        });
      }

      // BIC Mismatches
      if (
        item.mismatched_bic_but_same_ref &&
        Array.isArray(item.mismatched_bic_but_same_ref) &&
        item.mismatched_bic_but_same_ref.length > 0
      ) {
        const bicMismatches = item.mismatched_bic_but_same_ref.map(
          (record) => ({
            ...record,
            key_ref:
              record.Reference || record.sender_ref || record.ref || "Unknown",
            mismatch_type: "BIC Mismatch",
            xmm_sent_bic: record.omh_sent_bic || "N/A",
            xmm_recv_bic: record.omh_recv_bic || "N/A",
            sam_correspondent: record.Correspondent || "N/A",
            sam_sender_receiver: record.Sender_Receiver || "N/A",
            xmm_value:
              record.omh_sent_bic && record.omh_recv_bic
                ? `${record.omh_sent_bic} -> ${record.omh_recv_bic}`
                : "N/A",
            sam_value:
              record.Correspondent && record.Sender_Receiver
                ? `${record.Correspondent} (${record.Sender_Receiver})`
                : "N/A",
            mismatch_details: `XMM recv BIC equals SAM Correspondent: ${
              record.XMM_recv_equals_SAM_Correspondent ? "Yes" : "No"
            }`,
          })
        );

        tables.push({
          title: `${formattedName} - BIC Mismatches (${bicMismatches.length} records)`,
          data: bicMismatches,
          type: "mismatched_records",
        });
      }

      // Extra Records in KTP (in ktp not in xmm)
      if (
        item.references_only_in_KTP &&
        Array.isArray(item.references_only_in_KTP) &&
        item.references_only_in_KTP.length > 0
      ) {
        tables.push({
          title: `Extra Records in KTP vs XMM (${item.references_only_in_KTP.length} records)`,
          data: item.references_only_in_KTP,
        });
      }

      // Extra Records in XMM ( in xmm not in ktp)
      if (
        item.references_only_in_XMM &&
        Array.isArray(item.references_only_in_XMM) &&
        item.references_only_in_XMM.length > 0
      ) {
        tables.push({
          title: `Extra Records in XMM vs KTP (${item.references_only_in_XMM.length} records)`,
          data: item.references_only_in_XMM,
        });
      }
      // Extra Records in XMM vs SAM ( in xmm not in sam)

      if (
        item.references_only_in_XMM_not_in_SAM &&
        Array.isArray(item.references_only_in_XMM_not_in_SAM) &&
        item.references_only_in_XMM_not_in_SAM.length > 0
      ) {
        tables.push({
          title: `Extra Records in XMM vs SAM (${item.references_only_in_XMM_not_in_SAM.length} records)`,
          data: item.references_only_in_XMM_not_in_SAM,
        });
      }

      // Extra Records in SAM
      if (
        item.references_only_in_SAM &&
        Array.isArray(item.references_only_in_SAM) &&
        item.references_only_in_SAM.length > 0
      ) {
        tables.push({
          title: `Extra Records in SAM vs XMM (${item.references_only_in_SAM.length} records)`,
          data: item.references_only_in_SAM,
        });
      }

      // Add missing records table
      const missingRecords = [];
      if (
        item.missing_records?.missing_in_xmm &&
        Array.isArray(item.missing_records.missing_in_xmm)
      ) {
        item.missing_records.missing_in_xmm.forEach((record) => {
          missingRecords.push({
            reference: record.ktp_sender_ref || record.xmm_ref || "N/A",
            missing_in: "XMM",
            details: record.details || "Record not found in XMM",
          });
        });
      }
      if (
        item.missing_records?.missing_in_ktp &&
        Array.isArray(item.missing_records.missing_in_ktp)
      ) {
        item.missing_records.missing_in_ktp.forEach((record) => {
          missingRecords.push({
            reference: record.xmm_ref || record.ktp_sender_ref || "N/A",
            missing_in: "KTP",
            details: record.details || "Record not found in KTP",
          });
        });
      }
      if (
        item.missing_records?.missing_in_sam &&
        Array.isArray(item.missing_records.missing_in_sam)
      ) {
        item.missing_records.missing_in_sam.forEach((record) => {
          missingRecords.push({
            reference: record.xmm_ref || record.sam_ref || "N/A",
            missing_in: "SAM",
            details: record.details || "Record not found in SAM",
          });
        });
      }

      if (missingRecords.length > 0) {
        tables.push({
          title: `${formattedName} - Missing Records`,
          data: missingRecords,
        });
      }
    });

    return tables;
  };

  // Dynamic analysis of API response - now helper functions are defined
  const computedAnalysis = useMemo(() => {
    console.log("Processing analysis data:", data);

    // Handle supporting_data structure (primary use case) - check both nested and direct structures
    const supportingData =
      data.response?.analysis_result?.supporting_data ||
      data.analysis_result?.supporting_data;
    const question =
      data.response?.question || data.question || "Data Analysis";
    const analysisText =
      data.response?.analysis_result?.analysis ||
      data.analysis_result?.analysis ||
      data.analysis;

    if (
      supportingData &&
      Array.isArray(supportingData) &&
      supportingData.length > 0
    ) {
      // Remove question marks and clean up the title
      const cleanTitle = question.replace(/\?+$/, "").trim();
      
      console.log(`✅ Supporting data found: ${supportingData.length} records`);
      console.log("📊 Creating tables array with data");

      return {
        type: "supporting_data",
        title: cleanTitle,
        totalRecords: supportingData.length,
        data: supportingData,
        analysis: analysisText,
        charts: generateChartsFromData(supportingData),
        stats: generateStatsFromData(supportingData),
        tables: [{ title: "Detailed Results", data: supportingData }],
      };
    }

    // Handle reconciliation data structure (secondary use case)
    const result = data.result || data.response?.result;

    if (result && typeof result === "object") {
      const charts = generateReconciliationCharts(result);
      const stats = generateReconciliationStats(result);
      const tables = generateReconciliationTables(result);

      return {
        type: "reconciliation",
        title: "Reconciliation Analysis",
        data: result,
        charts: charts,
        stats: stats,
        tables: tables,
      };
    }

    return null;
  }, [data]);

  // Use computed analysis
  const finalAnalysis = computedAnalysis;

  // Initialize chart types for new charts
  useEffect(() => {
    if (finalAnalysis && finalAnalysis.charts) {
      const newChartTypes = {};
      finalAnalysis.charts.forEach((chart, index) => {
        if (!chartTypes[index]) {
          newChartTypes[index] = chart.type || "donut";
        }
      });
      if (Object.keys(newChartTypes).length > 0) {
        setChartTypes((prev) => ({ ...prev, ...newChartTypes }));
      }
    }
    setHasAnimated(true);
  }, [finalAnalysis]);

  // Show skeleton while processing complex data - AFTER all hooks
  useEffect(() => {
    if (data) {
      setIsProcessing(true);
      // Simulate processing delay for smooth loading
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [data]);

  // Monitor when user manually expands charts
  useEffect(() => {
    const hasAnyExpanded = Object.values(expandedCharts).some(
      (isExpanded) => isExpanded
    );
    console.log("📊 Checking if user expanded charts:", {
      hasAnyExpanded,
      hasUserExpandedCharts,
      expandedCharts,
    });
    if (hasAnyExpanded && !hasUserExpandedCharts) {
      console.log("✅ Setting hasUserExpandedCharts to true");
      setHasUserExpandedCharts(true);
    }
  }, [expandedCharts, hasUserExpandedCharts]);

  // Auto-expand Visual Analytics when only Total Records card is present
  useEffect(() => {
    if (finalAnalysis?.stats && finalAnalysis?.charts?.length > 0) {
      const organizedStats = organizeStatistics(finalAnalysis.stats);
      if (organizedStats) {
        const topRowCount = [
          organizedStats.matches,
          organizedStats.critical,
        ].filter((stat) => stat?.stats?.length > 0).length;
        const bottomRowCount = [
          organizedStats.records,
          organizedStats.extras,
        ].filter((stat) => stat?.stats?.length > 0).length;

        // Auto-expand if only Total Records is present (bottomRowCount === 1 and topRowCount === 0)
        if (
          bottomRowCount === 1 &&
          topRowCount === 0 &&
          !visualAnalyticsExpanded
        ) {
          console.log(
            "🔓 Auto-expanding Visual Analytics (only Total Records present)"
          );
          setVisualAnalyticsExpanded(true);
        }
      }
    }
  }, [finalAnalysis, visualAnalyticsExpanded]);

  // Auto-expand chart when switching tabs (smart behavior based on previous interactions)
  useEffect(() => {
    console.log("🔄 Auto-expand effect triggered:", {
      hasCharts: !!finalAnalysis?.charts,
      visualAnalyticsExpanded,
      selectedChartTab,
      hasUserExpandedCharts,
      chartsLength: finalAnalysis?.charts?.length,
    });

    if (
      finalAnalysis?.charts &&
      visualAnalyticsExpanded &&
      selectedChartTab >= 0 &&
      hasUserExpandedCharts
    ) {
      // Use existing categorizeCharts function
      const chartCategories = categorizeCharts(finalAnalysis.charts);

      const tabCategories = ["reconciliation", "mismatch", "messageTypes"];
      const currentCategory = tabCategories[selectedChartTab];
      const currentTabCharts = chartCategories[currentCategory] || [];

      console.log("📋 Tab switching details:", {
        currentCategory,
        currentTabChartsLength: currentTabCharts.length,
        allCategories: Object.keys(chartCategories).map((key) => ({
          key,
          length: chartCategories[key].length,
        })),
      });

      // Determine which chart key to open: last opened in this tab, else the first chart in this tab
      if (currentTabCharts.length > 0) {
        const storedKey = lastExpandedChartKeyByTab[currentCategory];
        const fallbackKey = `${currentTabCharts[0].title}-0`;
        const chartKeyToOpen = storedKey || fallbackKey;
        console.log("🎯 Computed chartKeyToOpen:", {
          storedKey,
          fallbackKey,
          chartKeyToOpen,
        });

        setExpandedCharts((prev) => {
          if (!prev[chartKeyToOpen]) {
            console.log("🚀 Auto-expanding chart by key:", chartKeyToOpen);
            return {
              ...prev,
              [chartKeyToOpen]: true,
            };
          }
          console.log("⏭️ Chart already expanded for key:", chartKeyToOpen);
          return prev;
        });
      } else {
        console.log("❌ No charts in current tab category:", currentCategory);
      }
    } else {
      console.log("❌ Auto-expand conditions not met");
    }
  }, [
    selectedChartTab,
    visualAnalyticsExpanded,
    finalAnalysis?.charts,
    hasUserExpandedCharts,
    lastExpandedChartKeyByTab,
  ]);

  // Memoize chart rendering to prevent re-renders
  const memoizedChartContent = useMemo(() => {
    if (!finalAnalysis?.charts || finalAnalysis.charts.length === 0) {
      return null;
    }

    const chartCategories = categorizeCharts(finalAnalysis.charts);

    // Generate dynamic labels based on the data context
    const getTabLabel = (category, charts) => {
      if (!charts || charts.length === 0) return "";

      // For new category-based structure, use the category name directly
      if (
        category &&
        !["reconciliation", "mismatch", "messageTypes"].includes(category)
      ) {
        return category;
      }

      // Check if this is pipeline/regional data
      const hasRegionalData =
        Array.isArray(finalAnalysis.data) &&
        finalAnalysis.data?.some((item) =>
          Object.keys(item || {}).some(
            (key) =>
              key.toLowerCase().includes("region") ||
              key.toLowerCase().includes("pipeline")
          )
        );

      // Check if this is reconciliation data
      const isReconciliation =
        finalAnalysis.type === "reconciliation" ||
        charts.some(
          (chart) =>
            chart.title?.toLowerCase().includes("reconciliation") ||
            chart.title?.toLowerCase().includes("match")
        );

      if (hasRegionalData) {
        switch (category) {
          case "reconciliation":
            return "Data Overview";
          case "mismatch":
            return "Analysis Breakdown";
          case "messageTypes":
            return "Regional Distribution";
          default:
            return charts[0]?.title || "Data Analysis";
        }
      } else if (isReconciliation) {
        switch (category) {
          case "reconciliation":
            return "Reconciliation Overview";
          case "mismatch":
            return "Mismatch Analysis";
          case "messageTypes":
            return "Message Types";
          default:
            return charts[0]?.title || "Analysis";
        }
      } else {
        // Generic data analysis labels
        switch (category) {
          case "reconciliation":
            return "Data Overview";
          case "mismatch":
            return "Analysis Results";
          case "messageTypes":
            return "Data Distribution";
          default:
            return charts[0]?.title || "Data Analysis";
        }
      }
    };

    // Get icon for category
    const getCategoryIcon = (category) => {
      switch (category) {
        case "Actions":
          return <AssessmentIcon />;
        case "Counts":
          return <PieChartIcon />;
        case "Collections":
          return <TrendingUpIcon />;
        case "Onboarding":
          return <PieChartIcon />;
        case "Resources":
          return <AssessmentIcon />;
        case "reconciliation":
          return <AssessmentIcon />;
        case "mismatch":
          return <ErrorIcon />;
        case "messageTypes":
          return <PieChartIcon />;
        default:
          return <AssessmentIcon />;
      }
    };

    // Get color for category
    const getCategoryColor = (category) => {
      switch (category) {
        case "Actions":
          return theme.palette.primary.main;
        case "Counts":
          return theme.palette.info.main;
        case "Collections":
          return theme.palette.success.main;
        case "Onboarding":
          return theme.palette.secondary.main;
        case "Resources":
          return theme.palette.warning.main;
        case "reconciliation":
          return theme.palette.success.main;
        case "mismatch":
          return theme.palette.error.main;
        case "messageTypes":
          return theme.palette.info.main;
        default:
          return theme.palette.primary.main;
      }
    };

    // Dynamically create tabs based on available categories
    const tabData = Object.entries(chartCategories)
      .map(([category, charts]) => ({
        label: getTabLabel(category, charts),
        icon: getCategoryIcon(category),
        charts: charts || [],
        color: getCategoryColor(category),
        category,
      }))
      .filter((tab) => tab.charts.length > 0);

    return { chartCategories, tabData };
  }, [finalAnalysis?.charts, finalAnalysis?.data, finalAnalysis?.type, theme]);

  // Show skeleton while processing - AFTER all hooks are declared
  if (isProcessing) {
    return <AnalysisWidgetSkeleton />;
  }

  const handleSaveToLoginboard = () => {
    console.log("🔥 [WIDGET SAVE DEBUG] Save button clicked");
    console.log("🔥 [WIDGET SAVE DEBUG] finalAnalysis:", finalAnalysis);
    console.log("🔥 [WIDGET SAVE DEBUG] onSave function:", onSave);

    if (finalAnalysis && onSave) {
      const dashboardData = {
        id: Date.now().toString(), // Add unique ID
        type: "analysis_widget",
        title: finalAnalysis.title || title || "Untitled Analysis",
        analysis: finalAnalysis,
        data: data, // Include original data for Dashboard rendering
        timestamp: new Date().toISOString(),
        charts: finalAnalysis.charts,
        stats: finalAnalysis.stats,
        tables: finalAnalysis.tables,
        // Save expanded/collapsed states
        expandedStates: {
          visualAnalytics: visualAnalyticsExpanded,
          tabularResults: tabularResultsExpanded,
          expandedCharts: expandedCharts,
          expandedTables: expandedTables,
          selectedChartTab: selectedChartTab,
          selectedTableTab: selectedTableTab,
          lastExpandedChartKeyByTab: lastExpandedChartKeyByTab,
        },
      };

      console.log(
        "🔥 [WIDGET SAVE DEBUG] Calling onSave with dashboardData:",
        dashboardData
      );
      onSave(dashboardData);

      // Navigate to dashboard in new tab
      window.open("/dashboard", "_blank");
    } else {
      console.error("❌ [WIDGET SAVE ERROR] Missing finalAnalysis or onSave:", {
        hasFinalAnalysis: !!finalAnalysis,
        hasOnSave: !!onSave,
        finalAnalysis,
        onSave,
      });
      alert("Cannot save: Missing analysis data or save function");
    }
  };

  if (!finalAnalysis) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
        }}
      >
        <DataObjectIcon
          sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }}
        />
        <Typography variant="h6" color="text.secondary">
          No analysis data available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please ensure your query returns supporting_data or reconciliation
          results
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
        px: isMobile ? 1 : 2,
      }}
    >
      {/* Header with Save Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          mb: isMobile ? 3 : 4,
          gap: isMobile ? 1.5 : 2,
          px: isMobile ? 1 : 0,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 700,
            fontSize: isMobile ? "1.5rem" : isTablet ? "2rem" : "2.125rem",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: `${slideIn} 0.8s ease-out`,
            flex: 1,
            minWidth: 0,
            textAlign: isMobile ? "center" : "left",
            color: "#37527e",
          }}
        >
          MiFiX.ai
        </Typography>
        <Button
          variant="contained"
          startIcon={!isMobile ? <SaveIcon /> : null}
          onClick={handleSaveToLoginboard}
          size={isMobile ? "small" : "medium"}
          sx={{
            borderRadius: isMobile ? 2 : 3,
            px: isMobile ? 2 : 3,
            py: isMobile ? 1 : 1.5,
            fontSize: isMobile ? "0.75rem" : "0.875rem",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: `0 12px 40px ${theme.palette.primary.main}60`,
            },
            transition: "all 0.2s ease",
            animation: `${float} 2s ease-in-out infinite`,
            minWidth: isMobile ? "100px" : "auto",
            mt: isMobile ? 4 : 2,
          }}
        >
          {isMobile ? "Save" : "Save to Dashboard"}
        </Button>
      </Box>

      {/* Overall Statistics Section */}
      <Fade in={currentSection >= 0} timeout={800}>
        <Box sx={{ mb: 2 }}>
          {/* <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              mb: isMobile ? 3 : 4,
              fontSize: isMobile ? "1.5rem" : "2.125rem",
              fontWeight: 700,
              color: theme.palette.text.primary,
              animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
              textAlign: "left",
            }}
          >
            Overall Summary
          </Typography> */}

          <Box
            sx={{
              width: "100%", // Use full container width
              maxWidth: "1400px", // Increased max width for better use of space
              margin: "0 auto", // Center the container
              padding: { xs: "0 12px", sm: "0 16px", md: "0 24px" }, // Increased padding for better spacing
            }}
          >
            {/* Organized Statistics Categories */}
            {(() => {
              const organizedStats = organizeStatistics(finalAnalysis.stats);
              if (!organizedStats) return null;

              // Note: Using direct component rendering instead of category mapping

              // Count visible cards for layout decisions
              const topRowCount = [
                organizedStats.matches,
                organizedStats.critical,
              ].filter((stat) => stat?.stats?.length > 0).length;
              const bottomRowCount = [
                organizedStats.records,
                organizedStats.extras,
              ].filter((stat) => stat?.stats?.length > 0).length;

              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 3, sm: 5 },
                    mb: 4,
                  }}
                >
                  {/* Top Row - Independent Statistics Cards */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: topRowCount === 1 ? "1fr" : "repeat(2, 1fr)",
                        md: topRowCount === 1 ? "1fr" : "repeat(2, 1fr)",
                      },
                      gap: { xs: 2, sm: 4, md: 6 },
                      justifyItems: topRowCount === 1 ? "center" : "stretch",
                      maxWidth: topRowCount === 1 ? "500px" : "100%",
                      margin: topRowCount === 1 ? "0 auto" : "0",
                    }}
                  >
                    {/* Successful Matches - Independent Component */}
                    {organizedStats.matches?.stats?.length > 0 && (
                      <StatisticsCard
                        category="matches"
                        stats={organizedStats.matches.stats}
                        title={organizedStats.matches.title}
                        icon={organizedStats.matches.icon}
                        color={organizedStats.matches.color}
                        totalValue={organizedStats.matches.totalValue}
                        isPrimary={organizedStats.matches.priority === "high"}
                      />
                    )}

                    {/* Attention Points - Independent Component */}
                    {organizedStats.critical?.stats?.length > 0 && (
                      <StatisticsCard
                        category="critical"
                        stats={organizedStats.critical.stats}
                        title={organizedStats.critical.title}
                        icon={organizedStats.critical.icon}
                        color={organizedStats.critical.color}
                        totalValue={organizedStats.critical.totalValue}
                        isPrimary={organizedStats.critical.priority === "high"}
                      />
                    )}
                  </Box>

                  {/* Bottom Row - Independent Statistics Cards */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: bottomRowCount === 1 ? "1fr" : "repeat(2, 1fr)",
                        md: bottomRowCount === 1 ? "1fr" : "repeat(2, 1fr)",
                      },
                      gap: { xs: 2, sm: 4, md: 6 },
                      justifyItems: bottomRowCount === 1 ? "center" : "stretch",
                      maxWidth: bottomRowCount === 1 ? "500px" : "100%",
                      margin: bottomRowCount === 1 ? "0 auto" : "0",
                    }}
                  >
                    {/* Total Records - Independent Component */}
                    {organizedStats.records?.stats?.length > 0 && (
                      <StatisticsCard
                        category="records"
                        stats={organizedStats.records.stats}
                        title={organizedStats.records.title}
                        icon={organizedStats.records.icon}
                        color={organizedStats.records.color}
                        totalValue={organizedStats.records.totalValue}
                        isPrimary={organizedStats.records.priority === "high"}
                      />
                    )}

                    {/* Extra Records - Independent Component */}
                    {organizedStats.extras?.stats?.length > 0 && (
                      <StatisticsCard
                        category="extras"
                        stats={organizedStats.extras.stats}
                        title={organizedStats.extras.title}
                        icon={organizedStats.extras.icon}
                        color={organizedStats.extras.color}
                        totalValue={organizedStats.extras.totalValue}
                        isPrimary={organizedStats.extras.priority === "high"}
                      />
                    )}
                  </Box>
                </Box>
              );
            })()}
          </Box>
        </Box>
      </Fade>

      {/* Analysis Insights Section */}
      {/* {finalAnalysis.analysis && finalAnalysis.analysis.length > 0 && (
        <Fade in={currentSection >= 1} timeout={800}>
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 3, 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                animation: `${fadeInUp} 0.6s ease-out 0.3s both`,
                textAlign: 'center'
              }}
            >
              Analysis Insights
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} lg={10}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  animation: `${slideIn} 0.6s ease-out 0.4s both`
                }}>
                  {finalAnalysis.analysis.map((insight, index) => {
                    // Clean up the insight text - remove JSON formatting and quotes
                    let cleanInsight = insight;
                    if (typeof insight === 'string') {
                      cleanInsight = insight
                        .replace(/^```json$/, '')
                        .replace(/^"/, '')
                        .replace(/",?$/, '')
                        .replace(/\\"/g, '"')
                        .trim();
                    }
                    
                    // Skip empty or JSON-only lines
                    if (!cleanInsight || cleanInsight === '```json' || cleanInsight === '```') {
                      return null;
                    }
                    
                    return (
                      <Box key={index} sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          mt: 1,
                          flexShrink: 0
                        }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.palette.text.primary,
                            lineHeight: 1.6,
                            fontSize: '1rem',
                            fontWeight: 400
                          }}
                        >
                          {cleanInsight}
                        </Typography>
                      </Box>
                    );
                  })}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )} */}

      {/* Enhanced Tabular Results Section with Collapsible Tabs */}
      {finalAnalysis.tables && finalAnalysis.tables.length > 0 && (
        <Fade in={currentSection >= 2 || (finalAnalysis.tables[0]?.data?.length > 1000)} timeout={800}>
          <Box sx={{ mb: 5 }}>
            {console.log("🔍 Rendering Tabular Results:", finalAnalysis.tables.length, "tables", finalAnalysis.tables[0]?.data?.length, "records")}
            {/* Collapsible Section Header */}
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                mb: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box
                onClick={() =>
                  setTabularResultsExpanded(!tabularResultsExpanded)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 3,
                  cursor: "pointer",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.info.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.info.main,
                      0.08
                    )} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 32px ${alpha(
                        theme.palette.info.main,
                        0.3
                      )}`,
                    }}
                  >
                    <DataObjectIcon sx={{ color: "white", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      Tabular Results
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Detailed data tables organized by categories with download
                      options
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  sx={{
                    color: theme.palette.info.main,
                    transform: tabularResultsExpanded
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              <Collapse in={tabularResultsExpanded} timeout={300}>
                {/* Tabbed Table Interface */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  }}
                >
                  {(() => {
                    const tableCategories = categorizeTables(
                      finalAnalysis.tables
                    );

                    // Generate dynamic table labels based on the data context
                    const getTableLabel = (category, tables) => {
                      if (tables.length === 0) return "";

                      // Check if this is pipeline/regional data
                      const hasRegionalData =
                        Array.isArray(finalAnalysis.data) &&
                        finalAnalysis.data?.some((item) =>
                          Object.keys(item || {}).some(
                            (key) =>
                              key.toLowerCase().includes("region") ||
                              key.toLowerCase().includes("pipeline")
                          )
                        );

                      // Check if this is reconciliation data
                      const isReconciliation =
                        finalAnalysis.type === "reconciliation" ||
                        tables.some(
                          (table) =>
                            table.title
                              ?.toLowerCase()
                              .includes("reconciliation") ||
                            table.title?.toLowerCase().includes("match")
                        );

                      if (hasRegionalData) {
                        switch (category) {
                          case "referenceMatches":
                            return "Pipeline Report";
                          case "fullyMatched":
                            return "Complete Data Report";
                          case "mismatches":
                            return "Analysis Breakdown";
                          case "extraRecords":
                            return "Additional Data";
                          default:
                            return tables[0]?.title || "Data Report";
                        }
                      } else if (isReconciliation) {
                        switch (category) {
                          case "referenceMatches":
                            return "Reference ID Matches Report";
                          case "fullyMatched":
                            return "Fully Matched Report";
                          case "mismatches":
                            return "Mismatches Report";
                          case "extraRecords":
                            return "Extra Records Report";
                          default:
                            return tables[0]?.title || "Analysis Report";
                        }
                      } else {
                        // Generic data analysis labels
                        switch (category) {
                          case "referenceMatches":
                            return "Detailed Results";
                          case "fullyMatched":
                            return "Complete Data";
                          case "mismatches":
                            return "Analysis Results";
                          case "extraRecords":
                            return "Additional Data";
                          default:
                            return tables[0]?.title || "Data Report";
                        }
                      }
                    };

                    const getTableDescription = (category, tables) => {
                      if (tables.length === 0) return "";

                      // Check if this is pipeline/regional data
                      const hasRegionalData =
                        Array.isArray(finalAnalysis.data) &&
                        finalAnalysis.data?.some((item) =>
                          Object.keys(item || {}).some(
                            (key) =>
                              key.toLowerCase().includes("region") ||
                              key.toLowerCase().includes("pipeline")
                          )
                        );

                      if (hasRegionalData) {
                        switch (category) {
                          case "referenceMatches":
                            return "Pipeline data by regions";
                          case "fullyMatched":
                            return "Complete regional pipeline data";
                          case "mismatches":
                            return "Detailed regional analysis breakdown";
                          case "extraRecords":
                            return "Additional regional data points";
                          default:
                            return "Data analysis results";
                        }
                      } else {
                        switch (category) {
                          case "referenceMatches":
                            return "Tables showing reference ID matches";
                          case "fullyMatched":
                            return "Tables with complete matches";
                          case "mismatches":
                            return "Tables showing various types of mismatches";
                          case "extraRecords":
                            return "Tables with additional or unmatched records";
                          default:
                            return "Analysis results";
                        }
                      }
                    };

                    const tabData = [
                      {
                        label: getTableLabel(
                          "referenceMatches",
                          tableCategories.referenceMatches
                        ),
                        icon: <CheckCircleIcon />,
                        tables: tableCategories.referenceMatches,
                        color: theme.palette.success.main,
                        description: getTableDescription(
                          "referenceMatches",
                          tableCategories.referenceMatches
                        ),
                      },
                      {
                        label: getTableLabel(
                          "fullyMatched",
                          tableCategories.fullyMatched
                        ),
                        icon: <DoneAllIcon />,
                        tables: tableCategories.fullyMatched,
                        color: theme.palette.info.main,
                        description: getTableDescription(
                          "fullyMatched",
                          tableCategories.fullyMatched
                        ),
                      },
                      {
                        label: getTableLabel("mismatches", [
                          ...tableCategories.mismatches.messageType,
                          ...tableCategories.mismatches.amount,
                          ...tableCategories.mismatches.bic,
                        ]),
                        icon: <ErrorIcon />,
                        tables: [
                          ...tableCategories.mismatches.messageType,
                          ...tableCategories.mismatches.amount,
                          ...tableCategories.mismatches.bic,
                        ],
                        color: theme.palette.error.main,
                        description: getTableDescription("mismatches", [
                          ...tableCategories.mismatches.messageType,
                          ...tableCategories.mismatches.amount,
                          ...tableCategories.mismatches.bic,
                        ]),
                      },
                      {
                        label: getTableLabel(
                          "extraRecords",
                          tableCategories.extraRecords
                        ),
                        icon: <WarningIcon />,
                        tables: tableCategories.extraRecords,
                        color: theme.palette.warning.main,
                        description: getTableDescription(
                          "extraRecords",
                          tableCategories.extraRecords
                        ),
                      },
                    ].filter((tab) => tab.tables.length > 0);

                    return (
                      <>
                        {/* Tab Headers */}
                        <Box
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(
                              theme.palette.info.main,
                              0.08
                            )} 0%, ${alpha(
                              theme.palette.success.main,
                              0.08
                            )} 100%)`,
                            borderBottom: `1px solid ${alpha(
                              theme.palette.divider,
                              0.1
                            )}`,
                          }}
                        >
                          <Tabs
                            value={selectedTableTab}
                            onChange={(event, newValue) =>
                              setSelectedTableTab(newValue)
                            }
                            variant={isMobile ? "scrollable" : "fullWidth"}
                            scrollButtons="auto"
                            sx={{
                              "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: "3px 3px 0 0",
                                background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                              },
                              "& .MuiTab-root": {
                                minHeight: 72,
                                textTransform: "none",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: theme.palette.text.secondary,
                                "&.Mui-selected": {
                                  color: theme.palette.info.main,
                                  fontWeight: 700,
                                },
                                "&:hover": {
                                  color: theme.palette.info.main,
                                  backgroundColor: alpha(
                                    theme.palette.info.main,
                                    0.04
                                  ),
                                },
                              },
                            }}
                          >
                            {tabData.map((tab, index) => (
                              <Tab
                                key={index}
                                icon={tab.icon}
                                label={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: "inherit" }}
                                    >
                                      {tab.label}
                                    </Typography>
                                    <Box
                                      sx={{
                                        backgroundColor: alpha(tab.color, 0.1),
                                        color: tab.color,
                                        borderRadius: "12px",
                                        px: 1,
                                        py: 0.25,
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        minWidth: "20px",
                                        textAlign: "center",
                                      }}
                                    >
                                      {tab.tables.length}
                                    </Box>
                                  </Box>
                                }
                                iconPosition="start"
                                sx={{
                                  "& .MuiTab-iconWrapper": {
                                    color: "inherit",
                                  },
                                }}
                              />
                            ))}
                          </Tabs>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ p: { xs: 2, md: 4 } }}>
                          {tabData[selectedTableTab] && (
                            <Box>
                              {/* Category Header with Download All */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 3,
                                  p: 2,
                                  background: `linear-gradient(135deg, ${alpha(
                                    tabData[selectedTableTab].color,
                                    0.05
                                  )} 0%, ${alpha(
                                    tabData[selectedTableTab].color,
                                    0.08
                                  )} 100%)`,
                                  borderRadius: 2,
                                  border: `1px solid ${alpha(
                                    tabData[selectedTableTab].color,
                                    0.1
                                  )}`,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      color: theme.palette.text.primary,
                                      mb: 0.5,
                                    }}
                                  >
                                    {tabData[selectedTableTab].label}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                    }}
                                  >
                                    {tabData[selectedTableTab].description}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  {/* Show audit report button only for mismatches tab */}
                                  {/* {tabData[selectedTableTab].label.toLowerCase().includes("mismatch") && (
                                    
                                    
                                  )} */}
                                  <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={() =>
                                      handleCategoryDownload(
                                        tabData[selectedTableTab].label
                                          .replace(/\s+/g, "_")
                                          .toLowerCase(),
                                        tabData[selectedTableTab].tables
                                      )
                                    }
                                    sx={{
                                      backgroundColor:
                                        tabData[selectedTableTab].color,
                                      "&:hover": {
                                        backgroundColor:
                                          tabData[selectedTableTab].color,
                                        filter: "brightness(0.9)",
                                      },
                                    }}
                                  >
                                    Download Report
                                  </Button>
                                </Box>
                              </Box>

                              {/* Tables List */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 3,
                                }}
                              >
                                {tabData[selectedTableTab].tables.map(
                                  (table, tableIndex) => {
                                    const tableKey = `${table.title}-${tableIndex}`;
                                    const isTableExpanded =
                                      expandedTables[tableKey] || false; // Default to collapsed

                                    return (
                                      <Paper
                                        key={tableIndex}
                                        elevation={1}
                                        sx={{
                                          borderRadius: 2,
                                          overflow: "hidden",
                                          border: `1px solid ${alpha(
                                            theme.palette.divider,
                                            0.1
                                          )}`,
                                          "&:hover": {
                                            boxShadow: `0 4px 20px ${alpha(
                                              theme.palette.primary.main,
                                              0.1
                                            )}`,
                                          },
                                          transition: "all 0.2s ease",
                                        }}
                                        ref={(el) => {
                                          if (el) {
                                            tableRefs.current[table.title] = el;
                                          }
                                        }}
                                      >
                                        {/* Table Header - Collapsible */}
                                        <Box
                                          onClick={() =>
                                            handleTableExpansion(tableKey)
                                          }
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 2,
                                            cursor: "pointer",
                                            background: `linear-gradient(135deg, ${alpha(
                                              tabData[selectedTableTab].color,
                                              0.03
                                            )} 0%, ${alpha(
                                              tabData[selectedTableTab].color,
                                              0.05
                                            )} 100%)`,
                                            borderBottom: isTableExpanded
                                              ? `1px solid ${alpha(
                                                  theme.palette.divider,
                                                  0.08
                                                )}`
                                              : "none",
                                            "&:hover": {
                                              background: `linear-gradient(135deg, ${alpha(
                                                tabData[selectedTableTab].color,
                                                0.08
                                              )} 0%, ${alpha(
                                                tabData[selectedTableTab].color,
                                                0.1
                                              )} 100%)`,
                                            },
                                            transition: "all 0.2s ease",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 2,
                                            }}
                                          >
                                            <Typography
                                              variant="h6"
                                              sx={{
                                                fontWeight: 600,
                                                color:
                                                  theme.palette.text.primary,
                                                fontSize: "1.1rem",
                                              }}
                                            >
                                              {table.title}
                                            </Typography>
                                            {table.data && (
                                              <Box
                                                sx={{
                                                  backgroundColor: alpha(
                                                    tabData[selectedTableTab]
                                                      .color,
                                                    0.1
                                                  ),
                                                  color:
                                                    tabData[selectedTableTab]
                                                      .color,
                                                  borderRadius: "12px",
                                                  px: 1.5,
                                                  py: 0.25,
                                                  fontSize: "0.75rem",
                                                  fontWeight: 600,
                                                }}
                                              >
                                                {table.data.length} records
                                              </Box>
                                            )}
                                          </Box>

                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            {/* Show audit report button only for mismatch tables */}
                                            {table.title
                                              .toLowerCase()
                                              .includes("mismatch") && (
                                              <Tooltip
                                                title="Generate Audit Report"
                                                arrow
                                              >
                                                <IconButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAuditReport(
                                                      table.title,
                                                      table.data
                                                    );
                                                  }}
                                                  size="small"
                                                  sx={{
                                                    backgroundColor: alpha(
                                                      theme.palette.info.main,
                                                      0.08
                                                    ),
                                                    color:
                                                      theme.palette.info.main,
                                                    width: 32,
                                                    height: 32,
                                                    "&:hover": {
                                                      backgroundColor: alpha(
                                                        theme.palette.info.main,
                                                        0.15
                                                      ),
                                                      transform: "scale(1.05)",
                                                    },
                                                    transition: "all 0.2s ease",
                                                  }}
                                                >
                                                  <AssignmentIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            )}
                                            <Tooltip
                                              title="Download Table"
                                              arrow
                                            >
                                              <IconButton
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownloadTable(
                                                    table.title,
                                                    table.data
                                                  );
                                                }}
                                                size="small"
                                                sx={{
                                                  backgroundColor: alpha(
                                                    theme.palette.success.main,
                                                    0.08
                                                  ),
                                                  color:
                                                    theme.palette.success.main,
                                                  width: 32,
                                                  height: 32,
                                                  "&:hover": {
                                                    backgroundColor: alpha(
                                                      theme.palette.success
                                                        .main,
                                                      0.15
                                                    ),
                                                    transform: "scale(1.05)",
                                                  },
                                                  transition: "all 0.2s ease",
                                                }}
                                              >
                                                <DownloadIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <IconButton
                                              sx={{
                                                color:
                                                  theme.palette.text.secondary,
                                                transform: isTableExpanded
                                                  ? "rotate(180deg)"
                                                  : "rotate(0deg)",
                                                transition:
                                                  "transform 0.3s ease",
                                              }}
                                            >
                                              <ExpandMoreIcon />
                                            </IconButton>
                                          </Box>
                                        </Box>

                                        {/* Collapsible Table Content */}
                                        <Collapse
                                          in={isTableExpanded}
                                          timeout={300}
                                        >
                                          <EnhancedDataGrid
                                            data={table.data}
                                            title={table.title}
                                            height={isMobile ? 500 : 700}
                                            pageSize={isMobile ? 15 : 50}
                                            index={
                                              table.originalIndex || tableIndex
                                            }
                                            exportFileName={`${finalAnalysis.title}_${table.title}`}
                                            hideHeader={true}
                                            onRefresh={
                                              table.title
                                                .toLowerCase()
                                                .includes("mismatch")
                                                ? () => window.location.reload()
                                                : undefined
                                            }
                                            type={
                                              table.title
                                                .toLowerCase()
                                                .includes("mismatch")
                                                ? "mismatched_records"
                                                : null
                                            }
                                            onReviewClick={
                                              table.title
                                                .toLowerCase()
                                                .includes("mismatch")
                                                ? handleOpenReview
                                                : null
                                            }
                                          />
                                        </Collapse>
                                      </Paper>
                                    );
                                  }
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </>
                    );
                  })()}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        </Fade>
      )}
      {/* Enhanced Visual Analytics Section with Collapsible Tabs */}
      {finalAnalysis.charts && finalAnalysis.charts.length > 0 && (
        <Fade in={currentSection >= 1} timeout={800}>
          <Box sx={{ mb: 5 }}>
            {/* Collapsible Section Header */}
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                mb: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box
                onClick={() =>
                  setVisualAnalyticsExpanded(!visualAnalyticsExpanded)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 3,
                  cursor: "pointer",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.08
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 32px ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                    }}
                  >
                    <AnalyticsIcon sx={{ color: "white", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      Visual Analytics
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Interactive charts and visualizations for comprehensive
                      data analysis
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  sx={{
                    color: theme.palette.primary.main,
                    transform: visualAnalyticsExpanded
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              <Collapse in={visualAnalyticsExpanded} timeout={300}>
                {/* Tabbed Chart Interface */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  }}
                >
                  {(() => {
                    if (!memoizedChartContent) return null;

                    const { tabData } = memoizedChartContent;

                    return (
                      <>
                        {/* Tab Headers */}
                        <Box
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(
                              theme.palette.primary.main,
                              0.08
                            )} 0%, ${alpha(
                              theme.palette.secondary.main,
                              0.08
                            )} 100%)`,
                            borderBottom: `1px solid ${alpha(
                              theme.palette.divider,
                              0.1
                            )}`,
                          }}
                        >
                          <Tabs
                            value={selectedChartTab}
                            onChange={(event, newValue) => {
                              setSelectedChartTab(newValue);
                              // Proactively auto-expand when switching tabs
                              if (visualAnalyticsExpanded) {
                                const nextTab = newValue;
                                const tabCategories = [
                                  "reconciliation",
                                  "mismatch",
                                  "messageTypes",
                                ];
                                const currentCategory = tabCategories[nextTab];
                                const chartsInTab =
                                  tabData[nextTab]?.charts || [];
                                if (chartsInTab.length > 0) {
                                  const storedKey =
                                    lastExpandedChartKeyByTab[currentCategory];
                                  const fallbackKey = `${chartsInTab[0].title}-0`;
                                  const chartKeyToOpen =
                                    storedKey || fallbackKey;
                                  setExpandedCharts((prev) => ({
                                    ...prev,
                                    [chartKeyToOpen]: true,
                                  }));
                                  // Mark user intent so effect continues to work
                                  if (!hasUserExpandedCharts)
                                    setHasUserExpandedCharts(true);
                                }
                              }
                            }}
                            variant={isMobile ? "scrollable" : "fullWidth"}
                            scrollButtons="auto"
                            sx={{
                              "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: "3px 3px 0 0",
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              },
                              "& .MuiTab-root": {
                                minHeight: 72,
                                textTransform: "none",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: theme.palette.text.secondary,
                                "&.Mui-selected": {
                                  color: theme.palette.primary.main,
                                  fontWeight: 700,
                                },
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.04
                                  ),
                                },
                              },
                            }}
                          >
                            {tabData.map((tab, index) => (
                              <Tab
                                key={index}
                                icon={tab.icon}
                                label={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: "inherit" }}
                                    >
                                      {tab.label}
                                    </Typography>
                                    <Box
                                      sx={{
                                        backgroundColor: alpha(tab.color, 0.1),
                                        color: tab.color,
                                        borderRadius: "12px",
                                        px: 1,
                                        py: 0.25,
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        minWidth: "20px",
                                        textAlign: "center",
                                      }}
                                    >
                                      {tab.charts.length}
                                    </Box>
                                  </Box>
                                }
                                iconPosition="start"
                              />
                            ))}
                          </Tabs>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ p: { xs: 2, md: 4 } }}>
                          {tabData[selectedChartTab] && (
                            <Box>
                              {/* Charts Grid - Individual Collapsible Charts */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 3,
                                }}
                              >
                                {tabData[selectedChartTab].charts.map(
                                  (chart, chartIndex) => {
                                    const chartKey = `${chart.title}-${chartIndex}`;
                                    const isExpanded =
                                      expandedCharts[chartKey] || false; // Default to collapsed

                                    return (
                                      <Paper
                                        key={chartIndex}
                                        elevation={2}
                                        sx={{
                                          borderRadius: 3,
                                          overflow: "hidden",
                                          background:
                                            "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
                                          border: `1px solid ${alpha(
                                            theme.palette.divider,
                                            0.1
                                          )}`,
                                          transition:
                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        }}
                                      >
                                        {/* Individual Chart Header - Collapsible */}
                                        <Box
                                          onClick={() =>
                                            handleChartExpansion(chartKey)
                                          }
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 2,
                                            cursor: "pointer",
                                            background: `linear-gradient(135deg, ${alpha(
                                              tabData[selectedChartTab].color,
                                              0.06
                                            )} 0%, ${alpha(
                                              tabData[selectedChartTab].color,
                                              0.08
                                            )} 100%)`,
                                            borderBottom: `1px solid ${alpha(
                                              theme.palette.divider,
                                              0.08
                                            )}`,
                                            "&:hover": {
                                              background: `linear-gradient(135deg, ${alpha(
                                                tabData[selectedChartTab].color,
                                                0.1
                                              )} 0%, ${alpha(
                                                tabData[selectedChartTab].color,
                                                0.12
                                              )} 100%)`,
                                            },
                                            transition: "all 0.2s ease",
                                          }}
                                        >
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              fontWeight: 600,
                                              color: theme.palette.text.primary,
                                              fontSize: "1.1rem",
                                            }}
                                          >
                                            {chart.title}
                                          </Typography>

                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <Tooltip
                                              title="Download Chart"
                                              arrow
                                            >
                                              <IconButton
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownloadChart(
                                                    chart.title,
                                                    chart.originalIndex
                                                  );
                                                }}
                                                size="small"
                                                sx={{
                                                  backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08
                                                  ),
                                                  color:
                                                    theme.palette.primary.main,
                                                  width: 36,
                                                  height: 36,
                                                  "&:hover": {
                                                    backgroundColor: alpha(
                                                      theme.palette.primary
                                                        .main,
                                                      0.15
                                                    ),
                                                    transform: "scale(1.08)",
                                                  },
                                                  transition:
                                                    "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                  boxShadow: `0 2px 8px ${alpha(
                                                    theme.palette.primary.main,
                                                    0.15
                                                  )}`,
                                                }}
                                              >
                                                <GetAppIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <IconButton
                                              sx={{
                                                color:
                                                  theme.palette.text.secondary,
                                                transform: isExpanded
                                                  ? "rotate(180deg)"
                                                  : "rotate(0deg)",
                                                transition:
                                                  "transform 0.3s ease",
                                              }}
                                            >
                                              <ExpandMoreIcon />
                                            </IconButton>
                                          </Box>
                                        </Box>

                                        {/* Collapsible Chart Content */}
                                        <Collapse in={isExpanded} timeout={300}>
                                          {/* Chart Content with Legend and Controls */}
                                          <Box
                                            sx={{
                                              height: {
                                                xs: "500px",
                                                md: "650px",
                                              },
                                              display: "flex",
                                              background:
                                                "linear-gradient(145deg, #fafafa 0%, #ffffff 100%)",
                                            }}
                                          >
                                            {/* Left Panel - Legend and Info */}
                                            <Box
                                              sx={{
                                                width: { xs: "35%", md: "30%" },
                                                p: { xs: 1.5, md: 2 },
                                                borderRight: `1px solid ${alpha(
                                                  theme.palette.divider,
                                                  0.1
                                                )}`,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 2,
                                              }}
                                            >
                                              {/* Chart Type Controls */}
                                              <Box>
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontWeight: 600,
                                                    color:
                                                      theme.palette.text
                                                        .secondary,
                                                    mb: 1,
                                                    fontSize: "1rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px",
                                                  }}
                                                >
                                                  Chart Type
                                                </Typography>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 3,
                                                  }}
                                                >
                                                  {[
                                                    {
                                                      key: "bar",
                                                      icon: BarChartIcon,
                                                      label: "Bar",
                                                    },
                                                    {
                                                      key: "pie",
                                                      icon: PieChartIcon,
                                                      label: "Pie",
                                                    },
                                                    {
                                                      key: "donut",
                                                      icon: PieChartIcon,
                                                      label: "Donut",
                                                    },
                                                    {
                                                      key: "line",
                                                      icon: ShowChartIcon,
                                                      label: "Line",
                                                    },
                                                  ].map((chartType) => {
                                                    const IconComponent =
                                                      chartType.icon;
                                                    const currentType =
                                                      getCurrentChartType(
                                                        chart.originalIndex,
                                                        chart.type
                                                      );
                                                    const isSelected =
                                                      currentType ===
                                                      chartType.key;

                                                    return (
                                                      <Tooltip
                                                        key={chartType.key}
                                                        title={chartType.label}
                                                        arrow
                                                      >
                                                        <IconButton
                                                          onClick={() =>
                                                            handleChartTypeChange(
                                                              chart.originalIndex,
                                                              chartType.key
                                                            )
                                                          }
                                                          size="medium"
                                                          sx={{
                                                            width: 40,
                                                            height: 40,
                                                            backgroundColor:
                                                              isSelected
                                                                ? alpha(
                                                                    theme
                                                                      .palette
                                                                      .primary
                                                                      .main,
                                                                    0.15
                                                                  )
                                                                : alpha(
                                                                    theme
                                                                      .palette
                                                                      .primary
                                                                      .main,
                                                                    0.08
                                                                  ),
                                                            color: isSelected
                                                              ? theme.palette
                                                                  .primary.main
                                                              : theme.palette
                                                                  .text
                                                                  .secondary,
                                                            border: isSelected
                                                              ? `2px solid ${theme.palette.primary.main}`
                                                              : `1px solid ${alpha(
                                                                  theme.palette
                                                                    .divider,
                                                                  0.2
                                                                )}`,
                                                            "&:hover": {
                                                              backgroundColor:
                                                                alpha(
                                                                  theme.palette
                                                                    .primary
                                                                    .main,
                                                                  0.2
                                                                ),
                                                              color:
                                                                theme.palette
                                                                  .primary.main,
                                                              transform:
                                                                "scale(1.08)",
                                                              boxShadow: `0 4px 12px ${alpha(
                                                                theme.palette
                                                                  .primary.main,
                                                                0.25
                                                              )}`,
                                                            },
                                                            transition:
                                                              "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                          }}
                                                        >
                                                          <IconComponent
                                                            sx={{
                                                              fontSize: 18,
                                                            }}
                                                          />
                                                        </IconButton>
                                                      </Tooltip>
                                                    );
                                                  })}
                                                </Box>
                                              </Box>

                                              {/* Legend */}
                                              <Box sx={{ flex: 1 }}>
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontWeight: 600,
                                                    color:
                                                      theme.palette.text
                                                        .secondary,
                                                    mb: 1.5,
                                                    fontSize: "0.75rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px",
                                                  }}
                                                >
                                                  Legend
                                                </Typography>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 3,
                                                  }}
                                                >
                                                  {chart.data?.map(
                                                    (item, index) => (
                                                      <Box
                                                        key={index}
                                                        sx={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          gap: 1.5,
                                                          p: 1,
                                                          borderRadius: 1,
                                                          backgroundColor:
                                                            alpha(
                                                              item.color ||
                                                                theme.palette
                                                                  .primary.main,
                                                              0.05
                                                            ),
                                                          border: `1px solid ${alpha(
                                                            item.color ||
                                                              theme.palette
                                                                .primary.main,
                                                            0.1
                                                          )}`,
                                                          transition:
                                                            "all 0.2s ease",
                                                          "&:hover": {
                                                            backgroundColor:
                                                              alpha(
                                                                item.color ||
                                                                  theme.palette
                                                                    .primary
                                                                    .main,
                                                                0.1
                                                              ),
                                                            transform:
                                                              "translateX(2px)",
                                                          },
                                                        }}
                                                      >
                                                        <Box
                                                          sx={{
                                                            width: 15,
                                                            height: 15,
                                                            borderRadius: "50%",
                                                            backgroundColor:
                                                              item.color ||
                                                              theme.palette
                                                                .primary.main,
                                                            flexShrink: 0,
                                                          }}
                                                        />
                                                        <Box
                                                          sx={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                          }}
                                                        >
                                                          <Typography
                                                            variant="body2"
                                                            sx={{
                                                              fontWeight: 500,
                                                              color:
                                                                theme.palette
                                                                  .text.primary,
                                                              fontSize: "1rem",
                                                              lineHeight: 1.2,
                                                              overflow:
                                                                "hidden",
                                                              textOverflow:
                                                                "ellipsis",
                                                              whiteSpace:
                                                                "nowrap",
                                                            }}
                                                          >
                                                            {item.name}
                                                          </Typography>
                                                          <Typography
                                                            variant="caption"
                                                            sx={{
                                                              color:
                                                                theme.palette
                                                                  .text
                                                                  .secondary,
                                                              fontSize:
                                                                "0.7rem",
                                                              fontWeight: 600,
                                                            }}
                                                          >
                                                            {typeof item.value ===
                                                            "number"
                                                              ? item.value.toLocaleString()
                                                              : item.value}
                                                          </Typography>
                                                        </Box>
                                                      </Box>
                                                    )
                                                  ) || []}
                                                </Box>
                                              </Box>
                                            </Box>

                                            {/* Right Panel - Chart */}
                                            <Box
                                              ref={(el) => {
                                                if (el) {
                                                  chartRefs.current[
                                                    chart.originalIndex
                                                  ] = el;
                                                }
                                              }}
                                              sx={{
                                                flex: 1,
                                                p: { xs: 1, md: 2 },
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                "& > div": {
                                                  width: "100% !important",
                                                  height: "100% !important",
                                                  minHeight: "100%",
                                                  flex: 1,
                                                },
                                                "& .recharts-wrapper, & .recharts-surface":
                                                  {
                                                    width: "100% !important",
                                                    height: "100% !important",
                                                  },
                                              }}
                                            >
                                              {/* Error Boundary for Chart Rendering */}
                                              <ChartErrorBoundary
                                                height={isMobile ? 450 : 580}
                                              >
                                                {chart &&
                                                chart.data &&
                                                Array.isArray(chart.data) &&
                                                chart.data.length > 0 ? (
                                                  <React.Suspense
                                                    fallback={
                                                      <Box
                                                        sx={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          justifyContent:
                                                            "center",
                                                          height: isMobile
                                                            ? 450
                                                            : 580,
                                                          minHeight: 400,
                                                        }}
                                                      >
                                                        <CircularProgress />
                                                      </Box>
                                                    }
                                                  >
                                                    <InteractiveChart
                                                      key={`chart-${
                                                        chart.originalIndex
                                                      }-${getCurrentChartType(
                                                        chart.originalIndex,
                                                        chart.type
                                                      )}`}
                                                      {...chart}
                                                      type={getCurrentChartType(
                                                        chart.originalIndex,
                                                        chart.type
                                                      )}
                                                      index={
                                                        chart.originalIndex
                                                      }
                                                      height={
                                                        isMobile ? 450 : 580
                                                      }
                                                      width="100%"
                                                      responsive={true}
                                                      hideHeader={true}
                                                      allowTypeChange={false}
                                                    />
                                                  </React.Suspense>
                                                ) : (
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      height: isMobile
                                                        ? 450
                                                        : 580,
                                                      minHeight: 400,
                                                      color: "text.secondary",
                                                      bgcolor:
                                                        "background.paper",
                                                      border: "1px solid",
                                                      borderColor: "divider",
                                                      borderRadius: 2,
                                                    }}
                                                  >
                                                    <Typography>
                                                      Chart data unavailable
                                                    </Typography>
                                                  </Box>
                                                )}
                                              </ChartErrorBoundary>
                                            </Box>
                                          </Box>
                                        </Collapse>
                                      </Paper>
                                    );
                                  }
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </>
                    );
                  })()}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        </Fade>
      )}
      {/* Analysis Summary Widget with Metrics and Insights */}
      {finalAnalysis && (
        <Fade in timeout={500}>
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <AnalysisSummaryWidget
              data={{
                supporting_data:
                  finalAnalysis.supporting_data ||
                  finalAnalysis.tables?.[0]?.data ||
                  [],
                summary: {
                  total_records:
                    finalAnalysis.supporting_data?.length ||
                    finalAnalysis.tables?.[0]?.data?.length ||
                    0,
                  query: title || "Analysis Results",
                },
                analysis: finalAnalysis.analysis || [],
              }}
              loading={isProcessing}
              title="Analysis Summary"
              metadata={finalAnalysis.metadata || {}}
            />
          </Box>
        </Fade>
      )}

      {/* Review Popover */}
      <ReviewPopover
        open={reviewPopover.open}
        anchorEl={reviewPopover.anchorEl}
        onClose={handleCloseReview}
        recordData={reviewPopover.recordData}
        tableName={reviewPopover.tableName}
      />
    </Box>
  );
};

export default React.memo(AnalysisWidget);
