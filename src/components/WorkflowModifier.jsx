import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Button,
  Stack,
  Fab,
  Container,
  Avatar
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowIcon,
  Check as ConfirmIcon,
  Close as RejectIcon
} from '@mui/icons-material';
// Using regular img tags instead of Next.js Image to avoid HMR issues

const WorkflowModifier = ({ data, onConfirm, onCancel }) => {
  // Handle case where data or data.response might be undefined
  const response = data?.response || {};
  
  // Safely destructure with default values
  const { 
    message = '', 
    modification_request = '', 
    current_sequence = [], 
    proposed_sequence = [], 
    confirmation_prompt = '',
    bank = '',
    product = '',
    status = '',
    modification_applied = '',
    current_workflow = [],
    proposed_workflow = []
  } = response || {};
  
  // Handle both old and new response formats and ensure they're always arrays
  // Check if current_sequence is an object with a sequence array or a direct array
  const currentWorkflow = Array.isArray(current_sequence) ? current_sequence :
                         current_sequence?.sequence ? current_sequence.sequence :
                         Array.isArray(response.current_workflow) ? response.current_workflow : [];
  
  const proposedWorkflow = Array.isArray(proposed_sequence) ? proposed_sequence :
                          proposed_sequence?.sequence ? proposed_sequence.sequence :
                          Array.isArray(response.proposed_workflow) ? response.proposed_workflow : [];

  const getStepStatus = (step, workflow) => {
    if (!currentWorkflow || !proposedWorkflow) return 'normal';
    
    // Find the step positions in both workflows
    const currentPos = currentWorkflow.findIndex(s => s.action_id === step.action_id);
    const proposedPos = proposedWorkflow.findIndex(s => s.action_id === step.action_id);
    
    // If positions are different, this step was moved
    if (currentPos !== proposedPos) {
      if (workflow === 'current') {
        return 'moved-from'; // Original position
      } else {
        return 'moved-to'; // New position
      }
    }
    
    return 'normal';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'moved-from': return '#ffebee'; // Light red
      case 'moved-to': return '#e8f5e8'; // Light green
      case 'target': return '#fff3e0'; // Light orange
      default: return '#f5f5f5'; // Light gray
    }
  };

  const getStepBorderColor = (status) => {
    switch (status) {
      case 'moved-from': return '#f44336'; // Red
      case 'moved-to': return '#4caf50'; // Green
      case 'target': return '#ff9800'; // Orange
      default: return '#e0e0e0'; // Gray
    }
  };

  const WorkflowStep = ({ step, workflow }) => {
    const status = getStepStatus(step, workflow);
    
    return (
      <Card
        sx={{
          mb: 1,
          backgroundColor: getStepColor(status),
          border: `2px solid ${getStepBorderColor(status)}`,
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Step {step.step}: {step.stage_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {step.action_id}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                {step.description}
              </Typography>
            </Box>
            {status === 'moved-from' && (
              <Chip
                label="Moving"
                size="small"
                color="error"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
            {status === 'moved-to' && (
              <Chip
                label="New Position"
                size="small"
                color="success"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
            {status === 'target' && (
              <Chip
                label="Reference Point"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Header with Logos */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            <SwapIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Workflow Modification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(bank || '').toUpperCase()} {(product || '').toUpperCase()} • Version {current_sequence?.version || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <img src="/ai-chatbot.png" alt="AI Assistant" width={40} height={40} style={{ borderRadius: '8px' }} />
          <img src="/mifix-logo.png" alt="Mifix" width={40} height={40} style={{ borderRadius: '8px' }} />
        </Box>
      </Box>

      {/* Modification Request */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          <strong>Request:</strong> {modification_request || 'Workflow modification requested'}
        </Typography>
      </Alert>

      {/* Workflow Comparison - Full Width Side by Side */}
      <Box sx={{ display: 'flex', gap: 3, minHeight: '70vh' }}>
        {/* Current Workflow */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, bgcolor: '#ffebee', borderBottom: '2px solid #ffcdd2' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 2 }}>
                <CancelIcon sx={{ fontSize: 24 }} />
                Current Workflow
                <Chip label={`v${current_sequence?.version || 'N/A'}`} size="medium" color="error" variant="outlined" sx={{ fontWeight: 'bold' }} />
              </Typography>
            </Box>
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: '#fafafa' }}>
              {currentWorkflow?.map((step, index) => (
                <WorkflowStep key={step.step} step={step} workflow="current" />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Divider Arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '60px' }}>
          <Box sx={{ 
            bgcolor: 'primary.main', 
            borderRadius: '50%', 
            width: 48, 
            height: 48, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 3
          }}>
            <ArrowIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
        </Box>

        {/* Proposed Workflow */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, bgcolor: '#e8f5e8', borderBottom: '2px solid #c8e6c9' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckIcon sx={{ fontSize: 24 }} />
                Proposed Workflow
                <Chip label={`v${(current_sequence?.version || 0) + 1}`} size="medium" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
              </Typography>
            </Box>
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: '#fafafa' }}>
              {proposedWorkflow?.map((step, index) => (
                <WorkflowStep key={step.step} step={step} workflow="proposed" />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
        <Fab
          color="success"
          size="large"
          onClick={onConfirm}
          sx={{
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ConfirmIcon sx={{ fontSize: 28 }} />
        </Fab>
        <Fab
          color="error"
          size="large"
          onClick={onCancel}
          sx={{
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <RejectIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Box>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
          Step Status Legend:
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ffebee', border: '2px solid #f44336', mr: 1.5, borderRadius: 1 }} />
            <Typography variant="body2" color="text.secondary">Step being moved</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#e8f5e8', border: '2px solid #4caf50', mr: 1.5, borderRadius: 1 }} />
            <Typography variant="body2" color="text.secondary">New position</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#f5f5f5', border: '2px solid #e0e0e0', mr: 1.5, borderRadius: 1 }} />
            <Typography variant="body2" color="text.secondary">Unchanged</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default WorkflowModifier;
