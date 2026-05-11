import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 MOVES THE DEV INDICATOR OUT OF THE WAY (Fixes mobile nav overlap)
  devIndicators: {
    appIsrStatus: false, // Hides the static indicator
    buildActivityPosition: 'bottom-right', 
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
        hostname: 'i.ibb.co', // <-- Added ImgBB here!
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;