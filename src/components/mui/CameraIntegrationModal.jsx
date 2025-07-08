import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import CameraIcon from '@mui/icons-material/Camera';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const CameraIntegrationModal = ({ title, onCapture }) => {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setImgSrc(null); // Reset image on close
    setOpen(false);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const handleConfirm = () => {
    if (onCapture) {
      onCapture(imgSrc);
    }
    handleClose();
  };

  const handleRetake = () => {
    setImgSrc(null);
  };

  return (
    <Box sx={{ textAlign: 'center', width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title || 'Live Photo Capture'}
      </Typography>
      <Button variant="contained" onClick={handleOpen} startIcon={<CameraIcon />}>
        Open Camera
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="camera-modal-title"
      >
        <Box sx={style}>
          <Typography id="camera-modal-title" variant="h6" component="h2">
            Align your face within the frame
          </Typography>
          <Box sx={{ position: 'relative', width: '100%', my: 2 }}>
            {imgSrc ? (
              <img src={imgSrc} alt="webcam" style={{ width: '100%', height: 'auto' }} />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={videoConstraints}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {imgSrc ? (
              <>
                <Button variant="outlined" onClick={handleRetake} startIcon={<ReplayIcon />}>
                  Retake
                </Button>
                <Button variant="contained" onClick={handleConfirm} startIcon={<CheckCircleIcon />}>
                  Confirm
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={capture} startIcon={<CameraIcon />}>
                Capture photo
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CameraIntegrationModal;
