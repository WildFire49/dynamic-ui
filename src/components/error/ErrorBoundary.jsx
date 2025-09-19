"use client";
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  keyframes,
  useTheme,
  alpha
} from '@mui/material';
import {
  RefreshRounded as RefreshIcon,
  HomeRounded as HomeIcon,
  BugReportRounded as BugIcon,
  SmartToyRounded as RobotIcon,
  ChatRounded as ChatIcon
} from '@mui/icons-material';
import Image from 'next/image';

// Keyframe animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(1deg);
  }
  50% {
    transform: translateY(-5px) rotate(-1deg);
  }
  75% {
    transform: translateY(-15px) rotate(0.5deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

const glitch = keyframes`
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
`;

const robotBlink = keyframes`
  0%, 90% {
    opacity: 1;
  }
  95% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
`;

const ErrorPage = ({ 
  error, 
  resetError, 
  title = "Oops! My circuits got tangled", 
  subtitle = "Let me reboot and get back to helping you",
  showDetails = false 
}) => {
  const theme = useTheme();

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
          ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          animation: `${float} 6s ease-in-out infinite`
        }
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* MiFiX AI Robot Avatar */}
          <Box
            sx={{
              mb: 4,
              display: 'inline-block',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                animation: `${float} 3s ease-in-out infinite`,
                mx: 'auto',
                border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                overflow: 'hidden'
              }}
            >
              <Image
                src="/mifix-logo.png"
                alt="MiFiX AI Robot"
                width={100}
                height={100}
                style={{
                  animation: `${robotBlink} 3s ease-in-out infinite`,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                }}
              />
            </Box>
            
            {/* Glitch Effect Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: `linear-gradient(45deg, transparent 30%, ${alpha(theme.palette.error.main, 0.1)} 50%, transparent 70%)`,
                animation: `${glitch} 0.3s ease-in-out infinite`,
                pointerEvents: 'none'
              }}
            />
            
            {/* Chat Bubble */}
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${pulse} 2s ease-in-out infinite`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.4)}`
              }}
            >
              <ChatIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
          </Box>

          {/* Main Title */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              animation: `${slideInUp} 0.8s ease-out 0.2s both`,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
            }}
          >
            {title}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              fontWeight: 400,
              animation: `${slideInUp} 0.8s ease-out 0.4s both`,
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}
          >
            {subtitle}
          </Typography>

          {/* AI Conversational Message */}
          <Box
            sx={{
              mb: 6,
              animation: `${fadeIn} 1s ease-out 0.6s both`
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 4,
                p: 4,
                maxWidth: 600,
                mx: 'auto',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: `8px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.primary,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  fontStyle: 'italic',
                  mb: 2
                }}
              >
                "Hi there! 🤖 I'm your MiFiX AI assistant, and it looks like I encountered a small glitch in my neural networks. 
                My developers have been automatically notified, and I'm already running diagnostics to fix this."
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' }
                }}
              >
                Don't worry - I'll be back to helping you in no time! 
                You can try refreshing to restart our conversation, or head back to the main chat.
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 4,
              animation: `${slideInUp} 0.8s ease-out 0.8s both`
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<RobotIcon />}
              onClick={handleRefresh}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }}
            >
              Reboot AI
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ChatIcon />}
              onClick={handleGoHome}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderWidth: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}
            >
              New Chat
            </Button>
          </Box>

          {/* Error Details (Optional) */}
          {showDetails && error && (
            <Box
              sx={{
                mt: 4,
                p: 3,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 2,
                animation: `${fadeIn} 1s ease-out 1s both`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RobotIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <Typography variant="h6" color="error">
                  AI Diagnostic Report
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  color: theme.palette.text.secondary,
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {error.toString()}
              </Typography>
            </Box>
          )}

          {/* Floating Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              animation: `${float} 4s ease-in-out infinite`,
              zIndex: -1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              right: '15%',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
              animation: `${float} 5s ease-in-out infinite reverse`,
              zIndex: -1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              left: '20%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.error.main, 0.1)})`,
              animation: `${float} 6s ease-in-out infinite`,
              zIndex: -1
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default ErrorPage;
