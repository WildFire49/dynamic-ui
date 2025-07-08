import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Input = React.forwardRef(({
  inputType = 'text',
  currencySymbol = '₹',
  hint,
  sx,
  onAction, // Consume the onAction prop to prevent it from spreading to the DOM
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  let finalInputType = inputType;
  if (inputType === 'password' && showPassword) {
    finalInputType = 'text';
  } else if (['amount', 'number', 'otp'].includes(inputType)) {
    finalInputType = 'number';
  }

  const sxProps = { ...sx, ...props.sx };
  const inputProps = { ...props.inputProps };

  if (inputType === 'otp') {
    inputProps.maxLength = props.length || 6;
    sxProps.textAlign = 'center';
    sxProps.letterSpacing = '0.5rem';
    sxProps.fontSize = '1.5rem';
  }

  if (['amount', 'number'].includes(inputType)) {
    sxProps.MozAppearance = 'textfield';
    sxProps['& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button'] = {
      WebkitAppearance: 'none',
      margin: 0,
    };
  }

  return (
    <TextField
      ref={ref}
      label={hint}
      type={finalInputType}
      variant="outlined"
      fullWidth
      margin="normal"
      {...props}
      sx={sxProps}
      inputProps={inputProps}
      InputProps={{
        ...props.InputProps,
        ...(inputType === 'password' && {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }),
        ...(inputType === 'amount' && {
          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
        }),
      }}
    />
  );
});

Input.displayName = 'Input';

export default Input;
