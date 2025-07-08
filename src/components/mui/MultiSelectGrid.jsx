import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  position: 'relative',
  border: `2px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
  transition: theme.transitions.create(['border-color', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.03)',
  },
  backgroundColor: selected ? 'rgba(0, 123, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(5px)',
}));

const MultiSelectGrid = ({ title, options, onSelectionChange, sx }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelect = (value) => {
    setSelectedItems(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedItems);
    }
  }, [selectedItems, onSelectionChange]);

  return (
    <div style={{ width: '100%', ...sx }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {options && options.map((option) => {
          const isSelected = selectedItems.includes(option.value);
          return (
            <Grid item xs={6} sm={4} key={option.value}>
              <StyledPaper selected={isSelected} onClick={() => handleSelect(option.value)}>
                {isSelected && (
                  <CheckCircleIcon 
                    color="primary" 
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                )}
                <Typography variant="h6">{option.label}</Typography>
                {option.description && (
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </StyledPaper>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default MultiSelectGrid;
