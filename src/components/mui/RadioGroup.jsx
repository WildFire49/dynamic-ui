import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const RadioGroupComponent = ({ label, options, sx, ...props }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <FormControl component="fieldset" sx={sx} margin="normal">
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        aria-label={label}
        name={props.id}
        value={value}
        onChange={handleChange}
        row // Display options in a row for a more compact layout
      >
        {(options || []).map((option) => (
          <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioGroupComponent;
