import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const FileUpload = ({ label, sx, ...props }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // In a real app, you would handle the file upload here, e.g.,
      // by sending it to a server or processing it client-side.
    }
  };

  return (
    <Box sx={{ ...sx, my: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<AttachFileIcon />}
      >
        {label || 'Upload File'}
        <input
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {selectedFile && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Selected: {selectedFile.name}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
