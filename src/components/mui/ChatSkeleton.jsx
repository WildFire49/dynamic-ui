import React from 'react';
import {
  Box,
  Skeleton,
  Paper,
  useTheme,
  alpha
} from '@mui/material';

const ChatSkeleton = () => {
  const theme = useTheme();

  const MessageSkeleton = ({ isUser = false, delay = 0 }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 3,
        animation: `fadeIn 0.6s ease-out ${delay}ms both`,
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: '70%',
          p: 2.5,
          borderRadius: 3,
          background: isUser 
            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
            : '#ffffff',
          border: isUser 
            ? 'none' 
            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: isUser 
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            : '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
          '&::before': isUser ? {} : {
            content: '""',
            position: 'absolute',
            top: 12,
            left: -8,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `8px solid ${alpha(theme.palette.divider, 0.1)}`
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton 
            variant="text"  
            height={5}
            width={100}
            sx={{
              backgroundColor: isUser 
                ? alpha('#ffffff', 0.2)
                : alpha(theme.palette.text.primary, 0.1)
            }}
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            height={20}
            sx={{
              backgroundColor: isUser 
                ? alpha('#ffffff', 0.2)
                : alpha(theme.palette.text.primary, 0.1)
            }}
          />
          <Skeleton 
            variant="text" 
            width="90%" 
            height={20}
            sx={{
              backgroundColor: isUser 
                ? alpha('#ffffff', 0.2)
                : alpha(theme.palette.text.primary, 0.1)
            }}
          />
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
    }}>
      {/* Header Skeleton */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 4,
        pb: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Skeleton 
          variant="circular" 
          width={40} 
          height={40}
          sx={{
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.4 },
              '100%': { opacity: 1 }
            }
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="25%" height={16} />
        </Box>
      </Box>

      {/* Messages Skeleton */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        pr: 1,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: alpha(theme.palette.primary.main, 0.1),
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, 0.3),
          borderRadius: '3px',
        },
      }}>
        <MessageSkeleton isUser={true} delay={0} />
        <MessageSkeleton isUser={false} delay={200} />
        <MessageSkeleton isUser={true} delay={400} />
        <MessageSkeleton isUser={false} delay={600} />
        <MessageSkeleton isUser={false} delay={800} />
      </Box>

      {/* Input Skeleton */}
      <Box sx={{ 
        mt: 3,
        pt: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        animation: 'fadeIn 0.6s ease-out 1000ms both'
      }}>
        <Skeleton 
          variant="rounded" 
          width="100%" 
          height={56}
          sx={{
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatSkeleton;
