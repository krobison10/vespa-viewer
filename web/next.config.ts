import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    // Proxy /api/* to the actual API server
    // Set API_PROXY_URL env var to override (defaults to localhost:8080)
    const apiUrl = process.env.API_PROXY_URL || 'http://localhost:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
