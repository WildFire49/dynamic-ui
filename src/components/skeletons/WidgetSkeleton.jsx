import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';

/**
 * Beautiful skeleton widget for loading states
 * Variants: 'chart' (bar chart), 'line' (line chart), 'table' (data table)
 */
const WidgetSkeleton = ({ variant = 'chart', height = 'auto' }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: '1px solid #E5E7EB',
      bgcolor: '#fff',
      overflow: 'hidden',
      height: height !== 'auto' ? height : (variant === 'chart' ? 340 : 280),
    }}
  >
    {/* Header */}
    <Box sx={{ p: 2, borderBottom: '1px solid #F3F4F6' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton 
            variant="text" 
            width="70%" 
            height={24} 
            sx={{ 
              borderRadius: 1,
              bgcolor: '#F3F4F6',
            }} 
          />
          <Skeleton 
            variant="text" 
            width="40%" 
            height={16} 
            sx={{ 
              mt: 0.5,
              borderRadius: 1,
              bgcolor: '#F3F4F6',
            }} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton 
              key={i}
              variant="circular" 
              width={28} 
              height={28}
              sx={{ bgcolor: '#F3F4F6' }}
            />
          ))}
        </Box>
      </Box>
    </Box>

    {/* Chart Area */}
    <Box sx={{ p: 2, height: 'calc(100% - 80px)' }}>
      {variant === 'chart' ? (
        <BarChartSkeleton />
      ) : variant === 'line' ? (
        <LineChartSkeleton />
      ) : (
        <TableSkeleton />
      )}
    </Box>

    {/* Footer */}
    <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton 
        variant="text" 
        width={80} 
        height={14}
        sx={{ bgcolor: '#F3F4F6' }}
      />
      <Skeleton 
        variant="text" 
        width={60} 
        height={14}
        sx={{ bgcolor: '#F3F4F6' }}
      />
    </Box>
  </Card>
);

/**
 * Bar chart skeleton with animated bars
 */
const BarChartSkeleton = () => (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* Y-axis labels */}
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pr: 1 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton 
            key={i}
            variant="text" 
            width={30} 
            height={12}
            sx={{ bgcolor: '#F3F4F6' }}
          />
        ))}
      </Box>
      {/* Bars */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, pb: 3 }}>
        {[65, 85, 45, 70, 55, 90, 40].map((height, i) => (
          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton 
              variant="rectangular" 
              width="100%"
              height={`${height}%`}
              sx={{ 
                borderRadius: '4px 4px 0 0',
                bgcolor: '#E5E7EB',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
                '@keyframes pulse': {
                  '0%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.6 },
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
    {/* X-axis labels */}
    <Box sx={{ display: 'flex', gap: 2, pl: 5, mt: 1 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Box key={i} sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Skeleton 
            variant="text" 
            width={40} 
            height={12}
            sx={{ bgcolor: '#F3F4F6' }}
          />
        </Box>
      ))}
    </Box>
  </Box>
);

/**
 * Line chart skeleton with shimmer effect
 */
const LineChartSkeleton = () => (
  <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    {/* Background */}
    <Skeleton 
      variant="rectangular" 
      width="100%"
      height="100%"
      sx={{ 
        borderRadius: 2,
        bgcolor: '#F3F4F6',
      }}
    />
    {/* Animated wave line */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 200" 
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0" />
            <stop offset="50%" stopColor="#D1D5DB" stopOpacity="1" />
            <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 Q50,60 100,80 T200,70 T300,90 T400,60"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          style={{
            animation: 'drawLine 2s ease-in-out infinite',
          }}
        />
        <style>
          {`
            @keyframes drawLine {
              0% { stroke-dasharray: 0, 1000; stroke-dashoffset: 0; }
              50% { stroke-dasharray: 500, 1000; stroke-dashoffset: 0; }
              100% { stroke-dasharray: 0, 1000; stroke-dashoffset: -500; }
            }
          `}
        </style>
      </svg>
    </Box>
    {/* Shimmer overlay */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        animation: 'shimmer 2s infinite',
        '@keyframes shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      }}
    />
  </Box>
);

/**
 * Table skeleton with animated rows
 */
const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box sx={{ height: '100%' }}>
    {/* Table header */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2, pb: 1, borderBottom: '1px solid #F3F4F6' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i}
          variant="text" 
          width={`${25 - i * 2}%`}
          height={16}
          sx={{ bgcolor: '#E5E7EB' }}
        />
      ))}
    </Box>
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, row) => (
      <Box key={row} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
        {Array.from({ length: columns }).map((_, col) => (
          <Skeleton 
            key={col}
            variant="text" 
            width={`${20 + col * 5}%`}
            height={14}
            sx={{ 
              bgcolor: '#F3F4F6',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${(row + col) * 0.05}s`,
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 },
              },
            }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

/**
 * Dashboard loading skeleton grid - shows multiple widget skeletons
 */
export const DashboardLoadingSkeleton = ({ count = 4 }) => {
  const variants = ['chart', 'line', 'chart', 'table'];
  
  return (
    <Box 
      sx={{ 
        columnCount: { xs: 1, sm: 2, lg: 2 },
        columnGap: 2.5,
        '& > *': {
          breakInside: 'avoid',
          marginBottom: 2.5,
        }
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <WidgetSkeleton key={i} variant={variants[i % variants.length]} />
      ))}
    </Box>
  );
};

/**
 * Simple card skeleton for generic loading states
 */
export const CardSkeleton = ({ height = 200 }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: '1px solid #E5E7EB',
      bgcolor: '#fff',
      p: 3,
      height,
    }}
  >
    <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2, bgcolor: '#F3F4F6' }} />
    <Skeleton variant="rectangular" width="100%" height={height - 100} sx={{ borderRadius: 2, bgcolor: '#F3F4F6' }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Skeleton variant="text" width={80} height={16} sx={{ bgcolor: '#F3F4F6' }} />
      <Skeleton variant="text" width={60} height={16} sx={{ bgcolor: '#F3F4F6' }} />
    </Box>
  </Card>
);

/**
 * Inline content skeleton for text/data loading
 */
export const ContentSkeleton = ({ lines = 3 }) => (
  <Box>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i}
        variant="text" 
        width={`${100 - i * 15}%`}
        height={16}
        sx={{ 
          mb: 1,
          bgcolor: '#F3F4F6',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </Box>
);

// Export individual components for flexibility
export { BarChartSkeleton, LineChartSkeleton, TableSkeleton };
export default WidgetSkeleton;
