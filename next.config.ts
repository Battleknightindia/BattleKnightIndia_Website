// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Adjust the limit as needed
    },
  },
}

export default nextConfig
