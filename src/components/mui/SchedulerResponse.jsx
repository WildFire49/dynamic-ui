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
  Stack,
  Card,
  CardContent,
  Divider,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import EnhancedDataGrid from '../widgets/EnhancedDataGrid';

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
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #dcf8c6 0%, #e8f5e8 100%)',
          border: '1px solid #25D366',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* WhatsApp-style header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          p: 2,
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48,
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <WhatsAppIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                mb: 0.5
              }}>
                Scheduler Agent
              </Typography>
              {/* <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Report scheduled successfully
                </Typography>
              </Stack> */}
            </Box>
            <Tooltip title="Share Report">
              <IconButton sx={{ color: 'white' }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Success Message */}
          <Box sx={{ 
            mb: 3, 
            p: 2.5, 
            bgcolor: 'rgba(37, 211, 102, 0.1)', 
            borderRadius: 2,
            border: '1px solid rgba(37, 211, 102, 0.3)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
              <WhatsAppIcon sx={{ color: '#25D366', fontSize: 24 }} />
              <Typography variant="h6" sx={{ 
                color: '#128C7E',
                fontWeight: 'bold'
              }}>
                {message || 'Report Generated Successfully!'}
              </Typography>
            </Stack>
            
            <Typography variant="body1" sx={{ 
              color: '#2e7d32',
              mb: 2,
              lineHeight: 1.6
            }}>
              Your report has been generated and will be sent to your WhatsApp shortly. 
              <br />
              You'll receive a notification once it's delivered.
            </Typography>

            {/* WhatsApp Status Chip */}
            {/* <Chip 
              icon={<WhatsAppIcon />}
              label="Will be sent to WhatsApp" 
              sx={{
                bgcolor: '#25D366',
                color: 'white',
                fontWeight: 'medium',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            /> */}
          </Box>

          {/* Report Details */}
          {/* <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <DescriptionIcon sx={{ color: '#128C7E' }} />
                <Typography variant="h6" sx={{ color: '#128C7E', fontWeight: 'bold' }}>
                  Report Details
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {data && data.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
                      Records: {data.length} {data.length === 1 ? 'record' : 'records'}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
                    Generated: {new Date().toLocaleString()}
                  </Typography>
                </Box>

                {job_id && (
                  <Box>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 'medium', 
                      color: '#666',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem'
                    }}>
                      Job ID: {job_id}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card> */}

          {/* Enhanced Data Grid - Only show if data exists */}
          {data && data.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <EnhancedDataGrid
                title="Report Data Preview"
                data={data}
                height={400}
                pageSize={10}
                exportFileName={`report_${new Date().toISOString().split('T')[0]}`}
                loading={false}
              />
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            {download_url && (
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={handleDownload}
                sx={{
                  bgcolor: '#dc3545',
                  '&:hover': { bgcolor: '#c82333' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 'medium',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                }}
              >
                Download PDF Report
              </Button>
            )}
            
            {/* <Button
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              sx={{
                borderColor: '#25D366',
                color: '#25D366',
                '&:hover': { 
                  bgcolor: 'rgba(37, 211, 102, 0.1)',
                  borderColor: '#128C7E'
                },
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'medium'
              }}
            >
              Open WhatsApp
            </Button> */}
          </Stack>
        </CardContent>

        {/* Decorative WhatsApp pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(37, 211, 102, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)'
        }} />
      </Card>
    </Box>
  );
};

export default SchedulerResponse;
