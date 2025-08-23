import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  VolumeUp,
  Translate,
  Error as ErrorIcon
} from '@mui/icons-material';
import DynamicDataVisualization from './DynamicDataVisualization';
import ModernAudioPlayer from './ModernAudioPlayer';

const AudioTranslationResponse = ({ content }) => {
  const {
    originalText,
    translatedText,
    detectedLanguage,
    audioUrl,
    status,
    errorMessage,
    data,
    rowCount,
    executionTime
  } = content;

  const hasData = data && data.length > 0;

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2,
          borderRadius: 2,
          background: status === 'error' 
            ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: `1px solid ${status === 'error' ? '#f44336' : '#2196f3'}`
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VolumeUp sx={{ color: status === 'error' ? '#f44336' : '#2196f3' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: status === 'error' ? '#c62828' : '#1976d2' }}>
                {status === 'error' ? 'Error' : 'Response'}
              </Typography>
            </Stack>
            {status && (
              <Chip 
                label={status}
                color={status === 'error' ? 'error' : 'success'}
                size="small"
              />
            )}
          </Stack>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {errorMessage}
            </Alert>
          )}

          {/* Main Content */}
          {status !== 'error' && (
            <>
              {/* Translated Text */}
              {translatedText && (
                <Typography variant="body1" sx={{ fontFamily: 'serif', fontSize: '1.1rem' }}>
                  {translatedText}
                </Typography>
              )}

              {/* Original Text (if available) */}
              {originalText && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Original: "{originalText}"
                </Typography>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <ModernAudioPlayer 
                  audioUrl={audioUrl}
                  autoPlay={true}
                />
              )}

              {/* Data Table */}
              {hasData && (
                <DynamicDataVisualization 
                  data={data} 
                  rowCount={rowCount} 
                  executionTime={executionTime} 
                />
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AudioTranslationResponse;
