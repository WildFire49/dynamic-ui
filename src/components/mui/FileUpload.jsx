import React, { useState, useCallback } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  AttachFile,
  CloudUpload,
  Description,
  TableChart,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

const FileUpload = ({ 
  label,
  onFileSelect,
  onUploadComplete,
  acceptedFileTypes = ['.xlsx', '.xls', '.csv'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  sx,
  ...props 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');

  const validateFile = (file) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedFileTypes.join(', ')}`;
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size: ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`;
    }
    
    return null;
  };

  const handleFileSelect = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
    setErrorMessage('');
    
    if (onFileSelect) {
      onFileSelect(file);
    }
  }, [onFileSelect, acceptedFileTypes, maxFileSize]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleActualUpload = async () => {
    if (!selectedFile || !props.onActualUpload) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setErrorMessage('');
    
    try {
      // Simulate progress for visual feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 100);
      
      const result = await props.onActualUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'csv') {
      return <TableChart color="success" />;
    }
    return <Description color="primary" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ ...sx, my: 2 }}>
      {/* Drag and Drop Area */}
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: isDragOver ? '2px dashed #1976d2' : '2px dashed #e0e0e0',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragOver ? '#f3f8ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f8faff',
          }
        }}
      >
        <CloudUpload 
          sx={{ 
            fontSize: 48, 
            color: isDragOver ? '#1976d2' : '#9e9e9e',
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          {selectedFile ? 'File Selected' : 'Upload Excel or CSV File'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop your file here, or click to browse
        </Typography>
        
        <Button
          variant="contained"
          component="label"
          startIcon={<AttachFile />}
          sx={{ mb: 2 }}
        >
          {label || 'Choose File'}
          <input
            type="file"
            hidden
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileChange}
          />
        </Button>
        
        <Typography variant="caption" display="block" color="text.secondary">
          Supported formats: {acceptedFileTypes.join(', ')} 
          (Max {(maxFileSize / (1024 * 1024)).toFixed(1)}MB)
        </Typography>
      </Paper>

      {/* Selected File Info */}
      {selectedFile && (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getFileIcon(selectedFile.name)}
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {uploadStatus === 'success' && (
                <Chip 
                  icon={<CheckCircle />} 
                  label="Uploaded" 
                  color="success" 
                  size="small" 
                />
              )}
              {uploadStatus === 'error' && (
                <Chip 
                  icon={<ErrorIcon />} 
                  label="Failed" 
                  color="error" 
                  size="small" 
                />
              )}
              {!isUploading && uploadStatus !== 'success' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleActualUpload}
                  disabled={!!uploadStatus}
                >
                  Upload
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Paper>
      )}

      {/* Error Message */}
      {uploadStatus === 'error' && errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Success Message */}
      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          File uploaded successfully! Ready for analysis.
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
