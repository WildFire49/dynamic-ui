import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Fade,
  Grow,
  CircularProgress
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
  FilterList as FilterIcon,
  ViewColumn as ViewColumnIcon,
  Refresh as RefreshIcon,
  TableView as TableViewIcon,
  Reviews as ReviewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import useReviewStore from '../../lib/stores/reviewStore';
import { keyframes } from '@emotion/react';

// Stunning animations
const slideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const EnhancedDataGrid = ({ 
  title, 
  data = [], 
  height = 500,
  pageSize = 25,
  index = 0,
  exportFileName,
  onRefresh,
  customColumns = null,
  loading = false,
  type = null,
  onReviewClick = null
}) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { getReview } = useReviewStore();
  
  // Check if this is a reviewable table
  const isReviewable = type === 'mismatched_records' && onReviewClick;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 200);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Dynamic column generation
  const columns = useMemo(() => {
    if (customColumns) return customColumns;
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    let baseColumns = Object.keys(firstRow).map(key => {
      const values = data.map(row => row[key]);
      const isNumeric = values.every(val => !isNaN(val) && val !== null && val !== undefined && val !== '');
      const isDate = values.some(val => !isNaN(Date.parse(val)));

      return {
        field: key,
        headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        flex: 1,
        minWidth: 150,
        editable: false
      };
    });
    
    // Add review column for mismatched records as the first column
    if (isReviewable) {
      baseColumns.unshift({
        field: 'review',
        headerName: 'Review',
        width: 220,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          // Use compound key for unique identification
          const recordKey = {
            key_ref: params.row.key_ref,
            mismatch_type: params.row.mismatch_type
          };
          const reviewStatus = getReview(title, recordKey);
          const hasReview = !!reviewStatus;
          
          return (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1.5,
              width: '100%',
              py: 0.5
            }}>
              <IconButton
                size="small"
                onClick={(event) => onReviewClick(event, params.row, title)}
                sx={{
                  width: 32,
                  height: 32,
                  color: 'white',
                  backgroundColor: hasReview 
                    ? (reviewStatus.notMismatch ? '#4caf50' : '#ff9800')
                    : '#f44336',
                  boxShadow: hasReview 
                    ? (reviewStatus.notMismatch ? '0 3px 8px rgba(76, 175, 80, 0.3)' : '0 3px 8px rgba(255, 152, 0, 0.3)')
                    : '0 3px 8px rgba(244, 67, 54, 0.3)',
                  border: '1.5px solid',
                  borderColor: hasReview 
                    ? (reviewStatus.notMismatch ? '#4caf50' : '#ff9800')
                    : '#f44336',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: hasReview 
                      ? (reviewStatus.notMismatch ? '#45a049' : '#f57c00')
                      : '#e53935',
                    transform: 'scale(1.08)',
                    boxShadow: hasReview 
                      ? (reviewStatus.notMismatch ? '0 4px 12px rgba(76, 175, 80, 0.4)' : '0 4px 12px rgba(255, 152, 0, 0.4)')
                      : '0 4px 12px rgba(244, 67, 54, 0.4)',
                  }
                }}
              >
                {hasReview ? (
                  reviewStatus.notMismatch ? <CheckCircleIcon fontSize="small" /> : <ReviewIcon fontSize="small" />
                ) : (
                  <ErrorIcon fontSize="small" />
                )}
              </IconButton>
              
              {hasReview && (
                <Chip
                  label={reviewStatus.notMismatch ? "Not Mismatch" : "Reviewed"}
                  size="small"
                  sx={{
                    backgroundColor: reviewStatus.notMismatch ? '#e8f5e8' : '#fff3e0',
                    color: reviewStatus.notMismatch ? '#2e7d32' : '#ef6c00',
                    border: `1px solid ${reviewStatus.notMismatch ? '#4caf50' : '#ff9800'}`,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              )}
            </Box>
          );
        }
      });
    }
    
    return baseColumns;
  }, [data, customColumns, theme, isReviewable, title, getReview, onReviewClick]);

  // Enhanced search functionality
  const handleSearch = (searchValue) => {
    setSearchText(searchValue);
    
    if (!searchValue) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchValue.toLowerCase())
      )
    );
    
    setFilteredData(filtered);
  };

  // CSV Export functionality
  const exportToCSV = () => {
    const headers = columns.map(col => col.headerName);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
        columns.map(col => {
          const value = row[col.field];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : String(value || '');
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName || `${title?.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ 
      justifyContent: 'space-between', 
      p: 2,
      background: alpha(theme.palette.primary.main, 0.02),
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
    }}>
      <Stack direction="row" spacing={1}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Stack>
      
      <Stack direction="row" spacing={1} alignItems="center">
        {onRefresh && (
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={onRefresh}
              size="small"
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Button
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.05),
              borderColor: theme.palette.primary.main
            }
          }}
        >
          Export CSV
        </Button>
      </Stack>
    </GridToolbarContainer>
  );

  if (loading) {
    return (
      <Paper sx={{ 
        p: 8, 
        textAlign: 'center',
        borderRadius: 3,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.7)} 100%)`
      }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading data...
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ 
        p: 8, 
        textAlign: 'center',
        borderRadius: 3,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.7)} 100%)`
      }}>
        <TableViewIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {title || 'Data will appear here when available'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Fade in={mounted} timeout={1000}>
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          position: 'relative',
          animation: `${slideIn} 0.8s ease-out`,
          animationDelay: `${index * 0.1}s`,
          animationFillMode: 'both',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
            animation: `${shimmer} 2s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Box sx={{
                  p: 1,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white'
                }}>
                  <TableViewIcon sx={{ fontSize: 20 }} />
                </Box>
                
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {title}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  label={`${filteredData.length} records`}
                  size="small" 
                  sx={{
                    background: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    fontWeight: 600
                  }}
                />
                
                {selectedRows.length > 0 && (
                  <Chip 
                    label={`${selectedRows.length} selected`}
                    size="small" 
                    sx={{
                      background: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      fontWeight: 600
                    }}
                  />
                )}
              </Stack>
            </Box>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search all columns..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  background: alpha(theme.palette.background.paper, 0.8),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.4)
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
              sx={{ minWidth: 250 }}
            />
          </Stack>
        </Box>

        {/* Data Grid */}
        <Grow in={mounted} timeout={1200} style={{ transformOrigin: 'center top' }}>
          <Box sx={{ height: height }}>
            <DataGrid
              rows={filteredData.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: pageSize }
                }
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelection) => {
                setSelectedRows(newSelection);
              }}
              slots={{
                toolbar: CustomToolbar
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-main': {
                  borderRadius: 0
                },
                '& .MuiDataGrid-columnHeaders': {
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                    ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  fontSize: '0.875rem',
                  fontWeight: 700
                },
                '& .MuiDataGrid-columnHeader': {
                  '&:focus, &:focus-within': {
                    outline: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                },
                '& .MuiDataGrid-row': {
                  '&:nth-of-type(even)': {
                    background: alpha(theme.palette.action.hover, 0.02)
                  },
                  '&:hover': {
                    background: `${alpha(theme.palette.primary.main, 0.04)} !important`,
                    transform: 'translateX(2px)',
                    transition: 'all 0.2s ease'
                  },
                  '&.Mui-selected': {
                    background: `${alpha(theme.palette.primary.main, 0.08)} !important`,
                    '&:hover': {
                      background: `${alpha(theme.palette.primary.main, 0.12)} !important`
                    }
                  }
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                  '&:focus, &:focus-within': {
                    outline: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                },
                '& .MuiDataGrid-footerContainer': {
                  background: alpha(theme.palette.background.default, 0.5),
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                },
                '& .MuiTablePagination-root': {
                  color: theme.palette.text.secondary
                },
                '& .MuiCheckbox-root': {
                  color: alpha(theme.palette.primary.main, 0.6),
                  '&.Mui-checked': {
                    color: theme.palette.primary.main
                  }
                }
              }}
            />
          </Box>
        </Grow>
      </Paper>
    </Fade>
  );
};

export default React.memo(EnhancedDataGrid);
