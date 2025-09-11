import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloudUpload,
  Send,
  Delete,
  Refresh,
  ExpandMore,
  TableChart,
  Analytics,
  Description,
  CheckCircle,
  Error,
  Info,
  FilePresent,
  Close
} from '@mui/icons-material';
import DynamicDataVisualization from './mui/DynamicDataVisualization';

const DataAnalysisWorkbench = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [connectionId, setConnectionId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [query, setQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, document: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Generate a new connection ID
  const generateConnectionId = () => {
    const newId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConnectionId(newId);
    return newId;
  };

  // Initialize with a connection ID
  useEffect(() => {
    if (!connectionId) {
      generateConnectionId();
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
        setFile(null);
      }
    }
  }, []);

  // Upload file
  const handleUpload = async () => {
    if (!file || !connectionId) {
      setError('Please select a file and ensure connection ID is available');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/v1/data-analysis/upload/${connectionId}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
        setUploadSuccess(true);
        setSnackbar({
          open: true,
          message: 'File uploaded successfully!',
          severity: 'success'
        });
        await loadDocuments();
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Load documents for current connection
  const loadDocuments = async () => {
    if (!connectionId) return;
    
    setLoadingDocuments(true);
    try {
      const response = await fetch(`/api/v1/data-analysis/documents/${connectionId}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentKey) => {
    try {
      const response = await fetch(`/api/v1/data-analysis/documents/${connectionId}/${documentKey}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Document deleted successfully',
          severity: 'success'
        });
        await loadDocuments();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Delete failed',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Delete failed: ' + err.message,
        severity: 'error'
      });
    }
    setDeleteDialog({ open: false, document: null });
  };

  // Analyze data with natural language query
  const handleAnalyze = async () => {
    if (!query.trim() || !connectionId || !uploadResult?.document_key) {
      setError('Please upload a file and enter a query');
      return;
    }

    setAnalyzing(true);
    setError('');
    
    try {
      const response = await fetch(`/api/v1/data-analysis/analyze/${connectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_key: uploadResult.document_key,
          question: query.trim()
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result);
        setSnackbar({
          open: true,
          message: 'Analysis completed successfully!',
          severity: 'success'
        });
      } else {
        setError(result.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Sample queries
  const sampleQueries = [
    "Show me the pipeline data by region",
    "What are the top performing branches?", 
    "Analyze the disbursement trends",
    "Show collection performance by status",
    "Compare targets vs achievements"
  ];

  const handleSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
          Data Analysis Workbench
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upload Excel files and analyze data using natural language queries
        </Typography>
        
        {connectionId && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Connection: ${connectionId}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CloudUpload color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  File Upload
                </Typography>
              </Box>

              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Description />}
                  fullWidth
                  sx={{ mb: 2, py: 2 }}
                >
                  Select Excel/CSV File
                </Button>
              </label>

              {file && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilePresent color="primary" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file || uploading}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload sx={{ mr: 1 }} />
                    Upload File
                  </>
                )}
              </Button>

              {uploadResult && uploadSuccess && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: '#e8f5e8',
                  borderRadius: 2,
                  border: '2px solid #4caf50',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Shimmer effect */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.6), transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Bouncing Excel Icon */}
                    <Box sx={{ 
                      position: 'relative',
                      animation: 'bounce 1s infinite'
                    }}>
                      <Box
                        component="img"
                        src="/excel.png"
                        alt="Excel File"
                        sx={{
                          width: 48,
                          height: 48,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                        }}
                      />
                      {/* Success badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 20,
                        height: 20,
                        backgroundColor: '#4caf50',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                      }}>
                        <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                      </Box>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5
                      }}>
                        Upload Successful!
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${uploadResult.shape?.[0]} rows`}
                          size="small"
                          sx={{ 
                            backgroundColor: '#c8e6c9',
                            color: '#2e7d32',
                            fontWeight: 500
                          }}
                        />
                        <Chip 
                          label={`${uploadResult.shape?.[1]} columns`}
                          size="small"
                          sx={{ 
                            backgroundColor: '#c8e6c9',
                            color: '#2e7d32',
                            fontWeight: 500
                          }}
                        />
                        <Chip 
                          label="Ready"
                          size="small"
                          sx={{ 
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* CSS animations */}
                  <style jsx>{`
                    @keyframes bounce {
                      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                      40% { transform: translateY(-8px); }
                      60% { transform: translateY(-4px); }
                    }
                    @keyframes shimmer {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(100%); }
                    }
                  `}</style>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Query Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Analytics color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Natural Language Query
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Ask a question about your data"
                placeholder="e.g., Show me the top 10 regions by total collection amount"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!uploadResult}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={!query.trim() || !uploadResult || analyzing}
                fullWidth
                sx={{ py: 1.5, mb: 2 }}
              >
                {analyzing ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send sx={{ mr: 1 }} />
                    Analyze Data
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </Grid>

        {/* Upload Result Details */}
        {uploadResult && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TableChart color="primary" />
                  <Typography variant="h6">File Details</Typography>
                  {uploadResult.sheets && (
                    <Chip label={`${uploadResult.sheets.length} sheets`} size="small" color="primary" />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* File Info */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      File Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Connection ID" 
                          secondary={uploadResult.connection_id} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Document Key" 
                          secondary={uploadResult.document_key} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Dimensions" 
                          secondary={`${uploadResult.shape?.[0]} rows × ${uploadResult.shape?.[1]} columns`} 
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  {/* Available Sheets */}
                  {uploadResult.sheets && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Available Sheets
                      </Typography>
                      <List dense>
                        {uploadResult.sheets.map((sheet, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={sheet.name} 
                              secondary={`${sheet.rows} rows × ${sheet.columns} columns`} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}

                  {/* Data Preview */}
                  {uploadResult.preview && uploadResult.preview.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Data Preview
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              {Object.keys(uploadResult.preview[0]).slice(0, 8).map((column) => (
                                <TableCell key={column} sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                                  {column}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {uploadResult.preview.slice(0, 5).map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).slice(0, 8).map((value, colIndex) => (
                                  <TableCell key={colIndex}>
                                    {String(value).length > 20 ? `${String(value).substring(0, 20)}...` : String(value)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <Grid item xs={12}>
            <DynamicDataVisualization
              data={analysisResult.analysis_result?.supporting_data || []}
              question={analysisResult.question}
              title="Analysis Results"
              analysisResult={analysisResult}
              showPieChart={true}
              loading={false}
              uploadSuccess={false}
            />
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, document: null })}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, document: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteDocument(deleteDialog.document)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataAnalysisWorkbench;
