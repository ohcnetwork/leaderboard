import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@leaderboard/core"],
  serverExternalPackages: [
    "@electric-sql/pglite", // reference: https://github.com/electric-sql/pglite/issues/322#issuecomment-2372563526
  ],
  images: {
    unoptimized: true, // Required for static export
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

const withMDX = createMDX({
  // Fumadocs MDX configuration
});

export default withMDX(nextConfig);
