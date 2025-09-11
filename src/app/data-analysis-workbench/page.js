'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Home, Analytics } from '@mui/icons-material';
import DataAnalysisWorkbench from '../../components/DataAnalysisWorkbench';

export default function DataAnalysisWorkbenchPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Container maxWidth={false} sx={{ py: 3 }}>
        {/* Breadcrumb Navigation */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'white', borderRadius: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}
              href="/"
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
              color="text.primary"
            >
              <Analytics sx={{ mr: 0.5 }} fontSize="inherit" />
              Data Analysis Workbench
            </Typography>
          </Breadcrumbs>
        </Paper>

        {/* Main Content */}
        <DataAnalysisWorkbench />
      </Container>
    </Box>
  );
}
