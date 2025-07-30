// Customer List Component for KCC workflow
'use client';

import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Chip,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CustomerList = ({ 
  customers = [], 
  onSelect, 
  selectedCustomerId,
  onAction,
  sx,
  ...props 
}) => {
  const [selected, setSelected] = useState(selectedCustomerId);

  const handleSelect = (customer) => {
    setSelected(customer.id);
    if (onSelect) {
      onSelect(customer);
    }
    if (onAction) {
      onAction({
        type: 'customer_select',
        customer: customer
      });
    }
  };

  const mockCustomers = customers.length > 0 ? customers : [
    {
      id: 'CUST001',
      name: 'Rajesh Kumar',
      mobileNumber: '+91 9876543210',
      eligibleLoans: ['Allied Loan', 'Agriculture Loan'],
      selectedLoan: 'Agriculture Loan'
    },
    {
      id: 'CUST002', 
      name: 'Priya Sharma',
      mobileNumber: '+91 9876543211',
      eligibleLoans: ['Allied Loan'],
      selectedLoan: 'Allied Loan'
    },
    {
      id: 'CUST003',
      name: 'Suresh Patel',
      mobileNumber: '+91 9876543212',
      eligibleLoans: ['Agriculture Loan'],
      selectedLoan: 'Agriculture Loan'
    }
  ];

  return (
    <Box sx={{ ...sx }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Credit Accepts Customers
      </Typography>
      
      <Paper elevation={1}>
        <List>
          {mockCustomers.map((customer, index) => (
            <ListItem key={customer.id} disablePadding>
              <ListItemButton
                selected={selected === customer.id}
                onClick={() => handleSelect(customer)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    }
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {customer.name}
                      </Typography>
                      {selected === customer.id && (
                        <CheckCircleIcon color="success" fontSize="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {customer.mobileNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {customer.eligibleLoans.map((loan) => (
                          <Chip
                            key={loan}
                            label={loan}
                            size="small"
                            color={loan === customer.selectedLoan ? 'success' : 'default'}
                            variant={loan === customer.selectedLoan ? 'filled' : 'outlined'}
                            icon={loan === customer.selectedLoan ? <CheckCircleIcon /> : undefined}
                          />
                        ))}
                      </Box>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      
      {selected && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
          <Typography variant="body2" color="success.dark">
            Selected: {mockCustomers.find(c => c.id === selected)?.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomerList;
