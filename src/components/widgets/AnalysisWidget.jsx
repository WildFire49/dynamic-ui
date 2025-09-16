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
  IconButton
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
  DataObject as DataObjectIcon
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
    
    // Find categorical fields for charts
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
    const firstItem = supportingData[0];
    Object.keys(firstItem).forEach(key => {
      const values = supportingData.map(item => item[key]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        // Add average statistic
        stats.push({
          title: `Avg ${key.replace(/_/g, ' ').toUpperCase()}`,
          value: avg.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          trend: '+5%'
        });
        
        // Add range information if space allows
        if (stats.length < 4) {
          stats.push({
            title: `${key.replace(/_/g, ' ').toUpperCase()} Range`,
            value: `${min} - ${max}`,
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
        
        if (summary.full_matches) chartData.push({ name: 'Matches', value: summary.full_matches, color: '#10b981' });
        if (summary.mismatches) chartData.push({ name: 'Mismatches', value: summary.mismatches, color: '#f59e0b' });
        if (summary.missing_in_xmm) chartData.push({ name: 'Missing XMM', value: summary.missing_in_xmm, color: '#ef4444' });
        if (summary.missing_in_ktp) chartData.push({ name: 'Missing KTP', value: summary.missing_in_ktp, color: '#8b5cf6' });
        if (summary.missing_in_sam) chartData.push({ name: 'Missing SAM', value: summary.missing_in_sam, color: '#06b6d4' });
        if (summary.data_breaks) chartData.push({ name: 'Data Breaks', value: summary.data_breaks, color: '#f97316' });
        
        if (chartData.length > 0) {
          charts.push({
            type: 'donut',
            title: `${formatPairName(key)} Analysis`,
            data: chartData
          });
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

    Object.keys(result).forEach(key => {
      const item = result[key];
      if (item.summary) {
        totalMatches += item.summary.full_matches || 0;
        totalMismatches += item.summary.mismatches || 0;
        totalMissingRecords += (item.summary.missing_in_xmm || 0) + (item.summary.missing_in_ktp || 0) + (item.summary.missing_in_sam || 0);
        totalDataBreaks += item.summary.data_breaks || 0;
      }
    });

    const totalRecords = totalMatches + totalMismatches + totalMissingRecords;
    const matchRate = totalRecords > 0 ? (totalMatches / totalRecords * 100) : 0;

    return [
      {
        title: 'Match Rate',
        value: `${matchRate.toFixed(1)}%`,
        icon: CheckCircleIcon,
        color: matchRate > 80 ? theme.palette.success.main : matchRate > 60 ? theme.palette.warning.main : theme.palette.error.main,
        trend: matchRate > 80 ? '+2%' : '-5%'
      },
      {
        title: 'Total Records',
        value: totalRecords.toLocaleString(),
        icon: AssessmentIcon,
        color: theme.palette.primary.main,
        trend: '+8%'
      },
      {
        title: 'Mismatches',
        value: totalMismatches.toLocaleString(),
        icon: ErrorIcon,
        color: theme.palette.error.main,
        trend: totalMismatches > 0 ? '+3%' : '0%'
      },
      {
        title: 'Data Breaks',
        value: totalDataBreaks.toLocaleString(),
        icon: WarningIcon,
        color: theme.palette.warning.main,
        trend: totalDataBreaks > 0 ? '+1%' : '0%'
      }
    ];
  };

  const generateReconciliationTables = (result) => {
    const tables = [];
    
    Object.keys(result).forEach(key => {
      const item = result[key];
      const formattedName = formatPairName(key);
      
      // Add fully matched records table FIRST (limit to first 10 for performance)
      if (item.fully_matched_records && Array.isArray(item.fully_matched_records) && item.fully_matched_records.length > 0) {
        const limitedMatches = item.fully_matched_records.slice(0, 10);
        tables.push({
          title: `${formattedName} - Fully Matched Records (${item.fully_matched_records.length} total)`,
          data: limitedMatches.map(record => {
            const flatRecord = { key_ref: record.key_ref };
            
            // Flatten nested details
            if (record.ktp_details) {
              Object.keys(record.ktp_details).forEach(k => {
                flatRecord[`ktp_${k}`] = record.ktp_details[k];
              });
            }
            if (record.xmm_details) {
              Object.keys(record.xmm_details).forEach(k => {
                flatRecord[`xmm_${k}`] = record.xmm_details[k];
              });
            }
            if (record.sam_details) {
              Object.keys(record.sam_details).forEach(k => {
                flatRecord[`sam_${k}`] = record.sam_details[k];
              });
            }
            
            return flatRecord;
          })
        });
      }
      
      // Add mismatched records table
      if (item.mismatched_records && Array.isArray(item.mismatched_records) && item.mismatched_records.length > 0) {
        const mismatchedTableData = [];
        
        item.mismatched_records.forEach(record => {
          if (record.discrepancies && Array.isArray(record.discrepancies)) {
            record.discrepancies.forEach(discrepancy => {
              mismatchedTableData.push({
                key_ref: record.key_ref,
                mismatch_type: discrepancy.mismatch_type || record.mismatch_summary,
                xmm_value: discrepancy.xmm_value || discrepancy.ktp_value || 'N/A',
                sam_value: discrepancy.sam_value || discrepancy.xmm_value || 'N/A'
              });
            });
          } else {
            // Fallback for records without detailed discrepancies
            mismatchedTableData.push({
              key_ref: record.key_ref,
              mismatch_type: record.mismatch_summary || 'Mismatch',
              xmm_value: 'N/A',
              sam_value: 'N/A'
            });
          }
        });
        
        tables.push({
          title: `${formattedName} - Mismatched Records`,
          data: mismatchedTableData,
          type: 'mismatched_records' // Add type for special handling
        });
      }
      
      // Add missing records table  
      const missingRecords = [];
      if (item.missing_records?.missing_in_xmm) {
        item.missing_records.missing_in_xmm.forEach(record => {
          missingRecords.push({
            reference: record.ktp_sender_ref || record.xmm_ref || 'N/A',
            missing_in: 'XMM',
            details: record.details
          });
        });
      }
      if (item.missing_records?.missing_in_ktp) {
        item.missing_records.missing_in_ktp.forEach(record => {
          missingRecords.push({
            reference: record.xmm_ref || record.ktp_sender_ref || 'N/A', 
            missing_in: 'KTP',
            details: record.details
          });
        });
      }
      if (item.missing_records?.missing_in_sam) {
        item.missing_records.missing_in_sam.forEach(record => {
          missingRecords.push({
            reference: record.xmm_ref || record.sam_ref || 'N/A',
            missing_in: 'SAM', 
            details: record.details
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
    console.log('🔍 [DEBUG] AnalysisWidget received data:', JSON.stringify(data, null, 2));
    
    if (!data) {
      console.log('🔍 [DEBUG] No data provided to AnalysisWidget');
      return null;
    }

    // Handle supporting_data structure (primary use case)
    if (data.response?.analysis_result?.supporting_data) {
      console.log('🔍 [DEBUG] Processing supporting_data structure');
      const supportingData = data.response.analysis_result.supporting_data;
      const question = data.response.question || 'Data Analysis';
      // Remove question marks and clean up the title
      const cleanTitle = question.replace(/\?+$/, '').trim();
      
      return {
        type: 'supporting_data',
        title: cleanTitle,
        totalRecords: supportingData.length,
        data: supportingData,
        charts: generateChartsFromData(supportingData),
        stats: generateStatsFromData(supportingData),
        tables: [{ title: 'Detailed Results', data: supportingData }]
      };
    }

    // Handle reconciliation data structure (secondary use case)
    const result = data.result || data.response?.result;
    console.log('🔍 [DEBUG] Checking reconciliation result:', result);
    
    if (result && typeof result === 'object') {
      console.log('🔍 [DEBUG] Processing reconciliation data structure');
      const charts = generateReconciliationCharts(result);
      const stats = generateReconciliationStats(result);
      const tables = generateReconciliationTables(result);
      
      console.log('🔍 [DEBUG] Generated charts:', charts.length);
      console.log('🔍 [DEBUG] Generated stats:', stats.length);
      console.log('🔍 [DEBUG] Generated tables:', tables.length);
      
      return {
        type: 'reconciliation',
        title: 'Reconciliation Analysis',
        data: result,
        charts: charts,
        stats: stats,
        tables: tables
      };
    }

    console.log('🔍 [DEBUG] No matching data structure found');
    return null;
  }, [data, theme]);

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
          {finalAnalysis.title}
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
          
          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {finalAnalysis.stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ 
                  animation: `${slideIn} 0.6s ease-out ${0.1 * index}s both`,
                  height: '200px',
                  display: 'flex',
                  width: '100%',
                  minWidth: '250px' // Ensure minimum width for content
                }}>
                  <StatCard {...stat} index={index} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

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
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              {finalAnalysis.charts
                .sort((a, b) => {
                  // Prioritize KTP vs XMM vs SAM Analysis to render first
                  if (a.title && a.title.includes('KTP vs XMM vs SAM')) return -1;
                  if (b.title && b.title.includes('KTP vs XMM vs SAM')) return 1;
                  return 0;
                })
                .map((chart, index) => (
                <Grid item xs={12} md={6} lg={6} key={index}>
                  <Box sx={{ 
                    animation: `${slideIn} 0.6s ease-out ${0.2 * index + 0.5}s both`,
                    height: '500px', // Increased height for better chart rendering
                    display: 'flex',
                    width: '100%'
                  }}>
                    <InteractiveChart {...chart} index={index} height={450} />
                  </Box>
                </Grid>
              ))}
            </Grid>
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
              Detailed Data
            </Typography>
            
            {finalAnalysis.tables.map((table, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                {/* Table Header with Audit Report Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {table.title}
                  </Typography>
                  {table.type === 'mismatched_records' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
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

export default AnalysisWidget;
