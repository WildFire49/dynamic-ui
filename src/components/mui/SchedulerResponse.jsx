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
  Tooltip,
  Grid,
  keyframes
} from '@mui/material';
import {
  Timer as TimerIcon,
  Schedule as ScheduleIcon,
  EventNote as EventNoteIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import EnhancedDataGrid from '../widgets/EnhancedDataGrid';

const SchedulerResponse = ({ content }) => {
  // Debug logging to understand the structure
  console.log('SchedulerResponse received content:', content);

  // Handle various scheduler response formats
  const isSchedulerResponse = content?.type === 'scheduler_response' || 
                             content?.response?.type === 'scheduler_response' ||
                             content?.data?.response_type === 'scheduled' ||
                             content?.response_type === 'scheduled';
  
  let title, metadata, download_url, status, data, message, success, job_id, schedule_details, result, isCompleted, response_type, config;
  let needsClarification, clarificationQuestion;
  
  if (isSchedulerResponse) {
    // Handle the new nested format: content.response.data
    const responseData = content?.response?.data || content?.data || content;
    const responseContent = content?.response || content;
    
    title = responseContent.content || content.content || 'Scheduler Response';
    job_id = responseData.job_id || responseContent.scheduler_id;
    status = responseData.success ? 'scheduled' : 'failed';
    schedule_details = responseData.schedule_details;
    result = responseData.result;
    response_type = responseData.response_type || 'scheduled';
    message = responseData.message || responseContent.message || responseContent.content || title;
    config = responseContent.config || responseData.config;
    
    // Clarification logic
    needsClarification = responseData.needs_clarification || responseContent.needs_clarification;
    clarificationQuestion = responseData.clarification_question || responseContent.clarification_question;
    
    // Check if this is a completed task with results
    isCompleted = status === 'completed' && result;
    
    // For completed tasks, extract data and download URL from result
    if (isCompleted && result) {
      data = result.data || result.tabular_data;
      download_url = result.pdf_url || result.download_url;
      message = result.message || message;
    }
  } else {
    // Old format from events API or fallback
    title = content.title || 'Scheduler Response';
    metadata = content.metadata;
    download_url = content.download_url;
    status = content.status || 'pending';
    const metaData = metadata || {};
    data = metaData.data;
    message = metaData.message || content.message || 'Scheduler response received';
    success = metaData.success;
    isCompleted = status === 'completed';
    response_type = 'default';
  }

  // Format schedule time if available
  const formatScheduleTime = () => {
    if (!schedule_details) return null;
    
    try {
      const { params, timezone } = schedule_details;
      if (params?.run_date) {
        const date = new Date(params.run_date);
        const options = {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: timezone || 'Asia/Kolkata',
          timeZoneName: 'short'
        };
        return date.toLocaleString('en-IN', options);
      }
    } catch (error) {
      console.error('Error formatting schedule time:', error);
    }
    return null;
  };

  const scheduleTimeFormatted = formatScheduleTime();
  // Enhanced check: task is scheduled if response says so OR if we have a valid config object
  const isScheduledTask = (response_type === 'scheduled' || status === 'scheduled') && (schedule_details || config);

  // Animation definition
  const slideIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  `;

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
          background: needsClarification 
            ? 'linear-gradient(135deg, #fff4e5 0%, #fffbf2 100%)' 
            : 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          border: needsClarification ? '1px solid #ff9800' : '1px solid #1976d2',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header - More Conversational */}
        <Box sx={{ 
          background: needsClarification 
            ? 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)'
            : 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          p: 1.5,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 32, 
              height: 32,
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              {needsClarification ? (
                <NotificationsActiveIcon sx={{ fontSize: 18 }} />
              ) : (
                <ScheduleIcon sx={{ fontSize: 18 }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                Scheduler Agent
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {needsClarification ? <AccessTimeIcon sx={{ fontSize: 10 }} /> : <CheckCircleIcon sx={{ fontSize: 10 }} />}
                {needsClarification ? 'Action Required' : 'Status: active'}
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="View Schedule">
            <IconButton size="small" sx={{ color: 'white', opacity: 0.8 }}>
              <TimerIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Main Content Area - Conversational & Animated */}
          <Box sx={{ 
            mb: 2, 
            animation: `${slideIn} 0.4s ease-out`,
            p: 2, 
            bgcolor: needsClarification ? 'rgba(255, 152, 0, 0.03)' : 'rgba(25, 118, 210, 0.03)', 
            borderRadius: 2,
            border: needsClarification ? '1px solid rgba(255, 152, 0, 0.1)' : '1px solid rgba(25, 118, 210, 0.1)'
          }}>
            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
              {needsClarification ? (
                <NotificationsActiveIcon sx={{ color: '#ed6c02', fontSize: 24, mt: 0.3 }} />
              ) : (
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                </Avatar>
              )}
              <Box sx={{ flex: 1 }}>
                
                {/* Persona-driven Message */}
                <Typography variant="body1" sx={{ 
                  color: needsClarification ? '#a65d00' : '#0d47a1',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  fontWeight: needsClarification ? 'normal' : 'medium'
                }}>
                  {needsClarification ? (
                     // Clarification Question
                    <Box component="span" sx={{ display: 'block' }}>
                      <Typography component="span" sx={{ fontWeight: 'bold', display: 'block', mb: 1, fontSize: '1.05rem' }}>
                        {clarificationQuestion || message || 'I need a few more details.'}
                      </Typography>
                      <Typography component="span" variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                        Please reply with the missing info so I can proceed.
                      </Typography>
                    </Box>
                  ) : isScheduledTask && config ? (
                    // Intelligent Success Confirmation
                    <Box component="span">
                      {`I've successfully scheduled the `}
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        {config.event?.name || 'task'}
                      </Box>
                      {`. It will run `}
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        {config.schedule?.time ? `${config.schedule.time.toLowerCase()}` : 'as requested'}
                      </Box>
                      {config.delivery?.[0]?.recipient ? (
                        <>
                          {' for '}
                          <Box component="span" sx={{ fontWeight: 'bold' }}>
                            {config.delivery[0].recipient}
                          </Box>
                        </>
                      ) : ''}
                      {'.'}
                    </Box>
                  ) : (
                    // Generics Fallback
                    <Box component="span">
                       {message}
                    </Box>
                  )}
                </Typography>

              </Box>
            </Stack>
          </Box>

          {/* Schedule Configuration Summary - Only show if not clarification */}
          {!needsClarification && config && (
             <Card sx={{ 
              mb: 3, 
              animation: `${slideIn} 0.5s ease-out`,
              animationDelay: '0.1s',
              animationFillMode: 'both',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: 3,
              border: '1px solid rgba(25, 118, 210, 0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.04)', 
                p: 1.5, 
                px: 2,
                borderBottom: '1px solid rgba(25, 118, 210, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Configuration Details
                </Typography>
                <Chip label="Active" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
              </Box>
              <Box sx={{ p: 2.5 }}>
                 {/* Event Name & Desc */}
                 <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        {config.event?.name || 'Scheduled Task'}
                      </Typography>
                      {config.event?.description && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {config.event.description}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* Meta Grid */}
                    <Grid container spacing={2}>
                        {/* Time */}
                        <Grid item xs={6}>
                           <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <AccessTimeIcon sx={{ fontSize: 18, color: '#1976d2', mt: 0.2 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: 'block' }}>
                                  SCHEDULE
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#333' }}>
                                  {config.schedule?.time}
                                  {config.schedule?.recurrence?.pattern?.type && (
                                    <Box component="span" sx={{ color: 'text.secondary', ml: 0.5, fontSize: '0.9em' }}>
                                      ({config.schedule.recurrence.pattern.type})
                                    </Box>
                                  )}
                                </Typography>
                              </Box>
                           </Stack>
                        </Grid>

                        {/* Delivery */}
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <NotificationsActiveIcon sx={{ fontSize: 18, color: '#ed6c02', mt: 0.2 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: 'block' }}>
                                  DELIVERY
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#333' }}>
                                  {config.delivery?.[0]?.channel || 'Default'}
                                  {config.delivery?.[0]?.recipient && (
                                    <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                       to {config.delivery[0].recipient}
                                    </Box>
                                  )}
                                </Typography>
                              </Box>
                           </Stack>
                        </Grid>
                    </Grid>
                 </Stack>
              </Box>
            </Card>
          )}

          {/* Legacy Schedule Details */}
          {(isScheduledTask || job_id) && !config && (
            <Card sx={{ 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(25, 118, 210, 0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              p: 2
            }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Task Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Job ID: {job_id}
              </Typography>
              {scheduleTimeFormatted && (
                 <Typography variant="body2" color="text.secondary">
                 Scheduled for: {scheduleTimeFormatted}
               </Typography>
              )}
            </Card>
          )}

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
                startIcon={<DescriptionIcon />}
                onClick={handleDownload}
                sx={{
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 'medium',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                }}
              >
                Download PDF Report
              </Button>
            )}
          </Stack>
        </CardContent>

        {/* Decorative pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: needsClarification 
            ? 'radial-gradient(circle, rgba(237, 108, 2, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)'
        }} />
      </Card>
    </Box>
  );
};

export default SchedulerResponse;
