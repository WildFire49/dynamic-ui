"use client";
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  keyframes,
  Paper,
  Typography
} from '@mui/material';
import Image from 'next/image';
import DynamicRenderer from '../../lib/dynamic-ui/DynamicRenderer';

import DataGridComponent from '../charts/DataGridComponent';
import AnalysisResponse from './AnalysisResponse';
import AudioTranslationResponse from './AudioTranslationResponse';
import DataTable from './DataTable';
import DynamicDataVisualization from './DynamicDataVisualization';
import IncentiveRulesResponse from './IncentiveRulesResponse';
import SchedulerResponse from './SchedulerResponse';
import VoiceWaveform from './VoiceWaveform';
import AnalysisWidget from '../widgets/AnalysisWidget';

// Define keyframe animations
const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const popIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// Common styles object
const styles = {
  messageContainer: {
    display: 'flex',
    mb: { xs: 1.5, sm: 2 },
    px: { xs: 0.5, sm: 1, md: 2 },
    maxWidth: '100%',
    width: '100%'
  },
  userMessageContainer: {
    justifyContent: 'flex-end'
  },
  botMessageContainer: {
    justifyContent: 'flex-start'
  },
  userMessage: {
    maxWidth: { xs: '80%', sm: '70%', md: '50%', lg: '25%' }, // Responsive width: wider on mobile
    minWidth: { xs: '100px', sm: '120px' },
    p: { xs: 1.5, sm: 2 },
    borderRadius: { xs: 2.5, sm: 3 },
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#ffffff',
    position: 'relative',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    boxShadow: { xs: '0 2px 12px rgba(25, 118, 210, 0.2)', sm: '0 4px 20px rgba(25, 118, 210, 0.3)' },
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    animation: `${slideInRight} 0.3s ease-out`,
    transition: 'all 0.3s ease',
    fontSize: { xs: '0.875rem', sm: '0.95rem' },
    '&:hover': {
      boxShadow: { xs: '0 3px 16px rgba(25, 118, 210, 0.3)', sm: '0 6px 25px rgba(25, 118, 210, 0.4)' },
      transform: 'translateY(-1px)'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: { xs: '8px', sm: '10px' },
      right: { xs: '-6px', sm: '-8px' },
      width: 0,
      height: 0,
      borderLeft: { xs: '6px solid #1565c0', sm: '8px solid #1565c0' },
      borderTop: { xs: '6px solid transparent', sm: '8px solid transparent' },
      borderBottom: { xs: '6px solid transparent', sm: '8px solid transparent' }
    }
  },
  botMessage: {
    maxWidth: { xs: '99%', sm: '93.5%', md: '77%', lg: '66%' },
    minWidth: { xs: '100px', sm: '130px' },
    p: { xs: 1.5, sm: 2 },
    borderRadius: { xs: 1.5, sm: 2 },
    backgroundColor: '#f5f5f5',
    color: 'inherit',
    position: 'relative',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    boxShadow: { xs: '0 1px 6px rgba(0,0,0,0.08)', sm: '0 2px 8px rgba(0,0,0,0.1)' },
    animation: `${popIn} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
    transition: 'all 0.3s ease',
    fontSize: { xs: '0.875rem', sm: '0.95rem' },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: { xs: '8px', sm: '10px' },
      left: { xs: '-6px', sm: '-8px' },
      width: 0,
      height: 0,
      borderRight: { xs: '6px solid #f5f5f5', sm: '8px solid #f5f5f5' },
      borderTop: { xs: '6px solid transparent', sm: '8px solid transparent' },
      borderBottom: { xs: '6px solid transparent', sm: '8px solid transparent' }
    }
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    border: { xs: '1px solid #f44336', sm: '1px solid #f44336' },
    '&::before': {
      borderRight: { xs: '6px solid #ffebee', sm: '8px solid #ffebee' }
    }
  },
  typography: {
    fontWeight: 500,
    fontSize: { xs: '0.875rem', sm: '0.95rem' },
    lineHeight: { xs: 1.4, sm: 1.5 }
  },
  uploadSuccessCard: {
    background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
    border: '1px solid #4caf50',
    borderRadius: { xs: 2, sm: 3 },
    overflow: 'hidden',
    position: 'relative',
    mx: { xs: 0.5, sm: 0 },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: { xs: '3px', sm: '4px' },
      background: 'linear-gradient(90deg, #4caf50, #66bb6a, #4caf50)',
      animation: 'shimmer 2s ease-in-out infinite'
    }
  },
  iconContainer: {
    width: { xs: 48, sm: 56, md: 64 },
    height: { xs: 48, sm: 56, md: 64 },
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 2s ease-in-out infinite',
    boxShadow: { xs: '0 4px 16px rgba(76, 175, 80, 0.2)', sm: '0 8px 32px rgba(76, 175, 80, 0.3)' }
  },
  weatherContainer: {
    border: '1px solid #e0e0e0',
    borderRadius: { xs: 1.5, sm: 2 },
    p: { xs: 1.5, sm: 2 },
    bgcolor: '#f5f5f5',
    maxWidth: '100%'
  },
  dynamicDataContainer: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    px: { xs: 0, sm: 0 }
  }
};

const ChatMessage = ({ message, index, onAction }) => {
  // Handle saving analysis to dashboard
  const handleSaveAnalysis = (analysisData) => {
    const savedData = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
    savedData.push(analysisData);
    localStorage.setItem('savedAnalyses', JSON.stringify(savedData));
    
    // Show success notification (you can enhance this with a proper notification system)
    console.log('Analysis saved to dashboard:', analysisData.title);
  };
  const isUser = message.type === 'user' && !message.isBot;
  const isBot = message.isBot || message.type === 'schema' || message.type === 'table';
  const isError = message.isError;

  // Use a stable key based on message content and index to prevent bouncing
  const generateMessageKey = () => {
    if (message.type === 'schema') {
      return `schema-${message.content.id}-${index}`;
    }
    if (message.type === 'table') {
      return `table-${index}-${message.content.data?.length || 0}`;
    }
    
    // For API responses with supporting_data, include question/data hash for uniqueness
    const apiResponse = message.content?.response || message.content;
    const analysisResult = apiResponse?.analysis_result || apiResponse;
    
    if (analysisResult?.supporting_data && Array.isArray(analysisResult.supporting_data)) {
      const question = apiResponse?.question || '';
      const dataLength = analysisResult.supporting_data.length;
      const firstRecordHash = analysisResult.supporting_data[0] 
        ? Object.keys(analysisResult.supporting_data[0]).join('') 
        : '';
      return `analysis-${index}-${question.replace(/[^a-zA-Z0-9]/g, '')}-${dataLength}-${firstRecordHash}`;
    }
    
    return `message-${index}`;
  };
  
  const messageKey = generateMessageKey();

  const renderMessageContent = () => {
    if (message.type === 'schema') {
      return <DynamicRenderer schema={message.content} onAction={onAction} />;
    }

    if (message.type === 'system' && message.ui_schema) {
      return (
        <DynamicRenderer
          key={`dynamic-${index}`}
          schema={message.ui_schema}
          onAction={onAction}
        />
      );
    }

    if (message.type === 'system' && message.weather) {
      return (
        <Box sx={styles.weatherContainer}>
          <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Weather Information - {message.weather.location}
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Temperature:</strong> {message.weather.temperature}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Feels Like:</strong> {message.weather.feels_like}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Description:</strong> {message.weather.description}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Humidity:</strong> {message.weather.humidity}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Wind Speed:</strong> {message.weather.wind_speed}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Pressure:</strong> {message.weather.pressure}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Visibility:</strong> {message.weather.visibility}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Cloudiness:</strong> {message.weather.cloudiness}</Typography>
            </Grid>
          </Grid>
        </Box>
      );
    }

    if (message.type === 'dynamic_data') {
      return (
        <Box sx={styles.dynamicDataContainer}>
          <DynamicDataVisualization
            analysisResult={{
              analysis_result: {
                supporting_data: message.content.data || []
              }
            }}
            loading={false}
            isFromDashboard={false}
          />
        </Box>
      );
    }

    if (message.type === 'upload_success') {
      return (
        <Box sx={{ 
          width: '100%', 
          maxWidth: 'none',
          animation: 'slideInUp 0.5s ease-out'
        }}>
          <Card sx={styles.uploadSuccessCard}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 2, sm: 2.5, md: 3 },
                mb: { xs: 1, sm: 1.5, md: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box sx={styles.iconContainer}>
                  <Image 
                    src="/excel.png" 
                    alt="Excel file" 
                    width={24} 
                    height={24}
                    style={{
                      animation: 'bounce 1s ease-in-out'
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: '#2e7d32',
                    mb: 0.5,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                  }}>
                    ✅ File Uploaded Successfully!
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#388e3c',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' }
                  }}>
                    {message.content.filename}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#4caf50',
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>
                    {message.content.shape} • Ready for analysis
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    if (message.type === 'table') {
      return <DataTable data={message.content.data} title={message.content.title} />;
    }

    if (message.type === 'analysis') {
      return <AnalysisResponse content={message.content} source={message.source} />;
    }

    if (message.type === 'incentive_rules') {
      return <IncentiveRulesResponse content={message.content} source={message.source} />;
    }

    if (message.type === 'audio_translation') {
      return <AudioTranslationResponse content={message.content} />;
    }

    if (message.type === 'scheduler_response' || message.content?.type === 'scheduler_response') {
      return <SchedulerResponse content={message.content} />;
    }

    if (message.type === 'data_analysis') {
      
      // Check if we have supporting_data structure
      const apiResponse = message.content.response || message.content;
      const analysisResult = apiResponse.analysis_result || apiResponse;
      
      if (analysisResult && analysisResult.supporting_data && Array.isArray(analysisResult.supporting_data)) {
        return (
          <Box sx={{ width: '100%', maxWidth: 'none' }}>
            <AnalysisWidget
              data={message.content}
              title={apiResponse.question || 'Data Analysis'}
              onSave={handleSaveAnalysis}
            />
          </Box>
        );
      }
      
      // Fall back to old component for legacy data
      return (
        <DynamicDataVisualization
          analysisResult={message.content.analysisResult}
          loading={false}
          isFromDashboard={false}
        />
      );
    }

    // Handle API responses with new dynamic AnalysisWidget
    if (message.content && typeof message.content === 'object') {
      // console.log('🔍 [DEBUG] ChatMessage full content:', JSON.stringify(message.content, null, 2));
      
      // Check for reconciliation data structure - either nested in result or direct properties
      const result = message.content.result || message.content.response?.result;
      const contentKeys = Object.keys(message.content);
      const isDirectReconciliation = contentKeys.some(key => 
        key.includes('_vs_') || 
        (message.content[key]?.reconciliation_pair || message.content[key]?.reconciliation_type)
      );
      
      if ((result && typeof result === 'object') || isDirectReconciliation) {
        // This is reconciliation data - use AnalysisWidget
        const reconciliationData = isDirectReconciliation ? 
          { response: { result: message.content } } : 
          message.content;
          
        return (
          <Box sx={{ width: '100%', maxWidth: 'none' }}>
            <AnalysisWidget
              data={reconciliationData}
              title="Reconciliation Analysis"
              onSave={handleSaveAnalysis}
            />
          </Box>
        );
      }
      
      // Check for supporting_data structure - handle API response
      const apiResponse = message.content.response || message.content;
      const analysisResult = apiResponse.analysis_result || apiResponse;
      
      // console.log('🔍 [DEBUG] API response:', JSON.stringify(apiResponse, null, 2));
      // console.log('🔍 [DEBUG] Analysis result:', analysisResult);
      // console.log('🔍 [DEBUG] Has supporting_data:', !!analysisResult?.supporting_data);
      // console.log('🔍 [DEBUG] Supporting data length:', analysisResult?.supporting_data?.length);
      
      if (analysisResult && analysisResult.supporting_data && Array.isArray(analysisResult.supporting_data)) {
        // console.log('🔍 [DEBUG] Using AnalysisWidget for supporting_data');
        return (
          <Box sx={{ width: '100%', maxWidth: 'none' }}>
            <AnalysisWidget
              data={message.content}
              title={apiResponse.question || 'Data Analysis'}
              onSave={handleSaveAnalysis}
            />
          </Box>
        );
      }
      
      // console.log('🔍 [DEBUG] No matching condition, falling through to old component');
    }

    // Handle voice messages
    if (message.content.audio_file) {
      return <VoiceWaveform audioUrl={message.content.audio_file} duration={message.content.duration} />;
    }

    // Default text message
    return (
      <Typography sx={styles.typography}>
        {typeof message.content === 'string' ? message.content : (message.content.text || JSON.stringify(message.content, null, 2))}
      </Typography>
    );
  };

  // Determine message styling
  const getMessageStyle = () => {
    if (isUser) {
      return styles.userMessage;
    }
    if (isError) {
      return { ...styles.botMessage, ...styles.errorMessage };
    }
    return styles.botMessage;
  };

  return (
    <Box 
      key={messageKey} 
      sx={{
        ...styles.messageContainer,
        ...(isUser ? styles.userMessageContainer : styles.botMessageContainer)
      }}
    >
      <Paper 
        elevation={1}
        sx={getMessageStyle()}
      >
        {renderMessageContent()}
      </Paper>
    </Box>
  );
};

// Simple memoization to prevent re-renders during typing
const areEqual = (prevProps, nextProps) => {
  // Only re-render if message content actually changed or index changed
  return (
    prevProps.index === nextProps.index &&
    JSON.stringify(prevProps.message) === JSON.stringify(nextProps.message) &&
    prevProps.onAction === nextProps.onAction
  );
};

export default React.memo(ChatMessage, areEqual);
