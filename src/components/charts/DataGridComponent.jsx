import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { TableChart, FileDownload } from '@mui/icons-material';

const DataGridComponent = ({ 
  rows = [], 
  columns = [], 
  title = "Data Table",
  showSaveButton = false,
  onSave,
  onExport,
  height = 400
}) => {
  if (!rows || rows.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No data available for table
      </Typography>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: height + 200,
      border: 'none',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: '1px solid #f3f4f6',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: '#1a1a1a',
              fontSize: '1.125rem',
              letterSpacing: '-0.025em'
            }}>
              {title} ({rows.length} records)
            </Typography>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {showSaveButton && onSave && (
              <Button
                variant="contained"
                size="small"
                startIcon={<TableChart />}
                onClick={onSave}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Save to Dashboard
              </Button>
            )}
            {onExport && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownload />}
                onClick={onExport}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                Export
              </Button>
            )}
          </Box>
        </Box>

        {/* Data Grid */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ height: height, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8fafc',
                  fontWeight: 600
                },
                '& .MuiDataGrid-footerContainer': {
                  minHeight: '52px',
                  backgroundColor: '#fafafa'
                },
                '& .MuiDataGrid-root': {
                  border: 'none'
                }
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataGridComponent;
