import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

const SchedulerResponse = ({ content }) => {
  // Handle both old format (from events API) and new format (from chat API)
  const isNewFormat = content?.type === 'scheduler_response' || content?.data;
  
  let title, metadata, download_url, status, data, message, success, job_id, schedule_details, result, isCompleted;
  
  if (isNewFormat) {
    // Extract data based on format
    const responseData = isNewFormat ? (content.data || content) : content;
    title = isNewFormat ? content.content : (content.title || 'Scheduler Response');
    job_id = responseData.job_id;
    status = responseData.status || 'pending';
    schedule_details = responseData.schedule_details;
    result = responseData.result;
    
    // Check if this is a completed task with results
    isCompleted = status === 'completed' && result;
    
    // For completed tasks, extract data and download URL from result
    if (isCompleted && result) {
      data = result.data || result.tabular_data;
      download_url = result.pdf_url || result.download_url;
      message = result.message;
    }
  } else {
    // Old format from events API
    title = content.title;
    metadata = content.metadata;
    download_url = content.download_url;
    status = content.status;
    const metaData = metadata || {};
    data = metaData.data;
    message = metaData.message;
    success = metaData.success;
    isCompleted = status === 'completed';
  }

  const handleDownload = () => {
    if (download_url) {
      window.open(download_url, '_blank');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2.5, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          border: '1px solid #4caf50'
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <ScheduleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 'medium', 
            color: '#2e7d32',
            fontSize: '0.875rem'
          }}>
            Scheduler Agent
          </Typography>
        </Stack>

        {/* Title */}
        <Typography variant="h6" sx={{ 
          color: '#2e7d32',
          fontWeight: 'medium',
          mb: 1.5
        }}>
          {title}
        </Typography>

        {/* Job ID */}
        {job_id && (
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            mb: 1,
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }}>
            Job ID: {job_id}
          </Typography>
        )}

        {/* Schedule Details */}
        {schedule_details && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
              Schedule Details:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Type: {schedule_details.type}
            </Typography>
            {schedule_details.params?.run_date && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Run Date: {new Date(schedule_details.params.run_date).toLocaleString()}
              </Typography>
            )}
            {schedule_details.timezone && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Timezone: {schedule_details.timezone}
              </Typography>
            )}
          </Box>
        )}

        {/* Status */}
        <Chip 
          label={status} 
          color={status === 'completed' ? 'success' : status === 'scheduled' ? 'info' : status === 'failed' ? 'error' : 'default'}
          size="small"
          sx={{ mb: 2 }}
        />

        {/* Data Table */}
        {data && data.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>User ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.user_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Message */}
        {message && (
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            mb: 2,
            fontStyle: 'italic'
          }}>
            {message}
          </Typography>
        )}

        {/* Download Button */}
        {download_url && (
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleDownload}
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' },
              textTransform: 'none'
            }}
          >
            Download PDF Report
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default SchedulerResponse;
