import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';

const CheckboxList = ({ title, options, onSelectionChange, sx }) => {
  const [selected, setSelected] = useState([]);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setSelected(prev => 
      checked ? [...prev, name] : prev.filter(item => item !== name)
    );
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  }, [selected, onSelectionChange]);

  return (
    <Paper 
      elevation={2} 
      sx={{
        p: 2,
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(5px)',
        ...sx
      }}
    >
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <FormGroup>
        {options && options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={<Checkbox checked={selected.includes(option.value)} onChange={handleChange} name={option.value} />}
            label={option.label}
          />
        ))}
      </FormGroup>
    </Paper>
  );
};

export default CheckboxList;
