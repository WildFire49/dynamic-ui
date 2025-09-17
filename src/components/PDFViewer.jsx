"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, IconButton, Paper, Stack, Tooltip, alpha, useTheme } from '@mui/material';
import { ZoomIn, ZoomOut, NavigateBefore, NavigateNext, PictureAsPdf, Fullscreen } from '@mui/icons-material';

// Dynamic import for react-pdf to avoid SSR issues
let Document, Page, pdfjs;

if (typeof window !== 'undefined') {
  const reactPdf = require('react-pdf');
  Document = reactPdf.Document;
  Page = reactPdf.Page;
  pdfjs = reactPdf.pdfjs;
  
  // Set up PDF.js worker - using CDN for reliability
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

const PDFViewer = ({ file, width = '100%', maxHeight = 500, borderRadius = 8 }) => {
  const theme = useTheme();
  
  // If react-pdf is not available (SSR), show fallback
  if (!Document || !Page || !pdfjs) {
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
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
      }}>
        <PictureAsPdf sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
          PDF Viewer Loading...
        </Typography>
      </Paper>
    );
  }
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    // Reset state when file changes
    setLoading(true);
    setError(false);
    setPageNumber(1);
    
    if (!file) {
      setError(true);
      setLoading(false);
      return;
    }

    // Create a URL for the file if it's a Blob or File object
    if (file instanceof Blob || file instanceof File) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      
      // Clean up the URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof file === 'string') {
      // If file is already a URL string
      setFileUrl(file);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError(true);
    setLoading(false);
  };

  const onPageLoadSuccess = () => {
    console.log('Page loaded successfully');
  };

  const onPageLoadError = (error) => {
    console.error('Error loading page:', error);
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
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.05)}, transparent 70%)`,
          zIndex: 0
        }
      }}>
        <PictureAsPdf sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2, zIndex: 1 }} />
        <Typography color="text.secondary" sx={{ zIndex: 1, fontWeight: 500 }}>
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
        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}, 0 8px 32px rgba(0,0,0,0.08)`,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, transparent 50%)`,
          zIndex: 0,
          pointerEvents: 'none'
        }
      }}
    >
      {/* Premium PDF Header */}
      <Box sx={{ 
        p: 2, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          animation: loading ? 'shimmer 2s infinite' : 'none'
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)'
          }}>
            {pageNumber} of {numPages || '-'}
          </Typography>
        </Box>
      </Box>

      {/* Premium PDF Content Area */}
      <Box sx={{
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        position: 'relative',
        zIndex: 1
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            width: '100%'
          }}>
            <Box sx={{ 
              position: 'relative',
              mb: 3
            }}>
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: theme.palette.primary.main,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }} 
              />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <PictureAsPdf sx={{ fontSize: 24, color: theme.palette.primary.main }} />
              </Box>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
              Loading PDF
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
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
            p: 4,
            textAlign: 'center'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.2)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}>
              <PictureAsPdf sx={{ fontSize: 40, color: theme.palette.error.main }} />
            </Box>
            <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 600 }}>
              Unable to Load PDF
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              The file may be corrupted, password-protected, or in an unsupported format. Please try a different file.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            '& .react-pdf__Document': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            '& .react-pdf__Page': {
              maxWidth: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)'
            },
            '& .react-pdf__Page__canvas': {
              maxWidth: '100%',
              height: 'auto !important'
            }
          }}>
            {Document && Page && (
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={{
                  cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                }}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                  onLoadError={onPageLoadError}
                  width={Math.min(400, typeof window !== 'undefined' ? window.innerWidth - 100 : 400)}
                />
              </Document>
            )}
          </Box>
        )}
      </Box>

      {/* Premium PDF Controls */}
      {!loading && !error && numPages > 0 && (
        <Box sx={{
          p: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`,
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          zIndex: 2
        }}>
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="center"
            alignItems="center"
          >
            <Tooltip title="Previous page" arrow>
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handlePrevPage} 
                  disabled={pageNumber <= 1}
                  sx={{ 
                    color: pageNumber <= 1 ? 'action.disabled' : theme.palette.primary.main,
                    background: pageNumber <= 1 ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                    border: '1px solid',
                    borderColor: pageNumber <= 1 ? 'action.disabled' : alpha(theme.palette.primary.main, 0.2),
                    '&:hover': {
                      background: pageNumber <= 1 ? 'transparent' : alpha(theme.palette.primary.main, 0.15),
                      transform: pageNumber <= 1 ? 'none' : 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <NavigateBefore />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title={`Zoom out (${Math.round(scale * 100)}%)`} arrow>
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handleZoomOut} 
                  disabled={scale <= 0.5}
                  sx={{ 
                    color: scale <= 0.5 ? 'action.disabled' : theme.palette.primary.main,
                    background: scale <= 0.5 ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                    border: '1px solid',
                    borderColor: scale <= 0.5 ? 'action.disabled' : alpha(theme.palette.primary.main, 0.2),
                    '&:hover': {
                      background: scale <= 0.5 ? 'transparent' : alpha(theme.palette.primary.main, 0.15),
                      transform: scale <= 0.5 ? 'none' : 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ZoomOut fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            
            <Box sx={{
              px: 2,
              py: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              borderRadius: '20px',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              minWidth: '80px',
              textAlign: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              {Math.round(scale * 100)}%
            </Box>
            
            <Tooltip title={`Zoom in (${Math.round(scale * 100)}%)`} arrow>
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handleZoomIn} 
                  disabled={scale >= 2.5}
                  sx={{ 
                    color: scale >= 2.5 ? 'action.disabled' : theme.palette.primary.main,
                    background: scale >= 2.5 ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                    border: '1px solid',
                    borderColor: scale >= 2.5 ? 'action.disabled' : alpha(theme.palette.primary.main, 0.2),
                    '&:hover': {
                      background: scale >= 2.5 ? 'transparent' : alpha(theme.palette.primary.main, 0.15),
                      transform: scale >= 2.5 ? 'none' : 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ZoomIn fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Next page" arrow>
              <span>
                <IconButton 
                  size="medium" 
                  onClick={handleNextPage} 
                  disabled={pageNumber >= numPages}
                  sx={{ 
                    color: pageNumber >= numPages ? 'action.disabled' : theme.palette.primary.main,
                    background: pageNumber >= numPages ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                    border: '1px solid',
                    borderColor: pageNumber >= numPages ? 'action.disabled' : alpha(theme.palette.primary.main, 0.2),
                    '&:hover': {
                      background: pageNumber >= numPages ? 'transparent' : alpha(theme.palette.primary.main, 0.15),
                      transform: pageNumber >= numPages ? 'none' : 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
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

export default PDFViewer;