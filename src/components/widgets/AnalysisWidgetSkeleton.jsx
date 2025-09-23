import React from 'react';
import {
  Box,
  Skeleton,
  Paper,
  useTheme,
  alpha,
  Card
} from '@mui/material';

const AnalysisWidgetSkeleton = () => {
  const theme = useTheme();

  const StatCardSkeleton = ({ delay = 0 }) => (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        p: 2.5,
        animation: `fadeIn 0.6s ease-out ${delay}ms both`,
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton 
          variant="circular" 
          width={48} 
          height={48}
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
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="40%" height={32} />
        </Box>
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Paper>
  );

  const ChartSkeleton = ({ delay = 0 }) => (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 3,
        p: 3,
        animation: `fadeIn 0.6s ease-out ${delay}ms both`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="30%" height={16} />
        </Box>
      </Box>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={300}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" width="23%" height={20} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ 
      width: '100%',
      p: 3,
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      borderRadius: 3
    }}>
      {/* Header Skeleton */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        animation: 'fadeIn 0.6s ease-out 0ms both'
      }}>
        <Skeleton 
          variant="text" 
          width="40%" 
          height={40} 
          sx={{ margin: '0 auto', mb: 1 }} 
        />
        <Skeleton 
          variant="rectangular" 
          width="80%" 
          height={56} 
          sx={{ 
            margin: '0 auto', 
            borderRadius: 3,
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            animation: 'shimmer 2s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' }
            }
          }} 
        />
      </Box>

      {/* Statistics Cards Grid */}
      <Box sx={{ mb: 4 }}>
        <Skeleton 
          variant="text" 
          width="30%" 
          height={32} 
          sx={{ mb: 3, animation: 'fadeIn 0.6s ease-out 200ms both' }}
        />
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3
        }}>
          <StatCardSkeleton delay={300} />
          <StatCardSkeleton delay={400} />
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 3
        }}>
          <StatCardSkeleton delay={500} />
          <StatCardSkeleton delay={600} />
        </Box>
      </Box>

      {/* Visual Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          animation: 'fadeIn 0.6s ease-out 700ms both'
        }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="25%" height={28} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3
        }}>
          <ChartSkeleton delay={800} />
          <ChartSkeleton delay={900} />
        </Box>
      </Box>

      {/* Tabular Results Section */}
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          animation: 'fadeIn 0.6s ease-out 1000ms both'
        }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="20%" height={28} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Paper elevation={1} sx={{ borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton 
                key={i} 
                variant="rectangular" 
                width="20%" 
                height={36} 
                sx={{ borderRadius: 2 }} 
              />
            ))}
          </Box>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={200}
            sx={{ borderRadius: 2 }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default AnalysisWidgetSkeleton;
