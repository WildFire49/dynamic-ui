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
  Chip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

const SchedulerResponse = ({ content }) => {
  const {
    title,
    metadata,
    download_url,
    status
  } = content;

  const { data, message, success } = metadata || {};

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

        {/* Status */}
        <Chip 
          label={status} 
          color={status === 'completed' ? 'success' : 'default'}
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
