import React, { useState, useEffect } from 'react';
import {
  Popover,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import useReviewStore from '../../lib/stores/reviewStore';

const ReviewPopover = ({ 
  open, 
  anchorEl, 
  onClose, 
  recordData, 
  tableName 
}) => {
  const theme = useTheme();
  const { addReview, getReview } = useReviewStore();
  
  const [comment, setComment] = useState('');
  const [notMismatch, setNotMismatch] = useState(false);
  const [reviewedBy, setReviewedBy] = useState('');
  
  // Load existing review data when popover opens
  useEffect(() => {
    if (open && recordData) {
      // Use compound key for unique identification
      const recordKey = {
        key_ref: recordData.key_ref,
        mismatch_type: recordData.mismatch_type
      };
      const existingReview = getReview(tableName, recordKey);
      if (existingReview) {
        setComment(existingReview.comment || '');
        setNotMismatch(existingReview.notMismatch || false);
        setReviewedBy(existingReview.reviewedBy || '');
      } else {
        // Reset form for new review
        setComment('');
        setNotMismatch(false);
        setReviewedBy('');
      }
    }
  }, [open, recordData, tableName, getReview]);

  const handleSave = () => {
    if (!recordData || !tableName) return;
    
    // Use compound key for unique identification
    const recordKey = {
      key_ref: recordData.key_ref,
      mismatch_type: recordData.mismatch_type
    };
    
    addReview(tableName, recordKey, {
      comment,
      notMismatch,
      reviewedBy,
      status: notMismatch ? 'Not Mismatch' : 'Reviewed'
    });
    
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!recordData) return null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            maxWidth: 480,
            width: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.95)})`,
            backdropFilter: 'blur(10px)'
          }
        }
      }}
    >
      <Paper sx={{ p: 3, border: 'none', boxShadow: 'none', background: 'transparent' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary 
          }}>
            Review Mismatch
          </Typography>
          <Button
            onClick={handleClose}
            size="small"
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Box>

        {/* Record Info */}
        <Box sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Record Details
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
            <Chip 
              label={`Key: ${recordData.key_ref}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Type: ${recordData.mismatch_type}`} 
              size="small" 
              variant="outlined"
              color="error"
            />
          </Stack>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Typography variant="body2">
              <strong>XMM:</strong> {recordData.xmm_value}
            </Typography>
            <Typography variant="body2">
              <strong>SAM:</strong> {recordData.sam_value}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Review Form */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Review Comment"
            placeholder="Add your comment about this mismatch..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Reviewed By"
            placeholder="Enter reviewer name"
            value={reviewedBy}
            onChange={(e) => setReviewedBy(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={notMismatch}
                onChange={(e) => setNotMismatch(e.target.checked)}
                color="success"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" color={notMismatch ? "success" : "disabled"} />
                <Typography variant="body2">
                  Mark as "Not a Mismatch"
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            size="small"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!comment.trim()}
            startIcon={<SaveIcon />}
            size="small"
            sx={{
              background: notMismatch 
                ? `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              '&:hover': {
                background: notMismatch 
                  ? `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`
                  : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
              }
            }}
          >
            Save Review
          </Button>
        </Box>
      </Paper>
    </Popover>
  );
};

export default ReviewPopover;
