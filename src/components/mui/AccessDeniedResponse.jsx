import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography
} from '@mui/material';
import {
  Block as BlockIcon,
  ContactSupport as ContactIcon,
  Warning as WarningIcon,
  Call as CallIcon
} from '@mui/icons-material';


const AccessDeniedResponse = ({ content }) => {
  const {
    current_usage = 0,
    limit = 0,
    remaining = 0
  } = content?.response || content || {};

  const handleContactSupport = () => {
    const email = 'vaishakh.krishnan@newstreettech.com';
    const subject = 'Demo Instance Request Limit Increase';
    const body = `Hi,

I have exceeded my demo instance request limit and would like to discuss upgrading my plan.

Current usage: ${current_usage}/${limit} requests used

Thanks!`;
    
    // Create mailto link with proper encoding
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    console.log('Opening email client with:', mailtoLink); // Debug log
    
    // Try multiple approaches to ensure it works
    try {
      // Method 1: Direct window location
      window.location.href = mailtoLink;
      
      // Method 2: Fallback with window.open (in case the first doesn't work)
      setTimeout(() => {
        window.open(mailtoLink, '_self');
      }, 100);
      
    } catch (error) {
      console.error('Error opening email client:', error);
      // Fallback: copy email info to clipboard
      navigator.clipboard.writeText(`Email: ${email}\nSubject: ${subject}\n\n${body}`);
      alert('Email client could not be opened. Email details have been copied to clipboard.');
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: '100%',
        border: '2px solid #f57c00',
        backgroundColor: '#fff8e1',
        boxShadow: '0 4px 20px rgba(245, 124, 0, 0.15)',
        position: 'relative'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#ff9800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WarningIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#e65100'
              }}
            >
              Demo Instance Limit Reached
            </Typography>
          </Box>
        </Box>

        {/* Usage Statistics */}
        <Alert 
          severity="warning"
          sx={{ 
            mb: 2,
            backgroundColor: '#fff3e0',
            border: '1px solid #ffb74d'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            You have exceeded your demo request limit.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip 
              label={`${current_usage}/${limit} requests used`} 
              size="small" 
              sx={{
                backgroundColor: '#ff9800',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
        </Alert>

        {/* Simple Message */}
        <Typography variant="body1" sx={{ color: '#424242', mb: 3, textAlign: 'center' }}>
          Contact our team to upgrade your plan and continue using MiFiX AI.
        </Typography>

        {/* Contact Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleContactSupport}
            sx={{
              backgroundColor: '#ff9800',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#f57c00'
              }
            }}
          >
            <CallIcon sx={{ mr: 1 }} />
            Contact MiFiX Team
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccessDeniedResponse;
