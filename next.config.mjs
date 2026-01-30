import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone only for Docker builds
  // For local testing with 'npm start', we use default output
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),
  
  // Performance optimizations
  compress: true, // Enable gzip compression
  
  // Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production
  
  // Target modern browsers to reduce polyfills and legacy code
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Split chunks more aggressively
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // MUI components in separate chunk
            mui: {
              name: 'mui',
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
            },
            // Emotion in separate chunk
            emotion: {
              name: 'emotion',
              test: /[\\/]node_modules[\\/]@emotion[\\/]/,
              priority: 35,
              reuseExistingChunk: true,
            },
            // React and ReactDOM in separate chunk
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Other vendor libraries
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common code shared between pages
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'commondatastorage.googleapis.com',
      }
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

export default withBundleAnalyzer(nextConfig);
