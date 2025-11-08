import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable server-side features for static export
  experimental: {
    // Enable static generation optimizations
  },
  transpilePackages: ["@electric-sql/pglite"],
};

export default nextConfig;
