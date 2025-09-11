import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { 
  FileDownload, 
  GetApp, 
  TableChart,
  CurrencyRupee,
  Download,
  ExpandMore,
  Person,
  TrendingUp,
  Search,
  TrendingDown,
  CheckBox,
  CheckBoxOutlineBlank
} from '@mui/icons-material';

// Color definitions for various chart elements
const colors = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
  states: {
    'Andhra Pradesh': '#8b5cf6',
    'Karnataka': '#06b6d4',
    'Tamil Nadu': '#10b981',
    'Telangana': '#f59e0b',
    'Kerala': '#ef4444',
    'Maharashtra': '#ec4899',
    'Gujarat': '#6366f1',
    'Rajasthan': '#84cc16',
    'Punjab': '#f97316',
    'Haryana': '#14b8a6'
  }
};

// Helper function to generate colors for stages
const getStageColor = (index, total) => {
  const stageColors = [
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan  
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#f97316', // Orange
    '#14b8a6'  // Teal
  ];
  return stageColors[index % stageColors.length];
};

const DynamicDataVisualization = ({ 
  analysisResult,
  loading = false
}) => {
  // State for selected RMs
  const [selectedRMs, setSelectedRMs] = useState([]);
  const [showTopPerformers, setShowTopPerformers] = useState(true);
  const [showLowPerformers, setShowLowPerformers] = useState(false);
  
  // Search states
  const [topPerformersSearch, setTopPerformersSearch] = useState('');
  const [lowPerformersSearch, setLowPerformersSearch] = useState('');

  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Filter functions for search
  const getFilteredTopPerformers = () => {
    if (!chartData?.rmPerformanceData?.topPerformers) return [];
    
    return chartData.rmPerformanceData.topPerformers.filter(rm =>
      rm.name.toLowerCase().includes(topPerformersSearch.toLowerCase())
    );
  };

  const getFilteredLowPerformers = () => {
    if (!chartData?.rmPerformanceData?.lowPerformers) return [];
    
    return chartData.rmPerformanceData.lowPerformers.filter(rm =>
      rm.name.toLowerCase().includes(lowPerformersSearch.toLowerCase())
    );
  };

  console.log('DynamicDataVisualization received:', analysisResult);
  
  // Debug logging
  React.useEffect(() => {
    if (analysisResult?.analysis_result?.supporting_data) {
      console.log('🔍 [DEBUG] Raw analysisResult:', analysisResult);
      console.log('🔍 [DEBUG] Supporting data length:', analysisResult.analysis_result.supporting_data.length);
      console.log('🔍 [DEBUG] Sample data (first 3):', analysisResult.analysis_result.supporting_data.slice(0, 3));
      console.log('🔍 [DEBUG] All data fields:', Object.keys(analysisResult.analysis_result.supporting_data[0] || {}));
      
      // Debug each field in detail
      const firstItem = analysisResult.analysis_result.supporting_data[0] || {};
      Object.keys(firstItem).forEach(field => {
        const value = firstItem[field];
        const isNumeric = typeof value === 'number' || (value !== null && !isNaN(parseFloat(value)));
        const isPercentage = typeof value === 'string' && value.includes('%');
        console.log(`🔍 [DEBUG] Field: ${field}, isPercentage: ${isPercentage}, isNumeric: ${isNumeric}, value: ${value}`);
      });
    }
  }, [analysisResult]);

  // Detect data type and main field for visualization
  const dataAnalysis = useMemo(() => {
    console.log('🔍 [DEBUG] Starting dataAnalysis...');
    
    if (!analysisResult?.analysis_result?.supporting_data) {
      console.log('🔍 [DEBUG] No supporting data found, returning unknown');
      return { type: 'unknown', scoreField: null, pipelineStages: [], isTargetVsAchievement: false };
    }
    
    const data = analysisResult.analysis_result.supporting_data;
    if (data.length === 0) {
      console.log('🔍 [DEBUG] Empty data array, returning unknown');
      return { type: 'unknown', scoreField: null, pipelineStages: [], isTargetVsAchievement: false };
    }
    
    const firstItem = data[0];
    const fields = Object.keys(firstItem);
    console.log('🔍 [DEBUG] Data fields for analysis:', fields);
    
    // Check if this is pipeline data by looking for specific pipeline stage fields
    const pipelineFields = [
      'Field_Verification_Pending',
      'R3_R4_ICPH_Pending', 
      'Bank_CPH_Pending',
      'E_sign_Pending',
      'Insurance_Pending',
      'Disbursement_Initiate_Pending'
    ];
    
    // Also check for Total_ prefixed versions (multi-region data)
    const totalPipelineFields = [
      'Total_Field_Verification_Pending',
      'Total_R3_R4_ICPH_Pending', 
      'Total_Bank_CPH_Pending',
      'Total_E_sign_Pending',
      'Total_Insurance_Pending',
      'Total_Disbursement_Initiate_Pending'
    ];
    
    const foundPipelineFields = pipelineFields.filter(field => fields.includes(field));
    const foundTotalPipelineFields = totalPipelineFields.filter(field => fields.includes(field));
    
    console.log('🔍 [DEBUG] Found pipeline fields:', foundPipelineFields);
    console.log('🔍 [DEBUG] Found total pipeline fields:', foundTotalPipelineFields);
    
    if (foundPipelineFields.length > 0) {
      console.log('🔍 [DEBUG] Detected as pipeline data (single region)');
      return {
        type: 'pipeline',
        scoreField: null,
        pipelineStages: foundPipelineFields,
        isTargetVsAchievement: false
      };
    }
    
    if (foundTotalPipelineFields.length > 0) {
      console.log('🔍 [DEBUG] Detected as pipeline data (multi-region)');
      return {
        type: 'pipeline',
        scoreField: null,
        pipelineStages: foundTotalPipelineFields,
        isMultiRegion: true,
        isTargetVsAchievement: false
      };
    }
    
    // Check for Target vs Achievement data (RM performance)
    const hasTargetField = fields.some(field => field.toLowerCase().includes('tar'));
    const hasAchievementField = fields.some(field => field.toLowerCase().includes('ach'));
    const hasRMField = fields.some(field => field.toLowerCase().includes('rm'));
    
    console.log('🔍 [DEBUG] Target field check:', hasTargetField, fields.filter(f => f.toLowerCase().includes('tar')));
    console.log('🔍 [DEBUG] Achievement field check:', hasAchievementField, fields.filter(f => f.toLowerCase().includes('ach')));
    console.log('🔍 [DEBUG] RM field check:', hasRMField, fields.filter(f => f.toLowerCase().includes('rm')));
    
    if (hasTargetField && hasAchievementField && hasRMField) {
      console.log('🔍 [DEBUG] ✅ DETECTED AS RM PERFORMANCE DATA!');
      const result = {
        type: 'performance',
        scoreField: 'DB_Ach', // Achievement field for primary metric
        targetField: 'DB_Tar', // Target field
        achievementField: 'DB_Ach', // Achievement field
        nameField: 'RM_Name', // Name field for identification
        isTargetVsAchievement: true,
        pipelineStages: []
      };
      console.log('🔍 [DEBUG] Returning RM performance config:', result);
      return result;
    }
    
    // For other performance data, detect numerical fields
    const numericalFields = fields.filter(key => {
      const value = firstItem[key];
      return typeof value === 'number' || (value !== null && !isNaN(parseFloat(value)));
    });
    
    console.log('🔍 [DEBUG] Numerical fields found:', numericalFields);
    
    // Find the main score/percentage field
    const scoreField = fields.find(field => 
      field.toLowerCase().includes('score') || 
      field.toLowerCase().includes('percentage') ||
      field.toLowerCase().includes('rate') ||
      field.toLowerCase().includes('percent')
    ) || numericalFields[0];
    
    console.log('🔍 [DEBUG] Falling back to generic performance with scoreField:', scoreField);
    
    return { 
      type: 'performance', 
      scoreField, 
      pipelineStages: [],
      isTargetVsAchievement: false
    };
  }, [analysisResult]);

  const { type: dataType, scoreField, pipelineStages, isMultiRegion, isTargetVsAchievement, targetField, achievementField, nameField } = dataAnalysis;
  
  console.log('🔍 [DEBUG] ✅ Data Analysis Result:', dataAnalysis);
  console.log('🔍 [DEBUG] ✅ Extracted values:', {
    dataType,
    scoreField,
    pipelineStages,
    isMultiRegion,
    isTargetVsAchievement,
    targetField,
    achievementField,
    nameField
  });

  // Pipeline chart generation function
  const generatePipelineCharts = (supportingData, stages, isMultiRegion = false) => {
    if (!supportingData || supportingData.length === 0) {
      return { pieChart: null, barChart: null, branchChart: null, waterfallChart: null };
    }

    if (isMultiRegion) {
      // Multi-region stacked bar chart showing all regions with stage breakdowns
      const regionsWithPipeline = supportingData.filter(item => {
        const totalPipeline = parseFloat(item.Total_Pipeline) || 0;
        return totalPipeline > 0;
      });

      const stageNames = stages.map(stage => 
        stage.replace(/Total_/g, '').replace(/_Pending/g, '').replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
      );

      const stackedData = regionsWithPipeline.map(regionData => {
        const dataPoint = {
          region: regionData.Region,
          totalPipeline: parseFloat(regionData.Total_Pipeline) || 0
        };
        
        stages.forEach((stage, index) => {
          const stageName = stage.replace(/Total_/g, '').replace(/_Pending/g, '').replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
          dataPoint[stageName] = parseFloat(regionData[stage]) || 0;
        });
        
        return dataPoint;
      });

      // Create summary data for all stages across regions
      const summaryData = stages.map((stage, index) => {
        const stageName = stage.replace(/Total_/g, '').replace(/_Pending/g, '').replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        const totalValue = supportingData.reduce((sum, item) => sum + (parseFloat(item[stage]) || 0), 0);
        
        return {
          name: stageName,
          value: totalValue,
          fill: getStageColor(index, stages.length),
          stage: stageName
        };
      }).filter(item => item.value > 0);

      return {
        pieChart: null,
        barChart: stackedData.length > 0 ? {
          title: 'Pipeline by Region and Stage',
          data: stackedData,
          isStacked: true,
          stageNames: stageNames
        } : null,
        branchChart: null,
        waterfallChart: summaryData.length > 0 ? {
          title: 'Total Pipeline Summary by Stage',
          data: summaryData,
          totalPipeline: supportingData.reduce((sum, item) => sum + (parseFloat(item.Total_Pipeline) || 0), 0)
        } : null
      };
    } else {
      // Single region pipeline charts (existing logic)
      const firstItem = supportingData[0];
      
      // Create waterfall data from pipeline stages
      const waterfallData = stages.map((stage, index) => {
        const value = parseFloat(firstItem[stage]) || 0;
        const stageName = stage
          .replace(/_Pending/g, '')
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim();
        
        return {
          name: stageName,
          value: value,
          cumulative: stages.slice(0, index + 1).reduce((sum, s) => sum + (parseFloat(firstItem[s]) || 0), 0),
          fill: getStageColor(index, stages.length),
          stage: stage
        };
      });

      return {
        pieChart: null, // Hide pie chart for pipeline data
        barChart: null, // Remove duplicate - Pipeline Flow Analysis shows the same data
        branchChart: null, // Hide branch chart for pipeline data  
        waterfallChart: waterfallData.length > 0 ? {
          title: 'Pipeline Flow Analysis',
          data: waterfallData,
          totalPipeline: firstItem.Total_Pipeline || waterfallData.reduce((sum, item) => sum + item.value, 0)
        } : null
      };
    }
  };

  // Target vs Achievement chart generation function
  const generateTargetVsAchievementCharts = (supportingData, targetField, achievementField, nameField) => {
    console.log('🎯 [DEBUG] ✅ ENTERING generateTargetVsAchievementCharts');
    console.log('🎯 [DEBUG] RM Performance Data Input:', {
      supportingData: supportingData.slice(0, 3),
      supportingDataLength: supportingData.length,
      targetField,
      achievementField, 
      nameField
    });

    // Filter out RMs with 0 targets and calculate achievement percentages
    const rmsWithTargets = supportingData
      .filter(item => {
        const target = parseFloat(item[targetField]);
        return target > 0;
      })
      .map(item => ({
        name: item[nameField] || 'Unknown RM',
        rmId: item.RM_ID || 'Unknown ID',
        target: parseFloat(item[targetField]) || 0,
        achievement: parseFloat(item[achievementField]) || 0,
        achievementRate: ((parseFloat(item[achievementField]) || 0) / (parseFloat(item[targetField]) || 1)) * 100
      }))
      .sort((a, b) => b.achievement - a.achievement); // Sort by achievement descending

    console.log('🎯 [DEBUG] Processed RM Data (first 5):', rmsWithTargets.slice(0, 5));

    // Get top performers by achievement, fallback to highest targets if no achievements
    const performingRMs = rmsWithTargets.filter(rm => rm.achievement > 0);
    const topPerformers = performingRMs.length >= 10 
      ? performingRMs.slice(0, 15) 
      : [...performingRMs, ...rmsWithTargets.filter(rm => rm.achievement === 0).slice(0, 15 - performingRMs.length)];

    console.log('🎯 [DEBUG] Top Performers (first 5):', topPerformers.slice(0, 5));

    // Create separate data for target and achievement for better visibility
    const comparisonData = topPerformers.map(rm => ({
      name: rm.name.length > 12 ? rm.name.substring(0, 10) + '..' : rm.name,
      fullName: rm.name,
      rmId: rm.rmId,
      Target: parseFloat(rm.target.toFixed(2)),
      Achievement: Math.max(parseFloat(rm.achievement.toFixed(2)), 0.1), // Minimum 0.1 for visibility
      'Achievement %': parseFloat(rm.achievementRate.toFixed(1))
    }));

    console.log('🎯 [DEBUG] Final Comparison Data for Chart (first 3):', comparisonData.slice(0, 3));
    console.log('🎯 [DEBUG] Chart data structure check:', {
      hasData: comparisonData.length > 0,
      firstItem: comparisonData[0],
      targetValues: comparisonData.slice(0, 3).map(d => d.Target),
      achievementValues: comparisonData.slice(0, 3).map(d => d.Achievement)
    });

    // Summary data for totals
    const totalTarget = rmsWithTargets.reduce((sum, rm) => sum + rm.target, 0);
    const totalAchievement = rmsWithTargets.reduce((sum, rm) => sum + rm.achievement, 0);
    const overallAchievementRate = totalTarget > 0 ? (totalAchievement / totalTarget) * 100 : 0;

    const summaryData = [
      {
        name: 'Overall Summary',
        Target: parseFloat(totalTarget.toFixed(2)),
        Achievement: parseFloat(totalAchievement.toFixed(2)),
        'Achievement %': parseFloat(overallAchievementRate.toFixed(1))
      }
    ];

    console.log('Summary Data:', summaryData);

    return {
      pieChart: null, // Not relevant for target vs achievement
      barChart: comparisonData.length > 0 ? {
        title: 'Top RM Performance - Target vs Achievement (₹ Lakhs)',
        data: comparisonData,
        isTargetVsAchievement: true,
        summary: {
          totalTarget: parseFloat(totalTarget.toFixed(2)),
          totalAchievement: parseFloat(totalAchievement.toFixed(2)),
          achievementRate: parseFloat(overallAchievementRate.toFixed(1)),
          totalRMs: rmsWithTargets.length,
          performingRMs: rmsWithTargets.filter(rm => rm.achievement > 0).length
        }
      } : null,
      branchChart: null, // Not relevant
      waterfallChart: summaryData.length > 0 ? {
        title: 'Overall Target vs Achievement Summary',
        data: summaryData,
        isTargetVsAchievement: true,
        totalTarget: parseFloat(totalTarget.toFixed(2)),
        totalAchievement: parseFloat(totalAchievement.toFixed(2))
      } : null
    };
  };

  // Process RM performance data for interactive selection
  const processRMPerformanceData = (supportingData, targetField, achievementField, nameField) => {
    console.log('🎯 [DEBUG] Processing RM Performance Data for Interactive Selection');
    
    // Process all RMs with targets > 0
    const allRMs = supportingData
      .filter(item => parseFloat(item[targetField]) > 0)
      .map(item => ({
        id: item.RM_ID || 'Unknown ID',
        name: item[nameField] || 'Unknown RM',
        target: parseFloat(item[targetField]) || 0,
        achievement: parseFloat(item[achievementField]) || 0,
        achievementRate: ((parseFloat(item[achievementField]) || 0) / (parseFloat(item[targetField]) || 1)) * 100
      }))
      .sort((a, b) => b.achievement - a.achievement);

    // Categorize RMs
    const topPerformers = allRMs.filter(rm => rm.achievement > 0).slice(0, 10);
    const lowPerformers = allRMs.filter(rm => rm.achievement === 0).slice(0, 10);
    
    // Calculate summary
    const totalTarget = allRMs.reduce((sum, rm) => sum + rm.target, 0);
    const totalAchievement = allRMs.reduce((sum, rm) => sum + rm.achievement, 0);
    const overallAchievementRate = totalTarget > 0 ? (totalAchievement / totalTarget) * 100 : 0;
    const activeRMs = allRMs.filter(rm => rm.achievement > 0).length;

    return {
      allRMs,
      topPerformers,
      lowPerformers,
      summary: {
        totalTarget: `₹${totalTarget.toFixed(1)}L`,
        totalAchievement: `₹${totalAchievement.toFixed(1)}L`,
        achievementRate: `${overallAchievementRate.toFixed(1)}%`,
        activeRMs: `${activeRMs}/${allRMs.length}`
      }
    };
  };

  // Generate chart data based on data type
  const chartData = useMemo(() => {
    console.log('📊 [DEBUG] ✅ STARTING chartData generation...');
    console.log('📊 [DEBUG] Input conditions:', {
      hasAnalysisResult: !!analysisResult?.analysis_result?.supporting_data,
      dataType,
      isTargetVsAchievement,
      targetField,
      achievementField,
      nameField
    });
    
    if (!analysisResult?.analysis_result?.supporting_data) {
      console.log('📊 [DEBUG] ❌ No supporting data found');
      return { pieChart: null, barChart: null, branchChart: null, waterfallChart: null };
    }
    
    const supportingData = analysisResult.analysis_result.supporting_data;
    if (supportingData.length === 0) {
      console.log('📊 [DEBUG] ❌ Empty supporting data array');
      return { pieChart: null, barChart: null, branchChart: null, waterfallChart: null };
    }
    
    console.log('📊 [DEBUG] ✅ Supporting data available, length:', supportingData.length);
    
    // Handle pipeline data differently
    if (dataType === 'pipeline') {
      console.log('📊 [DEBUG] Processing as pipeline data');
      return generatePipelineCharts(supportingData, pipelineStages, isMultiRegion);
    }
    
    // Handle Target vs Achievement data (RM Performance)
    if (isTargetVsAchievement && targetField && achievementField && nameField) {
      console.log('📊 [DEBUG] ✅ Processing as RM Performance data (Target vs Achievement)');
      console.log('📊 [DEBUG] Fields:', { targetField, achievementField, nameField });
      const rmData = processRMPerformanceData(
        analysisResult.analysis_result.supporting_data,
        targetField,
        achievementField,
        nameField
      );
      console.log('📊 [DEBUG] ✅ Processed RM Performance data:', rmData);
      return { rmPerformanceData: rmData };
    } else {
      console.log('📊 [DEBUG] ❌ Target vs Achievement conditions not met:', {
        isTargetVsAchievement,
        hasTargetField: !!targetField,
        hasAchievementField: !!achievementField,
        hasNameField: !!nameField
      });
    }
    
    // For non-pipeline data, require scoreField
    if (!scoreField) return { pieChart: null, barChart: null, branchChart: null, waterfallChart: null };
    

    
    
    const firstItem = supportingData[0];
    
    console.log('All fields:', Object.keys(firstItem));
    console.log('Selected score field:', scoreField);
    console.log('First item sample:', firstItem);
    
    // State-wise collection percentage analysis
    let pieChart = null;
    if (firstItem.State !== undefined && scoreField) {
      console.log('Creating pie chart with scoreField:', scoreField);
      const stateData = {};
      
      supportingData.forEach(item => {
        const state = item.State || 'Unknown';
        const score = item[scoreField];
        
        if (!stateData[state]) {
          stateData[state] = { totalScore: 0, count: 0, validScores: [] };
        }
        
        // For percentage fields, only include non-null values
        if (scoreField.toLowerCase().includes('percentage')) {
          if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
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
            fill: colors.states[state] || colors.secondary
          };
        })
        .sort((a, b) => b.value - a.value);
      
      if (stateChartData.length > 0) {
        const fieldLabel = scoreField.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        pieChart = {
          title: `Average ${fieldLabel} by State`,
          data: stateChartData
        };
      }
    }
    
    // Region-wise chart showing actual values from the detected score field
    let barChart = null;
    if (firstItem.Region !== undefined && scoreField) {
      console.log('Creating bar chart with scoreField:', scoreField);
      const regionScores = {};
      const regionCounts = {};
      
      supportingData.forEach(item => {
        const region = (item.Region || 'Unknown').trim();
        const score = item[scoreField];
        
        // For percentage fields, only include non-null values
        if (scoreField.toLowerCase().includes('percentage')) {
          if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
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
          const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          return {
            region: region.length > 8 ? region.substring(0, 8) + '...' : region,
            avgScore: Number(avgScore.toFixed(2)), // Ensure 2 decimal places
            count: regionCounts[region],
            // Dynamic coloring based on field type and value range
            fill: scoreField.toLowerCase().includes('percentage') ?
              // For percentages: red (0-20%), orange (20-40%), yellow (40-60%), light green (60-80%), green (80-100%)
              (avgScore >= 80 ? colors.success :
               avgScore >= 60 ? '#22c55e' :
               avgScore >= 40 ? colors.warning :
               avgScore >= 20 ? colors.error : colors.critical) :
              // For scores: use original logic
              (avgScore === -1.0 ? colors.critical :
               avgScore >= -0.9 && avgScore < -0.8 ? colors.error :
               avgScore >= -0.7 && avgScore < -0.5 ? colors.warning :
               avgScore >= -0.5 ? colors.success : colors.primary)
          };
        })
        .sort((a, b) => scoreField.toLowerCase().includes('percentage') ? b.avgScore - a.avgScore : a.avgScore - b.avgScore) // Sort by score (best first for percentage, worst first for scores)
        .slice(0, 12); // Show top 12 regions
      
      // Only create chart if we have data
      if (regionData.length > 0) {
        const fieldLabel = scoreField.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        barChart = {
          title: `Average ${fieldLabel} by Region`,
          data: regionData
        };
        
        console.log('Region chart data:', {
          totalRegions: Object.keys(regionScores).length,
          regionData: regionData.map(r => ({ ...r, avgScore: Number(r.avgScore.toFixed(2)) })),
          scoreField: scoreField
        });
      }
    }

    // Branch-wise performance chart for worst performing branches
    let branchChart = null;
    
    // Always create branch chart if we have supporting data with branch names and scores
    if (supportingData.length > 0) {
      // Check if data contains branch information
      const branchField = Object.keys(firstItem).find(key => 
        key.toLowerCase().includes('branch') && firstItem[key]
      );
      
      console.log('Branch field found:', branchField, 'Score field:', scoreField);
      
      const hasValidBranchData = supportingData.some(item => 
        item && 
        branchField &&
        item[branchField] && 
        scoreField &&
        (typeof item[scoreField] === 'number' || !isNaN(parseFloat(item[scoreField])))
      );
      
      if (hasValidBranchData) {
        // Extract threshold and operation from the question dynamically
        const question = analysisResult?.question || '';
        const fieldLabel = scoreField.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        
        // Check for different query patterns (more flexible to handle any field)
        const lessThanMatch = question.match(new RegExp(`${fieldLabel}\s*less than\s*(-?\d+\.?\d*)`, 'i')) ||
                             question.match(/less than\s*(-?\d+\.?\d*)/i) ||
                             question.match(/[<≤]\s*(-?\d+\.?\d*)/i) ||
                             question.match(/(-?\d+\.?\d*)\s*or\s*less/i);
        
        const moreThanMatch = question.match(new RegExp(`${fieldLabel}\s*more than\s*(-?\d+\.?\d*)`, 'i')) ||
                             question.match(/more than\s*(-?\d+\.?\d*)/i) ||
                             question.match(/greater than\s*(-?\d+\.?\d*)/i) ||
                             question.match(/[>≥]\s*(-?\d+\.?\d*)/i);
        
        let threshold, operator, titlePrefix;
        
        if (moreThanMatch) {
          threshold = parseFloat(moreThanMatch[1]);
          operator = question.includes('more than') || question.includes('>') ? '>' : '≥';
          titlePrefix = scoreField.toLowerCase().includes('percentage') ? 'High Performing Branches' : 'Better Performing Branches';
        } else if (lessThanMatch) {
          threshold = parseFloat(lessThanMatch[1]);
          operator = question.includes('less than') || question.includes('<') ? '<' : '≤';
          titlePrefix = scoreField.toLowerCase().includes('percentage') ? 'Low Performing Branches' : 'Worst Performing Branches';
        } else {
          // Default based on data analysis and field type
          const validScores = supportingData
            .map(item => parseFloat(item[scoreField]))
            .filter(score => !isNaN(score));
          
          if (validScores.length === 0) {
            threshold = 0;
            operator = '≥';
            titlePrefix = 'All Branches';
          } else {
            const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
            
            if (scoreField.toLowerCase().includes('percentage')) {
              // For percentages, show branches with data (not null)
              threshold = 0;
              operator = '≥';
              titlePrefix = 'Branches with Collection Data';
            } else {
              threshold = avgScore > 0 ? 0 : -0.6;
              operator = avgScore > 0 ? '>' : '≤';
              titlePrefix = avgScore > 0 ? 'Better Performing Branches' : 'Worst Performing Branches';
            }
          }
        }
        
        // Process all branches from supporting data (they're already filtered by the API)
        const branchData = supportingData
          .filter(item => {
            // Filter out null/undefined values for percentage fields
            if (scoreField.toLowerCase().includes('percentage')) {
              return item[branchField] && item[scoreField] !== null && item[scoreField] !== undefined && !isNaN(parseFloat(item[scoreField]));
            }
            return item[branchField] && (typeof item[scoreField] === 'number' || !isNaN(parseFloat(item[scoreField])));
          })
          .map(item => ({
            branch: item[branchField].length > 12 ? 
                     item[branchField].substring(0, 12) + '...' : 
                     item[branchField],
            fullName: item[branchField],
            score: Number(parseFloat(item[scoreField]).toFixed(2)),
            region: (item.Region || 'Unknown').trim(),
            state: item.State || 'Unknown',
            // Dynamic coloring based on field type and value
            fill: scoreField.toLowerCase().includes('percentage') ?
              // For percentages: red (0-20%), orange (20-40%), yellow (40-60%), light green (60-80%), green (80-100%)
              (parseFloat(item[scoreField]) >= 80 ? colors.success :
               parseFloat(item[scoreField]) >= 60 ? '#22c55e' :
               parseFloat(item[scoreField]) >= 40 ? colors.warning :
               parseFloat(item[scoreField]) >= 20 ? colors.error : colors.critical) :
              // For scores: use original logic
              (parseFloat(item[scoreField]) === -1.0 ? colors.critical :
               parseFloat(item[scoreField]) >= -0.9 && parseFloat(item[scoreField]) < -0.8 ? colors.error :
               parseFloat(item[scoreField]) >= -0.7 && parseFloat(item[scoreField]) < -0.5 ? colors.warning :
               parseFloat(item[scoreField]) >= -0.5 ? colors.success : colors.primary)
          }));
        
        // Sort branches based on query intent and field type
        const sortedBranches = (moreThanMatch || scoreField.toLowerCase().includes('percentage')) ? 
          branchData.sort((a, b) => b.score - a.score) :  // Best first for "more than" or percentages
          branchData.sort((a, b) => a.score - b.score);   // Worst first for "less than" or scores
        
        const limitedBranches = sortedBranches.slice(0, 25); // Show top 25 branches

        if (limitedBranches.length > 0) {
          console.log('Branch chart data processed:', {
            totalBranches: supportingData.length,
            filteredBranches: limitedBranches.length,
            sampleData: limitedBranches.slice(0, 3),
            threshold,
            titlePrefix
          });
          
          const fieldDisplayName = scoreField.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
          branchChart = {
            title: `${titlePrefix} (${fieldDisplayName} ${operator} ${Math.abs(threshold)})`,
            data: limitedBranches,
            totalCount: supportingData.length
          };
        }
      }
    }
    
    return { pieChart, barChart, branchChart, waterfallChart: null };
  }, [analysisResult, scoreField, dataType, pipelineStages]);

  // Generate regional summary data for branch performance
  const regionalSummary = useMemo(() => {
    if (!analysisResult?.analysis_result?.supporting_data) return [];
    
    const supportingData = analysisResult.analysis_result.supporting_data;
    
    // Handle branch performance data dynamically
    if (supportingData.length > 0) {
      const firstItem = supportingData[0];
      
      // Find region and score fields dynamically
      const regionField = Object.keys(firstItem).find(key => 
        key.toLowerCase().includes('region') && firstItem[key]
      );
      
      const scoreField = Object.keys(firstItem).find(key => 
        (key.toLowerCase().includes('score') || 
         key.toLowerCase().includes('percentage') ||
         key.toLowerCase().includes('rate')) &&
        (typeof firstItem[key] === 'number' || !isNaN(parseFloat(firstItem[key])))
      );
      
      if (regionField && scoreField) {
        const regionGroups = {};
        
        supportingData.forEach(item => {
          const region = item[regionField] || 'Unknown';
          const score = item[scoreField];
          
          // For percentage fields, only include non-null values
          if (scoreField.toLowerCase().includes('percentage')) {
            if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
              if (!regionGroups[region]) {
                regionGroups[region] = {
                  region,
                  branchCount: 0,
                  totalScore: 0
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
                  totalScore: 0
                };
              }
              regionGroups[region].branchCount++;
              regionGroups[region].totalScore += parseFloat(score);
            }
          }
        });
        
        return Object.values(regionGroups)
          .filter(region => region.branchCount > 0)
          .map(region => ({
            ...region,
            averageScore: region.branchCount > 0 ? Number((region.totalScore / region.branchCount).toFixed(2)) : 0
          }));
      }
    }
    
    return [];
  }, [analysisResult]);

  const { gridColumns, gridRows } = useMemo(() => {
    if (!analysisResult || !analysisResult.analysis_result?.supporting_data || analysisResult.analysis_result.supporting_data.length === 0) {
      return { gridColumns: [], gridRows: [] };
    }

    const supportingData = analysisResult.analysis_result.supporting_data;
    const firstItem = supportingData[0];
    const columns = [];

    // Helper function to format field names for headers
    const formatHeaderName = (fieldName) => {
      return fieldName
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Helper function to determine field type and create appropriate column config
    const createColumnConfig = (fieldName, fieldValue) => {
      const headerName = formatHeaderName(fieldName);
      const isNumeric = typeof fieldValue === 'number' || (!isNaN(parseFloat(fieldValue)) && fieldValue !== null);
      const isPercentage = fieldName.toLowerCase().includes('percentage') || fieldName.toLowerCase().includes('percent') || fieldName === 'Collection_Percentage';
      const isScore = fieldName.toLowerCase().includes('score');
      const isState = fieldName.toLowerCase().includes('state');
      const isRegion = fieldName.toLowerCase().includes('region');
      const isBranch = fieldName.toLowerCase().includes('branch');
      
      console.log(`Field: ${fieldName}, isPercentage: ${isPercentage}, isNumeric: ${isNumeric}, value: ${fieldValue}`);
      
      // Base column configuration
      const baseConfig = {
        field: fieldName,
        headerName: headerName,
        minWidth: 100,
        flex: 1
      };

      // State field - special styling
      if (isState) {
        return {
          ...baseConfig,
          flex: 0.8,
          minWidth: 70,
          renderCell: (params) => (
            <Chip 
              label={params.value || 'N/A'} 
              size="small"
              sx={{
                backgroundColor: params.value === 'KA' ? '#e3f2fd' : 
                                params.value === 'MH' ? '#f3e5f5' :
                                params.value === 'TN' ? '#fff3e0' : '#f5f5f5',
                color: params.value === 'KA' ? '#1976d2' : 
                       params.value === 'MH' ? '#7b1fa2' :
                       params.value === 'TN' ? '#f57c00' : '#616161',
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            />
          )
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
              label={params.value || 'Unknown'} 
              size="small"
              sx={{
                backgroundColor: '#f0f4f8',
                color: '#2d3748',
                fontWeight: 500,
                fontSize: '0.7rem'
              }}
            />
          )
        };
      }

      // Branch field - larger width
      if (isBranch) {
        return {
          ...baseConfig,
          flex: 2.5,
          minWidth: 140
        };
      }

      // Percentage fields - special formatting and colors (Enhanced detection)
      if (isPercentage && isNumeric) {
        return {
          ...baseConfig,
          flex: 1.3,
          minWidth: 120,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => {
            if (params.value === null || params.value === undefined || params.value === 'N/A') {
              return <span style={{ color: '#999', fontStyle: 'italic' }}>No Data</span>;
            }
            
            // Force conversion to number and round to 2 decimal places
            let numericValue;
            if (typeof params.value === 'string') {
              numericValue = parseFloat(params.value);
            } else {
              numericValue = Number(params.value);
            }
            
            // If value is invalid, show No Data
            if (isNaN(numericValue)) {
              return <span style={{ color: '#999', fontStyle: 'italic' }}>No Data</span>;
            }
            
            // Round to exactly 2 decimal places
            const roundedValue = Math.round(numericValue * 100) / 100;
            
            const fill = scoreField.toLowerCase().includes('percentage') ?
              // For percentages: green (high) → orange (medium) → red (low)
              (numericValue >= 80 ? '#c8e6c9' :   // Green (excellent)
               numericValue >= 60 ? '#dcedc8' :   // Light green (good)
               numericValue >= 40 ? '#fff3e0' :   // Warm amber (moderate)
               numericValue >= 20 ? '#ffccbc' :   // Light orange (poor)
               '#ffcdd2') :                       // Light red (critical)
              // For Total_Score: same intuitive gradient
              (numericValue >= 0.2 ? '#c8e6c9' :  // Green (excellent)
               numericValue >= 0 ? '#dcedc8' :    // Light green (good)
               numericValue >= -0.4 ? '#fff3e0' : // Warm amber (moderate)
               numericValue >= -0.8 ? '#ffccbc' : // Light orange (poor)
               '#ffcdd2');                        // Light red (critical)
            
            return (
              <Chip 
                label={`${roundedValue.toFixed(2)}%`}
                size="small"
                sx={{
                  backgroundColor: fill,
                  color: roundedValue >= 80 ? '#2e7d32' :              // Dark green text
                         roundedValue >= 60 ? '#558b2f' :             // Medium green text
                         roundedValue >= 40 ? '#f57c00' :             // Orange text
                         roundedValue >= 20 ? '#ff5722' :             // Red-orange text
                         '#d32f2f',                                   // Red text for critical
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem'
                }}
              />
            );
          }
        };
      }

      // Score fields - special formatting (enhanced for Total_Score)
      if (isScore && isNumeric) {
        return {
          ...baseConfig,
          flex: 1.2,
          minWidth: 110,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => {
            if (params.value === null || params.value === undefined) {
              return <span style={{ color: '#999', fontStyle: 'italic' }}>No Data</span>;
            }
            const value = typeof params.value === 'number' ? params.value : parseFloat(params.value);
            const roundedValue = Math.round(value * 100) / 100;
            
            // Enhanced color coding for Total_Score ranges
            let backgroundColor, textColor;
            if (roundedValue >= 0.2) {
              backgroundColor = '#e8f5e8'; // Green for positive scores
              textColor = '#2e7d32';
            } else if (roundedValue >= 0) {
              backgroundColor = '#fff3cd'; // Yellow for neutral scores  
              textColor = '#f57c00';
            } else if (roundedValue >= -0.4) {
              backgroundColor = '#ffeaa7'; // Orange for moderate negative
              textColor = '#ff8f00';
            } else if (roundedValue >= -0.8) {
              backgroundColor = '#ffcdd2'; // Light red for poor scores
              textColor = '#d84315';
            } else {
              backgroundColor = '#ffebee'; // Red for very poor scores
              textColor = '#c62828';
            }
            
            return (
              <Chip 
                label={roundedValue.toFixed(2)}
                size="small"
                sx={{
                  backgroundColor,
                  color: textColor,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem'
                }}
              />
            );
          }
        };
      }

      // Other numeric fields
      if (isNumeric) {
        return {
          ...baseConfig,
          flex: 1.1,
          minWidth: 100,
          align: 'right',
          headerAlign: 'right',
          renderCell: (params) => {
            if (params.value === null || params.value === undefined) {
              return <span style={{ color: '#999', fontStyle: 'italic' }}>No Data</span>;
            }
            const value = typeof params.value === 'number' ? params.value : parseFloat(params.value);
            const formattedValue = Number(value.toFixed(2));
            
            // Check if this is a percentage field (fallback check)
            if (fieldName.toLowerCase().includes('percentage') || fieldName.toLowerCase().includes('percent') || fieldName === 'Collection_Percentage') {
              // Apply the same precise rounding as the main percentage handler
              const roundedValue = Math.round(value * 100) / 100;
              
              return (
                <Chip 
                  label={`${roundedValue.toFixed(2)}%`}
                  size="small"
                  sx={{
                    backgroundColor: roundedValue >= 80 ? '#e8f5e8' : 
                                     roundedValue >= 60 ? '#fff3cd' :
                                     roundedValue >= 40 ? '#ffeaa7' :
                                     roundedValue >= 20 ? '#ffcdd2' : '#ffebee',
                    color: roundedValue >= 80 ? '#2e7d32' : 
                           roundedValue >= 60 ? '#f57c00' :
                           roundedValue >= 40 ? '#ff8f00' :
                           roundedValue >= 20 ? '#d84315' : '#c62828',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}
                />
              );
            }
            
            return (
              <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                {formattedValue.toFixed(2)}
              </span>
            );
          }
        };
      }

      // Text fields - default styling
      return {
        ...baseConfig,
        flex: 1.5,
        renderCell: (params) => {
          return params.value || <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;
        }
      };
    };

    // Dynamically create columns for all fields in the API response
    Object.keys(firstItem).forEach(fieldName => {
      const fieldValue = firstItem[fieldName];
      const columnConfig = createColumnConfig(fieldName, fieldValue);
      columns.push(columnConfig);
    });

    // Create rows with proper ID field
    const rows = supportingData.map((item, index) => ({
      id: index,
      ...item
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

  const handleSaveToDashboard = () => {
    try {
      // Generate a unique ID for this visualization
      const id = Date.now().toString();
      
      // Create the visualization data object
      const visualizationData = {
        id,
        title: `Analysis - ${new Date().toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        question: analysisResult?.question || 'Unknown Query',
        charts: {
          pieChart: chartData.pieChart,
          barChart: chartData.barChart,
          branchChart: chartData.branchChart
        },
        dataGrid: {
          gridColumns,
          gridRows
        }
      };

      // Get existing saved visualizations
      const existing = JSON.parse(localStorage.getItem('dashboardVisualizations') || '[]');
      
      // Add new visualization
      const updated = [visualizationData, ...existing];
      
      // Save to localStorage
      localStorage.setItem('dashboardVisualizations', JSON.stringify(updated));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Visualization saved to dashboard successfully!',
        severity: 'success'
      });

      // Open dashboard in new tab after a brief delay
      setTimeout(() => {
        const dashboardUrl = `${window.location.origin}/dashboard`;
        window.open(dashboardUrl, '_blank');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving to dashboard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save visualization. Please try again.',
        severity: 'error'
      });
    }
  };

  const exportToCSV = () => {
    if (gridRows.length === 0) return;
    
    const headers = gridColumns.map(col => col.headerName).join(',');
    const csvContent = [
      headers,
      ...gridRows.map(row => 
        gridColumns.map(col => row[col.field] || '').join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (gridRows.length === 0) return;
    
    const jsonContent = JSON.stringify(gridRows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-analysis.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (gridRows.length === 0) return;
    
    const headers = gridColumns.map(col => col.headerName).join('\t');
    const excelContent = [
      headers,
      ...gridRows.map(row => 
        gridColumns.map(col => row[col.field] || '').join('\t')
      )
    ].join('\n');
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-analysis.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
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

  if (!analysisResult?.analysis_result?.supporting_data || analysisResult.analysis_result.supporting_data.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 300,
        textAlign: 'center',
        p: 3
      }}>
        <TableChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No analysis data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* 1. Data Table */}
      {gridRows.length > 0 && (
        <Card sx={{ border: '1px solid #e0e0e0', mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 3, py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>
                Table Results ({gridRows.length} records)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<TableChart />}
                  onClick={handleSaveToDashboard}
                  sx={{ 
                    textTransform: 'none',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  Save to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownload />}
                  onClick={handleExportClick}
                  sx={{ 
                    textTransform: 'none',
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb'
                    }
                  }}
                >
                  Export
                </Button>
              </Box>
            </Box>
            <Box sx={{ 
              height: gridRows.length <= 3 ? 'auto' : 560, 
              minHeight: gridRows.length <= 3 ? 200 : 560,
              width: '100%' 
            }}>
              <DataGrid
                rows={gridRows}
                columns={gridColumns}
                pageSize={gridRows.length <= 5 ? gridRows.length : 10}
                rowsPerPageOptions={[5, 10, 25]}
                disableSelectionOnClick
                autoHeight={gridRows.length <= 3}
                hideFooter={gridRows.length <= 5}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.875rem'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fafc'
                  },
                  '& .MuiDataGrid-footerContainer': {
                    minHeight: gridRows.length <= 5 ? '0px' : '40px'
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    minHeight: gridRows.length <= 3 ? 'auto' : '300px'
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 2. Graph Metrics */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4,
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* State Distribution - Premium Pie Chart */}
        {chartData.pieChart && (
          <Box sx={{ 
            flex: chartData.barChart ? '0 0 calc(50% - 8px)' : '1 1 100%',
            minWidth: 0, // Prevents flex item from overflowing
            maxWidth: chartData.barChart ? 'calc(50% - 8px)' : '100%'
          }}>
            <Card sx={{ 
              height: '100%', 
              minHeight: 520,
              border: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                  p: 3, 
                  pb: 2,
                  borderBottom: '1px solid #f3f4f6',
                  flexShrink: 0
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 500,
                    color: '#1a1a1a',
                    fontSize: '1.125rem',
                    letterSpacing: '-0.025em'
                  }}>
                    {chartData.pieChart.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    mt: 0.5,
                    fontSize: '0.875rem'
                  }}>
                    {scoreField && scoreField.toLowerCase().includes('percentage') ? 
                      'Average collection percentage by state' : 
                      'Performance metrics by state'
                    }
                  </Typography>
                </Box>
                
                {/* Chart */}
                <Box sx={{ 
                  flex: 1, 
                  p: 2, 
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ width: '100%', height: 300, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <Pie
                          data={chartData.pieChart.data}
                          cx="50%"
                          cy="50%"
                          innerRadius="40%"
                          outerRadius="70%"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.pieChart.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                          formatter={(value, name, props) => {
                            const isPercentage = scoreField && scoreField.toLowerCase().includes('percentage');
                            const displayValue = isPercentage ? `${Number(value).toFixed(2)}%` : Number(value).toFixed(2);
                            return [displayValue, `${name} (${props.payload.count} branches)`];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  {/* Custom Legend with Values */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    px: 2
                  }}>
                    {chartData.pieChart.data.map((entry, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: '#f8fafc'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: entry.fill
                          }} />
                          <Typography variant="body2" sx={{ 
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151'
                          }}>
                            {entry.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1f2937'
                        }}>
                          {scoreField && scoreField.toLowerCase().includes('percentage') ? 
                            `${Number(entry.value).toFixed(2)}%` : 
                            `${Number(entry.value).toFixed(2)} (${entry.count} branches)`
                          }
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Pipeline Waterfall Chart */}
        {chartData.waterfallChart && (
          <Box sx={{ 
            flex: '1 1 100%',
            minWidth: 0,
            maxWidth: '100%',
            mb: 2
          }}>
            <Card sx={{ 
              height: '100%', 
              minHeight: 520,
              border: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                  p: 3, 
                  pb: 2,
                  borderBottom: '1px solid #f3f4f6',
                  flexShrink: 0
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '1.25rem',
                    letterSpacing: '-0.025em'
                  }}>
                    {chartData.waterfallChart.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    mt: 0.5,
                    fontSize: '0.875rem'
                  }}>
                    Total Pipeline: {chartData.waterfallChart.totalPipeline} cases across {chartData.waterfallChart.data.length} stages
                  </Typography>
                </Box>

                {/* Waterfall Chart */}
                <Box sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.waterfallChart.data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#e5e7eb"
                          strokeWidth={0.5}
                        />
                        <XAxis 
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 11, 
                            fill: '#6b7280',
                            fontWeight: 500
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#6b7280',
                            fontWeight: 500
                          }}
                          width={50}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                          formatter={(value, name) => [
                            `${value} cases`,
                            'Pending Cases'
                          ]}
                          labelFormatter={(label) => `Stage: ${label}`}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  {/* Pipeline Flow Summary */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 2,
                    mt: 3,
                    pt: 3,
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    {chartData.waterfallChart.data.map((stage, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#f8fafc',
                        borderLeft: `4px solid ${stage.fill}`,
                        minWidth: 160
                      }}>
                        <Box>
                          <Typography variant="body2" sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {stage.name}
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            {stage.value}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            cases pending
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Interactive RM Performance Selection */}
        {chartData.rmPerformanceData && (
          <Box sx={{ width: '100%' }}>
            {/* Overview Statistics Card */}
            <Card sx={{ 
              border: 'none',
              boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              mb: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  mb: 3,
                  fontSize: '1.25rem',
                  textAlign: 'center'
                }}>
                  RM Performance Overview
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b',
                        fontWeight: 700,
                        fontSize: '1.875rem',
                        mb: 0.5
                      }}>
                        {chartData.rmPerformanceData.summary.totalTarget}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Total Target
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        color: '#059669',
                        fontWeight: 700,
                        fontSize: '1.875rem',
                        mb: 0.5
                      }}>
                        {chartData.rmPerformanceData.summary.totalAchievement}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Total Achievement
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        color: '#d97706',
                        fontWeight: 700,
                        fontSize: '1.875rem',
                        mb: 0.5
                      }}>
                        {chartData.rmPerformanceData.summary.achievementRate}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Achievement Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b',
                        fontWeight: 700,
                        fontSize: '1.875rem',
                        mb: 0.5
                      }}>
                        {chartData.rmPerformanceData.summary.activeRMs}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Active RMs
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {/* RM Selection Interface */}
            <Box sx={{ mt: 3, px: 2 }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                mb: 3,
                fontSize: '1.25rem',
                textAlign: 'center'
              }}>
                RM Performance Comparison
              </Typography>
              
              <Grid container spacing={3} justifyContent="center">
                {/* Top Performers Search */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid #059669',
                    borderRadius: 2
                  }}>
                    <Box sx={{ 
                      p: 2,
                      backgroundColor: '#f0fdf4',
                      borderBottom: '1px solid #059669'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendingUp sx={{ color: '#059669' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669' }}>
                          Top Performers
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        placeholder="Search RM by name..."
                        value={topPerformersSearch}
                        onChange={(e) => setTopPerformersSearch(e.target.value)}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: '#6b7280' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      flex: 1,
                      overflowY: 'auto',
                      p: 1
                    }}>
                      {getFilteredTopPerformers().map((rm) => (
                        <Box key={rm.id} sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          backgroundColor: selectedRMs.includes(rm.id) ? '#f0fdf4' : '#ffffff',
                          border: selectedRMs.includes(rm.id) ? '2px solid #059669' : '1px solid #e5e7eb',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                            borderColor: '#059669'
                          }
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                              {rm.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                              Target: ₹{rm.target}L
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Achievement: ₹{rm.achievement}L ({rm.achievementRate.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <Button
                            variant={selectedRMs.includes(rm.id) ? "contained" : "outlined"}
                            size="small"
                            color={selectedRMs.includes(rm.id) ? "success" : "primary"}
                            onClick={() => {
                              if (selectedRMs.includes(rm.id)) {
                                setSelectedRMs(selectedRMs.filter(id => id !== rm.id));
                              } else {
                                setSelectedRMs([...selectedRMs, rm.id]);
                              }
                            }}
                            sx={{ minWidth: '80px' }}
                          >
                            {selectedRMs.includes(rm.id) ? 'Remove' : 'Add'}
                          </Button>
                        </Box>
                      ))}
                      {getFilteredTopPerformers().length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No RMs found matching your search
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
                
                {/* Low Performers Search */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid #dc2626',
                    borderRadius: 2
                  }}>
                    <Box sx={{ 
                      p: 2,
                      backgroundColor: '#fef2f2',
                      borderBottom: '1px solid #dc2626'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendingDown sx={{ color: '#dc2626' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626' }}>
                          Low Performers
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        placeholder="Search RM by name..."
                        value={lowPerformersSearch}
                        onChange={(e) => setLowPerformersSearch(e.target.value)}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: '#6b7280' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      flex: 1,
                      overflowY: 'auto',
                      p: 1
                    }}>
                      {getFilteredLowPerformers().map((rm) => (
                        <Box key={rm.id} sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          backgroundColor: selectedRMs.includes(rm.id) ? '#fef2f2' : '#ffffff',
                          border: selectedRMs.includes(rm.id) ? '2px solid #dc2626' : '1px solid #e5e7eb',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                            borderColor: '#dc2626'
                          }
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                              {rm.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                              Target: ₹{rm.target}L
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Achievement: ₹{rm.achievement}L ({rm.achievementRate ? rm.achievementRate.toFixed(1) : '0.0'}%)
                            </Typography>
                          </Box>
                          <Button
                            variant={selectedRMs.includes(rm.id) ? "contained" : "outlined"}
                            size="small"
                            color={selectedRMs.includes(rm.id) ? "error" : "primary"}
                            onClick={() => {
                              if (selectedRMs.includes(rm.id)) {
                                setSelectedRMs(selectedRMs.filter(id => id !== rm.id));
                              } else {
                                setSelectedRMs([...selectedRMs, rm.id]);
                              }
                            }}
                            sx={{ minWidth: '80px' }}
                          >
                            {selectedRMs.includes(rm.id) ? 'Remove' : 'Add'}
                          </Button>
                        </Box>
                      ))}
                      {getFilteredLowPerformers().length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No RMs found matching your search
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            
            {/* Chart for Selected RMs */}
            {selectedRMs.length > 0 && (
              <Card sx={{ 
                mt: 3,
                border: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                borderRadius: 3
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Target vs Achievement Comparison ({selectedRMs.length} RMs)
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setSelectedRMs([])}
                      sx={{ textTransform: 'none' }}
                    >
                      Clear Selection
                    </Button>
                  </Box>
                  
                  <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.rmPerformanceData.allRMs
                          .filter(rm => selectedRMs.includes(rm.id))
                          .map(rm => ({
                            name: rm.name.length > 15 ? rm.name.substring(0, 12) + '...' : rm.name,
                            fullName: rm.name,
                            Target: rm.target,
                            Achievement: rm.achievement,
                            'Achievement %': rm.achievementRate
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#64748b',
                            fontWeight: 500
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#64748b',
                            fontWeight: 500
                          }}
                          width={60}
                          tickFormatter={(value) => `₹${value}L`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                          formatter={(value, name, props) => {
                            if (name === 'Achievement %') {
                              return [`${value.toFixed(1)}%`, 'Achievement Rate'];
                            }
                            return [`₹${value}L`, name];
                          }}
                          labelFormatter={(label, payload) => {
                            const entry = payload?.[0]?.payload;
                            return entry ? `RM: ${entry.fullName}` : `RM: ${label}`;
                          }}
                        />
                        <Bar 
                          dataKey="Target"
                          fill="#94a3b8"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                          name="Target"
                        />
                        <Bar 
                          dataKey="Achievement"
                          fill="#059669"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                          name="Achievement"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Bar Chart - Pipeline and Other Performance Data */}
        {chartData.barChart && !chartData.rmPerformanceData && (
          <Box sx={{ 
            flex: chartData.pieChart ? '0 0 calc(50% - 8px)' : '1 1 100%',
            minWidth: 0,
            maxWidth: chartData.pieChart ? 'calc(50% - 8px)' : '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Card sx={{ 
              height: '100%', 
              minHeight: 500,
              border: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                  p: 3, 
                  pb: 2,
                  borderBottom: '1px solid #f3f4f6',
                  flexShrink: 0
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 500,
                    color: '#1a1a1a',
                    fontSize: '1.125rem',
                    letterSpacing: '-0.025em'
                  }}>
                    {chartData.barChart.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    mt: 0.5,
                    fontSize: '0.875rem'
                  }}>
                    {dataType === 'pipeline' ? 'Pending cases by pipeline stage' : 'Average performance scores by region'}
                  </Typography>
                </Box>
                
                {/* Chart */}
                <Box sx={{ 
                  flex: 1, 
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ width: '100%', height: 550, mb: -10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.barChart.data}
                        margin={{ top: 10, right: 10, left: 10, bottom: 120 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#f3f4f6"
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 11, 
                            fill: '#6b7280',
                            fontWeight: 500
                          }}
                          height={chartData.barChart.isStacked ? 100 : 40}
                          interval={0}
                          angle={chartData.barChart.isStacked ? -45 : 0}
                          textAnchor={chartData.barChart.isStacked ? "end" : "middle"}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#6b7280',
                            fontWeight: 500
                          }}
                          width={80}
                          domain={dataType === 'pipeline' ? [0, 'dataMax'] : [-1.1, 0.1]}
                          tickFormatter={(value) => dataType === 'pipeline' ? value.toString() : value.toFixed(1)}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                          formatter={(value, name) => [
                            dataType === 'pipeline' ? `${value} cases` : `Score: ${value}`,
                            dataType === 'pipeline' ? (chartData.barChart.isStacked ? name : 'Pending Cases') : 'Average Score'
                          ]}
                          labelFormatter={(label) => 
                            dataType === 'pipeline' ? (chartData.barChart.isStacked ? `Region: ${label}` : `Stage: ${label}`) : `Region: ${label}`
                          }
                        />
                        {chartData.barChart.isStacked && dataType === 'pipeline' ? 
                          // Render stacked bars for multi-region pipeline data
                          chartData.barChart.stageNames.map((stageName, index) => (
                            <Bar 
                              key={stageName}
                              dataKey={stageName}
                              stackId="pipeline"
                              fill={getStageColor(index, chartData.barChart.stageNames.length)}
                              radius={index === chartData.barChart.stageNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                            />
                          ))
                          :
                          // Regular single bar for non-stacked data
                          <Bar 
                            dataKey={dataType === 'pipeline' ? "value" : "avgScore"}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                          />
                        }
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  {/* Legend */}
                  {!chartData.barChart.isTargetVsAchievement && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.5,
                      px: 2,
                      py: 1
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600,
                        color: '#374151',
                        mb: 1
                      }}>
                        {dataType === 'pipeline' ? (chartData.barChart.isStacked ? 'Legend' : 'Pipeline Stages') : 'Regional Scores'}
                      </Typography>
                      {chartData.barChart.isStacked && dataType === 'pipeline' ? (
                        <>
                          {/* Stage color legend */}
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              mb: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Pipeline Stages
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {chartData.barChart.stageNames.map((stageName, index) => (
                                <Box key={index} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1,
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 1,
                                  backgroundColor: '#f8fafc',
                                  border: `2px solid ${getStageColor(index, chartData.barChart.stageNames.length)}`
                                }}>
                                  <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: getStageColor(index, chartData.barChart.stageNames.length)
                                  }} />
                                  <Typography variant="body2" sx={{ 
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: '#374151'
                                  }}>
                                    {stageName.replace(/Total_|_Pending/g, '').replace(/_/g, ' ')}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          
                          {/* Region data breakdown */}
                          <Box>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              mb: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Regions & Total Cases
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0.5 }}>
                              {chartData.barChart.data.map((entry, index) => (
                                <Box key={index} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  borderRadius: 2,
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#374151',
                                    flex: 1
                                  }}>
                                    {entry.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#059669',
                                    minWidth: '60px',
                                    textAlign: 'right'
                                  }}>
                                    {entry.Total_Pipeline || 0} cases
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </>
                      ) : (
                        // Show region/stage legend for non-stacked bars
                        chartData.barChart.data.map((entry, index) => (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: '#f8fafc',
                            borderLeft: `3px solid ${entry.fill || getStageColor(index, chartData.barChart.data.length)}`
                          }}>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#374151'
                            }}>
                              {dataType === 'pipeline' ? (entry.region || entry.name) : entry.region}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {dataType === 'pipeline' ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                  <Typography variant="body2" sx={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151'
                                  }}>
                                    {entry.value} cases
                                  </Typography>
                                  {entry.stage && (
                                    <Typography variant="caption" sx={{ 
                                      fontSize: '0.75rem',
                                      color: '#6b7280'
                                    }}>
                                      {entry.stage}
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <>
                                  <Typography variant="body2" sx={{ 
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                  }}>
                                    {entry.count} branches
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: entry.avgScore === -1.0 ? '#dc2626' : '#374151',
                                    minWidth: '40px',
                                    textAlign: 'right'
                                  }}>
                                    {entry.avgScore}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        ))
                      )}
                    </Box>
                  )}
                  
                  {/* Simple Legend for RM Performance */}
                  {chartData.barChart.isTargetVsAchievement && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      gap: 4,
                      px: 2,
                      py: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: '#d1d5db',
                          borderRadius: 1,
                          border: '1px solid #9ca3af'
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          Target
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: '#059669',
                          borderRadius: 1,
                          border: '1px solid #047857'
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          Achievement
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Branch Performance - Worst Performing Branches */}
        {chartData.branchChart && chartData.branchChart.data && chartData.branchChart.data.length > 0 && (
          <Box sx={{ 
            flex: '1 1 100%',
            minWidth: 0,
            maxWidth: '100%'
          }}>
            <Card sx={{ 
              height: '100%', 
              minHeight: 600,
              border: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                  px: 3, 
                  py: 2.5, 
                  borderBottom: '1px solid #f1f5f9',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%)'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#dc2626',
                    fontSize: '1.125rem'
                  }}>
                    {chartData.branchChart.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    mt: 0.5,
                    fontSize: '0.875rem'
                  }}>
                    {chartData.branchChart.totalCount ? 
                      `Showing top 25 of ${chartData.branchChart.totalCount} branches requiring attention` :
                      'Individual branch performance requiring immediate attention'
                    }
                  </Typography>
                </Box>
                
                {/* Chart */}
                <Box sx={{ 
                  flex: 1, 
                  p: 1,
                  py:2,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ width: '100%', height: 400, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.branchChart.data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
                            fontSize: 10, 
                            fill: '#6b7280',
                            fontWeight: 500
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#6b7280',
                            fontWeight: 500
                          }}
                          domain={[-1.1, 0]}
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                          formatter={(value, name) => [
                            `Score: ${value}`,
                            'Performance Score'
                          ]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              const data = payload[0].payload;
                              return `${data.fullName} (${data.region}, ${data.state})`;
                            }
                            return label;
                          }}
                        />
                        <Bar 
                          dataKey="score" 
                          radius={[4, 4, 0, 0]}
                        >
                          {chartData.branchChart.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  {/* Custom Legend with Details */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1.5,
                    px: 3,
                    maxHeight: 200,
                    overflowY: 'auto'
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      color: '#374151',
                      mb: 1
                    }}>
                      Branch Details
                    </Typography>
                    {chartData.branchChart.data.slice(0, 10).map((entry, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: '#fef2f2',
                        borderLeft: `3px solid ${entry.fill}`
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#374151'
                          }}>
                            {entry.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            {entry.region} • {entry.state}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#dc2626',
                          minWidth: '40px',
                          textAlign: 'right'
                        }}>
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
      </Box>

      {/* 3. Regional Performance Summary */}
      {regionalSummary.length > 0 && (
        <Card sx={{ border: '1px solid #e0e0e0', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#374151' }}>
              Regional Performance Summary
            </Typography>
            <Grid container spacing={3}>
              {regionalSummary.map((region, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ 
                    border: '1px solid #e5e7eb',
                    backgroundColor: region.averageScore < -0.5 ? '#fef2f2' : '#f8fafc',
                    borderLeft: `4px solid ${region.averageScore < -0.5 ? '#ef4444' : '#0078d7'}`
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: '#374151',
                        mb: 1
                      }}>
                        {region.region}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Branches:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {region.branchCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Avg Score:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          color: region.averageScore < -0.5 ? '#ef4444' : '#10b981'
                        }}>
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

      {/* 4. Analysis Insights */}
      {analysisResult?.analysis_result?.analysis && (
        <Card sx={{ mb: 3, border: '1px solid #e3f2fd' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 48,
                height: 48,
                backgroundColor: '#0078d7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h6">💡</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#0078d7' }}>
                  Analysis Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Key findings from your data
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analysisResult.analysis_result.analysis.map((insight, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Box sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#0078d7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.5
                  }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      {index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
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
        <MenuItem onClick={() => { exportToCSV(); handleExportClose(); }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { exportToJSON(); handleExportClose(); }}>
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { exportToExcel(); handleExportClose(); }}>
          <ListItemIcon>
            <FileDownload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>

      {/* Success/Error Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DynamicDataVisualization;
