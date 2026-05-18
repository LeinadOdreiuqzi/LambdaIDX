import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in the application
        source: '/(.*)',
        headers: [
          {
            // Prevents the site from being embedded in an iframe (Clickjacking defense)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Modern clickjacking defense (supercedes X-Frame-Options)
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self';",
          },
          {
            // Prevents MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
