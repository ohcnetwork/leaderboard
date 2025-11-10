import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  serverExternalPackages: [
    "@electric-sql/pglite", // reference: https://github.com/electric-sql/pglite/issues/322#issuecomment-2372563526
  ],
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
