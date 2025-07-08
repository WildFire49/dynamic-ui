import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const Selector = ({ label, options, sx, ...props }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
    // In the future, this could trigger an onAction event if a selection
    // needs to immediately affect the flow.
  };

  return (
    <FormControl fullWidth sx={{ ...sx, width: '100%', minWidth: '250px' }} margin="normal">
      <InputLabel id={`${props.id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${props.id}-label`}
        id={props.id}
        value={value}
        label={label}
        onChange={handleChange}
      >
        {(options || []).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Selector;
