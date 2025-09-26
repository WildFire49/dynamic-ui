import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Collapse,
  Badge,
  Button,
  Grid
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Message as MessageIcon,
  AccessTime as AccessTimeIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Microsoft as MicrosoftIcon,
  Info as InfoIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';

const EmailSentResponse = ({ response }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  if (!response || (response.type !== 'email_sent' && response.type !== 'error')) {
    return null;
  }

  // Handle error responses
  if (response.type === 'error') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Card 
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #f44336, #e57373)',
              borderRadius: '12px 12px 0 0'
            }
          }}
        >
          <CardContent sx={{ pt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #f44336, #e57373)',
                  width: 56,
                  height: 56,
                  boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)'
                }}
              >
                <EmailIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Avatar>
              <Box flex={1}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  color="error.dark"
                  sx={{ 
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    mb: 0.5
                  }}
                >
                  Email Failed to Send
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MicrosoftIcon sx={{ fontSize: 16, color: '#0078d4' }} />
                  <Typography variant="body2" color="text.secondary">
                    via Microsoft Outlook
                  </Typography>
                  <Chip 
                    label="Failed" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                border: '1px solid rgba(244, 67, 54, 0.1)',
                borderLeft: '4px solid #f44336'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <InfoIcon sx={{ fontSize: 18, color: 'error.main' }} />
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Error Details:
                </Typography>
              </Stack>
              <Typography 
                variant="body1" 
                color="error.main"
                sx={{ fontWeight: 'medium' }}
              >
                {response.content}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { content, details } = response;
  const { to, contact_name, subject, message, result } = details;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      {/* Main Success Card */}
      <Card 
        elevation={8}
        sx={{
          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
            borderRadius: '12px 12px 0 0'
          }
        }}
      >
        <CardContent sx={{ pt: 3 }}>
          {/* Header Section */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                width: 56,
                height: 56,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Avatar>
            <Box flex={1}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color="success.dark"
                sx={{ 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 0.5
                }}
              >
                Email Sent Successfully
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MicrosoftIcon sx={{ fontSize: 16, color: '#0078d4' }} />
                <Typography variant="body2" color="text.secondary">
                  via Microsoft Outlook
                </Typography>
                <Chip 
                  label="Delivered" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Stack>
            </Box>
            <Tooltip title="View Details">
              <IconButton 
                onClick={() => setShowDetails(!showDetails)}
                sx={{
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                }}
              >
                {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Email Summary */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 2,
              border: '1px solid rgba(76, 175, 80, 0.1)'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    To:
                  </Typography>
                </Stack>
                <Chip 
                  label={contact_name || to}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 'medium' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <SubjectIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Subject:
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.primary" fontWeight="medium">
                  {subject}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Message Preview */}
          <Box mt={2}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <MessageIcon sx={{ fontSize: 18, color: 'info.main' }} />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                Message Preview:
              </Typography>
            </Stack>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 2,
                borderLeft: '4px solid #2196f3'
              }}
            >
              <Typography 
                variant="body2" 
                color="text.primary"
                sx={{ 
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  maxHeight: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                "{message}"
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Expandable Details Section */}
      <Collapse in={showDetails}>
        <Box mt={2}>
          <Card elevation={4} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <InfoIcon sx={{ color: 'info.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Delivery Details
                </Typography>
              </Stack>
              
              <Divider sx={{ mb: 2 }} />
              
              {/* Status Information */}
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        Successfully Sent
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(33, 150, 243, 0.05)',
                      border: '1px solid rgba(33, 150, 243, 0.2)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email Provider
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MicrosoftIcon sx={{ fontSize: 20, color: '#0078d4' }} />
                      <Typography variant="body1" fontWeight="bold">
                        Microsoft Graph API
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Technical Details Toggle */}
              <Button
                variant="text"
                startIcon={showLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowLogs(!showLogs)}
                sx={{ mb: 1 }}
              >
                Technical Details
              </Button>

              <Collapse in={showLogs}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    API Response Logs
                  </Typography>
                  
                  {result?.result?.logs?.map((log, index) => (
                    <Box key={index} mb={1}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <NetworkIcon sx={{ fontSize: 16, color: 'info.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(log.time)}
                        </Typography>
                        <Chip 
                          label={log.level} 
                          size="small" 
                          variant="outlined"
                          color={log.level === 'INFO' ? 'info' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      </Stack>
                      <Typography 
                        variant="caption" 
                        component="div"
                        sx={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          p: 1,
                          borderRadius: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        {log.message}
                      </Typography>
                      {log.extras?.statusCode && (
                        <Typography variant="caption" color="success.main" fontWeight="bold">
                          HTTP {log.extras.statusCode} - {log.extras.duration}ms
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      </Collapse>
    </Box>
  );
};

export default EmailSentResponse;
