import React from 'react';
import Typography from '@mui/material/Typography';

const getTypographyVariant = (textSize) => {
  if (!textSize) return 'body1';
  const size = parseInt(textSize, 10);
  if (size >= 24) return 'h4';
  if (size >= 20) return 'h5';
  if (size >= 18) return 'h6';
  if (size <= 12) return 'caption';
  return 'body1';
};

const Text = ({ text, text_size, sx, onAction, ...props }) => {
  const variant = getTypographyVariant(text_size);

  return (
    <Typography variant={variant} sx={sx} {...props}>
      {text}
    </Typography>
  );
};

export default Text;
