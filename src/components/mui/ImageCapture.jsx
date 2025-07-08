import React, { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const ImageCapture = ({ title, instructions, ...props }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 2,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
      <Typography variant="h6" gutterBottom>
        {title || 'Upload Image'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {instructions || 'Please select an image to upload.'}
      </Typography>

      {imagePreviewUrl && (
        <Box
          component="img"
          src={imagePreviewUrl}
          alt="Image Preview"
          sx={{
            maxHeight: 200,
            maxWidth: '100%',
            objectFit: 'contain',
            borderRadius: 1,
            mb: 2,
          }}
        />
      )}

      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        onClick={handleButtonClick}
      >
        {selectedImage ? 'Change Image' : 'Select Image'}
      </Button>
      {selectedImage && (
        <Typography variant="caption" sx={{ mt: 1 }}>
          {selectedImage.name}
        </Typography>
      )}
    </Box>
  );
};

export default ImageCapture;
