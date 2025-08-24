import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const PDFNotificationPopup = ({ open, onClose, data }) => {
  if (!data) return null;

  const { title, download_url, metadata } = data;
  const tableData = metadata?.data || [];
  const message = metadata?.message || 'PDF generated successfully';

  const handleOpenPDF = () => {
    if (download_url) {
      window.open(download_url, '_blank');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#e8f5e8', 
        color: '#2e7d32',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CheckCircleIcon sx={{ color: '#4caf50' }} />
          <Typography variant="h6" component="div">
            PDF Report Generated
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Success Message */}
        <Box sx={{ mb: 3 }}>
          <Chip 
            icon={<CheckCircleIcon />}
            label="Success"
            color="success"
            sx={{ mb: 2 }}
          />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {message}
          </Typography>
        </Box>

        {/* Task Title */}
        {title && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Task:
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              fontStyle: 'italic'
            }}>
              {title}
            </Typography>
          </Box>
        )}

        {/* Data Table */}
        {tableData.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Report Data ({tableData.length} records):
            </Typography>
            <TableContainer 
              component={Paper} 
              sx={{ 
                maxHeight: 300,
                border: '1px solid #e0e0e0',
                borderRadius: 2
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      User ID
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((item, index) => (
                    <TableRow 
                      key={index} 
                      hover
                      sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {item.user_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#fafafa' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Close
        </Button>
        <Button
          onClick={handleOpenPDF}
          variant="contained"
          startIcon={<PdfIcon />}
          endIcon={<OpenInNewIcon />}
          sx={{
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            textTransform: 'none',
            fontWeight: 'medium'
          }}
        >
          Open PDF Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFNotificationPopup;
