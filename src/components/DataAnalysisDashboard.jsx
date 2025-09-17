import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Upload,
  Analytics,
  Description,
  Delete,
  Refresh,
  ExpandMore,
  QuestionAnswer,
  Assessment,
  TableChart
} from '@mui/icons-material';
import FileUpload from './mui/FileUpload';
import DynamicDataVisualization from './mui/DynamicDataVisualization';
import { dataAnalysisApi } from '../lib/api/dataAnalysisApi';

const DataAnalysisDashboard = () => {
  // State management
  const [connectionId, setConnectionId] = useState('demo-connection-123');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [analysisQuestion, setAnalysisQuestion] = useState('');
  const [analysisContext, setAnalysisContext] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Sample questions for quick selection
  const sampleQuestions = [
    "How many customers completed loan disbursement?",
    "What is the distribution of loan statuses?",
    "Which level has the highest completion rate?",
    "Show me the trend analysis of customer applications",
    "What percentage of applications are successful?"
  ];

  // Load documents on mount and when connection changes
  const loadDocuments = useCallback(async () => {
    if (!connectionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dataAnalysisApi.listDocuments(connectionId);
      setDocuments(response.documents || []);
    } catch (err) {
      setError(`Failed to load documents: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId]);

  // Check API health
  const checkHealth = async () => {
    try {
      const response = await dataAnalysisApi.healthCheck();
      setHealthStatus(response);
      setSuccess('API is healthy and ready!');
    } catch (err) {
      setError(`Health check failed: ${err.message}`);
      setHealthStatus(null);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!connectionId) {
      setError('Please enter a connection ID first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dataAnalysisApi.uploadDocument(
        connectionId, 
        file, 
        'Document uploaded for analysis'
      );
      
      setSuccess(`Document "${response.message}" uploaded successfully!`);
      
      // Add the new document to the list
      const newDoc = {
        document_key: response.document_key,
        filename: file.name,
        shape: response.shape,
        columns: response.columns,
        upload_time: new Date().toISOString()
      };
      
      setDocuments(prev => [...prev, newDoc]);
      setSelectedDocument(newDoc);
      
      return response;
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle data analysis
  const handleAnalysis = async () => {
    if (!selectedDocument || !analysisQuestion) {
      setError('Please select a document and enter an analysis question');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: "vaishakh_dashboard",
          message: analysisQuestion,
          conversation_id: connectionId,
          document_key: selectedDocument.document_key
        }),
      });

      const result = await response.json();
      
      setAnalysisResult(result);
      setSuccess('Analysis completed successfully!');
      
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentKey) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await dataAnalysisApi.deleteDocument(connectionId, documentKey);
      setDocuments(prev => prev.filter(doc => doc.document_key !== documentKey));
      
      if (selectedDocument?.document_key === documentKey) {
        setSelectedDocument(null);
        setAnalysisResult(null);
      }
      
      setSuccess('Document deleted successfully!');
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          📊 Data Analysis Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Upload Excel/CSV files and perform AI-powered data analysis with beautiful visualizations
        </Typography>
        
        {/* Health Check */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={checkHealth}
            size="small"
          >
            Check API Health
          </Button>
          {healthStatus && (
            <Chip 
              label={`${healthStatus.status} - ${healthStatus.documents_in_memory} docs in memory`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Panel - Upload & Configuration */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload /> Upload & Configuration
              </Typography>
              
              {/* Connection ID */}
              <TextField
                label="Connection ID"
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
                helperText="Unique identifier for your data analysis session"
              />
              
              {/* File Upload */}
              <FileUpload
                label="Upload Data File"
                onFileSelect={(file) => console.log('File selected:', file.name)}
                onActualUpload={handleFileUpload}
                acceptedFileTypes={['.xlsx', '.xls', '.csv']}
                maxFileSize={10 * 1024 * 1024}
              />
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description /> Documents ({documents.length})
                </Typography>
                <Tooltip title="Refresh documents">
                  <IconButton onClick={loadDocuments} size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No documents uploaded yet
                </Typography>
              ) : (
                <List dense>
                  {documents.map((doc) => (
                    <ListItem
                      key={doc.document_key}
                      component="button"
                      selected={selectedDocument?.document_key === doc.document_key}
                      onClick={() => setSelectedDocument(doc)}
                      sx={{ 
                        borderRadius: 1, 
                        mb: 1,
                        border: selectedDocument?.document_key === doc.document_key 
                          ? '2px solid #1976d2' 
                          : '1px solid #e0e0e0'
                      }}
                    >
                      <ListItemText
                        primary={doc.filename}
                        secondary={`${doc.shape?.[0] || 0} rows × ${doc.shape?.[1] || 0} cols`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.document_key);
                          }}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Analysis & Visualization */}
        <Grid item xs={12} lg={8}>
          {/* Analysis Configuration */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics /> AI Analysis Configuration
              </Typography>
              
              {/* Sample Questions */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2">📝 Sample Questions (Click to Use)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {sampleQuestions.map((question, index) => (
                      <Chip
                        key={index}
                        label={question}
                        variant="outlined"
                        clickable
                        size="small"
                        onClick={() => setAnalysisQuestion(question)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <TextField
                label="Analysis Question"
                value={analysisQuestion}
                onChange={(e) => setAnalysisQuestion(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
                placeholder="e.g., How many customers completed loan disbursement?"
                helperText="Ask any question about your data - AI will analyze and provide insights"
              />
              
              <TextField
                label="Additional Context (Optional)"
                value={analysisContext}
                onChange={(e) => setAnalysisContext(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 3 }}
                placeholder="Provide additional context to help AI understand your data better"
              />
              
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <QuestionAnswer />}
                onClick={handleAnalysis}
                disabled={!selectedDocument || !analysisQuestion || isLoading}
                size="large"
                fullWidth
              >
                {isLoading ? 'Analyzing...' : 'Analyze Data'}
              </Button>
            </CardContent>
          </Card>

          {/* Visualization Results */}
          {analysisResult && (
            <Paper sx={{ p: 0 }}>
              <DynamicDataVisualization
                data={analysisResult.analysis_result?.supporting_data || []}
                question={analysisResult.question}
                title="Analysis Results"
                analysisResult={analysisResult}
                showPieChart={true}
              />
            </Paper>
          )}
          
          {/* No Data State */}
          {!analysisResult && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <TableChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ready for Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload a document and ask a question to see beautiful visualizations here
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataAnalysisDashboard;
