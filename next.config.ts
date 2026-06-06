import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {},
  webpack(config, { dev }) {
    if (dev) {
      config.cache = { type: "filesystem" };
    }
    return config;
  },
};

export default nextConfig;
