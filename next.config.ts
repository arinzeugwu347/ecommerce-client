import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",

      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // example if you add Cloudinary later
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
