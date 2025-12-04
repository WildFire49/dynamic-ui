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
 * Bar chart skeleton with animated growing bars - looks like a real chart loading
 */
const BarChartSkeleton = () => (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
    {/* Simple skeleton bars - no heavy animations */}
    <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: 1.5, pb: 2 }}>
      {[75, 45, 90, 60, 35, 80, 55].map((height, i) => (
        <Skeleton 
          key={i}
          variant="rectangular"
          sx={{ 
            flex: 1, 
            height: `${height}%`,
            borderRadius: '4px 4px 0 0',
            bgcolor: '#E5E7EB',
          }}
          animation="wave"
        />
      ))}
    </Box>
  </Box>
);

/**
 * Line chart skeleton - simple and performant
 */
const LineChartSkeleton = () => (
  <Box sx={{ height: '100%', p: 1 }}>
    <Skeleton 
      variant="rectangular" 
      width="100%"
      height="100%"
      sx={{ borderRadius: 2, bgcolor: '#E5E7EB' }}
      animation="wave"
    />
  </Box>
);

/**
 * Table skeleton - simple and performant
 */
const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box sx={{ height: '100%', p: 1 }}>
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, row) => (
      <Box 
        key={row} 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          py: 1,
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        {Array.from({ length: columns }).map((_, col) => (
          <Skeleton 
            key={col}
            variant="text"
            sx={{ flex: col === 0 ? 2 : 1, height: 20, bgcolor: '#E5E7EB' }}
            animation="wave"
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

/**
 * Widget content skeleton for use inside existing widget cards
 * Simple and performant skeleton for widget content
 */
export const WidgetContentSkeleton = ({ variant = 'chart' }) => (
  <Box sx={{ height: '100%', p: 1, bgcolor: '#FAFBFC' }}>
    {variant === 'chart' ? (
      <BarChartSkeleton />
    ) : variant === 'line' ? (
      <LineChartSkeleton />
    ) : (
      <TableSkeleton />
    )}
  </Box>
);

// Export individual components for flexibility
export { BarChartSkeleton, LineChartSkeleton, TableSkeleton };
export default WidgetSkeleton;
