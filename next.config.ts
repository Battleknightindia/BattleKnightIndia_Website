// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Adjust the limit as needed
    },
  },
  images: {
    domains: [
      // *** PASTE YOUR EXTRACTED SUPABASE HOSTNAME HERE ***
      // Example: 'abcdef12345.supabase.co'
      'zuvpacjjywckyrgluxru.supabase.co', // Replace this placeholder!
      "placehold.co",
      "picsum.photos",
      "source.unsplash.com",
      // Add any other external image domains you might use
    ],
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

export default nextConfig
