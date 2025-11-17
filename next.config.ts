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
  experimental: {
    // Limit worker threads to avoid PGlite concurrency issues
    cpus: 1,
  },
  async redirects() {
    return [
      {
        source: "/contributors/:username",
        destination: "/:username",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
