import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import DynamicRenderer from '@/lib/dynamic-ui/DynamicRenderer';
import { welcomeScreenSchema } from '@/lib/dynamic-ui/mock-schema';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          MiFiX UI Renderer
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          This interface is dynamically generated based on a WorkFlow Schema 
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <DynamicRenderer schema={welcomeScreenSchema.ui_components} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
