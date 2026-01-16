import React from 'react';
import { Box } from '@mui/material';

const ResizeHandle = ({ itemId, onResizeStart }) => {
  return (
    <Box
      className="resize-handle"
      onMouseDown={(e) => {
        const element = document.getElementById(`widget-${itemId}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          onResizeStart(e, itemId, rect.height);
        }
      }}
      sx={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 60,
        height: 8,
        cursor: 'ns-resize',
        opacity: 0,
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px 4px 0 0',
        '&:hover': {
          opacity: 1,
          bgcolor: 'rgba(59, 130, 246, 0.1)',
        },
        '&::before': {
          content: '""',
          width: 30,
          height: 3,
          bgcolor: '#9CA3AF',
          borderRadius: 2,
        },
      }}
    />
  );
};

export default ResizeHandle;
