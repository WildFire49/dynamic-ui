import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Download } from '@mui/icons-material';

const RMComparisonChart = ({ 
  selectedRMs, 
  analysisResult, 
  onSaveToDashboard 
}) => {
  // Get selected RM data for chart
  const getSelectedRMData = () => {
    console.log('RMComparisonChart Debug:');
    console.log('selectedRMs:', selectedRMs);
    console.log('analysisResult:', analysisResult);
    console.log('supporting_data:', analysisResult?.analysis_result?.supporting_data);
    
    if (!analysisResult?.analysis_result?.supporting_data || selectedRMs.length === 0) {
      console.log('No data or no selected RMs');
      return [];
    }

    const allRMs = analysisResult.analysis_result.supporting_data;
    console.log('All RMs data:', allRMs);
    console.log('First RM structure:', allRMs[0]);

    const filteredRMs = allRMs.filter(rm => {
      const rmId = rm.RM_ID || rm['R M I D'] || rm.id;
      // Convert both to strings for comparison to handle type mismatches
      const rmIdStr = String(rmId);
      const isSelected = selectedRMs.some(selectedId => String(selectedId) === rmIdStr);
      console.log('Checking RM ID:', rmId, '(as string:', rmIdStr, ') against selected:', selectedRMs, 'isSelected:', isSelected);
      return isSelected;
    });
    
    console.log('Filtered RMs:', filteredRMs);

    const chartData = filteredRMs.map(rm => {
      const target = parseFloat(rm.Disbursement_Target || rm.Collection_Target_Lakhs || rm.DB_Tar || rm.D_B_Target || rm['D B Target'] || rm.target || 0);
      const achievement = parseFloat(rm.Disbursement_Achieved || rm.Collection_Achieved_Lakhs || rm.DB_Ach || rm.D_B_Achievement || rm['D B Achievement'] || rm.achievement || 0);
      const achievementRate = target > 0 ? ((achievement / target) * 100) : 0;
      
      const fullName = rm.RM_Name || rm['R M Name'] || rm.name || 'Unknown RM';
      const rmData = {
        name: fullName.length > 15 ? fullName.substring(0, 15) + '...' : fullName,
        fullName: fullName,
        target,
        achievement,
        achievementRate,
        fill: achievementRate > 0 ? '#059669' : '#dc2626'
      };
      
      console.log('Processed RM data:', rmData);
      return rmData;
    });
    
    console.log('Final chart data:', chartData);
    return chartData;
  };

  const chartData = getSelectedRMData();

  if (selectedRMs.length === 0) {
    return (
      <Card sx={{ 
        mt: 3,
        border: 'none',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            RM Performance Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select RMs from the lists above to view their performance comparison.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card sx={{ 
        mt: 3,
        border: 'none',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            RM Performance Comparison ({selectedRMs.length} RMs)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data available for the selected RMs. Please check the data source.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      mt: 3,
      border: 'none',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderRadius: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            RM Performance Comparison ({selectedRMs.length} RMs)
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={onSaveToDashboard}
            size="small"
            sx={{ minWidth: '140px' }}
          >
            Save to Dashboard
          </Button>
        </Box>
        
        <Box sx={{ width: '100%', height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Achievement %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Achievement Rate']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullName;
                  }
                  return label;
                }}
              />
              <Bar dataKey="achievementRate" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Stats */}
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          justifyContent: 'space-around',
          backgroundColor: '#f8fafc',
          borderRadius: 2,
          p: 1
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {chartData.reduce((sum, rm) => sum + rm.target, 0).toFixed(1)}L
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Target
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669' }}>
              {chartData.reduce((sum, rm) => sum + rm.achievement, 0).toFixed(1)}L
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Achievement
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>
              {chartData.length > 0 ? (
                (chartData.reduce((sum, rm) => sum + rm.achievementRate, 0) / chartData.length).toFixed(1)
              ) : 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. Achievement Rate
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RMComparisonChart;
