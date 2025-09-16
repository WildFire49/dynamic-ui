import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  InputAdornment,
  Tab,
  Tabs
} from '@mui/material';
import {
  Warning,
  Search,
  GetApp,
  AccountBalance,
  SwapHoriz,
  ErrorOutline
} from '@mui/icons-material';

const MissingRecordsTable = ({ 
  data = [], 
  title,
  reconciliationType = 'two-way',
  onExport 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  // Process missing records data based on reconciliation type
  const processedData = useMemo(() => {
    if (!data) return { all: [], bySource: {} };

    let allRecords = [];
    let bySource = {};

    if (reconciliationType === 'three-way') {
      // Handle three-way reconciliation missing records
      if (Array.isArray(data)) {
        data.forEach(record => {
          const processedRecord = {
            reference: record.key_ref || record.reference || 'Unknown',
            status: record.status || 'Missing',
            source: record.source || 'Unknown',
            details: record.details || `Missing in ${record.status?.includes('Missing') ? record.status.replace('Missing in ', '') : 'system'}`,
            type: 'three-way'
          };
          allRecords.push(processedRecord);
          
          if (!bySource[processedRecord.source]) {
            bySource[processedRecord.source] = [];
          }
          bySource[processedRecord.source].push(processedRecord);
        });
      }
    } else {
      // Handle two-way reconciliation missing records
      if (data.missing_in_xmm) {
        data.missing_in_xmm.forEach(record => {
          const processedRecord = {
            reference: record.ktp_sender_ref || record.xmm_ref || record.reference || 'Unknown',
            status: 'Missing in XMM',
            source: 'KTP',
            details: record.details || 'Reference found in KTP but not in XMM',
            type: 'two-way'
          };
          allRecords.push(processedRecord);
        });
      }

      if (data.missing_in_ktp) {
        data.missing_in_ktp.forEach(record => {
          const processedRecord = {
            reference: record.xmm_ref || record.ktp_sender_ref || record.reference || 'Unknown',
            status: 'Missing in KTP',
            source: 'XMM',
            details: record.details || 'Reference found in XMM but not in KTP',
            type: 'two-way'
          };
          allRecords.push(processedRecord);
        });
      }

      if (data.missing_in_sam) {
        data.missing_in_sam.forEach(record => {
          const processedRecord = {
            reference: record.xmm_ref || record.sam_reference || record.reference || 'Unknown',
            status: 'Missing in SAM',
            source: 'XMM',
            details: record.details || 'Reference found in XMM but not in SAM',
            type: 'two-way'
          };
          allRecords.push(processedRecord);
        });
      }

      // Group by source for tabs
      allRecords.forEach(record => {
        if (!bySource[record.source]) {
          bySource[record.source] = [];
        }
        bySource[record.source].push(record);
      });
    }

    return { all: allRecords, bySource };
  }, [data, reconciliationType]);

  // Filter data based on search term and selected tab
  const filteredData = useMemo(() => {
    let dataToFilter = selectedTab === 0 ? 
      processedData.all : 
      (processedData.bySource[Object.keys(processedData.bySource)[selectedTab - 1]] || []);

    if (searchTerm) {
      dataToFilter = dataToFilter.filter(item => 
        item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return dataToFilter;
  }, [processedData, searchTerm, selectedTab]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    if (status?.includes('KTP')) return '#ef4444';
    if (status?.includes('XMM')) return '#f59e0b';
    if (status?.includes('SAM')) return '#8b5cf6';
    return '#6b7280';
  };

  const getStatusIcon = (status) => {
    return <ErrorOutline sx={{ color: getStatusColor(status), fontSize: 18 }} />;
  };

  const getSourceIcon = (source) => {
    return <AccountBalance sx={{ color: '#667eea', fontSize: 18 }} />;
  };

  if (!processedData.all.length) {
    return (
      <Card sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', color: '#64748b' }}>
          <AccountBalance sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="h6">No Missing Records</Typography>
          <Typography variant="body2">All records are properly reconciled</Typography>
        </Box>
      </Card>
    );
  }

  const sourceTabs = Object.keys(processedData.bySource);

  return (
    <Card sx={{ 
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.04)'
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ color: '#f59e0b', fontSize: 24 }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                letterSpacing: '-0.025em'
              }}>
                {title}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`${filteredData.length} Missing`}
                size="small"
                sx={{ 
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 600
                }}
              />
              <Chip 
                label={reconciliationType === 'three-way' ? '3-Way' : '2-Way'}
                size="small"
                sx={{ 
                  backgroundColor: '#e0e7ff',
                  color: '#4338ca',
                  fontWeight: 600
                }}
              />
              {onExport && (
                <Tooltip title="Export Missing Records">
                  <IconButton size="small" onClick={onExport}>
                    <GetApp sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Search Control */}
          <TextField
            size="small"
            placeholder="Search missing records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#64748b' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        {/* Source Tabs */}
        {sourceTabs.length > 0 && (
          <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ px: 3 }}
            >
              <Tab 
                label={`All (${processedData.all.length})`}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              {sourceTabs.map((source, index) => (
                <Tab 
                  key={source}
                  label={`${source} (${processedData.bySource[source].length})`}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                  Reference
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                  Source System
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                  Details
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>
                  Impact
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow 
                    key={row.reference + index}
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: '#f1f5f9' },
                      borderLeft: `3px solid ${getStatusColor(row.status)}`
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(row.status)
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          fontFamily: 'monospace',
                          color: '#374151'
                        }}>
                          {row.reference}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getSourceIcon(row.source)}
                        <Chip 
                          label={row.source}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: '#667eea',
                            color: '#667eea',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(row.status)}
                        <Typography variant="body2" sx={{ 
                          color: getStatusColor(row.status),
                          fontWeight: 600
                        }}>
                          {row.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {row.details}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="HIGH"
                        size="small"
                        sx={{ 
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
            <Search sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="h6">No Results Found</Typography>
            <Typography variant="body2">
              {searchTerm ? 'Try adjusting your search criteria' : 'No missing records in this category'}
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e2e8f0' }}
          />
        )}

        {/* Summary Footer */}
        <Box sx={{ 
          p: 3, 
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
            <strong>{processedData.all.length}</strong> total missing records across{' '}
            <strong>{sourceTabs.length}</strong> source systems
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MissingRecordsTable;
