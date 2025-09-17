import React, { useState, useCallback } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Divider
} from '@mui/material';
import {
  AttachFile,
  CloudUpload,
  Description,
  TableChart,
  CheckCircle,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  NoteAdd,
  InsertDriveFile,
  Refresh
} from '@mui/icons-material';

const FileUpload = ({ 
  label,
  onFileSelect,
  onUploadComplete,
  onFileRemove, // New prop for handling file removal
  acceptedFileTypes = ['.xlsx', '.xls', '.csv'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowMultiple = false, // New prop to enable multiple files
  sx,
  ...props 
}) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // For multiple files
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
    const files = event.target.files;
    if (files && files.length > 0) {
      if (allowMultiple) {
        Array.from(files).forEach(file => handleFileSelect(file));
      } else {
        handleFileSelect(files[0]);
      }
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleRemoveFile = (fileToRemove = null) => {
    if (allowMultiple && fileToRemove) {
      const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
      setSelectedFiles(updatedFiles);
      if (onFileRemove) {
        onFileRemove(fileToRemove, updatedFiles);
      }
    } else {
      setSelectedFile(null);
      setSelectedFiles([]);
      setUploadStatus(null);
      setErrorMessage('');
      setUploadProgress(0);
      if (onFileRemove) {
        onFileRemove(selectedFile || fileToRemove, []);
      }
    }
  };

  const handleAddMoreFiles = () => {
    // Trigger file input click
    document.getElementById('file-upload-input').click();
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
          border: isDragOver 
            ? `2px dashed ${theme.palette.primary.main}` 
            : `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragOver 
            ? alpha(theme.palette.primary.main, 0.08) 
            : theme.palette.background.default,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.03)}, transparent 70%)`,
            zIndex: 0
          },
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 2 }}>
          <CloudUpload 
            sx={{ 
              fontSize: 64, 
              color: isDragOver ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.6),
              transition: 'all 0.3s ease',
              filter: isDragOver ? 'drop-shadow(0 4px 8px rgba(0,120,215,0.3))' : 'none'
            }} 
          />
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            {selectedFile ? 'File Selected ✨' : (allowMultiple ? 'Upload Your Files' : 'Upload Your File')}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: '0.95rem',
              lineHeight: 1.4
            }}
          >
            Drag and drop your {allowMultiple ? 'files' : 'file'} here, or click the button below to browse
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1, mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<NoteAdd />}
            size="large"
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            {label || (allowMultiple ? 'Choose Files' : 'Choose File')}
            <input
              id="file-upload-input"
              type="file"
              hidden
              multiple={allowMultiple}
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileChange}
            />
          </Button>
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="caption" 
            display="block" 
            color="text.secondary"
            sx={{
              fontSize: '0.85rem',
              background: alpha(theme.palette.primary.main, 0.05),
              py: 1,
              px: 2,
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            📁 Supported: {acceptedFileTypes.join(', ')} • Max size: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
          </Typography>
        </Box>
      </Paper>

      {/* Selected Files Display */}
      {selectedFile && (
        <Paper 
          elevation={2}
          sx={{ 
            mt: 3,
            borderRadius: 3,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                📎 Selected File
              </Typography>
              {allowMultiple && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<NoteAdd />}
                  onClick={handleAddMoreFiles}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Add More
                </Button>
              )}
            </Stack>
          </Box>

          {/* File Item */}
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              {/* File Icon */}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                {getFileIcon(selectedFile.name)}
              </Box>

              {/* File Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body1" 
                  fontWeight={600}
                  sx={{ 
                    mb: 0.5,
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                </Typography>
                {selectedFile.lastModified && (
                  <Typography variant="caption" color="text.secondary">
                    Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {uploadStatus === 'success' && (
                  <Chip 
                    icon={<CheckCircle />} 
                    label="Uploaded" 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                {uploadStatus === 'error' && (
                  <Chip 
                    icon={<ErrorIcon />} 
                    label="Failed" 
                    color="error" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                
                {!isUploading && uploadStatus !== 'success' && props.onActualUpload && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleActualUpload}
                    disabled={!!uploadStatus}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 80
                    }}
                  >
                    Upload
                  </Button>
                )}

                <Tooltip title="Remove file" arrow>
                  <IconButton 
                    onClick={() => handleRemoveFile()}
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                      background: alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        background: alpha(theme.palette.error.main, 0.2),
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Box>
          
          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ 
              mx: 3,
              mb: 3, 
              p: 2,
              background: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <CircularProgress 
                  size={20} 
                  thickness={4}
                  sx={{ color: theme.palette.primary.main }}
                />
                <Typography variant="body2" fontWeight={500} color="primary">
                  Uploading... {uploadProgress}%
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                  }
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Status Messages */}
      {uploadStatus === 'error' && errorMessage && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.15)}`
          }}
          icon={<ErrorIcon />}
        >
          <Typography fontWeight={500}>
            {errorMessage}
          </Typography>
        </Alert>
      )}

      {uploadStatus === 'success' && (
        <Alert 
          severity="success" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`
          }}
          icon={<CheckCircle />}
        >
          <Typography fontWeight={500}>
            🎉 File uploaded successfully! Ready for analysis.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
