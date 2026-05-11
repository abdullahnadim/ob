import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 MOVES THE DEV INDICATOR OUT OF THE WAY
  devIndicators: {
    // Only the 'buildActivityPosition' or 'position' is standard here
    // In newer versions, it's often nested under buildActivity
    buildActivity: true,
  },
  // To completely ignore the indicator during build/dev if it keeps failing:
  // devIndicators: false, 

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