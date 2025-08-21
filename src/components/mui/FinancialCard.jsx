import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { CurrencyRupee } from '@mui/icons-material';

const FinancialCard = ({ 
  title, 
  amount, 
  subtitle, 
  chipLabel,
  showCard = true,
  sx = {},
  ...props 
}) => {
  // Format number with Indian currency formatting (lakhs, crores)
  const formatIndianCurrency = (num) => {
    if (!num && num !== 0) return '0';
    
    const number = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
    
    // Convert to Indian numbering system
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(number);
  };

  if (!showCard) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
        minWidth: 280,
        maxWidth: 400,
        ...sx 
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Title */}
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.9, 
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 1
          }}
        >
          {title}
        </Typography>

        {/* Amount with Rupee Symbol */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CurrencyRupee sx={{ fontSize: 28, mr: 0.5 }} />
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            {formatIndianCurrency(amount)}
          </Typography>
        </Box>

        {/* Subtitle */}
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8,
              mb: chipLabel ? 2 : 0
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Optional Chip */}
        {chipLabel && (
          <Chip 
            label={chipLabel}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialCard;
