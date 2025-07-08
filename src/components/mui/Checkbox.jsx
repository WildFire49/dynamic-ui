import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const CheckboxComponent = ({ label, sx, ...props }) => {
  const [checked, setChecked] = React.useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    // Future: onAction could be triggered here if needed
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} name={props.id} />}
      label={label}
      sx={sx}
    />
  );
};

export default CheckboxComponent;
