import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ddy7p8yrj/**",
      },
    ],
    domains: ["res.cloudinary.com"], // Keep this as a fallback
  },
};

export default nextConfig;
