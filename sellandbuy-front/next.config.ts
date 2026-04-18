import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      // Google user photos (Google Auth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // UI Avatars fallback
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      // Placeholder images (dev only)
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;
