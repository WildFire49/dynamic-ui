"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, CircularProgress, IconButton, Paper, Stack, Tooltip, alpha } from '@mui/material';
import { ZoomIn, ZoomOut, NavigateBefore, NavigateNext, PictureAsPdf } from '@mui/icons-material';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewerClient = ({ file, width = '100%', maxHeight = 500, borderRadius = 8 }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setPageNumber(1);
    
    if (!file) {
      setError(true);
      setLoading(false);
      return;
    }

    if (file instanceof Blob || file instanceof File) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof file === 'string') {
      setFileUrl(file);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError(true);
    setLoading(false);
  };

  const handlePrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  if (!file) {
    return (
      <Paper sx={{ 
        p: 6, 
        textAlign: 'center', 
        borderRadius: `${borderRadius}px`, 
        height: 200, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '2px dashed rgba(255, 87, 34, 0.2)',
      }}>
        <PictureAsPdf sx={{ fontSize: 48, color: '#FF5722', mb: 2 }} />
        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
          No PDF file selected
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{
        width: width,
        maxHeight: maxHeight,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${borderRadius}px`,
        boxShadow: '0 20px 40px rgba(255, 87, 34, 0.15), 0 8px 32px rgba(0,0,0,0.08)',
        border: '2px solid rgba(255, 87, 34, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      }}
    >
      {/* PDF Header */}
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #FF5722 0%, #FF8A50 50%, #FFB74D 100%)', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PictureAsPdf sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
              {typeof file === 'string' ? file.split('/').pop() : file.name || 'PDF Preview'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
              {loading ? 'Loading...' : `${numPages || 0} pages`}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 600,
          px: 1.5,
          py: 0.5,
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.15)',
        }}>
          {pageNumber} of {numPages || '-'}
        </Typography>
      </Box>

      {/* PDF Content */}
      <Box sx={{
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
          }}>
            <CircularProgress size={60} sx={{ color: '#FF5722', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: '#FF5722', fontWeight: 600 }}>
              Loading PDF
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we prepare your document...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            textAlign: 'center'
          }}>
            <PictureAsPdf sx={{ fontSize: 40, color: '#f44336', mb: 2 }} />
            <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 600 }}>
              Unable to Load PDF
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The file may be corrupted or in an unsupported format.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            '& .react-pdf__Page': {
              maxWidth: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: '8px',
              overflow: 'hidden',
            },
            '& .react-pdf__Page__canvas': {
              maxWidth: '100%',
              height: 'auto !important'
            }
          }}>
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(400, window.innerWidth - 200)}
              />
            </Document>
          </Box>
        )}
      </Box>

      {/* Controls */}
      {!loading && !error && numPages > 0 && (
        <Box sx={{
          p: 2,
          background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.05), rgba(255, 87, 34, 0.02))',
          borderTop: '1px solid rgba(255, 87, 34, 0.1)',
        }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Tooltip title="Previous page">
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handlePrevPage} 
                  disabled={pageNumber <= 1}
                  sx={{ 
                    color: pageNumber <= 1 ? 'action.disabled' : '#FF5722',
                    '&:hover': { transform: pageNumber <= 1 ? 'none' : 'scale(1.05)' }
                  }}
                >
                  <NavigateBefore />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Zoom out">
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handleZoomOut} 
                  disabled={scale <= 0.5}
                  sx={{ 
                    color: scale <= 0.5 ? 'action.disabled' : '#FF5722',
                    '&:hover': { transform: scale <= 0.5 ? 'none' : 'scale(1.05)' }
                  }}
                >
                  <ZoomOut fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            
            <Box sx={{
              px: 2,
              py: 1,
              background: 'linear-gradient(135deg, #FF5722, #FF8A50)',
              borderRadius: '20px',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              minWidth: '80px',
              textAlign: 'center',
            }}>
              {Math.round(scale * 100)}%
            </Box>
            
            <Tooltip title="Zoom in">
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handleZoomIn} 
                  disabled={scale >= 2.5}
                  sx={{ 
                    color: scale >= 2.5 ? 'action.disabled' : '#FF5722',
                    '&:hover': { transform: scale >= 2.5 ? 'none' : 'scale(1.05)' }
                  }}
                >
                  <ZoomIn fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Next page">
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handleNextPage} 
                  disabled={pageNumber >= numPages}
                  sx={{ 
                    color: pageNumber >= numPages ? 'action.disabled' : '#FF5722',
                    '&:hover': { transform: pageNumber >= numPages ? 'none' : 'scale(1.05)' }
                  }}
                >
                  <NavigateNext />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default PDFViewerClient;
