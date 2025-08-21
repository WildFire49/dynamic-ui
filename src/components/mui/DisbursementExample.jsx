import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import FinancialCard from './FinancialCard';

const DisbursementExample = () => {
  const [showCard, setShowCard] = useState(true);
  const [disbursementData, setDisbursementData] = useState({
    amount: 3034142.80,
    title: 'TOTAL DISBURSED TODAY',
    subtitle: 'How much got disbursed today?',
    chipLabel: 'Total'
  });

  const toggleCard = () => {
    setShowCard(!showCard);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Disbursement Dashboard
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={toggleCard}
          sx={{ mr: 2 }}
        >
          {showCard ? 'Hide Card' : 'Show Card'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FinancialCard
            title={disbursementData.title}
            amount={disbursementData.amount}
            subtitle={disbursementData.subtitle}
            chipLabel={disbursementData.chipLabel}
            showCard={showCard}
          />
        </Grid>
        
        {/* Additional cards can be added here */}
        <Grid item xs={12} sm={6} md={4}>
          <FinancialCard
            title="MONTHLY DISBURSEMENTS"
            amount={15234567.50}
            subtitle="Total disbursed this month"
            chipLabel="Monthly"
            showCard={showCard}
            sx={{ 
              background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FinancialCard
            title="PENDING DISBURSEMENTS"
            amount={2456789.25}
            subtitle="Amount pending for disbursement"
            chipLabel="Pending"
            showCard={showCard}
            sx={{ 
              background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
            }}
          />
        </Grid>
      </Grid>

      {/* Data section similar to your interface */}
      {showCard && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Data
          </Typography>
          <Box sx={{ 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            backgroundColor: '#f5f5f5'
          }}>
            <Typography variant="body2" color="text.secondary">
              Total Disbursements
            </Typography>
            <Typography variant="h6">
              ₹{new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(disbursementData.amount)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button 
                size="small" 
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Total
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              1 record
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DisbursementExample;
