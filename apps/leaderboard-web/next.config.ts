import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@ohcnetwork/leaderboard-api"],
  serverExternalPackages: ["@libsql/client"],
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
