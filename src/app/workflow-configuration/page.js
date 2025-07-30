'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { 
  Send as SendIcon,
  CheckCircle as CheckIcon,
  SwapHoriz as SwapIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import WorkflowModifier from '../../components/WorkflowModifier';

const WorkflowConfigurationPage = () => {
  const [formData, setFormData] = useState({
    bank: '',
    product: '',
    request: ''
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [step, setStep] = useState('form'); // 'form', 'modification', 'confirmation'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendWorkflowModification = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use hardcoded conversation_id as required by the API
      const initialConversationId = "ccd25658-93a2-4d4d-9f60-bc1a6391a303";
      
      const payload = {
        user_id: "vaishakh_workflow1",
        message: `continue {"action": "modify_workflow", "bank": "${formData.bank}", "product": "${formData.product}", "request": "${formData.request}"}`,
        conversation_id: initialConversationId
      };

      console.log('Sending workflow modification payload:', payload);

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Workflow modification response:', data);

      // Extract and store the conversation_id from the response
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
        console.log('Stored conversation_id:', data.conversation_id);
      }

      setResponse(data);
      setStep('modification');
    } catch (err) {
      console.error('Error sending workflow modification:', err);
      setError(err.message || 'Failed to send workflow modification request');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the conversation_id from the previous API response
      if (!conversationId) {
        throw new Error('No conversation ID available. Please start a new modification request.');
      }

      const payload = {
        user_id: "vaishakh_workflow1",
        message: "confirm",
        conversation_id: conversationId
      };

      console.log('Sending confirmation payload:', payload);

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Confirmation response:', data);

      setResponse(data);
      setStep('confirmation');
    } catch (err) {
      console.error('Error sending confirmation:', err);
      setError(err.message || 'Failed to send confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // If we have a conversation_id, send cancel request to the API
    if (conversationId) {
      try {
        const payload = {
          user_id: "vaishakh_workflow1",
          message: "cancel",
          conversation_id: conversationId
        };

        console.log('Sending cancel payload:', payload);

        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log('Cancel request sent successfully');
        }
      } catch (err) {
        console.error('Error sending cancel request:', err);
      }
    }

    // Reset to form state
    setStep('form');
    setResponse(null);
    setError(null);
    setConversationId(null);
  };

  const resetForm = () => {
    setFormData({ bank: '', product: '', request: '' });
    setResponse(null);
    setError(null);
    setStep('form');
    setConversationId(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth={false} sx={{ px: 2, py: 3 }}>
      {/* Header Section with Logos */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <img src="/ai-chatbot.png" alt="AI Assistant" width={60} height={60} style={{ borderRadius: '50%', border: '3px solid white' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                MiFiX AI Workflow Configurator
              </Typography>
             
            </Box>
            <img src="/mifix-logo.png" alt="Mifix" width={60} height={60} style={{ borderRadius: '12px', border: '2px solid white' }} />
          </Box>
        </Box>
       
        <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.8 }}>
          Simply Describe your Workflow Modification and Watch MiFiX AI Generate the Changes Realtime
        </Typography>
      </Paper>

      {step === 'form' && (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            {/* Form Header */}
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                <SwapIcon sx={{ fontSize: 28 }} />
                Workflow Modification Request
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Describe the changes you want to make to your workflow
              </Typography>
            </Box>
            
            {/* Form Content */}
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <TextField
                  label="Bank Name"
                  value={formData.bank}
                  onChange={(e) => handleInputChange('bank', e.target.value)}
                  placeholder="e.g., federal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Product Name"
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                  placeholder="e.g., kcc"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </Box>
              
              <TextField
                label="Modification Request"
                value={formData.request}
                onChange={(e) => handleInputChange('request', e.target.value)}
                placeholder="e.g., move aadhar-verification before verify-otp"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
              
              <Button
                variant="contained"
                onClick={sendWorkflowModification}
                disabled={loading || !formData.bank || !formData.product || !formData.request}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  background: loading ? undefined : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                  '&:hover': {
                    background: loading ? undefined : 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px 2px rgba(25, 118, 210, .3)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Processing Your Request...' : 'Send Modification Request'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {response && step === 'modification' && (
        <Paper elevation={2} sx={{ p: 1, mb: 2}}>
          <WorkflowModifier 
            data={{
              response: response.response || {}
            }}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </Paper>
      )}

      {response && step === 'confirmation' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 6, 
              borderRadius: 4, 
              textAlign: 'center', 
              maxWidth: 600,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
              border: '2px solid #4caf50',
              animation: 'fadeInScale 0.6s ease-out',
              '@keyframes fadeInScale': {
                '0%': {
                  opacity: 0,
                  transform: 'scale(0.8)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'scale(1)'
                }
              }
            }}
          >
            {/* Success Icon with Animation */}
            <Box sx={{ mb: 3 }}>
              <CheckIcon 
                sx={{ 
                  fontSize: 80, 
                  color: '#4caf50',
                  animation: 'bounceIn 0.8s ease-out 0.2s both',
                  '@keyframes bounceIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'scale(0.3)'
                    },
                    '50%': {
                      opacity: 1,
                      transform: 'scale(1.05)'
                    },
                    '70%': {
                      transform: 'scale(0.9)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'scale(1)'
                    }
                  }
                }} 
              />
            </Box>

            {/* Success Message */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#2e7d32', 
                mb: 2,
                animation: 'slideInUp 0.6s ease-out 0.4s both',
                '@keyframes slideInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              Workflow Modified Successfully!
            </Typography>

            {/* API Message */}
            {response.response?.message && (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#388e3c', 
                  mb: 3,
                  animation: 'slideInUp 0.6s ease-out 0.6s both'
                }}
              >
                {response.response.message}
              </Typography>
            )}

            {/* Applied Modification Card */}
            {response.response?.modification_applied && (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  bgcolor: 'white', 
                  borderRadius: 2,
                  animation: 'slideInUp 0.6s ease-out 0.8s both'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <SwapIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Applied Modification
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    fontWeight: 'medium'
                  }}
                >
                  {response.response.modification_applied}
                </Typography>
              </Paper>
            )}

            {/* Status Badge */}
            {/* {response.response?.status && (
              <Chip
                icon={<CheckIcon />}
                label={response.response.status.toUpperCase()}
                color="success"
                size="large"
                sx={{ 
                  mb: 4, 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  animation: 'slideInUp 0.6s ease-out 1s both'
                }}
              />
            )} */}

            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              onClick={resetForm}
              startIcon={<ArrowIcon />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem',
                borderRadius: 3,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                animation: 'slideInUp 0.6s ease-out 1.2s both',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 2px rgba(25, 118, 210, .3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create New Modification
            </Button>
          </Paper>
        </Box>
      )}

      {/* Debug Information - Commented out for production */}
      {/* {response && (
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Debug Information:
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto', margin: 0 }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </Paper>
      )} */}
      </Container>
    </Box>
  );
};

export default WorkflowConfigurationPage;
