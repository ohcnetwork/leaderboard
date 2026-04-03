import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@ohcnetwork/leaderboard-api"],
  serverExternalPackages: ["@libsql/client"],
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toISOString(),
  },
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
