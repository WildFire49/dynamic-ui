import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon, Error as ErrorIcon } from '@mui/icons-material';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Paper 
          elevation={1}
          sx={{ 
            p: 3,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: this.props.height || 400,
            minHeight: 300,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <ErrorIcon sx={{ 
              fontSize: 48, 
              color: 'warning.main',
              mb: 1
            }} />
            <Typography variant="h6" color="text.primary" gutterBottom>
              Chart Rendering Error
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Unable to render the chart. This might be due to data formatting issues.
            </Typography>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                textAlign: 'left',
                maxWidth: '100%',
                overflow: 'auto'
              }}>
                <Typography variant="caption" sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'error.main',
                  display: 'block',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={this.handleRetry}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Retry Chart
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
