'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Fade,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockReset as LockResetIcon 
} from '@mui/icons-material';
import authService from '@/services/authService';

/**
 * Reusable Change Password Form Component
 * Can be used in dialogs, pages, or embedded in settings
 */
const ChangePasswordForm = ({ onSuccess, onCancel, showCancelButton = false }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const validateForm = () => {
    if (!formData.oldPassword.trim()) {
      setError('Please enter your current password');
      return false;
    }
    
    if (!formData.newPassword.trim()) {
      setError('Please enter a new password');
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    if (formData.newPassword === formData.oldPassword) {
      setError('New password must be different from current password');
      return false;
    }
    
    if (!formData.confirmPassword.trim()) {
      setError('Please confirm your new password');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.changePassword(
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      
      if (result.success) {
        setSuccess(result.message || 'Password changed successfully');
        // Clear form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Call success callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(result);
          }, 1500);
        }
      } else {
        setError(result.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Fade in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24,
              },
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {success && (
        <Fade in timeout={300}>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24,
              },
            }}
          >
            {success}
          </Alert>
        </Fade>
      )}

      {/* Current Password Field */}
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: '#333',
          fontSize: '0.875rem',
        }}
      >
        Current Password*
      </Typography>
      <TextField
        fullWidth
        required
        type={showPasswords.old ? 'text' : 'password'}
        placeholder="Enter current password"
        value={formData.oldPassword}
        onChange={handleChange('oldPassword')}
        disabled={isSubmitting}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            backgroundColor: '#f8f9fa',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#ccc',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00468e',
              borderWidth: 2,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => togglePasswordVisibility('old')}
                edge="end"
                disabled={isSubmitting}
                sx={{
                  color: '#666',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {showPasswords.old ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* New Password Field */}
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: '#333',
          fontSize: '0.875rem',
        }}
      >
        New Password*
      </Typography>
      <TextField
        fullWidth
        required
        type={showPasswords.new ? 'text' : 'password'}
        placeholder="Enter new password (min 8 characters)"
        value={formData.newPassword}
        onChange={handleChange('newPassword')}
        disabled={isSubmitting}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            backgroundColor: '#f8f9fa',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#ccc',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00468e',
              borderWidth: 2,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => togglePasswordVisibility('new')}
                edge="end"
                disabled={isSubmitting}
                sx={{
                  color: '#666',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Confirm Password Field */}
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: '#333',
          fontSize: '0.875rem',
        }}
      >
        Confirm New Password*
      </Typography>
      <TextField
        fullWidth
        required
        type={showPasswords.confirm ? 'text' : 'password'}
        placeholder="Re-enter new password"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        disabled={isSubmitting}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            backgroundColor: '#f8f9fa',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#ccc',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00468e',
              borderWidth: 2,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => togglePasswordVisibility('confirm')}
                edge="end"
                disabled={isSubmitting}
                sx={{
                  color: '#666',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {showCancelButton && (
          <Button
            fullWidth
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            sx={{
              py: 1.8,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              borderColor: '#ccc',
              color: '#666',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            py: 1.8,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1.1rem',
            background: '#00468e',
            color: 'white',
            boxShadow: '0 8px 24px rgba(0, 70, 142, 0.3)',
            '&:hover': {
              background: '#003870',
              boxShadow: '0 12px 32px rgba(0, 70, 142, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.Mui-disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
            ) : (
              <LockResetIcon />
            )
          }
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangePasswordForm;
