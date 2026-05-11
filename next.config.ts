import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // This is the ONLY property your version's type allows
    position: 'bottom-right', 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;