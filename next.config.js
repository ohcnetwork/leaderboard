/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
      },
      // fix for crash if a path starts with period
      // ref: https://github.com/ohcnetwork/leaderboard/pull/376
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
        pathname: "/**/.*/**",
      },
    ],
  },
};

module.exports = nextConfig;
