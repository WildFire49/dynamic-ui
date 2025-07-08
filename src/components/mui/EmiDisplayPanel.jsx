import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

const EmiDisplayPanel = ({ title, emiDetails, sx }) => {
  const { principal, interestRate, tenure, emi, totalInterest, totalAmount } = emiDetails || {};

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  return (
    <Paper 
      elevation={3} 
      sx={{
        p: 3,
        width: '100%',
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...sx
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        {title || 'Loan Repayment Details'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Principal Amount</Typography>
          <Typography variant="h6">{formatCurrency(principal)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Interest Rate</Typography>
          <Typography variant="h6">{interestRate}% p.a.</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Loan Tenure</Typography>
          <Typography variant="h6">{tenure} months</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Monthly EMI</Typography>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>{formatCurrency(emi)}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">Total Payable Amount</Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalAmount)}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
        (Principal: {formatCurrency(principal)} + Interest: {formatCurrency(totalInterest)})
      </Typography>
    </Paper>
  );
};

export default EmiDisplayPanel;
