import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Fade,
  alpha,
  useTheme,
  Button,
  IconButton,
  Paper
} from '@mui/material';
import { keyframes } from '@mui/system';
import DownloadIcon from '@mui/icons-material/Download';
import ReviewsIcon from '@mui/icons-material/Reviews';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  Analytics as AnalyticsIcon,
  DataObject as DataObjectIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import InteractiveChart from './InteractiveChart';
import StatCard from './StatCard';
import EnhancedDataGrid from './EnhancedDataGrid';
import ReviewPopover from './ReviewPopover';
import useReviewStore from '../../lib/stores/reviewStore';
import { generateAuditReport } from '../../utils/csvExport';

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

const AnalysisWidget = ({ data, analysis, onSave, title = 'Analysis Results' }) => {
  const theme = useTheme();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [reviewPopover, setReviewPopover] = useState({ open: false, anchorEl: null, recordData: null, tableName: '' });
  const { getTableReviews } = useReviewStore();
  const [currentSection, setCurrentSection] = useState(0);
  
  // Review handlers
  const handleOpenReview = (event, recordData, tableName) => {
    setReviewPopover({
      open: true,
      anchorEl: event.currentTarget,
      recordData,
      tableName
    });
  };
  
  const handleCloseReview = () => {
    setReviewPopover({ open: false, anchorEl: null, recordData: null, tableName: '' });
  };
  
  const handleGenerateAuditReport = (tableName, tableData) => {
    const reviews = getTableReviews(tableName);
    const filename = generateAuditReport(tableName, tableData, reviews);
    // You could show a success message here
    console.log(`Audit report generated: ${filename}`);
  };

  const handleDownloadTable = (tableName, tableData) => {
    if (!tableData || tableData.length === 0) return;
    
    // Get column headers from the first row
    const headers = Object.keys(tableData[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...tableData.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : String(value || '');
        }).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  useEffect(() => {
    // Staggered section animations
    const timer = setInterval(() => {
      setCurrentSection(prev => prev + 1);
    }, 500);
    
    setTimeout(() => clearInterval(timer), 2000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions - defined before useMemo to avoid hoisting issues
  // Helper function to format reconciliation pair names properly
  const formatPairName = (key) => {
    // Handle specific patterns: KTP_vs_XMM -> KTP vs XMM, XMM_vs_SAM -> XMM vs SAM, etc.
    return key.replace(/_vs_/g, ' vs ').replace(/_/g, ' ');
  };

  const generateChartsFromData = (supportingData) => {
    if (!supportingData || !Array.isArray(supportingData) || supportingData.length === 0) return [];
    
    const charts = [];
    const firstItem = supportingData[0];
    const allKeys = Object.keys(firstItem);
    
    // Check if this is pipeline data
    const pipelineFields = allKeys.filter(key => key.includes('_Pending'));
    const hasTotalPipeline = allKeys.includes('Total_Pipeline');
    
    if (pipelineFields.length > 3 && hasTotalPipeline) {
      console.log('🔍 [ANALYSIS] Detected pipeline data, generating pipeline charts');
      
      // 1. Total Pipeline by Region (Bar Chart)
      const regionData = supportingData.map((item, index) => {
        const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
        return {
          name: item.Region_Name || `Region ${index + 1}`,
          value: item.Total_Pipeline || 0,
          color: colors[index % colors.length]
        };
      });
      
      charts.push({
        type: 'bar',
        title: 'Total Pipeline by Region',
        data: regionData
      });
      
      // 2. Pipeline Stages Distribution (Pie Chart)
      let stageData = [];
      pipelineFields.forEach((stage, index) => {
        const stageTotal = supportingData.reduce((sum, item) => sum + (item[stage] || 0), 0);
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
        if (stageTotal > 0) {
          stageData.push({
            name: stage.replace(/_Pending/g, '').replace(/_/g, ' '),
            value: stageTotal,
            color: colors[index % colors.length]
          });
        }
      });
      
      if (stageData.length > 0) {
        charts.push({
          type: 'pie',
          title: 'Pipeline Stages Distribution',
          data: stageData
        });
      }
      
      return charts;
    }
    
    // Check if this is branch collection data
    const hasBranches = allKeys.includes('Branches_afer_merger') || allKeys.includes('Branches_after_merger');
    const hasRegion = allKeys.includes('Region');
    const hasState = allKeys.includes('State');
    const hasCollectionPercentage = allKeys.includes('Collection_Percentage');
    
    if (hasBranches && hasRegion && hasState && hasCollectionPercentage) {
      console.log('🔍 [ANALYSIS] Detected branch collection data, generating collection charts');
      
      // 1. State Distribution (Pie Chart)
      const stateData = {};
      supportingData.forEach(item => {
        const state = item.State;
        if (state && state !== 'NULL') {
          stateData[state] = (stateData[state] || 0) + 1;
        }
      });
      
      const stateChartData = Object.entries(stateData).map(([state, count], index) => {
        const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
        return {
          name: state,
          value: count,
          color: colors[index % colors.length]
        };
      });
      
      charts.push({
        type: 'pie',
        title: 'STATE Distribution',
        data: stateChartData
      });
      
      // 2. Region Distribution (Donut Chart)
      const regionData = {};
      supportingData.forEach(item => {
        const region = item.Region?.trim();
        if (region && region !== 'NULL') {
          regionData[region] = (regionData[region] || 0) + 1;
        }
      });
      
      const regionChartData = Object.entries(regionData).map(([region, count], index) => {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#64748b'];
        return {
          name: region,
          value: count,
          color: colors[index % colors.length]
        };
      });
      
      charts.push({
        type: 'donut',
        title: 'REGION Distribution',
        data: regionChartData
      });
      
      // 3. Top Performing Branches (Bar Chart)
      const validBranches = supportingData
        .filter(item => item.Collection_Percentage !== null && item.Collection_Percentage !== 'NULL' && !isNaN(item.Collection_Percentage))
        .sort((a, b) => (b.Collection_Percentage || 0) - (a.Collection_Percentage || 0))
        .slice(0, 10); // Top 10 branches
      
      const branchChartData = validBranches.map((item, index) => {
        const colors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#ec4899'];
        return {
          name: item.Branches_afer_merger || item.Branches_after_merger || 'Unknown',
          value: Math.round((item.Collection_Percentage || 0) * 100) / 100,
          color: colors[index % colors.length]
        };
      });
      
      if (branchChartData.length > 0) {
        charts.push({
          type: 'bar',
          title: 'TOP Performing Branches (Collection %)',
          data: branchChartData
        });
      }
      
      // 4. Collection Performance by State (Area Chart)
      const statePerformance = {};
      supportingData.forEach(item => {
        const state = item.State;
        const collectionPct = item.Collection_Percentage;
        if (state && state !== 'NULL' && collectionPct !== null && collectionPct !== 'NULL' && !isNaN(collectionPct)) {
          if (!statePerformance[state]) {
            statePerformance[state] = [];
          }
          statePerformance[state].push(collectionPct);
        }
      });
      
      const stateAvgData = Object.entries(statePerformance).map(([state, percentages], index) => {
        const avgPercentage = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;
        const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
        return {
          name: state,
          value: Math.round(avgPercentage * 100) / 100,
          color: colors[index % colors.length]
        };
      });
      
      if (stateAvgData.length > 0) {
        charts.push({
          type: 'area',
          title: 'AVERAGE Collection % by State',
          data: stateAvgData
        });
      }
      
      return charts;
    }
    
    // Original logic for other data types
    Object.keys(firstItem).forEach(key => {
      const values = supportingData.map(item => item[key]).filter(v => v !== null && v !== undefined);
      const uniqueValues = [...new Set(values)];
      
      // Create charts for categorical data with reasonable number of categories
      if (uniqueValues.length > 1 && uniqueValues.length <= 10 && typeof firstItem[key] !== 'number') {
        const chartData = uniqueValues.map((value, index) => {
          const count = values.filter(v => v === value).length;
          const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
          return {
            name: String(value),
            value: count,
            color: colors[index % colors.length]
          };
        });
        
        charts.push({
          type: 'pie',
          title: `${formatPairName(key).toUpperCase()} Distribution`,
          data: chartData
        });
      }
    });

    return charts.slice(0, 2); // Limit to 2 charts for clean layout
  };

  const generateStatsFromData = (supportingData) => {
    if (!supportingData || !Array.isArray(supportingData) || supportingData.length === 0) return [];
    
    const firstItem = supportingData[0];
    const allKeys = Object.keys(firstItem);
    
    // Check if this is pipeline data
    const pipelineFields = allKeys.filter(key => key.includes('_Pending'));
    const hasTotalPipeline = allKeys.includes('Total_Pipeline');
    
    if (pipelineFields.length > 3 && hasTotalPipeline) {
      // Pipeline-specific statistics
      const totalPipeline = supportingData.reduce((sum, item) => sum + (item.Total_Pipeline || 0), 0);
      const avgPipelinePerRegion = totalPipeline / supportingData.length;
      const maxPipeline = Math.max(...supportingData.map(item => item.Total_Pipeline || 0));
      
      // Find biggest bottleneck stage
      let maxStageTotal = 0;
      let bottleneckStage = '';
      pipelineFields.forEach(stage => {
        const stageTotal = supportingData.reduce((sum, item) => sum + (item[stage] || 0), 0);
        if (stageTotal > maxStageTotal) {
          maxStageTotal = stageTotal;
          bottleneckStage = stage.replace(/_Pending/g, '').replace(/_/g, ' ');
        }
      });
      
      return [
        {
          title: 'Total Pipeline',
          value: totalPipeline.toLocaleString(),
          icon: AssessmentIcon,
          color: theme.palette.primary.main,
          trend: '+8%'
        },
        {
          title: 'Active Regions',
          value: supportingData.length.toLocaleString(),
          icon: AnalyticsIcon,
          color: theme.palette.info.main,
          trend: '100%'
        },
        {
          title: 'Avg Pipeline/Region',
          value: Math.round(avgPipelinePerRegion).toLocaleString(),
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          trend: '+5%'
        },
        {
          title: `Top Bottleneck`,
          value: `${bottleneckStage} (${maxStageTotal})`,
          icon: WarningIcon,
          color: theme.palette.warning.main,
          trend: '-3%'
        }
      ];
    }
    
    // Check if this is branch collection data
    const hasBranches = allKeys.includes('Branches_afer_merger') || allKeys.includes('Branches_after_merger');
    const hasRegion = allKeys.includes('Region');
    const hasState = allKeys.includes('State');
    const hasCollectionPercentage = allKeys.includes('Collection_Percentage');
    
    if (hasBranches && hasRegion && hasState && hasCollectionPercentage) {
      // Branch collection-specific statistics
      const validCollections = supportingData.filter(item => 
        item.Collection_Percentage !== null && 
        item.Collection_Percentage !== 'NULL' && 
        !isNaN(item.Collection_Percentage)
      );
      
      const totalBranches = supportingData.length;
      const avgCollectionPct = validCollections.length > 0 
        ? validCollections.reduce((sum, item) => sum + item.Collection_Percentage, 0) / validCollections.length 
        : 0;
      
      const maxCollection = validCollections.length > 0 
        ? Math.max(...validCollections.map(item => item.Collection_Percentage)) 
        : 0;
      const minCollection = validCollections.length > 0 
        ? Math.min(...validCollections.map(item => item.Collection_Percentage)) 
        : 0;
      
      // Count unique states and regions
      const uniqueStates = [...new Set(supportingData.map(item => item.State).filter(s => s && s !== 'NULL'))];
      const uniqueRegions = [...new Set(supportingData.map(item => item.Region?.trim()).filter(r => r && r !== 'NULL'))];
      
      // Find top performing branch
      const topBranch = validCollections.reduce((max, item) =>
        item.Collection_Percentage > (max.Collection_Percentage || 0) ? item : max, 
        { Collection_Percentage: 0 }
      );
      
      return [
        {
          title: 'Total Records',
          value: totalBranches.toLocaleString(),
          icon: AssessmentIcon,
          color: theme.palette.primary.main,
          trend: '+0%'
        },
        {
          title: 'States',
          value: uniqueStates.length.toLocaleString(),
          icon: AnalyticsIcon,
          color: theme.palette.info.main,
          trend: '100%'
        },
        {
          title: 'Avg Collection Percentage',
          value: `${Math.round(avgCollectionPct * 100) / 100}%`,
          icon: TrendingUpIcon,
          color: avgCollectionPct > 20 ? theme.palette.success.main : theme.palette.warning.main,
          trend: avgCollectionPct > 15 ? '+5%' : '-2%'
        },
        {
          title: 'Collection Percentage Range',
          value: `${Math.round(minCollection * 100) / 100} - ${Math.round(maxCollection * 100) / 100}%`,
          icon: WarningIcon,
          color: theme.palette.error.main,
          trend: maxCollection > 40 ? '+15%' : '-5%'
        }
      ];
    }
    
    // Default statistics for non-pipeline data
    const stats = [
      {
        title: 'Total Records',
        value: supportingData.length.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: '+0%'
      }
    ];

    // Find numeric fields for additional statistics
    Object.keys(firstItem).forEach(key => {
      const values = supportingData.map(item => item[key]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        // Format large numbers appropriately
        const formatLargeNumber = (num) => {
          if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
          } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
          } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
          } else {
            return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }
        };

        // Add average statistic
        stats.push({
          title: `Avg ${key.replace(/_/g, ' ').toUpperCase()}`,
          value: formatLargeNumber(avg),
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          trend: '+5%'
        });
        
        // Add range information if space allows
        if (stats.length < 4) {
          stats.push({
            title: `${key.replace(/_/g, ' ').toUpperCase()} Range`,
            value: `${formatLargeNumber(min)} - ${formatLargeNumber(max)}`,
            icon: AnalyticsIcon,
            color: theme.palette.info.main,
            trend: '±12%'
          });
        }
      }
    });

    return stats.slice(0, 4); // Limit to 4 stats for grid layout
  };

  const generateReconciliationCharts = (result) => {
    const charts = [];
    
    Object.keys(result).forEach(key => {
      const item = result[key];
      if (item.summary) {
        const summary = item.summary;
        const chartData = [];
        
        // Handle new API format
        if (summary.total_matches !== undefined) {
          if (summary.total_matches) chartData.push({ name: 'Total Matches', value: summary.total_matches, color: '#10b981' });
          if (summary.total_mismatches) chartData.push({ name: 'Total Mismatches', value: summary.total_mismatches, color: '#f59e0b' });
          if (summary.reference_matches) chartData.push({ name: 'Reference Matches', value: summary.reference_matches, color: '#22c55e' });
          if (summary.detailed_field_matches) chartData.push({ name: 'Field Matches', value: summary.detailed_field_matches, color: '#16a34a' });
          
          // Specific mismatch types
          if (summary.message_type_mismatches) chartData.push({ name: 'Message Type Mismatches', value: summary.message_type_mismatches, color: '#ef4444' });
          if (summary.amount_mismatches) chartData.push({ name: 'Amount Mismatches', value: summary.amount_mismatches, color: '#dc2626' });
          if (summary.bic_mismatches) chartData.push({ name: 'BIC Mismatches', value: summary.bic_mismatches, color: '#b91c1c' });
        }
        // Handle legacy API format
        else {
          if (summary.full_matches) chartData.push({ name: 'Matches', value: summary.full_matches, color: '#10b981' });
          if (summary.mismatches) chartData.push({ name: 'Mismatches', value: summary.mismatches, color: '#f59e0b' });
          if (summary.missing_in_xmm) chartData.push({ name: 'Missing XMM', value: summary.missing_in_xmm, color: '#ef4444' });
          if (summary.missing_in_ktp) chartData.push({ name: 'Missing KTP', value: summary.missing_in_ktp, color: '#8b5cf6' });
          if (summary.missing_in_sam) chartData.push({ name: 'Missing SAM', value: summary.missing_in_sam, color: '#06b6d4' });
          if (summary.data_breaks) chartData.push({ name: 'Data Breaks', value: summary.data_breaks, color: '#f97316' });
        }
        
        if (chartData.length > 0) {
          charts.push({
            type: 'donut',
            title: `${formatPairName(key)} Analysis`,
            data: chartData
          });
        }

        // Add specific mismatch breakdown chart
        if (summary.total_mismatches > 0) {
          const mismatchData = [];
          if (summary.message_type_mismatches) {
            mismatchData.push({ 
              name: 'Message Type Mismatches', 
              value: summary.message_type_mismatches, 
              color: '#ef4444' 
            });
          }
          if (summary.amount_mismatches) {
            mismatchData.push({ 
              name: 'Amount Mismatches', 
              value: summary.amount_mismatches, 
              color: '#dc2626' 
            });
          }
          if (summary.bic_mismatches) {
            mismatchData.push({ 
              name: 'BIC Mismatches', 
              value: summary.bic_mismatches, 
              color: '#b91c1c' 
            });
          }
          
          if (mismatchData.length > 0) {
            charts.push({
              type: 'donut',
              title: `${formatPairName(key)} - Mismatch Breakdown`,
              data: mismatchData
            });
          }
        }
      }
    });
    
    return charts;
  };

  const generateReconciliationStats = (result) => {
    let totalMatches = 0;
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

    Object.keys(result).forEach(key => {
      const item = result[key];
      if (item.summary) {
        // Handle new API format
        if (item.summary.total_matches !== undefined) {
          totalMatches += item.summary.total_matches || 0;
          totalMismatches += item.summary.total_mismatches || 0;
          
          // Capture specific match and mismatch types
          referenceMatches += item.summary.reference_matches || 0;
          detailedFieldMatches += item.summary.detailed_field_matches || 0;
          messageTypeMismatches += item.summary.message_type_mismatches || 0;
          amountMismatches += item.summary.amount_mismatches || 0;
          bicMismatches += item.summary.bic_mismatches || 0;
          
          // Extra records statistics
          ktpOnlyReferences += item.summary.ktp_only_references || 0;
          xmmOnlyReferences += item.summary.xmm_only_references || 0;
          samOnlyReferences += item.summary.sam_only_references || 0;
          
          // Total record counts
          totalKtpRecords += item.summary.total_ktp_records || 0;
          totalXmmRecords += item.summary.total_xmm_records || 0;
          totalSamRecords += item.summary.total_sam_records || 0;
          
          // Individual record counts
          individualRecordCounts = {
            ktp: item.summary.total_ktp_records || 0,
            xmm: item.summary.total_xmm_records || 0,
            sam: item.summary.total_sam_records || 0
          };
        } 
        // Handle legacy API format
        else {
          // Check for individual record counts first
          if (item.summary.total_ktp_records || item.summary.total_xmm_records || item.summary.total_sam_records) {
            individualRecordCounts = {
              ktp: item.summary.total_ktp_records || 0,
              xmm: item.summary.total_xmm_records || 0,
              sam: item.summary.total_sam_records || 0
            };
          }
          
          totalMatches += item.summary.full_matches || 0;
          totalMismatches += item.summary.mismatches || 0;
          totalMissingRecords += (item.summary.missing_in_xmm || 0) + (item.summary.missing_in_ktp || 0) + (item.summary.missing_in_sam || 0);
          totalDataBreaks += item.summary.data_breaks || 0;
        }
      }
    });

    const totalRecords = totalMatches + totalMismatches + totalMissingRecords;
    const matchRate = totalRecords > 0 ? (totalMatches / totalRecords * 100) : 0;


    return [
      {
        title: 'Total KTP Records',
        value: totalKtpRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: '+0%'
      },
      {
        title: 'Total XMM Records',
        value: totalXmmRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: '+0%'
      },
      {
        title: 'Total SAM Records',
        value: totalSamRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: '+0%'
      },
      {
        title: 'Full Matches',
        value: detailedFieldMatches.toLocaleString(),
        icon: DoneAllIcon,
        color: theme.palette.success.main,
        trend: detailedFieldMatches > 0 ? '+2%' : '0%'
      },
      {
        title: 'Total Mismatches',
        value: totalMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: totalMismatches > 0 ? '+3%' : '0%'
      },
      // {
      //   title: 'Total Matches',
      //   value: totalMatches.toLocaleString(),
      //   icon: DoneAllIcon,
      //   color: theme.palette.success.main,
      //   trend: totalMatches > 0 ? '+1%' : '0%'
      // },
      {
        title: 'Reference ID Matches',
        value: referenceMatches.toLocaleString(),
        icon: CheckCircleIcon,
        color: theme.palette.success.main,
        trend: referenceMatches > 0 ? '+1%' : '0%'
      },
      
      // {
      //   title: 'Match Rate',
      //   value: `${matchRate.toFixed(1)}%`,
      //   icon: CheckCircleIcon,
      //   color: matchRate > 80 ? theme.palette.success.main : matchRate > 60 ? theme.palette.warning.main : theme.palette.error.main,
      //   trend: matchRate > 80 ? '+2%' : '-5%'
      // },
      
      {
        title: 'Message Type Mismatches',
        value: messageTypeMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: messageTypeMismatches > 0 ? '+1%' : '0%'
      },
      {
        title: 'Amount Mismatches',
        value: amountMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: amountMismatches > 0 ? '+1%' : '0%'
      },
      {
        title: 'BIC Mismatches',
        value: bicMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: bicMismatches > 0 ? '+1%' : '0%'
      },
      {
        title: 'KTP Extra Records',
        value: ktpOnlyReferences.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.info.main,
        trend: ktpOnlyReferences > 0 ? '+1%' : '0%'
      },
      {
        title: 'XMM Extra Records',
        value: xmmOnlyReferences.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.info.main,
        trend: xmmOnlyReferences > 0 ? '+1%' : '0%'
      },
      {
        title: 'SAM Extra Records',
        value: samOnlyReferences.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.info.main,
        trend: samOnlyReferences > 0 ? '+1%' : '0%'
      },
    ];
  };

  const generateReconciliationTables = (result) => {
    const tables = [];
    
    Object.keys(result).forEach(key => {
      const item = result[key];
      const formattedName = formatPairName(key);
      
      // Add fully matched references table FIRST
      if (item.fully_matched_references && Array.isArray(item.fully_matched_references) && item.fully_matched_references.length > 0) {
        tables.push({
          title: `${formattedName} - Fully Matched References (${item.fully_matched_references.length} total)`,
          data: item.fully_matched_references.map(record => {
            // Create a flat record with all fields from the API response
            const flatRecord = {};
            
            // Copy all fields dynamically from the record
            Object.keys(record).forEach(fieldKey => {
              const fieldValue = record[fieldKey];
              
              // Handle arrays by joining them
              if (Array.isArray(fieldValue)) {
                flatRecord[fieldKey] = fieldValue.join(', ');
              }
              // Handle objects by stringifying them
              else if (typeof fieldValue === 'object' && fieldValue !== null) {
                flatRecord[fieldKey] = JSON.stringify(fieldValue);
              }
              // Handle primitive values
              else {
                flatRecord[fieldKey] = fieldValue !== undefined && fieldValue !== null ? fieldValue : 'N/A';
              }
            });
            
            return flatRecord;
          })
        });
      }

      // Add fully matched records (detailed) table SECOND
      if (item.fully_matched_records && Array.isArray(item.fully_matched_records) && item.fully_matched_records.length > 0) {
        tables.push({
          title: `${formattedName} - Fully Matched Records Details (${item.fully_matched_records.length} records)`,
          data: item.fully_matched_records
        });
      }
      
      // Add mismatched records table (legacy format)
      if (item.mismatched_records && Array.isArray(item.mismatched_records) && item.mismatched_records.length > 0) {
        const mismatchedTableData = [];
        
        item.mismatched_records.forEach(record => {
          if (record.discrepancies && Array.isArray(record.discrepancies) && record.discrepancies.length > 0) {
            // Handle records with detailed discrepancies
            record.discrepancies.forEach(discrepancy => {
              mismatchedTableData.push({
                key_ref: record.key_ref,
                mismatch_type: discrepancy.mismatch_type || record.mismatch_summary || 'Mismatch',
                xmm_value: discrepancy.xmm_value || discrepancy.ktp_value || 'N/A',
                sam_value: discrepancy.sam_value || discrepancy.xmm_value || 'N/A'
              });
            });
          } else {
            // Handle records without detailed discrepancies or empty discrepancies
            mismatchedTableData.push({
              key_ref: record.key_ref,
              mismatch_type: record.mismatch_summary || 'Mismatch detected',
              mismatch_details: record.mismatch_summary || 'No detailed discrepancies available',
              status: 'Requires Review'
            });
          }
        });
        
        if (mismatchedTableData.length > 0) {
          tables.push({
            title: `${formattedName} - Mismatched Records`,
            data: mismatchedTableData,
            type: 'mismatched_records' // Add type for special handling
          });
        }
      }

      // Add new format mismatched records tables
      // Message Type Mismatches
      if (item.mismatched_message_type_but_same_ref && Array.isArray(item.mismatched_message_type_but_same_ref) && item.mismatched_message_type_but_same_ref.length > 0) {
        tables.push({
          title: `${formattedName} - Message Type Mismatches (${item.mismatched_message_type_but_same_ref.length} records)`,
          data: item.mismatched_message_type_but_same_ref,
          type: 'mismatched_records'
        });
      }

      // Amount Mismatches
      if (item.mismatched_amount_but_same_ref && Array.isArray(item.mismatched_amount_but_same_ref) && item.mismatched_amount_but_same_ref.length > 0) {
        tables.push({
          title: `${formattedName} - Amount Mismatches (${item.mismatched_amount_but_same_ref.length} records)`,
          data: item.mismatched_amount_but_same_ref,
          type: 'mismatched_records'
        });
      }

      // BIC Mismatches
      if (item.mismatched_bic_but_same_ref && Array.isArray(item.mismatched_bic_but_same_ref) && item.mismatched_bic_but_same_ref.length > 0) {
        tables.push({
          title: `${formattedName} - BIC Mismatches (${item.mismatched_bic_but_same_ref.length} records)`,
          data: item.mismatched_bic_but_same_ref,
          type: 'mismatched_records'
        });
      }

      // Extra Records in KTP
      if (item.references_only_in_KTP && Array.isArray(item.references_only_in_KTP) && item.references_only_in_KTP.length > 0) {
        tables.push({
          title: `${formattedName} - Extra Records in KTP (${item.references_only_in_KTP.length} records)`,
          data: item.references_only_in_KTP
        });
      }

      // Extra Records in XMM
      if (item.references_only_in_XMM && Array.isArray(item.references_only_in_XMM) && item.references_only_in_XMM.length > 0) {
        tables.push({
          title: `${formattedName} - Extra Records in XMM (${item.references_only_in_XMM.length} records)`,
          data: item.references_only_in_XMM
        });
      }

      // Extra Records in SAM
      if (item.references_only_in_SAM && Array.isArray(item.references_only_in_SAM) && item.references_only_in_SAM.length > 0) {
        tables.push({
          title: `${formattedName} - Extra Records in SAM (${item.references_only_in_SAM.length} records)`,
          data: item.references_only_in_SAM
        });
      }

      
      // Add missing records table  
      const missingRecords = [];
      if (item.missing_records?.missing_in_xmm && Array.isArray(item.missing_records.missing_in_xmm)) {
        item.missing_records.missing_in_xmm.forEach(record => {
          missingRecords.push({
            reference: record.ktp_sender_ref || record.xmm_ref || 'N/A',
            missing_in: 'XMM',
            details: record.details || 'Record not found in XMM'
          });
        });
      }
      if (item.missing_records?.missing_in_ktp && Array.isArray(item.missing_records.missing_in_ktp)) {
        item.missing_records.missing_in_ktp.forEach(record => {
          missingRecords.push({
            reference: record.xmm_ref || record.ktp_sender_ref || 'N/A', 
            missing_in: 'KTP',
            details: record.details || 'Record not found in KTP'
          });
        });
      }
      if (item.missing_records?.missing_in_sam && Array.isArray(item.missing_records.missing_in_sam)) {
        item.missing_records.missing_in_sam.forEach(record => {
          missingRecords.push({
            reference: record.xmm_ref || record.sam_ref || 'N/A',
            missing_in: 'SAM', 
            details: record.details || 'Record not found in SAM'
          });
        });
      }
      
      if (missingRecords.length > 0) {
        tables.push({
          title: `${formattedName} - Missing Records`,
          data: missingRecords
        });
      }
    });
    
    return tables;
  };

  // Dynamic analysis of API response - now helper functions are defined
  const computedAnalysis = useMemo(() => {
    
    if (!data) {
      return null;
    }

    // Handle supporting_data structure (primary use case) - check both nested and direct structures
    const supportingData = data.response?.analysis_result?.supporting_data || data.analysis_result?.supporting_data;
    const question = data.response?.question || data.question || 'Data Analysis';
    const analysisText = data.response?.analysis_result?.analysis || data.analysis_result?.analysis || data.analysis;
    
    if (supportingData && Array.isArray(supportingData) && supportingData.length > 0) {
      // Remove question marks and clean up the title
      const cleanTitle = question.replace(/\?+$/, '').trim();
      
      return {
        type: 'supporting_data',
        title: cleanTitle,
        totalRecords: supportingData.length,
        data: supportingData,
        analysis: analysisText,
        charts: generateChartsFromData(supportingData),
        stats: generateStatsFromData(supportingData),
        tables: [{ title: 'Detailed Results', data: supportingData }]
      };
    }

    // Handle reconciliation data structure (secondary use case)
    const result = data.result || data.response?.result;
    
    if (result && typeof result === 'object') {
      const charts = generateReconciliationCharts(result);
      const stats = generateReconciliationStats(result);
      const tables = generateReconciliationTables(result);
      
      
      return {
        type: 'reconciliation',
        title: 'Reconciliation Analysis',
        data: result,
        charts: charts,
        stats: stats,
        tables: tables
      };
    }

    return null;
  }, [data, theme]); // Keep simple dependencies to avoid performance issues

  // Use provided analysis prop or computed analysis
  const finalAnalysis = analysis || computedAnalysis;

  const handleSaveToLoginboard = () => {
    if (finalAnalysis && onSave) {
      onSave({
        type: 'analysis_widget',
        title: finalAnalysis.title,
        analysis: finalAnalysis,
        data: data, // Include original data for Dashboard rendering
        timestamp: new Date().toISOString(),
        charts: finalAnalysis.charts,
        stats: finalAnalysis.stats,
        tables: finalAnalysis.tables
      });
      
      // Navigate to dashboard in new tab
      window.open('/dashboard', '_blank');
    }
  };

  if (!finalAnalysis) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`
        }}
      >
        <DataObjectIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No analysis data available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please ensure your query returns supporting_data or reconciliation results
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Save Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${slideIn} 0.8s ease-out`,
            flex: 1,
            minWidth: 0
          }}
        >
          Data Analysis Results
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveToLoginboard}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 40px ${theme.palette.primary.main}60`,
            },
            transition: 'all 0.3s ease',
            animation: `${float} 3s ease-in-out infinite`
          }}
        >
          Save to Dashboard
        </Button>
      </Box>

      {/* Overall Statistics Section */}
      <Fade in={currentSection >= 0} timeout={800}>
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              fontWeight: 700, 
              color: theme.palette.text.primary,
              animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
              textAlign: 'center'
            }}
          >
            Overall Statistics
          </Typography>
          
          <Box sx={{
            width: '100%', // Use full container width
            margin: '0 auto', // Center the container
            padding: '0 8px' // Reduced padding for mobile
          }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { 
                xs: 'repeat(2, 1fr)', // 2 columns on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on small screens
                md: 'repeat(3, 1fr)', // 3 columns on medium screens
                lg: 'repeat(3, 1fr)'  // 3 columns on large screens
              },
              gap: { xs: '12px', sm: '16px', md: '20px' },
              justifyItems: 'center',
              alignItems: 'stretch'
            }}>
              {finalAnalysis.stats.map((stat, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    animation: `${slideIn} 0.6s ease-out ${0.1 * index}s both`,
                    height: { xs: '160px', sm: '180px' },
                    width: '100%',
                    maxWidth: { xs: '180px', sm: '220px', md: '250px' },
                    minWidth: { xs: '140px', sm: '180px', md: '200px' }
                  }}
                >
                  <StatCard {...stat} index={index} />
                </Box>
              ))}
            </Box>
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

      {/* Visual Analytics Section */}
      {finalAnalysis.charts && finalAnalysis.charts.length > 0 && (
        <Fade in={currentSection >= 1} timeout={800}>
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 3, 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                animation: `${fadeInUp} 0.6s ease-out 0.4s both`,
                textAlign: 'center',
                gap: 1
              }}
            >
              Visual Analytics
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              justifyContent: 'center',
              width: '100%'
            }}>
              {finalAnalysis.charts
                .sort((a, b) => {
                  // Prioritize KTP vs XMM vs SAM Analysis to render first
                  if (a.title && a.title.includes('KTP vs XMM vs SAM')) return -1;
                  if (b.title && b.title.includes('KTP vs XMM vs SAM')) return 1;
                  return 0;
                })
                .map((chart, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      animation: `${slideIn} 0.6s ease-out ${0.2 * index + 0.5}s both`,
                      height: '400px',
                      width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(50% - 8px)' },
                      minWidth: { xs: '100%', sm: '300px' },
                      maxWidth: { xs: '100%', sm: '600px' },
                      display: 'flex',
                      overflow: 'hidden', // Prevent content from extending beyond container
                      position: 'relative',
                      '& > div': {
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                      }
                    }}
                  >
                    <InteractiveChart {...chart} index={index} height={350} />
                  </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Detailed Data Section */}
      {finalAnalysis.tables && finalAnalysis.tables.length > 0 && (
        <Fade in={currentSection >= 2} timeout={800}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 3, 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                animation: `${fadeInUp} 0.6s ease-out 0.6s both`,
                textAlign: 'center',
                gap: 1
              }}
            >
              Tabular Results
            </Typography>
            
            {finalAnalysis.tables.map((table, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                {/* Table Header with Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  {/* Hide the secondary table title for supporting_data tables */}
                  {!(table.title === 'Detailed Results' && finalAnalysis.type === 'supporting_data') && (
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {table.title}
                    </Typography>
                  )}
                  
                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Download Table Button - Always show for all tables */}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadTable(table.title, table.data)}
                      sx={{
                        borderColor: theme.palette.success.main,
                        color: theme.palette.success.main,
                        '&:hover': {
                          background: alpha(theme.palette.success.main, 0.1),
                          borderColor: theme.palette.success.main
                        }
                      }}
                    >
                      Download Table
                    </Button>
                    
                    {/* Generate Audit Report Button - Only for mismatched records */}
                    {table.type === 'mismatched_records' && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ReviewsIcon />}
                        onClick={() => handleGenerateAuditReport(table.title, table.data)}
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        Generate Audit Report
                      </Button>
                    )}
                  </Box>
                </Box>
                
                <EnhancedDataGrid
                  title={table.title}
                  data={table.data}
                  type={table.type}
                  onReviewClick={table.type === 'mismatched_records' ? handleOpenReview : undefined}
                  height={400}
                  pageSize={10}
                  index={index}
                />
              </Box>
            ))}
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
