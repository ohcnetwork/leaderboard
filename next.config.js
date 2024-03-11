/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
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
      // ref: https://github.com/coronasafe/leaderboard/pull/376
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
        pathname: "/**/.*/**",
      },
    ],
  },
};

module.exports = nextConfig;
