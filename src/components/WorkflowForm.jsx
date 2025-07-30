import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';

const WorkflowForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    bank: '',
    product: '',
    request: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.bank || !formData.product || !formData.request.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Clear form after successful submission
      setFormData({ bank: '', product: '', request: '' });
    } catch (error) {
      console.error('Error submitting workflow request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.bank && formData.product && formData.request.trim();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Bank</InputLabel>
            <Select
              value={formData.bank}
              label="Bank"
              onChange={handleChange('bank')}
            >
              <MenuItem value="federal">Federal Bank</MenuItem>
              <MenuItem value="sbi">State Bank of India</MenuItem>
              <MenuItem value="hdfc">HDFC Bank</MenuItem>
              <MenuItem value="icici">ICICI Bank</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Product</InputLabel>
            <Select
              value={formData.product}
              label="Product"
              onChange={handleChange('product')}
            >
              <MenuItem value="kcc">Kisan Credit Card (KCC)</MenuItem>
              <MenuItem value="personal-loan">Personal Loan</MenuItem>
              <MenuItem value="home-loan">Home Loan</MenuItem>
              <MenuItem value="business-loan">Business Loan</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Modification Request"
            placeholder="Describe the workflow changes you want to make (e.g., 'move aadhar-verification before verify-otp')"
            value={formData.request}
            onChange={handleChange('request')}
            helperText="Be specific about which steps should be moved or reordered"
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            sx={{ 
              mt: 1,
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Workflow Request'}
          </Button>
    </Box>
  );
};

export default WorkflowForm;
